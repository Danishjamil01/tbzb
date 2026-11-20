import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../core/services/menu.service';
import { CartService } from '../../../core/services/cart.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { MenuItem, FoodCategory, DietType } from '../../../core/models/menu.model';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, InrPipe],
  template: `
    <div class="mobile-menu-container">
      <!-- Sticky Category & Filter Header -->
      <div class="menu-sticky-filters">
        <!-- Categories Horizontal Scroll -->
        <div class="category-chips-scroll">
          @for (cat of menuService.categories; track cat.id) {
            <button
              class="cat-chip-btn"
              [class.active]="menuService.selectedCategory() === cat.id"
              (click)="selectCategory(cat.id)"
            >
              <app-icon [name]="cat.icon" [size]="14" />
              <span>{{ cat.label }}</span>
              <span class="count-badge">{{ getCount(cat.id) }}</span>
            </button>
          }
        </div>

        <!-- Diet Type Toggle (Veg / Non-Veg / All) -->
        <div class="diet-toggles-row">
          <button
            class="diet-pill"
            [class.active]="menuService.selectedDiet() === 'all'"
            (click)="selectDiet('all')"
          >
            All Items
          </button>
          <button
            class="diet-pill veg-pill"
            [class.active]="menuService.selectedDiet() === 'veg'"
            (click)="selectDiet('veg')"
          >
            <span class="diet-box veg">
              <span class="inner-dot"></span>
            </span>
            <span>Pure Veg</span>
          </button>
          <button
            class="diet-pill non-veg-pill"
            [class.active]="menuService.selectedDiet() === 'non-veg'"
            (click)="selectDiet('non-veg')"
          >
            <span class="diet-box non-veg">
              <span class="inner-dot"></span>
            </span>
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      <!-- Search query indicator if active -->
      @if (menuService.searchQuery()) {
        <div class="search-active-bar">
          <span>Search: "<strong>{{ menuService.searchQuery() }}</strong>"</span>
          <button class="clear-search-btn" (click)="clearSearch()">
            <app-icon name="x" [size]="13" /> Clear
          </button>
        </div>
      }

      <!-- Dish Items List -->
      <div class="dishes-list">
        @if (filteredItems().length === 0) {
          <div class="empty-menu-box">
            <app-icon name="utensils" [size]="40" />
            <p class="empty-title">No dishes found</p>
            <p class="empty-sub">Try changing your filters or search keywords</p>
            <button class="btn-reset-filters" (click)="resetFilters()">View All Items</button>
          </div>
        } @else {
          @for (item of filteredItems(); track item.id) {
            <div class="app-menu-card" (click)="openDetail(item)">
              <!-- Left Info -->
              <div class="card-left">
                <div class="diet-and-tag">
                  <div class="diet-dot-badge" [class.veg]="item.dietType === 'veg'" [class.non-veg]="item.dietType === 'non-veg'">
                    <span class="inner-dot"></span>
                  </div>
                  @if (item.tags && item.tags.length > 0) {
                    <span class="badge-tag">{{ item.tags[0] }}</span>
                  }
                  @if (item.featured) {
                    <span class="badge-must-try">★ Must Try</span>
                  }
                </div>

                <h3 class="dish-title">{{ item.name }}</h3>

                <div class="price-row">
                  <span class="price-val">{{ item.price | inr }}</span>
                  <div class="rating-mini">
                    <app-icon name="star" [size]="10" />
                    <span>4.8</span>
                  </div>
                </div>

                <p class="dish-desc">{{ item.description }}</p>
              </div>

              <!-- Right Image & Add Button -->
              <div class="card-right" (click)="$event.stopPropagation()">
                <div class="dish-img-box" (click)="openDetail(item)">
                  <img [src]="item.imageUrl" [alt]="item.name" class="dish-img" loading="lazy" />
                </div>

                <!-- Floating Add Button / Stepper -->
                <div class="action-btn-container">
                  @if (getItemQuantity(item.id) > 0) {
                    <div class="stepper-box">
                      <button class="step-btn" (click)="updateQty(item, -1)">-</button>
                      <span class="step-qty">{{ getItemQuantity(item.id) }}</span>
                      <button class="step-btn" (click)="updateQty(item, 1)">+</button>
                    </div>
                  } @else {
                    <button class="add-btn" (click)="addToCart(item)">
                      <span>ADD</span>
                      <app-icon name="plus" [size]="12" />
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .mobile-menu-container {
      padding: 0 0 85px;
      background: #FFFFFF;
      min-height: calc(100vh - 120px);
    }

    /* Sticky filter bars */
    .menu-sticky-filters {
      position: sticky;
      top: 104px;
      background: #FFFFFF;
      z-index: 40;
      border-bottom: 1px solid #E5E7EB;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      padding: 8px 12px 10px;
    }

    .category-chips-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .cat-chip-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;

      .count-badge {
        font-size: 10px;
        background: rgba(0, 0, 0, 0.08);
        padding: 1px 6px;
        border-radius: 10px;
        font-weight: 700;
      }

      &.active {
        background: #0F472B;
        color: #FFFFFF;
        border-color: #0F472B;

        .count-badge {
          background: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
        }
      }
    }

    .diet-toggles-row {
      display: flex;
      gap: 6px;
      padding-top: 2px;
    }

    .diet-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 600;
      color: #4B5563;
      cursor: pointer;

      &.active {
        background: #0F472B;
        color: #FFFFFF;
        border-color: #0F472B;
      }
    }

    .diet-box {
      width: 12px;
      height: 12px;
      background: #FFFFFF;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.veg {
        border: 1px solid #16A34A;
        .inner-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #16A34A;
        }
      }

      &.non-veg {
        border: 1px solid #DC2626;
        .inner-dot {
          width: 0;
          height: 0;
          border-left: 3px solid transparent;
          border-right: 3px solid transparent;
          border-bottom: 5px solid #DC2626;
        }
      }
    }

    /* Search notice */
    .search-active-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background: #FEF3C7;
      border-bottom: 1px solid #FDE68A;
      font-size: 12px;
      color: #92400E;

      .clear-search-btn {
        background: none;
        border: none;
        color: #DC2626;
        font-weight: 700;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 3px;
        cursor: pointer;
      }
    }

    /* Dishes List */
    .dishes-list {
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .app-menu-card {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 0 16px;
      border-bottom: 1px solid #F3F4F6;
      cursor: pointer;
    }

    .card-left {
      flex: 1;
      min-width: 0;
    }

    .diet-and-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .diet-dot-badge {
      width: 14px;
      height: 14px;
      background: #FFFFFF;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.veg {
        border: 1px solid #16A34A;
        .inner-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16A34A;
        }
      }

      &.non-veg {
        border: 1px solid #DC2626;
        .inner-dot {
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 7px solid #DC2626;
        }
      }
    }

    .badge-tag {
      font-size: 9.5px;
      font-weight: 700;
      color: #0F472B;
      background: #ECFDF5;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #A7F3D0;
    }

    .badge-must-try {
      font-size: 9.5px;
      font-weight: 700;
      color: #B45309;
      background: #FEF3C7;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .dish-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px;
      line-height: 1.3;
    }

    .price-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .price-val {
      font-size: 14px;
      font-weight: 800;
      color: #0F472B;
    }

    .rating-mini {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 10.5px;
      font-weight: 700;
      color: #D97706;
      background: #FFFBEB;
      padding: 1px 5px;
      border-radius: 4px;
    }

    .dish-desc {
      font-size: 11.5px;
      color: #6B7280;
      margin: 0;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Right column: Image & Add */
    .card-right {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100px;
      flex-shrink: 0;
      position: relative;
    }

    .dish-img-box {
      width: 100px;
      height: 90px;
      border-radius: 14px;
      overflow: hidden;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;

      .dish-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .action-btn-container {
      margin-top: -14px;
      z-index: 2;
      width: 82px;
    }

    .add-btn {
      width: 100%;
      height: 32px;
      background: #FFFFFF;
      color: #0F472B;
      border: 1.5px solid #0F472B;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;

      &:active {
        background: #0F472B;
        color: #FFFFFF;
      }
    }

    .stepper-box {
      width: 100%;
      height: 32px;
      background: #0F472B;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4px;
      color: #FFFFFF;
      box-shadow: 0 2px 6px rgba(15, 71, 43, 0.3);

      .step-btn {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: #FFFFFF;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
      }

      .step-qty {
        font-size: 12px;
        font-weight: 800;
      }
    }

    /* Empty state */
    .empty-menu-box {
      text-align: center;
      padding: 40px 20px;
      color: #6B7280;

      .empty-title {
        font-size: 16px;
        font-weight: 700;
        color: #111827;
        margin: 12px 0 4px;
      }

      .empty-sub {
        font-size: 12px;
        margin: 0 0 16px;
      }

      .btn-reset-filters {
        background: #0F472B;
        color: #FFFFFF;
        border: none;
        padding: 8px 18px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
    }
  `]
})
export class MobileMenuComponent {
  menuService = inject(MenuService);
  private cartService = inject(CartService);

  filteredItems = this.menuService.filteredItems;

  selectCategory(catId: FoodCategory): void {
    this.menuService.selectedCategory.set(catId);
  }

  selectDiet(diet: 'all' | DietType): void {
    this.menuService.selectedDiet.set(diet);
  }

  getCount(catId: string): number {
    return this.menuService.categoryCounts()[catId] ?? 0;
  }

  clearSearch(): void {
    this.menuService.searchQuery.set('');
  }

  resetFilters(): void {
    this.menuService.selectedCategory.set('all');
    this.menuService.selectedDiet.set('all');
    this.menuService.searchQuery.set('');
  }

  openDetail(item: MenuItem): void {
    this.menuService.activeModalItem.set(item);
  }

  addToCart(item: MenuItem): void {
    this.cartService.addItem(item, 1);
  }

  getItemQuantity(itemId: string): number {
    const item = this.cartService.items().find(i => i.menuItem.id === itemId);
    return item ? item.quantity : 0;
  }

  updateQty(item: MenuItem, delta: number): void {
    const current = this.getItemQuantity(item.id);
    this.cartService.updateQuantity(item.id, current + delta);
  }
}

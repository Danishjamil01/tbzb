import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { FoodCardComponent } from '../food-card/food-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FoodCategory, DietType } from '../../core/models/menu.model';

@Component({
  selector: 'app-all-dishes',
  standalone: true,
  imports: [CommonModule, FormsModule, FoodCardComponent, IconComponent],
  template: `
    @if (menuService.isAllDishesPageOpen()) {
      <div class="all-dishes-screen" role="dialog" aria-modal="true" aria-label="All Dishes">
        <!-- Top App Bar -->
        <header class="all-dishes-header">
          <div class="header-left">
            <button class="btn-back" (click)="closePage()" aria-label="Back to Home">
              <app-icon name="arrow-left" [size]="20" />
            </button>
            <div>
              <h1 class="header-title">All Dishes</h1>
              <p class="header-sub">
                {{ menuService.filteredItems().length }} of {{ menuService.allItems().length }} items
              </p>
            </div>
          </div>

          <div class="header-right">
            <button class="cart-pill-btn" (click)="openCart()" aria-label="Open cart">
              <app-icon name="shopping-bag" [size]="17" />
              @if (cartService.totalItemCount() > 0) {
                <span class="cart-badge">{{ cartService.totalItemCount() }}</span>
              }
            </button>
          </div>
        </header>

        <!-- Sticky Search & Filter Bar -->
        <div class="sticky-controls">
          <!-- Beautiful Search Input -->
          <div class="search-wrap">
            <div class="search-box">
              <app-icon name="search" [size]="18" class="search-icon" />
              <input
                type="text"
                placeholder="Search biryani, kathi roll, dosa, shake..."
                [ngModel]="menuService.searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="search-input"
                aria-label="Search all dishes"
              />
              @if (menuService.searchQuery()) {
                <button
                  class="btn-clear"
                  (click)="clearSearch()"
                  aria-label="Clear search"
                >
                  <app-icon name="x" [size]="15" />
                </button>
              }
            </div>
          </div>

          <!-- Category Filter Pills (Horizontal Scroll) -->
          <div class="category-pills-row">
            @for (cat of menuService.categories; track cat.id) {
              <button
                class="cat-chip"
                [class.active]="menuService.selectedCategory() === cat.id"
                (click)="setCategory(cat.id)"
              >
                <app-icon [name]="cat.icon" [size]="13" />
                <span>{{ cat.label }}</span>
                <span class="chip-count">{{ menuService.categoryCounts()[cat.id] }}</span>
              </button>
            }
          </div>

          <!-- Diet Preference Bar -->
          <div class="sub-filter-row">
            <div class="diet-toggles">
              <button
                class="diet-pill"
                [class.active]="menuService.selectedDiet() === 'all'"
                (click)="setDiet('all')"
              >
                All
              </button>
              <button
                class="diet-pill veg"
                [class.active]="menuService.selectedDiet() === 'veg'"
                (click)="setDiet('veg')"
              >
                <span class="diet-dot veg"></span>
                <span>Pure Veg</span>
              </button>
              <button
                class="diet-pill nonveg"
                [class.active]="menuService.selectedDiet() === 'non-veg'"
                (click)="setDiet('non-veg')"
              >
                <span class="diet-dot nonveg"></span>
                <span>Non-Veg</span>
              </button>
            </div>

            @if (hasActiveFilter()) {
              <button class="btn-reset" (click)="resetFilters()">
                <app-icon name="x" [size]="12" />
                <span>Reset</span>
              </button>
            }
          </div>
        </div>

        <!-- Dishes Grid Area -->
        <main class="dishes-container">
          @if (menuService.filteredItems().length > 0) {
            <div class="dishes-grid">
              @for (item of menuService.filteredItems(); track item.id) {
                <app-food-card [item]="item" />
              }
            </div>
          } @else {
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <app-icon name="search" [size]="32" />
              </div>
              <h3>No dishes found</h3>
              <p>We couldn't find anything matching your search. Try adjusting the search keywords or filters.</p>
              <button class="btn-clear-all" (click)="resetFilters()">
                <span>Show All 42 Dishes</span>
              </button>
            </div>
          }
        </main>
      </div>
    }
  `,
  styles: [`
    .all-dishes-screen {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      background: #FAF7F2;
      z-index: 1040;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      animation: pageSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes pageSlideIn {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    /* Top App Bar */
    .all-dishes-header {
      position: sticky;
      top: 0;
      z-index: 20;
      background: #FFFFFF;
      border-bottom: 1px solid #ECE7DF;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

      @media (min-width: 768px) {
        padding: 14px 28px;
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-back {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1.5px solid #E5E7EB;
      background: #FAF7F2;
      color: #0F472B;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #F3F4F6;
        color: #111827;
      }
    }

    .header-title {
      font-family: var(--font-heading, inherit);
      font-size: 1.15rem;
      font-weight: 850;
      color: #0F472B;
      margin: 0;
      line-height: 1.2;

      @media (min-width: 768px) {
        font-size: 1.45rem;
      }
    }

    .header-sub {
      font-size: 11.5px;
      color: #6B7280;
      margin: 1px 0 0;
    }

    .cart-pill-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #0F472B;
      color: #FFFFFF;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(15, 71, 43, 0.25);

      .cart-badge {
        position: absolute;
        top: -3px;
        right: -3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #FFC82C;
        color: #000000;
        font-size: 10.5px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #FFFFFF;
      }
    }

    /* Sticky Controls */
    .sticky-controls {
      position: sticky;
      top: 57px;
      z-index: 15;
      background: #FAF7F2;
      padding: 10px 14px 6px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 8px;

      @media (min-width: 768px) {
        top: 65px;
        padding: 14px 28px 10px;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }
    }

    /* Search Box */
    .search-wrap {
      width: 100%;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      padding: 0 12px;
      height: 44px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;

      &:focus-within {
        border-color: #0F472B;
        box-shadow: 0 0 0 3px rgba(15, 71, 43, 0.1);
      }
    }

    .search-icon {
      color: #0F472B;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .search-input {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 13.5px;
      color: #111827;
      font-weight: 500;

      &::placeholder {
        color: #9CA3AF;
        font-size: 12.5px;
      }
    }

    .btn-clear {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: none;
      background: #F3F4F6;
      color: #6B7280;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    /* Category Chips Scroll */
    .category-pills-row {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding: 2px 0;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .cat-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      color: #374151;
      font-size: 11.5px;
      font-weight: 650;
      white-space: nowrap;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s ease;

      .chip-count {
        font-size: 10px;
        padding: 1px 5px;
        border-radius: 9999px;
        background: #F3F4F6;
        color: #6B7280;
        font-weight: 700;
      }

      &.active {
        background: #0F472B;
        color: #FFFFFF;
        border-color: #0F472B;

        .chip-count {
          background: #FFFFFF;
          color: #0F472B;
        }
      }
    }

    /* Sub Filter Row */
    .sub-filter-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .diet-toggles {
      display: flex;
      gap: 5px;
    }

    .diet-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 9999px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      font-size: 11px;
      font-weight: 650;
      color: #4B5563;
      cursor: pointer;
      transition: all 0.15s ease;

      .diet-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        display: inline-block;

        &.veg { background: #16A34A; }
        &.nonveg { background: #DC2626; }
      }

      &.active {
        background: #0F472B;
        color: #FFFFFF;
        border-color: #0F472B;

        .diet-dot.veg { background: #FFFFFF; }
        .diet-dot.nonveg { background: #FFFFFF; }
      }
    }

    .btn-reset {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(15, 71, 43, 0.08);
      color: #0F472B;
      border: none;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    /* Dishes Grid */
    .dishes-container {
      padding: 10px 12px 30px;
      flex: 1;

      @media (min-width: 768px) {
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
        padding: 16px 28px 40px;
        box-sizing: border-box;
      }
    }

    .dishes-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr)); /* 2 dishes per line in mobile! */
      gap: 10px;

      @media (min-width: 640px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
      }
    }

    .empty-state {
      padding: 3rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      .empty-icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #FFFFFF;
        border: 1px solid #E5E7EB;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0F472B;
        margin-bottom: 12px;
      }

      h3 {
        font-family: var(--font-heading, inherit);
        font-size: 1.2rem;
        font-weight: 800;
        color: #0F472B;
        margin: 0 0 6px;
      }

      p {
        font-size: 12.5px;
        color: #6B7280;
        max-width: 300px;
        margin: 0 0 16px;
        line-height: 1.4;
      }

      .btn-clear-all {
        padding: 9px 20px;
        border-radius: 9999px;
        background: #0F472B;
        color: #FFFFFF;
        border: none;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }
    }
  `]
})
export class AllDishesComponent {
  menuService = inject(MenuService);
  cartService = inject(CartService);

  closePage(): void {
    this.menuService.closeAllDishes();
  }

  openCart(): void {
    this.cartService.openCartDrawer();
  }

  onSearchChange(val: string): void {
    this.menuService.setSearchQuery(val);
  }

  clearSearch(): void {
    this.menuService.setSearchQuery('');
  }

  setCategory(cat: FoodCategory): void {
    this.menuService.setCategory(cat);
  }

  setDiet(diet: 'all' | DietType): void {
    this.menuService.setDiet(diet);
  }

  hasActiveFilter(): boolean {
    return (
      this.menuService.searchQuery().trim().length > 0 ||
      this.menuService.selectedCategory() !== 'all' ||
      this.menuService.selectedDiet() !== 'all'
    );
  }

  resetFilters(): void {
    this.menuService.setCategory('all');
    this.menuService.setDiet('all');
    this.menuService.setSearchQuery('');
  }
}

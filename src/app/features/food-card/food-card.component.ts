import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../core/models/menu.model';
import { CartService } from '../../core/services/cart.service';
import { MenuService } from '../../core/services/menu.service';
import { ToastService } from '../../core/services/toast.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-food-card',
  standalone: true,
  imports: [CommonModule, InrPipe, IconComponent],
  template: `
    <div class="food-card" [class.is-added]="itemQuantity > 0" [class.is-sold-out]="!item.isAvailable">
      <!-- Card Image Area -->
      <div class="card-image-wrap" (click)="openDetailModal()">
        <img
          [src]="item.imageUrl"
          [alt]="item.name"
          class="card-img"
          loading="lazy"
          (error)="handleImageError($event)"
        />

        <!-- Sold Out Badge Overlay -->
        @if (!item.isAvailable) {
          <div class="card-sold-out-overlay">
            <span>Sold Out</span>
          </div>
        }

        <!-- Badges on image -->
        <div class="image-top-badges">
          <!-- Diet Type Indicator -->
          <div class="diet-badge-wrap">
            <span
              class="diet-indicator"
              [ngClass]="item.dietType"
              [title]="item.dietType === 'veg' ? 'Pure Vegetarian' : 'Non-Vegetarian'"
            ></span>
          </div>

          @if (item.featured) {
            <span class="badge-featured">Popular</span>
          }
        </div>
      </div>

      <!-- Card Body Area -->
      <div class="card-content">
        <div class="card-meta">
          <span class="category-tag">{{ item.category }}</span>
        </div>

        <h3 class="card-title" (click)="openDetailModal()" [title]="item.name">
          {{ item.name }}
        </h3>

        <p class="card-description" (click)="openDetailModal()">
          {{ item.description }}
        </p>

        <!-- Card Footer: Price & Quantity Controls -->
        <div class="card-footer">
          <div class="price-box">
            <span class="price-val">{{ item.price | inr }}</span>
          </div>

          <div class="action-box">
            @if (!item.isAvailable) {
              <div class="sold-out-pill" title="This dish is currently out of stock">
                <span>Sold Out</span>
              </div>
            } @else if (itemQuantity === 0) {
              <button
                class="btn-add"
                (click)="onAdd()"
                aria-label="Add {{ item.name }} to cart"
              >
                <span>ADD +</span>
              </button>
            } @else {
              <div class="qty-control-pill" aria-label="Quantity for {{ item.name }}">
                <button
                  class="qty-btn"
                  (click)="onDecrease()"
                  aria-label="Decrease quantity"
                >
                  <app-icon name="minus" [size]="14" />
                </button>
                <span class="qty-number">{{ itemQuantity }}</span>
                <button
                  class="qty-btn"
                  (click)="onIncrease()"
                  aria-label="Increase quantity"
                >
                  <app-icon name="plus" [size]="14" />
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .food-card {
      display: flex;
      flex-direction: column;
      background: #FFFFFF;
      border: 1px solid #ECE7DF;
      border-radius: 18px;
      overflow: hidden;
      transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
      position: relative;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);

      @media (max-width: 639px) {
        border-radius: 13px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      }

      &:hover {
        transform: translateY(-4px);
        border-color: #D6D0C4;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      }

      &.is-added {
        border-color: #0F472B;
        box-shadow: 0 6px 20px rgba(15, 71, 43, 0.12);
      }
    }

    .card-image-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10.5;
      background-color: #F3EFE9;
      overflow: hidden;
      cursor: pointer;

      @media (max-width: 639px) {
        aspect-ratio: 16 / 11;
      }
    }

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;

      .food-card:hover & {
        transform: scale(1.04);
      }
    }

    .image-top-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      z-index: 2;

      @media (max-width: 639px) {
        top: 6px;
        left: 6px;
        right: 6px;
      }
    }

    .diet-badge-wrap {
      background: #FFFFFF;
      border-radius: 5px;
      padding: 3px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
      display: inline-flex;
      align-items: center;
      justify-content: center;

      @media (max-width: 639px) {
        padding: 2px;
        border-radius: 4px;
      }
    }

    .badge-featured {
      background-color: #FFC82C;
      color: #000000;
      font-family: var(--font-heading);
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);

      @media (max-width: 639px) {
        font-size: 8px;
        padding: 2px 5px;
        border-radius: 4px;
      }
    }

    .card-content {
      padding: 16px 18px 18px;
      display: flex;
      flex-direction: column;
      flex: 1;

      @media (max-width: 639px) {
        padding: 8px 9px 10px;
      }
    }

    .card-meta {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }

    .category-tag {
      font-size: 12px;
      font-weight: 700;
      color: #0D7A53;
      text-transform: capitalize;
      letter-spacing: 0.02em;

      @media (max-width: 639px) {
        font-size: 9.5px;
      }
    }

    .card-title {
      font-family: var(--font-heading);
      font-size: 19px;
      font-weight: 850;
      color: #0F472B;
      line-height: 1.25;
      margin-bottom: 8px;
      cursor: pointer;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color var(--transition-fast);

      @media (max-width: 639px) {
        font-size: 13.5px;
        margin-bottom: 3px;
        line-height: 1.2;
      }

      &:hover {
        color: #0A3520;
      }
    }

    .card-description {
      font-size: 13px;
      color: #6B7280;
      line-height: 1.5;
      margin-bottom: 18px;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      cursor: pointer;

      @media (max-width: 639px) {
        display: none;
      }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: auto;
      padding-top: 6px;

      @media (max-width: 639px) {
        padding-top: 2px;
        gap: 4px;
      }
    }

    .price-box {
      display: flex;
      align-items: baseline;
    }

    .price-val {
      font-family: var(--font-heading);
      font-size: 22px;
      font-weight: 850;
      color: #0F472B;
      line-height: 1;

      @media (max-width: 639px) {
        font-size: 15.5px;
      }
    }

    .action-box {
      display: flex;
      align-items: center;
    }

    .sold-out-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #FEE2E2;
      color: #DC2626;
      border: 1px solid #FECACA;
      font-family: var(--font-heading);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 5px 10px;
      border-radius: var(--radius-sm);
    }

    .card-sold-out-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;

      span {
        background: #DC2626;
        color: #FFFFFF;
        font-family: var(--font-heading);
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 4px 10px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
    }

    .btn-add {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #FFC82C;
      color: #000000;
      border: none;
      border-radius: 9999px;
      padding: 7px 18px;
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      transition: all var(--transition-fast);
      box-shadow: 0 2px 6px rgba(255, 200, 44, 0.3);
      cursor: pointer;

      @media (max-width: 639px) {
        padding: 4px 10px;
        font-size: 10.5px;
      }

      &:hover {
        background-color: #F5B800;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(245, 184, 0, 0.4);
      }
    }

    .qty-control-pill {
      display: inline-flex;
      align-items: center;
      background-color: #FFC82C;
      color: #000000;
      border-radius: 9px;
      padding: 2px 4px;
      box-shadow: 0 2px 8px rgba(255, 200, 44, 0.3);

      @media (max-width: 639px) {
        border-radius: 6px;
        padding: 1px 2px;
      }
    }

    .qty-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      color: #000000;
      border-radius: 6px;
      transition: background-color var(--transition-fast);

      @media (max-width: 639px) {
        width: 20px;
        height: 20px;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.12);
      }
    }

    .qty-number {
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 800;
      min-width: 22px;
      text-align: center;
      line-height: 1;

      @media (max-width: 639px) {
        font-size: 11px;
        min-width: 16px;
      }
    }
  `]
})
export class FoodCardComponent {
  @Input({ required: true }) item!: MenuItem;

  private cartService = inject(CartService);
  private menuService = inject(MenuService);
  private toastService = inject(ToastService);

  get itemQuantity(): number {
    return this.cartService.getItemQuantity(this.item.id);
  }

  onAdd(): void {
    this.cartService.addItem(this.item, 1);
    this.toastService.show(`Added ${this.item.name} to cart`, 'success');
  }

  onIncrease(): void {
    this.cartService.addItem(this.item, 1);
  }

  onDecrease(): void {
    this.cartService.decreaseItem(this.item.id);
  }

  openDetailModal(): void {
    this.menuService.openItemModal(this.item);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'images/food/chicken-handi-biryani.jpg';
  }
}

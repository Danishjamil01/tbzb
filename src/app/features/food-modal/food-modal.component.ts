import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-food-modal',
  standalone: true,
  imports: [CommonModule, InrPipe, IconComponent],
  template: `
    @if (item(); as dish) {
      <div class="modal-backdrop" (click)="close()"></div>
      <div class="modal-dialog" role="dialog" aria-modal="true" [attr.aria-label]="dish.name">
        <button class="btn-close-modal" (click)="close()" aria-label="Close modal">
          <app-icon name="x" [size]="20" />
        </button>

        <div class="modal-image-container">
          <img [src]="dish.imageUrl" [alt]="dish.name" class="modal-food-img" [class.is-out-of-stock]="!dish.isAvailable" />
          <div class="modal-image-overlay"></div>
          @if (!dish.isAvailable) {
            <div class="modal-not-in-stock-badge">Not in Stock</div>
          }
          <div class="modal-diet-tag">
            <span class="diet-indicator" [ngClass]="dish.dietType"></span>
            <span class="diet-text">{{ dish.dietType === 'veg' ? 'Pure Vegetarian' : 'Non-Vegetarian' }}</span>
          </div>
        </div>

        <div class="modal-content-body">
          <div class="modal-header-row">
            <h2 class="modal-dish-title">{{ dish.name }}</h2>
            <span class="modal-dish-price">{{ dish.price | inr }}</span>
          </div>

          <div class="modal-category-badge">
            <span>Category: {{ dish.category }}</span>
          </div>

          <p class="modal-dish-desc">{{ dish.description }}</p>

          @if (dish.tags && dish.tags.length > 0) {
            <div class="modal-tags">
              @for (tag of dish.tags; track tag) {
                <span class="tag-pill">{{ tag }}</span>
              }
            </div>
          }

          <div class="modal-footer-actions">
            @if (!dish.isAvailable) {
              <div class="modal-not-in-stock-banner">
                <app-icon name="alert-circle" [size]="18" />
                <span>Currently Not in Stock</span>
              </div>
            } @else if (quantity === 0) {
              <button class="btn-primary full-width" (click)="onAdd(dish)">
                <app-icon name="plus" [size]="18" />
                <span>Add to Cart • {{ dish.price | inr }}</span>
              </button>
            } @else {
              <div class="modal-qty-container">
                <span class="qty-label">Quantity in Cart:</span>
                <div class="qty-control-pill">
                  <button class="qty-btn" (click)="onDecrease(dish.id)" aria-label="Decrease">
                    <app-icon name="minus" [size]="16" />
                  </button>
                  <span class="qty-number">{{ quantity }}</span>
                  <button class="qty-btn" (click)="onIncrease(dish)" aria-label="Increase">
                    <app-icon name="plus" [size]="16" />
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(6px);
      z-index: 1000;
    }

    .modal-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      z-index: 1001;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
      animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalPop {
      from {
        opacity: 0;
        transform: translate(-50%, -46%) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    .btn-close-modal {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.65);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: background 0.15s;

      &:hover {
        background: rgba(0, 0, 0, 0.9);
      }
    }

    .modal-image-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10;
      background: #111;
    }

    .modal-food-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: filter 0.2s ease;

      &.is-out-of-stock {
        filter: grayscale(85%) opacity(0.85);
      }
    }

    .modal-not-in-stock-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      background: #DC2626;
      color: #FFFFFF;
      font-family: var(--font-heading);
      font-size: 11.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 5px 12px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      z-index: 5;
    }

    .modal-not-in-stock-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 13px;
      background: #FEE2E2;
      border: 1.5px solid #FECACA;
      color: #DC2626;
      border-radius: var(--radius-md);
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .modal-image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 50%, rgba(27, 27, 27, 0.9) 100%);
    }

    .modal-diet-tag {
      position: absolute;
      bottom: 12px;
      left: 16px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(11, 11, 11, 0.8);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      border: 1px solid #333;
    }

    .diet-text {
      font-size: 11px;
      font-weight: 600;
      color: #fff;
    }

    .modal-content-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .modal-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .modal-dish-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #fff;
      line-height: 1.25;
    }

    .modal-dish-price {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--accent-primary);
      white-space: nowrap;
    }

    .modal-category-badge {
      font-size: 11.5px;
      color: var(--text-muted);
      text-transform: capitalize;
    }

    .modal-dish-desc {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .modal-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tag-pill {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-secondary);
      border: 1px solid #2e2e2e;
    }

    .modal-footer-actions {
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .full-width {
      width: 100%;
      padding: 12px;
      font-size: 15px;
    }

    .modal-qty-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-surface-elevated);
      padding: 10px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }

    .qty-label {
      font-weight: 600;
      font-size: 14px;
      color: #fff;
    }

    .qty-control-pill {
      display: inline-flex;
      align-items: center;
      background-color: var(--accent-primary);
      color: #000;
      border-radius: var(--radius-sm);
      padding: 3px;
    }

    .qty-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      color: #000;
      border-radius: 4px;
      transition: background-color 0.15s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.15);
      }
    }

    .qty-number {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 800;
      min-width: 28px;
      text-align: center;
    }
  `]
})
export class FoodModalComponent {
  private menuService = inject(MenuService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  item = this.menuService.activeModalItem;

  get quantity(): number {
    const dish = this.item();
    return dish ? this.cartService.getItemQuantity(dish.id) : 0;
  }

  close(): void {
    this.menuService.closeItemModal();
  }

  onAdd(dish: any): void {
    if (!dish.isAvailable) {
      this.toastService.show(`Sorry, "${dish.name}" is currently not in stock.`, 'warning');
      return;
    }
    this.cartService.addItem(dish, 1);
    this.toastService.show(`Added ${dish.name} to cart`, 'success');
  }

  onIncrease(dish: any): void {
    this.cartService.addItem(dish, 1);
  }

  onDecrease(dishId: string): void {
    this.cartService.decreaseItem(dishId);
  }
}


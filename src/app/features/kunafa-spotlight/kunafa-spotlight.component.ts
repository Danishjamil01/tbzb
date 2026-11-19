import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-kunafa-spotlight',
  standalone: true,
  imports: [CommonModule, InrPipe, IconComponent],
  template: `
    <section id="kunafa" class="kunafa-section">
      <div class="container">
        <div class="spotlight-card">
          <!-- Left Content Column -->
          <div class="spotlight-content">
            <!-- Badge -->
            <div class="spotlight-badge">
              <app-icon name="sparkles" [size]="14" />
              <span>SIGNATURE DESSERT SPECIAL</span>
            </div>

            <!-- Kicker -->
            <div class="exclusive-kicker-row">
              <span class="exclusive-tag">EXCLUSIVE AT THE BITE ZONE</span>
              <span class="gold-dash" aria-hidden="true"></span>
            </div>

            <!-- Title with Underline Swoosh -->
            <h2 class="spotlight-title">
              <span class="title-wrap">
                Kunafa Jar
                <svg class="gold-swoosh" viewBox="0 0 200 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 11C55 3 145 3 196 9" stroke="#E5A00D" stroke-width="4.5" stroke-linecap="round"/>
                </svg>
              </span>
            </h2>

            <!-- Price & Diet Tag -->
            <div class="spotlight-price-row">
              <span class="spotlight-price">{{ item.price | inr }}</span>
              <div class="spotlight-diet-pill">
                <app-icon name="leaf" [size]="14" />
                <span>Pure Veg • Handcrafted Fresh</span>
              </div>
            </div>

            <!-- Description -->
            <p class="spotlight-desc">
              {{ item.description }}
            </p>

            <!-- Perks Highlights List -->
            <div class="spotlight-perks">
              <div class="perk-item">
                <span class="perk-check">
                  <app-icon name="check" [size]="12" [strokeWidth]="3" />
                </span>
                <span class="perk-text">Golden Crisp Kataifi Crust</span>
              </div>
              <div class="perk-item">
                <span class="perk-check">
                  <app-icon name="check" [size]="12" [strokeWidth]="3" />
                </span>
                <span class="perk-text">Silky Warm Cream Filling</span>
              </div>
              <div class="perk-item">
                <span class="perk-check">
                  <app-icon name="check" [size]="12" [strokeWidth]="3" />
                </span>
                <span class="perk-text">Infused with Aromatic Sugar Nectar</span>
              </div>
            </div>

            <!-- Action Button / Cart Stepper -->
            <div class="spotlight-actions">
              @if (quantity === 0) {
                <button class="btn-order-kunafa" (click)="onAdd()" aria-label="Order Kunafa Jar">
                  <app-icon name="shopping-cart" [size]="18" />
                  <span>Order Kunafa Jar • {{ item.price | inr }}</span>
                  <span class="btn-arrow">→</span>
                </button>
              } @else {
                <div class="spotlight-qty-pill">
                  <span class="qty-status-text">In your cart:</span>
                  <div class="qty-control-pill">
                    <button class="qty-btn" (click)="onDecrease()" aria-label="Decrease quantity">
                      <app-icon name="minus" [size]="14" />
                    </button>
                    <span class="qty-number">{{ quantity }}</span>
                    <button class="qty-btn" (click)="onIncrease()" aria-label="Increase quantity">
                      <app-icon name="plus" [size]="14" />
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Right Visual Column -->
          <div class="spotlight-visual">
            <img
              src="images/food/kunafa-showcase1.png"
              alt="TBZB Signature Kunafa Jar"
              class="kunafa-showcase-img"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .kunafa-section {
      padding: 3rem 0;
      background-color: #FAF7F2;
    }

    .spotlight-card {
      position: relative;
      background-color: #FCFAF7;
      border: 1.5px solid #ECE7DF;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
      display: grid;
      grid-template-columns: 1fr;
      align-items: center;

      @media (min-width: 992px) {
        grid-template-columns: 1.05fr 0.95fr;
      }
    }

    .spotlight-content {
      padding: 2.25rem 1.75rem;
      display: flex;
      flex-direction: column;
      z-index: 2;

      @media (min-width: 768px) {
        padding: 3.25rem 3rem;
      }

      @media (min-width: 1200px) {
        padding: 3.75rem 3.5rem;
      }
    }

    .spotlight-badge {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 7px;
      background-color: #FEF08A;
      color: #0F472B;
      border-radius: 9999px;
      padding: 5px 14px;
      font-family: var(--font-heading);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }

    .exclusive-kicker-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .exclusive-tag {
      font-family: var(--font-heading);
      font-size: 11.5px;
      font-weight: 800;
      color: #6B7280;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .gold-dash {
      display: inline-block;
      width: 32px;
      height: 3px;
      background-color: #E5A00D;
      border-radius: 2px;
    }

    .spotlight-title {
      font-family: var(--font-heading);
      font-size: clamp(2.4rem, 4vw, 3.4rem);
      font-weight: 850;
      color: #0F472B;
      letter-spacing: -0.025em;
      line-height: 1.1;
      margin-bottom: 1rem;
    }

    .title-wrap {
      position: relative;
      display: inline-block;
    }

    .gold-swoosh {
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 100%;
      height: 16px;
      pointer-events: none;
    }

    .spotlight-price-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 1.25rem;
    }

    .spotlight-price {
      font-family: var(--font-heading);
      font-size: 32px;
      font-weight: 850;
      color: #0F472B;
      line-height: 1;
    }

    .spotlight-diet-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: #F0FDF4;
      border: 1px solid #BBF7D0;
      color: #047857;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 650;
    }

    .spotlight-desc {
      color: #4B5563;
      font-size: 14px;
      line-height: 1.6;
      max-width: 460px;
      margin-bottom: 1.75rem;
    }

    .spotlight-perks {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 2.25rem;
    }

    .perk-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .perk-check {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #0F472B;
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .perk-text {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 700;
      color: #1F2937;
    }

    .spotlight-actions {
      display: flex;
      align-items: center;
    }

    .btn-order-kunafa {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background-color: #0F472B;
      color: #FFFFFF;
      border: none;
      border-radius: 9999px;
      padding: 13px 28px;
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(15, 71, 43, 0.25);
      transition: all var(--transition-fast);

      .btn-arrow {
        font-size: 17px;
        transition: transform var(--transition-fast);
      }

      &:hover {
        background-color: #0A3520;
        transform: translateY(-2px);
        box-shadow: 0 6px 22px rgba(15, 71, 43, 0.35);

        .btn-arrow {
          transform: translateX(3px);
        }
      }
    }

    .spotlight-qty-pill {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #FFFFFF;
      border: 1.5px solid #BBF7D0;
      padding: 6px 14px;
      border-radius: 9999px;
    }

    .qty-status-text {
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 700;
      color: #0F472B;
    }

    .qty-control-pill {
      display: inline-flex;
      align-items: center;
      background-color: #FFC82C;
      color: #000000;
      border-radius: 8px;
      padding: 2px 4px;
    }

    .qty-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      color: #000000;
      border-radius: 4px;
      transition: background-color var(--transition-fast);

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
    }

    /* Right Visual */
    .spotlight-visual {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .kunafa-showcase-img {
      width: 100%;
      height: 100%;
      max-height: 520px;
      // object-fit: cover;
      object-position: right center;
      display: block;
    }
  `]
})
export class KunafaSpotlightComponent {
  private menuService = inject(MenuService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  get item() {
    return this.menuService.kunafaProduct();
  }

  get quantity(): number {
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
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { CartService } from '../../core/services/cart.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-floating-whatsapp',
  standalone: true,
  imports: [CommonModule, InrPipe, IconComponent],
  template: `
    <!-- Sticky Bottom "View Cart" Bar (visible when cart has items and modal/drawer is not open) -->
    @if (cartService.totalItemCount() > 0 && !cartService.isCartDrawerOpen() && !cartService.isCheckoutModalOpen()) {
      <div
        class="sticky-cart-bar mobile-sticky-cart-bar"
        (click)="cartService.openCartDrawer()"
        role="button"
        tabindex="0"
        aria-label="View Cart and Order Summary"
      >
        <div class="cart-bar-inner">
          <!-- Left: Shopping Bag Icon with badge + Count and Subtotal -->
          <div class="cart-left">
            <div class="cart-icon-bubble">
              <app-icon name="shopping-bag" [size]="20" />
              <span class="bubble-badge">{{ cartService.totalItemCount() }}</span>
            </div>
            <div class="cart-info">
              <div class="cart-headline">
                <span class="count-tag">{{ cartService.totalItemCount() }} {{ cartService.totalItemCount() === 1 ? 'ITEM' : 'ITEMS' }}</span>
                <span class="bullet" aria-hidden="true">•</span>
                <span class="cart-price">{{ calculation().total | inr }}</span>
              </div>
              <div class="cart-hint">Tap to view order summary & bill</div>
            </div>
          </div>

          <!-- Right: Action CTA Pill -->
          <div class="cart-right">
            <div class="cta-pill">
              <span class="cta-label">View Cart</span>
              <span class="cta-arrow" aria-hidden="true">
                <app-icon name="arrow-right" [size]="15" />
              </span>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Floating WhatsApp Action Button -->
    <div
      class="floating-wa-container"
      [class.has-cart-bar]="cartService.totalItemCount() > 0 && !cartService.isCartDrawerOpen() && !cartService.isCheckoutModalOpen()"
    >
      <a
        [href]="'https://wa.me/' + config.contact.whatsappNumber"
        target="_blank"
        rel="noopener noreferrer"
        class="floating-wa-btn"
        aria-label="Chat with TBZB on WhatsApp"
      >
        <app-icon name="whatsapp" [size]="28" />
        <span class="wa-tooltip">Direct WhatsApp</span>
      </a>
    </div>
  `,
  styles: [`
    /* ==========================================================================
       STICKY BOTTOM "VIEW CART" BAR
       ========================================================================== */
    .sticky-cart-bar {
      position: fixed;
      bottom: max(14px, env(safe-area-inset-bottom, 14px));
      left: 14px;
      right: 14px;
      margin: 0 auto;
      max-width: 520px;
      z-index: 1045;
      background: linear-gradient(135deg, #024724 0%, #01542C 55%, #03391A 100%);
      color: #FFFFFF;
      border: 1px solid rgba(247, 213, 29, 0.35);
      border-radius: 18px;
      padding: 10px 14px;
      box-shadow: 0 12px 32px rgba(1, 84, 44, 0.45), 0 4px 14px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      user-select: none;
      animation: slideUpCart 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 38px rgba(1, 84, 44, 0.55), 0 6px 18px rgba(0, 0, 0, 0.35);

        .cta-pill {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(247, 213, 29, 0.5);
        }

        .cta-arrow {
          transform: translateX(3px);
        }
      }

      &:active {
        transform: scale(0.985);
      }
    }

    @keyframes slideUpCart {
      0% {
        transform: translateY(120%);
        opacity: 0;
      }
      70% {
        transform: translateY(-4px);
        opacity: 1;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .cart-bar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
    }

    /* Left Side: Bag Icon + Info */
    .cart-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .cart-icon-bubble {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      flex-shrink: 0;
    }

    .bubble-badge {
      position: absolute;
      top: -4px;
      right: -5px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: #F7D51D;
      color: #01542C;
      font-family: var(--font-heading);
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
      border: 1.5px solid #01542C;
    }

    .cart-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .cart-headline {
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.2;
    }

    .count-tag {
      font-family: var(--font-heading);
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #E2E8F0;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .bullet {
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
    }

    .cart-price {
      font-family: var(--font-heading);
      font-size: 17px;
      font-weight: 800;
      color: #F7D51D;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .cart-hint {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.75);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }

    /* Right Side: CTA Pill Button */
    .cart-right {
      flex-shrink: 0;
    }

    .cta-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: linear-gradient(135deg, #FFE169 0%, #F7D51D 50%, #FFA800 100%);
      color: #053B1F;
      padding: 9px 16px;
      border-radius: 12px;
      font-family: var(--font-heading);
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.01em;
      box-shadow: 0 4px 14px rgba(247, 213, 29, 0.35);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
    }

    .cta-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    /* ==========================================================================
       FLOATING WHATSAPP BUTTON
       ========================================================================== */
    .floating-wa-container {
      position: fixed;
      bottom: max(20px, env(safe-area-inset-bottom, 20px));
      right: 18px;
      z-index: 850;
      display: flex;
      align-items: center;
      transition: bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &.has-cart-bar {
        bottom: calc(max(14px, env(safe-area-inset-bottom, 14px)) + 74px);
      }
    }

    .floating-wa-btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background-color: #25D366;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
      transition: all var(--transition-fast);
      position: relative;

      &:hover {
        transform: scale(1.08) translateY(-2px);
        box-shadow: 0 8px 25px rgba(37, 211, 102, 0.6);

        .wa-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .wa-tooltip {
      position: absolute;
      right: 62px;
      background: #1c1c1c;
      color: #fff;
      font-family: var(--font-heading);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid #333;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: var(--shadow-md);
      opacity: 0;
      visibility: hidden;
      transform: translateX(8px);
      transition: all 0.2s ease;
      display: none;

      @media (min-width: 768px) {
        display: block;
      }
    }
  `]
})
export class FloatingWhatsappComponent {
  cartService = inject(CartService);
  private statusService = inject(BusinessStatusService);

  config = this.statusService.config;
  calculation = this.cartService.calculation;
}

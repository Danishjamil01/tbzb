import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PlacedOrder } from '../../core/models/order.model';

@Component({
  selector: 'app-order-confirmation-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (cartService.isOrderConfirmedModalOpen()) {
      <div class="modal-backdrop" (click)="close()"></div>

      <div class="confirm-modal-dialog" role="dialog" aria-modal="true" aria-label="Order Message Ready">
        <div class="confirm-header">
          <div class="success-icon-badge">
            <app-icon name="whatsapp" [size]="30" />
          </div>
          <h3 class="confirm-title">Order Message Ready!</h3>
          <p class="header-sub">
            Your order details and live location have been formatted. Tap below to send the message on WhatsApp to confirm with the kitchen.
          </p>
        </div>

        <div class="confirm-body">
          <div class="notice-card">
            <app-icon name="info" [size]="18" />
            <div class="notice-text">
              <strong>Action Required on WhatsApp:</strong>
              <span>Send the pre-filled message in your WhatsApp chat so TBZB can start preparing your food right away!</span>
            </div>
          </div>

          @if (order; as ord) {
            <div class="order-summary-box">
              <div class="summary-meta-line">
                <span>Order Ref: <strong>{{ ord.orderId }}</strong></span>
                <span>Customer: <strong>{{ ord.customer.fullName }}</strong></span>
              </div>

              <div class="items-count-line">
                <span>Items: <strong>{{ ord.items.length }}</strong></span>
                <span>Total Amount: <strong class="total-highlight">₹{{ ord.calculation.total }}</strong></span>
              </div>

              @if (ord.customer.googleMapsUrl) {
                <div class="location-attached-tag">
                  <app-icon name="map-pin" [size]="14" />
                  <span>Live GPS Location link included</span>
                </div>
              }
            </div>

            <!-- WhatsApp Message Preview Box -->
            <div class="message-preview-card">
              <div class="preview-header">
                <span>Formatted WhatsApp Message</span>
                <button class="copy-btn" (click)="copyMessage(ord.formattedWhatsAppMessage)">
                  <app-icon name="check" [size]="14" />
                  <span>Copy Text</span>
                </button>
              </div>
              <pre class="message-text">{{ ord.formattedWhatsAppMessage }}</pre>
            </div>

            <!-- Actions -->
            <div class="confirm-actions">
              <a
                [href]="ord.whatsAppUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary re-open-btn"
              >
                <app-icon name="whatsapp" [size]="20" />
                <span>Open WhatsApp Chat</span>
              </a>

              <button class="btn-secondary finish-btn" (click)="finishOrder()">
                <span>Back to Menu</span>
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      z-index: 1100;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .confirm-modal-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 94%;
      max-width: 520px;
      max-height: 92vh;
      overflow-y: auto;
      background-color: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 20px;
      z-index: 1101;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
      animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalPop {
      from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    .confirm-header {
      padding: 1.75rem 1.5rem 1.25rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #FFFFFF;
      border-bottom: 1px solid #F3F4F6;

      .success-icon-badge {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: #DCFCE7;
        color: #15803D;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        border: 2px solid #86EFAC;
      }

      .confirm-title {
        font-family: var(--font-heading, inherit);
        font-size: 1.35rem;
        font-weight: 700;
        color: #0F472B;
        margin-bottom: 6px;
      }

      .header-sub {
        font-size: 13px;
        color: #6B7280;
        max-width: 400px;
        line-height: 1.4;
      }
    }

    .confirm-body {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      background: #FAF7F2;
    }

    .notice-card {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      border-radius: 12px;
      padding: 12px;
      font-size: 12.5px;
      color: #92400E;

      app-icon {
        margin-top: 1px;
        color: #D97706;
        flex-shrink: 0;
      }

      strong {
        display: block;
        margin-bottom: 2px;
        color: #78350F;
      }
    }

    .order-summary-box {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 13px;
      color: #4B5563;

      strong {
        color: #111827;
      }

      .total-highlight {
        color: #0F472B;
        font-size: 15px;
      }
    }

    .summary-meta-line, .items-count-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .location-attached-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #15803D;
      background: #DCFCE7;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
    }

    .message-preview-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
      color: #374151;
    }

    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #0F472B;
      cursor: pointer;
      background: #FAF7F2;
      border: 1px solid #E5E7EB;
      padding: 3px 8px;
      border-radius: 6px;

      &:hover {
        background: #F3F4F6;
      }
    }

    .message-text {
      font-family: monospace;
      font-size: 11.5px;
      line-height: 1.45;
      color: #1F2937;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 130px;
      overflow-y: auto;
      background: #FAF7F2;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      margin: 0;
    }

    .confirm-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 4px;
    }

    .re-open-btn {
      width: 100%;
      padding: 13px;
      font-size: 15px;
      font-weight: 700;
      border-radius: 12px;
      background-color: #25D366;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);

      &:hover {
        background-color: #1EBE5D;
      }
    }

    .finish-btn {
      width: 100%;
      padding: 11px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 12px;
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      color: #4B5563;
      cursor: pointer;

      &:hover {
        background: #F9FAFB;
        color: #111827;
      }
    }
  `]
})
export class OrderConfirmationModalComponent {
  cartService = inject(CartService);
  private toastService = inject(ToastService);

  get order(): PlacedOrder | null {
    if (typeof window !== 'undefined') {
      return (window as any).__lastTbzbOrder ?? null;
    }
    return null;
  }

  copyMessage(text: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.toastService.show('Order message copied to clipboard!', 'info');
    }
  }

  close(): void {
    this.cartService.isOrderConfirmedModalOpen.set(false);
  }

  finishOrder(): void {
    this.cartService.clearCart();
    this.cartService.isOrderConfirmedModalOpen.set(false);
    this.toastService.show('Thank you! We look forward to serving your order.', 'success');
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { CartService } from '../../../core/services/cart.service';
import { MenuService } from '../../../core/services/menu.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { BUSINESS_CONFIG } from '../../../core/config/business.config';

@Component({
  selector: 'app-mobile-orders',
  standalone: true,
  imports: [CommonModule, IconComponent, InrPipe],
  template: `
    <div class="mobile-orders-container">
      <div class="orders-header">
        <h2 class="orders-title">Your Orders</h2>
        <span class="orders-sub">Live tracking & order history</span>
      </div>

      <!-- Active Order Card -->
      @if (activeOrder(); as ord) {
        <div class="active-tracking-card">
          <div class="tracking-top">
            <div class="order-id-meta">
              <span class="live-pill">
                <span class="pulse-dot"></span> LIVE ORDER
              </span>
              <span class="order-ref">#{{ ord.orderId }}</span>
            </div>
            <span class="order-time">{{ ord.createdAt ? (ord.createdAt | date:'shortTime') : 'Just now' }}</span>
          </div>

          <!-- Visual Progress Tracker -->
          <div class="progress-tracker">
            <div class="step-item" [class.done]="isStepDone(ord.status, 1)" [class.current]="ord.status === 'new'">
              <div class="step-circle">
                <app-icon name="check" [size]="12" />
              </div>
              <span class="step-label">Placed</span>
            </div>

            <div class="step-line" [class.filled]="isStepDone(ord.status, 2)"></div>

            <div class="step-item" [class.done]="isStepDone(ord.status, 2)" [class.current]="ord.status === 'preparing'">
              <div class="step-circle">
                <app-icon name="chef-hat" [size]="12" />
              </div>
              <span class="step-label">Cooking</span>
            </div>

            <div class="step-line" [class.filled]="isStepDone(ord.status, 3)"></div>

            <div class="step-item" [class.done]="isStepDone(ord.status, 3)" [class.current]="ord.status === 'out_for_delivery'">
              <div class="step-circle">
                <app-icon name="delivery-scooter" [size]="12" />
              </div>
              <span class="step-label">On Way</span>
            </div>

            <div class="step-line" [class.filled]="ord.status === 'delivered'"></div>

            <div class="step-item" [class.done]="ord.status === 'delivered'">
              <div class="step-circle">
                <app-icon name="check-circle" [size]="12" />
              </div>
              <span class="step-label">Delivered</span>
            </div>
          </div>

          <!-- Status Message Box -->
          <div class="status-alert-box">
            <app-icon name="clock" [size]="16" />
            <div class="status-alert-text">
              <strong>{{ getStatusMessage(ord.status) }}</strong>
              <span>Estimated delivery: 20-30 minutes within Bidar</span>
            </div>
          </div>

          <!-- Items Ordered Summary -->
          <div class="order-items-box">
            <h4 class="items-heading">Items Ordered ({{ ord.items?.length || 0 }})</h4>
            <div class="items-list">
              @for (item of ord.items; track item.name) {
                <div class="item-line">
                  <span class="item-qty-name">{{ item.quantity }}x {{ item.name }}</span>
                  <span class="item-price">{{ item.total | inr }}</span>
                </div>
              }
            </div>

            <div class="total-row">
              <span>Total Payable</span>
              <strong class="total-val">{{ ord.total | inr }}</strong>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="action-buttons-row">
            <a [href]="getWhatsAppUrl(ord)" target="_blank" class="btn-whatsapp-track">
              <app-icon name="whatsapp" [size]="16" />
              <span>WhatsApp Kitchen</span>
            </a>
            <a [href]="'tel:' + config.contact.phone" class="btn-call-kitchen">
              <app-icon name="phone" [size]="16" />
              <span>Call Kitchen</span>
            </a>
          </div>
        </div>
      } @else {
        <!-- Empty State -->
        <div class="no-orders-box">
          <div class="empty-icon-wrap">
            <app-icon name="package" [size]="48" />
          </div>
          <h3 class="no-orders-title">No Active Orders</h3>
          <p class="no-orders-desc">
            You don't have any active food deliveries right now. Order delicious rolls, biryani, or kunafa to satisfy your cravings!
          </p>
          <button class="btn-browse-menu" (click)="platformService.setTab('menu')">
            <app-icon name="utensils" [size]="16" />
            <span>Browse Delicious Menu</span>
          </button>
        </div>
      }

      <!-- Delivery Guarantee Banner -->
      <div class="guarantee-card">
        <app-icon name="shield-check" [size]="20" />
        <div class="guarantee-text">
          <strong>TBZB Freshness Guarantee</strong>
          <span>Food is prepared strictly fresh after order placement. 100% Halal Certified.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-orders-container {
      padding: 16px 14px 85px;
      background: #F9FAFB;
      min-height: calc(100vh - 120px);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .orders-header {
      margin-bottom: 4px;
    }

    .orders-title {
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }

    .orders-sub {
      font-size: 12px;
      color: #6B7280;
    }

    /* Active tracking card */
    .active-tracking-card {
      background: #FFFFFF;
      border-radius: 18px;
      padding: 16px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .tracking-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .order-id-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .live-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #DCFCE7;
      color: #15803D;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 800;

      .pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #16A34A;
        animation: pulseDot 1.2s infinite;
      }
    }

    @keyframes pulseDot {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.4); opacity: 1; }
    }

    .order-ref {
      font-size: 13.5px;
      font-weight: 700;
      color: #111827;
    }

    .order-time {
      font-size: 11px;
      color: #6B7280;
    }

    /* Step progress bar */
    .progress-tracker {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 4px 6px;
    }

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      position: relative;
      z-index: 2;

      .step-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #F3F4F6;
        color: #9CA3AF;
        border: 2px solid #E5E7EB;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .step-label {
        font-size: 10px;
        font-weight: 600;
        color: #6B7280;
      }

      &.done {
        .step-circle {
          background: #0F472B;
          color: #FFFFFF;
          border-color: #0F472B;
        }
        .step-label {
          color: #0F472B;
          font-weight: 700;
        }
      }

      &.current {
        .step-circle {
          background: #F59E0B;
          color: #FFFFFF;
          border-color: #F59E0B;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
        .step-label {
          color: #B45309;
          font-weight: 700;
        }
      }
    }

    .step-line {
      flex: 1;
      height: 3px;
      background: #E5E7EB;
      margin: 0 -4px;
      transform: translateY(-9px);
      z-index: 1;

      &.filled {
        background: #0F472B;
      }
    }

    /* Status alert box */
    .status-alert-box {
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      border-radius: 12px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #065F46;

      .status-alert-text {
        display: flex;
        flex-direction: column;
        strong {
          font-size: 12.5px;
          color: #064E3B;
        }
        span {
          font-size: 11px;
          color: #047857;
        }
      }
    }

    /* Items list */
    .order-items-box {
      background: #F9FAFB;
      border-radius: 12px;
      padding: 12px;
      border: 1px solid #F3F4F6;
    }

    .items-heading {
      font-size: 12px;
      font-weight: 700;
      color: #374151;
      margin: 0 0 8px;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }

    .item-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #4B5563;
    }

    .total-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px dashed #D1D5DB;
      padding-top: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #111827;

      .total-val {
        color: #0F472B;
        font-size: 14px;
      }
    }

    /* Action buttons */
    .action-buttons-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .btn-whatsapp-track, .btn-call-kitchen {
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }

    .btn-whatsapp-track {
      background: #25D366;
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
    }

    .btn-call-kitchen {
      background: #0F472B;
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(15, 71, 43, 0.3);
    }

    /* Empty state */
    .no-orders-box {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 40px 20px;
      text-align: center;
      border: 1px solid #E5E7EB;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .empty-icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #FEF3C7;
      color: #D97706;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .no-orders-title {
      font-size: 17px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 6px;
    }

    .no-orders-desc {
      font-size: 12.5px;
      color: #6B7280;
      line-height: 1.4;
      margin: 0 0 20px;
      max-width: 280px;
    }

    .btn-browse-menu {
      background: #0F472B;
      color: #FFFFFF;
      border: none;
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(15, 71, 43, 0.25);
    }

    /* Guarantee Card */
    .guarantee-card {
      background: #FFFFFF;
      border-radius: 14px;
      padding: 12px 14px;
      border: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #0F472B;

      .guarantee-text {
        display: flex;
        flex-direction: column;
        strong {
          font-size: 12px;
          color: #111827;
        }
        span {
          font-size: 11px;
          color: #6B7280;
        }
      }
    }
  `]
})
export class MobileOrdersComponent {
  platformService = inject(PlatformService);
  private cartService = inject(CartService);
  config = BUSINESS_CONFIG;

  activeOrder = this.platformService.customerActiveOrder;

  isStepDone(status: string, step: number): boolean {
    const ranks: Record<string, number> = {
      new: 1,
      preparing: 2,
      out_for_delivery: 3,
      delivered: 4
    };
    return (ranks[status] || 1) >= step;
  }

  getStatusMessage(status: string): string {
    switch (status) {
      case 'new': return 'Order received by TBZB kitchen';
      case 'preparing': return 'Chef is cooking your fresh dishes';
      case 'out_for_delivery': return 'Delivery partner is on the way to you';
      case 'delivered': return 'Food successfully delivered! Enjoy!';
      default: return 'Order in progress';
    }
  }

  getWhatsAppUrl(ord: any): string {
    const msg = `Hello TBZB, I would like to check the status of my Order #${ord.orderId}.`;
    return `https://wa.me/${this.config.contact.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }
}

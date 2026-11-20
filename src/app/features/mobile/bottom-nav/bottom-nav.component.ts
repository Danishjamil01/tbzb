import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformService, AppTab } from '../../../core/services/platform.service';
import { CartService } from '../../../core/services/cart.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <nav class="bottom-nav" role="navigation" aria-label="App Navigation">
      <!-- 1. Home Tab -->
      <button
        class="nav-tab-btn"
        [class.active]="platformService.activeTab() === 'home'"
        (click)="selectTab('home')"
        aria-label="Home"
      >
        <div class="icon-wrap">
          <app-icon name="home" [size]="20" />
        </div>
        <span class="tab-label">Home</span>
      </button>

      <!-- 2. Menu Tab -->
      <button
        class="nav-tab-btn"
        [class.active]="platformService.activeTab() === 'menu'"
        (click)="selectTab('menu')"
        aria-label="Menu"
      >
        <div class="icon-wrap">
          <app-icon name="utensils" [size]="20" />
        </div>
        <span class="tab-label">Menu</span>
      </button>

      <!-- 3. Orders Tab -->
      <button
        class="nav-tab-btn"
        [class.active]="platformService.activeTab() === 'orders'"
        (click)="selectTab('orders')"
        aria-label="Orders"
      >
        <div class="icon-wrap">
          <app-icon name="package" [size]="20" />
          @if (hasActiveOrder()) {
            <span class="pulse-active-dot"></span>
          }
        </div>
        <span class="tab-label">Orders</span>
      </button>

      <!-- 4. Cart Tab -->
      <button
        class="nav-tab-btn"
        [class.active]="platformService.activeTab() === 'cart'"
        (click)="selectTab('cart')"
        aria-label="Cart"
      >
        <div class="icon-wrap cart-icon-wrap">
          <app-icon name="shopping-bag" [size]="20" />
          @if (cartCount() > 0) {
            <span class="cart-badge">{{ cartCount() }}</span>
          }
        </div>
        <span class="tab-label">Cart</span>
      </button>

      <!-- 5. More / Profile Tab -->
      <button
        class="nav-tab-btn"
        [class.active]="platformService.activeTab() === 'more'"
        (click)="selectTab('more')"
        aria-label="More Options"
      >
        <div class="icon-wrap">
          <app-icon name="more-horizontal" [size]="20" />
        </div>
        <span class="tab-label">More</span>
      </button>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: #FFFFFF;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid #E5E7EB;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-around;
      z-index: 1000;
      padding-bottom: max(0px, env(safe-area-inset-bottom));
      box-sizing: content-box;
    }

    .nav-tab-btn {
      flex: 1;
      height: 100%;
      border: none;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: #6B7280;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 6px 0;
      user-select: none;
      -webkit-tap-highlight-color: transparent;

      .icon-wrap {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 26px;
        border-radius: 14px;
        transition: all 0.2s ease;
      }

      .tab-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.1px;
        transition: all 0.2s ease;
      }

      &.active {
        color: #0F472B;

        .icon-wrap {
          background: rgba(15, 71, 43, 0.1);
          color: #0F472B;
        }

        .tab-label {
          font-weight: 700;
          color: #0F472B;
        }

        /* Top tiny active pill line */
        &::before {
          content: '';
          position: absolute;
          top: 0;
          width: 32px;
          height: 3px;
          background: #0F472B;
          border-radius: 0 0 4px 4px;
        }
      }

      &:active {
        transform: scale(0.92);
      }
    }

    /* Cart Badge */
    .cart-badge {
      position: absolute;
      top: -3px;
      right: 0px;
      min-width: 17px;
      height: 17px;
      padding: 0 4px;
      background: #DC2626;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
      line-height: 1;
    }

    /* Active order pulse dot */
    .pulse-active-dot {
      position: absolute;
      top: 1px;
      right: 4px;
      width: 8px;
      height: 8px;
      background: #F59E0B;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      animation: pulseAlert 1.4s infinite;
    }

    @keyframes pulseAlert {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.6; }
    }
  `]
})
export class BottomNavComponent {
  platformService = inject(PlatformService);
  private cartService = inject(CartService);

  cartCount = this.cartService.totalItemCount;

  hasActiveOrder(): boolean {
    const ord = this.platformService.customerActiveOrder();
    return !!ord && ord.status !== 'delivered';
  }

  selectTab(tab: AppTab): void {
    this.platformService.setTab(tab);
  }
}


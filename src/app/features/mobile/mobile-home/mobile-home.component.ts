import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../core/services/menu.service';
import { CartService } from '../../../core/services/cart.service';
import { PlatformService } from '../../../core/services/platform.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { MenuItem, FoodCategory } from '../../../core/models/menu.model';

@Component({
  selector: 'app-mobile-home',
  standalone: true,
  imports: [CommonModule, IconComponent, InrPipe],
  template: `
    <div class="mobile-home-container">
      <!-- Real-time GPS Location Bar -->
      <div class="home-location-strip" (click)="platformService.fetchRealLocation()">
        <div class="loc-strip-left">
          <div class="loc-pin-icon" [class.pulse]="platformService.isLocating()">
            <app-icon name="map-pin" [size]="16" />
          </div>
          <div class="loc-strip-meta">
            <span class="loc-strip-label">Delivering to:</span>
            <strong class="loc-strip-title">{{ platformService.userLocationName() }}</strong>
          </div>
        </div>
        <button class="btn-refresh-gps" title="Refresh GPS Location" aria-label="Refresh Location">
          <app-icon name="refresh-cw" [size]="13" [extraClass]="platformService.isLocating() ? 'spin' : ''" />
        </button>
      </div>

      <!-- Active Order Tracker Alert (If order is active) -->
      @if (activeOrder(); as ord) {
        <div class="active-order-pill" (click)="platformService.setTab('orders')">
          <div class="pill-left">
            <span class="motor-badge">
              <app-icon name="delivery-scooter" [size]="16" />
            </span>
            <div class="pill-info">
              <span class="pill-title">Active Order #{{ ord.orderId }}</span>
              <span class="pill-status">Status: <strong>{{ getStatusLabel(ord.status) }}</strong></span>
            </div>
          </div>
          <div class="pill-right">
            <span>Track</span>
            <app-icon name="chevron-right" [size]="14" />
          </div>
        </div>
      }

      <!-- App Banner Slider / Promo Card -->
      <div class="hero-promo-card">
        <div class="promo-badge">
          <app-icon name="sparkles" [size]="14" />
          <span>Bidar's No. 1 Food Destination</span>
        </div>
        <h2 class="promo-heading">Fresh Rolls & Handi Biryani</h2>
        <p class="promo-sub">Cooked fresh on order • 100% Halal • Delivered Hot</p>
        
        <div class="promo-cta-row">
          <button class="btn-primary-order" (click)="goToMenu('all')">
            <app-icon name="utensils" [size]="16" />
            <span>Order Now</span>
          </button>
          <div class="promo-perk">
            <app-icon name="clock" [size]="14" />
            <span>20-30 Min Delivery</span>
          </div>
        </div>
      </div>

      <!-- Quick Category Circles -->
      <section class="section-categories">
        <div class="section-title-row">
          <h3 class="section-title">Explore Categories</h3>
          <button class="see-all-btn" (click)="goToMenu('all')">See All</button>
        </div>

        <div class="categories-scroll">
          @for (cat of quickCategories; track cat.id) {
            <button class="category-circle-btn" (click)="goToMenu(cat.id)">
              <div class="cat-circle" [style.background-color]="cat.bg">
                <span class="cat-emoji">{{ cat.emoji }}</span>
              </div>
              <span class="cat-name">{{ cat.label }}</span>
            </button>
          }
        </div>
      </section>

      <!-- Today's Top Picks / Popular Food Cards -->
      <section class="section-top-picks">
        <div class="section-title-row">
          <div class="title-with-badge">
            <h3 class="section-title">Popular Delicacies</h3>
            <span class="flame-badge">
              <app-icon name="flame" [size]="12" /> Hot
            </span>
          </div>
          <button class="see-all-btn" (click)="goToMenu('all')">View Menu</button>
        </div>

        <div class="picks-grid">
          @for (item of featuredItems(); track item.id) {
            <div class="app-dish-card" (click)="openDishModal(item)">
              <div class="dish-thumb-wrap">
                <img [src]="item.imageUrl" [alt]="item.name" class="dish-img" loading="lazy" />
                <div class="diet-dot-badge" [class.veg]="item.dietType === 'veg'" [class.non-veg]="item.dietType === 'non-veg'">
                  <span class="inner-dot"></span>
                </div>
                @if (item.tags && item.tags.length > 0) {
                  <span class="item-tag-pill">{{ item.tags[0] }}</span>
                }
              </div>

              <div class="dish-details">
                <h4 class="dish-name">{{ item.name }}</h4>
                <div class="price-rating-row">
                  <span class="dish-price">{{ item.price | inr }}</span>
                  <div class="rating-badge">
                    <app-icon name="star" [size]="11" />
                    <span>4.8</span>
                  </div>
                </div>

                <!-- Add Button or Stepper -->
                <div class="dish-action-row" (click)="$event.stopPropagation()">
                  @if (getItemQuantity(item.id) > 0) {
                    <div class="stepper-wrap">
                      <button class="step-btn" (click)="updateQty(item, -1)">-</button>
                      <span class="step-qty">{{ getItemQuantity(item.id) }}</span>
                      <button class="step-btn" (click)="updateQty(item, 1)">+</button>
                    </div>
                  } @else {
                    <button class="btn-add-item" (click)="addToCart(item)">
                      <span>ADD</span>
                      <app-icon name="plus" [size]="12" />
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Signature Kunafa Special Card -->
      @if (kunafaProduct(); as kunafa) {
        <section class="kunafa-banner-card" (click)="openDishModal(kunafa)">
          <div class="kunafa-content">
            <span class="kunafa-pill">✨ Bidar's Signature Sweet</span>
            <h3 class="kunafa-title">Crispy Turkish Kunafa Jar</h3>
            <p class="kunafa-desc">Loaded with roasted crispy vermicelli, molten creamy filling, and fragrant syrup.</p>
            <div class="kunafa-bottom">
              <span class="kunafa-price">{{ kunafa.price | inr }}</span>
              <button class="btn-kunafa-add" (click)="addToCart(kunafa); $event.stopPropagation()">
                <span>Order Now</span>
                <app-icon name="arrow-right" [size]="14" />
              </button>
            </div>
          </div>
          <div class="kunafa-img-wrap">
            <img [src]="kunafa.imageUrl" alt="Kunafa Jar" class="kunafa-img" />
          </div>
        </section>
      }

      <!-- Trust Badges -->
      <section class="trust-strip">
        <div class="trust-item">
          <app-icon name="shield-check" [size]="18" />
          <span>100% Halal Meat</span>
        </div>
        <div class="trust-item">
          <app-icon name="chef-hat" [size]="18" />
          <span>Freshly Cooked</span>
        </div>
        <div class="trust-item">
          <app-icon name="delivery-scooter" [size]="18" />
          <span>Fast Bidar Delivery</span>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .mobile-home-container {
      padding: 14px 14px 80px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      background: #F9FAFB;
      min-height: calc(100vh - 120px);
    }

    /* Live GPS Location Strip */
    .home-location-strip {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 14px;
      padding: 9px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      cursor: pointer;
    }

    .loc-strip-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
    }

    .loc-pin-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(15, 71, 43, 0.1);
      color: #0F472B;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.pulse {
        animation: locPulse 1.2s infinite;
      }
    }

    @keyframes locPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.12); background: rgba(245, 158, 11, 0.2); color: #D97706; }
    }

    .loc-strip-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .loc-strip-label {
      font-size: 10px;
      color: #6B7280;
      font-weight: 500;
    }

    .loc-strip-title {
      font-size: 13px;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 700;
    }

    .btn-refresh-gps {
      border: none;
      background: #F3F4F6;
      color: #4B5563;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;

      :deep(.spin) {
        animation: spinAnim 1s linear infinite;
      }
    }

    @keyframes spinAnim {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Active order floating alert */
    .active-order-pill {
      background: #0B2F1D;
      border: 1px solid #F59E0B;
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(11, 47, 29, 0.25);
      cursor: pointer;

      .pill-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .motor-badge {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(245, 158, 11, 0.2);
        color: #F59E0B;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pill-title {
        font-size: 12.5px;
        font-weight: 700;
        display: block;
      }

      .pill-status {
        font-size: 11px;
        color: #A7F3D0;
        strong {
          color: #FBBF24;
        }
      }

      .pill-right {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 700;
        color: #FBBF24;
      }
    }

    /* Promo Hero Card */
    .hero-promo-card {
      background: linear-gradient(135deg, #0F472B 0%, #17653D 100%);
      border-radius: 20px;
      padding: 18px 16px;
      color: #FFFFFF;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(15, 71, 43, 0.25);

      &::after {
        content: '';
        position: absolute;
        top: -30px;
        right: -30px;
        width: 140px;
        height: 140px;
        border-radius: 50%;
        background: rgba(245, 158, 11, 0.12);
        pointer-events: none;
      }
    }

    .promo-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.4);
      padding: 3px 10px;
      border-radius: 100px;
      color: #FDE68A;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .promo-heading {
      font-size: 20px;
      font-weight: 800;
      margin: 0 0 4px;
      color: #FFFFFF;
      letter-spacing: -0.3px;
    }

    .promo-sub {
      font-size: 12px;
      color: #D1FAE5;
      margin: 0 0 16px;
      opacity: 0.9;
    }

    .promo-cta-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-primary-order {
      background: #F59E0B;
      color: #0F472B;
      border: none;
      border-radius: 12px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);

      &:active {
        transform: scale(0.96);
      }
    }

    .promo-perk {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11.5px;
      color: #A7F3D0;
      font-weight: 600;
    }

    /* Section Titles */
    .section-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .flame-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: #FEE2E2;
      color: #DC2626;
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 8px;
    }

    .see-all-btn {
      background: none;
      border: none;
      color: #0F472B;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    /* Category Circles */
    .categories-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 4px 2px 8px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .category-circle-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      border: none;
      background: none;
      cursor: pointer;
      flex-shrink: 0;

      .cat-circle {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
        transition: transform 0.15s ease;
      }

      .cat-emoji {
        font-size: 24px;
      }

      .cat-name {
        font-size: 11px;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
      }

      &:active .cat-circle {
        transform: scale(0.92);
      }
    }

    /* Popular Delicacies Grid */
    .picks-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .app-dish-card {
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #E5E7EB;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      cursor: pointer;
      position: relative;
    }

    .dish-thumb-wrap {
      position: relative;
      width: 100%;
      height: 115px;
      background: #F3F4F6;

      .dish-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .diet-dot-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      width: 14px;
      height: 14px;
      background: #FFFFFF;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);

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

    .item-tag-pill {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(15, 71, 43, 0.9);
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .dish-details {
      padding: 10px;
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-between;
    }

    .dish-name {
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 6px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .price-rating-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .dish-price {
      font-size: 13.5px;
      font-weight: 800;
      color: #0F472B;
    }

    .rating-badge {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 10.5px;
      font-weight: 700;
      color: #D97706;
    }

    .dish-action-row {
      width: 100%;
    }

    .btn-add-item {
      width: 100%;
      height: 32px;
      border: 1.5px solid #0F472B;
      background: #F0FDF4;
      color: #0F472B;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:active {
        background: #0F472B;
        color: #FFFFFF;
      }
    }

    .stepper-wrap {
      width: 100%;
      height: 32px;
      background: #0F472B;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4px;
      color: #FFFFFF;

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

    /* Kunafa Banner */
    .kunafa-banner-card {
      background: linear-gradient(135deg, #1C1917 0%, #292524 100%);
      border: 1px solid #F59E0B;
      border-radius: 18px;
      padding: 14px;
      display: flex;
      gap: 12px;
      align-items: center;
      color: #FFFFFF;
      cursor: pointer;
    }

    .kunafa-content {
      flex: 1;
    }

    .kunafa-pill {
      font-size: 10px;
      font-weight: 700;
      color: #FBBF24;
      display: block;
      margin-bottom: 4px;
    }

    .kunafa-title {
      font-size: 15px;
      font-weight: 800;
      margin: 0 0 4px;
      color: #FFFFFF;
    }

    .kunafa-desc {
      font-size: 11px;
      color: #D6D3D1;
      margin: 0 0 10px;
      line-height: 1.3;
    }

    .kunafa-bottom {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .kunafa-price {
      font-size: 14px;
      font-weight: 800;
      color: #FBBF24;
    }

    .btn-kunafa-add {
      background: #F59E0B;
      color: #1C1917;
      border: none;
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }

    .kunafa-img-wrap {
      width: 80px;
      height: 80px;
      border-radius: 14px;
      overflow: hidden;
      flex-shrink: 0;

      .kunafa-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    /* Trust Strip */
    .trust-strip {
      display: flex;
      justify-content: space-around;
      background: #FFFFFF;
      padding: 12px 8px;
      border-radius: 12px;
      border: 1px solid #E5E7EB;

      .trust-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: #0F472B;
        font-size: 10.5px;
        font-weight: 700;
        text-align: center;
      }
    }
  `]
})
export class MobileHomeComponent {
  platformService = inject(PlatformService);
  private menuService = inject(MenuService);
  private cartService = inject(CartService);

  featuredItems = this.menuService.featuredItems;
  kunafaProduct = this.menuService.kunafaProduct;
  activeOrder = this.platformService.customerActiveOrder;

  readonly quickCategories = [
    { id: 'all' as FoodCategory, label: 'All Items', emoji: '🍽️', bg: '#FEF3C7' },
    { id: 'non-veg' as FoodCategory, label: 'Rolls & Meat', emoji: '🍗', bg: '#FEE2E2' },
    { id: 'veg' as FoodCategory, label: 'Pure Veg', emoji: '🥗', bg: '#DCFCE7' },
    { id: 'sweets' as FoodCategory, label: 'Kunafa & Sweets', emoji: '🍯', bg: '#FFEDD5' },
    { id: 'juices' as FoodCategory, label: 'Cold Shakes', emoji: '🥤', bg: '#E0E7FF' },
    { id: 'south-indian' as FoodCategory, label: 'South Indian', emoji: '🥞', bg: '#F3E8FF' }
  ];

  goToMenu(catId: FoodCategory): void {
    this.menuService.selectedCategory.set(catId);
    this.platformService.setTab('menu');
  }

  openDishModal(item: MenuItem): void {
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'new': return 'Order Placed';
      case 'preparing': return 'Cooking in Kitchen 👨‍🍳';
      case 'out_for_delivery': return 'Out for Delivery 🚴';
      case 'delivered': return 'Delivered ✅';
      default: return 'In Process';
    }
  }
}

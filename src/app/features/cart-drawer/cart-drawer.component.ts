import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, InrPipe, IconComponent],
  template: `
    @if (cartService.isCartDrawerOpen()) {
      <div class="drawer-backdrop" (click)="cartService.closeCartDrawer()"></div>

      <div class="cart-drawer-panel" role="dialog" aria-modal="true" aria-label="Your Shopping Cart">
        <!-- Header -->
        <div class="cart-drawer-header">
          <div class="cart-header-title">
            <svg class="header-bag-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F472B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <h3>Your Order</h3>
            <span class="items-badge">{{ cartService.totalItemCount() }} items</span>
          </div>

          <div class="header-right-btns">
            @if (!cartService.isCartEmpty()) {
              <button class="btn-clear-cart" (click)="cartService.clearCart()" title="Clear all items">
                <app-icon name="trash-2" [size]="16" />
                <span>Clear</span>
              </button>
              <span class="header-divider" aria-hidden="true">|</span>
            }
            <button class="btn-close" (click)="cartService.closeCartDrawer()" aria-label="Close cart">
              <app-icon name="x" [size]="20" />
            </button>
          </div>
        </div>

        <!-- Store Status Strip -->
        <div class="cart-status-strip" [ngClass]="status().isOpen ? 'open' : 'closed'">
          <div class="status-left">
            <span class="status-dot"></span>
            <span class="status-text">{{ status().isOpen ? 'Kitchen is Open Now' : 'Currently Closed' }}</span>
          </div>
          <div class="status-right-icon">
            <app-icon name="chef-hat" [size]="22" />
          </div>
        </div>

        <!-- Body: Empty State or Cart Items -->
        <div class="cart-drawer-body">
          @if (cartService.isCartEmpty()) {
            <!-- Reference Matching Empty Cart View -->
            <div class="empty-cart-view">
              <div class="decor-branch" aria-hidden="true">
                <svg viewBox="0 0 80 100" fill="none" stroke="#D1C7B7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 90C28 65 42 42 70 12"/>
                  <path d="M32 62C22 54 22 40 32 35C42 40 42 54 32 62Z"/>
                  <path d="M46 44C56 34 66 38 70 48C62 54 52 50 46 44Z"/>
                  <path d="M22 76C12 70 12 58 20 54C28 58 28 70 22 76Z"/>
                </svg>
              </div>

              <div class="decor-cloche" aria-hidden="true">
                <svg viewBox="0 0 100 80" fill="none" stroke="#D1C7B7" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="50" cy="14" r="4.5"/>
                  <path d="M15 55C18 32 32 20 50 20C68 20 82 32 85 55Z"/>
                  <path d="M10 55H90"/>
                  <path d="M14 60H86"/>
                </svg>
              </div>

              <div class="bag-illustration-wrap">
                <div class="blob-backdrop" aria-hidden="true"></div>
                <div class="bag-sparks" aria-hidden="true">
                  <svg viewBox="0 0 40 32" fill="none">
                    <path d="M8 24L2 18" stroke="#E5A00D" stroke-width="3.5" stroke-linecap="round"/>
                    <path d="M18 14L15 4" stroke="#E5A00D" stroke-width="3.5" stroke-linecap="round"/>
                    <path d="M30 18L36 10" stroke="#E5A00D" stroke-width="3.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="bag-svg-box">
                  <svg width="92" height="92" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 38L18 84C17.5 87 20 90 23 90H77C80 90 82.5 87 82 84L76 38H24Z" fill="#FFFFFF" stroke="#0F472B" stroke-width="4.5" stroke-linejoin="round"/>
                    <path d="M33 38L37 25C37.5 23.5 39 22.5 41 22.5H59C61 22.5 62.5 23.5 63 25L67 38" stroke="#0F472B" stroke-width="4" stroke-linecap="round"/>
                    <path d="M37 54C37 66 63 66 63 54" stroke="#0F472B" stroke-width="4" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

              <h4 class="empty-title">
                Your cart is
                <span class="title-accent-wrap">
                  empty
                  <svg class="gold-swoosh" viewBox="0 0 90 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M2 8C24 2 66 2 88 6" stroke="#E5A00D" stroke-width="3.5" stroke-linecap="round"/>
                  </svg>
                </span>
              </h4>

              <p class="empty-desc">
                Looks like you haven’t added any delicious food yet. Explore the menu to pick your favorites!
              </p>

              <button class="btn-explore-menu" (click)="browseMenu()">
                <app-icon name="utensils" [size]="18" class="btn-icon" />
                <span>Explore Menu</span>
                <span class="btn-arrow">→</span>
              </button>
            </div>
          } @else {
            <!-- Reference Matching Filled Cart Items View -->
            <div class="cart-items-list">
              @for (item of cartService.items(); track item.menuItem.id) {
                <div class="cart-item-card">
                  <img
                    [src]="item.menuItem.imageUrl"
                    [alt]="item.menuItem.name"
                    class="item-thumb"
                  />

                  <div class="item-info">
                    <div class="item-name-row">
                      <span class="diet-indicator" [ngClass]="item.menuItem.dietType"></span>
                      <h5 class="item-name">{{ item.menuItem.name }}</h5>
                    </div>
                    <span class="item-unit-price">{{ item.menuItem.price | inr }} each</span>

                    <!-- Quantity controls -->
                    <div class="qty-pill">
                      <button
                        class="qty-btn"
                        (click)="cartService.decreaseItem(item.menuItem.id)"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span class="qty-val">{{ item.quantity }}</span>
                      <button
                        class="qty-btn"
                        (click)="cartService.addItem(item.menuItem, 1)"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div class="item-card-right">
                    <button
                      class="btn-remove-item"
                      (click)="cartService.removeItem(item.menuItem.id)"
                      title="Remove item"
                    >
                      <app-icon name="trash-2" [size]="16" />
                    </button>

                    <div class="item-total-badge">
                      {{ (item.menuItem.price * item.quantity) | inr }}
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Reference Matching Bill Details Card -->
            <div class="bill-summary-card">
              <div class="bill-header-row">
                <svg class="bill-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
                  <path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/>
                </svg>
                <h5 class="bill-heading">BILL DETAILS</h5>
                <span class="gold-dash" aria-hidden="true"></span>
              </div>

              <div class="bill-row">
                <span class="bill-label">Item Subtotal</span>
                <span class="bill-value">{{ calculation().subtotal | inr }}</span>
              </div>

              <!-- Delivery Charge Logic -->
              <div class="bill-row delivery-row">
                <span class="bill-label">Delivery Charge</span>
                <div class="delivery-value-wrap">
                  @if (calculation().deliveryCharge !== null) {
                    <span class="bill-value">{{ calculation().deliveryCharge | inr }}</span>
                  } @else {
                    <span class="pill-awaiting">Awaiting Confirmation</span>
                  }
                </div>
              </div>

              <!-- Information Note Box -->
              <div class="delivery-info-box">
                <app-icon name="info" [size]="15" class="info-icon" />
                <p>Pre-midnight delivery charge will be confirmed by the restaurant upon order confirmation.</p>
              </div>

              <div class="bill-divider"></div>

              <div class="grand-total-row">
                <div class="total-text-wrap">
                  <span class="grand-label">Total Amount</span>
                  <span class="delivery-subtext">+ delivery confirmed on WhatsApp</span>
                </div>
                <div class="grand-total-pill">
                  {{ calculation().total | inr }}
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Footer / Checkout Button (when items are in cart) -->
        @if (!cartService.isCartEmpty()) {
          <div class="cart-drawer-footer">
            @if (!status().isOpen) {
              <div class="closed-warning">
                <app-icon name="alert-circle" [size]="16" />
                <span>Ordering is disabled outside operating hours (10:00 AM – 1:00 AM).</span>
              </div>
            }

            <button
              class="btn-proceed-checkout"
              [disabled]="!status().isOpen"
              (click)="proceedToCheckout()"
            >
              <div class="btn-left">
                <app-icon name="utensils" [size]="18" />
                <span>Proceed to Checkout</span>
              </div>
              <div class="btn-total-pill">
                <span>{{ calculation().total | inr }}</span>
                <span class="btn-arrow">→</span>
              </div>
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(4px);
      z-index: 1000;
    }

    .cart-drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 440px;
      max-width: 95vw;
      background-color: #FFFFFF;
      border-left: 1px solid #ECE7DF;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      box-shadow: -10px 0 35px rgba(0, 0, 0, 0.15);
      animation: slideDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    @keyframes slideDrawer {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    /* Header */
    .cart-drawer-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #F0ECE4;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #FFFFFF;
    }

    .cart-header-title {
      display: flex;
      align-items: center;
      gap: 10px;

      h3 {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 850;
        color: #0F472B;
        letter-spacing: -0.01em;
      }
    }

    .items-badge {
      font-family: var(--font-heading);
      font-size: 12px;
      font-weight: 750;
      padding: 3px 10px;
      border-radius: 9999px;
      background: #EAF7EC;
      color: #0F472B;
    }

    .header-right-btns {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-clear-cart {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 6px;
      transition: color var(--transition-fast);

      &:hover {
        color: #EF4444;
      }
    }

    .header-divider {
      color: #E5E7EB;
      font-weight: 300;
    }

    .btn-close {
      color: #111827;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: #F3F4F6;
      }
    }

    /* Store Status Notice */
    .cart-status-strip {
      padding: 8px 16px;
      margin: 12px 1.25rem 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      background-color: #EAF7EC;
      border: 1px solid #D1FAE5;
      border-radius: 9999px;

      .status-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #16A34A;
        box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
      }

      .status-text {
        font-family: var(--font-heading);
        font-size: 13.5px;
        font-weight: 750;
        color: #0F472B;
      }

      .status-right-icon {
        color: #0F472B;
        display: flex;
        align-items: center;
      }

      &.closed {
        background-color: #FEF2F2;
        border-color: #FEE2E2;

        .status-dot {
          background-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }

        .status-text, .status-right-icon {
          color: #DC2626;
        }
      }
    }

    /* Body */
    .cart-drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Reference Empty State View */
    .empty-cart-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin: auto 0;
      padding: 2.5rem 1rem 3.5rem;
      position: relative;
      width: 100%;
    }

    .decor-branch {
      position: absolute;
      top: 15%;
      left: 10px;
      width: 55px;
      height: 70px;
      pointer-events: none;
      opacity: 0.8;
      z-index: 1;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .decor-cloche {
      position: absolute;
      top: 8%;
      right: 18px;
      width: 70px;
      height: 55px;
      pointer-events: none;
      opacity: 0.8;
      z-index: 1;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .bag-illustration-wrap {
      position: relative;
      width: 130px;
      height: 115px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      z-index: 2;
    }

    .blob-backdrop {
      position: absolute;
      width: 130px;
      height: 100px;
      background: #E8F5E9;
      border-radius: 55% 45% 65% 35% / 45% 55% 45% 55%;
      z-index: 1;
    }

    .bag-sparks {
      position: absolute;
      top: -14px;
      right: 10px;
      width: 36px;
      height: 30px;
      z-index: 3;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .bag-svg-box {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-title {
      font-family: var(--font-heading);
      font-size: 26px;
      font-weight: 850;
      color: #0F472B;
      letter-spacing: -0.02em;
      margin-top: 14px;
      margin-bottom: 8px;
      z-index: 2;
    }

    .title-accent-wrap {
      position: relative;
      display: inline-block;
    }

    .gold-swoosh {
      position: absolute;
      bottom: -7px;
      left: 0;
      width: 100%;
      height: 12px;
      pointer-events: none;
    }

    .empty-desc {
      font-size: 14px;
      color: #4B5563;
      margin-bottom: 1.75rem;
      max-width: 320px;
      line-height: 1.5;
      font-weight: 450;
      z-index: 2;
    }

    .btn-explore-menu {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background-color: #0F472B;
      color: #FFFFFF;
      padding: 12px 30px;
      border-radius: 9999px;
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 750;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 0 #E5A00D, 0 8px 18px rgba(15, 71, 43, 0.25);
      transition: all var(--transition-fast);
      z-index: 2;

      .btn-arrow {
        font-size: 16px;
        transition: transform var(--transition-fast);
      }

      &:hover {
        background-color: #0A3520;
        transform: translateY(-2px);
        box-shadow: 0 6px 0 #E5A00D, 0 10px 22px rgba(15, 71, 43, 0.35);

        .btn-arrow {
          transform: translateX(3px);
        }
      }
    }

    /* Cart Items List */
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }

    .cart-item-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #FFFFFF;
      border: 1.5px solid #F0ECE4;
      border-radius: 16px;
      padding: 12px 14px;
      position: relative;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      transition: border-color var(--transition-fast);

      &:hover {
        border-color: #D1D5DB;
      }
    }

    .item-thumb {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .item-name-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .item-name {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 850;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.25;
    }

    .item-unit-price {
      font-size: 12.5px;
      font-weight: 600;
      color: #4B5563;
      margin: 2px 0 6px;
    }

    .qty-pill {
      display: inline-flex;
      align-items: center;
      background-color: #FAF7F2;
      border: 1.5px solid #E5E7EB;
      border-radius: 8px;
      padding: 2px 8px;
      gap: 12px;
      align-self: flex-start;
    }

    .qty-btn {
      color: #111827;
      font-size: 16px;
      font-weight: 700;
      border: none;
      background: transparent;
      cursor: pointer;
      line-height: 1;
      padding: 0 2px;
      transition: color var(--transition-fast);

      &:hover {
        color: #0F472B;
      }
    }

    .qty-val {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 850;
      min-width: 14px;
      text-align: center;
      color: #111827;
    }

    .item-card-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: space-between;
      height: 64px;
      flex-shrink: 0;
    }

    .btn-remove-item {
      color: #9CA3AF;
      padding: 2px;
      cursor: pointer;
      transition: color var(--transition-fast);

      &:hover {
        color: #EF4444;
      }
    }

    .item-total-badge {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 850;
      color: #111827;
      background-color: #FEF3C7;
      padding: 4px 10px;
      border-radius: 8px;
    }

    /* Bill Summary Card */
    .bill-summary-card {
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 16px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      margin-top: 14px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .bill-header-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 14px;
    }

    .bill-icon {
      color: #0F472B;
      flex-shrink: 0;
    }

    .bill-heading {
      font-family: var(--font-heading);
      font-size: 13.5px;
      font-weight: 850;
      color: #0F472B;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0;
    }

    .gold-dash {
      display: inline-block;
      width: 32px;
      height: 3px;
      background-color: #E5A00D;
      border-radius: 2px;
      margin-left: 6px;
    }

    .bill-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .bill-label {
      color: #374151;
      font-weight: 600;
    }

    .bill-value {
      font-family: var(--font-heading);
      font-weight: 850;
      color: #111827;
      font-size: 15.5px;
    }

    .pill-awaiting {
      background: #FEF3C7;
      color: #854D0E;
      font-size: 11.5px;
      font-style: italic;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
    }

    .delivery-info-box {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #FAF7F2;
      border: 1px solid #EFEAE4;
      border-radius: 10px;
      padding: 10px 12px;
      margin: 6px 0 12px;
      font-size: 12px;
      color: #4B5563;
      line-height: 1.45;

      .info-icon {
        color: #0F472B;
        margin-top: 2px;
        flex-shrink: 0;
      }
    }

    .bill-divider {
      height: 1px;
      background-color: #E5E7EB;
      margin: 10px 0 14px;
    }

    .grand-total-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .total-text-wrap {
      display: flex;
      flex-direction: column;
    }

    .grand-label {
      font-family: var(--font-heading);
      color: #111827;
      font-size: 16px;
      font-weight: 850;
    }

    .delivery-subtext {
      font-size: 11.5px;
      color: #6B7280;
      font-weight: 500;
      margin-top: 2px;
    }

    .grand-total-pill {
      font-family: var(--font-heading);
      font-size: 19px;
      font-weight: 850;
      color: #111827;
      background-color: #FFC82C;
      padding: 5px 16px;
      border-radius: 9999px;
    }

    /* Checkout Footer (When items exist) */
    .cart-drawer-footer {
      padding: 1.25rem 1.5rem;
      background-color: #FFFFFF;
      border-top: 1px solid #ECE7DF;
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
      z-index: 3;
    }

    .closed-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #DC2626;
      background: #FEF2F2;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid #FEE2E2;
    }

    .btn-proceed-checkout {
      width: 100%;
      padding: 6px 8px 6px 20px;
      border-radius: 9999px;
      background-color: #0F472B;
      color: #FFFFFF;
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 0 #E5A00D, 0 8px 18px rgba(15, 71, 43, 0.25);
      cursor: pointer;
      transition: all var(--transition-fast);

      .btn-left {
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: var(--font-heading);
        font-size: 15px;
        font-weight: 800;
        color: #FFFFFF;
      }

      .btn-total-pill {
        background-color: #FFC82C;
        color: #111827;
        font-family: var(--font-heading);
        font-size: 14.5px;
        font-weight: 850;
        padding: 8px 16px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        gap: 6px;

        .btn-arrow {
          font-size: 15px;
          transition: transform var(--transition-fast);
        }
      }

      &:hover:not(:disabled) {
        background-color: #0A3520;
        transform: translateY(-2px);
        box-shadow: 0 6px 0 #E5A00D, 0 10px 22px rgba(15, 71, 43, 0.35);

        .btn-arrow {
          transform: translateX(3px);
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `]
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  private statusService = inject(BusinessStatusService);

  status = this.statusService.status;
  calculation = this.cartService.calculation;

  browseMenu(): void {
    this.cartService.closeCartDrawer();
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  proceedToCheckout(): void {
    this.cartService.openCheckout();
  }
}

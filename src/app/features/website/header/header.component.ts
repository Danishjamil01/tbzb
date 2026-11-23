import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { BusinessStatusService } from '../../../core/services/business-status.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header class="header">
      <div class="container header-container">
        <!-- Brand Logo -->
        <a href="#home" class="brand-logo" (click)="closeMobileMenu()">
          <div class="brand-badge">TBZB</div>
          <div class="brand-text">
            <span class="brand-name">THE BITE ZONE</span>
            <span class="brand-sub">BIDAR • CLOUD KITCHEN</span>
          </div>
        </a>

        <!-- Desktop Navigation with Divider -->
        <div class="desktop-nav-wrap">
          <div class="brand-separator"></div>
          <nav class="desktop-nav">
            <a href="#home" class="nav-link active">Home</a>
            <a href="#menu" class="nav-link">Menu</a>
            <a href="#featured" class="nav-link">Popular</a>
            <a href="#kunafa" class="nav-link special-pill">
              <app-icon name="star-outline" [size]="14" />
              <span>Kunafa Jar</span>
            </a>
            <a href="#about" class="nav-link">About</a>
            <a href="#contact" class="nav-link">Contact</a>
          </nav>
        </div>

        <!-- Right Actions -->
        <div class="header-actions">
          <!-- Business Status Pill -->
          <div
            class="badge-status-pill clickable"
            [ngClass]="status().isOpen ? 'open' : 'closed'"
            (click)="openHoursModal.emit()"
            role="button"
            tabindex="0"
            [title]="'Click to view full kitchen hours & late-night delivery rates'"
          >
            <span class="dot"></span>
            <span class="status-label">
              <span class="label-desktop">{{ status().isOpen ? 'Open Now' : 'Closed' }}</span>
              <span class="label-mobile">{{ status().isOpen ? 'Open' : 'Closed' }}</span>
            </span>
          </div>

          <!-- Cart Trigger Button -->
          <button
            class="cart-button"
            (click)="cartService.openCartDrawer()"
            aria-label="View shopping cart"
          >
            <app-icon name="shopping-cart" [size]="18" />
            <span class="cart-label">Cart</span>
            <span class="cart-badge">{{ cartService.totalItemCount() > 0 ? cartService.totalItemCount() : 0 }}</span>
          </button>

          <!-- Order Now CTA (desktop) -->
          <a href="#menu" class="btn-order-now desktop-cta">
            <app-icon name="delivery-scooter" [size]="18" />
            <span>Order Now</span>
          </a>

          <!-- Mobile Menu Toggle -->
          <button
            class="btn-icon mobile-menu-btn"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-label="Toggle navigation menu"
          >
            <app-icon [name]="mobileMenuOpen() ? 'x' : 'menu'" [size]="22" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      @if (mobileMenuOpen()) {
        <div class="mobile-drawer-backdrop" (click)="closeMobileMenu()"></div>
        <div class="mobile-drawer">
          <div class="mobile-drawer-header">
            <div class="brand-logo">
              <div class="brand-badge">TBZB</div>
              <div class="brand-text">
                <span class="brand-name">THE BITE ZONE</span>
                <span class="brand-sub">BIDAR</span>
              </div>
            </div>
            <button class="btn-icon close-btn" (click)="closeMobileMenu()" aria-label="Close menu">
              <app-icon name="x" [size]="20" />
            </button>
          </div>

          <div class="mobile-drawer-body">
            <div class="mobile-status-banner clickable" [ngClass]="status().isOpen ? 'open' : 'closed'" (click)="openHoursModal.emit(); closeMobileMenu()">
              <span class="dot"></span>
              <div>
                <strong>{{ status().isOpen ? 'Kitchen is Open Now' : 'Currently Closed' }}</strong>
                <p>Hours: 10:00 AM – 1:00 AM (Tap for schedule & rates)</p>
              </div>
            </div>

            <nav class="mobile-nav-links">
              <a href="#home" class="mobile-nav-item" (click)="closeMobileMenu()">
                Home
              </a>
              <a href="#menu" class="mobile-nav-item" (click)="closeMobileMenu()">
                Full Menu
              </a>
              <a href="#featured" class="mobile-nav-item" (click)="closeMobileMenu()">
                Popular Delicacies
              </a>
              <a href="#kunafa" class="mobile-nav-item highlight" (click)="closeMobileMenu()">
                <app-icon name="star-outline" [size]="16" />
                Kunafa Jar Special
              </a>
              <a href="#about" class="mobile-nav-item" (click)="closeMobileMenu()">
                About TBZB
              </a>
              <a href="#contact" class="mobile-nav-item" (click)="closeMobileMenu()">
                Contact & Delivery Info
              </a>
            </nav>

            <div class="mobile-drawer-footer">
              <a
                [href]="'https://wa.me/' + config.contact.whatsappNumber"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary-mobile full-width"
              >
                <app-icon name="whatsapp" [size]="18" />
                Direct WhatsApp Contact
              </a>
              <div class="mobile-contact-line">
                <app-icon name="phone" [size]="14" />
                <span>Call: {{ config.contact.phoneFormatted }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      width: 100%;
    }

    .header {
      width: 100%;
      height: var(--header-height);
      background-color: #FAF7F2;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
    }

    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    /* Brand Logo */
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
      transition: opacity var(--transition-fast);

      &:hover {
        opacity: 0.9;
      }
    }

    .brand-badge {
      background: #FFC82C;
      color: #111827;
      font-family: var(--font-heading);
      font-weight: 850;
      font-size: 13.5px;
      letter-spacing: 0.5px;
      padding: 5px 9px;
      border-radius: 7px;
      line-height: 1;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 850;
      letter-spacing: 0.03em;
      color: #111827;
      line-height: 1.15;
    }

    .brand-sub {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #6B7280;
      text-transform: uppercase;
    }

    /* Desktop Navigation Wrap */
    .desktop-nav-wrap {
      display: none;
      align-items: center;

      @media (min-width: 900px) {
        display: flex;
      }
    }

    .brand-separator {
      width: 1px;
      height: 24px;
      background-color: #E5E7EB;
      margin: 0 1.25rem 0 0.5rem;
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .nav-link {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      text-decoration: none;
      transition: color var(--transition-fast);
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 2px;

      &:hover {
        color: #0F472B;
      }

      &.active {
        color: #0F472B;
        font-weight: 700;

        &::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: #0F472B;
          border-radius: 9999px;
        }
      }

      &.special-pill {
        background: #FEF9E7;
        border: 1px solid #FDE68A;
        color: #1F2937;
        border-radius: 9999px;
        padding: 5px 13px;
        font-size: 13px;
        font-weight: 650;
        gap: 5px;

        &:hover {
          background: #FDF3C7;
          border-color: #FCD34D;
        }
      }
    }

    /* Header Actions */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .badge-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 9999px;
      font-family: var(--font-heading);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      background: #FFFFFF;
      transition: all var(--transition-fast);

      .label-desktop {
        display: none;
        @media (min-width: 640px) {
          display: inline;
        }
      }

      .label-mobile {
        display: inline;
        @media (min-width: 640px) {
          display: none;
        }
      }

      &.open {
        background: #EAF7EE;
        border: 1px solid #B9E6C9;
        color: #15803D;

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16A34A;
          box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25);
        }
      }

      &.closed {
        background: #FEF2F2;
        border: 1px solid #FECACA;
        color: #DC2626;

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #DC2626;
          box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.25);
        }
      }

      &:hover {
        background: #F9FAFB;
      }
    }

    .cart-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #FFFFFF;
      color: #1F2937;
      border: 1.5px solid #E5E7EB;
      border-radius: 9999px;
      width: 38px;
      height: 38px;
      padding: 0;
      font-family: var(--font-heading);
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all var(--transition-fast);

      @media (min-width: 640px) {
        width: auto;
        height: auto;
        padding: 7px 15px;
        gap: 8px;
      }

      &:hover {
        border-color: #D1D5DB;
        background-color: #F9FAFB;
      }
    }

    .cart-label {
      display: none;
      @media (min-width: 640px) {
        display: inline;
      }
    }

    .cart-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: #DC2626;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      min-width: 18px;
      height: 18px;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.35);
      border: 2px solid #FFFFFF;
    }

    .btn-order-now {
      display: none;
      align-items: center;
      gap: 8px;
      background-color: #0F472B;
      color: #FFFFFF;
      border: none;
      border-radius: 9999px;
      padding: 9px 20px;
      font-family: var(--font-heading);
      font-size: 13.5px;
      font-weight: 650;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(15, 71, 43, 0.25);
      transition: all var(--transition-fast);

      @media (min-width: 1024px) {
        display: inline-flex;
      }

      &:hover {
        background-color: #0A3520;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(15, 71, 43, 0.35);
      }
    }

    .mobile-menu-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #1F2937;
      padding: 4px;
      cursor: pointer;

      @media (min-width: 900px) {
        display: none;
      }
    }

    /* Mobile Drawer */
    .mobile-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
    }

    .mobile-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 300px;
      max-width: 85vw;
      background-color: #FFFFFF;
      border-left: 1px solid #E5E7EB;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      animation: slideDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideDrawer {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .mobile-drawer-header {
      padding: 1.25rem;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .close-btn {
      color: #4B5563;
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        background: #F3F4F6;
      }
    }

    .mobile-drawer-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      flex: 1;
      overflow-y: auto;
    }

    .mobile-status-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;

      strong {
        display: block;
        margin-bottom: 2px;
        color: #111827;
      }

      p {
        font-size: 11px;
        color: #6B7280;
      }

      &.open {
        background: rgba(34, 197, 94, 0.08);
        border: 1px solid rgba(34, 197, 94, 0.2);
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #16A34A;
          margin-top: 4px;
        }
      }

      &.closed {
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #EF4444;
          margin-top: 4px;
        }
      }
    }

    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .mobile-nav-item {
      padding: 10px 12px;
      border-radius: 6px;
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
      color: #374151;
      text-decoration: none;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      gap: 10px;

      &:hover {
        background: #F3F4F6;
        color: #0F472B;
      }

      &.highlight {
        color: #0F472B;
        background: #FEF9E7;
      }
    }

    .mobile-drawer-footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn-primary-mobile {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #0F472B;
      color: #FFFFFF;
      padding: 12px;
      border-radius: 8px;
      font-weight: 650;
      text-decoration: none;
      font-size: 14px;
    }

    .full-width {
      width: 100%;
    }

    .mobile-contact-line {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 12px;
      color: #6B7280;
    }
  `]
})
export class HeaderComponent {
  @Output() openHoursModal = new EventEmitter<void>();

  cartService = inject(CartService);
  private statusService = inject(BusinessStatusService);

  status = this.statusService.status;
  config = this.statusService.config;
  mobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}

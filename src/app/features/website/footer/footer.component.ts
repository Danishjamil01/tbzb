import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessStatusService } from '../../../core/services/business-status.service';
import { AdminService } from '../../../core/services/admin.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <footer class="footer">
      <div class="container footer-container">
        <!-- Column 1: Brand Info -->
        <div class="footer-col brand-col">
          <div class="footer-brand">
            <span class="brand-badge">TBZB</span>
            <div class="brand-text">
              <span class="brand-name">THE BITE ZONE</span>
              <div class="brand-sub-row">
                <span class="brand-dash"></span>
                <span class="brand-sub">BIDAR</span>
                <span class="brand-dash"></span>
              </div>
            </div>
          </div>

          <div class="footer-tagline-pill">
            <span>“Good Food... Good Mood...”</span>
          </div>

          <p class="footer-desc">
            Premium cloud kitchen delivering delicious rolls, biryani, starters, dosa, desserts and shakes straight to your doorstep across Bidar.
          </p>

          <div class="footer-socials">
            <a
              [href]="'https://wa.me/' + config.contact.whatsappNumber"
              target="_blank"
              rel="noopener noreferrer"
              class="social-btn whatsapp"
              aria-label="TBZB on WhatsApp"
            >
              <app-icon name="whatsapp" [size]="18" />
            </a>
            <a
              [href]="config.contact.instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="social-btn instagram"
              aria-label="TBZB on Instagram"
            >
              <app-icon name="instagram" [size]="18" />
            </a>
            <a
              [href]="'tel:' + config.contact.phone"
              class="social-btn phone"
              aria-label="Call TBZB"
            >
              <app-icon name="phone" [size]="18" />
            </a>
          </div>
        </div>

        <!-- Column 2: Quick Links -->
        <div class="footer-col">
          <div class="col-header">
            <h4 class="col-title">QUICK LINKS</h4>
            <span class="gold-dash" aria-hidden="true"></span>
          </div>
          <ul class="footer-links">
            <li>
              <a href="#home">
                <svg class="link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Home</span>
              </a>
            </li>
            <li>
              <a href="#menu">
                <app-icon name="utensils" [size]="16" class="link-icon" />
                <span>Complete Menu (42 Items)</span>
              </a>
            </li>
            <li>
              <a href="#featured">
                <app-icon name="star-outline" [size]="16" class="link-icon" />
                <span>Popular Delicacies</span>
              </a>
            </li>
            <li>
              <a href="#kunafa">
                <svg class="link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                </svg>
                <span>Signature Kunafa Jar</span>
              </a>
            </li>
            <li>
              <a href="#about">
                <app-icon name="info" [size]="16" class="link-icon" />
                <span>About Our Kitchen</span>
              </a>
            </li>
            <li>
              <a href="#contact">
                <svg class="link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <span>Contact & Delivery</span>
              </a>
            </li>
            <li>
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                <app-icon name="shield-check" [size]="16" class="link-icon" />
                <span>Privacy Policy</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 3: Menu Categories -->
        <div class="footer-col">
          <div class="col-header">
            <h4 class="col-title">MENU CATEGORIES</h4>
            <span class="gold-dash" aria-hidden="true"></span>
          </div>
          <ul class="footer-links">
            <li>
              <a href="#menu">
                <app-icon name="drumstick" [size]="16" class="link-icon" />
                <span>Non-Veg Specialities</span>
              </a>
            </li>
            <li>
              <a href="#menu">
                <app-icon name="leaf" [size]="16" class="link-icon" />
                <span>Pure Veg Cravings</span>
              </a>
            </li>
            <li>
              <a href="#menu">
                <svg class="link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <ellipse cx="12" cy="7" rx="9" ry="3"/><path d="M3 7v6c0 1.66 4 3 9 3s9-1.34 9-3V7"/><path d="M3 13v6c0 1.66 4 3 9 3s9-1.34 9-3v-6"/>
                </svg>
                <span>Crispy South Indian Dosas</span>
              </a>
            </li>
            <li>
              <a href="#menu">
                <svg class="link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="8" cy="16" r="3"/><circle cx="16" cy="16" r="3"/><circle cx="12" cy="9" r="3"/>
                </svg>
                <span>Sweets & Mithai</span>
              </a>
            </li>
            <li>
              <a href="#menu">
                <app-icon name="glass-water" [size]="16" class="link-icon" />
                <span>Fresh Juices & Shakes</span>
              </a>
            </li>
            <li>
              <a href="#kunafa">
                <svg class="link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 2a7 7 0 0 0-7 7v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a7 7 0 0 0-7-7Z"/><path d="M3 19h18"/>
                </svg>
                <span>Kunafa Jar (Dessert)</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 4: Operating Hours & Location -->
        <div class="footer-col hours-col">
          <div class="col-header">
            <h4 class="col-title">OPERATING HOURS</h4>
            <span class="gold-dash" aria-hidden="true"></span>
          </div>

          <div class="hours-card">
            <div class="hours-row">
              <div class="days-wrap">
                <svg class="cal-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                <span class="days">Mon – Sun:</span>
              </div>
              <span class="v-divider">|</span>
              <span class="time">10:00 AM – 1:00 AM</span>
            </div>
            <div class="midnight-note">
              <app-icon name="moon" [size]="14" class="moon-icon" />
              <span>Late-night delivery ₹70 after 12:00 AM</span>
            </div>
          </div>

          <div class="footer-loc-info">
            <app-icon name="map-pin" [size]="16" class="loc-icon" />
            <span>Bidar, Karnataka, India</span>
          </div>
        </div>
      </div>

      <!-- Copyright Organic Green Bottom Bar -->
      <div class="footer-bottom-wrap">
        <!-- Waved Transition Layer -->
        <div class="bottom-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 24C320 4 720 34 1120 14C1280 6 1380 18 1440 24V40H0V24Z" fill="#0F472B"/>
            <path d="M0 24C320 4 720 34 1120 14C1280 6 1380 18 1440 24" stroke="#E5A00D" stroke-width="3"/>
          </svg>
        </div>

        <!-- Solid Green Content Bar -->
        <div class="footer-bottom-bar">
          <div class="container bottom-container">
            <p class="copyright-text">
              © {{ currentYear }} The Bite Zone (TBZB) – Bidar. All rights reserved.
            </p>
            <div class="brand-statement-wrap">
              <span class="bottom-divider" aria-hidden="true">|</span>
              <app-icon name="chef-hat" [size]="19" class="chef-icon" />
              <span class="statement-white">Taste the Difference... </span>
              <strong class="statement-gold">Only at TBZB</strong>
            </div>
            <div class="footer-bottom-actions">
              <a href="/privacy-policy" target="_blank" class="footer-privacy-link" title="Privacy Policy">
                Privacy Policy
              </a>
              <button class="footer-admin-btn" (click)="adminService.openAdmin()" title="Owner Kitchen Dashboard">
                <app-icon name="lock" [size]="12" />
                <span>Kitchen Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #FAF7F2;
      padding-top: 2.25rem;
      position: relative;

      @media (min-width: 768px) {
        padding-top: 4rem;
      }
    }

    .footer-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem 1.25rem;
      padding-bottom: 2.25rem;

      .brand-col {
        grid-column: 1 / -1;
      }

      .hours-col {
        grid-column: 1 / -1;
      }

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 2.5rem;
        padding-bottom: 3.5rem;

        .brand-col {
          grid-column: auto;
        }

        .hours-col {
          grid-column: auto;
        }
      }

      @media (min-width: 1024px) {
        grid-template-columns: 1.45fr 1fr 1fr 1.15fr;
        gap: 3rem;
      }
    }

    .footer-col {
      display: flex;
      flex-direction: column;
    }

    /* Brand Column */
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }

    .brand-badge {
      background-color: #FFC82C;
      color: #111827;
      font-family: var(--font-heading);
      font-weight: 850;
      font-size: 15px;
      padding: 6px 10px;
      border-radius: 8px;
      line-height: 1;
      letter-spacing: 0.02em;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: var(--font-heading);
      font-size: 17px;
      font-weight: 850;
      color: #0F472B;
      line-height: 1.15;
      letter-spacing: 0.02em;
    }

    .brand-sub-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }

    .brand-dash {
      height: 1.5px;
      width: 20px;
      background-color: #E5A00D;
      border-radius: 1px;
    }

    .brand-sub {
      font-size: 10.5px;
      font-weight: 800;
      color: #0F472B;
      letter-spacing: 0.12em;
    }

    .footer-tagline-pill {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      background: #FEF3C7;
      color: #0F472B;
      padding: 5px 14px;
      border-radius: 9999px;
      font-family: var(--font-heading);
      font-size: 12.5px;
      font-weight: 750;
      margin: 12px 0 10px;
    }

    .footer-desc {
      font-size: 13.5px;
      color: #4B5563;
      line-height: 1.6;
      max-width: 320px;
      margin-bottom: 1.5rem;
      font-weight: 450;
    }

    .footer-socials {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .social-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);

      &.whatsapp {
        background: #EAF7EC;
        border: 1.5px solid #D1FAE5;
        color: #16A34A;
      }

      &.instagram {
        background: #FDF2F4;
        border: 1.5px solid #FCE7F3;
        color: #E1306C;
      }

      &.phone {
        background: #FEF3C7;
        border: 1.5px solid #FDE68A;
        color: #0F472B;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }

    /* Column Headers */
    .col-header {
      display: flex;
      flex-direction: column;
      margin-bottom: 1.25rem;
    }

    .col-title {
      font-family: var(--font-heading);
      font-size: 13.5px;
      font-weight: 850;
      color: #0F472B;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }

    .gold-dash {
      display: inline-block;
      width: 32px;
      height: 3px;
      background-color: #E5A00D;
      border-radius: 2px;
    }

    /* Links */
    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;

      @media (min-width: 768px) {
        gap: 12px;
      }

      li a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12.5px;
        color: #374151;
        font-weight: 600;
        text-decoration: none;
        transition: all var(--transition-fast);

        @media (min-width: 768px) {
          gap: 10px;
          font-size: 13.5px;
        }

        .link-icon {
          color: #0F472B;
          flex-shrink: 0;
        }

        &:hover {
          color: #0F472B;
          transform: translateX(3px);
        }
      }
    }

    /* Operating Hours Card */
    .hours-card {
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      margin-bottom: 1rem;
    }

    .hours-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 13px;

      .days-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #374151;
        font-weight: 600;

        .cal-icon {
          color: #0F472B;
        }
      }

      .v-divider {
        color: #D1D5DB;
        font-weight: 300;
      }

      .time {
        font-family: var(--font-heading);
        font-weight: 850;
        color: #0F472B;
        font-size: 13.5px;
      }
    }

    .midnight-note {
      display: flex;
      align-items: center;
      gap: 7px;
      background: #FEF3C7;
      border-radius: 8px;
      padding: 6px 10px;
      margin-top: 10px;
      color: #1F2937;
      font-size: 12px;
      font-weight: 600;

      .moon-icon {
        color: #0F472B;
      }
    }

    .footer-loc-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 650;
      color: #374151;
      margin-top: 4px;

      .loc-icon {
        color: #0F472B;
      }
    }

    /* Bottom Organic Green Copyright Bar */
    .footer-bottom-wrap {
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .bottom-wave {
      width: 100%;
      height: 36px;
      margin-bottom: -1px;

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

    .footer-bottom-bar {
      width: 100%;
      background-color: #0F472B;
      padding: 1.5rem 0 1.75rem;
    }

    .bottom-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      text-align: center;

      @media (min-width: 768px) {
        flex-direction: row;
        justify-content: space-between;
      }
    }

    .copyright-text {
      font-size: 13px;
      color: #FFFFFF;
      font-weight: 500;
    }

    .brand-statement-wrap {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;

      .bottom-divider {
        color: rgba(255, 255, 255, 0.3);
        margin: 0 6px;
        display: none;

        @media (min-width: 768px) {
          display: inline;
        }
      }

      .chef-icon {
        color: #FFC82C;
      }

      .statement-white {
        color: #FFFFFF;
        font-weight: 500;
      }

      .statement-gold {
        color: #FFC82C;
        font-weight: 850;
      }
    }

    .footer-bottom-actions {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }

    .footer-privacy-link {
      color: rgba(255, 255, 255, 0.75);
      font-size: 11.5px;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.15s ease;

      &:hover {
        color: #F7D51D;
        text-decoration: underline;
      }
    }

    .footer-admin-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.85);
      font-size: 11.5px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 6px;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.18);
        color: #F7D51D;
        border-color: #F7D51D;
      }
    }
  `]
})
export class FooterComponent {
  adminService = inject(AdminService);
  private statusService = inject(BusinessStatusService);
  config = this.statusService.config;
  currentYear = new Date().getFullYear();
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section id="contact" class="contact-section">
      <!-- Top Left Decorative Leaves Illustration -->
      <div class="decor-leaves" aria-hidden="true">
        <svg viewBox="0 0 110 130" fill="none" stroke="#D1C7B7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 115C35 85 52 55 85 18"/>
          <path d="M42 80C30 70 30 52 42 46C54 52 54 70 42 80Z"/>
          <path d="M58 58C70 46 80 50 86 62C76 70 64 66 58 58Z"/>
          <path d="M30 98C18 90 18 75 28 70C36 75 38 90 30 98Z"/>
          <path d="M72 38C68 24 78 14 88 18C92 28 84 38 72 38Z"/>
        </svg>
      </div>

      <!-- Top Right Decorative Cloche Dome Illustration -->
      <div class="decor-cloche" aria-hidden="true">
        <svg viewBox="0 0 150 110" fill="none" stroke="#D1C7B7" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="75" cy="20" r="6"/>
          <path d="M22 76C25 44 46 28 75 28C104 28 125 44 128 76Z"/>
          <path d="M14 76H136"/>
          <path d="M18 82H132"/>
          <path d="M54 88C64 90 86 90 96 88"/>
        </svg>
      </div>

      <div class="container contact-container">
        <!-- Centered Header -->
        <div class="contact-header">
          <!-- Kicker Pill with Headset Icon -->
          <div class="kicker-pill">
            <svg class="headset-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
            </svg>
            <span class="kicker-text">GET IN TOUCH</span>
          </div>

          <!-- Main Title with Golden Swoosh -->
          <h2 class="contact-title">
            Contact &
            <span class="title-accent-wrap">
              Kitchen Details
              <svg class="gold-swoosh" viewBox="0 0 250 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 10C75 2 185 2 246 8" stroke="#E5A00D" stroke-width="4.5" stroke-linecap="round"/>
              </svg>
            </span>
          </h2>

          <p class="contact-subtitle">
            Have a question about an order or catering? Reach out directly via WhatsApp or phone.
          </p>
        </div>

        <!-- 4-Card Contact Grid -->
        <div class="contact-cards-grid">
          <!-- Card 1: Direct Calling -->
          <div class="contact-card">
            <div class="card-icon-box yellow-pastel">
              <app-icon name="phone" [size]="22" />
            </div>
            <div class="card-info">
              <span class="card-kicker">DIRECT CALLING</span>
              <h3 class="card-value">+91 91643 46048</h3>
              <p class="card-desc">
                Available during kitchen hours<br />(10 AM – 1 AM)
              </p>
            </div>
            <a [href]="'tel:' + config.contact.phone" class="btn-card-outline">
              <div class="btn-left">
                <app-icon name="phone" [size]="16" />
                <span>Call Now</span>
              </div>
              <span class="btn-arrow">→</span>
            </a>
          </div>

          <!-- Card 2: WhatsApp Ordering & Enquiries (Hero Highlight) -->
          <div class="contact-card card-whatsapp-hero">
            <!-- Background Watermark -->
            <div class="whatsapp-watermark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>
              </svg>
            </div>

            <div class="card-icon-box whatsapp-green">
              <app-icon name="whatsapp" [size]="24" />
            </div>
            <div class="card-info">
              <span class="card-kicker">WHATSAPP ORDERING & ENQUIRIES</span>
              <h3 class="card-value">+91 9164346048</h3>
              <p class="card-desc">
                Instant replies for orders,<br />delivery status & menu questions
              </p>
            </div>
            <a
              [href]="'https://wa.me/' + config.contact.whatsappNumber"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-card-gold"
            >
              <div class="btn-left">
                <app-icon name="whatsapp" [size]="18" />
                <span>Chat on WhatsApp</span>
              </div>
              <span class="btn-arrow">→</span>
            </a>
          </div>

          <!-- Card 3: Follow Us -->
          <div class="contact-card">
            <div class="card-icon-box instagram-pastel">
              <app-icon name="instagram" [size]="22" />
            </div>
            <div class="card-info">
              <span class="card-kicker">FOLLOW US</span>
              <h3 class="card-value">{{ config.contact.instagram }}</h3>
              <p class="card-desc">
                Tag us with your food<br />pictures and stories
              </p>
            </div>
            <a
              [href]="config.contact.instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-card-outline"
            >
              <div class="btn-left">
                <app-icon name="instagram" [size]="16" />
                <span>View Profile</span>
              </div>
              <span class="btn-arrow">→</span>
            </a>
          </div>

          <!-- Card 4: Cloud Kitchen Location -->
          <div class="contact-card">
            <div class="card-icon-box yellow-pastel">
              <app-icon name="map-pin" [size]="22" />
            </div>
            <div class="card-info">
              <span class="card-kicker">CLOUD KITCHEN LOCATION</span>
              <h3 class="card-value">{{ config.location.city }}, {{ config.location.state }}</h3>
              <p class="card-desc">Serving throughout Bidar City</p>
              <div class="operating-hours-row">
                <app-icon name="clock" [size]="15" />
                <span>Operating: {{ config.businessHours.displayHours }}</span>
              </div>
            </div>
            <a
              [href]="config.location.mapUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="delivery-badge-pill clickable"
              title="Open The Bite Zone on Google Maps"
            >
              <app-icon name="map-pin" [size]="16" />
              <span>View Kitchen on Google Maps →</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Organic Wave Transition -->
      <div class="bottom-wave-layer" aria-hidden="true">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 35C240 10 500 55 720 40C940 25 1200 52 1440 20V60H0V35Z" fill="#0F472B"/>
          <path d="M0 35C240 10 500 55 720 40C940 25 1200 52 1440 20" stroke="#E5A00D" stroke-width="3.5"/>
        </svg>
      </div>
    </section>
  `,
  styles: [`
    .contact-section {
      position: relative;
      padding: 2.5rem 0 3.5rem;
      background-color: #FAF7F2;
      overflow: hidden;
      border-top: 1px solid rgba(0, 0, 0, 0.05);

      @media (min-width: 768px) {
        padding: 4.5rem 0 6rem;
      }
    }

    /* Top Decorative Outline Art */
    .decor-leaves {
      position: absolute;
      top: 1rem;
      left: 1rem;
      width: clamp(50px, 8vw, 110px);
      height: clamp(60px, 10vw, 130px);
      pointer-events: none;
      opacity: 0.35;
      z-index: 1;

      @media (min-width: 768px) {
        top: 1.5rem;
        left: 1.5rem;
        opacity: 0.75;
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .decor-cloche {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: clamp(60px, 10vw, 140px);
      height: clamp(50px, 8vw, 100px);
      pointer-events: none;
      opacity: 0.35;
      z-index: 1;

      @media (min-width: 768px) {
        top: 1.5rem;
        right: 1.5rem;
        opacity: 0.75;
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .contact-container {
      position: relative;
      z-index: 2;
    }

    /* Header */
    .contact-header {
      text-align: center;
      max-width: 660px;
      margin: 0 auto 1.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;

      @media (min-width: 768px) {
        margin: 0 auto 3.25rem;
      }
    }

    .kicker-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FEF3C7;
      color: #0F472B;
      padding: 5px 14px;
      border-radius: 9999px;
      margin-bottom: 0.65rem;

      @media (min-width: 768px) {
        gap: 7px;
        padding: 6px 18px;
        margin-bottom: 0.85rem;
      }

      .headset-svg {
        color: #0F472B;
      }
    }

    .kicker-text {
      font-family: var(--font-heading);
      font-size: 10.5px;
      font-weight: 850;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0F472B;

      @media (min-width: 768px) {
        font-size: 11.5px;
      }
    }

    .contact-title {
      font-family: var(--font-heading);
      font-size: clamp(1.85rem, 5.5vw, 2.9rem);
      font-weight: 850;
      color: #0F472B;
      letter-spacing: -0.025em;
      line-height: 1.15;
      margin-bottom: 6px;

      @media (min-width: 768px) {
        margin-bottom: 8px;
      }
    }

    .title-accent-wrap {
      position: relative;
      display: inline-block;
    }

    .gold-swoosh {
      position: absolute;
      bottom: -9px;
      left: 0;
      width: 100%;
      height: 14px;
      pointer-events: none;
    }

    .contact-subtitle {
      font-size: 13px;
      color: #4B5563;
      max-width: 600px;
      line-height: 1.45;
      font-weight: 450;
      margin: 0;

      @media (min-width: 768px) {
        font-size: 14.5px;
        line-height: 1.5;
      }
    }

    /* Cards Grid */
    .contact-cards-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;

      @media (min-width: 600px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
      }
    }

    /* Standard Card */
    .contact-card {
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 16px;
      padding: 16px 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
      transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);

      @media (min-width: 768px) {
        border-radius: 20px;
        padding: 24px 22px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
      }

      &:hover {
        transform: translateY(-3px);
        border-color: #D1D5DB;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
      }
    }

    /* Highlighted WhatsApp Hero Card */
    .card-whatsapp-hero {
      background: #0B4D2C;
      border: 1.5px solid #0F5E36;
      border-radius: 16px;
      padding: 16px 16px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(11, 77, 44, 0.22);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);

      @media (min-width: 768px) {
        border-radius: 20px;
        padding: 24px 22px;
        box-shadow: 0 12px 32px rgba(11, 77, 44, 0.28);
      }

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 14px 34px rgba(11, 77, 44, 0.32);
      }

      .card-kicker {
        color: rgba(255, 255, 255, 0.82);
      }

      .card-value {
        color: #FFFFFF;
      }

      .card-desc {
        color: rgba(255, 255, 255, 0.85);
      }
    }

    .whatsapp-watermark {
      position: absolute;
      top: -15px;
      right: -15px;
      width: 110px;
      height: 110px;
      color: rgba(255, 255, 255, 0.06);
      pointer-events: none;

      @media (min-width: 768px) {
        width: 130px;
        height: 130px;
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    /* Icon Boxes */
    .card-icon-box {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;

      @media (min-width: 768px) {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        margin-bottom: 1.25rem;
      }

      &.yellow-pastel {
        background: #FEF3C7;
        color: #0F472B;
      }

      &.whatsapp-green {
        background: #22C55E;
        color: #FFFFFF;
      }

      &.instagram-pastel {
        background: linear-gradient(135deg, #FDF2F4 0%, #FCE7F3 100%);
        color: #E1306C;
      }
    }

    .card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-bottom: 14px;

      @media (min-width: 768px) {
        margin-bottom: 1.5rem;
      }
    }

    .card-kicker {
      font-size: 10px;
      font-weight: 850;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #111827;
      margin-bottom: 4px;

      @media (min-width: 768px) {
        font-size: 11px;
        margin-bottom: 6px;
      }
    }

    .card-value {
      font-family: var(--font-heading);
      font-size: 16.5px;
      font-weight: 850;
      color: #0F472B;
      margin-bottom: 4px;
      line-height: 1.25;
      word-break: break-word;

      @media (min-width: 768px) {
        font-size: 19px;
        margin-bottom: 8px;
      }
    }

    .card-desc {
      font-size: 11.5px;
      color: #6B7280;
      line-height: 1.45;

      @media (min-width: 768px) {
        font-size: 12.5px;
        line-height: 1.5;
      }
    }

    .operating-hours-row {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 650;
      color: #1F2937;
      margin-top: 8px;

      @media (min-width: 768px) {
        gap: 6px;
        font-size: 12px;
        margin-top: 10px;
      }
    }

    /* Buttons */
    .btn-card-outline {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 9px 14px;
      border-radius: 9999px;
      background: #FFFFFF;
      border: 1.5px solid #0F472B;
      color: #0F472B;
      font-family: var(--font-heading);
      font-size: 12.5px;
      font-weight: 750;
      text-decoration: none;
      transition: all var(--transition-fast);
      cursor: pointer;
      margin-top: auto;

      @media (min-width: 768px) {
        padding: 10px 18px;
        font-size: 13.5px;
      }

      .btn-left {
        display: flex;
        align-items: center;
        gap: 6px;

        @media (min-width: 768px) {
          gap: 8px;
        }
      }

      .btn-arrow {
        font-size: 15px;
        transition: transform var(--transition-fast);
      }

      &:hover {
        background: #0F472B;
        color: #FFFFFF;
        transform: translateY(-1px);

        .btn-arrow {
          transform: translateX(3px);
        }
      }
    }

    .btn-card-gold {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 9px 14px;
      border-radius: 9999px;
      background-color: #FFC82C;
      color: #111827;
      border: none;
      font-family: var(--font-heading);
      font-size: 12.5px;
      font-weight: 800;
      text-decoration: none;
      box-shadow: 0 3px 10px rgba(255, 200, 44, 0.3);
      transition: all var(--transition-fast);
      cursor: pointer;
      margin-top: auto;

      @media (min-width: 768px) {
        padding: 11px 18px;
        font-size: 13.5px;
        box-shadow: 0 4px 14px rgba(255, 200, 44, 0.35);
      }

      .btn-left {
        display: flex;
        align-items: center;
        gap: 6px;

        @media (min-width: 768px) {
          gap: 8px;
        }
      }

      .btn-arrow {
        font-size: 15px;
        transition: transform var(--transition-fast);
      }

      &:hover {
        background-color: #F5B800;
        transform: translateY(-1px);
        box-shadow: 0 5px 16px rgba(245, 184, 0, 0.4);

        .btn-arrow {
          transform: translateX(3px);
        }
      }
    }

    .delivery-badge-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      padding: 8px 12px;
      border-radius: 9999px;
      background: #FEF3C7;
      color: #111827;
      font-family: var(--font-heading);
      font-size: 11.5px;
      font-weight: 750;
      border: 1px solid #FDE68A;
      margin-top: auto;
      text-decoration: none;

      @media (min-width: 768px) {
        padding: 10px 16px;
        font-size: 12.5px;
        gap: 8px;
      }
    }

    /* Bottom Decorative Layer */
    .bottom-wave-layer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60px;
      pointer-events: none;
      z-index: 1;

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  `]
})
export class ContactComponent {
  private statusService = inject(BusinessStatusService);
  config = this.statusService.config;
}

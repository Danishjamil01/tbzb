import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section id="home" class="hero-section">
      <!-- Right Signature Dish Background Showcase -->
      <div class="hero-visual">
        <div class="hero-image-wrap">
          <img
            src="images/food/heroright-clean.png"
            alt="TBZB Royal Dum Biryani and Signature Specialties in Bidar"
            class="hero-dish-img"
            loading="eager"
            fetchpriority="high"
          />
        </div>
      </div>

      <!-- Main Container with Content -->
      <div class="container hero-container">
        <!-- Narrative & Action Elements -->
        <div class="hero-content">
          <!-- Kitchen Status Live Indicator Pill -->
          <div class="hero-status-pill">
            <span class="live-dot" [ngClass]="status().isOpen ? 'open' : 'closed'"></span>
            <span class="pill-brand">TBZB CLOUD KITCHEN</span>
            <span class="pill-divider">|</span>
            <span class="pill-hours">
              {{ status().isOpen ? 'Kitchen Open Now (Till 1:00 AM)' : 'Currently Closed (Opens 10:00 AM)' }}
            </span>
          </div>

          <!-- Hero Headline with Custom Golden Underline Swoosh -->
          <h1 class="hero-title">
            <span class="title-green">Good Food.</span><br />
            <span class="title-gold-wrapper">
              <span class="title-gold">Good Mood.</span>
              <svg class="gold-swoosh" viewBox="0 0 240 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
                <path d="M4 12C60 3 160 3 236 11" stroke="#FFC82C" stroke-width="4.5" stroke-linecap="round"/>
              </svg>
            </span>
          </h1>

          <!-- Narrative Paragraph -->
          <p class="hero-description">
            From smoky street-style kathi rollis to royal dum biryani & signature dessert jars — discover delicious delicacies crafted fresh to order and delivered piping hot across Bidar.
          </p>

          <!-- Action CTAs -->
          <div class="hero-ctas">
            <a href="#menu" class="btn-hero-primary">
              <app-icon name="utensils" [size]="16" />
              <span>Explore Full Menu</span>
              <span class="btn-arrow">→</span>
            </a>
            <a href="#featured" class="btn-hero-secondary">
              <app-icon name="star-outline" [size]="16" />
              <span>Chef's Bestsellers</span>
            </a>
          </div>

          <!-- Bottom 4-Feature Trust Strip -->
          <div class="hero-trust-strip">
            <div class="trust-item">
              <div class="trust-icon-box">
                <app-icon name="delivery-scooter" [size]="20" />
              </div>
              <div class="trust-text">
                <span class="trust-title">30–45 Mins</span>
                <span class="trust-desc">Fast Hot Delivery</span>
              </div>
            </div>

            <div class="trust-item">
              <div class="trust-icon-box">
                <app-icon name="clock" [size]="19" />
              </div>
              <div class="trust-text">
                <span class="trust-title">Till 1:00 AM</span>
                <span class="trust-desc">Late Night Kitchen</span>
              </div>
            </div>

            <div class="trust-item">
              <div class="trust-icon-box">
                <app-icon name="leaf" [size]="19" />
              </div>
              <div class="trust-text">
                <span class="trust-title">100% Fresh</span>
                <span class="trust-desc">Cooked to Order</span>
              </div>
            </div>

            <div class="trust-item">
              <div class="trust-icon-box">
                <app-icon name="chef-hat" [size]="19" />
              </div>
              <div class="trust-text">
                <span class="trust-title">Authentic Taste</span>
                <span class="trust-desc">Local Flavours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      overflow-x: hidden;
    }

    .hero-section {
      position: relative;
      width: 100%;
      background-color: #FAF7F2;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.9) 0%, transparent 60%),
        linear-gradient(135deg, #FAF7F2 0%, #F4EFEB 60%, #EFEAE4 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
      padding: 0.85rem 0 1.25rem;

      @media (min-width: 1024px) {
        min-height: 520px;
        height: calc(100vh - var(--header-height));
        max-height: 600px;
        padding: 2rem 0;
      }
    }

    .hero-container {
      position: relative;
      z-index: 2;
      width: 100%;
      box-sizing: border-box;
    }

    /* Content Column */
    .hero-content {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;

      @media (min-width: 1024px) {
        max-width: 610px;
        z-index: 3;
      }
    }

    /* Status Pill */
    .hero-status-pill {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 7px;
      background: #FFFFFF;
      border: 1px solid #D1FAE5;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      padding: 5px 12px;
      border-radius: 9999px;
      margin-bottom: 0.95rem;

      @media (max-width: 640px) {
        padding: 4px 11px;
        gap: 6px;
      }
    }

    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #16A34A;
      box-shadow: 0 0 0 2.5px rgba(22, 163, 74, 0.2);
      display: inline-block;
      flex-shrink: 0;

      &.closed {
        background-color: #EF4444;
        box-shadow: 0 0 0 2.5px rgba(239, 68, 68, 0.2);
      }
    }

    .pill-brand {
      font-family: var(--font-heading);
      font-size: 11px;
      font-weight: 750;
      color: #047857;
      letter-spacing: 0.04em;

      @media (max-width: 640px) {
        font-size: 10px;
      }
    }

    .pill-divider {
      color: #D1D5DB;
      font-size: 11px;
      font-weight: 300;
    }

    .pill-hours {
      font-family: var(--font-heading);
      font-size: 11.5px;
      font-weight: 600;
      color: #1F2937;

      @media (max-width: 640px) {
        font-size: 10.5px;
      }
    }

    /* Main Headline */
    .hero-title {
      font-family: var(--font-heading);
      font-size: clamp(2.35rem, 7.5vw, 4.4rem);
      font-weight: 850;
      line-height: 1.05;
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
      position: relative;
      z-index: 3;

      @media (min-width: 1024px) {
        margin-bottom: 1.25rem;
      }
    }

    .title-green {
      color: #0F472B;
    }

    .title-gold-wrapper {
      position: relative;
      display: inline-block;
      z-index: 3;
    }

    .title-gold {
      color: #E5A00D;
    }

    .gold-swoosh {
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 100%;
      height: 14px;
      pointer-events: none;
      z-index: 5;
      display: block;
    }

    /* Description */
    .hero-description {
      color: #4B5563;
      font-size: 11.5px;
      line-height: 1.55;
      margin-bottom: 1.15rem;
      font-weight: 450;
      position: relative;
      z-index: 3;

      @media (max-width: 768px) {
        max-width: 56%;
      }

      @media (min-width: 1024px) {
        font-size: 1.08rem;
        line-height: 1.65;
        max-width: 530px;
        margin-bottom: 2rem;
      }
    }

    /* CTAs */
    .hero-ctas {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 1.25rem;
      position: relative;
      z-index: 3;

      @media (max-width: 768px) {
        max-width: 56%;
      }

      @media (min-width: 640px) {
        flex-direction: row;
        align-items: center;
        gap: 12px;
        max-width: 100%;
      }

      @media (min-width: 1024px) {
        gap: 14px;
        margin-bottom: 3rem;
      }
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      background-color: #0F472B;
      color: #FFFFFF;
      padding: 9.5px 16px;
      border-radius: 9999px;
      font-family: var(--font-heading);
      font-size: 12.5px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(15, 71, 43, 0.25);
      transition: all var(--transition-fast);
      white-space: nowrap;

      @media (max-width: 640px) {
        width: 100%;
        max-width: 175px;
      }

      @media (min-width: 1024px) {
        padding: 13px 28px;
        font-size: 15px;
      }

      .btn-arrow {
        font-size: 14px;
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

    .btn-hero-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      background-color: #FFFFFF;
      color: #111827;
      border: 1.5px solid #111827;
      padding: 8.5px 16px;
      border-radius: 9999px;
      font-family: var(--font-heading);
      font-size: 12.5px;
      font-weight: 700;
      text-decoration: none;
      transition: all var(--transition-fast);
      white-space: nowrap;

      @media (max-width: 640px) {
        width: 100%;
        max-width: 175px;
      }

      @media (min-width: 1024px) {
        padding: 12px 26px;
        font-size: 15px;
      }

      &:hover {
        background-color: #F9FAFB;
        border-color: #0F472B;
        color: #0F472B;
        transform: translateY(-2px);
      }
    }

    /* Trust Features Strip */
    .hero-trust-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      align-items: center;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      padding: 10px 2px;
      margin-top: 0.35rem;
      position: relative;
      z-index: 4;
      width: 100%;
      box-sizing: border-box;

      @media (min-width: 768px) {
        display: flex;
        flex-wrap: nowrap;
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0.5rem 0 0;
        gap: 1.15rem;
      }
    }

    .trust-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2px 3px;
      min-width: 0;

      @media (max-width: 767px) {
        &:not(:last-child) {
          border-right: 1px solid #E5E7EB;
        }
      }

      @media (min-width: 768px) {
        flex-direction: row;
        text-align: left;
        gap: 8px;
        flex-shrink: 0;
      }
    }

    .trust-icon-box {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0F472B;
      flex-shrink: 0;
      margin-bottom: 2px;

      @media (min-width: 768px) {
        color: #111827;
        margin-bottom: 0;
      }
    }

    .trust-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .trust-title {
      font-family: var(--font-heading);
      font-size: 10.5px;
      font-weight: 800;
      color: #111827;
      line-height: 1.2;
      white-space: nowrap;

      @media (min-width: 768px) {
        font-size: 14px;
        font-weight: 750;
      }
    }

    .trust-desc {
      font-size: 8.5px;
      font-weight: 500;
      color: #6B7280;
      line-height: 1.2;
      white-space: nowrap;
      margin-top: 2px;

      @media (min-width: 768px) {
        font-size: 11.5px;
      }
    }

    /* Right Visual Showcase */
    .hero-visual {
      position: absolute;
      right: 0;
      top: 200px; /* Shifted down in mobile view */
      width: 48%;
      max-width: 215px;
      pointer-events: none;
      z-index: 1;

      @media (max-width: 380px) {
        top: 145px;
        width: 46%;
      }

      @media (min-width: 1024px) {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 55%;
        max-width: none;
        height: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
    }

    .hero-image-wrap {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .hero-dish-img {
      width: 100%;
      height: auto;
      max-height: 480px;
      object-fit: contain;
      object-position: right center;
      display: block;

      @media (min-width: 1024px) {
        width: 100%;
        height: 100%;
        max-height: none;
        object-fit: cover;
        object-position: right center;
        mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.1) 5%, rgba(0, 0, 0, 0.8) 22%, black 35%);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.1) 5%, rgba(0, 0, 0, 0.8) 22%, black 35%);
      }
    }
  `]
})
export class HeroComponent {
  private statusService = inject(BusinessStatusService);
  status = this.statusService.status;
}

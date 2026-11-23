import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessStatusService } from '../../../core/services/business-status.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section id="about" class="about-section">
      <!-- Top-Right Dark Green Decorative Wave -->
      <div class="green-wave-top" aria-hidden="true">
        <svg viewBox="0 0 360 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M110 0C50 70 40 180 360 300V0H110Z" fill="#0F472B"/>
        </svg>
      </div>

      <!-- Bottom-Right Dark Green Decorative Wave -->
      <div class="green-wave-bottom" aria-hidden="true">
        <svg viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M30 340C50 190 170 70 400 0V340H30Z" fill="#0F472B"/>
        </svg>
      </div>

      <div class="container about-container">
        <div class="about-grid">
          <!-- Left Column: Story & Highlights -->
          <div class="about-content">
            <!-- Kicker Sublabel -->
            <div class="about-kicker-row">
              <span class="about-sublabel">ABOUT THE BITE ZONE</span>
              <span class="gold-dash" aria-hidden="true"></span>
            </div>

            <!-- Headline with Golden Swoosh -->
            <h2 class="about-title">
              <span class="title-green">Good Food. </span>
              <span class="title-gold-wrap">
                <span class="title-gold">Good Mood.</span>
                <svg class="gold-swoosh" viewBox="0 0 240 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 10C65 2 170 2 236 8" stroke="#E5A00D" stroke-width="4.5" stroke-linecap="round"/>
                </svg>
              </span>
            </h2>

            <!-- Taste The Difference Pill -->
            <div class="taste-pill">
              <app-icon name="utensils" [size]="16" class="taste-icon" />
              <span class="taste-text">Taste the Difference... Only at TBZB</span>
            </div>

            <!-- Narrative Paragraphs -->
            <div class="about-paragraphs">
              <p>
                At The Bite Zone, we believe good food has the power to make every moment better. From comforting favourites to delicious cravings, we prepare food that brings flavour, satisfaction and a little happiness to your day.
              </p>
              <p>
                Based in Bidar, our cloud kitchen is dedicated to crafting fresh, mouth-watering meals made to order. Whether it's lunch, dinner, or midnight snacking with friends, our kitchen stays firing until 1:00 AM.
              </p>
            </div>

            <!-- 3 Pillars Cards Row -->
            <div class="pillars-row">
              <div class="pillar-card">
                <div class="pillar-icon-box">
                  <app-icon name="flame" [size]="20" />
                </div>
                <h4 class="pillar-title">Freshly Cooked</h4>
                <p class="pillar-desc">Prepared hot upon receiving your order.</p>
              </div>

              <div class="pillar-card">
                <div class="pillar-icon-box">
                  <app-icon name="moon" [size]="20" />
                </div>
                <h4 class="pillar-title">Late Night Kitchen</h4>
                <p class="pillar-desc">Orders accepted until 1:00 AM every night.</p>
              </div>

              <div class="pillar-card">
                <div class="pillar-icon-box">
                  <app-icon name="message-circle" [size]="20" />
                </div>
                <h4 class="pillar-title">WhatsApp Ordering</h4>
                <p class="pillar-desc">Direct contact with our team for quick support.</p>
              </div>
            </div>
          </div>

          <!-- Right Column: Visual Showcase -->
          <div class="about-visual">
            <div class="showcase-wrapper">
              <!-- Radiant Yellow Sparks Accent -->
              <div class="sunburst-sparks" aria-hidden="true">
                <svg viewBox="0 0 60 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 36L4 32" stroke="#E5A00D" stroke-width="4" stroke-linecap="round"/>
                  <path d="M26 22L20 8" stroke="#E5A00D" stroke-width="4" stroke-linecap="round"/>
                  <path d="M44 26L52 14" stroke="#E5A00D" stroke-width="4" stroke-linecap="round"/>
                </svg>
              </div>

              <!-- Main Plated Dish Showcase Card -->
              <div class="image-showcase-card">
                <img
                  src="images/food/chicken-cheese-egg-roll.png"
                  alt="TBZB Roll Delicacy Freshly Plated in Bidar"
                  class="showcase-img"
                  loading="lazy"
                />

                <!-- Floating Location Brand Pill -->
                <div class="floating-brand-pill">
                  <div class="pill-pin-icon">
                    <app-icon name="map-pin" [size]="20" />
                  </div>
                  <div class="pill-brand-text">
                    <span class="pill-brand-head">TBZB • BIDAR</span>
                    <span class="pill-brand-sub">Cloud Kitchen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about-section {
      position: relative;
      padding: 2.5rem 0 3rem;
      background-color: #FAF7F2;
      overflow: hidden;
      border-top: 1px solid rgba(0, 0, 0, 0.05);

      @media (min-width: 768px) {
        padding: 4.5rem 0 5.5rem;
      }
    }

    /* Background Curved Waves */
    .green-wave-top {
      display: none;

      @media (min-width: 1024px) {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        width: clamp(240px, 28vw, 420px);
        height: clamp(200px, 25vw, 360px);
        pointer-events: none;
        z-index: 1;

        svg {
          width: 100%;
          height: 100%;
        }
      }
    }

    .green-wave-bottom {
      display: none;

      @media (min-width: 1024px) {
        display: block;
        position: absolute;
        bottom: 0;
        right: 0;
        width: clamp(260px, 30vw, 460px);
        height: clamp(220px, 26vw, 380px);
        pointer-events: none;
        z-index: 1;

        svg {
          width: 100%;
          height: 100%;
        }
      }
    }

    .about-container {
      position: relative;
      z-index: 2;
    }

    .about-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      align-items: center;

      @media (min-width: 1024px) {
        grid-template-columns: 1.15fr 0.95fr;
        gap: 4rem;
      }
    }

    /* Left Column */
    .about-content {
      display: flex;
      flex-direction: column;
    }

    .about-kicker-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .about-sublabel {
      font-size: 10.5px;
      font-weight: 850;
      letter-spacing: 0.12em;
      color: #0F472B;
      text-transform: uppercase;

      @media (min-width: 768px) {
        font-size: 11px;
      }
    }

    .gold-dash {
      display: inline-block;
      width: 28px;
      height: 3px;
      background-color: #E5A00D;
      border-radius: 2px;

      @media (min-width: 768px) {
        width: 34px;
        height: 3.5px;
      }
    }

    .about-title {
      font-family: var(--font-heading);
      font-size: clamp(1.85rem, 6vw, 3.2rem);
      font-weight: 850;
      letter-spacing: -0.025em;
      line-height: 1.15;
      margin-bottom: 0.85rem;

      @media (min-width: 768px) {
        margin-bottom: 1.25rem;
      }
    }

    .title-green {
      color: #0F472B;
    }

    .title-gold-wrap {
      position: relative;
      display: inline-block;
    }

    .title-gold {
      color: #E5A00D;
    }

    .gold-swoosh {
      position: absolute;
      bottom: -9px;
      left: 0;
      width: 100%;
      height: 14px;
      pointer-events: none;
    }

    .taste-pill {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 6px;
      background: #EAF7EC;
      color: #0F472B;
      padding: 5px 12px;
      border-radius: 9999px;
      margin-bottom: 1.15rem;
      font-family: var(--font-heading);
      font-size: 11.5px;
      font-weight: 750;
      letter-spacing: 0.01em;

      @media (min-width: 768px) {
        gap: 8px;
        padding: 6px 16px;
        font-size: 13.5px;
        margin-bottom: 1.5rem;
      }

      .taste-icon {
        color: #0F472B;
      }
    }

    .about-paragraphs {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      font-size: 13.5px;
      line-height: 1.55;
      color: #2f3135ff;
      max-width: 580px;
      font-weight: 450;
      margin-bottom: 1.5rem;

      @media (min-width: 768px) {
        gap: 1.15rem;
        font-size: 14.5px;
        line-height: 1.68;
        margin-bottom: 2.25rem;
      }

      p {
        color: #2f3135ff !important;
        margin: 0;
      }
    }

    /* 3 Pillars Cards Row */
    .pillars-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;

      @media (max-width: 420px) {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      @media (min-width: 768px) {
        gap: 1rem;
      }
    }

    .pillar-card {
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);

      @media (min-width: 768px) {
        border-radius: 14px;
        padding: 16px 18px;
      }

      &:hover {
        transform: translateY(-2px);
        border-color: #0F472B;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
      }
    }

    .pillar-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #EAF7EC;
      color: #0F472B;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      @media (min-width: 768px) {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        margin-bottom: 10px;
      }
    }

    .pillar-title {
      font-family: var(--font-heading);
      font-size: 12px;
      font-weight: 750;
      color: #111827;
      margin-bottom: 2px;
      line-height: 1.25;

      @media (min-width: 768px) {
        font-size: 14px;
        margin-bottom: 4px;
      }
    }

    .pillar-desc {
      font-size: 11px;
      color: #6B7280;
      line-height: 1.35;
      margin: 0;

      @media (min-width: 768px) {
        font-size: 12px;
        line-height: 1.45;
      }
    }

    /* Right Column: Visual Showcase */
    .about-visual {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      width: 100%;
    }

    .showcase-wrapper {
      position: relative;
      width: 100%;
      max-width: 560px;
    }

    .sunburst-sparks {
      position: absolute;
      top: -20px;
      left: -12px;
      width: 44px;
      height: 34px;
      pointer-events: none;
      z-index: 4;

      @media (min-width: 768px) {
        top: -26px;
        left: -18px;
        width: 54px;
        height: 42px;
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .image-showcase-card {
      position: relative;
      border-radius: 18px;
      overflow: hidden;
      border: 3px solid #FFFFFF;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      background-color: #FAF7F2;

      @media (min-width: 768px) {
        border-radius: 28px;
        border-width: 4px;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
      }
    }

    .showcase-img {
      width: 100%;
      aspect-ratio: 4 / 3.2;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;

      .image-showcase-card:hover & {
        transform: scale(1.02);
      }
    }

    .floating-brand-pill {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: #0B3B24;
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      border-radius: 12px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
      backdrop-filter: blur(8px);
      z-index: 3;

      @media (min-width: 768px) {
        bottom: 20px;
        right: 20px;
        border-radius: 16px;
        padding: 9px 18px;
        gap: 10px;
      }
    }

    .pill-pin-icon {
      color: #E5A00D;
      display: flex;
      align-items: center;
    }

    .pill-brand-text {
      display: flex;
      flex-direction: column;
    }

    .pill-brand-head {
      font-family: var(--font-heading);
      font-size: 11px;
      font-weight: 850;
      color: #FFFFFF;
      letter-spacing: 0.04em;
      line-height: 1.2;

      @media (min-width: 768px) {
        font-size: 12.5px;
        letter-spacing: 0.05em;
      }
    }

    .pill-brand-sub {
      font-size: 9.5px;
      color: #A7F3D0;
      line-height: 1.2;
      font-weight: 500;

      @media (min-width: 768px) {
        font-size: 11px;
      }
    }
  `]
})
export class AboutComponent {
  private statusService = inject(BusinessStatusService);
  config = this.statusService.config;
}

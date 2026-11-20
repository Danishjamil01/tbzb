import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isVisible()) {
      <div
        class="swiggy-splash"
        [class.exit-fade]="isFadingOut()"
        (click)="dismiss()"
        role="dialog"
        aria-label="Welcome to The Bite Zone Bidar"
      >
        <!-- Center Logo & Branding -->
        <div class="splash-card">
          <!-- Animated Brand Emblem -->
          <div class="emblem-container">
            <div class="emblem-glow"></div>
            <div class="emblem-badge">
              <app-icon name="chef-hat" [size]="42" extraClass="chef-hat-icon" />
              <div class="emblem-mid-row">
                <app-icon name="utensils" [size]="16" />
                <span class="emblem-text">TBZB</span>
                <app-icon name="flame" [size]="16" extraClass="flame-icon" />
              </div>
            </div>
          </div>

          <!-- Brand Title & Badges -->
          <h1 class="brand-name">THE BITE ZONE</h1>
          <div class="city-pill">
            <span class="star">★</span>
            <span class="city-title">BIDAR</span>
            <span class="star">★</span>
          </div>
          <p class="brand-tagline">Fresh Rolls • Handi Biryani • Delicacies</p>

          <!-- Swiggy-style Sleek Progress Bar -->
          <div class="progress-bar-wrap">
            <div class="progress-bar-inner"></div>
          </div>

          <div class="delivery-perk">
            <app-icon name="delivery-scooter" [size]="14" />
            <span>Delivering Fresh & Hot Across Bidar</span>
          </div>
        </div>

        <!-- Minimalist Bottom Signature -->
        <div class="splash-bottom">
          <span>100% Halal • Quality Guaranteed</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .swiggy-splash {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background-color: #0B2F1D;
      background: radial-gradient(circle at 50% 40%, #104C2E 0%, #0B2F1D 60%, #061D12 100%);
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: hidden;
      transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      -webkit-user-select: none;

      &.exit-fade {
        opacity: 0;
        transform: scale(1.05);
        pointer-events: none;
      }
    }

    .splash-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      animation: cardEntrance 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes cardEntrance {
      0% {
        opacity: 0;
        transform: scale(0.88) translateY(16px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Emblem styling */
    .emblem-container {
      position: relative;
      width: 110px;
      height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .emblem-glow {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(16, 185, 129, 0) 70%);
      filter: blur(14px);
      animation: glowBreath 2.4s ease-in-out infinite alternate;
    }

    @keyframes glowBreath {
      0% { transform: scale(0.9); opacity: 0.6; }
      100% { transform: scale(1.15); opacity: 1; }
    }

    .emblem-badge {
      position: relative;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: linear-gradient(145deg, #165335, #082415);
      border: 2.5px solid #F59E0B;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: #F59E0B;

      :deep(.chef-hat-icon) {
        color: #FFFFFF;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      }

      :deep(.flame-icon) {
        color: #F97316;
      }
    }

    .emblem-mid-row {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #FDE68A;

      .emblem-text {
        font-size: 10px;
        font-weight: 900;
        background: #F59E0B;
        color: #0B291A;
        padding: 1px 5px;
        border-radius: 4px;
        letter-spacing: 0.5px;
        line-height: 1;
      }
    }

    /* Brand titles */
    .brand-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 2.5px;
      background: linear-gradient(135deg, #FFFFFF 30%, #FDE68A 70%, #F59E0B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      line-height: 1.2;
    }

    .city-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 8px 0 10px;
      padding: 3px 14px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 100px;

      .city-title {
        color: #FBBF24;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      .star {
        color: #F59E0B;
        font-size: 9px;
      }
    }

    .brand-tagline {
      font-size: 13px;
      color: #A7F3D0;
      margin: 0 0 24px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    /* Swiggy-style Sleek Progress Line */
    .progress-bar-wrap {
      width: 170px;
      height: 3.5px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 16px;
      position: relative;
    }

    .progress-bar-inner {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #10B981, #F59E0B);
      border-radius: 10px;
      box-shadow: 0 0 10px #10B981;
      animation: progressGlide 1.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes progressGlide {
      0% { width: 0%; }
      40% { width: 55%; }
      80% { width: 85%; }
      100% { width: 100%; }
    }

    .delivery-perk {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.65);
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Minimal Bottom Tag */
    .splash-bottom {
      position: absolute;
      bottom: 22px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.35);
      letter-spacing: 0.5px;
    }
  `]
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  isVisible = signal<boolean>(true);
  isFadingOut = signal<boolean>(false);
  private timer: any = null;

  ngOnInit(): void {
    // Smooth 1.45s timing for authentic Swiggy/Zomato launch feeling
    this.timer = setTimeout(() => {
      this.dismiss();
    }, 1450);
  }

  dismiss(): void {
    if (this.isFadingOut()) return;
    this.isFadingOut.set(true);

    setTimeout(() => {
      this.isVisible.set(false);
    }, 450);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}

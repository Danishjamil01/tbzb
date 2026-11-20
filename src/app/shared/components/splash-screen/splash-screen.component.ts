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
        class="splash-overlay"
        [class.fade-out]="isFadingOut()"
        (click)="dismiss()"
        role="dialog"
        aria-label="Welcome to The Bite Zone Bidar"
      >
        <!-- Background Ambient Glows -->
        <div class="ambient-glow top-left"></div>
        <div class="ambient-glow bottom-right"></div>
        <div class="ambient-pattern"></div>

        <!-- Central Branding Container -->
        <div class="splash-content">
          <!-- Animated Logo Emblem -->
          <div class="logo-emblem-wrap">
            <div class="glowing-ring outer"></div>
            <div class="glowing-ring middle"></div>
            <div class="emblem-core">
              <div class="emblem-icons">
                <app-icon name="chef-hat" [size]="36" extraClass="chef-icon" />
                <div class="cutlery-row">
                  <app-icon name="utensils" [size]="18" />
                  <span class="emblem-tag">TBZB</span>
                  <app-icon name="flame" [size]="18" extraClass="flame-icon" />
                </div>
              </div>
            </div>
          </div>

          <!-- Typography -->
          <div class="brand-text-wrap">
            <h1 class="brand-title">THE BITE ZONE</h1>
            <div class="city-pill">
              <span class="star-accent">★</span>
              <span class="city-name">BIDAR</span>
              <span class="star-accent">★</span>
            </div>
            <p class="brand-tagline">Rolls • Biryani • Delicacies</p>
            <div class="badge-delivery">
              <app-icon name="delivery-scooter" [size]="16" />
              <span>Doorstep Delivery Across Bidar</span>
            </div>
          </div>

          <!-- Loading Shimmer Bar -->
          <div class="loader-section">
            <div class="shimmer-track">
              <div class="shimmer-bar"></div>
            </div>
            <div class="loader-status">
              <span class="pulse-dot"></span>
              <span class="status-text">Fresh & Hot Taste Loading...</span>
            </div>
          </div>
        </div>

        <!-- Bottom Signature -->
        <div class="splash-footer">
          <span>Crafted with passion in Bidar • 100% Halal</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .splash-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 35%, #0F472B 0%, #082818 55%, #04140C 100%);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: hidden;
      transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      -webkit-user-select: none;

      &.fade-out {
        opacity: 0;
        transform: scale(1.04);
        pointer-events: none;
      }
    }

    /* Ambient atmospheric lighting */
    .ambient-glow {
      position: absolute;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.25;
      pointer-events: none;

      &.top-left {
        top: -60px;
        left: -60px;
        background: #10B981;
      }

      &.bottom-right {
        bottom: -60px;
        right: -60px;
        background: #F59E0B;
      }
    }

    .ambient-pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
      opacity: 0.6;
    }

    .splash-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 360px;
      width: 100%;
      animation: contentSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes contentSlideUp {
      from {
        opacity: 0;
        transform: translateY(24px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Logo Emblem with concentric glowing rings */
    .logo-emblem-wrap {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }

    .glowing-ring {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;

      &.outer {
        width: 120px;
        height: 120px;
        border: 2px dashed rgba(245, 158, 11, 0.45);
        animation: rotateSlow 24s linear infinite;
      }

      &.middle {
        width: 104px;
        height: 104px;
        border: 1.5px solid rgba(16, 185, 129, 0.4);
        box-shadow: 0 0 24px rgba(16, 185, 129, 0.3);
        animation: pulseRing 3s ease-in-out infinite;
      }
    }

    @keyframes rotateSlow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes pulseRing {
      0%, 100% {
        transform: scale(1);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.9;
      }
    }

    .emblem-core {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(145deg, #165335, #0B291A);
      border: 2px solid #F59E0B;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .emblem-icons {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      color: #FBBF24;

      :deep(.chef-icon) {
        color: #FFFFFF;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      }

      :deep(.flame-icon) {
        color: #F97316;
      }
    }

    .cutlery-row {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #FFFFFF;
    }

    .emblem-tag {
      background: #F59E0B;
      color: #0B291A;
      font-size: 9px;
      font-weight: 900;
      padding: 1px 4px;
      border-radius: 4px;
      line-height: 1;
    }

    /* Brand titles */
    .brand-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 2.5px;
      background: linear-gradient(135deg, #FFFFFF 20%, #FDE68A 60%, #F59E0B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      line-height: 1.2;
      text-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .city-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0 12px;
      padding: 4px 16px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 20px;
      backdrop-filter: blur(8px);

      .city-name {
        color: #FBBF24;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 3px;
      }

      .star-accent {
        color: #F59E0B;
        font-size: 10px;
      }
    }

    .brand-tagline {
      font-size: 13px;
      font-weight: 500;
      color: #D1FAE5;
      letter-spacing: 0.5px;
      margin: 0 0 14px;
      opacity: 0.9;
    }

    .badge-delivery {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.07);
      border-radius: 100px;
      color: #A7F3D0;
      font-size: 11.5px;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Loader section */
    .loader-section {
      width: 100%;
      margin-top: 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .shimmer-track {
      width: 200px;
      height: 4px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .shimmer-bar {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 45%;
      background: linear-gradient(90deg, #10B981, #F59E0B, #10B981);
      border-radius: 4px;
      animation: shimmerLoop 1.4s ease-in-out infinite;
    }

    @keyframes shimmerLoop {
      0% {
        left: -45%;
        width: 30%;
      }
      50% {
        width: 60%;
      }
      100% {
        left: 100%;
        width: 30%;
      }
    }

    .loader-status {
      display: flex;
      align-items: center;
      gap: 8px;

      .pulse-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #10B981;
        box-shadow: 0 0 10px #10B981;
        animation: pulseDot 1.2s infinite;
      }

      .status-text {
        font-size: 11px;
        color: #9CA3AF;
        letter-spacing: 0.4px;
        font-weight: 500;
      }
    }

    @keyframes pulseDot {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.3); opacity: 1; }
    }

    /* Splash Footer */
    .splash-footer {
      position: absolute;
      bottom: 24px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 0.6px;
      z-index: 2;
    }
  `]
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  isVisible = signal<boolean>(true);
  isFadingOut = signal<boolean>(false);
  private timer: any = null;

  ngOnInit(): void {
    // Only show once per session in standard browser, or always for native app feel
    const isColdLaunch = !sessionStorage.getItem('tbzb_splash_shown');
    
    // Smooth timer: 1.8s for beautiful branded intro
    const duration = isColdLaunch ? 1800 : 900;
    
    this.timer = setTimeout(() => {
      this.dismiss();
    }, duration);
  }

  dismiss(): void {
    if (this.isFadingOut()) return;
    this.isFadingOut.set(true);
    
    // Save to session so internal navigations don't re-trigger splash
    try {
      sessionStorage.setItem('tbzb_splash_shown', 'true');
    } catch (e) {}

    setTimeout(() => {
      this.isVisible.set(false);
    }, 480);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}

import { Component, OnInit, signal, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isVisible()) {
      <div
        class="tbzb-splash"
        [class.fade-exit]="isFadingOut()"
        (click)="dismiss()"
        role="dialog"
        aria-label="The Bite Zone Bidar"
      >
        <!-- Background Layer with User Mockup Artwork -->
        <div class="splash-art-bg">
          <img
            src="images/splash-screen-bg.jpg"
            alt="The Bite Zone Bidar"
            class="splash-mockup-img"
          />
        </div>

        <!-- Animated Bottom Spinner over the Green Wave -->
        <div class="bottom-spinner-wrap">
          <div class="circular-spinner"></div>
        </div>
      </div>
    }
  `,
  styles: [`
    .tbzb-splash {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background-color: #FAF8F5;
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      -webkit-user-select: none;

      &.fade-exit {
        opacity: 0;
        transform: scale(1.04);
        pointer-events: none;
      }
    }

    .splash-art-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FAF8F5;
    }

    .splash-mockup-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      max-width: 500px;
      margin: 0 auto;
      animation: smoothPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes smoothPop {
      0% {
        opacity: 0;
        transform: scale(0.96);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Bottom Spinner located precisely inside the green wave */
    .bottom-spinner-wrap {
      position: absolute;
      bottom: 24px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
      pointer-events: none;
    }

    .circular-spinner {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 3.5px solid rgba(245, 158, 11, 0.2);
      border-top-color: #F59E0B;
      border-right-color: #FBBF24;
      animation: spinLoader 0.9s linear infinite;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.35);
    }

    @keyframes spinLoader {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  @Output() splashFinished = new EventEmitter<void>();

  isVisible = signal<boolean>(true);
  isFadingOut = signal<boolean>(false);
  private timer: any = null;

  ngOnInit(): void {
    // Set status bar theme color to match the splash top background (#FAF8F5)
    this.updateThemeColor('#FAF8F5');

    // 1.8 seconds display time for smooth branding
    this.timer = setTimeout(() => {
      this.dismiss();
    }, 1800);
  }

  dismiss(): void {
    if (this.isFadingOut()) return;
    this.isFadingOut.set(true);

    setTimeout(() => {
      this.isVisible.set(false);
      this.splashFinished.emit();
    }, 450);
  }

  private updateThemeColor(color: string): void {
    if (typeof document !== 'undefined') {
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', color);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}

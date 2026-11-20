import { Component, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformService } from '../../../core/services/platform.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-location-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="location-screen-overlay" [class.slide-out]="isDismissing()">
      <!-- Top Bar: Back & Brand Logo -->
      <div class="top-nav-bar">
        <button class="back-btn" (click)="skipToBidar()" aria-label="Skip to Bidar">
          <app-icon name="arrow-left" [size]="20" />
        </button>

        <div class="brand-top-header">
          <div class="brand-logo-wrap">
            <app-icon name="chef-hat" [size]="24" extraClass="chef-icon" />
            <span class="yellow-badge">TBZB</span>
          </div>
          <h2 class="brand-heading">THE BITE ZONE</h2>
          <div class="sub-rule">
            <span class="line"></span>
            <span class="city">BIDAR</span>
            <span class="line"></span>
          </div>
          <span class="kitchen-tag">CLOUD KITCHEN</span>
        </div>

        <button class="skip-btn" (click)="skipToBidar()">Skip</button>
      </div>

      <!-- Center 3D Map Graphic with Glowing Radar Pin -->
      <div class="map-graphic-section">
        <div class="map-radar-pulse"></div>
        <div class="map-illustration">
          <div class="map-sheet">
            <div class="map-grid-roads"></div>
            <div class="map-pin-anchor">
              <div class="pulsing-halo"></div>
              <div class="pin-emerald">
                <app-icon name="map-pin" [size]="26" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Headline & Subtitle -->
      <div class="location-text-section">
        <h1 class="main-title">Find Your Location</h1>
        <div class="yellow-swoosh"></div>
        <p class="sub-text">
          Allow location access to find nearby kitchen areas and get faster delivery across Bidar.
        </p>

        @if (selectedLocationMsg()) {
          <div class="success-loc-pill">
            <app-icon name="check-circle" [size]="15" />
            <span>{{ selectedLocationMsg() }}</span>
          </div>
        }
      </div>

      <!-- Action Buttons -->
      <div class="actions-section">
        <!-- 1. Use My Current Location (Primary) -->
        <button
          class="btn-use-location"
          [disabled]="isLoadingGps()"
          (click)="detectLiveLocation()"
        >
          <div class="btn-left">
            @if (isLoadingGps()) {
              <div class="btn-spinner"></div>
            } @else {
              <app-icon name="map-pin" [size]="20" />
            }
            <span class="btn-text">
              {{ isLoadingGps() ? 'Detecting Live GPS...' : 'Use My Current Location' }}
            </span>
          </div>
          <app-icon name="arrow-right" [size]="18" />
        </button>

        <!-- 2. Search for a Location (Outline) -->
        <button class="btn-search-location" (click)="toggleSearch()">
          <div class="btn-left">
            <app-icon name="search" [size]="18" />
            <span class="btn-text">Search for a Location</span>
          </div>
        </button>

        <!-- 3. Select from Saved / Popular Areas (Soft Mint) -->
        <button class="btn-saved-address" (click)="showPopularAreas.set(!showPopularAreas())">
          <div class="btn-left">
            <app-icon name="map-pin" [size]="17" />
            <span class="btn-text">Select Bidar Area</span>
          </div>
          <app-icon name="chevron-right" [size]="16" />
        </button>
      </div>

      <!-- Popular Bidar Areas Picker Modal / Drawer -->
      @if (showPopularAreas()) {
        <div class="areas-drawer-backdrop" (click)="showPopularAreas.set(false)"></div>
        <div class="areas-drawer">
          <div class="drawer-header">
            <h3>Select Your Area in Bidar</h3>
            <button class="close-drawer-btn" (click)="showPopularAreas.set(false)">
              <app-icon name="x" [size]="18" />
            </button>
          </div>
          <div class="areas-list">
            @for (area of bidarAreas; track area) {
              <button class="area-item-btn" (click)="chooseArea(area)">
                <div class="area-icon-wrap">
                  <app-icon name="map-pin" [size]="15" />
                </div>
                <div class="area-texts">
                  <strong>{{ area }}</strong>
                  <span>Bidar, Karnataka • 15–25 min delivery</span>
                </div>
              </button>
            }
          </div>
        </div>
      }

      <!-- Bottom Skyline Silhouette & Wave Graphic -->
      <div class="bottom-monument-wave">
        <div class="bidar-skyline-silhouette"></div>
        <div class="bottom-green-wave"></div>
      </div>
    </div>
  `,
  styles: [`
    .location-screen-overlay {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background-color: #FAF8F5;
      background: radial-gradient(circle at 50% 20%, #FFFFFF 0%, #FAF8F5 65%, #F4EFE6 100%);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 20px 0;
      box-sizing: border-box;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);

      &.slide-out {
        transform: translateY(-100%);
        opacity: 0;
        pointer-events: none;
      }
    }

    /* Top Nav Bar */
    .top-nav-bar {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-top: max(8px, env(safe-area-inset-top));
      width: 100%;
    }

    .back-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      color: #1F2937;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .skip-btn {
      background: none;
      border: none;
      color: #0F472B;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      padding: 6px;
    }

    .brand-top-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 3px;

      :deep(.chef-icon) {
        color: #0F472B;
      }

      .yellow-badge {
        background: #F59E0B;
        color: #0F472B;
        font-weight: 900;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 6px;
        line-height: 1;
      }
    }

    .brand-heading {
      font-size: 17px;
      font-weight: 900;
      color: #0F472B;
      margin: 0;
      letter-spacing: 1px;
    }

    .sub-rule {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 2px 0;

      .line {
        width: 18px;
        height: 1.5px;
        background: #F59E0B;
      }

      .city {
        font-size: 10px;
        font-weight: 800;
        color: #F59E0B;
        letter-spacing: 2px;
      }
    }

    .kitchen-tag {
      font-size: 8.5px;
      font-weight: 700;
      color: #0F472B;
      letter-spacing: 2.5px;
      opacity: 0.85;
    }

    /* 3D Map Section */
    .map-graphic-section {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px 0 10px;
      position: relative;
    }

    .map-illustration {
      width: 220px;
      height: 140px;
      perspective: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .map-sheet {
      width: 190px;
      height: 120px;
      background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
      border: 2px solid #86EFAC;
      border-radius: 16px;
      box-shadow: 0 14px 30px rgba(15, 71, 43, 0.15);
      transform: rotateX(28deg) rotateZ(-3deg);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .map-grid-roads {
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(#BBF7D0 2px, transparent 2px),
        linear-gradient(to right, rgba(16, 185, 129, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
      background-size: 24px 24px, 20px 20px, 20px 20px;
    }

    .map-pin-anchor {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
    }

    .pulsing-halo {
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.35);
      animation: radarPulse 1.8s infinite ease-out;
    }

    @keyframes radarPulse {
      0% { transform: scale(0.5); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    .pin-emerald {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(145deg, #0F472B, #165335);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #FFFFFF;
      box-shadow: 0 8px 20px rgba(15, 71, 43, 0.4);
    }

    /* Text section */
    .location-text-section {
      text-align: center;
      padding: 0 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .main-title {
      font-size: 23px;
      font-weight: 800;
      color: #0F472B;
      margin: 0;
      letter-spacing: -0.3px;
    }

    .yellow-swoosh {
      width: 44px;
      height: 4px;
      background: #F59E0B;
      border-radius: 4px;
      margin: 4px 0 10px;
    }

    .sub-text {
      font-size: 13px;
      color: #4B5563;
      margin: 0;
      line-height: 1.45;
      max-width: 310px;
    }

    .success-loc-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #DCFCE7;
      color: #15803D;
      border: 1px solid #86EFAC;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 700;
      margin-top: 10px;
      animation: popIn 0.3s ease;
    }

    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* Buttons */
    .actions-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 18px 0;
      width: 100%;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .btn-use-location {
      background: linear-gradient(135deg, #0F472B 0%, #175F3A 100%);
      color: #FFFFFF;
      border: none;
      height: 50px;
      border-radius: 100px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(15, 71, 43, 0.28);
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.98);
      }

      .btn-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .btn-text {
        font-size: 14.5px;
        font-weight: 700;
      }
    }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn-search-location {
      background: #FFFFFF;
      color: #1F2937;
      border: 1.5px solid #D1D5DB;
      height: 48px;
      border-radius: 100px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

      .btn-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .btn-text {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }
    }

    .btn-saved-address {
      background: #ECFDF5;
      color: #065F46;
      border: 1px solid #A7F3D0;
      height: 46px;
      border-radius: 100px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      .btn-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .btn-text {
        font-size: 13.5px;
        font-weight: 700;
      }
    }

    /* Popular Areas Drawer */
    .areas-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 1000;
    }

    .areas-drawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #FFFFFF;
      border-radius: 24px 24px 0 0;
      padding: 18px 20px 30px;
      z-index: 1001;
      max-height: 70vh;
      overflow-y: auto;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
      animation: drawerUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes drawerUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 14px;
      border-bottom: 1px solid #E5E7EB;

      h3 {
        font-size: 16px;
        font-weight: 800;
        color: #0F472B;
        margin: 0;
      }

      .close-drawer-btn {
        background: #F3F4F6;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
    }

    .areas-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 14px;
    }

    .area-item-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 14px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;

      &:active {
        background: #ECFDF5;
        border-color: #0F472B;
      }

      .area-icon-wrap {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #EAF7EE;
        color: #0F472B;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .area-texts {
        display: flex;
        flex-direction: column;

        strong {
          font-size: 13.5px;
          color: #111827;
        }

        span {
          font-size: 11px;
          color: #6B7280;
        }
      }
    }

    /* Bottom Skyline & Wave */
    .bottom-monument-wave {
      width: 100%;
      height: 48px;
      position: relative;
      margin-top: auto;
    }

    .bottom-green-wave {
      position: absolute;
      bottom: 0;
      left: -20px;
      right: -20px;
      height: 28px;
      background: #0F472B;
      border-top: 3px solid #F59E0B;
      border-radius: 40% 40% 0 0;
    }
  `]
})
export class LocationScreenComponent {
  platformService = inject(PlatformService);

  @Output() locationConfirmed = new EventEmitter<string>();

  isLoadingGps = signal<boolean>(false);
  isDismissing = signal<boolean>(false);
  selectedLocationMsg = signal<string | null>(null);
  showPopularAreas = signal<boolean>(false);

  readonly bidarAreas = [
    'Gandhi Gunj',
    'Naubad',
    'Shivnagar',
    'Gumpa',
    'Mailoor',
    'Railway Station Road',
    'Civil Hospital Road',
    'Bidar Fort Area',
    'Halladkeri',
    'Manhalli Road'
  ];

  detectLiveLocation(): void {
    this.isLoadingGps.set(true);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.confirmLocation('Bidar, Karnataka');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const locality =
              addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.road ||
              addr.village ||
              addr.town ||
              addr.city_district ||
              'Bidar';
            const city = addr.city || addr.town || addr.county || 'Bidar';
            this.confirmLocation(`${locality}, ${city}`);
          } else {
            this.confirmLocation('Bidar, Karnataka');
          }
        } catch (e) {
          this.confirmLocation('Bidar, Karnataka');
        }
      },
      (err) => {
        this.confirmLocation('Bidar, Karnataka');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  toggleSearch(): void {
    this.showPopularAreas.set(true);
  }

  chooseArea(area: string): void {
    this.showPopularAreas.set(false);
    this.confirmLocation(`${area}, Bidar`);
  }

  skipToBidar(): void {
    this.confirmLocation('Bidar, Karnataka');
  }

  private confirmLocation(locationName: string): void {
    this.isLoadingGps.set(false);
    this.selectedLocationMsg.set(`Selected: ${locationName}`);
    this.platformService.userLocationName.set(locationName);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tbzb_saved_location', locationName);
      }
    } catch (e) {}

    // Update status bar theme to match App header (#0B2F1D)
    this.updateThemeColor('#0B2F1D');

    setTimeout(() => {
      this.isDismissing.set(true);
      setTimeout(() => {
        this.locationConfirmed.emit(locationName);
      }, 350);
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
}

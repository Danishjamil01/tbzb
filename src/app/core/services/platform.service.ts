import { Injectable, signal, computed, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocationService } from './location.service';

export type AppTab = 'home' | 'menu' | 'orders' | 'cart' | 'more';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private locationService = inject(LocationService);

  // Is running natively inside Capacitor (Android/iOS App)
  readonly isNative = signal<boolean>(Capacitor.isNativePlatform());

  // Is installed as a Standalone PWA on mobile device
  readonly isStandalonePwa = signal<boolean>(this.checkStandalone());

  // Optional query param override for testing (e.g. ?mode=app)
  private readonly hasAppParam = typeof window !== 'undefined' && window.location.search.includes('mode=app');

  // Window width tracking for responsive screen mode
  readonly windowWidth = signal<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Small screen (mobile device viewport <= 768px)
  readonly isSmallScreen = computed<boolean>(() => {
    return this.windowWidth() <= 768;
  });

  // Strict Rule: Native APK / PWA / Small Screen -> Customer Mobile App Module ONLY; Big Screen -> Website Module
  readonly isMobileScreen = computed<boolean>(() => {
    if (this.isNative() || this.isStandalonePwa() || this.hasAppParam) {
      return true;
    }
    return this.isSmallScreen();
  });

  // Alias for backward compatibility
  readonly isAppMode = computed<boolean>(() => {
    return this.isMobileScreen();
  });

  // Active Mobile App Tab
  readonly activeTab = signal<AppTab>('home');

  // Customer's last placed order for live tracking in App
  readonly customerActiveOrder = signal<any>(this.loadCustomerOrder());

  // Real GPS Location state
  readonly userLocationName = signal<string>(this.loadSavedLocationName() || 'Verify Location');
  readonly userFullAddress = signal<string>('');
  readonly userCoordinates = signal<{ lat: number; lng: number } | null>(this.loadSavedCoordinates());
  // True hardware GPS coords (NEVER overwritten by manual chips/search)
  readonly deviceGpsCoordinates = signal<{ lat: number; lng: number } | null>(null);
  readonly isLocating = signal<boolean>(false);
  readonly gpsError = signal<string | null>(null);

  readonly isOutsideDeliveryZone = computed<boolean>(() => {
    const coords = this.userCoordinates();
    if (!coords) {
      return false;
    }
    return !this.locationService.validateDeliveryEligibility(coords, this.userLocationName()).allowed;
  });

  constructor() {
    // Automatically attempt real GPS detection on startup
    this.fetchRealLocation();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.windowWidth.set(window.innerWidth);
      });

      window.addEventListener('storage', (e) => {
        if (e.key === 'tbzb_customer_last_order') {
          this.customerActiveOrder.set(this.loadCustomerOrder());
        }
      });
    }
  }

  async fetchRealLocation(): Promise<boolean> {
    this.isLocating.set(true);
    this.gpsError.set(null);

    const gps = await this.locationService.detectRealGpsLocation();
    if (gps.success && gps.lat !== undefined && gps.lng !== undefined) {
      const coords = { lat: gps.lat, lng: gps.lng };
      this.deviceGpsCoordinates.set(coords);
      this.userCoordinates.set(coords);

      const geo = await this.locationService.reverseGeocode(gps.lat, gps.lng);
      this.userLocationName.set(geo.shortLabel);
      this.userFullAddress.set(geo.fullAddress);

      this.isLocating.set(false);
      return true;
    } else {
      this.gpsError.set(gps.error || 'Could not detect GPS location.');
      if (!this.loadSavedLocationName()) {
        this.userLocationName.set('GPS Verification Needed');
      }
      this.isLocating.set(false);
      return false;
    }
  }

  saveVerifiedLocation(label: string, fullAddress: string, coords: { lat: number; lng: number }): void {
    this.userLocationName.set(label);
    this.userFullAddress.set(fullAddress || label);
    this.userCoordinates.set(coords);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tbzb_saved_location', label);
        localStorage.setItem('tbzb_saved_coords', JSON.stringify(coords));
      }
    } catch (e) { }
  }

  private loadSavedLocationName(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('tbzb_saved_location');
    } catch (e) {
      return null;
    }
  }

  private loadSavedCoordinates(): { lat: number; lng: number } | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('tbzb_saved_coords');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
          return parsed;
        }
      }
    } catch (e) { }
    return null;
  }

  private checkStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any)?.standalone === true
    );
  }

  private loadCustomerOrder(): any {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('tbzb_customer_last_order');
      if (data) return JSON.parse(data);
    } catch (e) { }
    return null;
  }

  setCustomerOrder(order: any): void {
    this.customerActiveOrder.set(order);
    try {
      if (typeof window !== 'undefined') {
        if (order) {
          localStorage.setItem('tbzb_customer_last_order', JSON.stringify(order));
        } else {
          localStorage.removeItem('tbzb_customer_last_order');
        }
      }
    } catch (e) { }
  }

  setTab(tab: AppTab): void {
    this.activeTab.set(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

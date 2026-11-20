import { Injectable, signal, computed } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export type AppTab = 'home' | 'menu' | 'orders' | 'cart' | 'more';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  // Is running natively inside Capacitor (Android/iOS App)
  readonly isNative = signal<boolean>(Capacitor.isNativePlatform());

  // Is installed as a Standalone PWA on mobile device
  readonly isStandalonePwa = signal<boolean>(this.checkStandalone());

  // Optional query param override for testing (e.g. ?mode=app)
  private readonly hasAppParam = typeof window !== 'undefined' && window.location.search.includes('mode=app');

  // Strict Rule:
  // Native APK/AAB App -> Opens App Layout ONLY.
  // Installed PWA Standalone -> Opens App Layout ONLY.
  // Any Web Browser (Mobile browser or Desktop browser) -> Opens Website Layout ONLY!
  readonly isAppMode = computed<boolean>(() => {
    return this.isNative() || this.isStandalonePwa() || this.hasAppParam;
  });

  // Active Mobile App Tab
  readonly activeTab = signal<AppTab>('home');

  // Customer's last placed order for live tracking in App
  readonly customerActiveOrder = signal<any>(this.loadCustomerOrder());

  // Real GPS Location state
  readonly userLocationName = signal<string>('Detecting location...');
  readonly userCoordinates = signal<{ lat: number; lng: number } | null>(null);
  readonly isLocating = signal<boolean>(false);

  constructor() {
    // Automatically fetch real device location on startup
    this.fetchRealLocation();

    if (typeof window !== 'undefined') {
      // Listen for storage changes (e.g. order placed in checkout modal)
      window.addEventListener('storage', (e) => {
        if (e.key === 'tbzb_customer_last_order') {
          this.customerActiveOrder.set(this.loadCustomerOrder());
        }
      });
    }
  }

  fetchRealLocation(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.userLocationName.set('Bidar, Karnataka');
      return;
    }

    this.isLocating.set(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        this.userCoordinates.set({ lat: latitude, lng: longitude });

        try {
          // OpenStreetMap Nominatim reverse geocode (Free & accurate)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              signal: controller.signal,
              headers: { 'Accept-Language': 'en' }
            }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};

            // Prioritize local neighborhood/area
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
            this.userLocationName.set(`${locality}, ${city}`);
          } else {
            this.userLocationName.set('Bidar, Karnataka');
          }
        } catch (e) {
          // Fallback on timeout or network error
          this.userLocationName.set('Bidar, Karnataka');
        } finally {
          this.isLocating.set(false);
        }
      },
      (error) => {
        this.isLocating.set(false);
        this.userLocationName.set('Bidar, Karnataka');
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000
      }
    );
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
    } catch (e) {}
    return null;
  }

  setCustomerOrder(order: any): void {
    this.customerActiveOrder.set(order);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tbzb_customer_last_order', JSON.stringify(order));
      }
    } catch (e) {}
  }

  setTab(tab: AppTab): void {
    this.activeTab.set(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

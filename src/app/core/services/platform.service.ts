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

  async fetchRealLocation(): Promise<void> {
    this.isLocating.set(true);

    // Step 1: Immediate Worldwide IP Geolocation baseline (works anywhere on Earth instantly)
    try {
      const ipController = new AbortController();
      const ipTimeout = setTimeout(() => ipController.abort(), 3500);
      const ipRes = await fetch('https://ipwho.is/', { signal: ipController.signal });
      clearTimeout(ipTimeout);

      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.success) {
          const city = ipData.city || 'Current Location';
          const region = ipData.region || ipData.country || '';
          const name = region ? `${city}, ${region}` : city;
          this.userLocationName.set(name);
          this.userCoordinates.set({ lat: ipData.latitude, lng: ipData.longitude });
        }
      }
    } catch (e) {
      // Ignore IP timeout, proceed to GPS
    }

    // Step 2: High-accuracy Device GPS (pinpoints exact street / neighborhood)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.isLocating.set(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        this.userCoordinates.set({ lat: latitude, lng: longitude });

        try {
          // Accurate free client-side reverse geocoding via BigDataCloud
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const locality = data.locality || data.suburb || data.neighbourhood || data.city || '';
            const city = data.city || data.principalSubdivision || data.countryName || '';
            const locationString = locality && locality !== city ? `${locality}, ${city}` : (city || 'Current Location');
            this.userLocationName.set(locationString);
          }
        } catch (e) {
          // Keep the IP-detected location if reverse geocoding fails
        } finally {
          this.isLocating.set(false);
        }
      },
      (error) => {
        this.isLocating.set(false);
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

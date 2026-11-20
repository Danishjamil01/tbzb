import { Injectable, signal, computed } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export type AppTab = 'home' | 'menu' | 'orders' | 'cart' | 'more';
export type ViewMode = 'auto' | 'app' | 'web';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  // Is running natively inside Capacitor (Android/iOS)
  readonly isNative = signal<boolean>(Capacitor.isNativePlatform());

  // Is installed as a Standalone PWA on mobile device
  readonly isStandalonePwa = signal<boolean>(this.checkStandalone());

  // Mobile viewport detection
  readonly isMobileScreen = signal<boolean>(this.checkMobileScreen());

  // User manual view preference: 'auto' | 'app' | 'web'
  readonly userViewPreference = signal<ViewMode>(this.loadViewPreference());

  // Active Mobile App Tab
  readonly activeTab = signal<AppTab>('home');

  // Customer's last placed order for live tracking in App
  readonly customerActiveOrder = signal<any>(this.loadCustomerOrder());

  // Computed: whether to render the dedicated App Layout vs. the Website Layout
  readonly isAppMode = computed<boolean>(() => {
    const pref = this.userViewPreference();
    if (pref === 'app') return true;
    if (pref === 'web') return false;

    // In 'auto' mode:
    // Native mobile app or standalone PWA -> always App Mode!
    if (this.isNative() || this.isStandalonePwa()) {
      return true;
    }
    // Mobile screen (phone) -> default to App Mode for best mobile experience!
    return this.isMobileScreen();
  });

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.isMobileScreen.set(this.checkMobileScreen());
      });

      // Listen for storage changes (e.g. order placed in checkout modal)
      window.addEventListener('storage', (e) => {
        if (e.key === 'tbzb_customer_last_order') {
          this.customerActiveOrder.set(this.loadCustomerOrder());
        }
      });
    }
  }

  private checkStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any)?.standalone === true
    );
  }

  private checkMobileScreen(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  }

  private loadViewPreference(): ViewMode {
    if (typeof window === 'undefined') return 'auto';
    try {
      const saved = localStorage.getItem('tbzb_view_mode') as ViewMode;
      if (saved === 'app' || saved === 'web' || saved === 'auto') {
        return saved;
      }
    } catch (e) {}
    return 'auto';
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

  setViewPreference(pref: ViewMode): void {
    this.userViewPreference.set(pref);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tbzb_view_mode', pref);
      }
    } catch (e) {}
  }

  toggleViewMode(): void {
    const current = this.isAppMode();
    this.setViewPreference(current ? 'web' : 'app');
  }
}

import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Injectable({
  providedIn: 'root'
})
export class StatusBarService {
  /**
   * Set status bar to Light (e.g. White or Cream background with dark text/icons)
   */
  async setLightMode(color: string = '#FFFFFF'): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color });
      } catch (e) {
        console.warn('Failed to set light status bar', e);
      }
    }
    this.updateMetaTheme(color);
  }

  /**
   * Set status bar to Dark (e.g. Dark green header #092819 with white text/icons)
   */
  async setDarkMode(color: string = '#092819'): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color });
      } catch (e) {
        console.warn('Failed to set dark status bar', e);
      }
    }
    this.updateMetaTheme(color);
  }

  private updateMetaTheme(color: string): void {
    if (typeof document !== 'undefined') {
      const metas = document.querySelectorAll('meta[name="theme-color"]');
      metas.forEach(m => m.setAttribute('content', color));
    }
  }
}

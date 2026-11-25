import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

interface EdgeStatusBarPlugin {
  setBar(options: { color: string; isLight: boolean }): Promise<void>;
}

const EdgeStatusBar = registerPlugin<EdgeStatusBarPlugin>('EdgeStatusBar');

@Injectable({
  providedIn: 'root'
})
export class StatusBarService {
  private lastColor = '#092819';
  private lastStyle: Style = Style.Dark;

  constructor() {
    this.observeSafeAreaUpdates();
  }

  /**
   * Set status bar to Light (e.g. White background with dark text/icons)
   */
  async setLightMode(color: string = '#FFFFFF'): Promise<void> {
    await this.applyStatusBar(color, Style.Light);
  }

  /**
   * Set status bar to Dark (e.g. Red #DC2626 or Dark green #092819 background with white text/icons)
   */
  async setDarkMode(color: string = '#092819'): Promise<void> {
    await this.applyStatusBar(color, Style.Dark);
  }

  private async applyStatusBar(color: string, style: Style): Promise<void> {
    this.lastColor = color;
    this.lastStyle = style;
    this.updateMetaTheme(color);

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const isLight = style === Style.Light;

    if (Capacitor.isPluginAvailable('EdgeStatusBar')) {
      try {
        await EdgeStatusBar.setBar({ color, isLight });
      } catch (e) {
        console.warn('EdgeStatusBar fallback failed', e);
      }
    }

    try {
      const hasCssSafeArea = this.hasSafeAreaTopInset();
      await StatusBar.setOverlaysWebView({ overlay: hasCssSafeArea });
      await StatusBar.setStyle({ style });
      if (!hasCssSafeArea) {
        await StatusBar.setBackgroundColor({ color });
      }
    } catch (e) {
      console.warn('Failed to configure status bar', e);
    }
  }

  private hasSafeAreaTopInset(): boolean {
    if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') {
      return false;
    }
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top').trim();
    return parseFloat(raw) > 0;
  }

  private observeSafeAreaUpdates(): void {
    if (!Capacitor.isNativePlatform() || typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
      return;
    }

    let lastInset = this.hasSafeAreaTopInset();
    const observer = new MutationObserver(() => {
      const hasInset = this.hasSafeAreaTopInset();
      if (hasInset && !lastInset) {
        lastInset = true;
        observer.disconnect();
        void this.applyStatusBar(this.lastColor, this.lastStyle);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  private updateMetaTheme(color: string): void {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--tbzb-status-bar-bg', color);
      const metas = document.querySelectorAll('meta[name="theme-color"]');
      metas.forEach(m => m.setAttribute('content', color));
    }
  }
}

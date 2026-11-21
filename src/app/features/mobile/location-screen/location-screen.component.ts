import { Component, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformService } from '../../../core/services/platform.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-location-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './location-screen.component.html',
  styleUrl: './location-screen.component.scss'
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

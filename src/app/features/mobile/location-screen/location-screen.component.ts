import { Component, inject, OnInit, OnDestroy, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PlatformService } from '../../../core/services/platform.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-location-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './location-screen.component.html',
  styleUrl: './location-screen.component.scss'
})
export class LocationScreenComponent implements OnInit, OnDestroy {
  platformService = inject(PlatformService);
  private sanitizer = inject(DomSanitizer);

  @Output() locationConfirmed = new EventEmitter<string>();

  isLoadingGps = signal<boolean>(true);
  isDismissing = signal<boolean>(false);
  detectedLocationName = signal<string | null>(null);
  detectedCoords = signal<{ lat: number; lng: number } | null>(null);
  safeMapUrl = signal<SafeResourceUrl | null>(null);
  showPopularAreas = signal<boolean>(false);

  private autoConfirmTimer: any = null;

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

  ngOnInit(): void {
    // 1. Initial Google Map centered on Bidar (17.9104, 77.5199)
    this.updateMapCoordinates(17.9104, 77.5199);

    // 2. Automatically trigger live GPS location detection immediately
    this.detectLiveLocation();
  }

  detectLiveLocation(): void {
    this.isLoadingGps.set(true);
    this.detectedLocationName.set(null);
    if (this.autoConfirmTimer) clearTimeout(this.autoConfirmTimer);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.handleLocationFound('Bidar, Karnataka', 17.9104, 77.5199);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const lat = Number(latitude.toFixed(6));
        const lng = Number(longitude.toFixed(6));
        this.detectedCoords.set({ lat, lng });
        this.platformService.userCoordinates.set({ lat, lng });
        this.updateMapCoordinates(lat, lng);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
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
            this.handleLocationFound(`${locality}, ${city}`, lat, lng);
          } else {
            this.handleLocationFound('Bidar, Karnataka', lat, lng);
          }
        } catch (e) {
          this.handleLocationFound('Bidar, Karnataka', lat, lng);
        }
      },
      (err) => {
        // Fallback gracefully on timeout/denied to default Bidar coordinates
        this.handleLocationFound('Bidar, Karnataka', 17.9104, 77.5199);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  private handleLocationFound(locationName: string, lat: number, lng: number): void {
    this.isLoadingGps.set(false);
    this.detectedLocationName.set(locationName);
    this.detectedCoords.set({ lat, lng });
    this.platformService.userLocationName.set(locationName);

    // Auto-confirm after 2 seconds to smoothly take user to Home Screen
    this.autoConfirmTimer = setTimeout(() => {
      this.confirmLocation(locationName);
    }, 2200);
  }

  confirmNow(): void {
    if (this.autoConfirmTimer) clearTimeout(this.autoConfirmTimer);
    const loc = this.detectedLocationName() || 'Bidar, Karnataka';
    this.confirmLocation(loc);
  }

  chooseArea(area: string): void {
    if (this.autoConfirmTimer) clearTimeout(this.autoConfirmTimer);
    this.showPopularAreas.set(false);
    this.confirmLocation(`${area}, Bidar`);
  }

  skipToBidar(): void {
    if (this.autoConfirmTimer) clearTimeout(this.autoConfirmTimer);
    this.confirmLocation('Bidar, Karnataka');
  }

  private confirmLocation(locationName: string): void {
    if (this.autoConfirmTimer) clearTimeout(this.autoConfirmTimer);
    this.platformService.userLocationName.set(locationName);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tbzb_saved_location', locationName);
      }
    } catch (e) {}

    this.isDismissing.set(true);
    setTimeout(() => {
      this.locationConfirmed.emit(locationName);
    }, 350);
  }

  private updateMapCoordinates(lat: number, lng: number): void {
    const rawUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
    this.safeMapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
  }

  ngOnDestroy(): void {
    if (this.autoConfirmTimer) {
      clearTimeout(this.autoConfirmTimer);
    }
  }
}

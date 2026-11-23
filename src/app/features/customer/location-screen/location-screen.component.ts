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
    // 1. If coordinates already available from PlatformService, use them immediately
    const existingCoords = this.platformService.userCoordinates();
    if (existingCoords) {
      this.updateMapCoordinates(existingCoords.lat, existingCoords.lng);
      this.detectedCoords.set(existingCoords);
    } else {
      // Default to initial view
      this.updateMapCoordinates(17.9104, 77.5199);
    }

    // 2. Automatically trigger live location detection immediately
    this.detectLiveLocation();
  }

  async detectLiveLocation(): Promise<void> {
    this.isLoadingGps.set(true);
    this.detectedLocationName.set(null);
    if (this.autoConfirmTimer) clearTimeout(this.autoConfirmTimer);

    let ipResolvedLoc: { name: string; lat: number; lng: number } | null = null;

    // Step A: Fast worldwide IP Geolocation (instant baseline anywhere on Earth)
    try {
      const ipController = new AbortController();
      const ipTimeout = setTimeout(() => ipController.abort(), 3500);
      const ipRes = await fetch('https://ipwho.is/', { signal: ipController.signal });
      clearTimeout(ipTimeout);

      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.success) {
          const city = ipData.city || '';
          const region = ipData.region || ipData.country || '';
          const fullName = region ? `${city}, ${region}` : city;
          ipResolvedLoc = {
            name: fullName,
            lat: Number(ipData.latitude),
            lng: Number(ipData.longitude)
          };

          // Update map and coordinates immediately to user's real current location
          this.updateMapCoordinates(ipResolvedLoc.lat, ipResolvedLoc.lng);
          this.detectedCoords.set({ lat: ipResolvedLoc.lat, lng: ipResolvedLoc.lng });
          this.detectedLocationName.set(fullName);
        }
      }
    } catch (e) {
      // Ignore IP timeout, proceed to GPS
    }

    // Step B: Precise Device GPS Geolocation
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (ipResolvedLoc) {
        this.handleLocationFound(ipResolvedLoc.name, ipResolvedLoc.lat, ipResolvedLoc.lng);
      } else {
        this.handleLocationFound('Bidar, Karnataka', 17.9104, 77.5199);
      }
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
          // Reverse geocode via BigDataCloud
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const locality = data.locality || data.suburb || data.neighbourhood || data.city || '';
            const city = data.city || data.principalSubdivision || data.countryName || '';
            const locationName = locality && locality !== city ? `${locality}, ${city}` : (city || 'Current Location');
            this.handleLocationFound(locationName, lat, lng);
            return;
          }
        } catch (e) {
          // BigDataCloud failed, try OpenStreetMap Nominatim as fallback
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            if (nomRes.ok) {
              const nomData = await nomRes.json();
              const addr = nomData.address || {};
              const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village || addr.town || '';
              const city = addr.city || addr.town || addr.county || '';
              const loc = locality && locality !== city ? `${locality}, ${city}` : (city || 'Current Location');
              this.handleLocationFound(loc, lat, lng);
              return;
            }
          } catch (ne) {}
        }

        // If reverse geocoding services failed, use IP name or coordinates
        if (ipResolvedLoc) {
          this.handleLocationFound(ipResolvedLoc.name, lat, lng);
        } else {
          this.handleLocationFound('Current Location', lat, lng);
        }
      },
      (err) => {
        // GPS denied or timed out -> use IP resolved real location!
        if (ipResolvedLoc) {
          this.handleLocationFound(ipResolvedLoc.name, ipResolvedLoc.lat, ipResolvedLoc.lng);
        } else {
          this.handleLocationFound('Bidar, Karnataka', 17.9104, 77.5199);
        }
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
    const loc = this.detectedLocationName() || this.platformService.userLocationName() || 'Bidar, Karnataka';
    this.confirmLocation(loc);
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

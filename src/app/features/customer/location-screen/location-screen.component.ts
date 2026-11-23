import { Component, inject, OnInit, OnDestroy, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PlatformService } from '../../../core/services/platform.service';
import { ToastService } from '../../../core/services/toast.service';
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
  private toastService = inject(ToastService);

  @Output() locationConfirmed = new EventEmitter<string>();

  isLoadingGps = signal<boolean>(true);
  isDismissing = signal<boolean>(false);
  detectedLocationName = signal<string | null>(null);
  detectedCoords = signal<{ lat: number; lng: number } | null>(null);
  safeMapUrl = signal<SafeResourceUrl | null>(null);
  showPopularAreas = signal<boolean>(false);

  // Outside Bidar Geofence info (informational at login, restricted at checkout)
  isOutsideBidar = signal<boolean>(false);
  outsideDistanceKm = signal<number | null>(null);
  outsideCityName = signal<string | null>(null);

  // Editable delivery area / location (pre-filled with real user location)
  customAreaInput: string = '';

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
    'Manhalli Road',
    'Noor Khan Taleem',
    'Chidri Road',
    'Udgir Road'
  ];

  readonly quickChips = [
    'Gandhi Gunj',
    'Naubad',
    'Shivnagar',
    'Gumpa',
    'Mailoor',
    'Bidar Fort Area'
  ];

  // Bidar Kitchen Coordinates (TBZB Kitchen Center)
  private readonly BIDAR_KITCHEN_LAT = 17.9104;
  private readonly BIDAR_KITCHEN_LNG = 77.5199;
  private readonly MAX_DELIVERY_RADIUS_KM = 25; // Bidar delivery radius

  ngOnInit(): void {
    const existingCoords = this.platformService.userCoordinates();
    if (existingCoords) {
      this.updateMapCoordinates(existingCoords.lat, existingCoords.lng);
      this.detectedCoords.set(existingCoords);
    }

    const existingName = this.platformService.userLocationName();
    if (existingName) {
      this.customAreaInput = existingName;
      this.detectedLocationName.set(existingName);
    }

    // Trigger real live location detection immediately
    this.detectLiveLocation();
  }

  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async detectLiveLocation(): Promise<void> {
    this.isLoadingGps.set(true);

    // 1. Try real device GPS first (highest accuracy)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const lat = Number(latitude.toFixed(6));
          const lng = Number(longitude.toFixed(6));
          this.applyCoordinates(lat, lng);

          // Reverse geocode real street / locality / city
          const realName = await this.reverseGeocode(lat, lng);
          this.applyResolvedLocation(realName, lat, lng);
        },
        async (err) => {
          // GPS denied or timed out -> Fallback to real IP geolocation (wherever the user actually is)
          await this.fallbackToIpLocation();
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      await this.fallbackToIpLocation();
    }
  }

  private async fallbackToIpLocation(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const lat = Number(data.latitude);
          const lng = Number(data.longitude);
          const city = data.city || '';
          const region = data.region || data.country || '';
          const locName = city && region ? `${city}, ${region}` : (city || 'Current Location');

          this.applyCoordinates(lat, lng);
          this.applyResolvedLocation(locName, lat, lng);
          return;
        }
      }
    } catch (e) {
      // IP fetch failed
    }

    // Final graceful fallback if both GPS and IP are blocked
    this.isLoadingGps.set(false);
    if (!this.customAreaInput) {
      this.customAreaInput = 'Bidar, Karnataka';
      this.detectedLocationName.set('Bidar, Karnataka');
    }
    this.updateMapCoordinates(this.BIDAR_KITCHEN_LAT, this.BIDAR_KITCHEN_LNG);
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const locality = data.locality || data.suburb || data.neighbourhood || '';
        const city = data.city || data.principalSubdivision || '';
        if (locality && city && locality !== city) {
          return `${locality}, ${city}`;
        }
        return city || locality || 'Current Location';
      }
    } catch (e) {}

    return 'Current Location';
  }

  private applyCoordinates(lat: number, lng: number): void {
    this.detectedCoords.set({ lat, lng });
    this.platformService.userCoordinates.set({ lat, lng });
    this.updateMapCoordinates(lat, lng);
  }

  private applyResolvedLocation(name: string, lat: number, lng: number): void {
    this.isLoadingGps.set(false);
    this.detectedLocationName.set(name);
    this.customAreaInput = name;
    this.platformService.userLocationName.set(name);

    // Calculate distance from TBZB Kitchen in Bidar
    const distance = this.calculateDistanceKm(this.BIDAR_KITCHEN_LAT, this.BIDAR_KITCHEN_LNG, lat, lng);
    const roundedDist = Math.round(distance);

    if (distance > this.MAX_DELIVERY_RADIUS_KM) {
      this.isOutsideBidar.set(true);
      this.outsideDistanceKm.set(roundedDist);
      this.outsideCityName.set(name);
    } else {
      this.isOutsideBidar.set(false);
    }
  }

  selectQuickChip(chip: string): void {
    this.customAreaInput = `${chip}, Bidar`;
    this.isOutsideBidar.set(false);
  }

  chooseArea(area: string): void {
    this.customAreaInput = `${area}, Bidar`;
    this.showPopularAreas.set(false);
    this.isOutsideBidar.set(false);
  }

  skipToBidar(): void {
    this.customAreaInput = 'Bidar, Karnataka';
    this.confirmLocationAndProceed();
  }

  confirmLocationAndProceed(): void {
    const area = (this.customAreaInput || '').trim() || 'Bidar, Karnataka';

    this.platformService.userLocationName.set(area);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tbzb_saved_location', area);
      }
    } catch (e) {}

    this.isDismissing.set(true);
    setTimeout(() => {
      this.locationConfirmed.emit(area);
    }, 280);
  }

  private updateMapCoordinates(lat: number, lng: number): void {
    const rawUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
    this.safeMapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
  }

  ngOnDestroy(): void {}
}

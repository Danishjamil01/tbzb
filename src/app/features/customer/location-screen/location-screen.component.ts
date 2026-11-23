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

  // Outside Bidar Geofence state
  isOutsideBidar = signal<boolean>(false);
  outsideDistanceKm = signal<number | null>(null);
  outsideCityName = signal<string | null>(null);

  // Editable delivery area chosen by the customer
  customAreaInput: string = 'Gandhi Gunj, Bidar';

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
  private readonly MAX_DELIVERY_RADIUS_KM = 25; // Bidar city limits

  ngOnInit(): void {
    const existingCoords = this.platformService.userCoordinates();
    if (existingCoords) {
      this.updateMapCoordinates(existingCoords.lat, existingCoords.lng);
      this.detectedCoords.set(existingCoords);
    } else {
      this.updateMapCoordinates(this.BIDAR_KITCHEN_LAT, this.BIDAR_KITCHEN_LNG);
    }

    // Trigger live GPS detection
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

  isForbiddenOutsideCity(text: string): boolean {
    const forbidden = [
      'hyderabad', 'bengaluru', 'bangalore', 'secunderabad', 'mumbai',
      'delhi', 'pune', 'gulbarga', 'kalaburagi', 'humnabad', 'bhalki',
      'aurad', 'basavakalyan', 'chennai', 'kolkata'
    ];
    const lower = (text || '').toLowerCase().trim();
    return forbidden.some(city => lower.includes(city));
  }

  detectLiveLocation(): void {
    this.isLoadingGps.set(true);
    this.isOutsideBidar.set(false);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.fallbackToBidarDefault('Geolocation not supported. Defaulting to Bidar.');
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

        // Distance check from TBZB Bidar Kitchen
        const distance = this.calculateDistanceKm(this.BIDAR_KITCHEN_LAT, this.BIDAR_KITCHEN_LNG, lat, lng);
        const roundedDist = Math.round(distance);

        let resolvedName = 'Bidar, Karnataka';

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const locality = data.locality || data.suburb || data.neighbourhood || '';
            const city = data.city || data.principalSubdivision || '';
            resolvedName = locality && locality !== city ? `${locality}, ${city}` : (city || 'Current Location');
          }
        } catch (e) {
          // Geocode failed
        }

        this.isLoadingGps.set(false);

        if (distance > this.MAX_DELIVERY_RADIUS_KM) {
          // User is physically outside Bidar (e.g. Hyderabad, Bengaluru)
          this.isOutsideBidar.set(true);
          this.outsideDistanceKm.set(roundedDist);
          this.outsideCityName.set(resolvedName);
          this.detectedLocationName.set(resolvedName);
          // Pre-fill with a valid Bidar delivery area so they can select Bidar address if ordering for someone in Bidar
          this.customAreaInput = 'Gandhi Gunj, Bidar';
        } else {
          // User is in Bidar!
          this.isOutsideBidar.set(false);
          this.detectedLocationName.set(resolvedName);
          this.customAreaInput = resolvedName.includes('Bidar') ? resolvedName : `${resolvedName}, Bidar`;
        }
      },
      (err) => {
        // GPS permission denied or timed out -> Safely fallback to Bidar, never Bengaluru!
        this.fallbackToBidarDefault('GPS permission denied. Please select your Bidar delivery area.');
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }

  private fallbackToBidarDefault(note: string): void {
    this.isLoadingGps.set(false);
    this.isOutsideBidar.set(false);
    this.detectedLocationName.set('Bidar, Karnataka');
    this.customAreaInput = 'Gandhi Gunj, Bidar';
    this.updateMapCoordinates(this.BIDAR_KITCHEN_LAT, this.BIDAR_KITCHEN_LNG);
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
    this.customAreaInput = 'Gandhi Gunj, Bidar';
    this.confirmLocationAndProceed();
  }

  confirmLocationAndProceed(): void {
    const area = (this.customAreaInput || '').trim();

    if (!area || area.length < 3) {
      this.toastService.show('Please enter your delivery area in Bidar', 'warning');
      return;
    }

    // Boundary Protection: Customer cannot type a non-Bidar city (Hyderabad, Bengaluru, etc.)
    if (this.isForbiddenOutsideCity(area)) {
      this.toastService.show(
        'Delivery is strictly limited to Bidar city limits. Please select a Bidar delivery area.',
        'error',
        'Outside Delivery Zone'
      );
      this.customAreaInput = 'Gandhi Gunj, Bidar';
      return;
    }

    const finalAddress = area.toLowerCase().includes('bidar') ? area : `${area}, Bidar`;
    this.platformService.userLocationName.set(finalAddress);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tbzb_saved_location', finalAddress);
      }
    } catch (e) {}

    this.isDismissing.set(true);
    setTimeout(() => {
      this.locationConfirmed.emit(finalAddress);
    }, 300);
  }

  private updateMapCoordinates(lat: number, lng: number): void {
    const rawUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
    this.safeMapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
  }

  ngOnDestroy(): void {}
}

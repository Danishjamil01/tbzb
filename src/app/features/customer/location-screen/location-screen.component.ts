import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  signal,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { PlatformService } from '../../../core/services/platform.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  LocationService,
  VERIFIED_BIDAR_LOCALITIES,
  BidarLocality,
  AddressSuggestion
} from '../../../core/services/location.service';
import { BUSINESS_CONFIG } from '../../../core/config/business.config';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-location-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './location-screen.component.html',
  styleUrl: './location-screen.component.scss'
})
export class LocationScreenComponent implements OnInit, AfterViewInit, OnDestroy {
  platformService = inject(PlatformService);
  private locationService = inject(LocationService);
  private toastService = inject(ToastService);

  @ViewChild('leafletMap') mapContainer?: ElementRef<HTMLDivElement>;
  @Output() locationConfirmed = new EventEmitter<string>();

  readonly config = BUSINESS_CONFIG.location;
  readonly bidarLocalities = VERIFIED_BIDAR_LOCALITIES;
  readonly quickChips = VERIFIED_BIDAR_LOCALITIES.slice(0, 6);

  isLoadingGps = signal<boolean>(true);
  isDismissing = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  showPopularAreas = signal<boolean>(false);

  detectedLocationName = signal<string | null>(null);
  fullResolvedAddress = signal<string | null>(null);
  detectedCoords = signal<{ lat: number; lng: number } | null>(null);
  isVerifiedPoint = signal<boolean>(false);
  gpsErrorMsg = signal<string | null>(null);

  // Delivery Zone Status (Haversine distance from Vidya Nagar Kitchen)
  isOutsideBidar = signal<boolean>(false);
  distanceFromKitchenKm = signal<number | null>(null);
  outsideCityName = signal<string | null>(null);

  // Search Autocomplete
  searchInput: string = '';
  suggestions = signal<AddressSuggestion[]>([]);
  private searchTimer: any = null;

  // Leaflet Map Instances
  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private kitchenMarker: L.Marker | null = null;
  private radiusCircle: L.Circle | null = null;

  ngOnInit(): void {
    const existingCoords = this.platformService.deviceGpsCoordinates() || this.platformService.userCoordinates();
    if (existingCoords) {
      this.detectedCoords.set(existingCoords);
    }
    const existingName = this.platformService.userLocationName();
    if (existingName && !existingName.includes('Detecting') && !existingName.includes('Verify')) {
      this.searchInput = existingName;
      this.detectedLocationName.set(existingName);
    }
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.initLeafletMap();
      // Always fetch real live GPS right after screen opens (e.g. immediately after login)
      this.detectLiveLocation();
    }
  }

  private initLeafletMap(): void {
    const el = this.mapContainer?.nativeElement;
    if (!el || this.map) return;

    const initialCoords = this.detectedCoords() || {
      lat: this.config.latitude,
      lng: this.config.longitude
    };

    this.map = L.map(el, {
      center: [initialCoords.lat, initialCoords.lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // 18 km Bidar Delivery Radius Overlay around TBZB Kitchen
    this.radiusCircle = L.circle([this.config.latitude, this.config.longitude], {
      radius: this.config.maxDeliveryRadiusKm * 1000,
      color: '#0F472B',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#10B981',
      fillOpacity: 0.08
    }).addTo(this.map);

    // Kitchen Marker (Vidya Nagar, Bidar)
    const kitchenIcon = L.divIcon({
      className: 'tbzb-kitchen-pin',
      html: `<div style="background:#0F472B;color:#FBBF24;padding:4px 8px;border-radius:12px;font-size:10px;font-weight:800;white-space:nowrap;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);">TBZB Kitchen</div>`,
      iconSize: [88, 26],
      iconAnchor: [44, 13]
    });

    this.kitchenMarker = L.marker([this.config.latitude, this.config.longitude], {
      icon: kitchenIcon,
      interactive: false
    }).addTo(this.map);

    // Allow user to tap anywhere on map to drop/move delivery pin cleanly
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      this.onManualMapPinMove(lat, lng);
    });

    // Fix Leaflet tile sizing after slide-in animation finishes
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 380);
  }

  private setUserMapPin(lat: number, lng: number, panZoom: boolean = true): void {
    if (!this.map) return;

    const pinIcon = L.divIcon({
      className: 'tbzb-user-pin',
      html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:#DC2626;color:#fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.35);"><span style="transform:rotate(45deg);font-size:13px;font-weight:800;">●</span></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
    } else {
      this.userMarker = L.marker([lat, lng], {
        icon: pinIcon,
        draggable: true
      }).addTo(this.map);

      this.userMarker.on('dragend', () => {
        if (!this.userMarker) return;
        const pos = this.userMarker.getLatLng();
        this.onManualMapPinMove(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      });
    }

    if (panZoom) {
      this.map.setView([lat, lng], 15, { animate: true });
    }
  }

  private async onManualMapPinMove(lat: number, lng: number): Promise<void> {
    this.isLoadingGps.set(true);
    this.gpsErrorMsg.set(null);
    this.setUserMapPin(lat, lng, false);
    const geo = await this.locationService.reverseGeocode(lat, lng);
    this.applyVerifiedPoint(geo.shortLabel, geo.fullAddress, lat, lng, false);
  }

  async detectLiveLocation(): Promise<void> {
    this.isLoadingGps.set(true);
    this.gpsErrorMsg.set(null);
    this.suggestions.set([]);

    const gps = await this.locationService.detectRealGpsLocation();
    if (gps.success && gps.lat !== undefined && gps.lng !== undefined) {
      this.platformService.deviceGpsCoordinates.set({ lat: gps.lat, lng: gps.lng });
      this.setUserMapPin(gps.lat, gps.lng, true);

      const geo = await this.locationService.reverseGeocode(gps.lat, gps.lng);
      this.applyVerifiedPoint(geo.shortLabel, geo.fullAddress, gps.lat, gps.lng, true);
    } else {
      this.isLoadingGps.set(false);
      this.gpsErrorMsg.set(gps.error || 'Could not detect GPS location.');
      // Keep map centered at Vidya Nagar Kitchen if no GPS yet
      if (this.map && !this.detectedCoords()) {
        this.map.setView([this.config.latitude, this.config.longitude], 13);
      }
      this.toastService.show(gps.error || 'Please enable GPS permission to verify your exact location.', 'warning');
    }
  }

  private applyVerifiedPoint(
    shortLabel: string,
    fullAddress: string,
    lat: number,
    lng: number,
    isLiveGps: boolean
  ): void {
    this.isLoadingGps.set(false);
    this.detectedCoords.set({ lat, lng });
    this.detectedLocationName.set(shortLabel);
    this.fullResolvedAddress.set(fullAddress);
    this.searchInput = shortLabel;
    this.isVerifiedPoint.set(true);

    const check = this.locationService.validateDeliveryEligibility({ lat, lng }, fullAddress);
    this.distanceFromKitchenKm.set(check.distanceKm);

    if (!check.allowed) {
      this.isOutsideBidar.set(true);
      this.outsideCityName.set(shortLabel);
    } else {
      this.isOutsideBidar.set(false);
      this.outsideCityName.set(null);
    }

    // Never overwrite hardware GPS with non-GPS pin; update userCoordinates display selection
    this.platformService.userCoordinates.set({ lat, lng });
    this.platformService.userLocationName.set(shortLabel);
    this.platformService.userFullAddress.set(fullAddress);

    if (isLiveGps) {
      this.platformService.deviceGpsCoordinates.set({ lat, lng });
    }
  }

  onSearchInputChange(value: string): void {
    this.searchInput = value;
    // As soon as user manually edits text without choosing a verified result, mark unverified
    this.isVerifiedPoint.set(false);

    if (this.searchTimer) clearTimeout(this.searchTimer);
    const trimmed = (value || '').trim();
    if (trimmed.length < 2) {
      this.suggestions.set([]);
      return;
    }

    this.searchTimer = setTimeout(async () => {
      this.isSearching.set(true);
      const list = await this.locationService.searchAddressAutocomplete(trimmed);
      this.suggestions.set(list);
      this.isSearching.set(false);
    }, 380);
  }

  selectSuggestion(item: AddressSuggestion): void {
    this.suggestions.set([]);
    this.gpsErrorMsg.set(null);
    this.setUserMapPin(item.lat, item.lng, true);
    this.applyVerifiedPoint(item.label, item.fullAddress, item.lat, item.lng, false);
  }

  selectBidarLocality(loc: BidarLocality): void {
    this.suggestions.set([]);
    this.showPopularAreas.set(false);
    this.gpsErrorMsg.set(null);
    this.setUserMapPin(loc.lat, loc.lng, true);
    this.applyVerifiedPoint(`${loc.name}, Bidar`, loc.fullAddress, loc.lat, loc.lng, false);
  }

  clearSearch(): void {
    this.searchInput = '';
    this.suggestions.set([]);
    this.isVerifiedPoint.set(false);
  }

  confirmLocationAndProceed(): void {
    const coords = this.detectedCoords();
    const label = (this.detectedLocationName() || this.searchInput || '').trim();

    // Prevent fake/random unverified manual text from being saved
    if (!this.isVerifiedPoint() || !coords || !label) {
      this.toastService.show(
        'Please wait for GPS, select a suggestion from search, or tap on the map to verify your location.',
        'warning',
        'Location Not Verified'
      );
      return;
    }

    if (this.locationService.isForbiddenOutsideCity(label)) {
      this.isOutsideBidar.set(true);
      this.outsideCityName.set(label);
    }

    this.platformService.saveVerifiedLocation(
      label,
      this.fullResolvedAddress() || label,
      coords
    );

    if (this.isOutsideBidar()) {
      this.toastService.show(
        'You can browse the menu now. Ordering is restricted to within 18 km of Bidar at checkout.',
        'info',
        'Outside Delivery Zone'
      );
    }

    this.isDismissing.set(true);
    setTimeout(() => {
      this.locationConfirmed.emit(label);
    }, 280);
  }

  skipForBrowsingOnly(): void {
    // Do NOT fake Bidar coordinates on skip!
    const fallbackLabel = this.detectedLocationName() || 'Bidar (Browse Mode)';
    this.isDismissing.set(true);
    setTimeout(() => {
      this.locationConfirmed.emit(fallbackLabel);
    }, 280);
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

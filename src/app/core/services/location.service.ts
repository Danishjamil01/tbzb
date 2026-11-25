import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { BUSINESS_CONFIG } from '../config/business.config';

export interface GpsDetectionResult {
  success: boolean;
  lat?: number;
  lng?: number;
  accuracy?: number;
  permissionDenied?: boolean;
  error?: string;
}

export interface ReverseGeocodeResult {
  fullAddress: string;
  shortLabel: string;
  city: string;
  postcode: string;
  isBidarAddress: boolean;
}

export interface AddressSuggestion {
  label: string;
  fullAddress: string;
  lat: number;
  lng: number;
  distanceKm: number;
  withinDeliveryZone: boolean;
  source: 'bidar-preset' | 'geoapify' | 'osm';
}

export interface BidarLocality {
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

export const VERIFIED_BIDAR_LOCALITIES: BidarLocality[] = [
  {
    name: 'Vidya Nagar',
    fullAddress: 'Vidya Nagar, Bidar, Karnataka 585403',
    lat: 17.904573,
    lng: 77.513351
  },
  {
    name: 'Mailoor',
    fullAddress: 'Mailoor (Mailura), Bidar, Karnataka 585403',
    lat: 17.895327,
    lng: 77.502187
  },
  {
    name: 'Gandhi Gunj',
    fullAddress: 'Gandhi Gunj, Bidar, Karnataka 585401',
    lat: 17.908683,
    lng: 77.515776
  },
  {
    name: 'Naubad',
    fullAddress: 'Naubad, Bidar, Karnataka 585402',
    lat: 17.932637,
    lng: 77.474111
  },
  {
    name: 'Shivnagar',
    fullAddress: 'Shivnagar, Bidar, Karnataka 585401',
    lat: 17.901200,
    lng: 77.520400
  },
  {
    name: 'Gumpa',
    fullAddress: 'Gumpa, Bidar, Karnataka 585403',
    lat: 17.886923,
    lng: 77.528091
  },
  {
    name: 'Bidar Fort Area',
    fullAddress: 'Bidar Fort Area, Bidar, Karnataka 585401',
    lat: 17.925265,
    lng: 77.526622
  },
  {
    name: 'Chidri Road',
    fullAddress: 'Chidri, Bidar, Karnataka 585403',
    lat: 17.906850,
    lng: 77.495050
  },
  {
    name: 'Railway Station Road',
    fullAddress: 'Railway Station Road, Bidar, Karnataka 585401',
    lat: 17.911886,
    lng: 77.515435
  },
  {
    name: 'Civil Hospital Road',
    fullAddress: 'Civil Hospital Road, Bidar, Karnataka 585401',
    lat: 17.913500,
    lng: 77.519200
  },
  {
    name: 'Halladkeri',
    fullAddress: 'Halladkeri, Bidar, Karnataka 585401',
    lat: 17.921400,
    lng: 77.530500
  },
  {
    name: 'Udgir Road',
    fullAddress: 'Udgir Road, Bidar, Karnataka 585401',
    lat: 17.917800,
    lng: 77.506200
  },
  {
    name: 'Manhalli Road',
    fullAddress: 'Manhalli Road, Bidar, Karnataka 585403',
    lat: 17.890200,
    lng: 77.491000
  }
];

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly config = BUSINESS_CONFIG.location;

  /**
   * Haversine Formula: exact great-circle distance in kilometers
   */
  calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number = this.config.latitude,
    lon2: number = this.config.longitude
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Detect exact device GPS via Capacitor Native Geolocation (on Android/iOS) or HTML5 Geolocation.
   * Never fakes location using inaccurate cellular IP lookup.
   */
  async detectRealGpsLocation(): Promise<GpsDetectionResult> {
    if (Capacitor.isNativePlatform()) {
      try {
        let perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
          perm = await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] });
        }
        if (perm.location === 'denied' && perm.coarseLocation === 'denied') {
          return {
            success: false,
            permissionDenied: true,
            error: 'Location permission denied. Please allow GPS access in app settings.'
          };
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        });

        return {
          success: true,
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: position.coords.accuracy
        };
      } catch (err: any) {
        const msg = String(err?.message || '').toLowerCase();
        const denied = msg.includes('denied') || msg.includes('permission');
        return {
          success: false,
          permissionDenied: denied,
          error: denied
            ? 'Location permission was denied. Please enable GPS permission to verify your location.'
            : 'Could not get GPS fix. Make sure your phone Location / GPS toggle is turned ON.'
        };
      }
    }

    // Browser HTML5 Geolocation fallback
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return {
        success: false,
        error: 'Geolocation is not supported by your browser.'
      };
    }

    return new Promise<GpsDetectionResult>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            success: true,
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: pos.coords.accuracy
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            resolve({
              success: false,
              permissionDenied: true,
              error: 'Location permission was denied. Please allow GPS access in browser settings.'
            });
          } else if (error.code === error.TIMEOUT) {
            resolve({
              success: false,
              error: 'GPS signal timed out. Turn ON high-accuracy Location and tap Re-check GPS.'
            });
          } else {
            resolve({
              success: false,
              error: 'Location signal unavailable. Ensure GPS is enabled on your device.'
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    });
  }

  /**
   * Fetch full street address from coordinates via Geoapify (when key configured) or OpenStreetMap Nominatim + BigDataCloud
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const apiKey = (this.config.geoapifyApiKey || '').trim();

    // 1. Geoapify Reverse Geocoding (if key configured)
    if (apiKey) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${encodeURIComponent(apiKey)}`,
          { signal: controller.signal }
        );
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          const props = data?.features?.[0]?.properties;
          if (props) {
            const fullAddress = props.formatted || `${props.suburb || props.city || ''}, ${props.state || ''}`.trim();
            const city = props.city || props.county || props.state_district || '';
            const suburb = props.suburb || props.neighbourhood || props.street || '';
            const shortLabel = suburb && city && suburb !== city ? `${suburb}, ${city}` : city || fullAddress;
            const postcode = props.postcode || '';
            const isBidarAddress =
              fullAddress.toLowerCase().includes('bidar') || postcode.startsWith('5854');
            return { fullAddress, shortLabel, city, postcode, isBidarAddress };
          }
        }
      } catch (e) {}
    }

    // 2. OpenStreetMap Nominatim Reverse Geocoding (keyless, full address details)
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5500);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        }
      );
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        const addr = data?.address || {};
        const city = addr.city || addr.town || addr.village || addr.state_district || addr.county || '';
        const neighbourhood = addr.neighbourhood || addr.suburb || addr.road || addr.residential || '';
        const postcode = addr.postcode || '';
        const parts = [neighbourhood, city, addr.state, postcode].filter(Boolean);
        const fullAddress = data?.display_name || parts.join(', ');
        const shortLabel =
          neighbourhood && city && !neighbourhood.toLowerCase().includes(city.toLowerCase())
            ? `${neighbourhood}, ${city}`
            : city || neighbourhood || 'Detected Location';
        const isBidarAddress =
          (fullAddress || '').toLowerCase().includes('bidar') || postcode.startsWith('5854');
        return { fullAddress, shortLabel, city, postcode, isBidarAddress };
      }
    } catch (e) {}

    // 3. BigDataCloud keyless fallback
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        const locality = data.locality || data.suburb || '';
        const city = data.city || data.principalSubdivision || '';
        const postcode = data.postcode || '';
        const shortLabel = locality && city && locality !== city ? `${locality}, ${city}` : city || locality || 'Detected Location';
        const fullAddress = [locality, city, data.principalSubdivision, postcode].filter(Boolean).join(', ') || shortLabel;
        const isBidarAddress =
          fullAddress.toLowerCase().includes('bidar') || postcode.startsWith('5854');
        return { fullAddress, shortLabel, city, postcode, isBidarAddress };
      }
    } catch (e) {}

    return {
      fullAddress: `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      shortLabel: 'Detected GPS Location',
      city: '',
      postcode: '',
      isBidarAddress: this.calculateDistanceKm(lat, lng) <= this.config.maxDeliveryRadiusKm
    };
  }

  /**
   * Address search autocomplete via Geoapify (when key configured) or OSM Photon + Verified Bidar Localities
   */
  async searchAddressAutocomplete(query: string): Promise<AddressSuggestion[]> {
    const clean = (query || '').trim();
    if (clean.length < 2) return [];

    const lower = clean.toLowerCase();
    const results: AddressSuggestion[] = [];

    // 1. Verified Bidar Localities instant matches
    for (const loc of VERIFIED_BIDAR_LOCALITIES) {
      if (loc.name.toLowerCase().includes(lower) || loc.fullAddress.toLowerCase().includes(lower)) {
        const dist = Number(this.calculateDistanceKm(loc.lat, loc.lng).toFixed(1));
        results.push({
          label: `${loc.name}, Bidar`,
          fullAddress: loc.fullAddress,
          lat: loc.lat,
          lng: loc.lng,
          distanceKm: dist,
          withinDeliveryZone: dist <= this.config.maxDeliveryRadiusKm,
          source: 'bidar-preset'
        });
      }
    }

    const apiKey = (this.config.geoapifyApiKey || '').trim();

    // 2. Geoapify Autocomplete API (biased to TBZB Bidar)
    if (apiKey) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(clean)}&filter=countrycode:in&bias=proximity:${this.config.longitude},${this.config.latitude}&limit=6&apiKey=${encodeURIComponent(apiKey)}`,
          { signal: controller.signal }
        );
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          const features: any[] = data?.features || [];
          for (const f of features) {
            const p = f.properties || {};
            const coords = f.geometry?.coordinates || [p.lon, p.lat];
            const lng = Number(coords[0]);
            const lat = Number(coords[1]);
            if (isNaN(lat) || isNaN(lng)) continue;

            const dist = Number(this.calculateDistanceKm(lat, lng).toFixed(1));
            const fullAddress = p.formatted || `${p.name || p.street || ''}, ${p.city || ''}`.trim();
            const label = p.suburb || p.name || p.street || p.city || fullAddress;
            const cityLabel = p.city || p.county || '';
            const displayLabel = cityLabel && !label.toLowerCase().includes(cityLabel.toLowerCase()) ? `${label}, ${cityLabel}` : label;

            results.push({
              label: displayLabel,
              fullAddress,
              lat,
              lng,
              distanceKm: dist,
              withinDeliveryZone: dist <= this.config.maxDeliveryRadiusKm && !this.isForbiddenOutsideCity(fullAddress),
              source: 'geoapify'
            });
          }
          return this.dedupeSuggestions(results);
        }
      } catch (e) {}
    }

    // 3. Keyless OpenStreetMap Photon Autocomplete (biased around Vidya Nagar, Bidar)
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const searchQ = lower.includes('bidar') ? clean : `${clean} Bidar`;
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQ)}&lat=${this.config.latitude}&lon=${this.config.longitude}&limit=5`,
        { signal: controller.signal }
      );
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        const features: any[] = data?.features || [];
        for (const f of features) {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates;
          if (!Array.isArray(coords) || coords.length < 2) continue;
          const lng = Number(coords[0]);
          const lat = Number(coords[1]);
          const dist = Number(this.calculateDistanceKm(lat, lng).toFixed(1));

          const name = p.name || p.street || p.locality || p.suburb || '';
          const city = p.city || p.county || p.state || '';
          const parts = [name, city, p.state, p.postcode].filter(Boolean);
          const fullAddress = parts.join(', ');
          if (!fullAddress) continue;

          const label = name && city && !name.toLowerCase().includes(city.toLowerCase()) ? `${name}, ${city}` : fullAddress;
          results.push({
            label,
            fullAddress,
            lat,
            lng,
            distanceKm: dist,
            withinDeliveryZone: dist <= this.config.maxDeliveryRadiusKm && !this.isForbiddenOutsideCity(fullAddress),
            source: 'osm'
          });
        }
      }
    } catch (e) {}

    return this.dedupeSuggestions(results);
  }

  private dedupeSuggestions(list: AddressSuggestion[]): AddressSuggestion[] {
    const seen = new Set<string>();
    return list.filter((item) => {
      const key = item.label.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Detect explicit non-Bidar city/town mentions (careful not to false-positive Bidar road names like "Udgir Road")
   */
  isForbiddenOutsideCity(text: string): boolean {
    const lower = (text || '').toLowerCase().trim();
    if (!lower) return false;

    const forbiddenKeywords = [
      'hyderabad', 'secunderabad', 'bengaluru', 'bangalore', 'mumbai', 'delhi', 'new delhi',
      'pune', 'chennai', 'kolkata', 'ahmedabad', 'surat', 'jaipur', 'lucknow',
      'kalaburagi', 'gulbarga', 'humnabad', 'bhalki', 'aurad', 'basavakalyan',
      'zaheerabad', 'zahirabad', 'sedam', 'wadi', 'yadgir', 'raichur', 'solapur',
      'nanded', 'latur', 'osmanabad', 'vikarabad', 'sangareddy', 'patancheru',
      'kukatpally', 'gachibowli', 'madhapur', 'hitec city', 'banjara hills', 'jubilee hills',
      'shamshabad', 'miyapur', 'ameerpet', 'whitefield', 'koramangala', 'indiranagar', 'electronic city'
    ];

    return forbiddenKeywords.some((city) => lower.includes(city));
  }

  /**
   * Strict Haversine + Text Verification for Checkout Delivery Lock
   */
  validateDeliveryEligibility(
    coords: { lat: number; lng: number } | null,
    addressText: string = ''
  ): { allowed: boolean; distanceKm: number | null; reason?: string } {
    if (this.isForbiddenOutsideCity(addressText)) {
      return {
        allowed: false,
        distanceKm: coords ? Number(this.calculateDistanceKm(coords.lat, coords.lng).toFixed(1)) : null,
        reason: 'Entered address is outside Bidar city limits. Delivery is strictly within Bidar.'
      };
    }

    if (!coords) {
      return {
        allowed: false,
        distanceKm: null,
        reason: 'Live GPS verification is required at checkout to confirm you are within Bidar.'
      };
    }

    const distanceKm = Number(this.calculateDistanceKm(coords.lat, coords.lng).toFixed(1));
    if (distanceKm > this.config.maxDeliveryRadiusKm) {
      return {
        allowed: false,
        distanceKm,
        reason: `Your live location is ${distanceKm} km from TBZB Kitchen (Vidya Nagar). Delivery is strictly within ${this.config.maxDeliveryRadiusKm} km in Bidar.`
      };
    }

    return { allowed: true, distanceKm };
  }
}


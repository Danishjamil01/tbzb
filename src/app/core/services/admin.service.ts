import { Injectable, signal, inject } from '@angular/core';
import { MenuService } from './menu.service';
import { BusinessStatusService } from './business-status.service';
import { ToastService } from './toast.service';
import { MenuItem } from '../models/menu.model';

export interface CloudDatabaseConfig {
  provider: 'firebase' | 'custom';
  projectId: string;
  apiKey: string;
  collectionName: string;
  autoSync: boolean;
}

export const DEFAULT_CLOUD_CONFIG: CloudDatabaseConfig = {
  provider: 'firebase',
  projectId: 'tbzb-bidar',
  apiKey: '',
  collectionName: 'tbzb_menu',
  autoSync: true
};

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private menuService = inject(MenuService);
  private statusService = inject(BusinessStatusService);
  private toastService = inject(ToastService);

  // Admin panel visibility & authentication
  isAdminOpen = signal<boolean>(false);
  isAuthenticated = signal<boolean>(this.checkSavedSession());

  // Cloud database config & sync state
  cloudConfig = signal<CloudDatabaseConfig | null>(this.loadCloudConfig());
  isSyncing = signal<boolean>(false);
  lastSyncTime = signal<string | null>(this.loadLastSyncTime());

  constructor() {
    this.checkUrlForAdmin();
    // Auto sync from cloud if configured
    if (this.cloudConfig()?.autoSync) {
      this.syncFromCloud(false);
    }
  }

  private checkUrlForAdmin(): void {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || path === '/admin' || hash.includes('admin')) {
        this.openAdmin();
      }
    }
  }

  private checkSavedSession(): boolean {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('tbzb_admin_auth') === 'true' ||
               localStorage.getItem('tbzb_admin_auth') === 'true';
      }
    } catch (e) {}
    return false;
  }

  private loadCloudConfig(): CloudDatabaseConfig | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('tbzb_cloud_config');
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {}
    return DEFAULT_CLOUD_CONFIG;
  }

  private loadLastSyncTime(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('tbzb_last_sync_time');
      }
    } catch (e) {}
    return null;
  }

  openAdmin(): void {
    this.isAdminOpen.set(true);
    if (typeof window !== 'undefined' && window.location.hash !== '#admin') {
      history.pushState(null, '', '#admin');
    }
  }

  closeAdmin(): void {
    this.isAdminOpen.set(false);
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      history.pushState(null, '', window.location.pathname);
    }
  }

  login(pinOrPassword: string, rememberMe = false): boolean {
    const trimmed = (pinOrPassword || '').trim();
    const savedPin = this.getSavedPin();

    // Valid if matches saved PIN or master passwords
    if (trimmed === savedPin || trimmed === '1234' || trimmed === 'tbzb@bidar' || trimmed === 'tbzb@1234') {
      this.isAuthenticated.set(true);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('tbzb_admin_auth', 'true');
          if (rememberMe) {
            localStorage.setItem('tbzb_admin_auth', 'true');
          }
        }
      } catch (e) {}
      this.toastService.show('Admin logged in successfully', 'success');
      return true;
    }

    this.toastService.show('Invalid PIN or password', 'error');
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('tbzb_admin_auth');
        localStorage.removeItem('tbzb_admin_auth');
      }
    } catch (e) {}
    this.toastService.show('Admin logged out', 'info');
  }

  getSavedPin(): string {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('tbzb_admin_pin') || '1234';
      }
    } catch (e) {}
    return '1234';
  }

  updatePin(newPin: string): boolean {
    if (!newPin || newPin.trim().length < 4) {
      this.toastService.show('PIN must be at least 4 digits', 'warning');
      return false;
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('tbzb_admin_pin', newPin.trim());
      }
      this.toastService.show('Admin PIN updated successfully', 'success');
      return true;
    } catch (e) {
      return false;
    }
  }

  saveCloudConfig(config: CloudDatabaseConfig): void {
    this.cloudConfig.set(config);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('tbzb_cloud_config', JSON.stringify(config));
      }
      this.toastService.show('Cloud database settings saved', 'success');
    } catch (e) {}
  }

  clearCloudConfig(): void {
    this.cloudConfig.set(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('tbzb_cloud_config');
      }
      this.toastService.show('Cloud connection removed', 'info');
    } catch (e) {}
  }

  /* ==========================================================================
     CLOUD FIRESTORE SYNC VIA REST (Zero extra dependency, 100% Free on Google Spark)
     ========================================================================== */
  async syncToCloud(): Promise<boolean> {
    const config = this.cloudConfig();
    if (!config || !config.projectId) {
      this.toastService.show('Please configure your Firebase Project ID first', 'warning');
      return false;
    }

    this.isSyncing.set(true);
    try {
      const items = this.menuService.allItems();
      const collection = config.collectionName || 'tbzb_menu';
      const docId = 'all_dishes';
      
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${collection}/${docId}`;

      const payload = {
        fields: {
          itemsJson: { stringValue: JSON.stringify(items) },
          updatedAt: { stringValue: new Date().toISOString() },
          kitchenOverride: { stringValue: this.statusService.kitchenOverride() }
        }
      };

      const res = await fetch(firestoreUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Cloud error ${res.status}: ${res.statusText}`);
      }

      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
      this.lastSyncTime.set(timeStr);
      try {
        localStorage.setItem('tbzb_last_sync_time', timeStr);
      } catch (e) {}

      this.toastService.show('Menu published to Cloud successfully!', 'success');
      return true;
    } catch (err: any) {
      console.error('Cloud push failed', err);
      this.toastService.show('Could not sync to cloud: ' + (err.message || 'Check project ID/rules'), 'error');
      return false;
    } finally {
      this.isSyncing.set(false);
    }
  }

  async syncFromCloud(showToast = true): Promise<boolean> {
    const config = this.cloudConfig();
    if (!config || !config.projectId) {
      if (showToast) {
        this.toastService.show('No Cloud Database configured yet', 'info');
      }
      return false;
    }

    this.isSyncing.set(true);
    try {
      const collection = config.collectionName || 'tbzb_menu';
      const docId = 'all_dishes';
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${collection}/${docId}`;

      const res = await fetch(firestoreUrl);
      if (!res.ok) {
        if (res.status === 404) {
          if (showToast) this.toastService.show('No cloud document found yet. Click "Push to Cloud" first.', 'info');
          return false;
        }
        throw new Error(`Cloud error ${res.status}`);
      }

      const data = await res.json();
      const itemsJson = data?.fields?.itemsJson?.stringValue;
      if (itemsJson) {
        const parsedItems: MenuItem[] = JSON.parse(itemsJson);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          this.menuService.setAllItems(parsedItems);
        }
      }

      const remoteOverride = data?.fields?.kitchenOverride?.stringValue;
      if (remoteOverride === 'open' || remoteOverride === 'closed' || remoteOverride === 'auto') {
        this.statusService.setKitchenOverride(remoteOverride);
      }

      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
      this.lastSyncTime.set(timeStr);
      try {
        localStorage.setItem('tbzb_last_sync_time', timeStr);
      } catch (e) {}

      if (showToast) {
        this.toastService.show('Menu updated with latest Cloud changes!', 'success');
      }
      return true;
    } catch (err: any) {
      console.error('Cloud pull failed', err);
      if (showToast) {
        this.toastService.show('Could not fetch cloud data', 'error');
      }
      return false;
    } finally {
      this.isSyncing.set(false);
    }
  }

  // Backup & Restore helpers
  exportMenuJson(): void {
    const data = JSON.stringify(this.menuService.allItems(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tbzb-menu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toastService.show('Menu backup downloaded', 'success');
  }

  importMenuJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].name) {
        this.menuService.setAllItems(parsed);
        this.toastService.show('Menu successfully imported and updated!', 'success');
        return true;
      }
      this.toastService.show('Invalid menu file format', 'error');
      return false;
    } catch (e) {
      this.toastService.show('Failed to parse JSON file', 'error');
      return false;
    }
  }
}


import { Injectable, signal, computed, inject } from '@angular/core';
import { KitchenOrder, OrderStatus, PaymentMethod } from '../models/order.model';
import { ToastService } from './toast.service';
import { PlatformService } from './platform.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private toastService = inject(ToastService);
  private platformService = inject(PlatformService);
  private authService = inject(AuthService);

  private readonly FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/tbzb-bidar/databases/(default)/documents/tbzb_orders';
  private pollingTimer: any = null;
  private customerPollingTimer: any = null;
  private isSyncingCustomer = false;
  private knownOrderIds = new Set<string>();

  // State signals
  orders = signal<KitchenOrder[]>(this.loadCachedOrders());
  customerOrderHistory = signal<KitchenOrder[]>(this.loadCustomerHistory());
  isFetching = signal<boolean>(false);
  isCustomerSyncing = signal<boolean>(false);
  soundEnabled = signal<boolean>(this.loadSoundPreference());
  statusFilter = signal<'all' | 'new' | 'preparing' | 'out_for_delivery' | 'delivered'>('all');

  // Filtered orders list
  filteredOrders = computed(() => {
    const list = this.orders();
    const filter = this.statusFilter();
    if (filter === 'all') return list;
    return list.filter(o => o.status === filter);
  });

  // Summary counts
  newOrdersCount = computed(() => this.orders().filter(o => o.status === 'new').length);
  preparingCount = computed(() => this.orders().filter(o => o.status === 'preparing').length);
  outForDeliveryCount = computed(() => this.orders().filter(o => o.status === 'out_for_delivery').length);
  activeOrdersCount = computed(() =>
    this.orders().filter(o => o.status === 'new' || o.status === 'preparing' || o.status === 'out_for_delivery').length
  );
  deliveredCount = computed(() => this.orders().filter(o => o.status === 'delivered').length);

  constructor() {
    // Populate known IDs from initial cache
    this.orders().forEach(o => this.knownOrderIds.add(o.orderId));
    // Start real-time live tracking sync for customer orders
    this.startCustomerOrderPolling();

    // Immediately re-sync whenever app/tab becomes visible again
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.syncActiveCustomerOrder(true);
        }
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.syncActiveCustomerOrder(true);
      });
    }
  }

  private loadCustomerHistory(): KitchenOrder[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem('tbzb_customer_order_history');
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {}
    return [];
  }

  private saveCustomerHistory(list: KitchenOrder[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('tbzb_customer_order_history', JSON.stringify(list));
      }
    } catch (e) {}
  }

  private loadCachedOrders(): KitchenOrder[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem('tbzb_kitchen_orders');
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {}
    return [];
  }

  private saveOrdersToCache(orders: KitchenOrder[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('tbzb_kitchen_orders', JSON.stringify(orders));
      }
    } catch (e) {}
  }

  private loadSoundPreference(): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = localStorage.getItem('tbzb_order_sound');
        if (val !== null) return val === 'true';
      }
    } catch (e) {}
    return true;
  }

  toggleSound(): void {
    const next = !this.soundEnabled();
    this.soundEnabled.set(next);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('tbzb_order_sound', String(next));
      }
    } catch (e) {}
    if (next) {
      this.playNotificationSound();
      this.toastService.show('Order alert chime enabled 🔔', 'info');
    } else {
      this.toastService.show('Order alert chime muted 🔕', 'info');
    }
  }

  /**
   * Pleasant two-tone chime via Web Audio API (Zero external audio file dependency)
   */
  playNotificationSound(): void {
    if (!this.soundEnabled()) return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: High crisp ding (D5 - 587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Note 2: Cheerful resolution ding (A5 - 880 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.14);
      gain2.gain.setValueAtTime(0.35, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.85);
    } catch (e) {
      // Audio playback blocked or not supported
    }
  }

  /**
   * Save a newly placed order to Firebase Firestore and local signal
   */
  async createOrder(order: KitchenOrder): Promise<boolean> {
    // 1. Immediately prepend to local signal for instant UI feedback
    const current = this.orders();
    const updated = [order, ...current.filter(o => o.orderId !== order.orderId)];
    this.orders.set(updated);
    this.knownOrderIds.add(order.orderId);
    this.saveOrdersToCache(updated);

    // 2. Push to Google Firebase Firestore
    try {
      const payload = {
        fields: {
          orderId: { stringValue: order.orderId },
          customerName: { stringValue: order.customerName },
          mobileNumber: { stringValue: order.mobileNumber },
          flatNumber: { stringValue: order.flatNumber },
          areaLocality: { stringValue: order.areaLocality },
          landmark: { stringValue: order.landmark || '' },
          googleMapsUrl: { stringValue: order.googleMapsUrl || '' },
          paymentMethod: { stringValue: order.paymentMethod },
          upiTransactionId: { stringValue: order.upiTransactionId || '' },
          itemsJson: { stringValue: JSON.stringify(order.items) },
          subtotal: { integerValue: String(order.subtotal) },
          deliveryCharge: { integerValue: String(order.deliveryCharge) },
          total: { integerValue: String(order.total) },
          status: { stringValue: order.status },
          createdAt: { stringValue: order.createdAt },
          updatedAt: { stringValue: new Date().toISOString() }
        }
      };

      const res = await fetch(`${this.FIRESTORE_BASE}/${order.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return res.ok;
    } catch (err) {
      console.error('Failed to sync new order to cloud Firestore:', err);
      return false;
    }
  }

  /**
   * Parse a single Firestore document into a typed KitchenOrder
   */
  private parseFirestoreDoc(doc: any): KitchenOrder {
    const fields = doc?.fields || {};
    const orderId = fields.orderId?.stringValue || (doc?.name ? doc.name.split('/').pop() : '');
    const status = (fields.status?.stringValue as OrderStatus) || 'new';

    let items: any[] = [];
    try {
      if (fields.itemsJson?.stringValue) {
        items = JSON.parse(fields.itemsJson.stringValue);
      }
    } catch (e) {}

    return {
      orderId,
      createdAt: fields.createdAt?.stringValue || new Date().toISOString(),
      customerName: fields.customerName?.stringValue || 'Customer',
      mobileNumber: fields.mobileNumber?.stringValue || '',
      flatNumber: fields.flatNumber?.stringValue || '',
      areaLocality: fields.areaLocality?.stringValue || '',
      landmark: fields.landmark?.stringValue || '',
      googleMapsUrl: fields.googleMapsUrl?.stringValue || '',
      paymentMethod: (fields.paymentMethod?.stringValue as PaymentMethod) || 'cod',
      upiTransactionId: fields.upiTransactionId?.stringValue || '',
      items,
      subtotal: parseInt(fields.subtotal?.integerValue || '0', 10),
      deliveryCharge: parseInt(fields.deliveryCharge?.integerValue || '0', 10),
      total: parseInt(fields.total?.integerValue || '0', 10),
      status,
      updatedAt: fields.updatedAt?.stringValue
    };
  }

  /**
   * Fetch all orders from Firebase Firestore (ordered newest first)
   */
  async fetchOrders(silent = false): Promise<void> {
    if (!silent) this.isFetching.set(true);

    try {
      const res = await fetch(`${this.FIRESTORE_BASE}?orderBy=createdAt%20desc&pageSize=50`, {
        cache: 'no-store'
      });
      if (!res.ok) {
        if (!silent) this.toastService.show('Could not fetch cloud orders', 'warning');
        return;
      }

      const data = await res.json();
      const docs: any[] = data?.documents || [];

      let hasNewIncomingOrder = false;

      const loadedOrders: KitchenOrder[] = docs.map(doc => {
        const parsed = this.parseFirestoreDoc(doc);
        if (!this.knownOrderIds.has(parsed.orderId) && parsed.status === 'new') {
          hasNewIncomingOrder = true;
        }
        this.knownOrderIds.add(parsed.orderId);
        return parsed;
      });

      // Sort newest first
      loadedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      this.orders.set(loadedOrders);
      this.saveOrdersToCache(loadedOrders);

      // Trigger chime sound if a new order was detected
      if (hasNewIncomingOrder) {
        this.playNotificationSound();
        this.toastService.show('🛎️ NEW FOOD ORDER RECEIVED!', 'success');
      } else if (!silent) {
        this.toastService.show('Orders refreshed', 'info');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      if (!silent) {
        this.toastService.show('Network error while checking orders', 'warning');
      }
    } finally {
      if (!silent) this.isFetching.set(false);
    }
  }

  /**
   * Live-sync the customer's active order status and history directly from Firestore
   */
  async syncActiveCustomerOrder(silent = true): Promise<void> {
    if (this.isSyncingCustomer) return;
    this.isSyncingCustomer = true;
    if (!silent) this.isCustomerSyncing.set(true);

    try {
      const active = this.platformService.customerActiveOrder();
      const user = this.authService.currentUser();
      const userPhone = (user?.mobileNumber || '').replace(/\D/g, '').slice(-10);

      // 1. Direct real-time fetch of active order document
      if (active?.orderId) {
        try {
          const res = await fetch(`${this.FIRESTORE_BASE}/${active.orderId}`, {
            cache: 'no-store'
          });
          if (res.ok) {
            const doc = await res.json();
            const freshOrder = this.parseFirestoreDoc(doc);

            if (freshOrder.status !== active.status) {
              this.platformService.setCustomerOrder(freshOrder);
              this.notifyCustomerStatusChange(freshOrder);
            } else if (freshOrder.updatedAt !== active.updatedAt) {
              this.platformService.setCustomerOrder(freshOrder);
            }
          }
        } catch (e) {
          // Ignore transient network hiccup
        }
      }

      // 2. Sync customer order history by logged-in mobile number (or when explicitly refreshing / viewing orders tab)
      const shouldFetchHistory =
        userPhone.length === 10 &&
        (!silent || this.platformService.activeTab() === 'orders' || !active);

      if (shouldFetchHistory) {
        try {
          const histRes = await fetch(`${this.FIRESTORE_BASE}?orderBy=createdAt%20desc&pageSize=50`, {
            cache: 'no-store'
          });
          if (histRes.ok) {
            const histData = await histRes.json();
            const docs: any[] = histData?.documents || [];
            const myOrders = docs
              .map(d => this.parseFirestoreDoc(d))
              .filter(o => (o.mobileNumber || '').replace(/\D/g, '').slice(-10) === userPhone)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            this.customerOrderHistory.set(myOrders);
            this.saveCustomerHistory(myOrders);

            // If customer doesn't have an active tracked order locally, restore latest active order from cloud
            const currentActive = this.platformService.customerActiveOrder();
            if (!currentActive && myOrders.length > 0) {
              const ongoing = myOrders.find(
                o => o.status === 'new' || o.status === 'preparing' || o.status === 'out_for_delivery'
              );
              if (ongoing) {
                this.platformService.setCustomerOrder(ongoing);
              }
            }
          }
        } catch (e) {
          // Ignore network error
        }
      }

      if (!silent) {
        this.toastService.show('Order status synced live', 'info');
      }
    } finally {
      this.isSyncingCustomer = false;
      if (!silent) this.isCustomerSyncing.set(false);
    }
  }

  private notifyCustomerStatusChange(order: KitchenOrder): void {
    this.playNotificationSound();
    switch (order.status) {
      case 'preparing':
        this.toastService.show(`Chef started preparing Order #${order.orderId}!`, 'info', 'Cooking Started');
        break;
      case 'out_for_delivery':
        this.toastService.show(`Order #${order.orderId} is on the way to you!`, 'info', 'Out for Delivery');
        break;
      case 'delivered':
        this.toastService.show(`Order #${order.orderId} delivered! Enjoy your meal!`, 'success', 'Delivered');
        break;
      case 'cancelled':
        this.toastService.show(`Order #${order.orderId} was cancelled by the kitchen.`, 'error', 'Order Cancelled');
        break;
    }
  }

  startCustomerOrderPolling(intervalMs = 5000): void {
    if (this.customerPollingTimer) return;
    this.syncActiveCustomerOrder(true);
    this.customerPollingTimer = setInterval(() => {
      const active = this.platformService.customerActiveOrder();
      const isOngoing =
        active &&
        (active.status === 'new' || active.status === 'preparing' || active.status === 'out_for_delivery');
      const isViewingOrders = this.platformService.activeTab() === 'orders';

      if (isOngoing || isViewingOrders) {
        this.syncActiveCustomerOrder(true);
      }
    }, intervalMs);
  }

  stopCustomerOrderPolling(): void {
    if (this.customerPollingTimer) {
      clearInterval(this.customerPollingTimer);
      this.customerPollingTimer = null;
    }
  }

  /**
   * Update the status of an existing order
   */
  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<boolean> {
    // 1. Update locally
    const current = this.orders();
    const updated = current.map(o => {
      if (o.orderId === orderId) {
        return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return o;
    });
    this.orders.set(updated);
    this.saveOrdersToCache(updated);

    const statusLabels: Record<OrderStatus, string> = {
      new: 'New Order',
      preparing: 'Preparing in Kitchen 👨‍🍳',
      out_for_delivery: 'Out for Delivery 🛵',
      delivered: 'Delivered Successfully ✅',
      cancelled: 'Order Cancelled ❌'
    };

    this.toastService.show(`Order #${orderId} marked as ${statusLabels[newStatus]}`, 'success');

    // 2. Patch to Firestore
    try {
      const payload = {
        fields: {
          status: { stringValue: newStatus },
          updatedAt: { stringValue: new Date().toISOString() }
        }
      };

      const url = `${this.FIRESTORE_BASE}/${orderId}?updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return true;
    } catch (err) {
      console.error('Failed to update status in cloud:', err);
      return false;
    }
  }

  /**
   * Delete an order
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    const current = this.orders();
    const updated = current.filter(o => o.orderId !== orderId);
    this.orders.set(updated);
    this.saveOrdersToCache(updated);
    this.knownOrderIds.delete(orderId);
    this.toastService.show(`Order #${orderId} deleted`, 'info');

    try {
      await fetch(`${this.FIRESTORE_BASE}/${orderId}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Polling management for live orders
   */
  startPolling(intervalMs = 15000): void {
    if (this.pollingTimer) return;
    this.fetchOrders(true);
    this.pollingTimer = setInterval(() => {
      this.fetchOrders(true);
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
}


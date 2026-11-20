import { Injectable, signal, computed, inject } from '@angular/core';
import { KitchenOrder, OrderStatus, PaymentMethod } from '../models/order.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private toastService = inject(ToastService);
  private readonly FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/tbzb-bidar/databases/(default)/documents/tbzb_orders';
  private pollingTimer: any = null;
  private knownOrderIds = new Set<string>();

  // State signals
  orders = signal<KitchenOrder[]>(this.loadCachedOrders());
  isFetching = signal<boolean>(false);
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
    // Fetch latest on startup
    this.fetchOrders(true);
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
   * Fetch all orders from Firebase Firestore
   */
  async fetchOrders(silent = false): Promise<void> {
    if (!silent) this.isFetching.set(true);

    try {
      const res = await fetch(this.FIRESTORE_BASE);
      if (!res.ok) {
        if (!silent) this.toastService.show('Could not fetch cloud orders', 'warning');
        return;
      }

      const data = await res.json();
      const docs: any[] = data?.documents || [];

      let hasNewIncomingOrder = false;

      const loadedOrders: KitchenOrder[] = docs.map(doc => {
        const fields = doc.fields || {};
        const orderId = fields.orderId?.stringValue || doc.name.split('/').pop();
        const status = (fields.status?.stringValue as OrderStatus) || 'new';

        // Check if an unread new order has arrived
        if (!this.knownOrderIds.has(orderId) && status === 'new') {
          hasNewIncomingOrder = true;
        }
        this.knownOrderIds.add(orderId);

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

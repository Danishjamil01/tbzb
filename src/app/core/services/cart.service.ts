import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { CartItem, CartCalculation } from '../models/cart.model';
import { MenuItem } from '../models/menu.model';
import { BusinessStatusService } from './business-status.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

const CART_STORAGE_KEY = 'tbzb_cart_items_v1';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Primary reactive items state
  private itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  // UI state for drawer and checkout modal
  isCartDrawerOpen = signal<boolean>(false);
  isCheckoutModalOpen = signal<boolean>(false);
  isOrderConfirmedModalOpen = signal<boolean>(false);

  // Readonly accessors
  readonly items = this.itemsSignal.asReadonly();

  readonly totalItemCount = computed(() => {
    return this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly subtotal = computed(() => {
    return this.itemsSignal().reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
  });

  readonly calculation = computed<CartCalculation>(() => {
    return this.businessStatusService.calculateCart(this.subtotal());
  });

  readonly isCartEmpty = computed(() => {
    return this.itemsSignal().length === 0;
  });

  constructor(private businessStatusService: BusinessStatusService) {
    // Automatically persist to localStorage on any item changes
    effect(() => {
      const items = this.itemsSignal();
      this.saveToStorage(items);
    });
  }

  private loadFromStorage(): CartItem[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }
      const data = localStorage.getItem(CART_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e);
    }
    return [];
  }

  private saveToStorage(items: CartItem[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }

  addItem(menuItem: MenuItem, quantity: number = 1): void {
    const current = this.itemsSignal();
    const index = current.findIndex(ci => ci.menuItem.id === menuItem.id);
    let updated: CartItem[];

    if (index > -1) {
      updated = [...current];
      updated[index] = {
        ...updated[index],
        quantity: updated[index].quantity + quantity
      };
    } else {
      updated = [...current, { menuItem, quantity }];
    }
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
  }

  decreaseItem(itemId: string): void {
    const current = this.itemsSignal();
    const index = current.findIndex(ci => ci.menuItem.id === itemId);

    if (index > -1) {
      const existing = current[index];
      if (existing.quantity > 1) {
        const updated = [...current];
        updated[index] = { ...existing, quantity: existing.quantity - 1 };
        this.itemsSignal.set(updated);
        this.saveToStorage(updated);
      } else {
        // Remove item when reaching 0
        this.removeItem(itemId);
      }
    }
  }

  removeItem(itemId: string): void {
    const current = this.itemsSignal();
    const updated = current.filter(ci => ci.menuItem.id !== itemId);
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    const current = this.itemsSignal();
    const index = current.findIndex(ci => ci.menuItem.id === itemId);
    if (index > -1) {
      const updated = [...current];
      updated[index] = { ...updated[index], quantity };
      this.itemsSignal.set(updated);
      this.saveToStorage(updated);
    }
  }

  getItemQuantity(itemId: string): number {
    const item = this.itemsSignal().find(ci => ci.menuItem.id === itemId);
    return item ? item.quantity : 0;
  }

  clearCart(): void {
    this.itemsSignal.set([]);
    this.saveToStorage([]);
  }

  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Drawer & modal controls
  openCartDrawer(): void {
    this.isCartDrawerOpen.set(true);
  }

  closeCartDrawer(): void {
    this.isCartDrawerOpen.set(false);
  }

  openCheckout(): void {
    if (!this.authService.isLoggedIn()) {
      this.isCartDrawerOpen.set(false);
      this.toastService.show('Please login or create an account to place an order.', 'warning', 'Login Required');
      this.authService.isAuthModalOpen.set(true);
      return;
    }
    this.isCartDrawerOpen.set(false);
    this.isCheckoutModalOpen.set(true);
  }

  closeCheckout(): void {
    this.isCheckoutModalOpen.set(false);
  }
}


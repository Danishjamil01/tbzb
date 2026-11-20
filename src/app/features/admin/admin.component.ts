import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, CloudDatabaseConfig } from '../../core/services/admin.service';
import { MenuService } from '../../core/services/menu.service';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { ToastService } from '../../core/services/toast.service';
import { OrderService } from '../../core/services/order.service';
import { MenuItem, FoodCategory, DietType } from '../../core/models/menu.model';
import { KitchenOrder, OrderStatus } from '../../core/models/order.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InrPipe } from '../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, InrPipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  adminService = inject(AdminService);
  menuService = inject(MenuService);
  statusService = inject(BusinessStatusService);
  toastService = inject(ToastService);
  orderService = inject(OrderService);

  // Active Admin Tab (Default to 'orders' so kitchen sees incoming orders first)
  activeTab = signal<'orders' | 'dishes' | 'kitchen' | 'cloud' | 'security'>('orders');

  // Login Form
  pinInput = '';
  rememberMe = true;
  showPassword = false;

  // Search & Filter
  dishSearch = '';
  selectedCategoryFilter: FoodCategory = 'all';
  availabilityFilter: 'all' | 'in-stock' | 'sold-out' = 'all';

  // Dish Editing Modal
  isEditModalOpen = signal<boolean>(false);
  isNewDishMode = signal<boolean>(false);
  editingDish: MenuItem = this.getEmptyDish();

  // New PIN Form
  newPinInput = '';
  confirmPinInput = '';

  // Cloud Config Form
  cloudProjectId = 'tbzb-bidar';
  cloudCollection = 'tbzb_menu';
  cloudAutoSync = true;

  // Security lockout computed
  isLockedOut = computed(() => this.adminService.lockoutUntil() > Date.now());

  // Category list
  categories = this.menuService.categories;

  // Computed filtered list for admin view
  filteredDishes = computed(() => {
    const all = this.menuService.allItems();
    const search = this.dishSearch.trim().toLowerCase();
    const cat = this.selectedCategoryFilter;
    const avail = this.availabilityFilter;

    return all.filter(dish => {
      const matchCat = cat === 'all' || dish.category === cat;
      const matchSearch = !search ||
        dish.name.toLowerCase().includes(search) ||
        dish.description.toLowerCase().includes(search);
      const matchAvail = avail === 'all' ||
        (avail === 'in-stock' && dish.isAvailable) ||
        (avail === 'sold-out' && !dish.isAvailable);

      return matchCat && matchSearch && matchAvail;
    });
  });

  // Summary counts
  totalCount = computed(() => this.menuService.allItems().length);
  inStockCount = computed(() => this.menuService.allItems().filter(d => d.isAvailable).length);
  soldOutCount = computed(() => this.menuService.allItems().filter(d => !d.isAvailable).length);

  constructor() {
    const cfg = this.adminService.cloudConfig();
    if (cfg) {
      this.cloudProjectId = cfg.projectId;
      this.cloudCollection = cfg.collectionName || 'tbzb_menu';
      this.cloudAutoSync = cfg.autoSync;
    }
    // Start live order polling if already authenticated
    if (this.adminService.isAuthenticated()) {
      this.orderService.startPolling();
    }
  }

  /* ==========================================================================
     AUTH ACTIONS
     ========================================================================== */
  async onLogin(): Promise<void> {
    if (!this.pinInput.trim()) {
      this.toastService.show('Please enter your admin PIN or password', 'warning');
      return;
    }
    const success = await this.adminService.login(this.pinInput, this.rememberMe);
    if (success) {
      this.pinInput = '';
      this.orderService.startPolling();
      this.activeTab.set('orders');
    }
  }

  onLogout(): void {
    this.adminService.logout();
    this.orderService.stopPolling();
  }

  onClose(): void {
    this.adminService.closeAdmin();
    this.orderService.stopPolling();
  }

  /* ==========================================================================
     ORDER ACTIONS (KDS)
     ========================================================================== */
  setOrderFilter(status: 'all' | 'new' | 'preparing' | 'out_for_delivery' | 'delivered'): void {
    this.orderService.statusFilter.set(status);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.orderService.updateOrderStatus(orderId, status);
  }

  async deleteOrder(order: KitchenOrder): Promise<void> {
    if (confirm(`Delete order #${order.orderId} for ${order.customerName}?`)) {
      await this.orderService.deleteOrder(order.orderId);
    }
  }

  refreshOrders(): void {
    this.orderService.fetchOrders(false);
  }

  toggleSound(): void {
    this.orderService.toggleSound();
  }

  getRelativeTime(isoString: string): string {
    if (!isoString) return '';
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return new Date(isoString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  getCustomerWhatsAppUrl(order: KitchenOrder): string {
    const msg = `Hello ${order.customerName}! Your order #${order.orderId} from The Bite Zone Bidar:`;
    return `https://wa.me/91${order.mobileNumber}?text=${encodeURIComponent(msg)}`;
  }

  /* ==========================================================================
     DISH ACTIONS
     ========================================================================== */
  toggleDishStock(dish: MenuItem): void {
    const newStatus = this.menuService.toggleAvailability(dish.id);
    this.toastService.show(
      `"${dish.name}" is now ${newStatus ? 'In Stock (Available)' : 'Not in Stock (Disabled)'}`,
      newStatus ? 'success' : 'warning'
    );
    if (this.adminService.cloudConfig()?.autoSync) {
      this.adminService.syncToCloud();
    }
  }

  openAddDishModal(): void {
    this.isNewDishMode.set(true);
    this.editingDish = this.getEmptyDish();
    this.isEditModalOpen.set(true);
  }

  openEditDishModal(dish: MenuItem): void {
    this.isNewDishMode.set(false);
    this.editingDish = { ...dish };
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  saveDish(): void {
    if (!this.editingDish.name.trim()) {
      this.toastService.show('Please enter a dish name', 'warning');
      return;
    }
    if (this.editingDish.price <= 0) {
      this.toastService.show('Price must be greater than 0', 'warning');
      return;
    }

    if (this.isNewDishMode()) {
      const newDish: MenuItem = {
        ...this.editingDish,
        id: 'tbzb_' + Date.now().toString(36)
      };
      this.menuService.addItem(newDish);
      this.toastService.show(`"${newDish.name}" added to menu!`, 'success');
    } else {
      this.menuService.updateItem(this.editingDish.id, this.editingDish);
      this.toastService.show(`"${this.editingDish.name}" updated successfully!`, 'success');
    }

    if (this.adminService.cloudConfig()?.autoSync) {
      this.adminService.syncToCloud();
    }

    this.closeEditModal();
  }

  deleteDish(dish: MenuItem): void {
    if (confirm(`Are you sure you want to delete "${dish.name}" from the menu?`)) {
      this.menuService.deleteItem(dish.id);
      this.toastService.show(`"${dish.name}" removed from menu`, 'info');
      if (this.adminService.cloudConfig()?.autoSync) {
        this.adminService.syncToCloud();
      }
    }
  }

  updateDishPriceInline(dish: MenuItem, newPriceStr: string): void {
    const price = parseInt(newPriceStr, 10);
    if (!isNaN(price) && price > 0 && price !== dish.price) {
      this.menuService.updateItem(dish.id, { price });
      this.toastService.show(`Updated price of ${dish.name} to ₹${price}`, 'success');
      if (this.adminService.cloudConfig()?.autoSync) {
        this.adminService.syncToCloud();
      }
    }
  }

  /* ==========================================================================
     KITCHEN OVERRIDE ACTIONS
     ========================================================================== */
  setKitchenMode(mode: 'auto' | 'open' | 'closed'): void {
    this.statusService.setKitchenOverride(mode);
    const msg = mode === 'open'
      ? 'Kitchen manually forced OPEN! Orders accepted anytime.'
      : mode === 'closed'
        ? 'Kitchen manually PAUSED! Customers cannot order right now.'
        : 'Kitchen returned to automatic schedule (10:00 AM – 1:00 AM).';
    this.toastService.show(msg, mode === 'closed' ? 'warning' : 'success');
    if (this.adminService.cloudConfig()?.autoSync) {
      this.adminService.syncToCloud();
    }
  }

  /* ==========================================================================
     CLOUD ACTIONS
     ========================================================================== */
  saveCloudSettings(): void {
    if (!this.cloudProjectId.trim()) {
      this.toastService.show('Please provide a Firebase Project ID', 'warning');
      return;
    }
    const config: CloudDatabaseConfig = {
      provider: 'firebase',
      projectId: this.cloudProjectId.trim(),
      apiKey: '',
      collectionName: this.cloudCollection.trim() || 'tbzb_menu',
      autoSync: this.cloudAutoSync
    };
    this.adminService.saveCloudConfig(config);
  }

  removeCloudSettings(): void {
    if (confirm('Disconnect Firebase Cloud database?')) {
      this.adminService.clearCloudConfig();
      this.cloudProjectId = '';
    }
  }

  triggerCloudPush(): void {
    this.adminService.syncToCloud();
  }

  triggerCloudPull(): void {
    this.adminService.syncFromCloud(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          this.adminService.importMenuJson(text);
        }
      };
      reader.readAsText(file);
      input.value = '';
    }
  }

  /* ==========================================================================
     SECURITY ACTIONS
     ========================================================================== */
  async onChangePin(): Promise<void> {
    if (!this.newPinInput || this.newPinInput.length < 6) {
      this.toastService.show('New PIN must be at least 6 digits', 'warning');
      return;
    }
    if (this.newPinInput !== this.confirmPinInput) {
      this.toastService.show('PINs do not match', 'error');
      return;
    }
    const ok = await this.adminService.updatePin(this.newPinInput);
    if (ok) {
      this.newPinInput = '';
      this.confirmPinInput = '';
    }
  }

  onResetDefaults(): void {
    if (confirm('Are you sure you want to reset all dishes to default TBZB original menu? All custom changes will be discarded.')) {
      this.menuService.resetToDefaultMenu();
      this.toastService.show('Menu reset to defaults', 'info');
    }
  }

  private getEmptyDish(): MenuItem {
    return {
      id: '',
      name: '',
      price: 149,
      category: 'non-veg',
      dietType: 'non-veg',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
      isAvailable: true,
      featured: false,
      tags: []
    };
  }
}

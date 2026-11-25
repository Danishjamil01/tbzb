import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { MenuService } from '../../../core/services/menu.service';
import { CartService } from '../../../core/services/cart.service';
import { StatusBarService, HOME_HERO_STATUS_BG } from '../../../core/services/status-bar.service';
import { MenuItem, FoodCategory } from '../../../core/models/menu.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InrPipe } from '../../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-mobile-home',
  standalone: true,
  imports: [CommonModule, IconComponent, InrPipe],
  templateUrl: './mobile-home.component.html',
  styleUrl: './mobile-home.component.scss'
})
export class MobileHomeComponent implements OnInit {
  platformService = inject(PlatformService);
  menuService = inject(MenuService);
  cartService = inject(CartService);
  private statusBarService = inject(StatusBarService);

  ngOnInit(): void {
    // Sync status bar color + dark icons with the unified light Home Hero canopy
    this.statusBarService.setLightMode(HOME_HERO_STATUS_BG);
  }

  featuredItems = this.menuService.featuredItems;
  kunafaProduct = this.menuService.kunafaProduct;
  activeOrder = this.platformService.customerActiveOrder;

  cartCount = this.cartService.totalItemCount;

  cartTotal(): number {
    return this.cartService.calculation().total;
  }

  readonly quickCategories = [
    { id: 'all' as FoodCategory, label: 'All Items', imageUrl: 'images/food/chicken-handi-biryani.jpg', bg: '#FEF3C7' },
    { id: 'non-veg' as FoodCategory, label: 'Rolls & Meat', imageUrl: 'images/food/chicken-cheese-egg-roll.png', bg: '#FEE2E2' },
    { id: 'veg' as FoodCategory, label: 'Pure Veg', imageUrl: 'images/food/veg-manchurian.jpg', bg: '#DCFCE7' },
    { id: 'sweets' as FoodCategory, label: 'Kunafa & Sweets', imageUrl: 'images/food/kunafa-showcase1.png', bg: '#FFEDD5' },
    { id: 'juices' as FoodCategory, label: 'Cold Shakes', imageUrl: 'images/food/cold-coffee.jpg', bg: '#E0E7FF' },
    { id: 'south-indian' as FoodCategory, label: 'South Indian', imageUrl: 'images/food/masala-dosa.jpg', bg: '#F3E8FF' }
  ];

  goToMenu(catId: FoodCategory): void {
    this.menuService.selectedCategory.set(catId);
    this.platformService.setTab('menu');
  }

  openDishModal(item: MenuItem): void {
    this.menuService.activeModalItem.set(item);
  }

  addToCart(item: MenuItem): void {
    this.cartService.addItem(item, 1);
  }

  getItemQuantity(itemId: string): number {
    const item = this.cartService.items().find(i => i.menuItem.id === itemId);
    return item ? item.quantity : 0;
  }

  updateQty(item: MenuItem, delta: number): void {
    const current = this.getItemQuantity(item.id);
    this.cartService.updateQuantity(item.id, current + delta);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'new': return 'Order Placed';
      case 'preparing': return 'Cooking in Kitchen 👨‍🍳';
      case 'out_for_delivery': return 'Out for Delivery 🚴';
      case 'delivered': return 'Delivered ✅';
      default: return 'In Process';
    }
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../core/services/menu.service';
import { CartService } from '../../../core/services/cart.service';
import { FoodCategory, DietType, MenuItem } from '../../../core/models/menu.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InrPipe } from '../../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, InrPipe],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss'
})
export class MobileMenuComponent {
  menuService = inject(MenuService);
  private cartService = inject(CartService);

  filteredItems = this.menuService.filteredItems;

  selectCategory(catId: FoodCategory): void {
    this.menuService.selectedCategory.set(catId);
  }

  selectDiet(diet: 'all' | DietType): void {
    this.menuService.selectedDiet.set(diet);
  }

  getCount(catId: string): number {
    return this.menuService.categoryCounts()[catId] ?? 0;
  }

  clearSearch(): void {
    this.menuService.searchQuery.set('');
  }

  resetFilters(): void {
    this.menuService.selectedCategory.set('all');
    this.menuService.selectedDiet.set('all');
    this.menuService.searchQuery.set('');
  }

  openDetail(item: MenuItem): void {
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
}

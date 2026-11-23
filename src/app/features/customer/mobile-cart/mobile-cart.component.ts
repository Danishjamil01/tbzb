import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { PlatformService } from '../../../core/services/platform.service';
import { BusinessStatusService } from '../../../core/services/business-status.service';
import { CartItem } from '../../../core/models/cart.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InrPipe } from '../../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-mobile-cart',
  standalone: true,
  imports: [CommonModule, IconComponent, InrPipe],
  templateUrl: './mobile-cart.component.html',
  styleUrl: './mobile-cart.component.scss'
})
export class MobileCartComponent {
  cartService = inject(CartService);
  platformService = inject(PlatformService);
  private statusService = inject(BusinessStatusService);

  calculation = this.cartService.calculation;

  updateQuantity(item: CartItem, delta: number): void {
    const next = item.quantity + delta;
    this.cartService.updateQuantity(item.menuItem.id, next);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.menuItem.id);
  }

  proceedToCheckout(): void {
    this.cartService.openCheckout();
  }
}

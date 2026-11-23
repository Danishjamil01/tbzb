import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformService, AppTab } from '../../../core/services/platform.service';
import { CartService } from '../../../core/services/cart.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent {
  platformService = inject(PlatformService);
  private cartService = inject(CartService);

  cartCount = this.cartService.totalItemCount;

  hasActiveOrder(): boolean {
    const ord = this.platformService.customerActiveOrder();
    return !!ord && ord.status !== 'delivered';
  }

  selectTab(tab: AppTab): void {
    this.platformService.setTab(tab);
  }
}

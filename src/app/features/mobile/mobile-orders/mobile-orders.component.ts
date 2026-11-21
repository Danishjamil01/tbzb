import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { CartService } from '../../../core/services/cart.service';
import { BUSINESS_CONFIG } from '../../../core/config/business.config';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InrPipe } from '../../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-mobile-orders',
  standalone: true,
  imports: [CommonModule, IconComponent, InrPipe],
  templateUrl: './mobile-orders.component.html',
  styleUrl: './mobile-orders.component.scss'
})
export class MobileOrdersComponent {
  platformService = inject(PlatformService);
  private cartService = inject(CartService);
  config = BUSINESS_CONFIG;

  activeOrder = this.platformService.customerActiveOrder;

  isStepDone(status: string, step: number): boolean {
    const ranks: Record<string, number> = {
      new: 1,
      preparing: 2,
      out_for_delivery: 3,
      delivered: 4
    };
    return (ranks[status] || 1) >= step;
  }

  getStatusMessage(status: string): string {
    switch (status) {
      case 'new': return 'Order received by TBZB kitchen';
      case 'preparing': return 'Chef is cooking your fresh dishes';
      case 'out_for_delivery': return 'Delivery partner is on the way to you';
      case 'delivered': return 'Food successfully delivered! Enjoy!';
      default: return 'Order in progress';
    }
  }

  getWhatsAppUrl(ord: any): string {
    const msg = `Hello TBZB, I would like to check the status of my Order #${ord.orderId}.`;
    return `https://wa.me/${this.config.contact.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }
}

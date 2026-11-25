import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { OrderService } from '../../../core/services/order.service';
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
export class MobileOrdersComponent implements OnInit {
  platformService = inject(PlatformService);
  orderService = inject(OrderService);
  config = BUSINESS_CONFIG;

  activeOrder = this.platformService.customerActiveOrder;

  pastOrders = computed(() => {
    const activeId = this.activeOrder()?.orderId;
    return this.orderService.customerOrderHistory().filter(o => o.orderId !== activeId);
  });

  ngOnInit(): void {
    this.orderService.syncActiveCustomerOrder(true);
  }

  refreshStatus(): void {
    this.orderService.syncActiveCustomerOrder(false);
  }

  clearCompletedOrder(): void {
    this.platformService.setCustomerOrder(null);
  }

  trackOrder(order: any): void {
    this.platformService.setCustomerOrder(order);
    this.orderService.syncActiveCustomerOrder(true);
  }

  isStepDone(status: string, step: number): boolean {
    if (status === 'cancelled') return false;
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
      case 'cancelled': return 'This order was cancelled by the kitchen';
      default: return 'Order in progress';
    }
  }

  getStatusSubMessage(status: string): string {
    switch (status) {
      case 'new': return 'Waiting for kitchen confirmation • Auto-updating live';
      case 'preparing': return 'Estimated delivery: 20-30 minutes within Bidar';
      case 'out_for_delivery': return 'Rider is heading to your Bidar delivery address';
      case 'delivered': return 'Thank you for ordering from The Bite Zone Bidar!';
      case 'cancelled': return 'Please call kitchen if you need assistance.';
      default: return 'Updates automatically in real time';
    }
  }

  getStatusBadgeLabel(status: string): string {
    switch (status) {
      case 'new': return 'Placed';
      case 'preparing': return 'Preparing';
      case 'out_for_delivery': return 'On the Way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  getWhatsAppUrl(ord: any): string {
    const msg = `Hello TBZB, I would like to check the status of my Order #${ord.orderId}.`;
    return `https://wa.me/${this.config.contact.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }
}

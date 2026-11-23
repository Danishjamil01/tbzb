import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponent } from './features/website/website.component';
import { CustomerComponent } from './features/customer/customer.component';
import { CartDrawerComponent } from './features/cart-drawer/cart-drawer.component';
import { FoodModalComponent } from './features/food-modal/food-modal.component';
import { CheckoutModalComponent } from './features/checkout-modal/checkout-modal.component';
import { OrderConfirmationModalComponent } from './features/order-confirmation-modal/order-confirmation-modal.component';
import { HoursModalComponent } from './features/hours-modal/hours-modal.component';
import { ToastContainerComponent } from './shared/components/toast/toast.component';
import { AllDishesComponent } from './features/all-dishes/all-dishes.component';
import { AdminComponent } from './features/admin/admin.component';
import { PlatformService } from './core/services/platform.service';
import { AdminService } from './core/services/admin.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WebsiteComponent,
    CustomerComponent,
    CartDrawerComponent,
    FoodModalComponent,
    CheckoutModalComponent,
    OrderConfirmationModalComponent,
    HoursModalComponent,
    ToastContainerComponent,
    AllDishesComponent,
    AdminComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  platformService = inject(PlatformService);
  private adminService = inject(AdminService);

  @ViewChild(HoursModalComponent) hoursModal!: HoursModalComponent;

  openHoursModal(): void {
    if (this.hoursModal) {
      this.hoursModal.open();
    }
  }

  openAdminModal(): void {
    this.adminService.openAdmin();
  }
}

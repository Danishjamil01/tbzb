import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './features/header/header.component';
import { HeroComponent } from './features/hero/hero.component';
import { CategoryNavComponent } from './features/category-nav/category-nav.component';
import { FeaturedComponent } from './features/featured/featured.component';
import { KunafaSpotlightComponent } from './features/kunafa-spotlight/kunafa-spotlight.component';
import { MenuComponent } from './features/menu/menu.component';
import { AboutComponent } from './features/about/about.component';
import { ContactComponent } from './features/contact/contact.component';
import { FooterComponent } from './features/footer/footer.component';
import { CartDrawerComponent } from './features/cart-drawer/cart-drawer.component';
import { FoodModalComponent } from './features/food-modal/food-modal.component';
import { CheckoutModalComponent } from './features/checkout-modal/checkout-modal.component';
import { OrderConfirmationModalComponent } from './features/order-confirmation-modal/order-confirmation-modal.component';
import { HoursModalComponent } from './features/hours-modal/hours-modal.component';
import { FloatingWhatsappComponent } from './features/floating-whatsapp/floating-whatsapp.component';
import { AllDishesComponent } from './features/all-dishes/all-dishes.component';
import { AdminComponent } from './features/admin/admin.component';
import { ToastContainerComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    CategoryNavComponent,
    FeaturedComponent,
    KunafaSpotlightComponent,
    MenuComponent,
    AboutComponent,
    ContactComponent,
    FooterComponent,
    CartDrawerComponent,
    FoodModalComponent,
    CheckoutModalComponent,
    OrderConfirmationModalComponent,
    HoursModalComponent,
    FloatingWhatsappComponent,
    ToastContainerComponent,
    AllDishesComponent,
    AdminComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  @ViewChild(HoursModalComponent) hoursModal!: HoursModalComponent;

  openHoursModal(): void {
    if (this.hoursModal) {
      this.hoursModal.open();
    }
  }
}

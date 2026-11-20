import { Component, ViewChild, inject, signal } from '@angular/core';
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
import { SplashScreenComponent } from './shared/components/splash-screen/splash-screen.component';
import { LocationScreenComponent } from './features/mobile/location-screen/location-screen.component';
import { MobileHeaderComponent } from './features/mobile/mobile-header/mobile-header.component';
import { BottomNavComponent } from './features/mobile/bottom-nav/bottom-nav.component';
import { MobileHomeComponent } from './features/mobile/mobile-home/mobile-home.component';
import { MobileMenuComponent } from './features/mobile/mobile-menu/mobile-menu.component';
import { MobileOrdersComponent } from './features/mobile/mobile-orders/mobile-orders.component';
import { MobileCartComponent } from './features/mobile/mobile-cart/mobile-cart.component';
import { MobileMoreComponent } from './features/mobile/mobile-more/mobile-more.component';
import { PlatformService } from './core/services/platform.service';
import { AdminService } from './core/services/admin.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SplashScreenComponent,
    LocationScreenComponent,
    MobileHeaderComponent,
    BottomNavComponent,
    MobileHomeComponent,
    MobileMenuComponent,
    MobileOrdersComponent,
    MobileCartComponent,
    MobileMoreComponent,
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
  platformService = inject(PlatformService);
  private adminService = inject(AdminService);

  showSplash = signal<boolean>(true);
  showLocationScreen = signal<boolean>(false);

  @ViewChild(HoursModalComponent) hoursModal!: HoursModalComponent;

  onSplashFinished(): void {
    this.showSplash.set(false);
    // In App mode: trigger the "Find Your Location" screen right after splash!
    if (this.platformService.isAppMode()) {
      this.showLocationScreen.set(true);
    }
  }

  onLocationConfirmed(location: string): void {
    this.showLocationScreen.set(false);
  }

  openHoursModal(): void {
    if (this.hoursModal) {
      this.hoursModal.open();
    }
  }

  openAdminModal(): void {
    this.adminService.openAdmin();
  }
}

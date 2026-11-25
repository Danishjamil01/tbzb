import { Component, Output, EventEmitter, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplashScreenComponent } from '../../shared/components/splash-screen/splash-screen.component';
import { LocationScreenComponent } from './location-screen/location-screen.component';
import { AuthScreenComponent } from './auth-screen/auth-screen.component';
import { MobileHeaderComponent } from './mobile-header/mobile-header.component';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';
import { MobileHomeComponent } from './mobile-home/mobile-home.component';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';
import { MobileOrdersComponent } from './mobile-orders/mobile-orders.component';
import { MobileCartComponent } from './mobile-cart/mobile-cart.component';
import { MobileMoreComponent } from './mobile-more/mobile-more.component';
import { PlatformService } from '../../core/services/platform.service';
import { AuthService } from '../../core/services/auth.service';
import { StatusBarService } from '../../core/services/status-bar.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    SplashScreenComponent,
    LocationScreenComponent,
    AuthScreenComponent,
    MobileHeaderComponent,
    BottomNavComponent,
    MobileHomeComponent,
    MobileMenuComponent,
    MobileOrdersComponent,
    MobileCartComponent,
    MobileMoreComponent
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit {
  platformService = inject(PlatformService);
  authService = inject(AuthService);
  cartService = inject(CartService);
  private statusBarService = inject(StatusBarService);

  @Output() openHoursModal = new EventEmitter<void>();

  showSplash = signal<boolean>(true);
  showLocationScreen = signal<boolean>(false);
  showAuthScreen = signal<boolean>(false);

  constructor() {
    // Synchronize authService.isAuthModalOpen
    effect(() => {
      const open = this.authService.isAuthModalOpen();
      if (open) {
        this.showAuthScreen.set(true);
        this.statusBarService.setLightMode('#FFFFFF');
      }
    });

    // Synchronize status bar when screens or modals change
    effect(() => {
      if (
        this.showSplash() ||
        this.showAuthScreen() ||
        this.showLocationScreen() ||
        this.cartService.isCheckoutModalOpen()
      ) {
        this.statusBarService.setLightMode('#FFFFFF');
      } else {
        this.statusBarService.setDarkMode('#092819');
      }
    });
  }

  ngOnInit(): void {
    // Initial status bar for splash / startup
    this.statusBarService.setLightMode('#FFFFFF');

    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tbzb_splash_seen') === 'true') {
        this.showSplash.set(false);
      }
    } catch (e) {}
  }

  onSplashFinished(): void {
    this.showSplash.set(false);
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('tbzb_splash_seen', 'true');
      }
    } catch (e) {}

    // Step 2: Direct Create Account / Login screen for unauthenticated users right after splash screen
    if (!this.authService.isLoggedIn()) {
      this.showAuthScreen.set(true);
      this.statusBarService.setLightMode('#FFFFFF');
    } else {
      // Immediately fetch exact live GPS location on launch for logged-in users
      this.platformService.fetchRealLocation();

      let savedLoc: string | null = null;
      let savedCoords: string | null = null;
      try {
        if (typeof localStorage !== 'undefined') {
          savedLoc = localStorage.getItem('tbzb_saved_location');
          savedCoords = localStorage.getItem('tbzb_saved_coords');
        }
      } catch (e) {}

      if (!savedLoc || !savedCoords) {
        this.showLocationScreen.set(true);
        this.statusBarService.setLightMode('#FFFFFF');
      } else {
        this.platformService.userLocationName.set(savedLoc);
        this.statusBarService.setDarkMode('#092819');
      }
    }
  }

  onAuthFinished(): void {
    this.showAuthScreen.set(false);
    this.authService.isAuthModalOpen.set(false);
    // After login / account created -> Show automatic Google Map live location screen
    this.showLocationScreen.set(true);
    this.statusBarService.setLightMode('#FFFFFF');
  }

  onLocationConfirmed(location: string): void {
    this.showLocationScreen.set(false);
    this.platformService.userLocationName.set(location);
    this.statusBarService.setDarkMode('#092819');
  }
}


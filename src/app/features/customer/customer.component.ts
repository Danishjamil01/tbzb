import { Component, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
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

  @Output() openHoursModal = new EventEmitter<void>();

  showSplash = signal<boolean>(true);
  showLocationScreen = signal<boolean>(false);
  showAuthScreen = signal<boolean>(false);

  ngOnInit(): void {
    // Check if user already saw splash this session
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

    // Step 2: Direct Create Account screen for new users right after splash screen
    if (!this.authService.isLoggedIn()) {
      this.showAuthScreen.set(true);
    } else {
      let savedLoc: string | null = null;
      try {
        if (typeof localStorage !== 'undefined') {
          savedLoc = localStorage.getItem('tbzb_saved_location');
        }
      } catch (e) {}

      if (!savedLoc) {
        this.showLocationScreen.set(true);
      } else {
        this.platformService.userLocationName.set(savedLoc);
        this.updateThemeColor('#092819');
      }
    }
  }

  onAuthFinished(): void {
    this.showAuthScreen.set(false);
    // After login / account created -> Show automatic Google Map live location screen
    this.showLocationScreen.set(true);
  }

  onLocationConfirmed(location: string): void {
    this.showLocationScreen.set(false);
    this.platformService.userLocationName.set(location);
    // Location confirmed -> Match status bar color with header background (#092819)
    this.updateThemeColor('#092819');
  }

  private updateThemeColor(color: string): void {
    if (typeof document !== 'undefined') {
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', color);
      }
    }
  }
}


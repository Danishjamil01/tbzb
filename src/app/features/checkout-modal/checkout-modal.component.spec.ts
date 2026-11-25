import { TestBed } from '@angular/core/testing';
import { CheckoutModalComponent } from './checkout-modal.component';
import { CartService } from '../../core/services/cart.service';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { LocationService } from '../../core/services/location.service';
import { PlatformService } from '../../core/services/platform.service';
import { MenuItem } from '../../core/models/menu.model';

const mockMenuItem: MenuItem = {
  id: 'test-item-1',
  name: 'Falooda Special',
  description: 'Rich royal dessert drink',
  price: 129,
  category: 'juices',
  dietType: 'veg',
  imageUrl: 'images/food/falooda.png',
  isAvailable: true
};

describe('CheckoutModalComponent & Bidar Geofence', () => {
  let cartService: CartService;
  let statusService: BusinessStatusService;
  let toastService: ToastService;
  let authService: AuthService;
  let orderService: OrderService;
  let locationService: LocationService;
  let platformService: PlatformService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutModalComponent]
    }).compileComponents();

    cartService = TestBed.inject(CartService);
    statusService = TestBed.inject(BusinessStatusService);
    toastService = TestBed.inject(ToastService);
    authService = TestBed.inject(AuthService);
    orderService = TestBed.inject(OrderService);
    locationService = TestBed.inject(LocationService);
    platformService = TestBed.inject(PlatformService);

    // Log in test customer & set kitchen override open cleanly
    authService.currentUser.set({
      id: '9876543210',
      name: 'Rahul Sharma',
      mobileNumber: '9876543210',
      createdAt: new Date().toISOString()
    });
    statusService.kitchenOverride.set('open');
  });

  it('should create the checkout component', () => {
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render modal dialog when isCheckoutModalOpen is false', () => {
    cartService.isCheckoutModalOpen.set(false);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.checkout-modal-dialog')).toBeNull();
  });

  it('should show COD Active and Online UPI Coming Soon when modal is open', () => {
    cartService.addItem(mockMenuItem);
    cartService.isCheckoutModalOpen.set(true);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.checkout-modal-dialog')).toBeTruthy();
    expect(el.textContent).toContain('Cash on Delivery (COD)');
    expect(el.textContent).toContain('Coming Soon');
  });

  it('should calculate Haversine distance accurately from Vidya Nagar Kitchen (17.8953274, 77.5021871)', () => {
    // Mailoor / Gandhi Gunj inside Bidar (~2-5 km)
    const distInBidar = locationService.calculateDistanceKm(17.908683, 77.515776);
    expect(distInBidar).toBeLessThan(18);

    // Hyderabad outside Bidar (> 100 km)
    const distHyd = locationService.calculateDistanceKm(17.385044, 78.486671);
    expect(distHyd).toBeGreaterThan(100);
  });

  it('should block delivery orders when customer GPS is outside Bidar even if Bidar typed manually', async () => {
    cartService.addItem(mockMenuItem);
    cartService.isCheckoutModalOpen.set(true);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Outside Bidar real GPS (Hyderabad ~120 km away)
    component.userLocation.set({ lat: 17.385044, lng: 78.486671 });
    component.recheckAddressValidity();
    fixture.detectChanges();

    component.checkoutForm.patchValue({
      orderType: 'delivery',
      fullName: 'Outstation User',
      mobileNumber: '9876543210',
      flatNumber: 'House 1',
      areaLocality: 'Gandhi Gunj, Bidar', // Attempting fake locality override
      paymentMethod: 'cod'
    });

    const createSpy = vi.spyOn(orderService, 'createOrder');
    const toastSpy = vi.spyOn(toastService, 'show');

    await component.onSubmitOrder();

    expect(createSpy).not.toHaveBeenCalled();
    expect(component.isOutsideBidar()).toBe(true);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringContaining('Bidar'),
      'error',
      'Delivery Restricted'
    );
  });

  it('should block delivery orders when GPS location is missing / unverified', async () => {
    cartService.addItem(mockMenuItem);
    cartService.isCheckoutModalOpen.set(true);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.userLocation.set(null);

    component.checkoutForm.patchValue({
      orderType: 'delivery',
      fullName: 'Rahul Sharma',
      mobileNumber: '9876543210',
      flatNumber: 'House 42',
      areaLocality: 'Vidya Nagar, Bidar',
      paymentMethod: 'cod'
    });

    const createSpy = vi.spyOn(orderService, 'createOrder');
    const toastSpy = vi.spyOn(toastService, 'show');

    await component.onSubmitOrder();

    expect(createSpy).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringContaining('Live GPS verification is required'),
      'error',
      'Delivery Restricted'
    );
  });

  it('should place in-app COD order cleanly to Firestore when logged in & verified inside Bidar (no WhatsApp)', async () => {
    cartService.addItem(mockMenuItem);
    cartService.isCheckoutModalOpen.set(true);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Verified GPS near Vidya Nagar, Bidar
    component.userLocation.set({ lat: 17.904573, lng: 77.513351 });
    component.recheckAddressValidity();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.gps-location-card.located')).toBeTruthy();
    expect(el.textContent).toContain('Verified in Bidar');

    component.checkoutForm.patchValue({
      orderType: 'delivery',
      fullName: 'Rahul Sharma',
      mobileNumber: '9876543210',
      flatNumber: 'House 42',
      areaLocality: 'Vidya Nagar, Bidar',
      paymentMethod: 'cod'
    });

    const openSpy = vi.spyOn(window, 'open');
    const createSpy = vi.spyOn(orderService, 'createOrder').mockResolvedValue(true);

    await component.onSubmitOrder();

    expect(openSpy).not.toHaveBeenCalled(); // Strictly no WhatsApp popup
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(cartService.isCartEmpty()).toBe(true);
    expect(platformService.activeTab()).toBe('orders');
  });
});

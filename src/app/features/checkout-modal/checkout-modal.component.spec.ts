import { TestBed } from '@angular/core/testing';
import { CheckoutModalComponent } from './checkout-modal.component';
import { CartService } from '../../core/services/cart.service';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { ToastService } from '../../core/services/toast.service';
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

describe('CheckoutModalComponent', () => {
  let cartService: CartService;
  let statusService: BusinessStatusService;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutModalComponent]
    }).compileComponents();

    cartService = TestBed.inject(CartService);
    statusService = TestBed.inject(BusinessStatusService);
    toastService = TestBed.inject(ToastService);
  });

  it('should create the checkout component', () => {
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should not render modal dialog when isCheckoutModalOpen is false', () => {
    cartService.isCheckoutModalOpen.set(false);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.checkout-modal-dialog')).toBeNull();
  });

  it('should render modal with QR code when open and paymentMethod is upi', () => {
    cartService.addItem(mockMenuItem);
    cartService.isCheckoutModalOpen.set(true);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.checkout-modal-dialog')).toBeTruthy();
    expect(el.querySelector('.qr-image')).toBeTruthy();
    const qrImg = el.querySelector('.qr-image') as HTMLImageElement;
    expect(qrImg.getAttribute('src')).toBe('images/myqr.jpeg');
  });

  it('should calculate distance correctly from TBZB kitchen in Bidar', () => {
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    const component = fixture.componentInstance;

    // Kitchen: 17.8953023, 77.5022301
    // Mailoor (inside Bidar): ~3-4 km
    const distMailoor = component.calculateDistanceKm(17.8953023, 77.5022301, 17.92, 77.53);
    expect(distMailoor).toBeLessThan(10);

    // Hyderabad (outside Bidar): > 100 km
    const distHyd = component.calculateDistanceKm(17.8953023, 77.5022301, 17.385044, 78.486671);
    expect(distHyd).toBeGreaterThan(100);
  });

  it('should block delivery orders when customer is outside Bidar', () => {
    cartService.addItem(mockMenuItem);
    cartService.isCheckoutModalOpen.set(true);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Set outside Bidar state (e.g. 110 km away in Gulbarga/Hyderabad)
    component.isOutsideBidar.set(true);
    component.userDistanceKm.set(110);
    fixture.detectChanges();

    component.checkoutForm.patchValue({
      orderType: 'delivery',
      fullName: 'Outstation User',
      mobileNumber: '9876543210',
      flatNumber: 'House 1',
      areaLocality: 'Banjara Hills, Hyderabad',
      paymentMethod: 'cod'
    });

    const openSpy = vi.spyOn(window, 'open');
    const toastSpy = vi.spyOn(toastService, 'show');

    component.onSubmitOrder();

    // Order should NOT open WhatsApp when outside Bidar
    expect(openSpy).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cannot place delivery order'),
      'error'
    );
  });

  it('should block delivery orders when customer location is not verified in Bidar', () => {
    cartService.addItem(mockMenuItem);
    cartService.isCheckoutModalOpen.set(true);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Not verified
    component.userLocation.set(null);
    component.isOutsideBidar.set(false);

    component.checkoutForm.patchValue({
      orderType: 'delivery',
      fullName: 'Rahul Sharma',
      mobileNumber: '9876543210',
      flatNumber: 'House 42',
      areaLocality: 'Mailoor Road',
      paymentMethod: 'upi'
    });

    const openSpy = vi.spyOn(window, 'open');
    const toastSpy = vi.spyOn(toastService, 'show');

    component.onSubmitOrder();

    expect(openSpy).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringContaining('verify your live location in Bidar'),
      'error'
    );
  });

  it('should allow delivery and format WhatsApp URL when customer is inside Bidar', () => {
    cartService.addItem(mockMenuItem);
    cartService.isCheckoutModalOpen.set(true);
    const fixture = TestBed.createComponent(CheckoutModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Set coordinates inside Bidar
    component.userLocation.set({ lat: 17.913456, lng: 77.519876 });
    component.userDistanceKm.set(2.8);
    component.isOutsideBidar.set(false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.gps-location-card.located')).toBeTruthy();
    expect(el.textContent).toContain('Verified in Bidar');

    // Fill form
    component.checkoutForm.patchValue({
      orderType: 'delivery',
      fullName: 'Rahul Sharma',
      mobileNumber: '9876543210',
      flatNumber: 'House 42',
      areaLocality: 'Mailoor Road',
      paymentMethod: 'upi',
      upiTransactionId: '123456789012'
    });

    let openedUrl = '';
    vi.spyOn(window, 'open').mockImplementation((url?: string | URL) => {
      openedUrl = String(url);
      return null;
    });

    // Submit order
    component.onSubmitOrder();

    expect(openedUrl).toContain('wa.me');
    expect(openedUrl).toContain(encodeURIComponent('https://maps.google.com/?q=17.913456,77.519876'));
    expect(openedUrl).toContain(encodeURIComponent('Rahul Sharma'));
    expect(openedUrl).toContain(encodeURIComponent('9876543210'));
    expect(openedUrl).toContain(encodeURIComponent('Falooda Special'));
    expect(openedUrl).toContain(encodeURIComponent('Online UPI Payment (QR Code Scanned)'));
    expect(openedUrl).toContain(encodeURIComponent('123456789012'));
  });
});

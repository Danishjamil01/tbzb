import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { BusinessStatusService } from './business-status.service';
import { MENU_ITEMS } from '../data/menu.data';

describe('CartService & Menu Integrity', () => {
  let cartService: CartService;
  let statusService: BusinessStatusService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    cartService = TestBed.inject(CartService);
    statusService = TestBed.inject(BusinessStatusService);
  });

  afterEach(() => {
    cartService.clearCart();
    statusService.resetSimulatedTime();
  });

  it('should have exact menu items count of 42', () => {
    expect(MENU_ITEMS.length).toBe(42);
  });

  it('should have signature Kunafa Jar at ₹250', () => {
    const kunafa = MENU_ITEMS.find(i => i.id === 'kunafa-jar');
    expect(kunafa).toBeDefined();
    expect(kunafa?.price).toBe(250);
  });

  it('should have Chicken Handi Biryani at ₹220', () => {
    const biryani = MENU_ITEMS.find(i => i.id === 'chicken-handi-biryani');
    expect(biryani).toBeDefined();
    expect(biryani?.price).toBe(220);
  });

  it('should add item and calculate subtotal properly', () => {
    const item1 = MENU_ITEMS[0]; // e.g. Kunafa Jar (250)
    cartService.addItem(item1, 2);

    expect(cartService.totalItemCount()).toBe(2);
    expect(cartService.subtotal()).toBe(item1.price * 2);
  });

  it('should decrease item quantity and remove when zero', () => {
    const item = MENU_ITEMS[1];
    cartService.addItem(item, 1);
    expect(cartService.totalItemCount()).toBe(1);

    cartService.decreaseItem(item.id);
    expect(cartService.totalItemCount()).toBe(0);
    expect(cartService.isCartEmpty()).toBe(true);
  });

  it('should persist cart to localStorage', () => {
    const item = MENU_ITEMS[2];
    cartService.addItem(item, 3);
    const stored = localStorage.getItem('tbzb_cart_items_v1');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).length).toBe(1);
    expect(JSON.parse(stored!)[0].quantity).toBe(3);
  });
});

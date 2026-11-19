import { TestBed } from '@angular/core/testing';
import { BusinessStatusService } from './business-status.service';

describe('BusinessStatusService', () => {
  let service: BusinessStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessStatusService);
  });

  afterEach(() => {
    service.resetSimulatedTime();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly evaluate 9:00 AM as CLOSED', () => {
    service.setSimulatedTime(9, 0);
    const status = service.status();
    expect(status.isOpen).toBe(false);
  });

  it('should correctly evaluate 10:00 AM as OPEN', () => {
    service.setSimulatedTime(10, 0);
    const status = service.status();
    expect(status.isOpen).toBe(true);
    expect(status.isAfterMidnight).toBe(false);
  });

  it('should correctly evaluate 4:00 PM (16:00) as OPEN', () => {
    service.setSimulatedTime(16, 0);
    const status = service.status();
    expect(status.isOpen).toBe(true);
    expect(status.isAfterMidnight).toBe(false);
  });

  it('should correctly evaluate 11:59 PM (23:59) as OPEN', () => {
    service.setSimulatedTime(23, 59);
    const status = service.status();
    expect(status.isOpen).toBe(true);
    expect(status.isAfterMidnight).toBe(false);
  });

  it('should correctly evaluate 12:30 AM (00:30) as OPEN and after midnight', () => {
    service.setSimulatedTime(0, 30);
    const status = service.status();
    expect(status.isOpen).toBe(true);
    expect(status.isAfterMidnight).toBe(true);
  });

  it('should correctly evaluate 1:00 AM (01:00) as CLOSED', () => {
    service.setSimulatedTime(1, 0);
    const status = service.status();
    expect(status.isOpen).toBe(false);
  });

  it('should correctly evaluate 2:00 AM (02:00) as CLOSED', () => {
    service.setSimulatedTime(2, 0);
    const status = service.status();
    expect(status.isOpen).toBe(false);
  });

  it('should apply ₹70 delivery charge after midnight (12:30 AM)', () => {
    service.setSimulatedTime(0, 30);
    const calc = service.calculateCart(350);
    expect(calc.isAfterMidnight).toBe(true);
    expect(calc.deliveryCharge).toBe(70);
    expect(calc.total).toBe(420);
    expect(calc.hasPendingDeliveryFee).toBe(false);
  });

  it('should mark delivery charge as awaiting confirmation before midnight when null', () => {
    service.setSimulatedTime(14, 0); // 2:00 PM
    const calc = service.calculateCart(350);
    expect(calc.isAfterMidnight).toBe(false);
    expect(calc.deliveryCharge).toBeNull();
    expect(calc.total).toBe(350);
    expect(calc.hasPendingDeliveryFee).toBe(true);
  });
});

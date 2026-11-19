import { CartItem, CartCalculation } from './cart.model';

export type OrderType = 'delivery' | 'pickup';
export type PaymentMethod = 'cod' | 'upi';

export interface CustomerDetails {
  fullName: string;
  mobileNumber: string;
  orderType: OrderType;
  flatNumber: string;
  areaLocality: string;
  landmark?: string;
  deliveryInstructions?: string;
  paymentMethod: PaymentMethod;
  locationCoordinates?: { lat: number; lng: number };
  googleMapsUrl?: string;
  upiTransactionId?: string;
}

export interface PlacedOrder {
  orderId: string;
  timestamp: Date;
  customer: CustomerDetails;
  items: CartItem[];
  calculation: CartCalculation;
  formattedWhatsAppMessage: string;
  whatsAppUrl: string;
}


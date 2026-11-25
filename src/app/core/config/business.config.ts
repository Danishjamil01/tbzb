export interface BusinessConfig {
  name: string;
  shortName: string;
  tagline: string;
  brandStatement: string;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
    areaNote: string;
    latitude: number;
    longitude: number;
    maxDeliveryRadiusKm: number;
    mapUrl: string;
    geoapifyApiKey?: string;
  };
  contact: {
    phone: string;
    phoneFormatted: string;
    whatsappNumber: string; // 919164346048 format for wa.me
    instagram: string;
    instagramUrl: string;
  };
  businessHours: {
    openingTime: string; // "10:00" (10:00 AM)
    closingTime: string; // "01:00" (01:00 AM next day)
    openingHour: number; // 10
    closingHour: number; // 1 (next day)
    displayHours: string; // "10:00 AM – 1:00 AM"
    timeZone: string;
  };
  deliverySettings: {
    afterMidnightCharge: number; // ₹70 confirmed
    beforeMidnightCharge: number | null; // null => awaiting confirmation
    afterMidnightStartHour: number; // 0 (00:00 midnight)
    afterMidnightEndHour: number; // 1 (01:00 AM)
    deliveryChargeMode: 'configurable';
    awaitingConfirmationMessage: string;
  };
  orderSettings: {
    homeDelivery: boolean;
    pickup: boolean;
    allowCod: boolean;
    allowUpi: boolean;
    minimumOrderAmount: number;
  };
}

export const BUSINESS_CONFIG: BusinessConfig = {
  name: 'The Bite Zone',
  shortName: 'TBZB',
  tagline: 'Good Food... Good Mood...',
  brandStatement: 'Taste the Difference... Only at TBZB',
  location: {
    city: 'Bidar',
    state: 'Karnataka',
    country: 'India',
    address: '18-3-391/2/62, Vidya Nagar, Bidar, Karnataka 585403',
    areaNote: 'Serving throughout Bidar City (within 18 km of Vidya Nagar)',
    latitude: 17.8953274,
    longitude: 77.5021871,
    maxDeliveryRadiusKm: 18,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=17.8953274,77.5021871',
    geoapifyApiKey: ''
  },
  contact: {
    phone: '9164346048',
    phoneFormatted: '+91 91643 46048',
    whatsappNumber: '919164346048',
    instagram: '@thebitezonebidar',
    instagramUrl: 'https://instagram.com/thebitezonebidar'
  },
  businessHours: {
    openingTime: '10:00',
    closingTime: '01:00',
    openingHour: 10,
    closingHour: 1,
    displayHours: '10:00 AM – 1:00 AM',
    timeZone: 'Asia/Kolkata'
  },
  deliverySettings: {
    afterMidnightCharge: 60, // ₹60 after 12 AM midnight
    beforeMidnightCharge: 50, // ₹50 normal daytime / evening delivery
    afterMidnightStartHour: 0,
    afterMidnightEndHour: 1,
    deliveryChargeMode: 'configurable',
    awaitingConfirmationMessage: 'Standard delivery fee: ₹50'
  },
  orderSettings: {
    homeDelivery: true,
    pickup: true,
    allowCod: true,
    allowUpi: true,
    minimumOrderAmount: 0
  }
};


export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  isVisible: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isVegetarian?: boolean;
  isAvailable: boolean;
  isFeatured?: boolean;
  isChefsSpecial?: boolean;
  allergenInfo?: string;
  spiceLevel?: 'mild' | 'medium' | 'hot';
  pairing?: string;
  order: number;
}

export interface ClassicDishPricing {
  id: string; // e.g., 'korma', 'madras'
  dishName: string;
  chickenPrice: number;
  lambPrice: number;
  prawnPrice: number | null; // null if not provided
  kingPrawnPrice: number | null; // null if not provided
  vegPrice: number;
  order: number;
}

export type ProteinType = 'chicken' | 'lamb' | 'prawn' | 'kingPrawn' | 'veg';

export interface CartItem {
  id: string; // unique cart line id
  menuItemId?: string;
  name: string;
  categoryName?: string;
  price: number;
  quantity: number;
  selectedProtein?: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  customerId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FullyBookedDate {
  id: string; // YYYY-MM-DD
  date: string;
  isFullyBooked: boolean;
  reason?: string;
  updatedAt?: string;
}

export interface CustomerMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'Complaint' | 'Feedback' | 'Menu Suggestion' | 'General Enquiry' | 'Other';
  status: 'unread' | 'read' | 'resolved';
  createdAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number; // 1-5
  reviewText: string;
  date: string;
  imageUrl?: string;
  isPublished: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
}

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready_for_collection' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: 'collection';
  items: CartItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  currency: 'GBP';
  paymentProvider: 'stripe' | 'cash' | 'collection';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  specialInstructions?: string;
  createdAt: string;
  updatedAt?: string;
  paidAt?: string;
  customerConfirmedAt?: string;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  address: string;
  postcode: string;
  city: string;
  county: string;
  country: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  openingHours: {
    days: string;
    hours: string;
  }[];
}

export interface PaymentSettings {
  stripeEnabled: boolean;
  stripeConfigured: boolean;
  currency: 'GBP';
  checkoutProvider: 'stripe';
  collectionDiscountEnabled: boolean;
  collectionDiscountPercent: number;
}

export interface HomepageSettings {
  heroEyebrow: string;
  heroHeading: string;
  heroSupportingText: string;
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;
  heroImageUrl: string;
  introHeading: string;
  introParagraph1: string;
  introParagraph2: string;
  introImageUrl: string;
  specialFeatureTitle: string;
  specialFeatureSubtitle: string;
  specialFeatureDescription: string;
  specialFeaturePrice: string;
  specialFeatureImageUrl: string;
  reservationHeading: string;
  reservationSupportingText: string;
}

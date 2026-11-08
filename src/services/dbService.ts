import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  MenuCategory,
  MenuItem,
  ClassicDishPricing,
  Reservation,
  FullyBookedDate,
  CustomerMessage,
  Review,
  GalleryItem,
  Order,
  RestaurantInfo,
  PaymentSettings,
  HomepageSettings
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_CLASSIC_DISHES,
  INITIAL_REVIEWS,
  INITIAL_GALLERY,
  INITIAL_RESTAURANT_INFO,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_HOMEPAGE_SETTINGS
} from '../data/initialData';
import { resolveAssetUrl } from '../utils/imagePath';

// Collection references
const CATEGORIES_COL = 'menuCategories';
const MENU_ITEMS_COL = 'menuItems';
const CLASSIC_DISHES_COL = 'classicDishesPricing';
const RESERVATIONS_COL = 'reservations';
const FULLY_BOOKED_COL = 'fullyBookedDates';
const MESSAGES_COL = 'customerMessages';
const REVIEWS_COL = 'reviews';
const GALLERY_COL = 'gallery';
const ORDERS_COL = 'orders';
const SETTINGS_COL = 'restaurantSettings';

// Initialize and Seed Default Data if not yet present
export async function seedInitialDataIfNeeded() {
  try {
    const categoriesSnapshot = await getDocs(collection(db, CATEGORIES_COL));
    if (categoriesSnapshot.empty) {
      console.log('Seeding initial categories and menu items...');
      
      // 1. Categories
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, CATEGORIES_COL, cat.id), cat);
      }
      
      // 2. Menu Items
      for (const item of INITIAL_MENU_ITEMS) {
        await setDoc(doc(db, MENU_ITEMS_COL, item.id), item);
      }
      
      // 3. Classic Dishes Pricing Table
      for (const classic of INITIAL_CLASSIC_DISHES) {
        await setDoc(doc(db, CLASSIC_DISHES_COL, classic.id), classic);
      }
      
      // 4. Reviews
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, REVIEWS_COL, rev.id), rev);
      }
      
      // 5. Gallery
      for (const gal of INITIAL_GALLERY) {
        await setDoc(doc(db, GALLERY_COL, gal.id), gal);
      }
      
      // 6. Settings
      await setDoc(doc(db, SETTINGS_COL, 'info'), INITIAL_RESTAURANT_INFO);
      await setDoc(doc(db, SETTINGS_COL, 'payment'), INITIAL_PAYMENT_SETTINGS);
      await setDoc(doc(db, SETTINGS_COL, 'homepage'), INITIAL_HOMEPAGE_SETTINGS);
    }
  } catch (err) {
    console.warn('Initial seeding encountered check:', err);
  }
}

// ================= MENU CATEGORIES =================
export async function getCategories(): Promise<MenuCategory[]> {
  try {
    const q = query(collection(db, CATEGORIES_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return INITIAL_CATEGORIES;
    return snapshot.docs.map(doc => doc.data() as MenuCategory);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, CATEGORIES_COL);
    } catch {
      return INITIAL_CATEGORIES;
    }
  }
}

export async function saveCategory(category: MenuCategory): Promise<void> {
  try {
    await setDoc(doc(db, CATEGORIES_COL, category.id), category);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CATEGORIES_COL}/${category.id}`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CATEGORIES_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CATEGORIES_COL}/${id}`);
  }
}

// ================= MENU ITEMS =================
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const q = query(collection(db, MENU_ITEMS_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return INITIAL_MENU_ITEMS;
    return snapshot.docs.map(doc => doc.data() as MenuItem);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, MENU_ITEMS_COL);
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  }
}

export async function saveMenuItem(item: MenuItem): Promise<void> {
  try {
    await setDoc(doc(db, MENU_ITEMS_COL, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MENU_ITEMS_COL}/${item.id}`);
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, MENU_ITEMS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MENU_ITEMS_COL}/${id}`);
  }
}

// ================= CLASSIC DISHES PRICING TABLE =================
export async function getClassicDishesPricing(): Promise<ClassicDishPricing[]> {
  try {
    const q = query(collection(db, CLASSIC_DISHES_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return INITIAL_CLASSIC_DISHES;
    return snapshot.docs.map(doc => doc.data() as ClassicDishPricing);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, CLASSIC_DISHES_COL);
    } catch {
      return INITIAL_CLASSIC_DISHES;
    }
  }
}

export async function updateClassicDishPricing(pricing: ClassicDishPricing): Promise<void> {
  try {
    await setDoc(doc(db, CLASSIC_DISHES_COL, pricing.id), pricing);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CLASSIC_DISHES_COL}/${pricing.id}`);
  }
}

// ================= FULLY BOOKED DATE CONTROL =================
export async function getFullyBookedDates(): Promise<FullyBookedDate[]> {
  try {
    const snapshot = await getDocs(collection(db, FULLY_BOOKED_COL));
    return snapshot.docs.map(doc => doc.data() as FullyBookedDate);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, FULLY_BOOKED_COL);
    } catch {
      return [];
    }
  }
}

export async function isDateFullyBooked(dateStr: string): Promise<boolean> {
  try {
    const docRef = doc(db, FULLY_BOOKED_COL, dateStr);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as FullyBookedDate;
      return data.isFullyBooked === true;
    }
    return false;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, `${FULLY_BOOKED_COL}/${dateStr}`);
    } catch {
      return false;
    }
  }
}

export async function setDateFullyBooked(dateStr: string, isFullyBooked: boolean, reason?: string): Promise<void> {
  try {
    const docRef = doc(db, FULLY_BOOKED_COL, dateStr);
    await setDoc(docRef, {
      id: dateStr,
      date: dateStr,
      isFullyBooked,
      reason: reason || (isFullyBooked ? 'Marked fully booked by restaurant admin' : ''),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${FULLY_BOOKED_COL}/${dateStr}`);
  }
}

export async function removeFullyBookedDate(dateStr: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FULLY_BOOKED_COL, dateStr));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${FULLY_BOOKED_COL}/${dateStr}`);
  }
}

// ================= RESERVATIONS =================
export async function createReservation(res: Omit<Reservation, 'id' | 'createdAt' | 'status'> & { customerId?: string }): Promise<Reservation> {
  // 1. Strict validation: check fully booked date
  const blocked = await isDateFullyBooked(res.date);
  if (blocked) {
    const today = new Date().toISOString().split('T')[0];
    if (res.date === today) {
      throw new Error("Sorry, all tables are fully booked today. Please choose tomorrow or another available date.");
    } else {
      throw new Error("Sorry, all tables are fully booked on your selected date. Please choose another available date.");
    }
  }

  const reservationId = 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const newReservation: Reservation = {
    ...res,
    id: reservationId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, RESERVATIONS_COL, reservationId), newReservation);
    return newReservation;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${RESERVATIONS_COL}/${reservationId}`);
  }
}

export async function getReservations(): Promise<Reservation[]> {
  try {
    const q = query(collection(db, RESERVATIONS_COL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Reservation);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, RESERVATIONS_COL);
    } catch {
      return [];
    }
  }
}

export async function getUserReservations(customerId?: string, customerEmail?: string): Promise<Reservation[]> {
  try {
    if (!customerId && !customerEmail) return [];
    const q = customerId
      ? query(collection(db, RESERVATIONS_COL), where('customerId', '==', customerId))
      : query(collection(db, RESERVATIONS_COL), where('customerEmail', '==', customerEmail));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Reservation);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, RESERVATIONS_COL);
    } catch {
      return [];
    }
  }
}

export async function updateReservationStatus(id: string, status: Reservation['status']): Promise<void> {
  try {
    await updateDoc(doc(db, RESERVATIONS_COL, id), {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${RESERVATIONS_COL}/${id}`);
  }
}

export async function deleteReservation(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, RESERVATIONS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${RESERVATIONS_COL}/${id}`);
  }
}

// ================= CUSTOMER MESSAGES / COMPLAINTS & FEEDBACK =================
export async function sendCustomerMessage(msg: Omit<CustomerMessage, 'id' | 'status' | 'createdAt'>): Promise<CustomerMessage> {
  const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const newMsg: CustomerMessage = {
    ...msg,
    id: msgId,
    status: 'unread',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, MESSAGES_COL, msgId), newMsg);
    return newMsg;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${MESSAGES_COL}/${msgId}`);
  }
}

export async function getCustomerMessages(): Promise<CustomerMessage[]> {
  try {
    const q = query(collection(db, MESSAGES_COL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as CustomerMessage);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, MESSAGES_COL);
    } catch {
      return [];
    }
  }
}

export async function updateMessageStatus(id: string, status: CustomerMessage['status']): Promise<void> {
  try {
    await updateDoc(doc(db, MESSAGES_COL, id), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MESSAGES_COL}/${id}`);
  }
}

export async function deleteCustomerMessage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, MESSAGES_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MESSAGES_COL}/${id}`);
  }
}

// ================= REVIEWS =================
export async function getReviews(): Promise<Review[]> {
  try {
    const snapshot = await getDocs(collection(db, REVIEWS_COL));
    if (snapshot.empty) return INITIAL_REVIEWS;
    return snapshot.docs.map(doc => doc.data() as Review);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, REVIEWS_COL);
    } catch {
      return INITIAL_REVIEWS;
    }
  }
}

export async function saveReview(review: Review): Promise<void> {
  try {
    await setDoc(doc(db, REVIEWS_COL, review.id), review);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${REVIEWS_COL}/${review.id}`);
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, REVIEWS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${REVIEWS_COL}/${id}`);
  }
}

// ================= GALLERY =================
export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const q = query(collection(db, GALLERY_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return INITIAL_GALLERY;
    return snapshot.docs.map(doc => {
      const item = doc.data() as GalleryItem;
      return {
        ...item,
        imageUrl: resolveAssetUrl(item.imageUrl),
      };
    });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, GALLERY_COL);
    } catch {
      return INITIAL_GALLERY;
    }
  }
}

export async function saveGalleryItem(item: GalleryItem): Promise<void> {
  try {
    await setDoc(doc(db, GALLERY_COL, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${GALLERY_COL}/${item.id}`);
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GALLERY_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${GALLERY_COL}/${id}`);
  }
}

// ================= ORDERS =================
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus' | 'paymentStatus'>): Promise<Order> {
  const docId = orderData.orderId;
  const newOrder: Order = {
    ...orderData,
    id: docId,
    orderStatus: 'new',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, ORDERS_COL, docId), newOrder);
    return newOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ORDERS_COL}/${docId}`);
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, ORDERS_COL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Order);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, ORDERS_COL);
    } catch {
      return [];
    }
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const docSnap = await getDoc(doc(db, ORDERS_COL, orderId));
    if (docSnap.exists()) {
      return docSnap.data() as Order;
    }
    return null;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, `${ORDERS_COL}/${orderId}`);
    } catch {
      return null;
    }
  }
}

export async function updateOrderStatus(orderId: string, orderStatus: Order['orderStatus']): Promise<void> {
  try {
    await updateDoc(doc(db, ORDERS_COL, orderId), {
      orderStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
  }
}

// ================= RESTAURANT SETTINGS =================
export async function getRestaurantSettings() {
  try {
    const [infoSnap, paySnap, homeSnap] = await Promise.all([
      getDoc(doc(db, SETTINGS_COL, 'info')),
      getDoc(doc(db, SETTINGS_COL, 'payment')),
      getDoc(doc(db, SETTINGS_COL, 'homepage')),
    ]);

    const rawHome = (homeSnap.exists() ? homeSnap.data() : INITIAL_HOMEPAGE_SETTINGS) as HomepageSettings;
    const homepage: HomepageSettings = {
      ...rawHome,
      heroImageUrl: resolveAssetUrl(rawHome.heroImageUrl, '/images/rashoi_hero_cuisine_1794139786997.jpg'),
      introImageUrl: resolveAssetUrl(rawHome.introImageUrl, '/images/rashoi_interior_dining_1794139799818.jpg'),
      specialFeatureImageUrl: resolveAssetUrl(rawHome.specialFeatureImageUrl, '/images/rashoi_signature_dish_1794139812970.jpg'),
    };

    return {
      info: (infoSnap.exists() ? infoSnap.data() : INITIAL_RESTAURANT_INFO) as RestaurantInfo,
      payment: (paySnap.exists() ? paySnap.data() : INITIAL_PAYMENT_SETTINGS) as PaymentSettings,
      homepage,
    };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, SETTINGS_COL);
    } catch {
      return {
        info: INITIAL_RESTAURANT_INFO,
        payment: INITIAL_PAYMENT_SETTINGS,
        homepage: INITIAL_HOMEPAGE_SETTINGS,
      };
    }
  }
}

export async function saveRestaurantInfo(info: RestaurantInfo): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'info'), info);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COL}/info`);
  }
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'payment'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COL}/payment`);
  }
}

export async function saveHomepageSettings(settings: HomepageSettings): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'homepage'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COL}/homepage`);
  }
}

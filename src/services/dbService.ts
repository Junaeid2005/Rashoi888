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
  onSnapshot,
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
const BOOKED_SLOTS_COL = 'bookedSlots';
const MESSAGES_COL = 'customerMessages';
const REVIEWS_COL = 'reviews';
const GALLERY_COL = 'gallery';
const ORDERS_COL = 'orders';
const SETTINGS_COL = 'restaurantSettings';

/**
 * Recursively sanitizes any payload destined for Firestore by stripping keys with undefined values.
 * Firestore strictly rejects undefined field values.
 */
export function cleanFirestorePayload<T extends Record<string, any>>(data: T): T {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = cleanFirestorePayload(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as T;
}

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

// ================= TIME SLOT COLLISION & MULTI-TABLE CAPACITY =================
// Rashoi Restaurant has unlimited table capacity per time slot.
export const MAX_TABLES_PER_SLOT = 999999;

export interface TimeSlotStatus {
  time: string;
  bookedCount: number;
  maxTables: number;
  isFull: boolean;
}

/**
 * Returns a list of time slots that are fully booked.
 * Per restaurant policy, tables are unlimited per time slot so all time slots remain open!
 */
export async function getBookedTimeSlotsForDate(_dateStr: string): Promise<string[]> {
  return [];
}

/**
 * Returns detailed status for each time slot on a given date (how many tables are booked).
 */
export async function getTimeSlotAvailabilityMap(dateStr: string): Promise<Record<string, { bookedCount: number; isFull: boolean }>> {
  try {
    const slotDoc = await getDoc(doc(db, BOOKED_SLOTS_COL, dateStr));
    const result: Record<string, { bookedCount: number; isFull: boolean }> = {};
    if (slotDoc.exists()) {
      const data = slotDoc.data();
      const slots = data?.slots || {};

      for (const [timeStr, val] of Object.entries(slots)) {
        const reservations: string[] = Array.isArray(val)
          ? val
          : (typeof val === 'string' && val ? [val] : []);
        result[timeStr] = {
          bookedCount: reservations.length,
          isFull: reservations.length >= MAX_TABLES_PER_SLOT,
        };
      }
    }
    return result;
  } catch (error) {
    console.warn('Error reading time slot availability map:', error);
    return {};
  }
}

export async function isTimeSlotBooked(_dateStr: string, _timeStr: string): Promise<boolean> {
  return false;
}

export async function lockTimeSlot(dateStr: string, timeStr: string, reservationId: string): Promise<void> {
  try {
    const slotDocRef = doc(db, BOOKED_SLOTS_COL, dateStr);
    const snap = await getDoc(slotDocRef);
    const existingSlots = snap.exists() ? (snap.data()?.slots || {}) : {};
    
    const currentList: string[] = Array.isArray(existingSlots[timeStr])
      ? existingSlots[timeStr]
      : (typeof existingSlots[timeStr] === 'string' && existingSlots[timeStr] ? [existingSlots[timeStr]] : []);

    const updatedList = Array.from(new Set([...currentList, reservationId]));

    await setDoc(slotDocRef, {
      date: dateStr,
      slots: {
        ...existingSlots,
        [timeStr]: updatedList,
      },
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error locking time slot:', err);
  }
}

export async function unlockTimeSlot(dateStr: string, timeStr: string, reservationId?: string): Promise<void> {
  try {
    const slotDocRef = doc(db, BOOKED_SLOTS_COL, dateStr);
    const snap = await getDoc(slotDocRef);
    if (!snap.exists()) return;

    const existingSlots = snap.data()?.slots || {};
    const currentList: string[] = Array.isArray(existingSlots[timeStr])
      ? existingSlots[timeStr]
      : (typeof existingSlots[timeStr] === 'string' && existingSlots[timeStr] ? [existingSlots[timeStr]] : []);

    const updatedSlots = { ...existingSlots };
    if (reservationId) {
      updatedSlots[timeStr] = currentList.filter((id) => id !== reservationId);
      if (updatedSlots[timeStr].length === 0) {
        delete updatedSlots[timeStr];
      }
    } else {
      delete updatedSlots[timeStr];
    }

    await setDoc(slotDocRef, {
      date: dateStr,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Error unlocking time slot:', err);
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

  // 2. Multi-table capacity validation: check if max tables reached for this specific time
  const timeTaken = await isTimeSlotBooked(res.date, res.time);
  if (timeTaken) {
    throw new Error(`All tables for the time slot (${res.time}) on ${res.date} are currently fully booked. Please select another available time.`);
  }

  const reservationId = 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const newReservation: Reservation = {
    ...res,
    id: reservationId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const payload = cleanFirestorePayload(newReservation);

  try {
    await setDoc(doc(db, RESERVATIONS_COL, reservationId), payload);
    // Add reservation to time slot table list
    await lockTimeSlot(res.date, res.time, reservationId);
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
    const resDocRef = doc(db, RESERVATIONS_COL, id);
    const resSnap = await getDoc(resDocRef);
    const existing = resSnap.exists() ? (resSnap.data() as Reservation) : null;

    await updateDoc(resDocRef, {
      status,
      updatedAt: new Date().toISOString()
    });

    if (existing && existing.date && existing.time) {
      if (status === 'completed' || status === 'cancelled') {
        // Unlock this reservation's table so it becomes available for new reservations
        await unlockTimeSlot(existing.date, existing.time, id);
      } else if (status === 'confirmed' || status === 'pending') {
        // Re-lock time slot
        await lockTimeSlot(existing.date, existing.time, id);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${RESERVATIONS_COL}/${id}`);
  }
}

export async function cancelUserReservation(id: string): Promise<void> {
  try {
    const resDocRef = doc(db, RESERVATIONS_COL, id);
    await updateDoc(resDocRef, {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${RESERVATIONS_COL}/${id}`);
  }
}

export async function deleteReservation(id: string): Promise<void> {
  try {
    const resDocRef = doc(db, RESERVATIONS_COL, id);
    const resSnap = await getDoc(resDocRef);
    if (resSnap.exists()) {
      const existing = resSnap.data() as Reservation;
      if (existing.date && existing.time) {
        await unlockTimeSlot(existing.date, existing.time, id);
      }
    }
    await deleteDoc(resDocRef);
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

  const payload = cleanFirestorePayload(newMsg);

  try {
    await setDoc(doc(db, MESSAGES_COL, msgId), payload);
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

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus' | 'paymentStatus'>): Promise<Order> {
  const docId = orderData.orderId;
  const newOrder: Order = {
    ...orderData,
    id: docId,
    orderStatus: 'accepted',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString()
  };

  const payload = cleanFirestorePayload(newOrder);

  try {
    await setDoc(doc(db, ORDERS_COL, docId), payload);
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

export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ORDERS_COL, orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COL}/${orderId}`);
  }
}

export async function confirmOrderReceiptByCustomer(orderId: string): Promise<void> {
  try {
    await updateDoc(doc(db, ORDERS_COL, orderId), {
      customerConfirmedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
  }
}

export async function getUserOrders(customerId?: string, customerEmail?: string): Promise<Order[]> {
  try {
    if (!customerId && !customerEmail) return [];
    
    const ordersMap = new Map<string, Order>();

    if (customerId) {
      try {
        const qUid = query(collection(db, ORDERS_COL), where('customerId', '==', customerId));
        const snapUid = await getDocs(qUid);
        snapUid.docs.forEach((d) => {
          ordersMap.set(d.id, d.data() as Order);
        });
      } catch (e) {
        console.warn('getUserOrders UID query error:', e);
      }
    }

    if (customerEmail) {
      try {
        const qEmail = query(collection(db, ORDERS_COL), where('customerEmail', '==', customerEmail));
        const snapEmail = await getDocs(qEmail);
        snapEmail.docs.forEach((d) => {
          ordersMap.set(d.id, d.data() as Order);
        });
      } catch (e) {
        console.warn('getUserOrders Email query error:', e);
      }
    }

    // Safety fallback: retrieve any locally saved order IDs
    if (typeof window !== 'undefined') {
      try {
        const localIds: string[] = JSON.parse(localStorage.getItem('rashoi_user_orders') || '[]');
        for (const localId of localIds) {
          if (!ordersMap.has(localId)) {
            const docSnap = await getDoc(doc(db, ORDERS_COL, localId));
            if (docSnap.exists()) {
              ordersMap.set(docSnap.id, docSnap.data() as Order);
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const list = Array.from(ordersMap.values());
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.warn('getUserOrders error:', error);
    return [];
  }
}

export function subscribeToUserOrders(
  customerId: string | undefined,
  customerEmail: string | undefined,
  onOrders: (orders: Order[]) => void
): () => void {
  if (!customerId && !customerEmail) {
    onOrders([]);
    return () => {};
  }

  const ordersMap = new Map<string, Order>();
  const unsubs: (() => void)[] = [];

  const broadcast = () => {
    const list = Array.from(ordersMap.values());
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onOrders(list);
  };

  if (customerId) {
    const qUid = query(collection(db, ORDERS_COL), where('customerId', '==', customerId));
    const unsubUid = onSnapshot(
      qUid,
      (snapshot) => {
        snapshot.docs.forEach((docSnap) => {
          ordersMap.set(docSnap.id, docSnap.data() as Order);
        });
        broadcast();
      },
      (err) => {
        console.warn('subscribeToUserOrders UID error:', err);
      }
    );
    unsubs.push(unsubUid);
  }

  if (customerEmail) {
    const qEmail = query(collection(db, ORDERS_COL), where('customerEmail', '==', customerEmail));
    const unsubEmail = onSnapshot(
      qEmail,
      (snapshot) => {
        snapshot.docs.forEach((docSnap) => {
          ordersMap.set(docSnap.id, docSnap.data() as Order);
        });
        broadcast();
      },
      (err) => {
        console.warn('subscribeToUserOrders Email error:', err);
      }
    );
    unsubs.push(unsubEmail);
  }

  // Safety fallback for any local order IDs
  if (typeof window !== 'undefined') {
    try {
      const localIds: string[] = JSON.parse(localStorage.getItem('rashoi_user_orders') || '[]');
      localIds.slice(0, 20).forEach(async (id) => {
        try {
          const docSnap = await getDoc(doc(db, ORDERS_COL, id));
          if (docSnap.exists()) {
            ordersMap.set(docSnap.id, docSnap.data() as Order);
            broadcast();
          }
        } catch (e) {
          // ignore
        }
      });
    } catch (e) {
      // ignore
    }
  }

  return () => {
    unsubs.forEach((u) => u());
  };
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

    const rawInfo = (infoSnap.exists() ? infoSnap.data() : INITIAL_RESTAURANT_INFO) as RestaurantInfo;
    const isOldHours = !rawInfo.openingHours || rawInfo.openingHours.some(h => h.hours.includes('10:30') || h.hours.includes('10:00') || h.days.includes('Monday – Thursday'));
    const info: RestaurantInfo = {
      ...rawInfo,
      openingHours: isOldHours ? INITIAL_RESTAURANT_INFO.openingHours : rawInfo.openingHours,
    };

    return {
      info,
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

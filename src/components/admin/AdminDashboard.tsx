import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { playAdminAlertChime, sendDesktopNotification, getAdminAlertVolume, setAdminAlertVolume } from '../../utils/audioNotification';
import { useAuth } from '../../context/AuthContext';
import {
  getCategories,
  saveCategory,
  deleteCategory,
  getMenuItems,
  saveMenuItem,
  deleteMenuItem,
  getClassicDishesPricing,
  updateClassicDishPricing,
  getReservations,
  updateReservationStatus,
  deleteReservation,
  getFullyBookedDates,
  setDateFullyBooked,
  removeFullyBookedDate,
  getCustomerMessages,
  updateMessageStatus,
  deleteCustomerMessage,
  getReviews,
  saveReview,
  deleteReview,
  getGallery,
  saveGalleryItem,
  deleteGalleryItem,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getRestaurantSettings,
  saveRestaurantInfo,
  savePaymentSettings,
  saveHomepageSettings,
} from '../../services/dbService';
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
  HomepageSettings,
} from '../../types';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  CalendarCheck,
  MessageSquare,
  Image as ImageIcon,
  Home,
  Info,
  CreditCard,
  ShoppingBag,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Save,
  Clock,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  ArrowLeft,
  Mail,
  Upload,
  Printer,
} from 'lucide-react';
import { getDishVisualMeta } from '../../utils/menuImageResolver';
import { resolveAssetUrl } from '../../utils/imagePath';

function compressImageFile(file: File, maxWidth = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface AdminDashboardProps {
  onReturnToSite: () => void;
  initialTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onReturnToSite, initialTab }) => {
  const { user, isAdmin, signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'menu'
    | 'classicPricing'
    | 'categories'
    | 'reservations'
    | 'messages'
    | 'homepage'
    | 'restaurantInfo'
    | 'paymentSettings'
  >((initialTab as any) || 'overview');

  const handleSelectTab = (tabId: typeof activeTab) => {
    if (tabId === activeTab) return;
    window.history.pushState({ view: 'admin', adminTab: tabId }, '', `#admin-${tabId}`);
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Handle phone / browser back navigation within Admin sub-tabs & modals
  useEffect(() => {
    const handleAdminPop = (event: PopStateEvent) => {
      const hash = window.location.hash;
      const state = event.state;

      if (state?.adminTab) {
        setActiveTab(state.adminTab);
      } else if (hash.startsWith('#admin-')) {
        const sub = hash.replace('#admin-', '') as typeof activeTab;
        setActiveTab(sub);
      } else if (hash === '#admin') {
        setActiveTab('overview');
      }
    };

    window.addEventListener('popstate', handleAdminPop);
    return () => window.removeEventListener('popstate', handleAdminPop);
  }, []);

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Data states
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [classicDishes, setClassicDishes] = useState<ClassicDishPricing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<FullyBookedDate[]>([]);
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);

  // Fully Booked Date Control state
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [blockedReason, setBlockedReason] = useState('Fully booked for dinner service');

  // Menu item modal / form
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rashoi_admin_sound');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [volume, setVolume] = useState<number>(() => getAdminAlertVolume());

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setAdminAlertVolume(newVol);
    if (!soundEnabled && newVol > 0) {
      setSoundEnabled(true);
      if (typeof window !== 'undefined') localStorage.setItem('rashoi_admin_sound', 'true');
    }
  };

  const [liveAlert, setLiveAlert] = useState<{
    id: string;
    type: 'order' | 'reservation';
    title: string;
    subtitle: string;
    amount?: string;
    time: string;
  } | null>(null);

  const sessionMountTimeRef = useRef<number>(Date.now());
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialOrdersRef = useRef<boolean>(true);

  const knownReservationIdsRef = useRef<Set<string>>(new Set());
  const isInitialReservationsRef = useRef<boolean>(true);

  // Helper to persist seen alert IDs so page refresh never re-alerts old orders
  const getSeenIds = (key: string): Set<string> => {
    try {
      if (typeof window === 'undefined') return new Set();
      const raw = localStorage.getItem(key);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  };

  const markIdAsSeen = (key: string, id: string) => {
    try {
      if (typeof window === 'undefined') return;
      const set = getSeenIds(key);
      set.add(id);
      const arr = Array.from(set).slice(-300);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch {}
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rashoi_admin_sound', String(next));
    }
    if (next) {
      playAdminAlertChime();
      triggerToast('Audio alerts enabled 🔔 (5-second chime)');
    } else {
      triggerToast('Audio alerts muted 🔕');
    }
  };

  const handleTestSound = () => {
    playAdminAlertChime();
    triggerToast(`Playing 5-second test bell at ${Math.round(volume * 100)}% volume 🔔`);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        cats,
        items,
        classics,
        resList,
        blocked,
        msgs,
        revs,
        gals,
        ordList,
        settings,
      ] = await Promise.all([
        getCategories(),
        getMenuItems(),
        getClassicDishesPricing(),
        getReservations(),
        getFullyBookedDates(),
        getCustomerMessages(),
        getReviews(),
        getGallery(),
        getOrders(),
        getRestaurantSettings(),
      ]);

      setCategories(cats);
      setMenuItems(items);
      setClassicDishes(classics);
      setReservations(resList);
      setFullyBookedDates(blocked);
      setMessages(msgs);
      setReviews(revs);
      setGallery(gals);
      setOrders(ordList);
      setRestaurantInfo(settings.info);
      setPaymentSettings(settings.payment);
      setHomepageSettings(settings.homepage);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Real-time Firestore listeners for incoming Orders and Reservations
  useEffect(() => {
    if (!isAdmin) return;

    const seenOrderStorage = getSeenIds('rashoi_seen_order_ids');
    const seenReservationStorage = getSeenIds('rashoi_seen_reservation_ids');

    // Real-time listener for Orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const updatedOrders: Order[] = [];

      // If this is the initial snapshot upon mounting/refreshing, seed all existing IDs
      if (isInitialOrdersRef.current) {
        snapshot.docs.forEach((docSnap) => {
          const ord = docSnap.data() as Order;
          updatedOrders.push(ord);
          const oid = ord.orderId || docSnap.id;
          knownOrderIdsRef.current.add(oid);
          markIdAsSeen('rashoi_seen_order_ids', oid);
        });
        setOrders(updatedOrders);
        isInitialOrdersRef.current = false;
        return; // NEVER alert on initial load or refresh!
      }

      let hasNewOrder = false;
      let latestNewOrder: Order | null = null;

      snapshot.docs.forEach((docSnap) => {
        const ord = docSnap.data() as Order;
        updatedOrders.push(ord);
        const oid = ord.orderId || docSnap.id;

        // Only consider orders that are truly new (not known before)
        if (!knownOrderIdsRef.current.has(oid) && !seenOrderStorage.has(oid)) {
          // An order is only "new" if it was placed after this session started (not an old order)
          const orderCreatedMs = ord.createdAt ? new Date(ord.createdAt).getTime() : 0;
          const isFreshOrder = orderCreatedMs > (sessionMountTimeRef.current - 5000);

          // Only notify if active/new, definitely not completed or cancelled
          const isActiveStatus = ord.orderStatus === 'accepted' || ord.orderStatus === 'new';

          if (isFreshOrder && isActiveStatus) {
            hasNewOrder = true;
            latestNewOrder = ord;
          }
        }
        knownOrderIdsRef.current.add(oid);
        markIdAsSeen('rashoi_seen_order_ids', oid);
      });

      setOrders(updatedOrders);

      if (hasNewOrder && latestNewOrder) {
        // Play 5-second loud alert chime for incoming orders
        playAdminAlertChime();
        const o = latestNewOrder as Order;
        const itemsSummary = o.items
          .map((i) => `${i.quantity}x ${i.name}${i.selectedProtein ? ` (${i.selectedProtein})` : ''}`)
          .join(', ');
        setLiveAlert({
          id: o.orderId,
          type: 'order',
          title: `New Takeaway Order #${o.orderId}`,
          subtitle: `${o.customerName}: ${itemsSummary}`,
          amount: `£${o.totalAmount.toFixed(2)}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        sendDesktopNotification(`Rashoi: New Takeaway Order #${o.orderId}`, {
          body: `${o.customerName} ordered ${itemsSummary} (£${o.totalAmount.toFixed(2)}).`,
        });
      }
    }, (err) => {
      console.warn('Real-time orders listener warning:', err);
    });

    // Real-time listener for Table Reservations
    const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const unsubscribeReservations = onSnapshot(reservationsQuery, (snapshot) => {
      const updatedReservations: Reservation[] = [];

      // If this is the initial snapshot upon mounting/refreshing, seed all existing IDs
      if (isInitialReservationsRef.current) {
        snapshot.docs.forEach((docSnap) => {
          const res = docSnap.data() as Reservation;
          updatedReservations.push(res);
          const rid = res.id || docSnap.id;
          knownReservationIdsRef.current.add(rid);
          markIdAsSeen('rashoi_seen_reservation_ids', rid);
        });
        setReservations(updatedReservations);
        isInitialReservationsRef.current = false;
        return; // NEVER alert on initial load or refresh!
      }

      let hasNewReservation = false;
      let latestReservation: Reservation | null = null;

      snapshot.docs.forEach((docSnap) => {
        const res = docSnap.data() as Reservation;
        updatedReservations.push(res);
        const rid = res.id || docSnap.id;

        if (!knownReservationIdsRef.current.has(rid) && !seenReservationStorage.has(rid)) {
          // Check if created after session mount
          const resCreatedMs = res.createdAt ? new Date(res.createdAt).getTime() : 0;
          const isFreshBooking = resCreatedMs > (sessionMountTimeRef.current - 5000);

          // Only notify if pending booking request
          if (isFreshBooking && res.status === 'pending') {
            hasNewReservation = true;
            latestReservation = res;
          }
        }
        knownReservationIdsRef.current.add(rid);
        markIdAsSeen('rashoi_seen_reservation_ids', rid);
      });

      setReservations(updatedReservations);

      if (hasNewReservation && latestReservation) {
        // Play 5-second loud alert chime for incoming reservations
        playAdminAlertChime();
        const r = latestReservation as Reservation;
        setLiveAlert({
          id: r.id,
          type: 'reservation',
          title: `New Table Booking Request!`,
          subtitle: `${r.customerName} requested table for ${r.guests} guests on ${r.date} at ${r.time}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        sendDesktopNotification(`Rashoi: Table Booking from ${r.customerName}`, {
          body: `${r.guests} guests on ${r.date} at ${r.time}.`,
        });
      }
    }, (err) => {
      console.warn('Real-time reservations listener warning:', err);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeReservations();
    };
  }, [isAdmin]);

  const triggerToast = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Guard: If not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#120E10] flex items-center justify-center p-4 text-[#F5F1EA]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#1F181C] border border-red-500/30 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="font-serif text-2xl font-bold">Admin Authorization Required</h2>
          <p className="text-xs text-[#B8B1A7] leading-relaxed">
            This administration portal is restricted to authorized Rashoi restaurant managers only.
            {user ? ` Currently signed in as ${user.email}.` : ' Please sign in with your authorized Google administrator credentials.'}
          </p>
          <div className="pt-4 flex flex-col space-y-2">
            <button
              onClick={onReturnToSite}
              className="w-full py-2.5 bg-[#800020] text-white font-bold text-xs uppercase tracking-wider rounded"
            >
              Return to Website
            </button>
            {user && (
              <button
                onClick={() => signOut()}
                className="w-full py-2 border border-[#262626] text-xs text-red-400 rounded"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Actions ---

  const handleToggleFullyBooked = async (dateStr: string, currentStatus: boolean) => {
    try {
      await setDateFullyBooked(dateStr, !currentStatus, 'Updated via Admin Dashboard');
      setFullyBookedDates((prev) =>
        prev.map((d) => (d.date === dateStr ? { ...d, isFullyBooked: !currentStatus } : d))
      );
      triggerToast(`Date ${dateStr} status updated`);
    } catch (err) {
      alert('Failed to update fully booked date');
    }
  };

  const handleAddFullyBookedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    try {
      await setDateFullyBooked(newBlockedDate, true, blockedReason);
      setFullyBookedDates((prev) => [
        ...prev.filter((d) => d.date !== newBlockedDate),
        { id: newBlockedDate, date: newBlockedDate, isFullyBooked: true, reason: blockedReason },
      ]);
      setNewBlockedDate('');
      triggerToast(`Date ${newBlockedDate} is now marked FULLY BOOKED`);
    } catch (err) {
      alert('Error blocking date');
    }
  };

  const handleRemoveBlockedDate = async (dateStr: string) => {
    if (!window.confirm(`Re-open table bookings for ${dateStr}?`)) return;
    try {
      await removeFullyBookedDate(dateStr);
      setFullyBookedDates((prev) => prev.filter((d) => d.date !== dateStr));
      triggerToast(`Removed fully booked restriction for ${dateStr}`);
    } catch (err) {
      alert('Error removing date');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
      );

      const statusLabels: Record<string, string> = {
        accepted: 'Order Accepted',
        ready_for_collection: 'Ready for Collection',
        completed: 'Completed',
      };
      triggerToast(`Order #${orderId} status: ${statusLabels[newStatus] || newStatus}`);
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Takeaway Order #${orderId}?`)) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      triggerToast(`Order #${orderId} deleted successfully`);
    } catch (err) {
      alert('Failed to delete order');
    }
  };

  const handleUpdateReservationStatus = async (resId: string, status: Reservation['status']) => {
    try {
      await updateReservationStatus(resId, status);
      setReservations((prev) =>
        prev.map((r) => (r.id === resId ? { ...r, status } : r))
      );
      triggerToast(`Reservation ${resId} marked ${status}`);
    } catch (err) {
      alert('Failed to update reservation');
    }
  };

  const handleDeleteReservation = async (resId: string) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    try {
      await deleteReservation(resId);
      setReservations((prev) => prev.filter((r) => r.id !== resId));
      triggerToast('Reservation deleted');
    } catch (err) {
      alert('Failed to delete reservation');
    }
  };

  const handleSaveClassicPricing = async (dish: ClassicDishPricing) => {
    try {
      await updateClassicDishPricing(dish);
      setClassicDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? dish : d))
      );
      triggerToast(`Updated prices for ${dish.dishName}`);
    } catch (err) {
      alert('Failed to save classic pricing');
    }
  };

  const handleSaveRestaurantInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantInfo) return;
    try {
      await saveRestaurantInfo(restaurantInfo);
      triggerToast('Restaurant information saved');
    } catch (err) {
      alert('Failed to save restaurant details');
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentSettings) return;
    try {
      await savePaymentSettings(paymentSettings);
      triggerToast('Payment configuration updated');
    } catch (err) {
      alert('Failed to save payment settings');
    }
  };

  const handleSaveHomepageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homepageSettings) return;
    try {
      await saveHomepageSettings(homepageSettings);
      triggerToast('Homepage content saved');
    } catch (err) {
      alert('Failed to save homepage settings');
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await saveMenuItem(editingItem);
      setMenuItems((prev) => {
        const idx = prev.findIndex((i) => i.id === editingItem.id);
        if (idx > -1) {
          const next = [...prev];
          next[idx] = editingItem;
          return next;
        }
        return [...prev, editingItem];
      });
      setEditingItem(null);
      setIsAddingItem(false);
      triggerToast(`Saved dish "${editingItem.name}"`);
    } catch (err) {
      alert('Failed to save menu item');
    }
  };

  const handleDeleteMenuItem = async (id: string, name: string) => {
    if (!window.confirm(`Delete dish "${name}" from menu?`)) return;
    try {
      await deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      triggerToast(`Deleted ${name}`);
    } catch (err) {
      alert('Failed to delete dish');
    }
  };

  // Nav items list
  const sidebarNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders Management', icon: ShoppingBag, count: orders.filter(o => o.orderStatus === 'accepted' || o.orderStatus === 'ready_for_collection').length },
    { id: 'reservations', label: 'Table Reservations', icon: CalendarCheck, count: reservations.filter(r => r.status === 'pending').length },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'classicPricing', label: 'Classic Dishes Matrix', icon: Layers },
    { id: 'messages', label: 'Customer Messages', icon: MessageSquare, count: messages.filter(m => m.status === 'unread').length },
    { id: 'homepage', label: 'Homepage Content', icon: Home },
    { id: 'restaurantInfo', label: 'Restaurant Info', icon: Info },
    { id: 'paymentSettings', label: 'Payment Settings', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#120E10] text-[#F5F1EA] flex flex-col md:flex-row">
      
      {/* Toast Notification */}
      {saveStatus && (
        <div className="fixed top-5 right-5 z-50 bg-[#800020] text-white font-bold text-xs uppercase px-4 py-2.5 rounded shadow-2xl flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#161114] border-r border-[#800020]/30 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-[#262626]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                  <img
                    src="/images/rashoi_official_logo.png"
                    alt="Rashoi Logo"
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>
                <div>
                  <span className="font-serif text-base font-bold tracking-widest text-[#F5F1EA]">
                    RASHOI
                  </span>
                  <p className="text-[8px] uppercase tracking-widest text-[#F5B8C3] font-sans">
                    ADMIN CONTROL SUITE
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={loadAllData}
                  title="Refresh Data"
                  className="p-1.5 text-[#858078] hover:text-[#FFFFFF] rounded"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Prominent Back to Public Website Button right at the top */}
            <button
              type="button"
              onClick={onReturnToSite}
              className="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-[#800020] hover:bg-[#9B1130] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer border border-[#A51C30]"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-4 h-4 text-[#F5B8C3]" />
              <span>Back to Website</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {sidebarNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#800020] text-white font-semibold shadow-md'
                      : 'text-[#B8B1A7] hover:bg-[#1F181C] hover:text-[#F5F1EA]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {Boolean(item.count && item.count > 0) && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#120E10] text-[#F5B8C3]'
                          : 'bg-[#800020] text-white'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User details & logout */}
        <div className="p-4 border-t border-[#262626] space-y-2">
          <div className="px-2 text-left">
            <p className="text-[10px] text-[#858078]">Manager Account</p>
            <p className="text-xs text-[#F5F1EA] truncate">{user?.email}</p>
          </div>

          <button
            onClick={onReturnToSite}
            className="w-full py-2 px-3 rounded bg-[#1F181C] hover:bg-[#292025] text-xs text-[#B8B1A7] hover:text-[#FFFFFF] flex items-center justify-center space-x-2 border border-[#262626]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Website</span>
          </button>

          <button
            onClick={() => signOut()}
            className="w-full py-2 px-3 rounded hover:bg-red-950/40 text-xs text-red-400 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#120E10] overflow-y-auto p-6 md:p-10 text-left space-y-6">
        
        {/* Real-time Status & Audio Alert Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-[#1A1418] border border-[#A51C30]/35 shadow-lg">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <p className="text-xs font-bold text-[#FFFFFF] tracking-wide">
                Live Cloud Sync Active
              </p>
              <p className="text-[10px] text-[#ABA29B]">
                Listening in real-time for incoming table reservations & takeaway orders
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Direct Back to Website Button in Top Bar */}
            <button
              onClick={onReturnToSite}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-[#800020] hover:bg-[#9B1130] text-white text-xs font-bold tracking-wider uppercase flex items-center space-x-1.5 shadow-md cursor-pointer border border-[#A51C30] transition-all"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#F5B8C3]" />
              <span className="hidden sm:inline">Back to Website</span>
              <span className="sm:hidden">Exit</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              type="button"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-[#291F24] border-[#E23D5B] text-white shadow-sm'
                  : 'bg-[#181215] border-[#3A2A30] text-[#858078] hover:text-white'
              }`}
              title={soundEnabled ? 'Click to mute notification chime' : 'Click to enable notification chime'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#E23D5B]" />
                  <span>Chime: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#858078]" />
                  <span>Chime: OFF</span>
                </>
              )}
            </button>

            {/* Volume Slider */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#1A1216] border border-[#A51C30]/40 text-xs shadow-inner">
              <span className="text-[11px] text-[#A59E98] hidden sm:inline font-mono">Vol:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundEnabled ? volume : 0}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-24 accent-[#E23D5B] cursor-pointer"
                title={`Notification Chime Volume: ${Math.round(volume * 100)}%`}
              />
              <span className="text-[11px] font-mono text-[#F5B8C3] font-bold w-7 text-right">
                {soundEnabled ? `${Math.round(volume * 100)}%` : '0%'}
              </span>
            </div>

            {/* Test Sound */}
            <button
              onClick={handleTestSound}
              type="button"
              className="px-3 py-1.5 rounded-xl border border-[#A51C30]/40 bg-[#1F181C] hover:bg-[#291F24] text-[#E2DDD7] text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-colors"
              title="Test the 5-second executive alert chime at current volume"
            >
              <Bell className="w-3.5 h-3.5 text-[#E23D5B]" />
              <span className="hidden sm:inline">Test Bell (5s)</span>
              <span className="sm:hidden">Test</span>
            </button>
          </div>
        </div>

        {/* Live Incoming Order / Reservation Alert Banner */}
        {liveAlert && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2B1019] via-[#1F181C] to-[#2B1019] border-2 border-[#E23D5B] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce-subtle">
            <div className="flex items-center space-x-3.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#800020] border border-[#E23D5B] flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse">
                <BellRing className="w-6 h-6 text-[#F5B8C3]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#E23D5B] text-white font-bold">
                    JUST RECEIVED • {liveAlert.time}
                  </span>
                  {liveAlert.amount && (
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {liveAlert.amount}
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-white mt-1">
                  {liveAlert.title}
                </h4>
                <p className="text-xs text-[#E2DDD7] mt-0.5">
                  {liveAlert.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  handleSelectTab(liveAlert.type === 'order' ? 'orders' : 'reservations');
                  setLiveAlert(null);
                }}
                className="px-4 py-2 bg-[#800020] hover:bg-[#9B1130] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
              >
                {liveAlert.type === 'order' ? 'View in Orders' : 'View in Bookings'}
              </button>
              <button
                type="button"
                onClick={() => setLiveAlert(null)}
                className="p-2 text-[#ABA29B] hover:text-white rounded-xl hover:bg-[#291F24] cursor-pointer"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* ================= 1. OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 max-w-6xl">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#F5F1EA]">Executive Overview</h2>
              <p className="text-xs text-[#858078] mt-1">Live metrics across bookings, takeaway orders, and restaurant catalog.</p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#1F181C] border border-[#262626]">
                <p className="text-xs text-[#858078] uppercase">Total Dishes</p>
                <p className="font-serif text-3xl font-bold text-[#FFFFFF] mt-1">
                  {menuItems.filter((i) => i.categoryId !== 'classic-dishes').length + classicDishes.length}
                </p>
                <p className="text-[10px] text-[#B8B1A7] mt-1">{categories.length} Active Categories</p>
              </div>

              <div className="p-5 rounded-xl bg-[#1F181C] border border-[#262626]">
                <p className="text-xs text-[#858078] uppercase">Table Reservations</p>
                <p className="font-serif text-3xl font-bold text-[#FFFFFF] mt-1">{reservations.length}</p>
                <p className="text-[10px] text-amber-400 mt-1">
                  {reservations.filter((r) => r.status === 'pending').length} Pending Confirmation
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#1F181C] border border-[#262626]">
                <p className="text-xs text-[#858078] uppercase">Takeaway Orders</p>
                <p className="font-serif text-3xl font-bold text-[#FFFFFF] mt-1">{orders.length}</p>
                <p className="text-[10px] text-emerald-400 mt-1">
                  {orders.filter((o) => o.orderStatus === 'accepted' || o.orderStatus === 'ready_for_collection').length} Active Orders
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#1F181C] border border-[#262626]">
                <p className="text-xs text-[#858078] uppercase">Customer Inquiries</p>
                <p className="font-serif text-3xl font-bold text-[#FFFFFF] mt-1">{messages.length}</p>
                <p className="text-[10px] text-[#F5B8C3] mt-1">
                  {messages.filter((m) => m.status === 'unread').length} Unread Messages
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Orders Box */}
              <div className="p-6 rounded-xl bg-[#1F181C] border border-[#262626] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-[#F5F1EA]">Recent Orders</h3>
                  <button
                    onClick={() => handleSelectTab('orders')}
                    className="text-xs text-[#F5B8C3] hover:underline"
                  >
                    View All
                  </button>
                </div>

                {orders.slice(0, 4).map((ord) => (
                  <div key={ord.id} className="p-3 rounded bg-[#161114] flex justify-between items-start gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono font-bold text-[#FFFFFF]">{ord.orderId}</p>
                      <p className="text-[#858078]">{ord.customerName} • {ord.items.length} items</p>
                      <p className="text-[11px] text-[#E2DDD7] mt-1 truncate">
                        {ord.items
                          .map((it) => `${it.quantity}x ${it.name}${it.selectedProtein ? ` (${it.selectedProtein})` : ''}`)
                          .join(', ')}
                      </p>
                      {ord.items.some((it) => it.selectedCondiments && it.selectedCondiments.length > 0) && (
                        <p className="text-[10px] text-amber-300 font-mono mt-0.5">
                          ↳ Chutneys: {ord.items.flatMap((it) => it.selectedCondiments || []).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-[#F5F1EA]">£{ord.totalAmount.toFixed(2)}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 capitalize">
                        {ord.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pending Table Reservations */}
              <div className="p-6 rounded-xl bg-[#1F181C] border border-[#262626] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-[#F5F1EA]">Pending Bookings</h3>
                  <button
                    onClick={() => handleSelectTab('reservations')}
                    className="text-xs text-[#F5B8C3] hover:underline"
                  >
                    View All
                  </button>
                </div>

                {reservations
                  .filter((r) => r.status === 'pending')
                  .slice(0, 4)
                  .map((res) => (
                    <div key={res.id} className="p-3 rounded bg-[#161114] flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-[#F5F1EA]">{res.customerName} ({res.guests} guests)</p>
                        <p className="text-[#858078]">{res.date} at {res.time}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                          className="px-2.5 py-1 bg-[#800020] text-white font-bold rounded hover:bg-[#9B1130]"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          </div>
        )}

        {/* ================= 2. ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 max-w-6xl">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#F5F1EA]">Takeaway Orders Management</h2>
              <p className="text-xs text-[#858078] mt-1">Review collection orders, update fulfillment statuses, and inspect payment badges.</p>
            </div>

            <div className="flex flex-wrap gap-2 pb-2">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'accepted', label: 'Order Accepted' },
                { id: 'ready_for_collection', label: 'Ready for Collection' },
                { id: 'completed', label: 'Completed' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                    statusFilter === st.id
                      ? 'bg-[#800020] text-white shadow-sm'
                      : 'bg-[#1F181C] text-[#858078] hover:text-[#F5F1EA]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {orders
                .filter((o) => {
                  if (statusFilter === 'all') return true;
                  if (statusFilter === 'accepted') return o.orderStatus === 'accepted' || o.orderStatus === 'new';
                  return o.orderStatus === statusFilter;
                })
                .map((order) => (
                  <div
                    key={order.id}
                    className="p-6 rounded-xl bg-[#1F181C] border border-[#262626] space-y-4 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
                      <div>
                        <span className="font-mono font-bold text-lg text-[#FFFFFF]">{order.orderId}</span>
                        <p className="text-xs text-[#858078]">
                          Placed on {new Date(order.createdAt).toLocaleString()} • Type: Collection
                        </p>
                      </div>

                      {/* Payment Status Badges & Delete Order Button */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        {order.paymentStatus === 'paid' && (
                          <span className="px-3 py-1 rounded text-xs font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            PAID
                          </span>
                        )}
                        {order.paymentStatus === 'pending' && (
                          <span className="px-3 py-1 rounded text-xs font-bold uppercase bg-amber-950 text-amber-400 border border-amber-500/30">
                            PENDING
                          </span>
                        )}
                        {order.paymentStatus === 'unpaid' && (
                          <span className="px-3 py-1 rounded text-xs font-bold uppercase bg-[#292025] text-[#F5B8C3] border border-[#800020]/40">
                            PAY ON COLLECTION
                          </span>
                        )}
                        {order.paymentStatus === 'failed' && (
                          <span className="px-3 py-1 rounded text-xs font-bold uppercase bg-red-950 text-red-400 border border-red-500/30">
                            FAILED
                          </span>
                        )}
                        {order.paymentStatus === 'refunded' && (
                          <span className="px-3 py-1 rounded text-xs font-bold uppercase bg-zinc-800 text-zinc-300">
                            REFUNDED
                          </span>
                        )}

                        {/* Print Kitchen Slip Button */}
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-2.5 py-1 rounded bg-[#1A1418] hover:bg-[#2A1F24] text-[#D4CDC5] hover:text-white border border-[#3A2A30] text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                          title={`Print Kitchen Slip for Order #${order.orderId}`}
                        >
                          <Printer className="w-3.5 h-3.5 text-[#E23D5B]" />
                          <span>Print Slip</span>
                        </button>

                        {/* Individual Delete Order Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.orderId)}
                          className="px-2.5 py-1 rounded bg-[#2A151C] hover:bg-red-950/80 text-red-300 hover:text-red-200 border border-red-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                          title={`Permanently delete order #${order.orderId}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[#858078]">Customer:</span>
                        <p className="font-semibold text-[#F5F1EA]">{order.customerName}</p>
                      </div>
                      <div>
                        <span className="text-[#858078]">Email:</span>
                        <p className="text-[#B8B1A7]">{order.customerEmail}</p>
                      </div>
                      <div>
                        <span className="text-[#858078]">Phone:</span>
                        <p className="text-[#B8B1A7]">{order.customerPhone}</p>
                      </div>
                    </div>

                    {/* Items List / Kitchen Preparation List */}
                    <div className="p-4 rounded-xl bg-[#161114] border border-[#2D2228] text-xs space-y-2.5">
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#251D22]">
                        <span className="text-[11px] uppercase text-[#F5B8C3] font-mono tracking-wider font-bold">
                          Kitchen Prep List ({order.items.reduce((s, i) => s + i.quantity, 0)} Items)
                        </span>
                        <span className="text-[10px] text-[#A59E98] uppercase">
                          Check Chutneys & Sauces Before Packing
                        </span>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-[#1D151A] border border-[#3A2732] flex justify-between items-start gap-3 shadow-inner"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="px-2 py-0.5 rounded bg-[#800020] text-white font-mono font-bold text-xs shadow-sm">
                                  {it.quantity}x
                                </span>
                                <span className="font-bold text-sm text-white">
                                  {it.name}
                                </span>
                                {it.selectedProtein && (
                                  <span className="text-xs text-[#FFFFFF] font-mono font-bold px-2.5 py-0.5 rounded bg-[#800020] border border-[#E23D5B] shadow-sm">
                                    Option: {it.selectedProtein}
                                  </span>
                                )}
                              </div>

                              {/* Prominent Chutneys / Sauces Display for Admin / Kitchen */}
                              {it.selectedCondiments && it.selectedCondiments.length > 0 && (
                                <div className="mt-1.5 p-2 rounded-lg bg-[#27141E] border border-amber-500/40 flex flex-wrap items-center gap-1.5 shadow-sm">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/50">
                                    Sauces / Chutneys:
                                  </span>
                                  {it.selectedCondiments.map((cond, cIdx) => (
                                    <span
                                      key={cIdx}
                                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                                        cond.includes('None')
                                          ? 'bg-zinc-800 text-zinc-300 border-zinc-600'
                                          : 'bg-[#800020] text-white border-[#E23D5B] font-mono'
                                      }`}
                                    >
                                      {cond.includes('None') ? '🚫 None (Plain Papadam - No Sauce)' : `✓ ${cond}`}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <span className="font-mono text-sm font-bold text-white shrink-0">
                              £{(it.price * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#251D22] flex justify-between font-bold text-sm">
                        <span>Total:</span>
                        <span className="font-mono text-[#FFFFFF]">£{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {order.specialInstructions && (
                      <p className="text-xs text-[#B8B1A7] italic">
                        Special Instructions: "{order.specialInstructions}"
                      </p>
                    )}

                    {/* Fulfilment status dropdown */}
                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-[#858078]">Order Fulfilment:</span>
                        <select
                          value={order.orderStatus === 'new' ? 'accepted' : order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value as any)}
                          className="px-3 py-1.5 rounded bg-[#161114] border border-[#A51C30]/50 text-[#F5F1EA] text-xs focus:outline-none focus:border-[#E23D5B] font-medium"
                        >
                          <option value="accepted">Order Accepted</option>
                          <option value="ready_for_collection">Ready for Collection</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-[#858078] font-mono">
                          Payment: <span className="text-[#F5B8C3] uppercase">{order.paymentProvider}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= 3. MENU MANAGEMENT ================= */}
        {activeTab === 'menu' && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#F5F1EA]">Menu Dishes Management</h2>
                <p className="text-xs text-[#858078] mt-1">Add, edit prices, descriptions, vegetarian flags, and availability for all 70+ menu items.</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem({
                    id: 'dish-' + Date.now(),
                    name: '',
                    categoryId: categories[0]?.id || 'appetisers',
                    categoryName: categories[0]?.name || 'Appetisers',
                    price: 9.95,
                    description: '',
                    imageUrl: '',
                    isAvailable: true,
                    isVegetarian: false,
                    isFeatured: false,
                    isChefsSpecial: false,
                    order: menuItems.length + 1,
                  });
                  setIsAddingItem(true);
                }}
                className="px-4 py-2 bg-[#800020] hover:bg-[#9B1130] text-white shadow-md font-bold text-xs uppercase tracking-wider rounded flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Dish</span>
              </button>
            </div>

            {/* Menu Items Table */}
            <div className="overflow-x-auto rounded-xl border border-[#262626] bg-[#1F181C]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#161114] border-b border-[#262626] text-[#858078] uppercase">
                    <th className="py-3 px-4 w-16">Photo</th>
                    <th className="py-3 px-4">Dish Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (GBP)</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {menuItems.filter((item) => item.categoryId !== 'classic-dishes').map((item) => (
                    <tr key={item.id} className="hover:bg-[#292025]/50">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#161114] border border-[#A51C30]/30 shrink-0 relative">
                          <img
                            src={item.imageUrl ? resolveAssetUrl(item.imageUrl) : getDishVisualMeta(item).imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/rashoi_signature_dish_1794139812970.jpg';
                            }}
                          />
                          {item.imageUrl && (
                            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" title="Custom photo added" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#F5F1EA]">
                        {item.name}
                        {item.isFeatured && (
                          <span className="ml-2 text-[10px] text-[#F5B8C3] font-mono">★ Featured</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#858078]">{item.categoryName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#FFFFFF]">
                        £{item.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {item.isVegetarian ? (
                          <span className="text-emerald-400">Vegetarian</span>
                        ) : (
                          <span className="text-[#858078]">Non-Veg</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${item.isAvailable ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsAddingItem(false);
                          }}
                          className="p-1 text-[#F5B8C3] hover:text-[#FFFFFF]"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id, item.name)}
                          className="p-1 text-[#858078] hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit / Add Modal */}
            {editingItem && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleSaveMenuItem}
                  className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1F181C] border border-[#800020]/50 p-6 space-y-4 text-xs text-left"
                >
                  <div className="flex justify-between items-center border-b border-[#262626] pb-3">
                    <h3 className="font-serif text-lg font-bold text-[#F5F1EA]">
                      {isAddingItem ? 'Add Dish' : 'Edit Dish Details'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="text-[#858078] hover:text-[#F5F1EA]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block uppercase text-[#858078] mb-1">Dish Name *</label>
                    <input
                      type="text"
                      required
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA] text-sm focus:border-[#A51C30]"
                    />
                  </div>

                  {/* Dish Photo Upload & Preview Section */}
                  <div className="p-3.5 rounded-xl bg-[#161114] border border-[#262626] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="uppercase text-[#858078] font-semibold text-[11px] flex items-center space-x-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#E23D5B]" />
                        <span>Dish Photo</span>
                      </label>
                      {editingItem.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, imageUrl: '' })}
                          className="text-[10px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <div className="flex items-start space-x-3.5">
                      {/* Photo Preview */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#A51C30]/40 bg-[#1F181C] shrink-0 relative group">
                        <img
                          src={editingItem.imageUrl ? resolveAssetUrl(editingItem.imageUrl) : getDishVisualMeta(editingItem).imageUrl}
                          alt="Dish Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/rashoi_signature_dish_1794139812970.jpg';
                          }}
                        />
                        {editingItem.imageUrl && (
                          <span className="absolute bottom-1 right-1 bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-500/40">
                            Custom
                          </span>
                        )}
                      </div>

                      {/* Upload / URL Options */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="inline-flex items-center px-3.5 py-2 rounded-lg bg-[#800020] hover:bg-[#9B1130] text-white font-bold text-xs cursor-pointer shadow transition-all space-x-1.5">
                            <Upload className="w-3.5 h-3.5 text-[#F5B8C3]" />
                            <span>Upload Photo from Device</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const compressedDataUrl = await compressImageFile(file);
                                  setEditingItem({ ...editingItem, imageUrl: compressedDataUrl });
                                } catch (err) {
                                  alert('Could not process image file');
                                }
                              }}
                            />
                          </label>
                          <p className="text-[10px] text-[#858078] mt-1">
                            JPG, PNG, or WEBP (auto-compressed for fast loading)
                          </p>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Or paste image URL (https://...)"
                            value={editingItem.imageUrl || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                            className="w-full px-3 py-1.5 rounded bg-[#1F181C] border border-[#262626] text-[#F5F1EA] text-xs focus:border-[#A51C30]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase text-[#858078] mb-1">Category *</label>
                      <select
                        value={editingItem.categoryId}
                        onChange={(e) => {
                          const cat = categories.find((c) => c.id === e.target.value);
                          setEditingItem({
                            ...editingItem,
                            categoryId: e.target.value,
                            categoryName: cat?.name || editingItem.categoryName,
                          });
                        }}
                        className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA] text-sm"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block uppercase text-[#858078] mb-1">Price (GBP £) *</label>
                      <input
                        type="number"
                        step="0.05"
                        required
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA] text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase text-[#858078] mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA] text-sm"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.isVegetarian || false}
                        onChange={(e) => setEditingItem({ ...editingItem, isVegetarian: e.target.checked })}
                      />
                      <span>Vegetarian Dish</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.isAvailable}
                        onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                      />
                      <span>Available for Ordering</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.isFeatured || false}
                        onChange={(e) => setEditingItem({ ...editingItem, isFeatured: e.target.checked })}
                      />
                      <span>Feature on Homepage</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.isChefsSpecial || false}
                        onChange={(e) => setEditingItem({ ...editingItem, isChefsSpecial: e.target.checked })}
                      />
                      <span>Chef's Special Badge</span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end space-x-3 border-t border-[#262626]">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 border border-[#262626] text-[#858078] rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#800020] hover:bg-[#9B1130] text-white shadow-md font-bold rounded uppercase"
                    >
                      Save Dish
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= 4. CLASSIC DISHES MATRIX ================= */}
        {activeTab === 'classicPricing' && (
          <div className="space-y-6 max-w-6xl">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#FFFFFF]">Classic Dishes Pricing Matrix</h2>
              <p className="text-xs text-[#858078] mt-1">
                Edit individual prices for all 14 classic dishes across 5 proteins (Chicken, Lamb, Prawn, King Prawn, Veg). Changes reflect immediately on the customer menu.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#800020]/40 bg-[#1F181C] shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#161114] border-b border-[#262626] text-[#F5B8C3] uppercase font-mono">
                    <th className="py-3 px-4">Dish</th>
                    <th className="py-3 px-4">Chicken (£)</th>
                    <th className="py-3 px-4">Lamb (£)</th>
                    <th className="py-3 px-4">Prawn (£)</th>
                    <th className="py-3 px-4">King Prawn (£)</th>
                    <th className="py-3 px-4">Veg (£)</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {classicDishes.map((dish, idx) => (
                    <tr key={dish.id} className="hover:bg-[#292025]/50">
                      <td className="py-3 px-4 font-serif font-bold text-sm text-[#F5F1EA]">
                        {dish.dishName}
                      </td>

                      {/* Chicken */}
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.05"
                          value={dish.chickenPrice}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setClassicDishes((prev) =>
                              prev.map((d) => (d.id === dish.id ? { ...d, chickenPrice: val } : d))
                            );
                          }}
                          className="w-20 px-2 py-1 rounded bg-[#161114] border border-[#262626] text-[#F5B8C3] font-mono text-xs"
                        />
                      </td>

                      {/* Lamb */}
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.05"
                          value={dish.lambPrice}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setClassicDishes((prev) =>
                              prev.map((d) => (d.id === dish.id ? { ...d, lambPrice: val } : d))
                            );
                          }}
                          className="w-20 px-2 py-1 rounded bg-[#161114] border border-[#262626] text-[#F5B8C3] font-mono text-xs"
                        />
                      </td>

                      {/* Prawn */}
                      <td className="py-2 px-3">
                        {dish.prawnPrice !== null ? (
                          <input
                            type="number"
                            step="0.05"
                            value={dish.prawnPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setClassicDishes((prev) =>
                                prev.map((d) => (d.id === dish.id ? { ...d, prawnPrice: val } : d))
                              );
                            }}
                            className="w-20 px-2 py-1 rounded bg-[#161114] border border-[#262626] text-[#F5B8C3] font-mono text-xs"
                          />
                        ) : (
                          <span className="text-[#858078] italic">N/A</span>
                        )}
                      </td>

                      {/* King Prawn */}
                      <td className="py-2 px-3">
                        {dish.kingPrawnPrice !== null ? (
                          <input
                            type="number"
                            step="0.05"
                            value={dish.kingPrawnPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setClassicDishes((prev) =>
                                prev.map((d) => (d.id === dish.id ? { ...d, kingPrawnPrice: val } : d))
                              );
                            }}
                            className="w-20 px-2 py-1 rounded bg-[#161114] border border-[#262626] text-[#F5B8C3] font-mono text-xs"
                          />
                        ) : (
                          <span className="text-[#858078] italic">N/A</span>
                        )}
                      </td>

                      {/* Veg */}
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.05"
                          value={dish.vegPrice}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setClassicDishes((prev) =>
                              prev.map((d) => (d.id === dish.id ? { ...d, vegPrice: val } : d))
                            );
                          }}
                          className="w-20 px-2 py-1 rounded bg-[#161114] border border-[#262626] text-[#F5B8C3] font-mono text-xs"
                        />
                      </td>

                      {/* Save Button */}
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleSaveClassicPricing(dish)}
                          className="px-3 py-1 bg-[#800020] hover:bg-[#9B1130] text-white shadow-md font-bold rounded text-[11px]"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 5. TABLE RESERVATIONS ================= */}
        {activeTab === 'reservations' && (
          <div className="space-y-6 max-w-6xl">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#F5F1EA]">Guest Table Reservations</h2>
              <p className="text-xs text-[#858078] mt-1">Review table requests, update confirmation status, and manage seatings.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#262626] bg-[#1F181C]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#161114] border-b border-[#262626] text-[#858078] uppercase">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Guest Name</th>
                    <th className="py-3 px-4">Party Size</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-[#292025]/50">
                      <td className="py-3 px-4 font-mono font-bold text-[#FFFFFF]">
                        {res.date} • {res.time}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#F5F1EA]">
                        {res.customerName}
                        {res.specialRequests && (
                          <p className="text-[10px] text-[#858078] font-normal italic">
                            Req: "{res.specialRequests}"
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">{res.guests} Guests</td>
                      <td className="py-3 px-4 text-[#B8B1A7]">
                        <p>{res.customerPhone}</p>
                        <p className="text-[10px] text-[#858078]">{res.customerEmail}</p>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={res.status}
                          onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value as any)}
                          className="px-2 py-1 rounded bg-[#161114] border border-[#262626] text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteReservation(res.id)}
                          className="px-2.5 py-1 rounded bg-[#2A151C] hover:bg-red-950/80 text-red-300 hover:text-red-200 border border-red-500/40 text-xs font-semibold inline-flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                          title={`Permanently delete reservation for ${res.customerName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 7. CUSTOMER MESSAGES ================= */}
        {activeTab === 'messages' && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#F5F1EA]">Complaints & Guest Feedback</h2>
              <p className="text-xs text-[#858078] mt-1">Direct feedback submissions from patrons.</p>
            </div>

            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="p-8 text-center bg-[#1F181C] rounded-xl text-xs text-[#858078]">
                  No feedback or complaint messages received yet.
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-6 rounded-xl bg-[#1F181C] border border-[#262626] space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-[#F5F1EA]">{msg.subject}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${msg.category === 'Complaint' ? 'bg-red-950 text-red-300' : 'bg-[#292025] text-[#F5B8C3]'}`}>
                          {msg.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#858078]">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[#B8B1A7] text-sm leading-relaxed whitespace-pre-wrap bg-[#161114] p-3 rounded">
                      {msg.message}
                    </p>

                    <div className="flex justify-between items-center pt-2 border-t border-[#262626] text-[11px] text-[#858078]">
                      <span>From: {msg.name} ({msg.email})</span>
                      <div className="flex items-center space-x-3">
                        <select
                          value={msg.status}
                          onChange={async (e) => {
                            await updateMessageStatus(msg.id, e.target.value as any);
                            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: e.target.value as any } : m));
                          }}
                          className="px-2 py-1 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Delete message?')) return;
                            await deleteCustomerMessage(msg.id);
                            setMessages(prev => prev.filter(m => m.id !== msg.id));
                          }}
                          className="hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= 8. PAYMENT SETTINGS ================= */}
        {activeTab === 'paymentSettings' && paymentSettings && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#FFFFFF]">Payment & Checkout Settings</h2>
              <p className="text-xs text-[#858078] mt-1">Stripe Hosted Checkout readiness status and takeaway collection discount.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#1F181C] border border-[#262626] space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#F5F1EA]">Stripe Hosted Checkout Status</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded bg-[#161114] border border-[#262626]">
                  <p className="text-[#858078]">Payment Provider</p>
                  <p className="font-serif text-lg font-bold text-[#F5F1EA] mt-1">Stripe</p>
                </div>

                <div className="p-4 rounded bg-[#161114] border border-[#262626]">
                  <p className="text-[#858078]">Stripe Configuration</p>
                  <p className="font-serif text-lg font-bold text-amber-400 mt-1">
                    {paymentSettings.stripeConfigured ? 'Configured' : 'Not Configured'}
                  </p>
                </div>

                <div className="p-4 rounded bg-[#161114] border border-[#262626]">
                  <p className="text-[#858078]">Online Card Payment</p>
                  <p className="font-serif text-lg font-bold text-red-400 mt-1">
                    {paymentSettings.stripeEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>

                <div className="p-4 rounded bg-[#161114] border border-[#262626]">
                  <p className="text-[#858078]">Currency</p>
                  <p className="font-serif text-lg font-bold text-[#FFFFFF] mt-1">GBP (£)</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-600/30 text-amber-200 text-xs leading-relaxed space-y-2">
                <p className="font-semibold">Stripe Architecture Ready (No Webhooks)</p>
                <p>
                  Per project guidelines, online card payments remain disabled until you configure your <code>STRIPE_SECRET_KEY</code> in Netlify Environment Variables.
                </p>
                <p>
                  Full setup instructions are detailed in <code>STRIPE_SETUP_GUIDE.md</code>.
                </p>
              </div>
            </div>

            {/* Collection Discount Configuration */}
            <form onSubmit={handleSavePaymentSettings} className="p-6 rounded-xl bg-[#1F181C] border border-[#262626] space-y-4 text-xs">
              <h3 className="font-serif text-lg font-bold text-[#F5F1EA]">Takeaway Collection Discount</h3>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.collectionDiscountEnabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, collectionDiscountEnabled: e.target.checked })}
                />
                <span className="text-sm font-medium">Enable Collection Discount</span>
              </label>

              <div>
                <label className="block text-[#858078] uppercase mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={paymentSettings.collectionDiscountPercent}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, collectionDiscountPercent: parseInt(e.target.value) || 0 })}
                  className="w-32 px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA] text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#800020] hover:bg-[#9B1130] text-white shadow-md font-bold rounded uppercase tracking-wider"
              >
                Save Payment Settings
              </button>
            </form>
          </div>
        )}

        {/* ================= 9. RESTAURANT INFO ================= */}
        {activeTab === 'restaurantInfo' && restaurantInfo && (
          <form onSubmit={handleSaveRestaurantInfo} className="space-y-6 max-w-3xl text-xs">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#F5F1EA]">Restaurant Profile & Address</h2>
              <p className="text-[#858078] mt-1">Official establishment information displayed in headers, footers, and maps.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#1F181C] border border-[#262626] space-y-4">
              <div>
                <label className="block text-[#858078] uppercase mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={restaurantInfo.name}
                  onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                />
              </div>

              <div>
                <label className="block text-[#858078] uppercase mb-1">Tagline</label>
                <input
                  type="text"
                  value={restaurantInfo.tagline}
                  onChange={(e) => setRestaurantInfo({ ...restaurantInfo, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#858078] uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    value={restaurantInfo.address}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#858078] uppercase mb-1">Postcode</label>
                  <input
                    type="text"
                    value={restaurantInfo.postcode}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, postcode: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#858078] uppercase mb-1">City / Village</label>
                  <input
                    type="text"
                    value={restaurantInfo.city}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, city: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#858078] uppercase mb-1">County</label>
                  <input
                    type="text"
                    value={restaurantInfo.county}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, county: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#858078] uppercase mb-1">Country</label>
                  <input
                    type="text"
                    value={restaurantInfo.country}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, country: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#858078] uppercase mb-1">Telephone</label>
                  <input
                    type="text"
                    value={restaurantInfo.phone}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#858078] uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={restaurantInfo.email}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, email: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                  />
                </div>
              </div>

              {/* Opening Hours Schedule */}
              <div className="pt-2 border-t border-[#262626] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="block text-[#FFFFFF] font-bold uppercase tracking-wider text-xs">
                    Opening Hours (Open 7 Days a Week)
                  </label>
                  <span className="text-[10px] text-[#A59E98]">
                    Displayed on Homepage, Contact & Footer
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#858078] uppercase mb-1">Lunch Service</label>
                    <input
                      type="text"
                      value={restaurantInfo.openingHours?.[0]?.hours || '12:00 PM – 2:30 PM'}
                      onChange={(e) => {
                        const nextHours = [...(restaurantInfo.openingHours || [])];
                        nextHours[0] = { days: 'Lunch (Open 7 Days a Week)', hours: e.target.value };
                        setRestaurantInfo({ ...restaurantInfo, openingHours: nextHours });
                      }}
                      className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#858078] uppercase mb-1">Dinner Service</label>
                    <input
                      type="text"
                      value={restaurantInfo.openingHours?.[1]?.hours || '5:30 PM – 11:00 PM'}
                      onChange={(e) => {
                        const nextHours = [...(restaurantInfo.openingHours || [])];
                        nextHours[1] = { days: 'Dinner (Open 7 Days a Week)', hours: e.target.value };
                        setRestaurantInfo({ ...restaurantInfo, openingHours: nextHours });
                      }}
                      className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#800020] hover:bg-[#9B1130] text-white shadow-md font-bold rounded uppercase tracking-wider"
              >
                Save Restaurant Profile
              </button>
            </div>
          </form>
        )}

        {/* ================= 10. HOMEPAGE MANAGEMENT ================= */}
        {activeTab === 'homepage' && homepageSettings && (
          <form onSubmit={handleSaveHomepageSettings} className="space-y-6 max-w-4xl text-xs">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#F5F1EA]">Homepage Content & Imagery</h2>
              <p className="text-[#858078] mt-1">Configure hero headlines, introduction paragraphs, and promotional sections.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#1F181C] border border-[#262626] space-y-4">
              <h3 className="font-serif text-base font-bold text-[#FFFFFF]">Hero Section</h3>
              
              <div>
                <label className="block text-[#858078] uppercase mb-1">Eyebrow Text</label>
                <input
                  type="text"
                  value={homepageSettings.heroEyebrow}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, heroEyebrow: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                />
              </div>

              <div>
                <label className="block text-[#858078] uppercase mb-1">Main Heading</label>
                <input
                  type="text"
                  value={homepageSettings.heroHeading}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, heroHeading: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                />
              </div>

              <div>
                <label className="block text-[#858078] uppercase mb-1">Supporting Description</label>
                <textarea
                  rows={2}
                  value={homepageSettings.heroSupportingText}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, heroSupportingText: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                />
              </div>

              <div>
                <label className="block text-[#858078] uppercase mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={homepageSettings.heroImageUrl}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, heroImageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#1F181C] border border-[#262626] space-y-4">
              <h3 className="font-serif text-base font-bold text-[#FFFFFF]">Introduction & Heritage Section</h3>
              
              <div>
                <label className="block text-[#858078] uppercase mb-1">Section Heading</label>
                <input
                  type="text"
                  value={homepageSettings.introHeading}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, introHeading: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                />
              </div>

              <div>
                <label className="block text-[#858078] uppercase mb-1">Paragraph 1</label>
                <textarea
                  rows={2}
                  value={homepageSettings.introParagraph1}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, introParagraph1: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                />
              </div>

              <div>
                <label className="block text-[#858078] uppercase mb-1">Paragraph 2</label>
                <textarea
                  rows={2}
                  value={homepageSettings.introParagraph2}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, introParagraph2: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#161114] border border-[#262626] text-[#F5F1EA]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#800020] hover:bg-[#9B1130] text-white shadow-md font-bold rounded uppercase tracking-wider"
            >
              Save Homepage Content
            </button>
          </form>
        )}

      </main>
    </div>
  );
};

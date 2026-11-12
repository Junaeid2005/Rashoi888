import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { playAdminAlertChime, sendDesktopNotification, getAdminAlertVolume, setAdminAlertVolume } from '../../utils/audioNotification';
import { Order, Reservation } from '../../types';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  ShieldCheck,
  ShoppingBag,
  CalendarCheck,
  ArrowRight,
  X,
} from 'lucide-react';

interface AdminGlobalNotifierProps {
  currentView: string;
  onNavigateToAdmin: (tab?: string) => void;
}

interface IncomingAlert {
  id: string;
  type: 'order' | 'reservation';
  title: string;
  subtitle: string;
  customer: string;
  amount?: string;
  time: string;
}

export const AdminGlobalNotifier: React.FC<AdminGlobalNotifierProps> = ({
  currentView,
  onNavigateToAdmin,
}) => {
  const { user, isAdmin } = useAuth();

  const [activeAlert, setActiveAlert] = useState<IncomingAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rashoi_admin_sound');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [hasRequestedPermission, setHasRequestedPermission] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const sessionMountTimeRef = useRef<number>(Date.now());
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialOrdersRef = useRef<boolean>(true);

  const knownReservationIdsRef = useRef<Set<string>>(new Set());
  const isInitialReservationsRef = useRef<boolean>(true);

  const autoDismissTimerRef = useRef<any>(null);

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

  // Resume Web Audio context on any first click in window
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const testCtx = new AudioContextClass();
          if (testCtx.state === 'suspended') {
            testCtx.resume();
          }
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, []);

  // Request browser desktop notification permission for admin if not granted
  const requestNotificationPermission = async () => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setHasRequestedPermission(true);
          sendDesktopNotification('Rashoi Admin Alerts Enabled', {
            body: 'You will now receive instant notifications for new takeaway orders and table bookings!',
          });
        }
      }
    } catch (e) {
      console.warn('Desktop permission request note:', e);
    }
  };

  const [volume, setVolume] = useState<number>(() => getAdminAlertVolume());

  const handleVolumeChange = (delta: number) => {
    const next = Math.max(0, Math.min(1, Math.round((volume + delta) * 100) / 100));
    setVolume(next);
    setAdminAlertVolume(next);
    if (!soundEnabled && next > 0) {
      setSoundEnabled(true);
      if (typeof window !== 'undefined') localStorage.setItem('rashoi_admin_sound', 'true');
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rashoi_admin_sound', String(next));
    }
    if (next) {
      playAdminAlertChime();
    }
  };

  const testChime = () => {
    playAdminAlertChime();
  };

  // Main real-time Firestore listeners for incoming Orders and Reservations
  useEffect(() => {
    if (!isAdmin) return;

    const seenOrderStorage = getSeenIds('rashoi_seen_order_ids');
    const seenReservationStorage = getSeenIds('rashoi_seen_reservation_ids');

    // Real-time listener for Orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        // If this is the initial snapshot upon mounting/refreshing, seed all existing IDs
        if (isInitialOrdersRef.current) {
          snapshot.docs.forEach((docSnap) => {
            const ord = docSnap.data() as Order;
            const oid = ord.orderId || docSnap.id;
            knownOrderIdsRef.current.add(oid);
            markIdAsSeen('rashoi_seen_order_ids', oid);
          });
          isInitialOrdersRef.current = false;
          return; // NEVER trigger notification on initial load or refresh!
        }

        let hasNew = false;
        let latestOrder: Order | null = null;

        snapshot.docs.forEach((docSnap) => {
          const ord = docSnap.data() as Order;
          const oid = ord.orderId || docSnap.id;

          // Only consider orders that are truly new (not known before)
          if (!knownOrderIdsRef.current.has(oid) && !seenOrderStorage.has(oid)) {
            // An order is only "new" if it was placed after the session started (not an old order)
            const orderCreatedMs = ord.createdAt ? new Date(ord.createdAt).getTime() : 0;
            const isFreshOrder = orderCreatedMs > (sessionMountTimeRef.current - 5000);

            // Only notify if active/new, definitely not completed or cancelled
            const isActiveStatus = ord.orderStatus === 'accepted' || ord.orderStatus === 'new';

            if (isFreshOrder && isActiveStatus) {
              hasNew = true;
              latestOrder = ord;
            }
          }
          knownOrderIdsRef.current.add(oid);
          markIdAsSeen('rashoi_seen_order_ids', oid);
        });

        if (hasNew && latestOrder) {
          const o = latestOrder as Order;

          // Play alert chime for admin on incoming order
          playAdminAlertChime();

          const chutneyList = o.items.flatMap(i => i.selectedCondiments || []).filter(c => !c.includes('None'));
          const chutneyText = chutneyList.length > 0 ? ` (Chutneys: ${chutneyList.join(', ')})` : '';

          sendDesktopNotification(`Rashoi: New Takeaway Order #${o.orderId}`, {
            body: `${o.customerName} placed an order for £${o.totalAmount.toFixed(2)}${chutneyText}.`,
          });

          // Show floating alert banner
          setActiveAlert({
            id: o.orderId,
            type: 'order',
            title: `New Takeaway Order #${o.orderId}`,
            subtitle: `${o.customerName} ordered ${o.items.length} item(s) • Total: £${o.totalAmount.toFixed(2)}${chutneyText}`,
            customer: o.customerName,
            amount: `£${o.totalAmount.toFixed(2)}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });

          // Auto-dismiss after 25 seconds
          if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
          autoDismissTimerRef.current = setTimeout(() => {
            setActiveAlert(null);
          }, 25000);
        }
      },
      (err) => {
        console.warn('Admin global orders listener warning:', err);
      }
    );

    // Real-time listener for Table Reservations
    const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const unsubscribeReservations = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        // If this is the initial snapshot upon mounting/refreshing, seed all existing IDs
        if (isInitialReservationsRef.current) {
          snapshot.docs.forEach((docSnap) => {
            const res = docSnap.data() as Reservation;
            const rid = res.id || docSnap.id;
            knownReservationIdsRef.current.add(rid);
            markIdAsSeen('rashoi_seen_reservation_ids', rid);
          });
          isInitialReservationsRef.current = false;
          return; // NEVER trigger notification on initial load or refresh!
        }

        let hasNew = false;
        let latestRes: Reservation | null = null;

        snapshot.docs.forEach((docSnap) => {
          const res = docSnap.data() as Reservation;
          const rid = res.id || docSnap.id;

          if (!knownReservationIdsRef.current.has(rid) && !seenReservationStorage.has(rid)) {
            // Check if created after session mount
            const resCreatedMs = res.createdAt ? new Date(res.createdAt).getTime() : 0;
            const isFreshBooking = resCreatedMs > (sessionMountTimeRef.current - 5000);

            // Only notify if pending booking request
            if (isFreshBooking && res.status === 'pending') {
              hasNew = true;
              latestRes = res;
            }
          }
          knownReservationIdsRef.current.add(rid);
          markIdAsSeen('rashoi_seen_reservation_ids', rid);
        });

        if (hasNew && latestRes) {
          const r = latestRes as Reservation;

          // Play alert chime for admin on incoming reservation
          playAdminAlertChime();

          sendDesktopNotification(`Rashoi: Table Booking from ${r.customerName}`, {
            body: `${r.guests} guests on ${r.date} at ${r.time}.`,
          });

          // Show floating alert banner
          setActiveAlert({
            id: r.id,
            type: 'reservation',
            title: 'New Table Booking Request!',
            subtitle: `${r.customerName} requested table for ${r.guests} guests on ${r.date} at ${r.time}`,
            customer: r.customerName,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });

          // Auto-dismiss after 25 seconds
          if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
          autoDismissTimerRef.current = setTimeout(() => {
            setActiveAlert(null);
          }, 25000);
        }
      },
      (err) => {
        console.warn('Admin global reservations listener warning:', err);
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeReservations();
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <>
      {/* 1. HIGH-PROMINENCE INCOMING LIVE ALERT BANNER (When order or reservation arrives) */}
      {activeAlert && (
        <div className="fixed top-20 right-4 sm:right-6 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-[440px] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="relative rounded-2xl bg-gradient-to-r from-[#240B13] via-[#1A0E13] to-[#240B13] border-2 border-[#E23D5B] shadow-[0_20px_50px_rgba(226,61,91,0.35)] p-4 sm:p-5 text-white overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#E23D5B]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#800020] border border-[#E23D5B] flex items-center justify-center text-white shrink-0 shadow-lg animate-bounce">
                  <BellRing className="w-5 h-5 text-[#F5B8C3]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E23D5B] text-white">
                      JUST RECEIVED • {activeAlert.time}
                    </span>
                    {activeAlert.amount && (
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {activeAlert.amount}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white mt-1 leading-tight">
                    {activeAlert.title}
                  </h3>
                  <p className="text-xs text-[#E2DDD7] mt-1 leading-snug">
                    {activeAlert.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveAlert(null)}
                className="text-[#9E9790] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-3 border-t border-[#A51C30]/40 flex items-center justify-between gap-2 relative z-10">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={testChime}
                  className="px-2.5 py-1 rounded-lg bg-[#140D10] border border-[#A51C30]/50 text-[11px] text-[#F5B8C3] hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                  title="Test chime"
                >
                  <Bell className="w-3 h-3 text-[#E23D5B]" />
                  <span>Test Bell (5s)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetTab = activeAlert.type === 'order' ? 'orders' : 'reservations';
                  setActiveAlert(null);
                  onNavigateToAdmin(targetTab);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#800020] to-[#A51C30] hover:from-[#A51C30] hover:to-[#B3243C] text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg border border-[#E23D5B]/60 transition-all cursor-pointer"
              >
                <span>View in Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PERSISTENT FLOATING ADMIN STATUS PILL (When browsing public website) */}
      {currentView !== 'admin' && (
        <div className="fixed bottom-5 right-5 z-[9990] flex items-center space-x-2">
          {!isMinimized ? (
            <div className="flex items-center space-x-2 p-1.5 pl-3 pr-2 rounded-full bg-[#1A0E13]/95 border border-[#A51C30] shadow-2xl backdrop-blur-md text-white text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Pulsing indicator */}
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E23D5B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E23D5B]" />
                </span>
                <span className="font-semibold text-[11px] text-[#F5B8C3] hidden sm:inline">
                  Admin Alert Sync: ON
                </span>
              </div>

              {/* Sound Toggle & Volume Controls */}
              <div className="flex items-center space-x-1 bg-[#120B0F] px-1.5 py-0.5 rounded-full border border-[#800020]/40">
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`p-1 rounded-full transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-[#800020] text-white'
                      : 'bg-[#291F24] text-[#858078] hover:text-white'
                  }`}
                  title={soundEnabled ? 'Audio chime is ON. Click to mute.' : 'Audio chime is MUTED. Click to enable.'}
                >
                  {soundEnabled ? <Volume2 className="w-3 h-3 text-white" /> : <VolumeX className="w-3 h-3" />}
                </button>
                {soundEnabled && (
                  <div className="flex items-center space-x-1 text-[10px] text-[#F5B8C3] font-mono pr-1">
                    <button
                      type="button"
                      onClick={() => handleVolumeChange(-0.1)}
                      className="px-1 text-[#ABA29B] hover:text-white font-bold cursor-pointer"
                      title="Decrease volume"
                    >
                      -
                    </button>
                    <span>{Math.round(volume * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => handleVolumeChange(0.1)}
                      className="px-1 text-[#ABA29B] hover:text-white font-bold cursor-pointer"
                      title="Increase volume"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop notification prompt if not yet granted */}
              {!hasRequestedPermission && (
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className="px-2 py-1 rounded-full bg-[#800020]/40 hover:bg-[#800020] border border-[#A51C30]/50 text-[10px] text-amber-200 cursor-pointer transition-colors"
                  title="Enable desktop notifications for background alerts"
                >
                  🔔 Enable OS Alerts
                </button>
              )}

              {/* Direct Jump to Admin Dashboard */}
              <button
                type="button"
                onClick={() => onNavigateToAdmin()}
                className="px-3 py-1.5 rounded-full bg-[#800020] hover:bg-[#A51C30] text-white font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1 transition-all cursor-pointer shadow-md"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#F5B8C3]" />
                <span>Dashboard</span>
              </button>

              {/* Minimize */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1 text-[#858078] hover:text-white transition-colors cursor-pointer"
                title="Minimize pill"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-2.5 rounded-full bg-[#800020] hover:bg-[#A51C30] border border-[#E23D5B] text-white shadow-xl cursor-pointer transition-all hover:scale-105"
              title="Admin Live Notification Watcher Active (Click to expand)"
            >
              <div className="relative">
                <BellRing className="w-4 h-4 text-white" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </button>
          )}
        </div>
      )}
    </>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { playAdminAlertChime, sendDesktopNotification, getAdminAlertVolume, setAdminAlertVolume, unlockAudioContext } from '../../utils/audioNotification';
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

  const [audioBlocked, setAudioBlocked] = useState<boolean>(false);

  // Sync audio unlock/blocked events so admin always knows if browser autoplay requires a tap
  useEffect(() => {
    const onBlocked = () => setAudioBlocked(true);
    const onUnlocked = () => setAudioBlocked(false);
    window.addEventListener('rashoi-audio-blocked', onBlocked);
    window.addEventListener('rashoi-audio-unlocked', onUnlocked);
    return () => {
      window.removeEventListener('rashoi-audio-blocked', onBlocked);
      window.removeEventListener('rashoi-audio-unlocked', onUnlocked);
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
    unlockAudioContext();
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rashoi_admin_sound', String(next));
    }
    if (next) {
      playAdminAlertChime(undefined, undefined, true);
    }
  };

  const testChime = () => {
    unlockAudioContext();
    playAdminAlertChime(undefined, undefined, true);
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

        snapshot.docChanges().forEach((change) => {
          if (change.type !== 'added') return;
          const ord = change.doc.data() as Order;
          const oid = ord.orderId || change.doc.id;

          if (!knownOrderIdsRef.current.has(oid) && !seenOrderStorage.has(oid)) {
            // Allow 30-minute tolerance for customer/admin device clock differences
            const orderCreatedMs = ord.createdAt ? new Date(ord.createdAt).getTime() : Date.now();
            const isRecentOrder = orderCreatedMs > (sessionMountTimeRef.current - 30 * 60 * 1000);
            const isActiveStatus = ord.orderStatus === 'accepted' || ord.orderStatus === 'new';

            if (isRecentOrder && isActiveStatus) {
              hasNew = true;
              latestOrder = ord;
            }
          }
          knownOrderIdsRef.current.add(oid);
          markIdAsSeen('rashoi_seen_order_ids', oid);
        });

        if (hasNew && latestOrder) {
          const o = latestOrder as Order;

          // Play 5-second alert chime with per-order deduplication key
          playAdminAlertChime(undefined, `order-${o.orderId}`);

          const itemsSummary = o.items
            .map((i) => `${i.quantity}x ${i.name}${i.selectedProtein ? ` (${i.selectedProtein})` : ''}`)
            .join(', ');
          const chutneyList = o.items.flatMap(i => i.selectedCondiments || []).filter(c => !c.includes('None'));
          const chutneyText = chutneyList.length > 0 ? ` • Chutneys: ${chutneyList.join(', ')}` : '';

          sendDesktopNotification(`Rashoi: New Takeaway Order #${o.orderId}`, {
            body: `${o.customerName} ordered ${itemsSummary} (£${o.totalAmount.toFixed(2)})${chutneyText}`,
          });

          // Show floating alert banner
          setActiveAlert({
            id: o.orderId,
            type: 'order',
            title: `New Takeaway Order #${o.orderId}`,
            subtitle: `${o.customerName}: ${itemsSummary} • Total: £${o.totalAmount.toFixed(2)}${chutneyText}`,
            customer: o.customerName,
            amount: `£${o.totalAmount.toFixed(2)}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });

          // Auto-dismiss after 45 seconds
          if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
          autoDismissTimerRef.current = setTimeout(() => {
            setActiveAlert(null);
          }, 45000);
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

        snapshot.docChanges().forEach((change) => {
          if (change.type !== 'added') return;
          const res = change.doc.data() as Reservation;
          const rid = res.id || change.doc.id;

          if (!knownReservationIdsRef.current.has(rid) && !seenReservationStorage.has(rid)) {
            // Allow 30-minute tolerance for customer/admin device clock differences
            const resCreatedMs = res.createdAt ? new Date(res.createdAt).getTime() : Date.now();
            const isRecentBooking = resCreatedMs > (sessionMountTimeRef.current - 30 * 60 * 1000);
            const isActiveBooking = res.status === 'pending' || res.status === 'confirmed';

            if (isRecentBooking && isActiveBooking) {
              hasNew = true;
              latestRes = res;
            }
          }
          knownReservationIdsRef.current.add(rid);
          markIdAsSeen('rashoi_seen_reservation_ids', rid);
        });

        if (hasNew && latestRes) {
          const r = latestRes as Reservation;

          // Play 5-second alert chime with per-reservation deduplication key
          playAdminAlertChime(undefined, `res-${r.id}`);

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

          // Auto-dismiss after 45 seconds
          if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
          autoDismissTimerRef.current = setTimeout(() => {
            setActiveAlert(null);
          }, 45000);
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
                  className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center space-x-1 cursor-pointer transition-colors ${
                    audioBlocked
                      ? 'bg-amber-950 border-amber-400 text-amber-200 font-bold animate-pulse'
                      : 'bg-[#140D10] border-[#A51C30]/50 text-[#F5B8C3] hover:text-white'
                  }`}
                  title="Test chime"
                >
                  <Bell className="w-3 h-3 text-[#E23D5B]" />
                  <span>{audioBlocked ? 'Tap to Ring Bell!' : 'Test Bell (5s)'}</span>
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

              {/* Blocked autoplay warning / tap-to-unlock prompt */}
              {audioBlocked && (
                <button
                  type="button"
                  onClick={testChime}
                  className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-400 text-[10px] font-bold text-amber-200 animate-pulse cursor-pointer transition-colors"
                  title="Browser blocked sound until tap. Click to ring alert bell."
                >
                  Tap to Ring Bell!
                </button>
              )}

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

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserReservations, confirmOrderReceiptByCustomer, subscribeToUserOrders, cancelUserReservation } from '../../services/dbService';
import { playUserSuccessChime } from '../../utils/audioNotification';
import { Reservation, Order } from '../../types';
import {
  User,
  Calendar,
  ShoppingBag,
  X,
  LogOut,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  ChefHat,
  Flame,
  Check,
  AlertCircle,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'reservations' | 'orders';
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'orders',
}) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'reservations' | 'orders'>(initialTab);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const prevStatusesRef = useRef<Record<string, string>>({});
  const initialLoadRef = useRef<boolean>(true);

  // Sync tab if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load reservations and set up real-time listener for orders
  useEffect(() => {
    if (!isOpen || !user) return;

    let active = true;

    // Load reservations
    async function loadReservations() {
      try {
        const userRes = await getUserReservations(user?.uid, user?.email || undefined);
        if (active) setReservations(userRes);
      } catch (err) {
        console.warn('Error loading reservations:', err);
      }
    }
    loadReservations();

    // Set up scoped real-time listener for user orders
    setLoading(true);

    const unsubscribe = subscribeToUserOrders(
      user.uid,
      user.email || undefined,
      (updatedOrders) => {
        if (!active) return;

        // Detect status change in real-time
        if (!initialLoadRef.current) {
          updatedOrders.forEach((ord) => {
            const previousStatus = prevStatusesRef.current[ord.orderId];
            if (previousStatus && previousStatus !== ord.orderStatus) {
              playUserSuccessChime();

              if (ord.orderStatus === 'accepted') {
                showToast(`🔔 Great news! Order #${ord.orderId} was ACCEPTED by the kitchen!`);
              } else if (ord.orderStatus === 'preparing') {
                showToast(`👨‍🍳 Order #${ord.orderId} is being prepared fresh in the kitchen!`);
              } else if (ord.orderStatus === 'ready_for_collection') {
                showToast(`🎉 Order #${ord.orderId} is READY FOR COLLECTION at 58 Updown Hill!`);
              } else if (ord.orderStatus === 'completed') {
                showToast(`✅ Order #${ord.orderId} was marked COMPLETED. Enjoy your meal!`);
              }
            }
          });
        }

        updatedOrders.forEach((ord) => {
          prevStatusesRef.current[ord.orderId] = ord.orderStatus;
        });

        setOrders(updatedOrders);
        if (updatedOrders.length > 0 && !expandedOrderId) {
          setExpandedOrderId(updatedOrders[0].orderId);
        }
        setLoading(false);
        initialLoadRef.current = false;
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isOpen, user]);

  const handleConfirmReceipt = async (orderId: string) => {
    setConfirmingId(orderId);
    try {
      await confirmOrderReceiptByCustomer(orderId);
      playUserSuccessChime();
      showToast(`Thank you! You confirmed receipt of Order #${orderId} ✅`);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId
            ? { ...o, customerConfirmedAt: new Date().toISOString() }
            : o
        )
      );
    } catch (err: any) {
      alert(err.message || 'Could not confirm order receipt');
    } finally {
      setConfirmingId(null);
    }
  };

  const [cancellingResId, setCancellingResId] = useState<string | null>(null);

  const handleCancelReservation = async (resId: string, date: string, time: string) => {
    if (!window.confirm(`Are you sure you want to cancel your table reservation for ${date} at ${time}?`)) {
      return;
    }
    setCancellingResId(resId);
    try {
      await cancelUserReservation(resId);
      playUserSuccessChime();
      showToast('Your table reservation was cancelled successfully.');
      setReservations((prev) =>
        prev.map((r) => (r.id === resId ? { ...r, status: 'cancelled' } : r))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingResId(null);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#191316] border border-[#800020]/45 shadow-2xl p-5 sm:p-8 text-[#FFFFFF] max-h-[92vh] flex flex-col text-left">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-[#800020] to-[#A51C30] text-white px-5 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center space-x-2 border border-white/20 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#2D2228]">
          <div className="flex items-center space-x-3.5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                className="w-12 h-12 rounded-full border-2 border-[#A51C30] object-cover shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#2A1E24] border border-[#A51C30] flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-[#E23D5B]" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#FFFFFF]">
                  {user.displayName || 'Guest Patron'}
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold font-mono">
                  Verified
                </span>
              </div>
              <p className="text-xs text-[#A59E98]">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="p-2 text-xs text-red-300 hover:text-red-200 rounded-xl border border-red-500/25 hover:bg-red-950/40 flex items-center space-x-1.5 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#A59E98] hover:text-[#FFFFFF] rounded-full hover:bg-[#2A2026] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-[#2D2228] pt-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs tracking-wider uppercase font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#E23D5B] text-[#FFFFFF]'
                : 'border-transparent text-[#A59E98] hover:text-[#FFFFFF]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#E23D5B]" />
            <span>Takeaway Orders ({orders.length})</span>
            {orders.filter((o) => o.orderStatus === 'accepted' || o.orderStatus === 'ready_for_collection').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-3 text-xs tracking-wider uppercase font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'reservations'
                ? 'border-[#E23D5B] text-[#FFFFFF]'
                : 'border-transparent text-[#A59E98] hover:text-[#FFFFFF]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#E23D5B]" />
            <span>Table Bookings ({reservations.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4">
          {loading ? (
            <div className="text-center py-16 text-xs text-[#A59E98] space-y-2">
              <div className="w-8 h-8 border-2 border-[#E23D5B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Connecting to live order tracker...</p>
            </div>
          ) : activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#3D2631] mx-auto" />
                <h3 className="font-serif text-lg font-bold text-white">No takeaway orders found</h3>
                <p className="text-xs text-[#A59E98] max-w-sm mx-auto">
                  You haven't placed any takeaway orders yet. Select your favorite dishes from our menu to place an order.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const isExpanded = expandedOrderId === ord.orderId;
                  const isAccepted = ord.orderStatus === 'accepted' || ord.orderStatus === 'new';
                  const isPreparing = ord.orderStatus === 'preparing';
                  const isReady = ord.orderStatus === 'ready_for_collection';
                  const isCompleted = ord.orderStatus === 'completed';
                  const isCancelled = ord.orderStatus === 'cancelled';

                  return (
                    <div
                      key={ord.id || ord.orderId}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isReady
                          ? 'bg-[#221A1F] border-emerald-500/60 shadow-lg'
                          : isAccepted || isPreparing
                          ? 'bg-[#22171D] border-[#E23D5B]/50 shadow-md'
                          : isCompleted
                          ? 'bg-[#1C1619] border-[#2D2228]'
                          : 'bg-[#1F181C] border-[#2D2228]'
                      }`}
                    >
                      {/* Summary Header */}
                      <div
                        onClick={() => setExpandedOrderId(isExpanded ? null : ord.orderId)}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02]"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2.5 flex-wrap">
                            <span className="font-mono font-bold text-base text-[#FFFFFF]">
                              #{ord.orderId}
                            </span>
                            
                            {/* Prominent Status Badge */}
                            {isAccepted && (
                              <span className="px-3 py-0.5 rounded-full bg-[#800020] text-white text-[11px] font-bold uppercase border border-[#E23D5B] shadow-sm animate-pulse">
                                👨‍🍳 Order Accepted
                              </span>
                            )}
                            {isReady && (
                              <span className="px-3 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[11px] font-bold uppercase border border-emerald-400 shadow-md animate-pulse">
                                🎉 Ready for Collection
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-semibold uppercase">
                                ✅ Completed
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#A59E98]">
                            Placed: {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Collection
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-4">
                          <div className="text-right">
                            <p className="font-mono font-bold text-base text-[#FFFFFF]">
                              £{ord.totalAmount.toFixed(2)}
                            </p>
                            <span className="text-[10px] text-[#A59E98] uppercase">
                              {ord.paymentStatus === 'paid' ? 'Paid Online' : 'Pay upon Collection'}
                            </span>
                          </div>
                          <span className="text-xs text-[#E23D5B] font-semibold">
                            {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Order Details & Live Tracker */}
                      {isExpanded && (
                        <div className="p-4 sm:p-6 border-t border-[#2D2228] bg-[#140E12] space-y-6 text-xs">
                          
                          {/* LIVE STATUS STEPPER */}
                          <div className="p-4 sm:p-5 rounded-2xl bg-[#1D151A] border border-[#A51C30]/30 space-y-3">
                            <p className="text-[10px] uppercase font-mono tracking-widest text-[#E23D5B] font-bold">
                              Live Kitchen Progress Tracker
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                              {/* Step 1: Order Accepted */}
                              <div className={`p-3.5 rounded-xl border flex items-center space-x-3 ${
                                isAccepted || isReady || isCompleted
                                  ? 'bg-[#291720] border-[#E23D5B] text-white shadow-sm'
                                  : 'bg-[#181115] border-[#2D2228] text-[#6E646A]'
                              }`}>
                                <ChefHat className={`w-5 h-5 shrink-0 ${isAccepted || isReady || isCompleted ? 'text-[#E23D5B]' : 'text-[#6E646A]'}`} />
                                <div>
                                  <p className="font-bold text-sm">1. Order Accepted</p>
                                  <p className="text-[11px] text-[#A59E98]">
                                    Confirmed by Kitchen
                                  </p>
                                </div>
                              </div>

                              {/* Step 2: Ready for Collection */}
                              <div className={`p-3.5 rounded-xl border flex items-center space-x-3 ${
                                isReady || isCompleted
                                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-sm'
                                  : 'bg-[#181115] border-[#2D2228] text-[#6E646A]'
                              }`}>
                                <ShoppingBag className={`w-5 h-5 shrink-0 ${isReady || isCompleted ? 'text-emerald-400' : 'text-[#6E646A]'}`} />
                                <div>
                                  <p className="font-bold text-sm">2. Ready for Collection</p>
                                  <p className="text-[11px] text-[#A59E98]">
                                    {isReady ? 'Packed at Counter Now!' : isCompleted ? 'Packed' : 'Approx 25-35 mins'}
                                  </p>
                                </div>
                              </div>

                              {/* Step 3: Completed */}
                              <div className={`p-3.5 rounded-xl border flex items-center space-x-3 ${
                                isCompleted
                                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-sm'
                                  : 'bg-[#181115] border-[#2D2228] text-[#6E646A]'
                              }`}>
                                <CheckCircle2 className={`w-5 h-5 shrink-0 ${isCompleted ? 'text-emerald-400' : 'text-[#6E646A]'}`} />
                                <div>
                                  <p className="font-bold text-sm">3. Completed</p>
                                  <p className="text-[11px] text-[#A59E98]">
                                    {isCompleted ? 'Collected & Confirmed' : 'Pending Customer Pickup'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Status message banners */}
                            {isAccepted && (
                              <div className="p-3 rounded-xl bg-[#800020]/25 border border-[#E23D5B]/40 text-[#FFFFFF] text-xs">
                                🍳 <strong>Chef Update:</strong> Your order has been officially accepted and is being cooked with our authentic spices. Please proceed to collect in approx 25-35 minutes.
                              </div>
                            )}

                            {isReady && (
                              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs flex items-center space-x-2.5">
                                <span className="text-xl">🎉</span>
                                <div>
                                  <p className="font-bold text-white text-sm">Your Takeaway Order is Ready for Collection!</p>
                                  <p className="text-[11px] text-emerald-300 mt-0.5">
                                    Your dishes are freshly packaged and waiting at the front counter at 58 Updown Hill, Windlesham, Surrey.
                                  </p>
                                </div>
                              </div>
                            )}

                            {isCompleted && (
                              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                                ✅ <strong>Order Completed:</strong> Thank you for collecting your order! We hope you love the flavors of Rashoi Restaurant.
                              </div>
                            )}
                          </div>

                          {/* Collection Address & Restaurant Contact */}
                          <div className="p-4 rounded-xl bg-[#1B1418] border border-[#2D2228] grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5 text-[#E23D5B] font-semibold">
                                <MapPin className="w-4 h-4" />
                                <span>Collection Address</span>
                              </div>
                              <p className="text-white font-medium">Rashoi Restaurant</p>
                              <p className="text-[#A59E98]">58 Updown Hill, Windlesham, Surrey, GU20 6DX</p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5 text-[#E23D5B] font-semibold">
                                <Phone className="w-4 h-4" />
                                <span>Need Assistance? Call Us</span>
                              </div>
                              <p className="text-white font-medium">01276 475555 / 01276 475550</p>
                              <p className="text-[#A59E98]">Ready in approx 25 - 35 minutes</p>
                            </div>
                          </div>

                          {/* Itemized Order Details */}
                          <div className="space-y-2">
                            <h4 className="text-[11px] uppercase tracking-wider text-[#A59E98] font-bold">
                              Itemized Dishes ({ord.items.length})
                            </h4>

                            <div className="divide-y divide-[#2D2228] border-y border-[#2D2228]">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="py-2.5 flex items-center justify-between">
                                  <div>
                                    <span className="font-semibold text-white">
                                      {item.quantity}x {item.name}
                                    </span>
                                    {item.selectedProtein && (
                                      <span className="text-[11px] text-[#E23D5B] ml-1.5 font-mono">
                                        ({item.selectedProtein})
                                      </span>
                                    )}
                                    {item.selectedCondiments && item.selectedCondiments.length > 0 && (
                                      <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                                        Chutneys: {item.selectedCondiments.join(', ')}
                                      </p>
                                    )}
                                    <p className="text-[11px] text-[#A59E98]">£{item.price.toFixed(2)} each</p>
                                  </div>
                                  <span className="font-mono font-bold text-white">
                                    £{(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Totals */}
                            <div className="pt-2 space-y-1 text-right">
                              <div className="flex justify-between text-[#A59E98]">
                                <span>Subtotal</span>
                                <span className="font-mono text-white">£{ord.subtotal.toFixed(2)}</span>
                              </div>

                              {ord.discount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                  <span>Collection Discount (10%)</span>
                                  <span className="font-mono">-£{ord.discount.toFixed(2)}</span>
                                </div>
                              )}

                              <div className="flex justify-between text-base font-serif font-bold text-white pt-2 border-t border-[#2D2228]">
                                <span>Total to Pay upon Collection</span>
                                <span className="text-[#E23D5B] font-mono">£{ord.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {ord.specialInstructions && (
                            <div className="p-3 rounded-xl bg-[#1B1418] border border-[#2D2228]">
                              <span className="text-[#A59E98] text-[11px] uppercase tracking-wider block mb-0.5">
                                Special Requests for Chef:
                              </span>
                              <p className="text-white italic">"{ord.specialInstructions}"</p>
                            </div>
                          )}

                          {/* Customer Confirmation Action Button */}
                          <div className="pt-2 border-t border-[#2D2228]">
                            {ord.customerConfirmedAt ? (
                              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  <span className="font-semibold">
                                    You confirmed receipt of this order on {new Date(ord.customerConfirmedAt).toLocaleDateString()} at {new Date(ord.customerConfirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                                  Confirmed
                                </span>
                              </div>
                            ) : (isReady || isCompleted) ? (
                              <button
                                type="button"
                                onClick={() => handleConfirmReceipt(ord.orderId)}
                                disabled={confirmingId === ord.orderId}
                                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>
                                  {confirmingId === ord.orderId
                                    ? 'Confirming Receipt...'
                                    : 'Confirm Order Received & Collected'}
                                </span>
                              </button>
                            ) : (
                              <div className="text-center text-[11px] text-[#A59E98]">
                                Once your order is ready for collection or collected, you can confirm receipt here.
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Reservations Tab */
            reservations.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Calendar className="w-12 h-12 text-[#3D2631] mx-auto" />
                <h3 className="font-serif text-lg font-bold text-white">No table bookings found</h3>
                <p className="text-xs text-[#A59E98] max-w-sm mx-auto">
                  You have not submitted any table booking requests yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#1F181C] border border-[#2D2228] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-serif font-bold text-[#FFFFFF] text-base">
                          {res.date} at {res.time}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            res.status === 'confirmed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : res.status === 'cancelled'
                              ? 'bg-red-950 text-red-300'
                              : res.status === 'completed'
                              ? 'bg-zinc-800 text-zinc-300'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <p className="text-[#A59E98] mt-1">
                        Party size: <strong>{res.guests} {res.guests === 1 ? 'Guest' : 'Guests'}</strong> • Ref: <span className="font-mono text-white">{res.id}</span>
                      </p>
                      {res.specialRequests && (
                        <p className="text-[#D4CDC5] italic mt-1 text-[11px]">
                          Note: "{res.specialRequests}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-2.5">
                      <div className="text-left sm:text-right text-[11px] text-[#A59E98]">
                        <p>Rashoi Restaurant</p>
                        <p>58 Updown Hill, Windlesham</p>
                      </div>

                      {res.status !== 'cancelled' && res.status !== 'completed' && (
                        <button
                          type="button"
                          disabled={cancellingResId === res.id}
                          onClick={() => handleCancelReservation(res.id, res.date, res.time)}
                          className="px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1.5 self-start sm:self-end"
                          title="Cancel this table reservation"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{cancellingResId === res.id ? 'Cancelling...' : 'Cancel Booking'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};

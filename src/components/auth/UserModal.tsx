import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserReservations, getOrders } from '../../services/dbService';
import { Reservation, Order } from '../../types';
import { User, Calendar, ShoppingBag, X, LogOut } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'reservations' | 'orders'>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;

    let active = true;
    async function loadUserData() {
      setLoading(true);
      try {
        const [userRes, allOrders] = await Promise.all([
          getUserReservations(user?.uid, user?.email || undefined),
          getOrders(),
        ]);

        if (active) {
          setReservations(userRes);
          // Filter customer orders
          const userOrders = allOrders.filter(
            (o) => o.customerId === user?.uid || o.customerEmail === user?.email
          );
          setOrders(userOrders);
        }
      } catch (err) {
        console.warn('Error loading user history:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUserData();
    return () => {
      active = false;
    };
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#1F181C] border border-[#800020]/45 shadow-2xl p-6 sm:p-8 text-[#FFFFFF] max-h-[90vh] flex flex-col text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#2D2228]">
          <div className="flex items-center space-x-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                className="w-12 h-12 rounded-full border border-[#A51C30]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#2A1E24] border border-[#A51C30] flex items-center justify-center">
                <User className="w-6 h-6 text-[#E23D5B]" />
              </div>
            )}
            <div>
              <h2 className="font-serif text-xl font-bold text-[#FFFFFF]">{user.displayName || 'Guest Patron'}</h2>
              <p className="text-xs text-[#A59E98]">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="p-2 text-xs text-red-300 hover:text-red-200 rounded border border-red-500/25 hover:bg-red-950/40 flex items-center space-x-1 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#A59E98] hover:text-[#FFFFFF] rounded-full hover:bg-[#2A2026] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-[#2D2228] pt-4">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-3 text-xs tracking-wider uppercase font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'reservations'
                ? 'border-[#A51C30] text-[#FFFFFF]'
                : 'border-transparent text-[#A59E98] hover:text-[#FFFFFF]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#E23D5B]" />
            <span>Table Bookings ({reservations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs tracking-wider uppercase font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#A51C30] text-[#FFFFFF]'
                : 'border-transparent text-[#A59E98] hover:text-[#FFFFFF]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#E23D5B]" />
            <span>Takeaway Orders ({orders.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-xs text-[#A59E98]">Loading your history...</div>
          ) : activeTab === 'reservations' ? (
            reservations.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Calendar className="w-8 h-8 text-[#2D2228] mx-auto" />
                <p className="text-xs text-[#A59E98]">You have no table reservation records yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl bg-[#161114] border border-[#2D2228] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-[#FFFFFF] text-sm">
                          {res.date} at {res.time}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                            res.status === 'confirmed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : res.status === 'cancelled'
                              ? 'bg-red-950 text-red-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <p className="text-[#A59E98] mt-1">
                        Party size: {res.guests} {res.guests === 1 ? 'Guest' : 'Guests'} • Ref: {res.id}
                      </p>
                      {res.specialRequests && (
                        <p className="text-[#D4CDC5] italic mt-1 text-[11px]">"{res.specialRequests}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            orders.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <ShoppingBag className="w-8 h-8 text-[#2D2228] mx-auto" />
                <p className="text-xs text-[#A59E98]">You have placed no takeaway orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-[#161114] border border-[#2D2228] text-xs space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-[#F5B8C3]">{ord.orderId}</span>
                      <div className="flex space-x-2">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-200 capitalize text-[10px] border border-blue-800/30">
                          {ord.orderStatus}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#2D1F26] text-[#E23D5B] uppercase text-[10px] border border-[#800020]/30 font-medium">
                          {ord.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="text-[#A59E98]">
                      {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#2D2228] text-[#FFFFFF]">
                      <span>Total</span>
                      <span className="font-mono font-bold text-[#E23D5B]">£{ord.totalAmount.toFixed(2)}</span>
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

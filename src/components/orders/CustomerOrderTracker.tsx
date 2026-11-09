import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserOrders } from '../../services/dbService';
import { playUserSuccessChime, sendDesktopNotification } from '../../utils/audioNotification';
import { Order } from '../../types';
import {
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle2,
  BellRing,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';

interface CustomerOrderTrackerProps {
  onOpenOrders: () => void;
}

export const CustomerOrderTracker: React.FC<CustomerOrderTrackerProps> = ({ onOpenOrders }) => {
  const { user, isAdmin } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [toastAlert, setToastAlert] = useState<{
    orderId: string;
    status: Order['orderStatus'];
    title: string;
    message: string;
  } | null>(null);

  const prevStatusesRef = useRef<Record<string, string>>({});
  const initialLoadRef = useRef<boolean>(true);
  const toastTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!user || isAdmin) {
      setActiveOrders([]);
      return;
    }

    const unsubscribe = subscribeToUserOrders(
      user.uid,
      user.email || undefined,
      (allOrders) => {
        // Filter orders currently in progress
        const inProgress = allOrders.filter(
          (o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
        );
        setActiveOrders(inProgress);

        // Detect real-time status transitions
        if (!initialLoadRef.current) {
          allOrders.forEach((ord) => {
            const prev = prevStatusesRef.current[ord.orderId];
            if (prev && prev !== ord.orderStatus) {
              playUserSuccessChime();

              let title = 'Order Update';
              let message = `Order #${ord.orderId} status changed to ${ord.orderStatus}`;

              if (ord.orderStatus === 'accepted') {
                title = 'Kitchen Accepted Your Order!';
                message = `Chef accepted Order #${ord.orderId}. Preparing your dishes fresh now.`;
                sendDesktopNotification('Rashoi: Order Accepted', { body: message });
              } else if (ord.orderStatus === 'preparing') {
                title = 'Cooking in Progress!';
                message = `Your delicious dishes for Order #${ord.orderId} are being cooked right now.`;
                sendDesktopNotification('Rashoi: Cooking Order', { body: message });
              } else if (ord.orderStatus === 'ready_for_collection') {
                title = '🎉 Food is Ready for Collection!';
                message = `Order #${ord.orderId} is packaged hot & ready for collection at 58 Updown Hill!`;
                sendDesktopNotification('Rashoi: Order Ready for Collection!', { body: message });
              } else if (ord.orderStatus === 'completed') {
                title = 'Order Completed!';
                message = `Order #${ord.orderId} marked complete. Enjoy your meal!`;
                sendDesktopNotification('Rashoi: Order Completed', { body: message });
              }

              setToastAlert({
                orderId: ord.orderId,
                status: ord.orderStatus,
                title,
                message,
              });

              if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = setTimeout(() => {
                setToastAlert(null);
              }, 12000);
            }
          });
        }

        allOrders.forEach((o) => {
          prevStatusesRef.current[o.orderId] = o.orderStatus;
        });

        initialLoadRef.current = false;
      }
    );

    return () => {
      unsubscribe();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [user, isAdmin]);

  if (!user || isAdmin) return null;

  const latestActiveOrder = activeOrders[0];

  return (
    <>
      {/* 1. REAL-TIME STATUS CHANGE TOAST NOTIFICATION */}
      {toastAlert && (
        <div className="fixed top-20 right-4 sm:right-6 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-[420px] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="relative rounded-2xl bg-gradient-to-r from-[#2B1019] via-[#1E1117] to-[#2B1019] border-2 border-[#E23D5B] shadow-[0_20px_50px_rgba(226,61,91,0.35)] p-4 sm:p-5 text-white overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#800020] border border-[#E23D5B] flex items-center justify-center text-white shrink-0 shadow-lg animate-bounce">
                  {toastAlert.status === 'ready_for_collection' ? (
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  ) : toastAlert.status === 'preparing' ? (
                    <ChefHat className="w-5 h-5 text-[#F5B8C3]" />
                  ) : (
                    <BellRing className="w-5 h-5 text-[#F5B8C3]" />
                  )}
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E23D5B] text-white">
                    LIVE KITCHEN STATUS
                  </span>
                  <h4 className="font-serif text-base font-bold text-white mt-1">
                    {toastAlert.title}
                  </h4>
                  <p className="text-xs text-[#E2DDD7] mt-1 leading-snug">
                    {toastAlert.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setToastAlert(null)}
                className="text-[#9E9790] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-[#A51C30]/40 flex justify-end">
              <button
                onClick={() => {
                  setToastAlert(null);
                  onOpenOrders();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#A51C30] hover:from-[#A51C30] hover:to-[#B3243C] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
              >
                <span>Track Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PERSISTENT LIVE TRACKING PILL AT BOTTOM LEFT (While customer has active order) */}
      {latestActiveOrder && (
        <div className="fixed bottom-5 left-5 z-[9990] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={onOpenOrders}
            className="flex items-center space-x-3 p-2 pl-3 pr-3.5 rounded-full bg-[#1A0E13]/95 hover:bg-[#25131B] border-2 border-[#A51C30] shadow-2xl backdrop-blur-md text-white text-xs cursor-pointer group transition-all hover:scale-105"
            title="Click to view live takeaway order status"
          >
            <div className="w-7 h-7 rounded-full bg-[#800020] border border-[#E23D5B] flex items-center justify-center text-white shrink-0">
              {latestActiveOrder.orderStatus === 'ready_for_collection' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5 text-[#F5B8C3]" />
              )}
            </div>

            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E23D5B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E23D5B]" />
                </span>
                <span className="font-bold text-[11px] text-white">
                  Order #{latestActiveOrder.orderId}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#800020] text-[#F5B8C3] font-semibold">
                  {latestActiveOrder.orderStatus === 'ready_for_collection'
                    ? 'READY'
                    : latestActiveOrder.orderStatus === 'preparing'
                    ? 'COOKING'
                    : latestActiveOrder.orderStatus === 'accepted'
                    ? 'ACCEPTED'
                    : 'RECEIVED'}
                </span>
              </div>
              <p className="text-[10px] text-[#C4BCB5] group-hover:text-white transition-colors">
                {latestActiveOrder.orderStatus === 'ready_for_collection'
                  ? 'Ready for collection at 58 Updown Hill'
                  : 'Click for live kitchen progress & confirmation'}
              </p>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#E23D5B] group-hover:translate-x-1 transition-transform ml-1" />
          </button>
        </div>
      )}
    </>
  );
};

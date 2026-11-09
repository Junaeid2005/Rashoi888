import React, { useEffect } from 'react';
import { Order } from '../../types';
import { playUserSuccessChime } from '../../utils/audioNotification';
import { CheckCircle2, Building, Clock, X } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  useEffect(() => {
    if (order) {
      playUserSuccessChime();
    }
  }, [order?.orderId]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#1F181C] border border-[#800020]/45 shadow-2xl p-6 sm:p-8 text-[#FFFFFF] text-left max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#B8B1A7] hover:text-[#FFFFFF] rounded-full hover:bg-[#2A2026] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#2A1E24] border border-[#A51C30] flex items-center justify-center mx-auto text-[#E23D5B] shadow-lg shadow-[#800020]/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
            Thank you for your order!
          </h2>
          <p className="text-xs text-[#D4CDC5]">
            Your takeaway order has been recorded and transmitted to the kitchen.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-4 rounded-xl bg-[#161114] border border-[#2D2228] space-y-3 mb-6">
          <div className="flex justify-between text-xs">
            <span className="text-[#A59E98]">Order Reference:</span>
            <span className="font-mono font-bold text-[#F5B8C3]">{order.orderId}</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-[#A59E98]">Customer Name:</span>
            <span className="font-medium text-[#FFFFFF]">{order.customerName}</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-[#A59E98]">Order Status:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-200 font-medium capitalize border border-blue-800/40">
              {order.orderStatus}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-[#A59E98]">Payment Method:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#2D1F26] text-[#E23D5B] font-medium uppercase border border-[#800020]/40">
              Pay upon Collection
            </span>
          </div>
        </div>

        {/* Itemized Breakdown */}
        <div className="space-y-2 mb-6">
          <h4 className="text-xs uppercase tracking-wider text-[#A59E98] font-medium">
            Ordered Items
          </h4>
          <div className="divide-y divide-[#2D2228] border-y border-[#2D2228] py-1 max-h-40 overflow-y-auto">
            {order.items.map((item, i) => (
              <div key={i} className="py-2 flex justify-between text-xs">
                <div>
                  <span className="text-[#FFFFFF] font-medium">
                    {item.quantity}x {item.name}
                  </span>
                  {item.selectedProtein && (
                    <span className="text-[#A59E98] ml-1">({item.selectedProtein})</span>
                  )}
                </div>
                <span className="text-[#F5B8C3] font-mono font-semibold">
                  £{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-2 space-y-1 text-xs">
            <div className="flex justify-between text-[#A59E98]">
              <span>Subtotal:</span>
              <span>£{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Collection Discount (10%):</span>
                <span>-£{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-serif font-bold text-[#FFFFFF] pt-1">
              <span>Total to Pay upon Collection:</span>
              <span className="text-[#E23D5B] font-mono font-bold text-base">£{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Collection Instructions */}
        <div className="p-4 rounded-xl bg-[#161114] border border-[#800020]/35 space-y-2 text-xs text-[#D4CDC5] mb-6">
          <div className="flex items-center space-x-2 text-[#E23D5B] font-semibold">
            <Building className="w-4 h-4" />
            <span>Collection Location</span>
          </div>
          <p>
            58 Updown Hill, Windlesham, Surrey, GU20 6DX.
          </p>
          <div className="flex items-center space-x-2 text-[#A59E98] pt-1">
            <Clock className="w-3.5 h-3.5 text-[#E23D5B]" />
            <span>Estimated ready time: 25 - 35 minutes</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 nav-burgundy-btn text-white font-bold text-xs tracking-widest uppercase rounded-lg shadow-lg cursor-pointer"
        >
          Close & Return to Website
        </button>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/dbService';
import { Order } from '../../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Building,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderSuccess }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    total,
    collectionDiscountPercent,
  } = useCart();

  const { user } = useAuth();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handlePlaceCollectionOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setFormError('Please enter your name, email, and contact phone number.');
      return;
    }

    if (items.length === 0) {
      setFormError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = 'RSH-' + Math.floor(100000 + Math.random() * 900000);
      
      const newOrder = await createOrder({
        orderId: orderNumber,
        customerId: user?.uid,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        orderType: 'collection',
        items,
        subtotal,
        discount,
        totalAmount: total,
        currency: 'GBP',
        paymentProvider: 'stripe',
        specialInstructions: specialInstructions.trim() || undefined,
      });

      clearCart();
      setIsCheckingOut(false);
      setIsCartOpen(false);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      setFormError(err.message || 'Failed to place collection order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-[#161114] border-l border-[#A51C30]/35 shadow-2xl flex flex-col h-full text-[#FFFFFF]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#A51C30]/25 flex items-center justify-between bg-[#1A1418]">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#E23D5B]" />
            <h2 className="font-serif text-xl font-bold tracking-wide text-[#FFFFFF]">
              {isCheckingOut ? 'Takeaway Checkout' : 'Your Takeaway Order'}
            </h2>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setIsCheckingOut(false);
            }}
            className="p-1.5 text-[#ABA29B] hover:text-[#FFFFFF] rounded-full hover:bg-[#291F24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-[#3A2A30] mx-auto" />
              <p className="text-[#ABA29B] text-sm">Your order basket is currently empty.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 nav-burgundy-btn text-white font-semibold text-xs tracking-wider uppercase rounded-xl cursor-pointer"
              >
                Browse Menu
              </button>
            </div>
          ) : !isCheckingOut ? (
            /* Items List */
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#1F181C] border border-[#A51C30]/25 flex items-center justify-between gap-3 text-left shadow-sm"
                >
                  <div className="flex-1">
                    <h4 className="font-serif text-sm font-bold text-[#FFFFFF]">
                      {item.name}
                    </h4>
                    {item.selectedProtein && (
                      <p className="text-[11px] text-[#E23D5B] font-mono font-semibold">
                        Protein: {item.selectedProtein}
                      </p>
                    )}
                    <p className="text-xs text-[#ABA29B] mt-0.5">
                      £{item.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-2 bg-[#291F24] rounded-lg px-2 py-1 border border-[#A51C30]/30">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-0.5 text-[#ABA29B] hover:text-white cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold w-4 text-center text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-0.5 text-[#ABA29B] hover:text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total line price & delete */}
                  <div className="text-right flex items-center space-x-3">
                    <span className="font-serif text-sm font-bold text-[#E23D5B]">
                      £{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#ABA29B] hover:text-red-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Checkout Form */
            <form id="checkout-form" onSubmit={handlePlaceCollectionOrder} className="space-y-4 text-left">
              
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1 font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161013] border border-[#A51C30]/35 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#E23D5B] shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1 font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.co.uk"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161013] border border-[#A51C30]/35 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#E23D5B] shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1 font-medium">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 07123 456789"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161013] border border-[#A51C30]/35 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#E23D5B] shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1 font-medium">
                  Order Type
                </label>
                <div className="p-3.5 rounded-xl bg-[#1F181C] border border-[#A51C30]/35 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-[#E23D5B]" />
                    <span className="font-bold text-[#FFFFFF]">Collection (Takeaway)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-semibold">
                    {collectionDiscountPercent}% Discount Applied
                  </span>
                </div>
                <p className="text-[11px] text-[#ABA29B] mt-1">
                  Collect from: 58 Updown Hill, Windlesham, Surrey, GU20 6DX. Ready in approx. 25-35 mins.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1 font-medium">
                  Special Notes for the Chef (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Mild spice preference, extra coriander..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#161013] border border-[#A51C30]/35 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#E23D5B] shadow-inner"
                />
              </div>

              {/* PAYMENT SECTION */}
              <div className="pt-2 border-t border-[#A51C30]/20">
                <p className="text-xs uppercase tracking-wider text-[#FFFFFF] font-semibold mb-2">
                  Select Payment Method
                </p>

                {/* DISABLED ONLINE PAYMENT BUTTON PER STRICT REQUIREMENT */}
                <div className="p-3.5 rounded-xl border border-[#3A2A30] bg-[#161013] space-y-2 opacity-80 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-[#ABA29B]" />
                      <span className="text-xs font-semibold text-[#ABA29B]">Pay Online with Stripe (Card)</span>
                    </div>
                    <span className="text-[10px] bg-[#291F24] text-[#ABA29B] px-2 py-0.5 rounded">
                      Disabled
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-400/90 italic">
                    "Online payment is coming soon. Please check back later."
                  </p>
                </div>

                {/* ENABLED: Pay on Collection */}
                <div className="p-3.5 rounded-xl border border-[#A51C30]/50 bg-[#1F181C] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-[#E23D5B]" />
                    <span className="text-xs font-semibold text-[#FFFFFF]">Pay upon Collection (Cash or Card at Counter)</span>
                  </div>
                  <span className="text-[10px] bg-[#800020]/30 text-[#E23D5B] px-2.5 py-1 rounded-full font-mono border border-[#A51C30]/40 font-bold">
                    Available
                  </span>
                </div>
              </div>

            </form>
          )}
        </div>

        {/* Footer Totals & Checkout Button */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#A51C30]/25 bg-[#1A1418] space-y-3">
            
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#ABA29B]">
                <span>Subtotal ({items.length} dishes)</span>
                <span className="text-white font-mono">£{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Collection Discount ({collectionDiscountPercent}%)</span>
                  <span>-£{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-serif font-bold text-[#FFFFFF] pt-2 border-t border-[#A51C30]/25">
                <span>Total Amount (GBP)</span>
                <span className="text-[#E23D5B]">£{total.toFixed(2)}</span>
              </div>
            </div>

            {!isCheckingOut ? (
              <div className="pt-2 flex space-x-3">
                <button
                  onClick={clearCart}
                  className="px-3.5 py-3 border border-[#A51C30]/35 bg-[#1F181C] text-[#ABA29B] hover:text-red-400 rounded-xl text-xs uppercase cursor-pointer"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="flex-1 py-3.5 nav-burgundy-btn text-white font-bold text-xs tracking-widest uppercase rounded-xl shadow-lg cursor-pointer transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>
            ) : (
              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="px-4 py-3 border border-[#A51C30]/35 bg-[#1F181C] text-[#FFFFFF] hover:bg-[#291F24] rounded-xl text-xs uppercase cursor-pointer font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="flex-1 py-3.5 nav-burgundy-btn text-white font-bold text-xs tracking-widest uppercase rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center space-x-2"
                >
                  <span>{submitting ? 'Placing Order...' : `Place Order (£${total.toFixed(2)})`}</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

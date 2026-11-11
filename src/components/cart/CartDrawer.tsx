import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/dbService';
import { Order } from '../../types';
import { isStripeOnlinePaymentActive, createStripeCheckout } from '../../services/stripeService';
import { playUserSuccessChime, sendDesktopNotification } from '../../utils/audioNotification';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Building,
  AlertCircle,
  ShieldAlert,
  Lock
} from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

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

  const { user, isAdmin, signInWithGoogle } = useAuth();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'collection' | 'stripe'>('collection');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync user credentials whenever user signs in
  useEffect(() => {
    if (user) {
      if (user.displayName && !customerName) setCustomerName(user.displayName);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  const stripeActive = isStripeOnlinePaymentActive();

  const handleCloseCart = () => {
    setIsCartOpen(false);
    setIsCheckingOut(false);
    if (window.history.state?.overlay === 'cart') {
      window.history.back();
    }
  };

  if (!isCartOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      signInWithGoogle();
      return;
    }

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

      const orderPayload: any = {
        orderId: orderNumber,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        orderType: 'collection',
        items,
        subtotal,
        discount,
        totalAmount: total,
        currency: 'GBP',
        paymentProvider: paymentMethod === 'stripe' && stripeActive ? 'stripe' : 'cash',
      };
      if (user?.uid) {
        orderPayload.customerId = user.uid;
      }
      if (specialInstructions.trim()) {
        orderPayload.specialInstructions = specialInstructions.trim();
      }

      // If user selected Stripe and Stripe is configured in environment
      if (paymentMethod === 'stripe' && stripeActive) {
        await createOrder(orderPayload);

        const { checkoutUrl } = await createStripeCheckout({
          orderId: orderNumber,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          items,
          totalAmount: total,
          discount,
          subtotal,
        });

        window.location.href = checkoutUrl;
        return;
      }

      // Cache order ID locally for instant client persistence
      if (typeof window !== 'undefined') {
        try {
          const currentSaved: string[] = JSON.parse(localStorage.getItem('rashoi_user_orders') || '[]');
          if (!currentSaved.includes(orderNumber)) {
            currentSaved.unshift(orderNumber);
            localStorage.setItem('rashoi_user_orders', JSON.stringify(currentSaved.slice(0, 30)));
          }
        } catch (e) {
          // ignore
        }
      }

      // Default: Pay upon Collection
      const newOrder = await createOrder(orderPayload);

      // Play elegant user confirmation audio chime
      playUserSuccessChime();

      // Send desktop notification
      sendDesktopNotification('Rashoi Takeaway Order Confirmed', {
        body: `Order #${orderNumber} for £${total.toFixed(2)} received. Ready in 25-35 mins for collection at 58 Updown Hill.`,
      });

      clearCart();
      setIsCheckingOut(false);
      setIsCartOpen(false);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      setFormError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end"
      onClick={handleCloseCart}
    >
      <div
        className="relative w-full max-w-md bg-[#161114] border-l border-[#A51C30]/35 shadow-2xl flex flex-col h-full text-[#FFFFFF]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-[#A51C30]/25 flex items-center justify-between bg-[#1A1418]">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#E23D5B]" />
            <h2 className="font-serif text-xl font-bold tracking-wide text-[#FFFFFF]">
              {isCheckingOut ? 'Takeaway Checkout' : 'Your Takeaway Order'}
            </h2>
          </div>
          <button
            onClick={handleCloseCart}
            className="p-1.5 text-[#ABA29B] hover:text-[#FFFFFF] rounded-full hover:bg-[#291F24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isAdmin ? (
            <div className="py-20 text-center space-y-4 px-4">
              <div className="w-16 h-16 rounded-full bg-[#291F24] border border-[#A51C30] flex items-center justify-center mx-auto text-[#E23D5B] shadow-lg">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <span className="text-[10px] tracking-widest text-[#E23D5B] uppercase font-mono font-bold">
                Administrator Session Active
              </span>
              <h3 className="font-serif text-xl font-bold text-[#FFFFFF]">
                Food Ordering Disabled for Admins
              </h3>
              <p className="text-[#ABA29B] text-xs leading-relaxed max-w-sm mx-auto">
                You are currently signed in with an administrator account (<span className="text-white font-medium">{user?.email}</span>). Takeaway food ordering and checkout are disabled for admin accounts.
              </p>
              <button
                onClick={handleCloseCart}
                className="px-6 py-2.5 nav-burgundy-btn text-white font-semibold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Close Basket
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-[#3A2A30] mx-auto" />
              <p className="text-[#ABA29B] text-sm">Your order basket is currently empty.</p>
              <button
                onClick={handleCloseCart}
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
                    {item.selectedCondiments && item.selectedCondiments.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.selectedCondiments.map((cond, cIdx) => (
                          <span
                            key={cIdx}
                            className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                              cond.includes('None')
                                ? 'bg-[#291F24] text-zinc-300 border border-zinc-700/40'
                                : 'bg-[#2D1621] text-amber-300 border border-amber-400/30 font-medium'
                            }`}
                          >
                            {cond.includes('None') ? 'Plain Papadam' : `+ ${cond}`}
                          </span>
                        ))}
                      </div>
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
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4 text-left">
              
              {!user ? (
                <div className="p-4 rounded-xl bg-[#291F24] border border-[#A51C30]/50 space-y-2.5">
                  <div className="flex items-center space-x-2 text-[#E23D5B]">
                    <Lock className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                      Google Sign-In Required
                    </p>
                  </div>
                  <p className="text-xs text-[#E2DDD7] leading-relaxed">
                    Please sign in with your Google account to place and verify your takeaway order.
                  </p>
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs tracking-wide shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <GoogleIcon />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#291F24]/80 border border-emerald-500/30 text-xs text-[#E2DDD7]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="truncate max-w-[200px]">
                      Ordering as: <strong className="text-white">{user.displayName || user.email}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold shrink-0">
                    Verified
                  </span>
                </div>
              )}

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
              <div className="pt-2 border-t border-[#A51C30]/20 space-y-3">
                <p className="text-xs uppercase tracking-wider text-[#FFFFFF] font-semibold">
                  Select Payment Method
                </p>

                {/* 1. Pay Online via Card / Apple Pay (Stripe) */}
                <div
                  onClick={() => {
                    if (stripeActive) setPaymentMethod('stripe');
                  }}
                  className={`p-3.5 rounded-xl border transition-all ${
                    stripeActive
                      ? paymentMethod === 'stripe'
                        ? 'border-[#E23D5B] bg-[#2A1720] shadow-md cursor-pointer'
                        : 'border-[#A51C30]/40 bg-[#1A1418] hover:border-[#E23D5B]/60 cursor-pointer'
                      : 'border-[#3A2A30] bg-[#161013] opacity-80 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <CreditCard className={`w-4 h-4 ${stripeActive ? 'text-[#E23D5B]' : 'text-[#858078]'}`} />
                      <span className={`text-xs font-semibold ${stripeActive ? 'text-white' : 'text-[#B8B1A7]'}`}>
                        Pay Online with Card / Apple Pay (Stripe)
                      </span>
                    </div>
                    {stripeActive ? (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] bg-[#291F24] text-amber-300/90 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-bold uppercase tracking-wider">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#A59E98] mt-1.5 leading-relaxed">
                    {stripeActive
                      ? 'Secure online card payment & Apple Pay powered by Stripe.'
                      : 'Online payment is coming soon. Please choose Pay upon Collection.'}
                  </p>
                </div>

                {/* 2. Pay on Collection (Active Default) */}
                <div
                  onClick={() => setPaymentMethod('collection')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'collection'
                      ? 'border-[#E23D5B] bg-[#2A1720] shadow-md'
                      : 'border-[#A51C30]/40 bg-[#1A1418] hover:border-[#E23D5B]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Building className="w-4 h-4 text-[#E23D5B]" />
                      <span className="text-xs font-semibold text-[#FFFFFF]">
                        Pay upon Collection (Cash or Card at Counter)
                      </span>
                    </div>
                    <span className="text-[10px] bg-[#800020]/40 text-[#E23D5B] px-2.5 py-1 rounded-full font-mono border border-[#A51C30]/40 font-bold">
                      Available
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A59E98] mt-1.5 leading-relaxed">
                    Collect in person at 58 Updown Hill, Windlesham, Surrey. Pay by card or cash at the counter.
                  </p>
                </div>
              </div>

            </form>
          )}
        </div>

        {/* Footer Totals & Checkout Button */}
        {items.length > 0 && !isAdmin && (
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

                {!user ? (
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="flex-1 py-3.5 bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs tracking-wider uppercase rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center space-x-2"
                  >
                    <GoogleIcon />
                    <span>Sign in with Google to Order</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={submitting}
                    className="flex-1 py-3.5 nav-burgundy-btn text-white font-bold text-xs tracking-widest uppercase rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{submitting ? 'Placing Order...' : `Place Order (£${total.toFixed(2)})`}</span>
                  </button>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

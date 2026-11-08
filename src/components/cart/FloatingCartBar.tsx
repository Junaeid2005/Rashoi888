import React from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const FloatingCartBar: React.FC = () => {
  const { itemCount, total, isCartOpen, setIsCartOpen } = useCart();

  if (itemCount === 0 || isCartOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between sm:justify-start space-x-3 sm:space-x-5 px-5 py-3 rounded-full bg-[#1F181C]/95 border border-[#A51C30]/60 text-white shadow-2xl backdrop-blur-md shadow-[#800020]/25">
        
        {/* Cart Item Count & Total */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#800020] flex items-center justify-center text-white shadow-inner">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E23D5B] text-[10px] font-bold flex items-center justify-center text-white">
              {itemCount}
            </span>
          </div>

          <div className="text-left">
            <p className="text-xs font-semibold text-white">
              {itemCount} {itemCount === 1 ? 'Dish' : 'Dishes'} in Order
            </p>
            <p className="text-[11px] font-mono text-[#F5B8C3]">
              Total: <span className="font-bold text-white">£{total.toFixed(2)}</span>{' '}
              <span className="text-[10px] text-emerald-400 font-sans">(10% off)</span>
            </p>
          </div>
        </div>

        {/* View Order & Pay Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="nav-burgundy-btn px-4 sm:px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-md cursor-pointer hover:scale-102 transition-transform"
        >
          <span>View Order & Pay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ClassicDishPricing } from '../../types';
import { DishVisualMeta } from '../../utils/menuImageResolver';
import { X, Check, Plus, Minus, Wine, AlertCircle } from 'lucide-react';

export interface ClassicDishModalInfo {
  pricing: ClassicDishPricing;
  description: string;
  visualMeta: DishVisualMeta;
}

interface ClassicDishModalProps {
  isOpen: boolean;
  dish: ClassicDishModalInfo | null;
  isAdmin?: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, selectedOption: string, price: number) => void;
}

interface ClassicOptionRow {
  key: 'chicken' | 'lamb' | 'prawn' | 'kingPrawn' | 'veg';
  label: 'Chicken' | 'Lamb' | 'Prawn' | 'King Prawn' | 'Vegetable';
  price: number | null;
}

export const ClassicDishModal: React.FC<ClassicDishModalProps> = ({
  isOpen,
  dish,
  isAdmin = false,
  onClose,
  onConfirm,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Always start with NO pre-selected option when opening a dish
  useEffect(() => {
    if (isOpen && dish) {
      setSelectedOption(null);
      setQuantity(1);
    }
  }, [isOpen, dish?.pricing.id]);

  if (!isOpen || !dish) return null;

  const { pricing, description, visualMeta } = dish;

  const options: ClassicOptionRow[] = [
    { key: 'chicken', label: 'Chicken', price: pricing.chickenPrice },
    { key: 'lamb', label: 'Lamb', price: pricing.lambPrice },
    { key: 'prawn', label: 'Prawn', price: pricing.prawnPrice },
    { key: 'kingPrawn', label: 'King Prawn', price: pricing.kingPrawnPrice },
    { key: 'veg', label: 'Vegetable', price: pricing.vegPrice },
  ];

  const activeOptionObj = options.find(
    (opt) => opt.label === selectedOption && opt.price !== null
  );
  const selectedPrice = activeOptionObj?.price ?? null;
  const totalPrice = selectedPrice !== null ? selectedPrice * quantity : null;

  const handleConfirm = () => {
    if (!activeOptionObj || selectedPrice === null) return;
    onConfirm(quantity, activeOptionObj.label, selectedPrice);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-2xl overflow-hidden border border-[#A51C30]/50 bg-[#140F12] text-white shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image & Dish Title */}
        <div className="relative h-40 sm:h-48 w-full overflow-hidden shrink-0 bg-[#0D0D0D]">
          <img
            src={visualMeta.imageUrl}
            alt={pricing.dishName}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140F12] via-[#140F12]/45 to-black/35" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-black/65 text-[#D4CDC5] hover:text-white hover:bg-[#800020] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3.5 left-5 right-5 flex items-end justify-between gap-3">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-mono text-[#F5B8C3] font-semibold">
                Classic Dishes
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                {pricing.dishName}
              </h3>
            </div>
            {selectedPrice !== null && (
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-[#F5B8C3] block font-mono">
                  {activeOptionObj?.label}
                </span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-white">
                  £{selectedPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs sm:text-sm text-[#D4CDC5] leading-relaxed">
            {description}
          </p>

          {/* Option Selection Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#F5B8C3] font-semibold">
                Select Your Choice *
              </span>
              <span className="text-[11px] text-[#A59E98]">
                Choose one option
              </span>
            </div>

            <div className="space-y-2">
              {options.map((option) => {
                const isAvailable = option.price !== null;
                const isSelected = selectedOption === option.label && isAvailable;

                return (
                  <button
                    key={option.key}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedOption(option.label);
                      }
                    }}
                    className={`w-full p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-left ${
                      !isAvailable
                        ? 'bg-[#100C0E] border-[#241C20] opacity-55 cursor-not-allowed'
                        : isSelected
                        ? 'bg-gradient-to-r from-[#2B151F] to-[#1F141A] border-[#E23D5B] shadow-md shadow-[#800020]/20 cursor-pointer'
                        : 'bg-[#1A1418] border-[#2D2228] hover:border-[#800020]/65 hover:bg-[#20181D] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Radio Indicator */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                          !isAvailable
                            ? 'bg-[#140F12] border-[#2D2228]'
                            : isSelected
                            ? 'bg-[#800020] border-[#E23D5B] text-white'
                            : 'bg-[#140F12] border-[#4A3840] text-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <span
                        className={`font-semibold text-sm ${
                          !isAvailable
                            ? 'text-[#7A7276] line-through'
                            : 'text-white'
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>

                    {isAvailable && option.price !== null ? (
                      <span
                        className={`font-mono text-sm font-bold ${
                          isSelected ? 'text-[#F5B8C3]' : 'text-[#E2DDD7]'
                        }`}
                      >
                        £{option.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7276] italic">
                        Not Available
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pairing Note */}
          <div className="p-3 rounded-xl border border-[#800020]/30 bg-[#171215] flex items-center space-x-3 text-xs text-[#F5B8C3]">
            <Wine className="w-4 h-4 shrink-0 text-[#A51C30]" />
            <span>
              <strong>Chef’s Recommendation:</strong> {visualMeta.pairing}
            </span>
          </div>
        </div>

        {/* Sticky Footer: Stepper & Add to Order */}
        <div className="p-4 sm:p-5 border-t border-[#2D2228] bg-[#140E12] space-y-2.5 shrink-0">
          {isAdmin ? (
            <div className="w-full py-3 px-4 rounded-xl border border-[#A51C30]/40 bg-[#1A1418] text-center text-xs text-[#E2DDD7]">
              <span className="font-semibold text-white">Administrator Preview Mode:</span> Food ordering and checkout are disabled for admin accounts.
            </div>
          ) : (
            <>
              {!activeOptionObj && (
                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-amber-300/90">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Please select Chicken, Lamb, Prawn, King Prawn, or Vegetable above.</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 sm:gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2.5 bg-[#1F181C] rounded-xl px-3 py-2 border border-[#3A2A30]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-[#ABA29B] hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-sm min-w-6 text-center text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-[#ABA29B] hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Order Button */}
                <button
                  type="button"
                  disabled={!activeOptionObj || totalPrice === null}
                  onClick={handleConfirm}
                  className={`flex-1 py-3 px-4 sm:px-5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2 ${
                    activeOptionObj && totalPrice !== null
                      ? 'cursor-pointer shadow-xl bg-gradient-to-r from-[#800020] to-[#A51C30] hover:from-[#9B1130] hover:to-[#B3243C] text-white border border-[#E23D5B]/40 active:scale-[0.98]'
                      : 'cursor-not-allowed bg-[#241A1F] text-[#7A7276] border border-[#3A2A30]'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {activeOptionObj && totalPrice !== null
                      ? `Add to Order • £${totalPrice.toFixed(2)}`
                      : 'Select an Option'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

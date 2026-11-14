import React, { useState, useEffect } from 'react';
import { ClassicDishPricing } from '../../types';
import { DishVisualMeta } from '../../utils/menuImageResolver';
import { X, Check, Plus, Minus, Wine, AlertCircle } from 'lucide-react';

export interface ClassicDishModalInfo {
  pricing: ClassicDishPricing;
  description: string;
  visualMeta: DishVisualMeta;
}

export interface ClassicDishSelection {
  option: string;
  price: number;
  quantity: number;
}

interface ClassicDishModalProps {
  isOpen: boolean;
  dish: ClassicDishModalInfo | null;
  isAdmin?: boolean;
  onClose: () => void;
  onConfirm: (selections: ClassicDishSelection[]) => void;
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
  // Maps option key ('chicken', 'lamb', etc.) -> selected quantity (>= 1 when selected)
  const [optionQuantities, setOptionQuantities] = useState<Record<string, number>>({});

  // Always start with NO pre-selected option when opening a dish
  useEffect(() => {
    if (isOpen && dish) {
      setOptionQuantities({});
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

  const availablePrices = options
    .map((o) => o.price)
    .filter((p): p is number => p !== null);
  const minPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : 0;
  const maxPrice = availablePrices.length > 0 ? Math.max(...availablePrices) : 0;
  const priceRangeText =
    minPrice === maxPrice
      ? `£${minPrice.toFixed(2)}`
      : `£${minPrice.toFixed(2)} – £${maxPrice.toFixed(2)}`;

  const toggleOption = (opt: ClassicOptionRow) => {
    if (opt.price === null) return;
    setOptionQuantities((prev) => {
      if ((prev[opt.key] || 0) > 0) {
        const next = { ...prev };
        delete next[opt.key];
        return next;
      }
      return { ...prev, [opt.key]: 1 };
    });
  };

  const adjustOptionQty = (optKey: string, delta: number) => {
    setOptionQuantities((prev) => {
      const nextQty = (prev[optKey] || 0) + delta;
      if (nextQty <= 0) {
        const next = { ...prev };
        delete next[optKey];
        return next;
      }
      return { ...prev, [optKey]: nextQty };
    });
  };

  const activeSelections: ClassicDishSelection[] = options
    .filter((opt) => opt.price !== null && (optionQuantities[opt.key] || 0) > 0)
    .map((opt) => ({
      option: opt.label,
      price: opt.price as number,
      quantity: optionQuantities[opt.key],
    }));

  const totalSelectedItems = activeSelections.reduce((sum, s) => sum + s.quantity, 0);
  const totalSelectedPrice = activeSelections.reduce(
    (sum, s) => sum + s.price * s.quantity,
    0
  );

  const handleConfirm = () => {
    if (activeSelections.length === 0) return;
    onConfirm(activeSelections);
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
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-[#F5B8C3] block font-mono">
                {totalSelectedItems > 0
                  ? `${totalSelectedItems} item${totalSelectedItems > 1 ? 's' : ''} selected`
                  : 'Price Range'}
              </span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-white">
                {totalSelectedItems > 0 ? `£${totalSelectedPrice.toFixed(2)}` : priceRangeText}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs sm:text-sm text-[#D4CDC5] leading-relaxed">
            {description}
          </p>

          {/* Multi-Option Selection Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wider text-[#F5B8C3] font-semibold">
                Select Options *
              </span>
              <span className="text-[11px] text-[#A59E98]">
                Select 1 or more • adjust qty
              </span>
            </div>

            <div className="space-y-2">
              {options.map((option) => {
                const isAvailable = option.price !== null;
                const qty = optionQuantities[option.key] || 0;
                const isSelected = isAvailable && qty > 0;

                return (
                  <div
                    key={option.key}
                    role={isAvailable ? 'button' : undefined}
                    tabIndex={isAvailable ? 0 : -1}
                    aria-disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) toggleOption(option);
                    }}
                    onKeyDown={(e) => {
                      if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        toggleOption(option);
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
                      {/* Multi-Select Checkbox Indicator */}
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                          !isAvailable
                            ? 'bg-[#140F12] border-[#2D2228]'
                            : isSelected
                            ? 'bg-[#800020] border-[#E23D5B] text-white'
                            : 'bg-[#140F12] border-[#4A3840] text-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <span
                          className={`font-semibold text-sm block ${
                            !isAvailable
                              ? 'text-[#7A7276] line-through'
                              : 'text-white'
                          }`}
                        >
                          {option.label}
                        </span>
                        {isAvailable && option.price !== null && (
                          <span className="text-[11px] font-mono text-[#A59E98]">
                            £{option.price.toFixed(2)} each
                          </span>
                        )}
                      </div>
                    </div>

                    {!isAvailable ? (
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7276] italic">
                        Not Available
                      </span>
                    ) : isSelected && option.price !== null ? (
                      <div
                        className="flex items-center space-x-2.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1.5 bg-[#140F12] rounded-lg px-2 py-1 border border-[#E23D5B]/50">
                          <button
                            type="button"
                            onClick={() => adjustOptionQty(option.key, -1)}
                            className="p-0.5 text-[#ABA29B] hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label={`Decrease ${option.label} quantity`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold text-xs min-w-5 text-center text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustOptionQty(option.key, 1)}
                            className="p-0.5 text-[#ABA29B] hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label={`Increase ${option.label} quantity`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-mono text-sm font-bold text-[#F5B8C3] min-w-[56px] text-right">
                          £{(option.price * qty).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-sm font-bold text-[#E2DDD7]">
                        £{option.price?.toFixed(2)}
                      </span>
                    )}
                  </div>
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

        {/* Sticky Footer: Selection Summary & Add to Order */}
        <div className="p-4 sm:p-5 border-t border-[#2D2228] bg-[#140E12] space-y-2.5 shrink-0">
          {isAdmin ? (
            <div className="w-full py-3 px-4 rounded-xl border border-[#A51C30]/40 bg-[#1A1418] text-center text-xs text-[#E2DDD7]">
              <span className="font-semibold text-white">Administrator Preview Mode:</span> Food ordering and checkout are disabled for admin accounts.
            </div>
          ) : (
            <>
              {activeSelections.length === 0 ? (
                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-amber-300/90">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Select one or more options above, then choose your quantities.</span>
                </div>
              ) : (
                <div className="text-[11px] text-[#F5B8C3] text-center font-mono">
                  {activeSelections
                    .map((s) => `${s.quantity}x ${s.option} (£${(s.price * s.quantity).toFixed(2)})`)
                    .join(' • ')}
                </div>
              )}

              <button
                type="button"
                disabled={activeSelections.length === 0}
                onClick={handleConfirm}
                className={`w-full py-3 px-4 sm:px-5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2 ${
                  activeSelections.length > 0
                    ? 'cursor-pointer shadow-xl bg-gradient-to-r from-[#800020] to-[#A51C30] hover:from-[#9B1130] hover:to-[#B3243C] text-white border border-[#E23D5B]/40 active:scale-[0.98]'
                    : 'cursor-not-allowed bg-[#241A1F] text-[#7A7276] border border-[#3A2A30]'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {activeSelections.length > 0
                    ? `Add ${totalSelectedItems > 1 ? `${totalSelectedItems} Items ` : ''}to Order • £${totalSelectedPrice.toFixed(2)}`
                    : 'Select Option(s)'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

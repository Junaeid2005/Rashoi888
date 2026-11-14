import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Minus, Sparkles, Utensils } from 'lucide-react';

export const CHUTNEY_UNIT_PRICE = 0.90;

export interface PapadamDishInfo {
  name: string;
  price: number;
  categoryName?: string;
  menuItemId?: string;
  initialQty?: number;
}

export interface SelectedChutneyOrder {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PapadamChutneyModalProps {
  isOpen: boolean;
  dish: PapadamDishInfo | null;
  onClose: () => void;
  onConfirm: (papadamQty: number, selectedChutneys: SelectedChutneyOrder[]) => void;
}

export const CHUTNEY_OPTIONS = [
  {
    id: 'mango',
    name: 'Mango Chutney',
    badge: 'Sweet & Tangy',
    emoji: '🥭',
    price: CHUTNEY_UNIT_PRICE,
    description: 'Slow-simmered sweet mango relish infused with gentle aromatic spices.',
  },
  {
    id: 'pickle',
    name: 'Pickle Chutney',
    badge: 'Spicy & Zesty',
    emoji: '🥒',
    price: CHUTNEY_UNIT_PRICE,
    description: 'Traditional Punjabi-style tart and tangy mixed vegetable pickle.',
  },
  {
    id: 'onion',
    name: 'Onion Chutney',
    badge: 'Crisp & Spiced',
    emoji: '🧅',
    price: CHUTNEY_UNIT_PRICE,
    description: 'Finely chopped crunchy red onions tossed with coriander and chaat masala.',
  },
  {
    id: 'mint',
    name: 'Mint Sauce',
    badge: 'Cooling Yoghurt',
    emoji: '🌿',
    price: CHUTNEY_UNIT_PRICE,
    description: 'Smooth, refreshing strained yoghurt with freshly crushed garden mint.',
  },
];

export const isPapadamDish = (name: string): boolean => {
  if (!name) return false;
  const n = name.toLowerCase().trim();
  return (
    n.includes('papadam') ||
    n.includes('papadum') ||
    n.includes('popadom') ||
    n.includes('poppadom') ||
    n.includes('papad')
  );
};

export const PapadamChutneyModal: React.FC<PapadamChutneyModalProps> = ({
  isOpen,
  dish,
  onClose,
  onConfirm,
}) => {
  const [chutneyQuantities, setChutneyQuantities] = useState<Record<string, number>>({});
  const [isNoneSelected, setIsNoneSelected] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  // Reset or initialize when opened
  useEffect(() => {
    if (isOpen) {
      setChutneyQuantities({});
      setIsNoneSelected(false);
      setQuantity(dish?.initialQty && dish.initialQty > 0 ? dish.initialQty : 1);
    }
  }, [isOpen, dish]);

  if (!isOpen || !dish) return null;

  const toggleChutney = (chutneyId: string) => {
    setIsNoneSelected(false);
    setChutneyQuantities((prev) => {
      const current = prev[chutneyId] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[chutneyId];
        return next;
      }
      return { ...prev, [chutneyId]: 1 };
    });
  };

  const adjustChutneyQty = (chutneyId: string, delta: number) => {
    setIsNoneSelected(false);
    setChutneyQuantities((prev) => {
      const nextQty = (prev[chutneyId] || 0) + delta;
      if (nextQty <= 0) {
        const next = { ...prev };
        delete next[chutneyId];
        return next;
      }
      return { ...prev, [chutneyId]: nextQty };
    });
  };

  const handleSelectAll = () => {
    setIsNoneSelected(false);
    setChutneyQuantities((prev) => {
      const next: Record<string, number> = {};
      CHUTNEY_OPTIONS.forEach((c) => {
        next[c.id] = prev[c.id] && prev[c.id] > 0 ? prev[c.id] : 1;
      });
      return next;
    });
  };

  const handleSelectNone = () => {
    setChutneyQuantities({});
    setIsNoneSelected(true);
  };

  const selectedChutneysList: SelectedChutneyOrder[] = CHUTNEY_OPTIONS.filter(
    (c) => (chutneyQuantities[c.id] || 0) > 0
  ).map((c) => ({
    id: c.id,
    name: c.name,
    price: c.price,
    quantity: chutneyQuantities[c.id],
  }));

  const totalChutneyCount = selectedChutneysList.reduce((sum, c) => sum + c.quantity, 0);
  const chutneysSubtotal = selectedChutneysList.reduce(
    (sum, c) => sum + c.price * c.quantity,
    0
  );
  const papadamSubtotal = dish.price * quantity;
  const totalPrice = papadamSubtotal + chutneysSubtotal;

  const handleConfirm = () => {
    onConfirm(quantity, isNoneSelected ? [] : selectedChutneysList);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-2xl overflow-hidden border border-[#A51C30]/50 bg-[#140F12] text-white shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#2D2228] bg-gradient-to-r from-[#2B1019] via-[#1D1419] to-[#2B1019] relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-[#ABA29B] hover:text-white hover:bg-[#800020] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-[#F5B8C3] bg-[#800020]/60 border border-[#E23D5B]/30 mb-2">
            <Sparkles className="w-3 h-3 text-[#E23D5B]" />
            <span>Papadam Accompaniments</span>
          </div>

          <h3 className="font-serif text-2xl font-bold text-white flex items-center justify-between pr-8">
            <span>{dish.name}</span>
            <span className="font-mono text-xl text-[#F5B8C3]">£{dish.price.toFixed(2)}</span>
          </h3>

          <p className="text-xs text-[#E2DDD7] mt-1 leading-relaxed">
            Choose any Chutneys & Sauces below (<strong className="text-[#F5B8C3]">£{CHUTNEY_UNIT_PRICE.toFixed(2)} each</strong>), or select <em>None</em> for plain Papadam.
          </p>
        </div>

        {/* Scrollable Options List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Quick Preset Buttons */}
          <div className="flex items-center justify-between gap-2 pb-1">
            <span className="text-[11px] uppercase tracking-wider text-[#ABA29B] font-semibold">
              Chutneys & Sauces (£{CHUTNEY_UNIT_PRICE.toFixed(2)} each):
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                  selectedChutneysList.length === 4
                    ? 'bg-[#800020] text-white border-[#E23D5B]'
                    : 'bg-[#1F181C] text-[#D4CDC5] hover:text-white border-[#3A2A30]'
                }`}
              >
                ✓ All 4 (+£{(CHUTNEY_UNIT_PRICE * 4).toFixed(2)})
              </button>
              <button
                type="button"
                onClick={handleSelectNone}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                  isNoneSelected
                    ? 'bg-[#800020] text-white border-[#E23D5B]'
                    : 'bg-[#1F181C] text-[#D4CDC5] hover:text-white border-[#3A2A30]'
                }`}
              >
                ✕ None (Plain)
              </button>
            </div>
          </div>

          {/* 4 Chutney Cards */}
          <div className="space-y-2.5">
            {CHUTNEY_OPTIONS.map((chutney) => {
              const qty = chutneyQuantities[chutney.id] || 0;
              const isChecked = qty > 0;

              return (
                <div
                  key={chutney.id}
                  onClick={() => toggleChutney(chutney.id)}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-gradient-to-r from-[#2A151F] to-[#1F141A] border-[#E23D5B] shadow-md shadow-[#800020]/20'
                      : 'bg-[#1A1418] border-[#2D2228] hover:border-[#800020]/60 hover:bg-[#20181D]'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Visual Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                        isChecked
                          ? 'bg-[#800020] border-[#E23D5B] text-white'
                          : 'bg-[#140F12] border-[#4A3840] text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <span className="text-xl shrink-0">{chutney.emoji}</span>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                        <h4 className="font-semibold text-sm text-white">
                          {chutney.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-[#2D1A22] text-[#F5B8C3] font-mono border border-[#800020]/30">
                          {chutney.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A59E98] mt-0.5 leading-snug">
                        {chutney.description}
                      </p>
                    </div>
                  </div>

                  {isChecked ? (
                    <div
                      className="flex items-center space-x-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1.5 bg-[#140F12] rounded-lg px-2 py-1 border border-[#E23D5B]/50">
                        <button
                          type="button"
                          onClick={() => adjustChutneyQty(chutney.id, -1)}
                          className="p-0.5 text-[#ABA29B] hover:text-white cursor-pointer"
                          aria-label={`Decrease ${chutney.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs min-w-4 text-center text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustChutneyQty(chutney.id, 1)}
                          className="p-0.5 text-[#ABA29B] hover:text-white cursor-pointer"
                          aria-label={`Increase ${chutney.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#F5B8C3] min-w-[46px] text-right">
                        £{(chutney.price * qty).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs font-bold text-[#E2DDD7] shrink-0">
                      +£{chutney.price.toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}

            {/* None Option Card */}
            <div
              onClick={handleSelectNone}
              className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isNoneSelected
                  ? 'bg-gradient-to-r from-[#2A151F] to-[#1F141A] border-[#E23D5B] shadow-md'
                  : 'bg-[#1A1418] border-[#2D2228] hover:border-[#800020]/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                    isNoneSelected
                      ? 'bg-[#800020] border-[#E23D5B] text-white'
                      : 'bg-[#140F12] border-[#4A3840] text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-lg">🚫</span>
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    None (No Chutney / Sauce)
                  </h4>
                  <p className="text-[11px] text-[#A59E98] mt-0.5">
                    Crispy plain Papadam without any accompanying sauces.
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-mono font-bold ${isNoneSelected ? 'text-[#F5B8C3]' : 'text-[#858078]'}`}>
                £0.00
              </span>
            </div>
          </div>

          {/* Current Selection Summary Callout */}
          <div className="p-3 rounded-xl bg-[#1A1216] border border-[#800020]/40 flex items-start space-x-2.5">
            <Utensils className="w-4 h-4 text-[#E23D5B] shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-0.5">
              <div>
                <span className="text-[#A59E98]">Papadam: </span>
                <span className="text-white font-semibold">
                  {quantity}x £{dish.price.toFixed(2)} = £{papadamSubtotal.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#A59E98]">Chutneys / Sauces: </span>
                {isNoneSelected ? (
                  <span className="text-zinc-300 font-semibold">Plain Papadam (No Chutney • £0.00)</span>
                ) : selectedChutneysList.length > 0 ? (
                  <span className="text-[#F5B8C3] font-semibold">
                    {selectedChutneysList.map((c) => `${c.quantity}x ${c.name}`).join(', ')} (£{chutneysSubtotal.toFixed(2)})
                  </span>
                ) : (
                  <span className="text-amber-300 font-medium italic">
                    None chosen yet (defaults to Plain • £0.00)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Papadam Quantity Stepper & Add to Order Button */}
        <div className="p-4 sm:p-5 border-t border-[#2D2228] bg-[#140E12] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-[11px] text-[#A59E98] px-1">
            <span>Papadam Qty: <strong className="text-white">{quantity}</strong></span>
            {totalChutneyCount > 0 && (
              <span>
                Sauces: <strong className="text-[#F5B8C3]">{totalChutneyCount} (£{chutneysSubtotal.toFixed(2)})</strong>
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4">
            {/* Quantity Controls for Papadam */}
            <div className="flex items-center space-x-2.5 bg-[#1F181C] rounded-xl px-3 py-2 border border-[#3A2A30]">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-[#ABA29B] hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Decrease Papadam quantity"
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
                aria-label="Increase Papadam quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Confirm & Add Button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 px-5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xl bg-gradient-to-r from-[#800020] to-[#A51C30] hover:from-[#9B1130] hover:to-[#B3243C] text-white border border-[#E23D5B]/40 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>
                Add to Order • £{totalPrice.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { MenuCategory, MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getDishVisualMeta, DishVisualMeta } from '../../utils/menuImageResolver';
import {
  Plus,
  Minus,
  Leaf,
  Sparkles,
  Search,
  Check,
  Info,
  Eye,
  X,
  Utensils,
  Award,
  Wine
} from 'lucide-react';
import { PapadamChutneyModal, PapadamDishInfo, isPapadamDish } from './PapadamChutneyModal';

interface MenuPageProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
}

export const MenuPage: React.FC<MenuPageProps> = ({
  categories,
  menuItems,
}) => {
  const { addItem, items: cartItems, updateQuantity } = useCart();
  const { isAdmin } = useAuth();

  // Search & Navigation
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'chefs' | 'seafood'>('all');

  // Dish Detail Modal
  const [selectedDish, setSelectedDish] = useState<{
    item: MenuItem;
    meta: DishVisualMeta;
  } | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Papadam Chutney Customization Modal
  const [papadamModalDish, setPapadamModalDish] = useState<PapadamDishInfo | null>(null);

  // Success Toast
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Dismiss open modals when phone back button is pressed
  React.useEffect(() => {
    const handlePop = () => {
      if (papadamModalDish) {
        setPapadamModalDish(null);
      }
      if (selectedDish) {
        setSelectedDish(null);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [papadamModalDish, selectedDish]);

  const openDishModal = (dish: { item: MenuItem; meta: DishVisualMeta }) => {
    setSelectedDish(dish);
    setModalQuantity(1);
    window.history.pushState({ modal: 'dishModal', view: 'menu' }, '', window.location.hash);
  };

  const closeDishModal = () => {
    setSelectedDish(null);
    if (window.history.state?.modal === 'dishModal') {
      window.history.back();
    }
  };

  const openPapadamModal = (dish: PapadamDishInfo) => {
    setPapadamModalDish(dish);
    window.history.pushState({ modal: 'papadamModal', view: 'menu' }, '', window.location.hash);
  };

  const closePapadamModal = () => {
    setPapadamModalDish(null);
    if (window.history.state?.modal === 'papadamModal') {
      window.history.back();
    }
  };

  // Visible Categories
  const visibleCategories = useMemo(() => {
    return categories.filter((c) => c.isVisible);
  }, [categories]);

  // Counts per Category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    menuItems.forEach((item) => {
      if (item.isAvailable) {
        counts.all = (counts.all || 0) + 1;
        counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [menuItems]);

  // Enriched & Filtered Items
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        if (!item.isAvailable) return false;

        // Category Filter
        if (activeCategoryId !== 'all' && item.categoryId !== activeCategoryId) {
          return false;
        }

        const nameLower = item.name.toLowerCase();

        // Dietary Filter
        if (dietaryFilter === 'veg' && !item.isVegetarian) return false;
        if (dietaryFilter === 'chefs' && !item.isChefsSpecial && !item.isFeatured) return false;
        if (dietaryFilter === 'seafood') {
          const isSeafood =
            nameLower.includes('prawn') ||
            nameLower.includes('seabass') ||
            nameLower.includes('fish') ||
            nameLower.includes('trout') ||
            nameLower.includes('chada') ||
            nameLower.includes('mass');
          if (!isSeafood) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = nameLower.includes(q);
          const matchesDesc = item.description?.toLowerCase().includes(q);
          const matchesCat = item.categoryName.toLowerCase().includes(q);
          return matchesName || matchesDesc || matchesCat;
        }

        return true;
      })
      .map((item) => ({
        ...item,
        visualMeta: getDishVisualMeta(item),
      }));
  }, [menuItems, activeCategoryId, dietaryFilter, searchQuery]);

  const handleAddDish = (
    name: string,
    price: number,
    category: string,
    qty: number = 1,
    condiments?: string[]
  ) => {
    addItem({
      name,
      price,
      categoryName: category,
      quantity: qty,
      selectedCondiments: condiments,
    });
    const condLabel = condiments && condiments.length > 0 && !condiments.includes('None (Plain Papadam)')
      ? ` (${condiments.join(', ')})`
      : '';
    setAddedNotice(`Added ${qty > 1 ? `${qty}x ` : ''}"${name}"${condLabel} to order`);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  const handleInitiateAddDish = (dish: MenuItem, qty: number = 1) => {
    if (isPapadamDish(dish.name)) {
      openPapadamModal({
        name: dish.name,
        price: dish.price,
        categoryName: dish.categoryName,
        initialQty: qty,
      });
      return;
    }
    handleAddDish(dish.name, dish.price, dish.categoryName, qty);
  };

  const getItemCartQty = (itemName: string) => {
    return cartItems
      .filter((ci) => ci.name === itemName)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  const activeCategoryObj = visibleCategories.find((c) => c.id === activeCategoryId);

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#070707] text-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= PAGE HEADER ================= */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs uppercase tracking-[0.28em] font-semibold mb-3 border border-[#800020]/40 bg-[#141414] text-[#F5B8C3]">
            <Sparkles className="w-3.5 h-3.5 text-[#A51C30]" />
            <span>FINE INDIAN CUISINE</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#FFFFFF]">
            Explore Our Menu
          </h1>
          <div className="w-20 h-0.5 bg-[#800020] mx-auto my-4" />
          <p className="text-sm sm:text-base text-[#D4CDC5] font-light leading-relaxed">
            Experience traditional culinary excellence with carefully sourced spices, fresh herbs, and artisanal clay-oven grilling in Windlesham, Surrey.
          </p>
        </div>

        {/* ================= ALLERGY BANNER ================= */}
        <div className="mb-8 p-4 rounded-xl border border-[#800020]/30 bg-[#121212] flex items-center justify-between text-xs sm:text-sm text-[#D4CDC5] max-w-4xl mx-auto shadow-md">
          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5 text-[#A51C30] shrink-0" />
            <span>
              <strong className="text-white font-semibold">Allergies & Dietary Info:</strong> Some dishes contain dairy, gluten or nuts. Please inform our staff of any dietary preferences.
            </span>
          </div>
        </div>

        {/* ================= SEARCH & DIETARY FILTER BAR ================= */}
        <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#A51C30] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Tikka, Biriyani, Rogan Josh, Naan)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#800020]/30 bg-[#121212] focus:border-[#A51C30] text-sm text-[#FFFFFF] placeholder-[#9E9790] focus:outline-none transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                dietaryFilter === 'all'
                  ? 'bg-[#800020] text-white shadow-md'
                  : 'bg-[#141414] text-[#D4CDC5] border border-[#222222] hover:border-[#800020]/50'
              }`}
            >
              All Dishes
            </button>

            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-[#141414] text-emerald-400 border border-emerald-950 hover:border-emerald-600'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Vegetarian</span>
            </button>

            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'chefs' ? 'all' : 'chefs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                dietaryFilter === 'chefs'
                  ? 'bg-[#800020] text-white shadow-md'
                  : 'bg-[#141414] text-[#F5B8C3] border border-[#222222] hover:border-[#800020]/50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#A51C30]" />
              <span>Chef's Picks</span>
            </button>

            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'seafood' ? 'all' : 'seafood')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                dietaryFilter === 'seafood'
                  ? 'bg-sky-700 text-white shadow-md'
                  : 'bg-[#141414] text-sky-400 border border-sky-950 hover:border-sky-600'
              }`}
            >
              <span>🌊 Seafood</span>
            </button>
          </div>
        </div>

        {/* ================= CATEGORY TABS (STICKY / HORIZONTAL SCROLL) ================= */}
        <div className="mb-10 sticky top-16 z-30 py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-[#222222] bg-[#070707]/95 backdrop-blur-md">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => setActiveCategoryId('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeCategoryId === 'all'
                  ? 'bg-[#800020] text-white shadow-lg'
                  : 'bg-[#141414] text-[#D4CDC5] hover:text-white border border-[#222222]'
              }`}
            >
              <span>All Dishes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/30">
                {categoryCounts.all || menuItems.length}
              </span>
            </button>

            {visibleCategories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#800020] text-white shadow-lg'
                      : 'bg-[#141414] text-[#D4CDC5] hover:text-white border border-[#222222]'
                  }`}
                >
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/30">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Description Banner if active */}
        {activeCategoryObj && activeCategoryObj.description && (
          <div className="mb-8 p-5 rounded-xl border-l-4 border-[#800020] bg-[#121212] text-left shadow-md">
            <h3 className="font-serif text-xl font-bold text-[#FFFFFF]">
              {activeCategoryObj.name}
            </h3>
            <p className="text-xs sm:text-sm text-[#D4CDC5] mt-1 font-light italic">
              "{activeCategoryObj.description}"
            </p>
          </div>
        )}

        {/* ================= NORMAL MENU ITEMS GRID (PHOTO + DETAILS + ORDER) ================= */}
        <div>
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-[#222222] bg-[#121212] text-[#D4CDC5]">
              <Utensils className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <p className="text-lg font-serif">No dishes found matching your search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDietaryFilter('all');
                  setActiveCategoryId('all');
                }}
                className="mt-4 px-5 py-2.5 bg-[#800020] text-white text-xs uppercase tracking-wider font-semibold rounded-lg shadow cursor-pointer hover:bg-[#9B1130] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredItems.map((item) => {
                const cartQty = getItemCartQty(item.name);

                return (
                  <div
                    key={item.id}
                    className="dish-card rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xl"
                  >
                    {/* Dish Culinary Photo */}
                    <div
                      onClick={() => setSelectedDish({ item, meta: item.visualMeta })}
                      className="relative h-48 overflow-hidden cursor-pointer bg-[#0D0D0D]"
                    >
                      <img
                        src={item.visualMeta.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover object-center transform group-hover:scale-106 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/30" />

                      {/* Overlaid Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-[10px] tracking-widest uppercase font-mono font-semibold px-2.5 py-0.5 rounded-full bg-black/75 text-[#FFFFFF] border border-[#800020]/40 backdrop-blur-sm">
                          {item.categoryName}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          {item.isVegetarian && (
                            <span
                              className="bg-emerald-950/80 text-emerald-400 p-1 rounded-full border border-emerald-500/40 backdrop-blur-sm"
                              title="Vegetarian"
                            >
                              <Leaf className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {item.isChefsSpecial && (
                            <span
                              className="bg-[#800020]/90 text-white p-1 rounded-full border border-[#A51C30]/50 backdrop-blur-sm"
                              title="Chef's Special"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Overlaid Price */}
                      <div className="absolute bottom-3 right-3">
                        <span className="font-serif text-xl font-bold text-white bg-black/80 px-2.5 py-0.5 rounded-md border border-[#800020]/40 shadow">
                          £{item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Hover Trigger */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <span className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider flex items-center space-x-1 shadow-md">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </span>
                      </div>
                    </div>

                    {/* Dish Text Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4
                          onClick={() => openDishModal({ item, meta: item.visualMeta })}
                          className="font-serif text-lg font-bold text-[#FFFFFF] group-hover:text-[#F5B8C3] transition-colors cursor-pointer text-left"
                        >
                          {item.name}
                        </h4>

                        <p className="text-xs text-[#D4CDC5] mt-2 font-light leading-relaxed line-clamp-2 text-left">
                          {item.description || 'Authentic dish handcrafted with aromatic Indian spices.'}
                        </p>
                      </div>

                      {/* Bottom Direct Order Action */}
                      <div className="mt-5 pt-3.5 border-t border-[#222222] flex items-center justify-between gap-3">
                        {isAdmin ? (
                          <button
                            onClick={() => openDishModal({ item, meta: item.visualMeta })}
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer bg-[#1A1A1A] hover:bg-[#252525] text-[#D4CDC5] hover:text-white border border-[#333333]"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#E23D5B]" />
                            <span>View Recipe & Details</span>
                          </button>
                        ) : cartQty > 0 ? (
                          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#800020]/50 bg-[#1A1A1A] w-full justify-between">
                            <span className="text-xs font-mono font-semibold text-white">
                              In Order: {cartQty}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  const matchingLines = cartItems.filter((ci) => ci.name === item.name);
                                  const lastLine = matchingLines[matchingLines.length - 1];
                                  if (lastLine) updateQuantity(lastLine.id, lastLine.quantity - 1);
                                }}
                                className="p-1 rounded bg-[#252525] hover:bg-[#800020] text-white transition-colors cursor-pointer"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleInitiateAddDish(item)}
                                className="p-1 rounded bg-[#252525] hover:bg-[#800020] text-white transition-colors cursor-pointer"
                                aria-label="Increase"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInitiateAddDish(item)}
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md bg-[#800020] hover:bg-[#9B1130] text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>
                              {isPapadamDish(item.name) ? 'Choose Chutneys & Order' : 'Add to Order'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ================= INTERACTIVE DISH DETAIL MODAL ================= */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full rounded-2xl overflow-hidden border border-[#800020]/40 bg-[#121212] text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={closeDishModal}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-[#800020] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* High-Resolution Photo */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              <img
                src={selectedDish.meta.imageUrl}
                alt={selectedDish.item.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[10px] tracking-widest uppercase font-mono text-[#F5B8C3] font-semibold">
                  {selectedDish.item.categoryName}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {selectedDish.item.name}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <span className="font-serif text-2xl font-bold text-white">
                  £{selectedDish.item.price.toFixed(2)}
                </span>
                {selectedDish.item.isVegetarian && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-950 text-emerald-400 border border-emerald-600/40">
                    🌱 Vegetarian
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-[#D4CDC5]">
                {selectedDish.item.description ||
                  'Traditional Indian specialty slowly cooked with fresh ground spices, herbs, garlic, and clay-oven aromatics.'}
              </p>

              {/* Pairing Note */}
              <div className="p-3 rounded-xl border border-[#800020]/30 bg-[#171717] flex items-center space-x-3 text-xs text-[#F5B8C3]">
                <Wine className="w-4 h-4 shrink-0 text-[#A51C30]" />
                <span>
                  <strong>Chef’s Recommendation:</strong> {selectedDish.meta.pairing}
                </span>
              </div>

              {/* Quantity Stepper & Add to Cart */}
              <div className="pt-4 flex items-center justify-between gap-4">
                {isAdmin ? (
                  <div className="w-full py-3 px-4 rounded-xl border border-[#A51C30]/40 bg-[#1A1418] text-center text-xs text-[#E2DDD7]">
                    <span className="font-semibold text-white">Administrator Preview Mode:</span> Food ordering and checkout are disabled for admin accounts.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl border border-[#800020]/30 bg-[#1A1A1A]">
                      <button
                        onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        className="p-1 rounded hover:bg-white/10 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono font-bold text-sm min-w-6 text-center">
                        {modalQuantity}
                      </span>
                      <button
                        onClick={() => setModalQuantity(modalQuantity + 1)}
                        className="p-1 rounded hover:bg-white/10 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (isPapadamDish(selectedDish.item.name)) {
                          const item = selectedDish.item;
                          const qty = modalQuantity;
                          closeDishModal();
                          openPapadamModal({
                            name: item.name,
                            price: item.price,
                            categoryName: item.categoryName,
                            initialQty: qty,
                          });
                          return;
                        }
                        handleAddDish(
                          selectedDish.item.name,
                          selectedDish.item.price,
                          selectedDish.item.categoryName,
                          modalQuantity
                        );
                        closeDishModal();
                      }}
                      className="flex-1 py-3 px-6 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg bg-[#800020] hover:bg-[#9B1130] text-white"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {isPapadamDish(selectedDish.item.name)
                          ? `Choose Chutneys & Order • £${(selectedDish.item.price * modalQuantity).toFixed(2)}`
                          : `Add to Order • £${(selectedDish.item.price * modalQuantity).toFixed(2)}`}
                      </span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= FLOATING ADDED TO ORDER TOAST ================= */}
      {addedNotice && (
        <div className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl font-semibold text-xs tracking-wider uppercase flex items-center space-x-2 bg-[#800020] text-white border border-[#A51C30]/60 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* ================= PAPADAM CHUTNEY & SAUCE CUSTOMIZATION MODAL ================= */}
      <PapadamChutneyModal
        isOpen={!!papadamModalDish}
        dish={papadamModalDish}
        onClose={closePapadamModal}
        onConfirm={(qty, selectedCondiments) => {
          if (papadamModalDish) {
            handleAddDish(
              papadamModalDish.name,
              papadamModalDish.price,
              papadamModalDish.categoryName || 'Sundries',
              qty,
              selectedCondiments
            );
          }
          closePapadamModal();
        }}
      />

    </div>
  );
};

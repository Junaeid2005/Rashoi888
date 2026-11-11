import React from 'react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getDishVisualMeta } from '../../utils/menuImageResolver';
import { Plus, Leaf, Sparkles, ArrowRight } from 'lucide-react';

interface SignatureDishesProps {
  dishes: MenuItem[];
  onViewMenu: () => void;
}

export const SignatureDishes: React.FC<SignatureDishesProps> = ({ dishes, onViewMenu }) => {
  const { addItem } = useCart();
  const { isAdmin } = useAuth();

  // Pick signature featured dishes
  const featured = dishes.filter((d) => d.isFeatured || d.isChefsSpecial).slice(0, 6);
  const displayDishes = featured.length > 0 ? featured : dishes.slice(0, 6);

  return (
    <section className="py-24 bg-[#120E10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.28em] text-[#E23D5B] font-semibold font-sans">
            EXECUTIVE SELECTIONS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight mt-2">
            Discover Our Signature Dishes
          </h2>
          <div className="w-16 h-0.5 bg-[#800020] mx-auto my-4" />
          <p className="text-[#E2DDD7] text-sm sm:text-base font-normal">
            Explore a selection of flavours crafted with authentic spices and traditional clay-oven techniques.
          </p>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayDishes.map((dish) => {
            const imgSrc = getDishVisualMeta(dish).imageUrl;

            return (
              <div
                key={dish.id}
                className="group rounded-2xl overflow-hidden bg-[#1F181C] border border-[#A51C30]/25 hover:border-[#E23D5B]/60 transition-all duration-300 shadow-xl flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-[#161013]">
                    <img
                      src={imgSrc}
                      alt={dish.name}
                      className="w-full h-full object-cover transform group-hover:scale-106 transition-transform duration-500 brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F181C] via-transparent to-black/30" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {dish.isVegetarian && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">
                          <Leaf className="w-3 h-3" />
                          <span>Vegetarian</span>
                        </span>
                      )}
                      {dish.isChefsSpecial && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#800020]/90 text-white border border-[#A51C30]/50 backdrop-blur-sm">
                          <Sparkles className="w-3 h-3" />
                          <span>Chef's Special</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="font-serif text-xl font-bold text-white bg-black/80 px-3 py-1 rounded-lg border border-[#A51C30]/40 shadow">
                        £{dish.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] tracking-wider uppercase text-[#E23D5B] font-mono font-semibold">
                        {dish.categoryName}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#FFFFFF] group-hover:text-[#F5B8C3] transition-colors">
                      {dish.name}
                    </h3>

                    {dish.description && (
                      <p className="mt-2 text-xs sm:text-sm text-[#E2DDD7] line-clamp-3 leading-relaxed font-normal">
                        {dish.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="px-6 pb-6 pt-2">
                  {!isAdmin ? (
                    <button
                      onClick={() => {
                        if (dish.name.toLowerCase().includes('papad')) {
                          onViewMenu();
                          return;
                        }
                        addItem({
                          menuItemId: dish.id,
                          name: dish.name,
                          categoryName: dish.categoryName,
                          price: dish.price,
                        });
                      }}
                      className="w-full py-2.5 px-4 bg-[#800020] hover:bg-[#9B1130] text-[#FFFFFF] rounded-xl text-xs tracking-wider uppercase font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Order</span>
                    </button>
                  ) : (
                    <button
                      onClick={onViewMenu}
                      className="w-full py-2.5 px-4 bg-[#161013] border border-[#A51C30]/40 text-[#D4CDC5] hover:text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Preview in Menu</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E23D5B]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Menu CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={onViewMenu}
            className="nav-burgundy-btn inline-flex items-center space-x-2 px-8 py-4 rounded-xl text-xs tracking-widest uppercase font-semibold shadow-xl"
          >
            <span>View Complete Restaurant Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

import React from 'react';
import { HomepageSettings, RestaurantInfo } from '../../types';
import { Sparkles, Utensils, Award } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/imagePath';

interface AboutPageProps {
  settings: HomepageSettings;
  info: RestaurantInfo;
  onBookTable: () => void;
  onViewMenu: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  settings,
  info,
  onBookTable,
  onViewMenu,
}) => {
  return (
    <div className="pt-28 pb-24 bg-[#120E10] min-h-screen text-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.28em] text-[#E23D5B] font-semibold font-sans">
            OUR STORY & TRADITION
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#FFFFFF] tracking-tight mt-2">
            The Indian Kitchen
          </h1>
          <div className="w-16 h-0.5 bg-[#800020] mx-auto my-4" />
          <p className="text-[#E2DDD7] text-sm sm:text-base font-normal leading-relaxed">
            Centuries of culinary evolution brought to life at 58 Updown Hill, Windlesham.
          </p>
        </div>

        {/* Narrative & Image Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FFFFFF] leading-tight">
              A Taste of India's Rich Heritage
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-[#E2DDD7] font-normal leading-relaxed">
              <p>
                India is a land of culture and tradition, a land of many cuisines. This is not only due to its sheer size, but also due to the impact of various phases in her history.
              </p>
              <p>
                Rashoi or The Indian Kitchen has survived the impact over the centuries, has matured over the years and imbibed the best of all cultures.
              </p>
              <p>
                From the charcoal-fired clay tandoor pits of Punjab to the rich coastal curries of Bengal and the fragrant royal biriyanis of Hyderabad, each recipe on our menu reflects this rich tapestry of regional perfection.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={onBookTable}
                className="nav-burgundy-btn px-7 py-3.5 font-semibold text-xs tracking-widest uppercase rounded-xl shadow-lg cursor-pointer"
              >
                Book a Table
              </button>
              <button
                onClick={onViewMenu}
                className="px-7 py-3.5 border border-[#A51C30]/40 bg-[#1F181C] text-[#FFFFFF] hover:border-[#E23D5B] text-xs tracking-widest uppercase font-semibold rounded-xl transition-all cursor-pointer shadow"
              >
                Explore Menu
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-[#A51C30]/35 shadow-2xl bg-[#1F181C]">
              <img
                src={resolveAssetUrl(settings.introImageUrl, '/images/rashoi_interior_dining_1794139799818.jpg')}
                alt="Rashoi Dining Room Atmosphere"
                className="w-full h-[450px] object-cover object-center brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#181215]/95 backdrop-blur-md rounded-xl border border-[#A51C30]/35 shadow-lg">
                <p className="font-serif italic text-sm text-[#F5B8C3]">
                  "Crafting memorable dining memories for families, friends, and special occasions."
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Pillars of Rashoi Kitchen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/25 text-left shadow-lg">
            <Utensils className="w-8 h-8 text-[#E23D5B] mb-4" />
            <h3 className="font-serif text-xl font-bold text-[#FFFFFF] mb-2">Charcoal Tandoori Art</h3>
            <p className="text-xs sm:text-sm text-[#E2DDD7] leading-relaxed font-normal">
              We slow-marinate tender chicken, duck, prime lamb chops, and king prawns in natural yoghurt and whole spices before firing them in authentic clay ovens.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/25 text-left shadow-lg">
            <Sparkles className="w-8 h-8 text-[#E23D5B] mb-4" />
            <h3 className="font-serif text-xl font-bold text-[#FFFFFF] mb-2">Fresh Hand-Ground Spices</h3>
            <p className="text-xs sm:text-sm text-[#E2DDD7] leading-relaxed font-normal">
              No artificial colourings or shortcut pastes. We roast, grind, and temper green cardamoms, cinnamon quills, toasted cumin, and fenugreek daily.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/25 text-left shadow-lg">
            <Award className="w-8 h-8 text-[#E23D5B] mb-4" />
            <h3 className="font-serif text-xl font-bold text-[#FFFFFF] mb-2">Hospitality with Heart</h3>
            <p className="text-xs sm:text-sm text-[#E2DDD7] leading-relaxed font-normal">
              Our service team brings genuine warmth to your dining room experience, ensuring thoughtful wine pairings and tailored dietary accommodations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

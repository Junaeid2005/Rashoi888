import React from 'react';
import { HomepageSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Sparkles, MapPin, Utensils, ShieldAlert } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/imagePath';

interface HeroProps {
  settings: HomepageSettings;
  onBookTable: () => void;
  onExploreMenu: () => void;
  onGoToAdmin?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onBookTable,
  onExploreMenu,
  onGoToAdmin,
}) => {
  const { isAdmin } = useAuth();
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#120E10] pt-28 pb-16">
      
      {/* Background Image: Bright, appetizing, and clearly visible */}
      <div className="absolute inset-0 z-0">
        <img
          src={resolveAssetUrl(settings.heroImageUrl, '/images/rashoi_hero_cuisine_1794139786997.jpg')}
          alt="Exquisite Indian Cuisine at Rashoi Restaurant"
          className="w-full h-full object-cover object-center scale-102 transform duration-[10000ms] brightness-[0.88] contrast-[1.08] saturate-[1.12]"
        />
        {/* Soft ambient overlay ensuring both food visibility and centered text legibility */}
        <div className="absolute inset-0 bg-[#120E10]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120E10] via-transparent to-[#120E10]/50" />
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center flex flex-col items-center justify-center space-y-6">
        
        {/* Eyebrow Badge in Burgundy */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#A51C30]/50 bg-[#1F1418]/90 backdrop-blur-md shadow-lg shadow-[#800020]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#E23D5B]" />
          <span className="text-xs uppercase tracking-[0.28em] font-semibold text-[#FFFFFF]">
            {settings.heroEyebrow || 'AUTHENTIC INDIAN CUISINE'}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFFFFF] leading-[1.14] max-w-4xl">
          Discover the Art of <br className="hidden sm:inline" />
          <span className="burgundy-gradient-text italic font-normal">
            Traditional Indian
          </span>{' '}
          Flavours.
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg text-[#E2DDD7] max-w-2xl mx-auto font-normal leading-relaxed">
          {settings.heroSupportingText ||
            'Experience the richness of Indian cuisine, where traditional recipes, authentic spices and exceptional hospitality come together.'}
        </p>

        {/* CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-5 w-full sm:w-auto">
          {isAdmin ? (
            <>
              <button
                onClick={onGoToAdmin || onExploreMenu}
                className="nav-burgundy-btn px-8 py-4 font-semibold text-xs sm:text-sm tracking-widest uppercase rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer group shadow-xl w-full sm:w-auto"
              >
                <ShieldAlert className="w-4 h-4 text-[#F5B8C3]" />
                <span>Go to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={onExploreMenu}
                className="px-8 py-4 font-semibold text-xs sm:text-sm tracking-widest uppercase rounded-xl transition-all flex items-center justify-center cursor-pointer bg-[#20181D]/80 hover:bg-[#2C2128] text-[#FFFFFF] border border-[#A51C30]/50 shadow-md backdrop-blur-sm w-full sm:w-auto"
              >
                <span>Preview Menu</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onBookTable}
                className="nav-burgundy-btn px-8 py-4 font-semibold text-xs sm:text-sm tracking-widest uppercase rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer group shadow-xl w-full sm:w-auto"
              >
                <span>{settings.heroPrimaryBtnText || 'Book a Table'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={onExploreMenu}
                className="px-8 py-4 font-semibold text-xs sm:text-sm tracking-widest uppercase rounded-xl transition-all flex items-center justify-center cursor-pointer bg-[#20181D]/80 hover:bg-[#2C2128] text-[#FFFFFF] border border-[#A51C30]/50 shadow-md backdrop-blur-sm w-full sm:w-auto"
              >
                <span>
                  {settings.heroSecondaryBtnText === 'Explore Our Menu'
                    ? 'Explore Menu & Order'
                    : (settings.heroSecondaryBtnText || 'Explore Menu & Order')}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Address & Quick Info Banner */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#ABA29B] border-t border-[#A51C30]/25 max-w-xl mx-auto w-full">
          <div className="flex items-center space-x-2 text-left">
            <MapPin className="w-4 h-4 text-[#E23D5B] shrink-0" />
            <div>
              <p className="text-[#FFFFFF] font-medium">Location</p>
              <p>58 Updown Hill, Windlesham, Surrey</p>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-[#A51C30]/25" />
          <div className="flex items-center space-x-2 text-left">
            <Utensils className="w-4 h-4 text-[#E23D5B] shrink-0" />
            <div>
              <p className="text-[#FFFFFF] font-medium">Cuisine</p>
              <p>Authentic Charcoal Clay-Oven & Curries</p>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};

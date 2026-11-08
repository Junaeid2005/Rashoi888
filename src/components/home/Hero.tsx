import React from 'react';
import { HomepageSettings } from '../../types';
import { ArrowRight, Sparkles, MapPin, Utensils } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/imagePath';

interface HeroProps {
  settings: HomepageSettings;
  onBookTable: () => void;
  onExploreMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onBookTable,
  onExploreMenu,
}) => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#120E10] pt-28 pb-16">
      
      {/* Background Image: Bright, appetizing, and clearly visible */}
      <div className="absolute inset-0 z-0">
        <img
          src={resolveAssetUrl(settings.heroImageUrl, '/images/rashoi_hero_cuisine_1794139786997.jpg')}
          alt="Exquisite Indian Cuisine at Rashoi Restaurant"
          className="w-full h-full object-cover object-center scale-102 transform duration-[10000ms] brightness-[0.88] contrast-[1.08] saturate-[1.12]"
        />
        {/* Soft, non-muddy ambient overlay ensuring both clear food visibility and perfect text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#120E10]/92 via-[#120E10]/60 to-[#120E10]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120E10] via-transparent to-[#120E10]/40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Eyebrow Badge in Burgundy */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#A51C30]/50 bg-[#1F1418]/90 backdrop-blur-md shadow-lg shadow-[#800020]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#E23D5B]" />
              <span className="text-xs uppercase tracking-[0.28em] font-semibold text-[#FFFFFF]">
                {settings.heroEyebrow || 'AUTHENTIC INDIAN CUISINE'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFFFFF] leading-[1.14]">
              Discover the Art of <br />
              <span className="burgundy-gradient-text italic font-normal">
                Traditional Indian
              </span>{' '}
              Flavours.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#E2DDD7] max-w-xl font-normal leading-relaxed">
              {settings.heroSupportingText ||
                'Experience the richness of Indian cuisine, where traditional recipes, authentic spices and exceptional hospitality come together.'}
            </p>

            {/* CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-5">
              <button
                onClick={onBookTable}
                className="nav-burgundy-btn px-8 py-4 font-semibold text-xs sm:text-sm tracking-widest uppercase rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer group shadow-xl"
              >
                <span>{settings.heroPrimaryBtnText || 'Book a Table'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={onExploreMenu}
                className="px-8 py-4 font-semibold text-xs sm:text-sm tracking-widest uppercase rounded-xl transition-all flex items-center justify-center cursor-pointer bg-[#20181D]/80 hover:bg-[#2C2128] text-[#FFFFFF] border border-[#A51C30]/50 shadow-md backdrop-blur-sm"
              >
                <span>
                  {settings.heroSecondaryBtnText === 'Explore Our Menu'
                    ? 'Explore Menu & Order'
                    : (settings.heroSecondaryBtnText || 'Explore Menu & Order')}
                </span>
              </button>
            </div>

            {/* Address & Quick Info Banner */}
            <div className="pt-8 flex items-center space-x-6 text-xs text-[#ABA29B] border-t border-[#A51C30]/25">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#E23D5B]" />
                <div>
                  <p className="text-[#FFFFFF] font-medium">Location</p>
                  <p>58 Updown Hill, Windlesham, Surrey</p>
                </div>
              </div>
              <div className="h-8 w-px bg-[#A51C30]/25" />
              <div className="flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-[#E23D5B]" />
                <div>
                  <p className="text-[#FFFFFF] font-medium">Cuisine</p>
                  <p>Authentic Charcoal Clay-Oven & Curries</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Cinematic Showcase Frame */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative mx-auto max-w-md">
              
              {/* Subtle Burgundy Frame Decorative Glow */}
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-[#800020]/60 via-[#A51C30]/40 to-[#E23D5B]/50 blur-lg opacity-80" />
              
              <div className="relative rounded-2xl overflow-hidden border border-[#A51C30]/45 bg-[#20191D] shadow-2xl">
                <img
                  src={resolveAssetUrl(settings.heroImageUrl, '/images/rashoi_hero_cuisine_1794139786997.jpg')}
                  alt="Rashoi Signature Cuisine"
                  className="w-full h-84 object-cover object-center transform hover:scale-105 transition-transform duration-700 brightness-[0.95]"
                />
                <div className="p-5 bg-[#181215]/95 border-t border-[#A51C30]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] tracking-widest text-[#E23D5B] uppercase font-mono font-semibold">
                        FINE DINING SURREY
                      </p>
                      <h4 className="font-serif text-lg font-bold text-[#FFFFFF]">
                        The Royal Tandoor
                      </h4>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#291F24] text-white border border-[#A51C30]/40 font-mono font-medium shadow-inner">
                      Windlesham
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </section>
  );
};

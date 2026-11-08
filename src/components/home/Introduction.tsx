import React from 'react';
import { HomepageSettings } from '../../types';
import { resolveAssetUrl } from '../../utils/imagePath';

interface IntroductionProps {
  settings: HomepageSettings;
  onExploreHeritage?: () => void;
}

export const Introduction: React.FC<IntroductionProps> = ({ settings }) => {
  return (
    <section className="py-24 bg-[#161114] relative overflow-hidden border-t border-[#A51C30]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Atmospheric Photography with Burgundy Trim */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-lg">
              
              {/* Backing decorative element */}
              <div className="absolute -inset-2 rounded-2xl border border-[#A51C30]/30 transform -rotate-1 opacity-70" />
              
              <div className="relative rounded-2xl overflow-hidden border border-[#A51C30]/40 shadow-2xl bg-[#20191D]">
                <img
                  src={resolveAssetUrl(settings.introImageUrl, '/images/rashoi_interior_dining_1794139799818.jpg')}
                  alt="Atmosphere at Rashoi Restaurant"
                  className="w-full h-[420px] object-cover object-center transform hover:scale-102 transition-transform duration-500 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#1C1418]/95 backdrop-blur-md rounded-xl border border-[#A51C30]/35 shadow-lg">
                  <p className="font-serif italic text-[#F5B8C3] text-sm">
                    "Timeless recipes passed down through generations."
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Rich Heritage Copy */}
          <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
            
            <div className="inline-block">
              <span className="text-xs uppercase tracking-[0.28em] text-[#E23D5B] font-semibold font-sans">
                OUR CULINARY PHILOSOPHY
              </span>
              <div className="w-16 h-0.5 bg-[#800020] mt-1.5" />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight leading-tight">
              {settings.introHeading || "A Taste of India's Rich Heritage"}
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-[#E2DDD7] font-normal leading-relaxed">
              <p>
                {settings.introParagraph1 ||
                  'India is a land of culture and tradition, a land of many cuisines. This is not only due to its sheer size, but also due to the impact of various phases in her history.'}
              </p>
              <p>
                {settings.introParagraph2 ||
                  'Rashoi or The Indian Kitchen has survived the impact over the centuries, has matured over the years and imbibed the best of all cultures.'}
              </p>
            </div>

            {/* Heritage Values Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-[#A51C30]/25">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#E23D5B]">100%</p>
                <p className="text-xs text-[#FFFFFF] tracking-wider uppercase mt-1 font-medium">Authentic Spices</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#E23D5B]">Clay Oven</p>
                <p className="text-xs text-[#FFFFFF] tracking-wider uppercase mt-1 font-medium">Charcoal Grilled</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#E23D5B]">Surrey</p>
                <p className="text-xs text-[#FFFFFF] tracking-wider uppercase mt-1 font-medium">Windlesham UK</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

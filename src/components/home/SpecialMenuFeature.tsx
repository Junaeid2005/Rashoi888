import React from 'react';
import { HomepageSettings } from '../../types';
import { Calendar, ArrowRight, Check } from 'lucide-react';

interface SpecialMenuFeatureProps {
  settings: HomepageSettings;
  onBookTable: () => void;
  onViewMenu: () => void;
}

export const SpecialMenuFeature: React.FC<SpecialMenuFeatureProps> = ({
  settings,
  onBookTable,
  onViewMenu,
}) => {
  return (
    <section className="py-24 bg-[#120E10] relative overflow-hidden">
      
      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#800020]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#A51C30]/40 bg-gradient-to-r from-[#211A1E] via-[#1A1316] to-[#211A1E] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
            
            {/* Left Copy & Offer Breakdown */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6 text-left">
              
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-[#A51C30]/50 bg-[#291F24]">
                <Calendar className="w-3.5 h-3.5 text-[#E23D5B]" />
                <span className="text-[11px] uppercase tracking-widest text-[#FFFFFF] font-semibold">
                  {settings.specialFeatureSubtitle || 'SUNDAY BANQUET PROMOTION'}
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight">
                {settings.specialFeatureTitle || 'Rashoi Sunday Special'}
              </h2>

              <p className="text-base sm:text-lg text-[#E2DDD7] font-normal leading-relaxed">
                {settings.specialFeatureDescription ||
                  'Indulge in our exquisite four-course feast: A starter, a main dish, a side dish, and aromatic Rice or fresh Naan.'}
              </p>

              {/* Price Tag Highlight */}
              <div className="inline-flex items-baseline space-x-2 bg-[#291F24] px-5 py-2.5 rounded-xl border border-[#A51C30]/40 shadow-inner">
                <span className="text-xs text-[#ABA29B] uppercase tracking-wider font-medium">Only</span>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#E23D5B]">
                  {settings.specialFeaturePrice || '£15.95'}
                </span>
                <span className="text-xs text-[#E2DDD7]">per guest</span>
              </div>

              {/* Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-[#E2DDD7]">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#E23D5B]" />
                  <span>Choice of any appetiser</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#E23D5B]" />
                  <span>Curated royal main dish</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#E23D5B]" />
                  <span>Spiced vegetable side course</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#E23D5B]" />
                  <span>Fragrant Pilau Rice or Naan</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={onBookTable}
                  className="nav-burgundy-btn px-7 py-3.5 font-semibold text-xs tracking-widest uppercase rounded-xl shadow-lg flex items-center space-x-2 cursor-pointer"
                >
                  <span>Book for Sunday</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onViewMenu}
                  className="px-7 py-3.5 border border-[#A51C30]/50 bg-[#291F24]/60 hover:bg-[#291F24] text-[#FFFFFF] text-xs tracking-widest uppercase font-semibold rounded-xl transition-all cursor-pointer shadow"
                >
                  <span>View Details in Menu</span>
                </button>
              </div>

            </div>

            {/* Right Large Food Photography */}
            <div className="lg:col-span-5 h-80 lg:h-full relative min-h-[380px]">
              <img
                src={settings.specialFeatureImageUrl}
                alt={settings.specialFeatureTitle}
                className="w-full h-full object-cover object-center brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#211A1E] via-transparent to-transparent" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

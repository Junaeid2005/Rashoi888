import React from 'react';
import { Flame, ShieldCheck, HeartHandshake, Utensils } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  const features = [
    {
      icon: Flame,
      title: 'Authentic Flavours',
      description: 'Traditional Indian recipes and carefully selected spices blended to culinary perfection.',
    },
    {
      icon: ShieldCheck,
      title: 'Fresh Ingredients',
      description: 'Highest quality meats, seafood, fresh vegetables and artisanal dairy prepared with care.',
    },
    {
      icon: Utensils,
      title: 'Clay Oven Cooking',
      description: 'Inspired by the richness of Indian culinary traditions and high-heat charcoal clay tandoors.',
    },
    {
      icon: HeartHandshake,
      title: 'Warm Hospitality',
      description: 'A welcoming, attentive dining experience curated for intimate dinners and celebrations.',
    },
  ];

  return (
    <section className="py-24 bg-[#161114] relative border-y border-[#A51C30]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.28em] text-[#E23D5B] font-semibold font-sans">
            THE RASHOI DIFFERENCE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight mt-2">
            More Than Just a Meal
          </h2>
          <div className="w-16 h-0.5 bg-[#800020] mx-auto my-4" />
          <p className="text-[#E2DDD7] text-sm sm:text-base font-normal">
            Every dish we serve is a tribute to centuries of royal culinary artistry and refined British hospitality.
          </p>
        </div>

        {/* Feature Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/25 hover:border-[#E23D5B]/60 transition-all duration-300 group hover:-translate-y-1.5 shadow-lg text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[#291F24] border border-[#A51C30]/40 flex items-center justify-center mb-6 group-hover:bg-[#800020] transition-colors duration-300 shadow">
                  <Icon className="w-5 h-5 text-[#E23D5B] group-hover:text-[#FFFFFF] transition-colors duration-300" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#FFFFFF] mb-2 group-hover:text-[#F5B8C3] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#E2DDD7] leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

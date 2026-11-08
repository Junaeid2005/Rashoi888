import React from 'react';
import { Review } from '../../types';
import { Star, Quote } from 'lucide-react';

interface CustomerReviewsProps {
  reviews: Review[];
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ reviews }) => {
  const publishedReviews = reviews.filter((r) => r.isPublished);

  return (
    <section className="py-24 bg-[#161114] relative border-t border-[#A51C30]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.28em] text-[#E23D5B] font-semibold font-sans">
            GUEST EXPERIENCES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight mt-2">
            What Our Guests Say
          </h2>
          <div className="w-16 h-0.5 bg-[#800020] mx-auto my-4" />
          <p className="text-[#E2DDD7] text-sm sm:text-base font-normal">
            Genuine impressions from patrons dining with us in Windlesham, Surrey.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {publishedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/30 hover:border-[#E23D5B]/60 transition-all duration-300 shadow-xl flex flex-col justify-between text-left relative hover:-translate-y-1"
            >
              <div>
                <Quote className="w-8 h-8 text-[#E23D5B]/40 mb-4" />
                
                {/* Rating Stars in Ruby Burgundy */}
                <div className="flex items-center space-x-1.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating
                          ? 'text-[#E23D5B] fill-[#E23D5B]'
                          : 'text-[#3A2A30]'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-[#FFFFFF] italic leading-relaxed mb-6 font-serif">
                  "{rev.reviewText}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#A51C30]/20 flex items-center justify-between">
                <div>
                  <h4 className="font-sans text-xs tracking-wider uppercase font-bold text-[#FFFFFF]">
                    {rev.customerName}
                  </h4>
                  <p className="text-[11px] text-[#ABA29B] mt-0.5">{rev.date}</p>
                </div>
                <span className="text-[10px] text-[#E23D5B] bg-[#291F24] px-2.5 py-1 rounded-full border border-[#A51C30]/40 font-mono font-semibold">
                  Verified Guest
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import { X, ZoomIn } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/imagePath';

interface GalleryPageProps {
  items: GalleryItem[];
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ items }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const publishedItems = items.filter((item) => item.isPublished);

  const categories = ['all', ...Array.from(new Set(publishedItems.map((i) => i.category || 'Atmosphere')))];

  const filteredItems = activeCategory === 'all'
    ? publishedItems
    : publishedItems.filter((i) => (i.category || 'Atmosphere') === activeCategory);

  return (
    <div className="pt-28 pb-24 bg-[#120E10] min-h-screen text-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.28em] text-[#E23D5B] font-semibold font-sans">
            VISUAL SPLENDOUR
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#FFFFFF] tracking-tight mt-2">
            The Rashoi Gallery
          </h1>
          <div className="w-16 h-0.5 bg-[#800020] mx-auto my-4" />
          <p className="text-[#E2DDD7] text-sm sm:text-base font-normal leading-relaxed">
            Immerse yourself in the culinary artistry, charcoal tandoor craftsmanship, and candlelit ambiance of our Windlesham restaurant.
          </p>
        </div>

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex justify-center space-x-3 mb-10 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#800020] text-white shadow-lg shadow-[#800020]/30'
                    : 'bg-[#1F181C] text-[#E2DDD7] hover:text-white border border-[#A51C30]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-2xl overflow-hidden bg-[#1F181C] border border-[#A51C30]/25 hover:border-[#E23D5B]/60 transition-all duration-300 shadow-xl cursor-pointer h-72 sm:h-80"
            >
              <img
                src={resolveAssetUrl(item.imageUrl)}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-106 transition-transform duration-700 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] tracking-widest uppercase text-[#F5B8C3] font-mono font-semibold">
                  {item.category || 'Rashoi Kitchen'}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#FFFFFF] mt-1">
                  {item.title}
                </h3>
                <div className="mt-3 flex items-center space-x-1.5 text-xs text-[#E23D5B] font-semibold">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>View in full frame</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full-screen Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 text-[#FFFFFF] hover:text-[#E23D5B] bg-[#1F181C]/90 rounded-full border border-[#A51C30]/40 transition-colors cursor-pointer shadow-lg"
                aria-label="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>

              <img
                src={resolveAssetUrl(selectedImage.imageUrl)}
                alt={selectedImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-[#A51C30]/40 shadow-2xl"
              />

              <div className="mt-4 text-center">
                <span className="text-xs uppercase tracking-widest text-[#E23D5B] font-mono font-semibold">
                  {selectedImage.category || 'Rashoi Experience'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FFFFFF] mt-1">
                  {selectedImage.title}
                </h3>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

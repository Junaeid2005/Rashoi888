import React from 'react';
import { RestaurantInfo } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Phone, Mail, ArrowUp } from 'lucide-react';

interface FooterProps {
  info: RestaurantInfo;
  onNavigate: (view: string) => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ info, onNavigate, onOpenBooking }) => {
  const { isAdmin } = useAuth();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#100C0E] border-t border-[#A51C30]/25 text-[#E2DDD7] text-left pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-16 border-b border-[#A51C30]/20">
          
          {/* Column 1: Brand & Intro */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center">
                <img
                  src="/images/rashoi_official_logo.png"
                  alt="Rashoi Official Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(165,28,48,0.4)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-widest text-[#FFFFFF]">
                  RASHOI
                </span>
                <span className="text-[10px] tracking-[0.28em] text-[#E23D5B] uppercase font-sans font-semibold -mt-1">
                  THE INDIAN KITCHEN
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#ABA29B] leading-relaxed font-normal">
              Centuries of authentic Indian culinary heritage, charcoal-grilled tandoori delicacies, and refined British dining in the heart of Windlesham, Surrey.
            </p>
            <div className="pt-2 text-xs text-[#E23D5B] font-semibold">
              <span>Established in Windlesham, Surrey</span>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-[#FFFFFF] tracking-wide">
              Explore
            </h4>
            <div className="w-8 h-0.5 bg-[#800020]" />
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#E23D5B] transition-colors cursor-pointer text-[#E2DDD7]"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#E23D5B] transition-colors cursor-pointer text-[#E2DDD7]"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-[#E23D5B] transition-colors cursor-pointer text-[#E2DDD7]"
                >
                  Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-[#E23D5B] transition-colors cursor-pointer text-[#E2DDD7]"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reviews')}
                  className="hover:text-[#E23D5B] transition-colors cursor-pointer text-[#E2DDD7]"
                >
                  Reviews
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Information */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-[#FFFFFF] tracking-wide">
              Information
            </h4>
            <div className="w-8 h-0.5 bg-[#800020]" />
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#E23D5B] transition-colors cursor-pointer text-[#E2DDD7]"
                >
                  Contact
                </button>
              </li>
              <li>
                {isAdmin ? (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="text-[#E23D5B] hover:text-[#FFFFFF] transition-colors cursor-pointer font-semibold"
                  >
                    Admin Dashboard
                  </button>
                ) : (
                  <button
                    onClick={onOpenBooking}
                    className="text-[#E23D5B] hover:text-[#FFFFFF] transition-colors cursor-pointer font-semibold"
                  >
                    Book a Table
                  </button>
                )}
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#E23D5B] transition-colors font-medium text-[#FFFFFF] cursor-pointer"
                >
                  Complaints & Feedback
                </button>
              </li>
              <li>
                <span className="text-[#ABA29B] cursor-default">Privacy Policy</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Visit Us */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-[#FFFFFF] tracking-wide">
              Visit Us
            </h4>
            <div className="w-8 h-0.5 bg-[#800020]" />
            <div className="space-y-2 text-xs sm:text-sm text-[#ABA29B]">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#E23D5B] shrink-0 mt-0.5" />
                <p className="text-[#E2DDD7]">
                  {info.name} <br />
                  {info.address} <br />
                  {info.city}, {info.county} <br />
                  {info.postcode}, {info.country}
                </p>
              </div>

              <div className="flex items-center space-x-2.5 pt-2">
                <Phone className="w-4 h-4 text-[#E23D5B] shrink-0" />
                <a href={`tel:${info.phone}`} className="hover:text-[#E23D5B] text-[#E2DDD7] transition-colors">
                  {info.phone}
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#E23D5B] shrink-0" />
                <a href={`mailto:${info.email}`} className="hover:text-[#E23D5B] text-[#E2DDD7] transition-colors">
                  {info.email}
                </a>
              </div>

              <div className="pt-2 text-xs text-[#E2DDD7] border-t border-[#A51C30]/20 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#E23D5B]">Opening Hours</p>
                <p className="text-[#FFFFFF] font-semibold text-xs">Open 7 Days a Week</p>
                <div className="text-[11px] text-[#ABA29B] flex justify-between">
                  <span>Lunch:</span>
                  <span className="text-[#E2DDD7]">12:00 PM – 2:30 PM</span>
                </div>
                <div className="text-[11px] text-[#ABA29B] flex justify-between">
                  <span>Dinner:</span>
                  <span className="text-[#E2DDD7]">5:30 PM – 11:00 PM</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#ABA29B] space-y-4 sm:space-y-0">
          <p>© Rashoi Restaurant. All Rights Reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="text-[#E2DDD7]">The Indian Kitchen • Windlesham</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-[#1F181C] hover:bg-[#800020] text-white border border-[#A51C30]/35 transition-colors cursor-pointer shadow"
              title="Return to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

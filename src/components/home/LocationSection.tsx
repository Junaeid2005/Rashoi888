import React from 'react';
import { RestaurantInfo } from '../../types';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

interface LocationSectionProps {
  info: RestaurantInfo;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ info }) => {
  return (
    <section className="py-24 bg-[#161114] relative border-t border-[#A51C30]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full p-[1.5px] bg-gradient-to-tr from-[#800020] via-amber-400 to-[#A51C30] shadow-xl shadow-[#800020]/30">
            <img
              src="/images/rashoi_official_logo.jpeg"
              alt="Rashoi Restaurant Emblem"
              className="w-full h-full object-cover rounded-full shadow-inner"
            />
          </div>
          <span className="text-xs uppercase tracking-[0.28em] text-[#E23D5B] font-semibold font-sans">
            FIND US IN WINDLESHAM
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight mt-2">
            Visit Rashoi Restaurant
          </h2>
          <div className="w-16 h-0.5 bg-[#800020] mx-auto my-4" />
          <p className="text-[#E2DDD7] text-sm sm:text-base font-normal">
            Located in the picturesque Surrey village of Windlesham, offering refined dining and takeaway collection.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left: Contact & Opening Times Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Address Card */}
            <div className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/30 shadow-xl space-y-4 text-left">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#291F24] border border-[#A51C30]/40 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#E23D5B]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#FFFFFF]">
                    {info.name}
                  </h3>
                  <p className="text-sm text-[#E2DDD7] mt-1 font-normal leading-relaxed">
                    {info.address} <br />
                    {info.city}, {info.county} <br />
                    {info.postcode}, {info.country}
                  </p>
                  <a
                    href={info.googleMapsUrl || 'https://maps.google.com/?q=58+Updown+Hill+Windlesham+Surrey+GU20+6DX'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-[#E23D5B] hover:text-[#FFFFFF] font-semibold mt-3 transition-colors"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/30 shadow-xl space-y-4 text-left">
              <h3 className="font-serif text-lg font-bold text-[#FFFFFF] border-b border-[#A51C30]/20 pb-3">
                Direct Contact
              </h3>
              
              <div className="flex items-center space-x-4">
                <Phone className="w-4 h-4 text-[#E23D5B] shrink-0" />
                <a
                  href={`tel:${info.phone}`}
                  className="text-sm text-[#E2DDD7] hover:text-[#FFFFFF] transition-colors font-medium"
                >
                  {info.phone}
                </a>
              </div>

              <div className="flex items-center space-x-4">
                <Mail className="w-4 h-4 text-[#E23D5B] shrink-0" />
                <a
                  href={`mailto:${info.email}`}
                  className="text-sm text-[#E2DDD7] hover:text-[#FFFFFF] transition-colors font-medium"
                >
                  {info.email}
                </a>
              </div>
            </div>

            {/* Opening Hours Card */}
            <div className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/30 shadow-xl space-y-4 text-left">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center space-x-2 text-[#E23D5B]">
                  <Clock className="w-4 h-4" />
                  <h3 className="font-serif text-base font-bold text-[#FFFFFF]">Opening Hours</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#800020] text-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider border border-[#E23D5B]/40">
                  Open 7 Days a Week
                </span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                {info.openingHours && info.openingHours.length > 0 ? (
                  info.openingHours.map((schedule, idx) => (
                    <div key={idx} className="flex justify-between border-b border-[#A51C30]/15 pb-1.5 last:border-none">
                      <span className="text-[#ABA29B] font-medium">{schedule.days}</span>
                      <span className="text-[#FFFFFF] font-semibold">{schedule.hours}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between border-b border-[#A51C30]/15 pb-1.5">
                      <span className="text-[#ABA29B] font-medium">Lunch Service</span>
                      <span className="text-[#FFFFFF] font-semibold">12:00 PM – 2:30 PM</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-[#ABA29B] font-medium">Dinner Service</span>
                      <span className="text-[#FFFFFF] font-semibold">5:30 PM – 11:00 PM</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Right: Embedded Google Maps / Location Frame */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[#A51C30]/35 shadow-2xl bg-[#1F181C] relative min-h-[420px] flex flex-col">
            <iframe
              title="Rashoi Restaurant Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2489.967807869611!2d-0.6558694!3d51.3533923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876798031d234c9%3A0x6b44a30026e7a2ee!2s58%20Updown%20Hill%2C%20Windlesham%20GU20%206DX!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
              className="w-full flex-1 border-0 brightness-95 contrast-110"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="p-4 bg-[#181215] border-t border-[#A51C30]/25 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E2DDD7] gap-2">
              <span>58 Updown Hill, Windlesham, Surrey, GU20 6DX</span>
              <a
                href={info.googleMapsUrl || 'https://share.google/m1l4gEswAPjn9ckfn'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E23D5B] hover:text-[#FFFFFF] font-semibold flex items-center space-x-1 transition-colors"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

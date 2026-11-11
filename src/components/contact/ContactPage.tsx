import React, { useState } from 'react';
import { RestaurantInfo } from '../../types';
import { sendCustomerMessage } from '../../services/dbService';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactPageProps {
  info: RestaurantInfo;
}

export const ContactPage: React.FC<ContactPageProps> = ({ info }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'Complaint' | 'Feedback' | 'Menu Suggestion' | 'General Enquiry' | 'Other'>('General Enquiry');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await sendCustomerMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        category,
        message: message.trim(),
      });

      setSuccessMsg('Thank you. Your message has been received by restaurant management. We value your feedback and will respond promptly if requested.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setCategory('General Enquiry');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 bg-[#120E10] min-h-screen text-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.28em] text-[#E23D5B] font-semibold font-sans">
            GET IN TOUCH
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#FFFFFF] tracking-tight mt-2">
            Contact & Feedback
          </h1>
          <div className="w-16 h-0.5 bg-[#800020] mx-auto my-4" />
          <p className="text-[#E2DDD7] text-sm sm:text-base font-normal leading-relaxed">
            We welcome your enquiries, table requests, catering consultations, and guest feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact Details & Info */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            <div className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/30 shadow-xl space-y-4">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-[#E23D5B] shrink-0 mt-1" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#FFFFFF]">Restaurant Address</h3>
                  <p className="text-sm text-[#E2DDD7] mt-1 font-normal leading-relaxed">
                    {info.name} <br />
                    {info.address} <br />
                    {info.city}, {info.county} <br />
                    {info.postcode}, {info.country}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#A51C30]/20 flex items-center space-x-4">
                <Phone className="w-4 h-4 text-[#E23D5B] shrink-0" />
                <a href={`tel:${info.phone}`} className="text-sm text-[#E2DDD7] hover:text-[#FFFFFF] transition-colors font-medium">
                  {info.phone}
                </a>
              </div>

              <div className="flex items-center space-x-4">
                <Mail className="w-4 h-4 text-[#E23D5B] shrink-0" />
                <a href={`mailto:${info.email}`} className="text-sm text-[#E2DDD7] hover:text-[#FFFFFF] transition-colors font-medium">
                  {info.email}
                </a>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[#1F181C] border border-[#A51C30]/30 shadow-xl text-left space-y-4">
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
                  info.openingHours.map((h, i) => (
                    <div key={i} className="flex justify-between border-b border-[#A51C30]/15 pb-1.5 last:border-none">
                      <span className="text-[#ABA29B] font-medium">{h.days}</span>
                      <span className="text-[#FFFFFF] font-semibold">{h.hours}</span>
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

            {/* Embedded Google Map */}
            <div className="rounded-2xl overflow-hidden border border-[#A51C30]/30 h-56 shadow-xl">
              <iframe
                title="Rashoi Map Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2489.967807869611!2d-0.6558694!3d51.3533923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876798031d234c9%3A0x6b44a30026e7a2ee!2s58%20Updown%20Hill%2C%20Windlesham%20GU20%206DX!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
                className="w-full h-full border-0 brightness-95 contrast-110"
                loading="lazy"
              />
            </div>

          </div>

          {/* Right Column: Complaints & Feedback Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#1F181C] border border-[#A51C30]/35 shadow-2xl text-left">
              
              <div className="mb-6">
                <span className="text-xs uppercase tracking-wider text-[#E23D5B] font-mono font-semibold">
                  DIRECT TO MANAGEMENT
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFFFF] mt-1">
                  Complaints & Feedback
                </h2>
                <p className="text-xs sm:text-sm text-[#E2DDD7] mt-1 font-normal">
                  We take every guest remark seriously. Whether you wish to share praise, request dietary adaptations, or file a complaint, we are listening.
                </p>
              </div>

              {successMsg && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-sm flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p>{successMsg}</p>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1.5 font-medium">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-sm text-[#FFFFFF] focus:outline-none transition-colors shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1.5 font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. eleanor@example.co.uk"
                      className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-sm text-[#FFFFFF] focus:outline-none transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1.5 font-medium">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-sm text-[#FFFFFF] focus:outline-none transition-colors shadow-inner"
                    >
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Feedback">Positive Feedback</option>
                      <option value="Complaint">Complaint</option>
                      <option value="Menu Suggestion">Menu Suggestion</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1.5 font-medium">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Table reservation query or dining feedback"
                      className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-sm text-[#FFFFFF] focus:outline-none transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-1.5 font-medium">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please write your detailed comments here..."
                    className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-sm text-[#FFFFFF] focus:outline-none transition-colors shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 nav-burgundy-btn text-white font-semibold text-xs tracking-widest uppercase rounded-xl shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Transmitting Message...' : 'Submit to Management'}</span>
                </button>
              </form>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

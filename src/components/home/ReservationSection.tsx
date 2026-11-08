import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createReservation, isDateFullyBooked } from '../../services/dbService';
import { Calendar, Clock, Users, User, Mail, Phone, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReservationSectionProps {
  initialDate?: string;
  onSuccess?: () => void;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({ initialDate, onSuccess }) => {
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(initialDate || todayStr);
  const [time, setTime] = useState('18:30');
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  const [dateError, setDateError] = useState<string | null>(null);
  const [isCheckingDate, setIsCheckingDate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check fully booked whenever date changes
  useEffect(() => {
    let active = true;
    async function checkDate() {
      if (!date) return;
      setIsCheckingDate(true);
      setDateError(null);
      setErrorMessage(null);

      try {
        const isBlocked = await isDateFullyBooked(date);
        if (active && isBlocked) {
          if (date === todayStr) {
            setDateError(
              'Sorry, all tables are fully booked today. Please choose tomorrow or another available date.'
            );
          } else {
            setDateError(
              'Sorry, all tables are fully booked on your selected date. Please choose another available date.'
            );
          }
        }
      } catch (err) {
        console.warn('Error checking date fully booked:', err);
      } finally {
        if (active) setIsCheckingDate(false);
      }
    }

    checkDate();
    return () => {
      active = false;
    };
  }, [date, todayStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);
    setErrorMessage(null);

    if (dateError) return;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Please fill in your name, email and contact phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createReservation({
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        date,
        time,
        guests: Number(guests),
        specialRequests: specialRequests.trim() || undefined,
        customerId: user?.uid,
      });

      setBookingSuccess(`Your reservation request for ${guests} guests on ${date} at ${time} has been received! Ref: ${res.id}. We will confirm shortly.`);
      
      // Reset form fields
      setPhone('');
      setSpecialRequests('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const times = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  return (
    <section id="reservations" className="py-24 bg-[#120E10] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.28em] text-[#E23D5B] font-semibold font-sans">
            ONLINE TABLE BOOKING
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight mt-2">
            Reserve Your Table
          </h2>
          <div className="w-16 h-0.5 bg-[#800020] mx-auto my-4" />
          <p className="text-[#E2DDD7] text-sm sm:text-base font-normal">
            Join us for an unforgettable dining experience at Rashoi Restaurant in Windlesham, Surrey.
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl bg-[#1F181C] border border-[#A51C30]/35 p-8 sm:p-12 shadow-2xl">
          
          {bookingSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#291F24] border border-[#A51C30] flex items-center justify-center mx-auto text-[#E23D5B] shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#FFFFFF]">
                Reservation Request Received
              </h3>
              <p className="text-[#E2DDD7] text-sm max-w-md mx-auto leading-relaxed">
                {bookingSuccess}
              </p>
              <button
                onClick={() => setBookingSuccess(null)}
                className="mt-4 px-7 py-3 nav-burgundy-btn text-white font-semibold text-xs tracking-widest uppercase rounded-xl cursor-pointer"
              >
                Book Another Table
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Fully Booked Warning Banner */}
              {dateError && (
                <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-600/50 text-amber-200 text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Fully Booked Notice</p>
                    <p className="text-xs text-amber-300/90 mt-0.5">{dateError}</p>
                  </div>
                </div>
              )}

              {errorMessage && !dateError && (
                <div className="p-4 rounded-xl bg-red-950/50 border border-red-600/50 text-red-200 text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Guest Count, Date & Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Date */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-2 font-medium">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#E23D5B]" /> Date *
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className={`w-full px-4 py-3 rounded-xl bg-[#161013] border ${
                      dateError ? 'border-amber-500' : 'border-[#A51C30]/35 focus:border-[#E23D5B]'
                    } text-[#FFFFFF] text-sm focus:outline-none transition-colors shadow-inner`}
                  />
                  {isCheckingDate && (
                    <span className="text-[10px] text-[#ABA29B] mt-1 block">Checking table availability...</span>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-2 font-medium">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-[#E23D5B]" /> Time *
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-[#FFFFFF] text-sm focus:outline-none transition-colors shadow-inner"
                  >
                    {times.map((t) => (
                      <option key={t} value={t} className="bg-[#1F181C] text-[#FFFFFF]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-2 font-medium">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-[#E23D5B]" /> Number of Guests *
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-[#FFFFFF] text-sm focus:outline-none transition-colors shadow-inner"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20].map((num) => (
                      <option key={num} value={num} className="bg-[#1F181C] text-[#FFFFFF]">
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Personal Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-2 font-medium">
                    <User className="w-3.5 h-3.5 inline mr-1 text-[#E23D5B]" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-[#FFFFFF] text-sm focus:outline-none transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-2 font-medium">
                    <Mail className="w-3.5 h-3.5 inline mr-1 text-[#E23D5B]" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-[#FFFFFF] text-sm focus:outline-none transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-2 font-medium">
                    <Phone className="w-3.5 h-3.5 inline mr-1 text-[#E23D5B]" /> Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 07123 456789"
                    className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-[#FFFFFF] text-sm focus:outline-none transition-colors shadow-inner"
                  />
                </div>

              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#FFFFFF] mb-2 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-[#E23D5B]" /> Special Requests (Optional)
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Seating preferences, dietary requirements or celebration notes..."
                  className="w-full px-4 py-3 rounded-xl bg-[#161013] border border-[#A51C30]/35 focus:border-[#E23D5B] text-[#FFFFFF] text-sm focus:outline-none transition-colors shadow-inner"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || Boolean(dateError)}
                className={`w-full py-4 rounded-xl font-semibold text-xs sm:text-sm tracking-widest uppercase transition-all shadow-xl flex items-center justify-center space-x-2 ${
                  dateError
                    ? 'bg-[#291F24] text-[#ABA29B] cursor-not-allowed border border-[#3A2A30]'
                    : 'nav-burgundy-btn cursor-pointer'
                }`}
              >
                {submitting ? (
                  <span>Submitting Table Reservation...</span>
                ) : dateError ? (
                  <span>Selected Date Fully Booked</span>
                ) : (
                  <span>Confirm Table Reservation</span>
                )}
              </button>

              <p className="text-[11px] text-center text-[#ABA29B]">
                We reserve tables up to 15 minutes past your requested time. For large parties (10+), we may contact you by phone.
              </p>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};

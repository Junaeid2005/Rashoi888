import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createReservation, isDateFullyBooked, getBookedTimeSlotsForDate } from '../../services/dbService';
import { playUserSuccessChime, sendDesktopNotification } from '../../utils/audioNotification';
import { Calendar, Clock, Users, User, Mail, Phone, MessageSquare, AlertCircle, CheckCircle2, ShieldAlert, Lock, LogIn, BellRing } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface ReservationSectionProps {
  initialDate?: string;
  onSuccess?: () => void;
  onGoToAdmin?: () => void;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({ initialDate, onSuccess, onGoToAdmin }) => {
  const { user, isAdmin, signInWithGoogle } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

  const lunchTimes = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
  const dinnerTimes = [
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
  ];
  const times = [...lunchTimes, ...dinnerTimes];

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(initialDate || todayStr);
  const [time, setTime] = useState('18:30');
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isCheckingDate, setIsCheckingDate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync credentials whenever user logs in
  useEffect(() => {
    if (user) {
      if (user.displayName && !name) setName(user.displayName);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  // Check fully booked and load reserved time slots whenever date changes
  useEffect(() => {
    let active = true;
    async function checkDateAndSlots() {
      if (!date) return;
      setIsCheckingDate(true);
      setDateError(null);
      setErrorMessage(null);

      try {
        const [isBlocked, bookedSlots] = await Promise.all([
          isDateFullyBooked(date),
          getBookedTimeSlotsForDate(date),
        ]);

        if (!active) return;

        setBookedTimes(bookedSlots);

        if (isBlocked) {
          if (date === todayStr) {
            setDateError(
              'Sorry, all tables are fully booked today. Please choose tomorrow or another available date.'
            );
          } else {
            setDateError(
              'Sorry, all tables are fully booked on your selected date. Please choose another available date.'
            );
          }
        } else if (bookedSlots.length >= times.length) {
          setDateError('All table time slots on this date are fully reserved. Please select another date.');
        } else {
          // If current selected time is already booked, pick the first available time slot
          if (bookedSlots.includes(time)) {
            const firstAvailable = times.find((t) => !bookedSlots.includes(t));
            if (firstAvailable) {
              setTime(firstAvailable);
            }
          }
        }
      } catch (err) {
        console.warn('Error checking date or booked slots:', err);
      } finally {
        if (active) setIsCheckingDate(false);
      }
    }

    checkDateAndSlots();
    return () => {
      active = false;
    };
  }, [date, todayStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);
    setErrorMessage(null);

    if (!user) {
      signInWithGoogle();
      return;
    }

    if (dateError) return;

    if (bookedTimes.includes(time)) {
      setErrorMessage(`The time slot ${time} is already booked. Please choose a different available time.`);
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Please fill in your name, email and contact phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const reservationPayload: any = {
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        date,
        time,
        guests: Number(guests),
      };
      if (user?.uid) {
        reservationPayload.customerId = user.uid;
      }
      if (specialRequests.trim()) {
        reservationPayload.specialRequests = specialRequests.trim();
      }

      const res = await createReservation(reservationPayload);

      // Play elegant user confirmation audio chime
      playUserSuccessChime();

      // Trigger desktop notification if granted
      sendDesktopNotification('Rashoi Restaurant Table Confirmed', {
        body: `Table reserved for ${guests} guests on ${date} at ${time}. Booking Ref: ${res.id}`,
      });

      // Update booked times locally
      setBookedTimes((prev) => [...prev, time]);

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
          
          {isAdmin ? (
            /* Admin Exemption Notice */
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#291F24] border border-[#A51C30] flex items-center justify-center mx-auto text-[#E23D5B] shadow-lg">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <span className="text-[10px] tracking-widest text-[#E23D5B] uppercase font-mono font-bold">
                Administrator Session Active
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
                Table Booking is Disabled for Admins
              </h3>
              <p className="text-[#E2DDD7] text-sm max-w-lg mx-auto leading-relaxed font-normal">
                You are currently signed in as an administrator (<span className="text-white font-semibold">{user?.email}</span>). Customer table bookings are disabled for admin accounts. You can manage, confirm, and assign tables from the Admin Dashboard.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onGoToAdmin) onGoToAdmin();
                  }}
                  className="px-8 py-3.5 nav-burgundy-btn text-white font-semibold text-xs tracking-widest uppercase rounded-xl cursor-pointer shadow-xl inline-flex items-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4 text-[#F5B8C3]" />
                  <span>Open Admin Reservations</span>
                </button>
              </div>
            </div>
          ) : bookingSuccess ? (
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
              
              {/* Google Sign-in Notice / Verified Account Status */}
              {!user ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#291F24] border border-[#A51C30]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-[#E23D5B]" />
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        Google Sign-In Required
                      </p>
                    </div>
                    <p className="text-xs text-[#E2DDD7]">
                      Please sign in with Google to book your table. This guarantees authentic reservations and instant confirmations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs tracking-wide shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <GoogleIcon />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-[#291F24]/80 border border-emerald-500/30 text-xs text-[#E2DDD7]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      Booking as: <strong className="text-white">{user.displayName || user.email}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                    Verified Google Account
                  </span>
                </div>
              )}

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
                    <optgroup label="Lunch Service (12:00 PM – 2:30 PM)">
                      {lunchTimes.map((t) => (
                        <option key={t} value={t} className="bg-[#1F181C] text-[#FFFFFF]">
                          {t} — Lunch
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Dinner Service (5:30 PM – 11:00 PM)">
                      {dinnerTimes.map((t) => (
                        <option key={t} value={t} className="bg-[#1F181C] text-[#FFFFFF]">
                          {t} — Dinner
                        </option>
                      ))}
                    </optgroup>
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
              {!user ? (
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="w-full py-4 rounded-xl font-semibold text-xs sm:text-sm tracking-widest uppercase transition-all shadow-xl flex items-center justify-center space-x-2 bg-white text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                >
                  <GoogleIcon />
                  <span>Sign in with Google to Book Table</span>
                </button>
              ) : (
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
              )}

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

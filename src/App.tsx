/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/home/Hero';
import { Introduction } from './components/home/Introduction';
import { SignatureDishes } from './components/home/SignatureDishes';
import { ExperienceSection } from './components/home/ExperienceSection';
import { SpecialMenuFeature } from './components/home/SpecialMenuFeature';
import { CustomerReviews } from './components/home/CustomerReviews';
import { ReservationSection } from './components/home/ReservationSection';
import { LocationSection } from './components/home/LocationSection';
import { MenuPage } from './components/menu/MenuPage';
import { AboutPage } from './components/about/AboutPage';
import { GalleryPage } from './components/gallery/GalleryPage';
import { ContactPage } from './components/contact/ContactPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { FloatingCartBar } from './components/cart/FloatingCartBar';
import { OrderSuccessModal } from './components/orders/OrderSuccessModal';
import { CustomerOrderTracker } from './components/orders/CustomerOrderTracker';
import { UserModal } from './components/auth/UserModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminGlobalNotifier } from './components/admin/AdminGlobalNotifier';
import { Footer } from './components/layout/Footer';
import {
  seedInitialDataIfNeeded,
  getCategories,
  getMenuItems,
  getClassicDishesPricing,
  getReviews,
  getGallery,
  getRestaurantSettings,
  getOrderById,
} from './services/dbService';
import {
  MenuCategory,
  MenuItem,
  ClassicDishPricing,
  Review,
  GalleryItem,
  RestaurantInfo,
  HomepageSettings,
  Order,
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_CLASSIC_DISHES,
  INITIAL_REVIEWS,
  INITIAL_GALLERY,
  INITIAL_RESTAURANT_INFO,
  INITIAL_HOMEPAGE_SETTINGS,
} from './data/initialData';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function MainApp() {
  const { user, isAdmin, authError, clearAuthError } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [categories, setCategories] = useState<MenuCategory[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [classicDishes, setClassicDishes] = useState<ClassicDishPricing[]>(INITIAL_CLASSIC_DISHES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(INITIAL_RESTAURANT_INFO);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(INITIAL_HOMEPAGE_SETTINGS);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalTab, setUserModalTab] = useState<'reservations' | 'orders'>('orders');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // URL query handling for Stripe returns
  const [paymentNotice, setPaymentNotice] = useState<{ type: 'cancelled' | 'success'; message: string } | null>(null);

  useEffect(() => {
    // Check initial path or hash
    const path = window.location.pathname;
    const search = window.location.search;
    const params = new URLSearchParams(search);

    if (path.includes('/admin') || window.location.hash === '#admin') {
      setCurrentView('admin');
    }

    if (params.get('payment') === 'cancelled') {
      setPaymentNotice({
        type: 'cancelled',
        message: 'Your payment was not completed. Your order is still available. You can try again.',
      });
    }

    if (params.get('session_id') || path.includes('/order/success')) {
      const sessionId = params.get('session_id');
      setPaymentNotice({
        type: 'success',
        message: `Thank you for your order! Checkout Session ${sessionId || ''} confirmed.`,
      });
    }

    // Seed & load live database data
    async function init() {
      try {
        await seedInitialDataIfNeeded();
        const [cats, items, classics, revs, gals, settings] = await Promise.all([
          getCategories(),
          getMenuItems(),
          getClassicDishesPricing(),
          getReviews(),
          getGallery(),
          getRestaurantSettings(),
        ]);

        if (cats && cats.length > 0) setCategories(cats);
        if (items && items.length > 0) setMenuItems(items);
        if (classics && classics.length > 0) setClassicDishes(classics);
        if (revs && revs.length > 0) setReviews(revs);
        if (gals && gals.length > 0) setGallery(gals);
        if (settings?.info) setRestaurantInfo(settings.info);
        if (settings?.homepage) setHomepageSettings(settings.homepage);
      } catch (err) {
        console.warn('Initial data load warning:', err);
      }
    }

    init();
  }, []);

  const handleOpenBooking = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [adminInitialTab, setAdminInitialTab] = useState<string | undefined>(undefined);

  const handleNavigateToAdmin = (targetTab?: string) => {
    if (targetTab) {
      setAdminInitialTab(targetTab);
    }
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin Dashboard view
  if (currentView === 'admin') {
    return (
      <AdminDashboard
        initialTab={adminInitialTab}
        onReturnToSite={() => {
          setAdminInitialTab(undefined);
          setCurrentView('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F1EA] flex flex-col font-sans">
      
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenBooking={handleOpenBooking}
        onOpenUserModal={() => {
          setUserModalTab('reservations');
          setUserModalOpen(true);
        }}
        onOpenOrders={() => {
          setUserModalTab('orders');
          setUserModalOpen(true);
        }}
      />

      {/* Stripe Payment Notification Banner if returning from Stripe */}
      {paymentNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4">
          <div
            className={`p-4 rounded-xl border shadow-2xl flex items-start justify-between space-x-3 text-xs ${
              paymentNotice.type === 'cancelled'
                ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {paymentNotice.type === 'cancelled' ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <p>{paymentNotice.message}</p>
            </div>
            <button
              onClick={() => setPaymentNotice(null)}
              className="text-[#858078] hover:text-[#F5F1EA]"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Public Pages */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              settings={homepageSettings}
              onBookTable={handleOpenBooking}
              onExploreMenu={() => {
                setCurrentView('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onGoToAdmin={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <Introduction settings={homepageSettings} />
            <SignatureDishes
              dishes={menuItems}
              onViewMenu={() => {
                setCurrentView('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <ExperienceSection />
            <SpecialMenuFeature
              settings={homepageSettings}
              onBookTable={handleOpenBooking}
              onViewMenu={() => {
                setCurrentView('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <CustomerReviews reviews={reviews} />
            <ReservationSection
              onGoToAdmin={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <LocationSection info={restaurantInfo} />
          </>
        )}

        {currentView === 'about' && (
          <AboutPage
            settings={homepageSettings}
            info={restaurantInfo}
            onBookTable={handleOpenBooking}
            onViewMenu={() => {
              setCurrentView('menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'menu' && (
          <MenuPage
            categories={categories}
            menuItems={menuItems}
          />
        )}

        {currentView === 'gallery' && <GalleryPage items={gallery} />}

        {currentView === 'reviews' && (
          <div className="pt-28 pb-12">
            <CustomerReviews reviews={reviews} />
          </div>
        )}

        {currentView === 'contact' && <ContactPage info={restaurantInfo} />}
      </main>

      {/* Footer */}
      <Footer
        info={restaurantInfo}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenBooking={handleOpenBooking}
      />

      {/* Cart Drawer */}
      <CartDrawer onOrderSuccess={(ord) => setCompletedOrder(ord)} />

      {/* Floating Cart & Quick Checkout Bar */}
      <FloatingCartBar />

      {/* Order Success Receipt Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* User Account / History Modal */}
      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        initialTab={userModalTab}
      />

      {/* Auth Error Notification Modal */}
      {authError && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#1F181C] border border-[#A51C30] shadow-2xl p-6 text-white text-left space-y-4">
            <div className="flex items-center space-x-3 text-[#E23D5B]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-white">Sign In Assistance</h3>
            </div>
            
            <p className="text-xs text-[#E2DDD7] leading-relaxed">
              {authError}
            </p>

            <div className="p-3.5 rounded-xl bg-[#161013] border border-[#A51C30]/40 text-xs text-[#ABA29B] space-y-1.5">
              <p className="font-semibold text-white">Quick Fix for Vercel / Custom Domain:</p>
              <p>1. Open <a href="https://console.firebase.google.com/project/gen-lang-client-0919101230/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-[#E23D5B] underline font-bold">Firebase Console &gt; Authentication &gt; Settings</a></p>
              <p>2. Scroll down to <strong>Authorized domains</strong></p>
              <p>3. Click <strong>Add domain</strong> and enter: <span className="font-mono text-white font-bold">{typeof window !== 'undefined' ? window.location.hostname : 'your-domain.vercel.app'}</span></p>
            </div>

            <button
              onClick={clearAuthError}
              className="w-full py-2.5 nav-burgundy-btn text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Global Admin Live Order & Booking Notifier (Active everywhere on the website) */}
      {isAdmin && (
        <AdminGlobalNotifier
          currentView={currentView}
          onNavigateToAdmin={handleNavigateToAdmin}
        />
      )}

      {/* Customer Live Real-Time Takeaway Order Tracker */}
      {!isAdmin && (
        <CustomerOrderTracker
          onOpenOrders={() => {
            setUserModalTab('orders');
            setUserModalOpen(true);
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

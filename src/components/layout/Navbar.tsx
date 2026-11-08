import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  UtensilsCrossed,
  ShoppingBag,
  User as UserIcon,
  Menu as MenuIcon,
  X,
  CalendarCheck,
  LogOut,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenBooking: () => void;
  onOpenUserModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenBooking,
  onOpenUserModal,
}) => {
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'menu', label: 'Menu' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#070707]/95 backdrop-blur-md border-b border-[#800020]/30 shadow-2xl py-3.5'
            : 'bg-gradient-to-b from-black/90 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex flex-col items-start text-left group transition-transform duration-200 cursor-pointer"
          >
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-[#FFFFFF] group-hover:text-[#F5C6D0] transition-colors">
              RASHOI
            </span>
            <span className="text-[9px] tracking-[0.28em] text-[#A51C30] uppercase font-sans font-semibold -mt-1">
              THE INDIAN KITCHEN
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative text-xs tracking-widest uppercase transition-colors duration-200 py-1 font-medium cursor-pointer ${
                    isActive ? 'text-[#FFFFFF] font-bold' : 'text-[#BDB7AF] hover:text-[#FFFFFF]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#800020]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
              className="relative p-2.5 transition-colors rounded-full border border-[#800020]/30 bg-[#121212] hover:bg-[#1a1a1a] text-[#FFFFFF] cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center bg-[#800020] text-white shadow animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Google Sign-in */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 text-xs p-1.5 px-2.5 rounded-lg border border-[#800020]/30 bg-[#121212] text-[#FFFFFF] hover:border-[#800020] transition-colors cursor-pointer"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Account'}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-[#A51C30]" />
                    )}
                    <span className="hidden md:inline max-w-[90px] truncate text-[#FFFFFF] font-medium">
                      {user.displayName?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#A51C30]" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#121212] border border-[#800020]/35 shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#222222]">
                        <p className="text-[10px] uppercase tracking-wider text-[#9E9790] font-mono">Signed in as</p>
                        <p className="text-sm font-semibold text-[#FFFFFF] truncate">{user.displayName || user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenUserModal();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-[#D4CDC5] hover:bg-[#1c1c1c] hover:text-[#FFFFFF] flex items-center space-x-2 cursor-pointer transition-colors"
                      >
                        <CalendarCheck className="w-4 h-4 text-[#A51C30]" />
                        <span>My Bookings & Orders</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setCurrentView('admin');
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#F5B8C3] hover:bg-[#1c1c1c] flex items-center space-x-2 font-medium cursor-pointer transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-[#A51C30]" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-[#1c1c1c] flex items-center space-x-2 border-t border-[#222222] cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="hidden sm:flex items-center space-x-1.5 text-xs px-3.5 py-2 rounded-lg border border-[#800020]/30 bg-[#121212] hover:bg-[#1a1a1a] text-[#FFFFFF] hover:border-[#800020] transition-all cursor-pointer font-medium"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#A51C30]" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Book a Table Primary Button in Royal Burgundy */}
            <button
              onClick={onOpenBooking}
              className="nav-burgundy-btn px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-xs tracking-widest uppercase font-sans cursor-pointer transition-all duration-200"
            >
              Book a Table
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
              className="lg:hidden p-2 text-[#FFFFFF] hover:text-[#A51C30]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/85 backdrop-blur-md">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#161114] border-l border-[#800020]/30 p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#292025]">
                <div className="flex flex-col">
                  <span className="font-serif text-xl font-bold tracking-widest text-[#FFFFFF]">
                    RASHOI
                  </span>
                  <span className="text-[9px] tracking-widest text-[#C22D47] uppercase font-medium">
                    THE INDIAN KITCHEN
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#858078] hover:text-[#FFFFFF]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col space-y-4 py-8">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`text-left text-lg font-serif transition-colors py-1 ${
                      currentView === link.id
                        ? 'text-[#FFFFFF] font-semibold border-l-2 border-[#A51C30] pl-3'
                        : 'text-[#D4CDC5] hover:text-[#FFFFFF] pl-3'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}

                {user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenUserModal();
                    }}
                    className="text-left text-sm text-[#F5B8C3] hover:text-white pl-3 pt-4 border-t border-[#292025]"
                  >
                    My Bookings & Orders
                  </button>
                )}

                {/* If user is admin, allow discreet navigation to admin dashboard */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentView('admin');
                    }}
                    className="text-left text-sm text-[#E23D5B] pl-3 font-semibold hover:text-[#FFFFFF]"
                  >
                    Admin Dashboard
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-[#222222]">
              {!user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signInWithGoogle();
                  }}
                  className="w-full py-3 px-4 text-center text-xs tracking-wider uppercase font-semibold text-[#FFFFFF] border border-[#800020]/40 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] transition-colors"
                >
                  Sign in with Google
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full py-2.5 px-4 text-center text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3.5 nav-burgundy-btn font-semibold text-xs tracking-widest uppercase rounded-lg shadow-lg text-white"
              >
                Book a Table
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

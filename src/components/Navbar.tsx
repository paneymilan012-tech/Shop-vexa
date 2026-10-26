import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Package,
  ShieldCheck,
  Headphones,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  LogOut,
  MapPin,
  Tag,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../utils/shopLogic';

export const Navbar: React.FC = () => {
  const {
    cart,
    wishlistIds,
    currentUser,
    setIsCartOpen,
    setIsAuthOpen,
    setAuthMode,
    logout,
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
    setIsTrackingOpen,
    pricing,
  } = useShop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView('shop');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-purple-100 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500 text-white">
              NEW
            </span>
            <span>
              🚚 <strong>Free Express Shipping</strong> across India on orders above ₹999 | Code: <span className="font-mono bg-purple-700/60 px-1.5 py-0.5 rounded text-orange-200">VEXA20</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-purple-200 text-xs">
            <button
              onClick={() => {
                setActiveView('support');
                setMobileMenuOpen(false);
              }}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>24/7 Helpline & Support</span>
            </button>
            <span className="text-purple-400">|</span>
            <button
              onClick={() => {
                setIsTrackingOpen(true);
                setMobileMenuOpen(false);
              }}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Track Any Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveView('shop');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
              aria-label="ShopVexa Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight font-heading bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-600 bg-clip-text text-transparent">
                    Shop<span className="text-orange-500">Vexa</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                    IN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 -mt-1 hidden sm:block font-medium">
                  Shop Smart. Live Better.
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl hidden md:flex items-center relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search earbuds, watches, shirts, gadgets, home decor..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Track Order (Mobile & Desktop) */}
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer"
              title="Track Order"
            >
              <Package className="w-4 h-4 text-purple-600" />
              <span>Track Order</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                setActiveView('profile');
              }}
              className="relative p-2 text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
              aria-label={`Wishlist (${wishlistIds.length} items)`}
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl border border-purple-200/60 transition-colors cursor-pointer"
              aria-label={`Cart (${cartItemCount} items)`}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-purple-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left text-xs font-semibold leading-tight">
                <div className="text-[10px] text-purple-600">Cart</div>
                <div className="text-purple-950 font-bold">{formatINR(pricing.total)}</div>
              </div>
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-700 text-white font-bold text-xs flex items-center justify-center">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left text-xs">
                      <div className="font-semibold text-slate-800 max-w-[90px] truncate">
                        {currentUser.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-purple-600 font-medium capitalize">
                        {currentUser.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveView('profile');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        My Profile & Addresses
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('orders');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        My Orders & Invoices
                      </button>

                      {/* Admin Panel Direct Link */}
                      <button
                        onClick={() => {
                          setActiveView('admin');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 flex items-center gap-2 cursor-pointer bg-purple-50/50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                        Admin Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('support');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        Customer Support
                      </button>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setAccountMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setIsAuthOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setIsAuthOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Join Free
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products in India..."
              className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 px-3 py-1 bg-purple-700 text-white text-[11px] font-semibold rounded-lg"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white px-4 py-3 space-y-2 shadow-lg">
          <button
            onClick={() => {
              setActiveView('shop');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
              activeView === 'shop' ? 'bg-purple-100 text-purple-900' : 'text-slate-700'
            }`}
          >
            <span>🛍️ Shop Store</span>
          </button>
          <button
            onClick={() => {
              setActiveView('orders');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
              activeView === 'orders' ? 'bg-purple-100 text-purple-900' : 'text-slate-700'
            }`}
          >
            <span>📦 My Orders & Invoices</span>
          </button>
          <button
            onClick={() => {
              setIsTrackingOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-between"
          >
            <span>🔍 Track Any Order ID</span>
          </button>
          <button
            onClick={() => {
              setActiveView('admin');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
              activeView === 'admin' ? 'bg-purple-100 text-purple-900' : 'text-purple-700 bg-purple-50'
            }`}
          >
            <span>⚙️ Admin Dashboard</span>
          </button>
          <button
            onClick={() => {
              setActiveView('support');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
              activeView === 'support' ? 'bg-purple-100 text-purple-900' : 'text-slate-700'
            }`}
          >
            <span>🎧 24/7 Customer Support</span>
          </button>
        </div>
      )}
    </header>
  );
};

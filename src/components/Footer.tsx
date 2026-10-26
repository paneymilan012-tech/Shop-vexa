import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  MapPin,
  Heart,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { setSelectedCategory, setActiveView, setIsTrackingOpen, showToast } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    showToast('🎉 Subscribed! Check your inbox for exclusive ₹200 voucher.', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 4 Value Props */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/40 flex items-center justify-center text-orange-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Pan-India Express</div>
              <p className="text-slate-400 text-[11px]">Free delivery on orders &gt; ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/40 flex items-center justify-center text-orange-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">100% Genuine</div>
              <p className="text-slate-400 text-[11px]">Direct brand warranty included</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/40 flex items-center justify-center text-orange-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">7-Day Free Returns</div>
              <p className="text-slate-400 text-[11px]">Instant doorstep replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/40 flex items-center justify-center text-orange-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">24/7 Helpline</div>
              <p className="text-slate-400 text-[11px]">Toll-Free: 1800-SHOP-VEXA</p>
            </div>
          </div>
        </div>

        {/* Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12 text-xs">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-orange-300" />
              </div>
              <span className="text-2xl font-black tracking-tight font-heading text-white">
                Shop<span className="text-orange-500">Vexa</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Shop Smart. Live Better. Your premier online destination in India for verified gadgets, authentic fashion, audio technology, and home lifestyle goods.
            </p>
            <div className="text-slate-400 text-[11px] space-y-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>ShopVexa Commerce Towers, Indiranagar, Bengaluru, KA 560038</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>support@shopvexa.in</span>
              </p>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Audio & Headphones');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Audio & Headphones
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Watches & Wearables');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Watches & Wearables
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Electronics');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Electronics & Appliances
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Fashion & Apparel');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Fashion & Apparel
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Home & Living');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home & Living
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Customer Care</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('support')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Help Desk & FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('support')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Returns & Cancellations
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('admin')}
                  className="hover:text-orange-400 transition-colors cursor-pointer text-purple-300 font-semibold"
                >
                  Admin Control Panel
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Stay in the Loop</h4>
            <p className="text-slate-400 text-[11px] mb-3">
              Subscribe to get secret coupon codes and flash deal notifications.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Get ₹200 Welcome Voucher
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar with payment badges */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 ShopVexa India Private Limited. All rights reserved. Built with ❤️ for smart shoppers.
          </div>

          {/* Payment Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Accepted Payments:</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white text-[10px] font-bold font-mono">
              UPI
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white text-[10px] font-bold font-mono">
              RuPay
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white text-[10px] font-bold font-mono">
              Visa
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white text-[10px] font-bold font-mono">
              Mastercard
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold">
              Cash on Delivery (COD)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

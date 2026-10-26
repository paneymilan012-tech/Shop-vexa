import React from 'react';
import { ArrowRight, ShieldCheck, RotateCcw, Truck, Headphones, Zap, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory, setSearchQuery } = useShop();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-2xl border border-purple-800/40">
      {/* Decorative background blurs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Column: Headlines & Call to Actions */}
        <div className="max-w-2xl text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-800/60 border border-purple-500/40 text-orange-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>FESTIVE SALE IS LIVE • UP TO 60% OFF</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight">
            Shop Smart. <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Live Better.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Discover curated premium gadgets, lifestyle essentials, authentic Indian apparel, and smart audio at realistic rupee prices. Delivered fast to your doorstep.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedCategory('All');
                const target = document.getElementById('products-section');
                target?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Top Deals</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSelectedCategory('Audio & Headphones');
                const target = document.getElementById('products-section');
                target?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-orange-400" />
              <span>Smart Audio & Wearables</span>
            </button>
          </div>

          {/* Coupon Code Callout */}
          <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs text-purple-200">
            <span>Use coupon code</span>
            <span className="font-mono bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold px-2.5 py-1 rounded-lg">
              VEXA20
            </span>
            <span>at checkout for extra 20% off!</span>
          </div>
        </div>

        {/* Right Column: Featured Visual Highlights Cards */}
        <div className="w-full lg:w-auto grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-left transform hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold font-heading">Flash Deals</div>
            <div className="text-xs text-purple-200 mt-1">Limited stocks with up to 60% instant MRP discount</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-left transform hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold font-heading">100% Genuine</div>
            <div className="text-xs text-purple-200 mt-1">Direct from certified brands with official warranty</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-left transform hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold font-heading">Fast Shipping</div>
            <div className="text-xs text-purple-200 mt-1">Free delivery above ₹999 across all Indian pin codes</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-left transform hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold font-heading">7-Day Returns</div>
            <div className="text-xs text-purple-200 mt-1">Hassle-free instant replacement or refund policy</div>
          </div>
        </div>
      </div>

      {/* Trust bar at bottom of hero */}
      <div className="border-t border-purple-800/40 bg-purple-950/60 px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
            <Truck className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Free Express Delivery &gt; ₹999</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Secure UPI, Cards & COD</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
            <RotateCcw className="w-4 h-4 text-orange-400 shrink-0" />
            <span>7 Days Return Guarantee</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
            <Headphones className="w-4 h-4 text-orange-400 shrink-0" />
            <span>24/7 Dedicated Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

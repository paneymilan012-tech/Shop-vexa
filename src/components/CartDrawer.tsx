import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  Heart,
  CheckCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatINR, FREE_SHIPPING_THRESHOLD } from '../utils/shopLogic';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    pricing,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen,
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;
    setApplying(true);
    await applyCoupon(code);
    setApplying(false);
    setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-700" />
            <h2 className="font-bold text-slate-900 text-base font-heading">
              Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-purple-900 text-white px-4 py-2.5 text-xs">
          {pricing.freeShippingQualified ? (
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Congratulations! You qualify for Free Express Shipping across India 🇮🇳</span>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1 text-purple-200">
                <span>
                  Add <strong className="text-orange-300">{formatINR(pricing.amountNeededForFreeShipping)}</strong> more for <strong>FREE Delivery</strong>
                </span>
                <span className="font-mono text-[11px]">
                  {Math.round((pricing.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%
                </span>
              </div>
              <div className="w-full bg-purple-950/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-400 to-amber-300 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((pricing.subtotal / FREE_SHIPPING_THRESHOLD) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Looks like you haven't added anything yet. Discover our latest collection of premium products!
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-3.5 flex gap-3.5 items-start">
                {/* Product Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-purple-700 uppercase">{item.brand}</div>
                  <h4 className="text-xs font-semibold text-slate-900 truncate" title={item.title}>
                    {item.title}
                  </h4>
                  {item.selectedVariant && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Option: <span className="font-medium text-slate-700">{item.selectedVariant}</span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-sm font-bold text-slate-900 font-heading">
                      {formatINR(item.price * item.quantity)}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-[11px] text-slate-400 line-through">
                        {formatINR(item.originalPrice * item.quantity)}
                      </span>
                    )}
                  </div>

                  {/* Quantity & Action Controls */}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 hover:bg-white rounded text-slate-600 disabled:opacity-40 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item.productId)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Save to wishlist"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Coupon, Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> applied ({formatINR(pricing.discount)} OFF)
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo coupon (e.g. VEXA20)"
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <button
                      type="button"
                      disabled={applying || !couponInput.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                    >
                      {applying ? 'Applying...' : 'Apply'}
                    </button>
                  </div>

                  {/* Quick Click Promo Chips */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="text-slate-500 py-0.5">Quick coupons:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('VEXA20')}
                      className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md font-mono font-bold cursor-pointer"
                    >
                      VEXA20 (20% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('WELCOME100')}
                      className="px-2 py-0.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-md font-mono font-bold cursor-pointer"
                    >
                      WELCOME100 (₹100)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">{formatINR(pricing.subtotal)}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className={pricing.shippingFee === 0 ? 'text-emerald-600 font-semibold' : 'text-slate-800'}>
                  {pricing.shippingFee === 0 ? 'FREE' : formatINR(pricing.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Estimated GST (18% included)</span>
                <span>{formatINR(pricing.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2 font-heading">
                <span>Grand Total</span>
                <span className="text-purple-900">{formatINR(pricing.total)}</span>
              </div>
              {pricing.totalSavings > 0 && (
                <div className="text-[11px] text-center text-emerald-700 bg-emerald-50 py-1 rounded-lg font-semibold">
                  🎉 Total Savings on this order: {formatINR(pricing.totalSavings)}
                </div>
              )}
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

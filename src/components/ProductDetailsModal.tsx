import React, { useState } from 'react';
import {
  X,
  Star,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  MapPin,
  Share2,
  Sparkles,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../utils/shopLogic';

export const ProductDetailsModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsCartOpen,
    setIsCheckoutOpen,
    showToast,
  } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('560038');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [pincodeMessage, setPincodeMessage] = useState('Delivery available to 560038 in 2-3 business days');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  // Customer Reviews state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewsList, setReviewsList] = useState([
    {
      id: 'rev-1',
      name: 'Aditya S.',
      rating: 5,
      date: '24 Oct 2026',
      title: 'Exceeded all expectations! Pure quality',
      comment: 'Build quality is top notch. Sound clarity and ANC are right up there with flagship alternatives. Delivered within 48 hours to Bengaluru.',
      verified: true,
    },
    {
      id: 'rev-2',
      name: 'Pooja Verma',
      rating: 4,
      date: '20 Oct 2026',
      title: 'Great value for rupee',
      comment: 'Looks and feels very premium. Battery easily lasts throughout my work week. Satisfied with ShopVexa packaging.',
      verified: true,
    },
  ]);

  if (!selectedProduct) return null;

  const inWishlist = isInWishlist(selectedProduct.id);
  const isOutOfStock = selectedProduct.stock <= 0;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      setPincodeChecked(false);
      setPincodeMessage('Please enter a valid 6-digit Indian Pincode (e.g. 560038, 110001)');
      return;
    }
    setPincodeChecked(true);
    setPincodeMessage(`Express Delivery available to PIN ${pincode} via Blue Dart / Delhivery (Estimated in 2-3 Days). Free on ₹999+`);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewText.trim()) {
      showToast('Please provide your name and review', 'error');
      return;
    }
    const newRev = {
      id: `rev-${Date.now()}`,
      name: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: 'Just now',
      title: 'Verified Customer Feedback',
      comment: newReviewText.trim(),
      verified: true,
    };
    setReviewsList([newRev, ...reviewsList]);
    setNewReviewAuthor('');
    setNewReviewText('');
    showToast('Thank you! Your review has been submitted.', 'success');
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity, selectedVariant || undefined);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 border border-purple-100">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-md transition-colors cursor-pointer"
          aria-label="Close product details modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div>
              {/* Main Image View */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-inner mb-4 flex items-center justify-center">
                <img
                  src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover object-center"
                />
                {selectedProduct.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-600 text-white shadow-md">
                    {selectedProduct.discountPercent}% OFF
                  </span>
                )}
                {selectedProduct.badge && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-900 text-purple-200 shadow-md">
                    {selectedProduct.badge}
                  </span>
                )}
              </div>

              {/* Thumbnail Selector */}
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-purple-600 ring-2 ring-purple-600/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Trust Badges under Image */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs text-slate-600 mt-4">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-purple-700" />
                <span className="font-semibold text-[11px]">Free Shipping &gt; ₹999</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-purple-700" />
                <span className="font-semibold text-[11px]">7-Day Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span className="font-semibold text-[11px]">Genuine Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Specs, Variants, Delivery & Actions */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {/* Brand & Category */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-bold text-purple-700 tracking-wider uppercase">
                  {selectedProduct.brand}
                </span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading leading-tight mb-2">
                {selectedProduct.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-bold text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{selectedProduct.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  ({selectedProduct.reviewCount} customer ratings)
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-emerald-600">
                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of Stock'}
                </span>
              </div>

              {/* Price & Savings */}
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 mb-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-purple-950 font-heading">
                    {formatINR(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-sm text-slate-400 line-through">
                      MRP {formatINR(selectedProduct.originalPrice)}
                    </span>
                  )}
                  {selectedProduct.discountPercent > 0 && (
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                      Save {formatINR(selectedProduct.originalPrice - selectedProduct.price)} ({selectedProduct.discountPercent}% OFF)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Inclusive of all taxes. Free shipping applied on orders above ₹999.
                </p>
              </div>

              {/* Variants Selector (Color/Size) */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="space-y-3 mb-5">
                  {selectedProduct.variants.map((variant, vIdx) => (
                    <div key={vIdx}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 capitalize">
                        Select {variant.type}:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedVariant(opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                              selectedVariant === opt || (!selectedVariant && opt === variant.options[0])
                                ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                                : 'border-slate-200 hover:border-purple-300 bg-white text-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery PinCode Checker */}
              <div className="mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  <span>Check Delivery & Cash on Delivery Availability</span>
                </div>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Check
                  </button>
                </form>
                {pincodeMessage && (
                  <p className={`text-[11px] mt-1.5 ${pincodeChecked ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {pincodeMessage}
                  </p>
                )}
              </div>

              {/* Tabs for Details, Specs, Reviews */}
              <div className="border-b border-slate-200 mb-4">
                <div className="flex gap-4 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 transition-colors cursor-pointer ${
                      activeTab === 'details'
                        ? 'border-b-2 border-purple-600 text-purple-700'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Overview & Key Features
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2 transition-colors cursor-pointer ${
                      activeTab === 'specs'
                        ? 'border-b-2 border-purple-600 text-purple-700'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 transition-colors cursor-pointer ${
                      activeTab === 'reviews'
                        ? 'border-b-2 border-purple-600 text-purple-700'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Reviews ({reviewsList.length})
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="mb-6 max-h-48 overflow-y-auto pr-1 text-xs">
                {activeTab === 'details' && (
                  <div className="space-y-3">
                    <p className="text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                    <div className="space-y-1.5 pt-1">
                      <div className="font-semibold text-slate-800">Highlights:</div>
                      {selectedProduct.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="divide-y divide-slate-100">
                    {Object.entries(selectedProduct.specs).map(([key, val]) => (
                      <div key={key} className="py-2 flex justify-between">
                        <span className="text-slate-500">{key}</span>
                        <span className="font-semibold text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Add Review Form */}
                    <form onSubmit={handleAddReview} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-semibold text-slate-800">Share Your Experience</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          placeholder="Your Name"
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                          <option value={3}>⭐⭐⭐ (3 Stars)</option>
                          <option value={2}>⭐⭐ (2 Stars)</option>
                          <option value={1}>⭐ (1 Star)</option>
                        </select>
                      </div>
                      <textarea
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Write your review about product quality, fit, battery..."
                        rows={2}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Submit Review
                      </button>
                    </form>

                    {/* Existing reviews */}
                    <div className="space-y-3">
                      {reviewsList.map((rev) => (
                        <div key={rev.id} className="border-b border-slate-100 pb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800">{rev.name}</span>
                            <span className="text-[10px] text-slate-400">{rev.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                            {rev.verified && (
                              <span className="text-[10px] text-emerald-600 font-semibold ml-2">
                                ✓ Verified Buyer
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 leading-snug">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Quantity, Wishlist, Add to Cart & Buy Now */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-3">
                {/* Quantity adjuster */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(selectedProduct.stock, q + 1))}
                    disabled={quantity >= selectedProduct.stock}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Wishlist toggle */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    inWishlist
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-slate-200 hover:border-purple-300 text-slate-700'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    addToCart(selectedProduct, quantity, selectedVariant || undefined);
                    setIsCartOpen(true);
                  }}
                  className="w-full py-3 bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4 text-purple-700" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

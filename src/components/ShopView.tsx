import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Star,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  Tag,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCategory } from '../types';
import { HeroBanner } from './HeroBanner';
import { ProductCard } from './ProductCard';
import { formatINR } from '../utils/shopLogic';

const CATEGORIES: { label: ProductCategory; icon: string }[] = [
  { label: 'All', icon: '✨' },
  { label: 'Audio & Headphones', icon: '🎧' },
  { label: 'Watches & Wearables', icon: '⌚' },
  { label: 'Electronics', icon: '⚡' },
  { label: 'Mobiles & Accessories', icon: '📱' },
  { label: 'Fashion & Apparel', icon: '👕' },
  { label: 'Home & Living', icon: '🕯️' },
  { label: 'Beauty & Personal Care', icon: '✨' },
  { label: 'Fitness & Outdoors', icon: '🧘' },
];

export const ShopView: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minRating,
    setMinRating,
    inStockOnly,
    setInStockOnly,
    sortBy,
    setSortBy,
    loadingProducts,
  } = useShop();

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);

  // Filter products locally for instant responsive feel
  let filtered = [...products];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (selectedCategory !== 'All') {
    filtered = filtered.filter((p) => p.category === selectedCategory);
  }

  if (minPrice > 0) {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }

  if (maxPrice < 20000) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  if (minRating > 0) {
    filtered = filtered.filter((p) => p.rating >= minRating);
  }

  if (inStockOnly) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  if (discountOnly) {
    filtered = filtered.filter((p) => p.discountPercent > 0);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating-desc':
        return b.rating - a.rating;
      case 'discount-desc':
        return b.discountPercent - a.discountPercent;
      case 'featured':
      default:
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating - a.rating;
    }
  });

  const flashDeals = products.filter((p) => p.isFlashDeal || p.discountPercent >= 50);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(20000);
    setMinRating(0);
    setInStockOnly(false);
    setDiscountOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Container */}
      <div id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Pills Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <span>Explore Categories</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {products.length} Products Available
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
                  selectedCategory === cat.label
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-600/25 scale-[1.02]'
                    : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200/80 hover:border-purple-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Flash Deals Spotlight (if All categories selected) */}
        {selectedCategory === 'All' && !searchQuery && flashDeals.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-purple-500/10 rounded-3xl p-6 border border-orange-200/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-500 text-white shadow-xs">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-heading">
                    Flash Deals & Mega Savings
                  </h3>
                  <p className="text-[11px] text-slate-500">Up to 60% instant discount for limited hours</p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                ⚡ Selling Fast
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {flashDeals.slice(0, 4).map((deal) => (
                <ProductCard key={deal.id} product={deal} />
              ))}
            </div>
          </div>
        )}

        {/* Search Results Alert banner if user searched */}
        {searchQuery && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-purple-900">
              <Search className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Search results for: <strong>"{searchQuery}"</strong> ({filtered.length} items found)
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Toolbar: Filter Toggle & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                filterDrawerOpen
                  ? 'border-purple-600 bg-purple-50 text-purple-900'
                  : 'border-slate-200 hover:border-purple-300 text-slate-700 bg-slate-50/50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
              <span>Filters</span>
              {(minPrice > 0 || maxPrice < 20000 || minRating > 0 || inStockOnly || discountOnly) && (
                <span className="w-2 h-2 rounded-full bg-orange-500" />
              )}
            </button>

            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">Showing {filtered.length} products</span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
              >
                <option value="featured">Featured & Best Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Customer Rating (Highest)</option>
                <option value="discount-desc">Biggest Discounts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Drawer / Expandable Panel */}
        {filterDrawerOpen && (
          <div className="mb-6 p-5 bg-white rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
              {/* Price Range */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Max Price ({formatINR(maxPrice)})
                </label>
                <input
                  type="range"
                  min={500}
                  max={20000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹500</span>
                  <span>₹20,000+</span>
                </div>
              </div>

              {/* Customer Rating Filter */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Minimum Rating
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 4.5, 4.0, 3.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setMinRating(rate)}
                      className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer ${
                        minRating === rate
                          ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {rate === 0 ? 'All Ratings' : `${rate}★ & Above`}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Stock Toggle */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Availability
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span className="font-medium text-slate-700">In Stock Items Only</span>
                </label>
              </div>

              {/* Discount Only Toggle */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Special Offers
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={(e) => setDiscountOnly(e.target.checked)}
                    className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="font-medium text-slate-700">Discounted Deals Only</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Product Cards Grid */}
        {loadingProducts ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading ShopVexa catalog...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 font-heading">
                No products found matching your criteria
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your price limits, selecting 'All' categories, or clearing search keywords.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../utils/shopLogic';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProduct,
    cart,
  } = useShop();

  const inWishlist = isInWishlist(product.id);
  const cartItem = cart.find((i) => i.productId === product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => setSelectedProduct(product)}
      >
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-orange-600 text-white shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.badge && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-900/90 text-purple-200 backdrop-blur-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
            inWishlist
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 px-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="w-full py-2 bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-purple-700" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg tracking-wider uppercase">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-purple-700 uppercase tracking-wider">{product.brand}</span>
            <span className="truncate max-w-[120px]">{product.category}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => setSelectedProduct(product)}
            className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-purple-700 cursor-pointer transition-colors leading-snug mb-2"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-700">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-slate-400">({product.reviewCount})</span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="ml-auto text-[10px] font-semibold text-orange-600 animate-pulse">
                Only {product.stock} left!
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900 font-heading">
                {formatINR(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">Free Delivery eligible</div>
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : cartItem
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-purple-700 hover:bg-purple-800 text-white shadow-sm shadow-purple-600/20 active:scale-95'
            }`}
            aria-label={`Add ${product.title} to cart`}
          >
            {cartItem ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added ({cartItem.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

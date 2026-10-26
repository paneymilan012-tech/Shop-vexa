import { CartItem, Coupon, Product, ProductCategory } from '../types';

/**
 * Formats a number to Indian Rupee (INR) currency representation
 * e.g. 1499 -> "₹1,499", 129999 -> "₹1,29,999"
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const absStr = Math.abs(rounded).toString();

  if (absStr.length <= 3) {
    return `${isNegative ? '-' : ''}₹${absStr}`;
  }

  // Indian number system: last 3 digits, then groups of 2 digits
  const lastThree = absStr.substring(absStr.length - 3);
  const remaining = absStr.substring(0, absStr.length - 3);
  const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return `${isNegative ? '-' : ''}₹${formattedRemaining},${lastThree}`;
}

export interface OrderPricingResult {
  subtotal: number;
  originalSubtotal: number;
  discount: number;
  productSavings: number;
  totalSavings: number;
  shippingFee: number;
  tax: number;
  total: number;
  freeShippingQualified: boolean;
  amountNeededForFreeShipping: number;
}

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 79;
export const GST_RATE = 0.18; // 18% GST (standard Indian e-commerce calculation for invoice)

export function calculateOrderPricing(
  items: CartItem[],
  coupon: Coupon | null = null,
  freeShippingMin: number = FREE_SHIPPING_THRESHOLD
): OrderPricingResult {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalSubtotal = items.reduce(
    (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
    0
  );
  const productSavings = Math.max(0, originalSubtotal - subtotal);

  let discount = 0;
  let freeShippingApplied = false;

  if (coupon && subtotal >= coupon.minOrderValue) {
    if (coupon.discountType === 'PERCENT') {
      const calcDiscount = Math.round((subtotal * coupon.value) / 100);
      discount = coupon.maxDiscount ? Math.min(calcDiscount, coupon.maxDiscount) : calcDiscount;
    } else if (coupon.discountType === 'FIXED') {
      discount = Math.min(subtotal, coupon.value);
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      freeShippingApplied = true;
    }
  }

  const freeShippingQualified = subtotal >= freeShippingMin || freeShippingApplied;
  const shippingFee = items.length === 0 ? 0 : freeShippingQualified ? 0 : STANDARD_SHIPPING_FEE;
  const amountNeededForFreeShipping = Math.max(0, freeShippingMin - subtotal);

  // Inclusive GST calculation on post-discount merchandise
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * (GST_RATE / (1 + GST_RATE)));

  const total = Math.max(0, subtotal - discount + shippingFee);
  const totalSavings = productSavings + discount + (freeShippingQualified && items.length > 0 ? STANDARD_SHIPPING_FEE : 0);

  return {
    subtotal,
    originalSubtotal,
    discount,
    productSavings,
    totalSavings,
    shippingFee,
    tax,
    total,
    freeShippingQualified,
    amountNeededForFreeShipping,
  };
}

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  selectedBrands?: string[];
  discountOnly?: boolean;
}

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'discount-desc'
  | 'newest';

export function filterAndSortProducts(
  products: Product[],
  filters: ProductFilters = {},
  sort: SortOption = 'featured'
): Product[] {
  let result = [...products];

  // Search filter across title, brand, category, tags and description
  if (filters.search && filters.search.trim() !== '') {
    const query = filters.search.toLowerCase().trim();
    const queryWords = query.split(/\s+/);

    result = result.filter((p) => {
      const searchableText = `${p.title} ${p.brand} ${p.category} ${p.description} ${(p.tags || []).join(' ')}`.toLowerCase();
      return queryWords.every((word) => searchableText.includes(word));
    });
  }

  // Category filter
  if (filters.category && filters.category !== 'All') {
    result = result.filter((p) => p.category === filters.category);
  }

  // Price range
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  // Rating filter
  if (filters.minRating !== undefined && filters.minRating > 0) {
    result = result.filter((p) => p.rating >= filters.minRating!);
  }

  // In Stock filter
  if (filters.inStockOnly) {
    result = result.filter((p) => p.stock > 0);
  }

  // Brand filter
  if (filters.selectedBrands && filters.selectedBrands.length > 0) {
    result = result.filter((p) => filters.selectedBrands!.includes(p.brand));
  }

  // Discount only
  if (filters.discountOnly) {
    result = result.filter((p) => p.discountPercent > 0);
  }

  // Sorting
  result.sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating-desc':
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      case 'discount-desc':
        return b.discountPercent - a.discountPercent;
      case 'newest':
        return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
      case 'featured':
      default:
        // Featured products first, then highest rating
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating - a.rating;
    }
  });

  return result;
}

export function generateOrderId(): string {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `SVX-${randomPart}`;
}

export function generateTrackingNumber(): string {
  const letters = 'EXP';
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `IN-${letters}-${digits}`;
}

/**
 * Validates a coupon code against subtotal
 */
export function validateCouponCode(
  code: string,
  subtotal: number,
  coupons: Coupon[]
): { valid: boolean; coupon?: Coupon; error?: string } {
  const normalized = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code. Try WELCOME100, VEXA20, or FESTIVE500' };
  }

  if (subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      coupon,
      error: `Add items worth ${formatINR(coupon.minOrderValue - subtotal)} more to use coupon ${coupon.code}`,
    };
  }

  return { valid: true, coupon };
}

/**
 * Detects Card Network (RuPay, Visa, Mastercard, Amex)
 */
export function detectCardNetwork(cardNumber: string): 'RuPay' | 'Visa' | 'Mastercard' | 'Amex' | 'Unknown' {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
  if (/^(508|60|65|81|82)/.test(clean)) return 'RuPay';
  if (/^3[47]/.test(clean)) return 'Amex';
  return 'Unknown';
}

/**
 * Validates Test Card Info without saving raw card data.
 * Always returns masked representation.
 */
export function validateTestCard(
  cardNumber: string,
  expiry: string,
  cvv: string
): { isValid: boolean; error?: string; maskedCard?: string; network?: string } {
  const cleanNum = cardNumber.replace(/\D/g, '');
  if (cleanNum.length < 15 || cleanNum.length > 16) {
    return { isValid: false, error: 'Please enter a valid 15 or 16-digit card number' };
  }

  const cleanExpiry = expiry.trim();
  const expiryMatch = cleanExpiry.match(/^(\d{2})\/?(\d{2}|\d{4})$/);
  if (!expiryMatch) {
    return { isValid: false, error: 'Enter expiry in MM/YY format' };
  }

  const month = parseInt(expiryMatch[1], 10);
  const yearShort = parseInt(expiryMatch[2].slice(-2), 10);
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid expiry month' };
  }
  // Basic future check (2025 onwards)
  if (yearShort < 24) {
    return { isValid: false, error: 'Card has expired' };
  }

  const cleanCvv = cvv.replace(/\D/g, '');
  if (cleanCvv.length < 3 || cleanCvv.length > 4) {
    return { isValid: false, error: 'Enter a valid 3 or 4 digit CVV' };
  }

  const last4 = cleanNum.slice(-4);
  const network = detectCardNetwork(cleanNum);

  return {
    isValid: true,
    maskedCard: `•••• •••• •••• ${last4}`,
    network,
  };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  calculateOrderPricing,
  filterAndSortProducts,
  validateCouponCode,
  validateTestCard,
  detectCardNetwork,
  generateOrderId,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from './shopLogic';
import { CartItem, Coupon, Product } from '../types';

test('formatINR formats numbers correctly according to Indian numbering system', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(499), '₹499');
  assert.equal(formatINR(1499), '₹1,499');
  assert.equal(formatINR(24999), '₹24,999');
  assert.equal(formatINR(129999), '₹1,29,999');
  assert.equal(formatINR(1450000), '₹14,50,000');
});

test('calculateOrderPricing computes subtotal, shipping fee, and free shipping qualification', () => {
  const itemsUnderThreshold: CartItem[] = [
    {
      id: 'p1',
      productId: 'p1',
      title: 'T-shirt',
      brand: 'VexaStyle',
      price: 500,
      originalPrice: 999,
      image: '',
      quantity: 1,
      stock: 10,
    },
  ];

  const resultUnder = calculateOrderPricing(itemsUnderThreshold);
  assert.equal(resultUnder.subtotal, 500);
  assert.equal(resultUnder.shippingFee, STANDARD_SHIPPING_FEE);
  assert.equal(resultUnder.freeShippingQualified, false);
  assert.equal(resultUnder.amountNeededForFreeShipping, FREE_SHIPPING_THRESHOLD - 500);
  assert.equal(resultUnder.total, 500 + STANDARD_SHIPPING_FEE);

  const itemsOverThreshold: CartItem[] = [
    {
      id: 'p2',
      productId: 'p2',
      title: 'Sneakers',
      brand: 'VexaStyle',
      price: 1500,
      originalPrice: 2999,
      image: '',
      quantity: 1,
      stock: 5,
    },
  ];

  const resultOver = calculateOrderPricing(itemsOverThreshold);
  assert.equal(resultOver.subtotal, 1500);
  assert.equal(resultOver.shippingFee, 0);
  assert.equal(resultOver.freeShippingQualified, true);
  assert.equal(resultOver.total, 1500);
});

test('calculateOrderPricing applies percentage and fixed coupons correctly with caps', () => {
  const items: CartItem[] = [
    {
      id: 'p1',
      productId: 'p1',
      title: 'Headphones',
      brand: 'VexaAudio',
      price: 2000,
      originalPrice: 3999,
      image: '',
      quantity: 1,
      stock: 10,
    },
  ];

  const percentCouponWithCap: Coupon = {
    code: 'VEXA20',
    discountType: 'PERCENT',
    value: 20, // 20% of 2000 = 400, cap is 300
    maxDiscount: 300,
    minOrderValue: 999,
    description: '20% off up to ₹300',
  };

  const resultWithCoupon = calculateOrderPricing(items, percentCouponWithCap);
  assert.equal(resultWithCoupon.discount, 300);
  assert.equal(resultWithCoupon.total, 1700);
  assert.equal(resultWithCoupon.productSavings, 1999);
  assert.equal(resultWithCoupon.totalSavings, 1999 + 300 + STANDARD_SHIPPING_FEE);

  const fixedCoupon: Coupon = {
    code: 'WELCOME100',
    discountType: 'FIXED',
    value: 100,
    minOrderValue: 500,
    description: 'Flat ₹100 off',
  };

  const resultFixed = calculateOrderPricing(items, fixedCoupon);
  assert.equal(resultFixed.discount, 100);
  assert.equal(resultFixed.total, 1900);
});

test('validateCouponCode enforces minimum order thresholds and rejects invalid coupons', () => {
  const coupons: Coupon[] = [
    {
      code: 'WELCOME100',
      discountType: 'FIXED',
      value: 100,
      minOrderValue: 500,
      description: 'Flat ₹100 off',
    },
    {
      code: 'BIGSPEND500',
      discountType: 'FIXED',
      value: 500,
      minOrderValue: 2000,
      description: 'Flat ₹500 off on ₹2000+',
    },
  ];

  const valid = validateCouponCode('WELCOME100', 800, coupons);
  assert.equal(valid.valid, true);
  assert.equal(valid.coupon?.code, 'WELCOME100');

  const belowMin = validateCouponCode('BIGSPEND500', 1200, coupons);
  assert.equal(belowMin.valid, false);
  assert.match(belowMin.error || '', /Add items worth/);

  const nonExistent = validateCouponCode('INVALID_CODE', 1000, coupons);
  assert.equal(nonExistent.valid, false);
});

test('filterAndSortProducts correctly filters by search, category, inStock, and sorts', () => {
  const sampleProducts: Product[] = [
    {
      id: '1',
      title: 'Wireless Bluetooth Earbuds Pro',
      brand: 'SoundVexa',
      category: 'Audio & Headphones',
      price: 1999,
      originalPrice: 4999,
      discountPercent: 60,
      rating: 4.8,
      reviewCount: 320,
      stock: 15,
      isFeatured: true,
      images: [],
      description: 'Crystal clear sound with active noise cancellation',
      features: [],
      specs: {},
      tags: ['audio', 'earbuds', 'anc'],
    },
    {
      id: '2',
      title: 'Smart Fitness Tracker Band',
      brand: 'FitVexa',
      category: 'Watches & Wearables',
      price: 2499,
      originalPrice: 3999,
      discountPercent: 37,
      rating: 4.3,
      reviewCount: 150,
      stock: 0, // out of stock
      isFeatured: false,
      images: [],
      description: 'SpO2 and 24/7 heart rate monitoring',
      features: [],
      specs: {},
      tags: ['fitness', 'tracker', 'smartwatch'],
    },
    {
      id: '3',
      title: 'Classic Cotton Polo T-Shirt',
      brand: 'VexaStyle',
      category: 'Fashion & Apparel',
      price: 799,
      originalPrice: 1499,
      discountPercent: 47,
      rating: 4.5,
      reviewCount: 90,
      stock: 30,
      isFeatured: false,
      images: [],
      description: 'Breathable 100% combed cotton',
      features: [],
      specs: {},
      tags: ['fashion', 'men', 'cotton'],
    },
  ];

  // Search filter
  const searchResults = filterAndSortProducts(sampleProducts, { search: 'earbuds' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, '1');

  // Category filter
  const catResults = filterAndSortProducts(sampleProducts, { category: 'Fashion & Apparel' });
  assert.equal(catResults.length, 1);
  assert.equal(catResults[0].id, '3');

  // In-stock only
  const inStockResults = filterAndSortProducts(sampleProducts, { inStockOnly: true });
  assert.equal(inStockResults.length, 2);
  assert.equal(inStockResults.some((p) => p.id === '2'), false);

  // Sort price asc
  const priceAsc = filterAndSortProducts(sampleProducts, {}, 'price-asc');
  assert.equal(priceAsc[0].id, '3'); // 799
  assert.equal(priceAsc[2].id, '2'); // 2499
});

test('test payment validation detects card brand and masks numbers safely', () => {
  // Visa test card
  const visaResult = validateTestCard('4111222233334444', '12/28', '123');
  assert.equal(visaResult.isValid, true);
  assert.equal(visaResult.network, 'Visa');
  assert.equal(visaResult.maskedCard, '•••• •••• •••• 4444');

  // RuPay test card prefix (60, 65, 81, 82, 508)
  assert.equal(detectCardNetwork('6073123412341234'), 'RuPay');

  // Mastercard prefix (51-55)
  assert.equal(detectCardNetwork('5105105105105100'), 'Mastercard');

  // Invalid card length
  const invalidResult = validateTestCard('1234', '12/28', '123');
  assert.equal(invalidResult.isValid, false);

  // Expired card
  const expiredResult = validateTestCard('4111222233334444', '05/20', '123');
  assert.equal(expiredResult.isValid, false);
});

test('generateOrderId produces format SVX-XXXXXX', () => {
  const orderId = generateOrderId();
  assert.match(orderId, /^SVX-\d{6}$/);
});

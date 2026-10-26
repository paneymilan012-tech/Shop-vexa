export type ProductCategory = 
  | 'All'
  | 'Electronics'
  | 'Mobiles & Accessories'
  | 'Fashion & Apparel'
  | 'Home & Living'
  | 'Beauty & Personal Care'
  | 'Audio & Headphones'
  | 'Watches & Wearables'
  | 'Fitness & Outdoors';

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: ProductCategory;
  price: number; // in INR
  originalPrice: number; // MRP in INR
  discountPercent: number;
  rating: number; // 1-5
  reviewCount: number;
  stock: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isFlashDeal?: boolean;
  images: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  tags: string[];
  badge?: string;
  variants?: {
    type: 'size' | 'color' | 'storage';
    options: string[];
  }[];
}

export interface CartItem {
  id: string; // product id or product-variant key
  productId: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  selectedVariant?: string;
  stock: number;
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export type PaymentMethod = 'CARD' | 'UPI' | 'COD' | 'NETBANKING';

export type OrderStatus = 'Placed' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  description: string;
}

export interface Order {
  id: string; // e.g. SVX-482910
  trackingNumber: string; // e.g. IN-EXP-93021
  userId: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  subtotal: number;
  couponCode?: string;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  address: UserAddress;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    method: PaymentMethod;
    maskedCardNumber?: string; // e.g. •••• 4242
    cardNetwork?: string; // Visa, Mastercard, RuPay
    upiId?: string; // e.g. user@okhdfcbank
    bankName?: string;
    transactionId: string;
    isPaid: boolean;
  };
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  estimatedDeliveryDate: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';
  value: number; // e.g., 20 for 20%, 500 for ₹500
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
  expiryDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: UserAddress[];
  createdAt: string;
  savedWishlistIds: string[];
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  orderId?: string;
  category: 'Order Status' | 'Payment & Refund' | 'Product Inquiry' | 'Returns & Exchange' | 'Other';
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

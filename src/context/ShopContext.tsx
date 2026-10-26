import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon, Order, Product, ProductCategory, User, UserAddress } from '../types';
import { calculateOrderPricing, OrderPricingResult } from '../utils/shopLogic';
import { INITIAL_COUPONS, INITIAL_PRODUCTS } from '../data/seedData';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface ShopContextType {

  // Products
  products: Product[];
  categories: { name: string; count: number }[];
  loadingProducts: boolean;
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  minPrice: number;
  setMinPrice: (p: number) => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  refreshProducts: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Coupons
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Pricing calculations
  pricing: OrderPricingResult;

  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Auth User
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUserAddresses: (addresses: UserAddress[]) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;

  // Modals & Navigation Views
  activeView: 'shop' | 'admin' | 'orders' | 'profile' | 'support';
  setActiveView: (view: 'shop' | 'admin' | 'orders' | 'profile' | 'support') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  trackingOrderId: string;
  setTrackingOrderId: (id: string) => void;

  // Orders
  userOrders: Order[];
  refreshUserOrders: () => Promise<void>;
  placeOrder: (orderPayload: any) => Promise<Order>;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Cart & Wishlist (persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('svx_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('svx_wishlist');
      return saved ? JSON.parse(saved) : ['p-1', 'p-4'];
    } catch {
      return ['p-1', 'p-4'];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => INITIAL_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('svx_user');
      if (saved) return JSON.parse(saved);
      // Default to demo customer for immediate delightful testability
      return {
        id: 'u-customer-1',
        name: 'Milan Pandey',
        email: 'customer@shopvexa.in',
        phone: '+91 98765 43210',
        role: 'customer',
        createdAt: '2026-01-15T10:30:00Z',
        savedWishlistIds: ['p-1', 'p-4'],
        addresses: [
          {
            id: 'addr-1',
            name: 'Milan Pandey',
            phone: '+91 98765 43210',
            street: 'Flat 402, Royal Palms Residency, 100ft Ring Road, Indiranagar',
            landmark: 'Near Metro Pillar 124',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
            type: 'Home',
            isDefault: true,
          },
        ],
      };
    } catch {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Navigation & Modals
  const [activeView, setActiveView] = useState<'shop' | 'admin' | 'orders' | 'profile' | 'support'>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');

  // Orders
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('svx_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('svx_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds]);

  // Sync User to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('svx_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('svx_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Fetch initial products, categories, coupons
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data && data.products) setProducts(data.products);
      }
    } catch {}
    try {
      const catRes = await fetch('/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData)) setCategories(catData);
      }
    } catch {}
    try {
      const cpnRes = await fetch('/api/coupons');
      if (cpnRes.ok) {
        const cpnData = await cpnRes.json();
        if (Array.isArray(cpnData)) setCoupons(cpnData);
      }
    } catch {}
  };

  const refreshUserOrders = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}&email=${encodeURIComponent(currentUser.email)}`);
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data || []);
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshUserOrders();
    }
  }, [currentUser]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, variant?: string) => {
    const itemKey = variant ? `${product.id}-${variant}` : product.id;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.id === itemKey
            ? { ...item, quantity: Math.min(item.stock, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          productId: product.id,
          title: product.title,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0],
          quantity,
          selectedVariant: variant,
          stock: product.stock,
        },
      ];
    });
    showToast(`Added "${product.title}" to cart!`, 'success');
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  // Coupons
  const applyCoupon = async (code: string) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Invalid coupon code', 'error');
        return { success: false, message: data.error };
      }
      setAppliedCoupon(data.coupon);
      showToast(data.message || 'Coupon applied successfully!', 'success');
      return { success: true, message: data.message };
    } catch {
      showToast('Failed to validate coupon', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Pricing
  const pricing = calculateOrderPricing(cart, appliedCoupon);

  // Auth
  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    showToast(`Welcome, ${user.name}!`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('shop');
    showToast('You have been logged out', 'info');
  };

  const updateUserAddresses = async (addresses: UserAddress[]) => {
    if (!currentUser) return;
    try {
      const updatedUser = { ...currentUser, addresses };
      setCurrentUser(updatedUser);
      await fetch(`/api/auth/profile/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses }),
      });
      showToast('Address book updated!', 'success');
    } catch {
      showToast('Failed to save address', 'error');
    }
  };

  // Place order
  const placeOrder = async (orderPayload: any): Promise<Order> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to place order');
    }

    clearCart();
    setAppliedCoupon(null);
    refreshUserOrders();
    refreshProducts();
    return data;
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        loadingProducts,
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
        refreshProducts,

        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,

        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        pricing,

        wishlistIds,
        toggleWishlist,
        isInWishlist,

        currentUser,
        login,
        logout,
        updateUserAddresses,
        isAuthOpen,
        setIsAuthOpen,
        authMode,
        setAuthMode,

        activeView,
        setActiveView,
        selectedProduct,
        setSelectedProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        trackingOrderId,
        setTrackingOrderId,

        userOrders,
        refreshUserOrders,
        placeOrder,

        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

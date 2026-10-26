import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
} from './src/data/seedData';
import { Coupon, Order, OrderStatus, Product, SupportTicket, User } from './src/types';
import {
  calculateOrderPricing,
  filterAndSortProducts,
  generateOrderId,
  generateTrackingNumber,
  ProductFilters,
  SortOption,
  validateCouponCode,
  validateTestCard,
} from './src/utils/shopLogic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-Memory Database Store (Initialized from seedData)
let products: Product[] = [...INITIAL_PRODUCTS];
let coupons: Coupon[] = [...INITIAL_COUPONS];
let users: User[] = [...INITIAL_USERS];
let orders: Order[] = [...INITIAL_ORDERS];
let tickets: SupportTicket[] = [
  {
    id: 'TKT-101',
    name: 'Milan Pandey',
    email: 'customer@shopvexa.in',
    orderId: 'SVX-849201',
    category: 'Order Status',
    subject: 'Estimated delivery query',
    message: 'Hello ShopVexa team, when can I expect delivery for Indiranagar location? Thank you!',
    status: 'Resolved',
    createdAt: '2026-10-25T11:00:00Z',
  },
];

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ShopVexa',
    tagline: 'Shop Smart. Live Better.',
    timestamp: new Date().toISOString(),
  });
});

// Products: List with search, filtering, and sorting
app.get('/api/products', (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sort,
    discountOnly,
  } = req.query;

  const filters: ProductFilters = {
    search: search ? String(search) : undefined,
    category: category ? (String(category) as any) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    inStockOnly: inStockOnly === 'true',
    discountOnly: discountOnly === 'true',
  };

  const sortOption = (sort as SortOption) || 'featured';
  const result = filterAndSortProducts(products, filters, sortOption);
  res.json({ products: result, total: result.length });
});

// Products: Get Single Product
app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Products: Admin Add Product
app.post('/api/products', (req, res) => {
  const data = req.body;
  if (!data.title || !data.price || !data.category) {
    return res.status(400).json({ error: 'Title, price, and category are required' });
  }

  const newProduct: Product = {
    id: `p-${Date.now()}`,
    title: data.title,
    brand: data.brand || 'ShopVexa Exclusive',
    category: data.category,
    price: Number(data.price),
    originalPrice: Number(data.originalPrice) || Number(data.price) * 1.5,
    discountPercent: data.discountPercent || (data.originalPrice ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100) : 0),
    rating: Number(data.rating) || 4.5,
    reviewCount: Number(data.reviewCount) || 1,
    stock: Number(data.stock) || 10,
    isFeatured: Boolean(data.isFeatured),
    isTrending: Boolean(data.isTrending),
    isFlashDeal: Boolean(data.isFlashDeal),
    badge: data.badge || (data.isFeatured ? 'Featured' : undefined),
    images: data.images && data.images.length > 0 ? data.images : [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    ],
    description: data.description || 'Premium product from ShopVexa collection.',
    features: Array.isArray(data.features) ? data.features : ['Genuine Brand Warranty', 'Fast Shipping Across India'],
    specs: data.specs || { Warranty: '1 Year Brand Warranty' },
    tags: Array.isArray(data.tags) ? data.tags : ['new', 'shopvexa'],
    variants: data.variants || [],
  };

  products.unshift(newProduct);
  res.status(201).json(newProduct);
});

// Products: Admin Update Product
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = products[index];
  const updated: Product = {
    ...existing,
    ...req.body,
    id: existing.id,
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
    originalPrice: req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : existing.originalPrice,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : existing.stock,
  };

  products[index] = updated;
  res.json(updated);
});

// Products: Admin Delete Product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const deleted = products.splice(index, 1)[0];
  res.json({ success: true, deletedId: deleted.id });
});

// Categories: List with Counts
app.get('/api/categories', (req, res) => {
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });

  const categories = Object.keys(counts).map((name) => ({
    name,
    count: counts[name],
  }));

  res.json(categories);
});

// Coupons: List Available Coupons
app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

// Coupons: Validate
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  const result = validateCouponCode(String(code), Number(subtotal) || 0, coupons);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    valid: true,
    coupon: result.coupon,
    message: `Coupon ${result.coupon?.code} applied successfully!`,
  });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // For seamless testing, allow customer or admin
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Simulated secure authentication token
  const token = `svx_auth_${user.id}_${Date.now()}`;
  res.json({
    user,
    token,
    message: `Welcome back, ${user.name}!`,
  });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser: User = {
    id: `u-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    role: 'customer',
    createdAt: new Date().toISOString(),
    savedWishlistIds: [],
    addresses: [],
  };

  users.push(newUser);
  const token = `svx_auth_${newUser.id}_${Date.now()}`;
  res.status(201).json({
    user: newUser,
    token,
    message: 'Account created successfully!',
  });
});

// Auth: Update Profile / Addresses
app.put('/api/auth/profile/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.body.name) user.name = req.body.name;
  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.addresses) user.addresses = req.body.addresses;
  if (req.body.savedWishlistIds) user.savedWishlistIds = req.body.savedWishlistIds;

  res.json(user);
});

// Users: Admin List
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Orders: Create Order
app.post('/api/orders', (req, res) => {
  const {
    userId,
    userEmail,
    userName,
    items,
    address,
    paymentMethod,
    paymentInput,
    couponCode,
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  if (!address || !address.street || !address.pincode) {
    return res.status(400).json({ error: 'Valid delivery address is required' });
  }
  if (!paymentMethod) {
    return res.status(400).json({ error: 'Payment method is required' });
  }

  // Find coupon if any
  const appliedCoupon = couponCode
    ? coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase())
    : null;

  const pricing = calculateOrderPricing(items, appliedCoupon);

  // Validate test payment
  let paymentDetails: any = {
    method: paymentMethod,
    transactionId: `TXN-${Date.now()}`,
    isPaid: paymentMethod !== 'COD',
  };

  if (paymentMethod === 'CARD') {
    if (!paymentInput?.cardNumber || !paymentInput?.expiry || !paymentInput?.cvv) {
      return res.status(400).json({ error: 'Please enter all card details' });
    }
    const cardCheck = validateTestCard(paymentInput.cardNumber, paymentInput.expiry, paymentInput.cvv);
    if (!cardCheck.isValid) {
      return res.status(400).json({ error: cardCheck.error });
    }
    // NEVER save raw card number or CVV!
    paymentDetails.maskedCardNumber = cardCheck.maskedCard;
    paymentDetails.cardNetwork = cardCheck.network;
  } else if (paymentMethod === 'UPI') {
    paymentDetails.upiId = paymentInput?.upiId || 'verified@upi';
  } else if (paymentMethod === 'NETBANKING') {
    paymentDetails.bankName = paymentInput?.bankName || 'State Bank of India';
  } else if (paymentMethod === 'COD') {
    paymentDetails.isPaid = false;
  }

  const orderId = generateOrderId();
  const trackingNumber = generateTrackingNumber();

  // Calculate realistic delivery date (3-4 days ahead)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  const newOrder: Order = {
    id: orderId,
    trackingNumber,
    userId: userId || 'guest',
    userEmail: userEmail || 'customer@shopvexa.in',
    userName: userName || address.name || 'Valued Customer',
    items,
    subtotal: pricing.subtotal,
    couponCode: appliedCoupon?.code,
    discount: pricing.discount,
    shippingFee: pricing.shippingFee,
    tax: pricing.tax,
    total: pricing.total,
    address,
    paymentMethod,
    paymentDetails,
    status: 'Placed',
    statusHistory: [
      {
        status: 'Placed',
        timestamp: new Date().toISOString(),
        description: paymentMethod === 'COD' 
          ? 'Order confirmed with Cash on Delivery'
          : `Payment verified via ${paymentMethod} (${paymentDetails.transactionId})`,
      },
    ],
    estimatedDeliveryDate: deliveryDate.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  // Decrement stock in store
  for (const item of items) {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  }

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// Orders: Get list (customer or admin)
app.get('/api/orders', (req, res) => {
  const { userId, email } = req.query;
  if (userId) {
    const userOrders = orders.filter((o) => o.userId === userId || o.userEmail === email);
    return res.json(userOrders);
  }
  // Admin view: all orders
  res.json(orders);
});

// Orders: Track by ID or Tracking Number
app.get('/api/orders/:identifier', (req, res) => {
  const query = req.params.identifier.trim().toUpperCase();
  const order = orders.find(
    (o) => o.id.toUpperCase() === query || o.trackingNumber.toUpperCase() === query
  );
  if (!order) {
    return res.status(404).json({ error: 'Order not found with provided ID or tracking number' });
  }
  res.json(order);
});

// Orders: Admin Update Status
app.put('/api/orders/:id/status', (req, res) => {
  const { status, description } = req.body;
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const validStatuses: OrderStatus[] = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    description: description || `Status updated to ${status} by ShopVexa logistics`,
  });

  if (status === 'Delivered' && order.paymentMethod === 'COD') {
    order.paymentDetails.isPaid = true;
  }

  res.json(order);
});

// Support: Submit Ticket
app.post('/api/support', (req, res) => {
  const { name, email, orderId, category, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const newTicket: SupportTicket = {
    id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
    name,
    email,
    orderId,
    category: category || 'General Inquiry',
    subject: subject || 'Customer Support Request',
    message,
    status: 'Open',
    createdAt: new Date().toISOString(),
  };

  tickets.unshift(newTicket);
  res.status(201).json({
    ticket: newTicket,
    message: 'Your ticket has been logged! Our dedicated concierge will respond within 2 hours.',
  });
});

// Support: Admin List
app.get('/api/support', (req, res) => {
  res.json(tickets);
});

// Support: Admin Update Ticket Status
app.put('/api/support/:id', (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  if (req.body.status) ticket.status = req.body.status;
  res.json(ticket);
});

// Admin: Analytics & KPI Dashboard
app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = products.filter((p) => p.stock < 15);
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const pendingOrders = orders.filter((o) => ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery'].includes(o.status)).length;

  res.json({
    totalRevenue,
    totalOrders: orders.length,
    deliveredOrders,
    pendingOrders,
    totalProducts: products.length,
    totalCustomers: users.length,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    recentOrders: orders.slice(0, 5),
  });
});

// Admin: Reset Seed
app.post('/api/admin/reset', (req, res) => {
  products = [...INITIAL_PRODUCTS];
  coupons = [...INITIAL_COUPONS];
  users = [...INITIAL_USERS];
  orders = [...INITIAL_ORDERS];
  res.json({ message: 'Seed database reloaded successfully' });
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShopVexa] Server listening on http://0.0.0.0:${PORT} (env: ${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer().catch((err) => {
  console.error('[ShopVexa] Fatal server error:', err);
  process.exit(1);
});

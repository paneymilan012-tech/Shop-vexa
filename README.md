# ShopVexa - Shop Smart. Live Better. 🛍️🇮🇳

A modern, responsive e-commerce web platform engineered for the Indian retail ecosystem with **Indian Rupee (₹) pricing**, Cash on Delivery (COD), UPI simulations, test-mode payment gateway, live order tracking, and an administrative control center.

---

## 🌟 Key Features

1. **Brand Identity & Theme**:
   - Signature Royal Purple, crisp White, and Warm Energetic Orange palette.
   - Fully responsive for mobile phones, tablets, and desktop displays.
2. **Catalog & Categories**:
   - Audio & Headphones, Watches & Wearables, Electronics, Mobiles & Accessories, Fashion, Home & Living, Beauty, and Fitness.
   - Realistic Indian Rupee (₹) prices with formatted lakhs/thousands (e.g., ₹1,29,999).
   - MRP with percentage discount badges.
3. **Product Discovery**:
   - Instant search across product titles, brands, categories, descriptions, and tags.
   - Price range slider up to ₹20,000+.
   - Star rating filters and In-stock only toggle.
   - Multi-criteria sorting (Featured, Price Low-High, Price High-Low, Rating, Discounts).
4. **Product Details & Customer Engagement**:
   - Interactive multi-image gallery with zoom thumbnails.
   - PIN Code delivery checker with estimated delivery timelines across India.
   - Variant selector (color, size, storage).
   - Specifications table and customer review submission with 1-5 star ratings.
5. **Cart, Coupons & Checkout**:
   - Free shipping progress bar (Free Express Shipping on orders above ₹999).
   - Working coupon codes:
     - `VEXA20` - 20% instant discount up to ₹500
     - `WELCOME100` - Flat ₹100 off on first orders
     - `FESTIVE500` - ₹500 off on orders above ₹2,499
     - `FREESHIP` - Free express delivery
   - Complete checkout with Indian address fields (Pincode, City, State, Landmark, Phone).
6. **Payment Security**:
   - **Test-Mode Payment Gateway**: Pre-configured instant test cards (Visa, RuPay, Mastercard).
   - **UPI**: Scan & Pay QR simulator + VPA input.
   - **Net Banking**: Major Indian banks (SBI, HDFC, ICICI, Axis).
   - **Cash on Delivery (COD)**: With verification OTP prompt.
   - *Security compliance*: Raw payment card numbers and CVVs are processed only in memory and **never stored on disk**.
7. **Order Tracking & Invoices**:
   - Live vertical milestone tracker: *Placed ➔ Confirmed ➔ Shipped ➔ Out for Delivery ➔ Delivered*.
   - Track any order ID (e.g., `SVX-849201`) directly from header.
   - Download PDF tax invoice simulation.
8. **Customer Accounts & Profile**:
   - User registration and login.
   - Saved delivery address book manager.
   - Wishlist with 1-click move to cart.
   - Order history with re-order capability and order cancellation.
9. **24/7 Customer Support**:
   - Shopping FAQs (COD, 7-day returns, warranty claims).
   - Interactive virtual support chatbot with instant automated resolution.
   - Support ticket submission form.
10. **Admin Dashboard**:
    - Real-time KPI analytics: Revenue, Total Orders, Product Count, Low Stock Warnings.
    - Product management: Add new product, edit price & stock, delete product.
    - Order management: Update order fulfillment status (advance to Shipped/Delivered).
    - Inventory alerts: Instant "+20 Restock" action for items below 15 units.
    - User management table.

---

## ⚡ Quick Start & Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000` running Express with Vite middleware.

### 4. Run Automated Unit Tests
```bash
npm test
```
Executes fast Node test runner suite verifying INR formatting, pricing calculations, coupon caps, and test card masking.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Features |
|---|---|---|---|
| **Demo Customer** | `customer@shopvexa.in` | `password123` | Preloaded orders, saved Indiranagar address, active wishlist |
| **Demo Admin** | `admin@shopvexa.in` | `admin123` | Full access to KPI stats, catalog editor, and order fulfillment |

*Tip: You can also click the "⚡ Instant One-Click Demo Logins" buttons directly inside the Sign In modal!*

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order, OrderStatus, Product, ProductCategory, User } from '../types';
import { formatINR } from '../utils/shopLogic';

export const AdminDashboard: React.FC = () => {
  const { products, refreshProducts, showToast, setActiveView } = useShop();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'inventory'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Add Product Modal
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: 'ShopVexa Originals',
    category: 'Electronics' as ProductCategory,
    price: 1999,
    originalPrice: 3999,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
    description: 'High-performance crafted product with 1-year brand warranty.',
    isFeatured: true,
  });

  // Edit stock inline
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/orders'),
        fetch('/api/users'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setAdminOrders(await ordersRes.json());
      if (usersRes.ok) setAdminUsers(await usersRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Order #${orderId} status changed to ${newStatus}`, 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) {
      showToast('Please provide product title and price', 'error');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        showToast('New product added to catalog!', 'success');
        setShowAddProduct(false);
        refreshProducts();
        fetchAdminData();
      }
    } catch {
      showToast('Failed to create product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Product deleted', 'info');
        refreshProducts();
        fetchAdminData();
      }
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleQuickRestock = async (productId: string, addQuantity = 20) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: prod.stock + addQuantity }),
      });
      if (res.ok) {
        showToast(`Restocked ${prod.title} (+${addQuantity} units)`, 'success');
        refreshProducts();
        fetchAdminData();
      }
    } catch {
      showToast('Failed to restock', 'error');
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset store data back to initial seed state?')) return;
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Seed database reloaded successfully!', 'success');
        refreshProducts();
        fetchAdminData();
      }
    } catch {
      showToast('Failed to reset', 'error');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = adminOrders.filter((o) =>
    orderStatusFilter === 'All' ? true : o.status === orderStatusFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black font-heading">ShopVexa Admin Center</h1>
            <span className="bg-orange-500 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded">
              Live
            </span>
          </div>
          <p className="text-purple-200 text-xs mt-1">
            Manage product catalog, real-time customer orders, inventory stock alerts, and store users.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView('shop')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 cursor-pointer"
          >
            ← Back to Storefront
          </button>
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              {formatINR(stats.totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">
              INR transactions processed
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Customer Orders</span>
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              {stats.totalOrders}
            </div>
            <div className="text-[11px] text-purple-600 mt-1 font-medium">
              {stats.pendingOrders} active in transit
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Products in Catalog</span>
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              {stats.totalProducts}
            </div>
            <div className="text-[11px] text-indigo-600 mt-1 font-medium">across 8 categories</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              {stats.lowStockCount}
            </div>
            <div className="text-[11px] text-orange-600 mt-1 font-medium">&lt; 15 units remaining</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-1 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'products'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-1 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'orders'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Orders ({adminOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-1 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'inventory'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Inventory Restock Alerts
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'users'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Users & Accounts ({adminUsers.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Recent Orders table */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-sm text-slate-800 font-heading mb-3">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Items</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentOrders.map((ord: Order) => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono font-bold text-purple-900">{ord.id}</td>
                      <td className="py-2.5">{ord.userName}</td>
                      <td className="py-2.5 text-slate-500">{ord.items.length} items</td>
                      <td className="py-2.5 font-bold font-heading">{formatINR(ord.total)}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-800">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500">{ord.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title, brand, category..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={() => setShowAddProduct(true)}
              className="w-full sm:w-auto px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Add Product Modal */}
          {showAddProduct && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateProduct}
                className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs shadow-2xl border border-purple-100 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-sm text-slate-900">Add New Product to Store</h3>
                  <button onClick={() => setShowAddProduct(false)} type="button" className="cursor-pointer">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    placeholder="e.g. VexaAir Pro Wireless Speaker"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Brand</label>
                    <input
                      type="text"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option>Electronics</option>
                      <option>Audio & Headphones</option>
                      <option>Watches & Wearables</option>
                      <option>Mobiles & Accessories</option>
                      <option>Fashion & Apparel</option>
                      <option>Home & Living</option>
                      <option>Beauty & Personal Care</option>
                      <option>Fitness & Outdoors</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Initial Stock</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newProduct.images[0]}
                    onChange={(e) => setNewProduct({ ...newProduct, images: [e.target.value] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock Units</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="p-3 flex items-center gap-2.5">
                        <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                        <div>
                          <div className="font-bold text-slate-900 truncate max-w-[200px]">{p.title}</div>
                          <div className="text-[10px] text-purple-700">{p.brand}</div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{p.category}</td>
                      <td className="p-3 font-bold font-heading">{formatINR(p.price)}</td>
                      <td className="p-3">
                        <span className={`font-bold ${p.stock < 15 ? 'text-orange-600 font-bold' : 'text-slate-700'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3">★ {p.rating.toFixed(1)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickRestock(p.id, 10)}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded text-[11px] font-semibold cursor-pointer"
                            title="Restock +10"
                          >
                            +10 Stock
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Filter Status:</span>
            {['All', 'Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                  orderStatusFilter === st
                    ? 'bg-purple-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-3">Order ID & Date</th>
                    <th className="p-3">Customer & Destination</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3">Update Order Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70">
                      <td className="p-3">
                        <div className="font-mono font-bold text-purple-900">{ord.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{ord.userName}</div>
                        <div className="text-[10px] text-slate-500">
                          {ord.address.city}, PIN {ord.address.pincode}
                        </div>
                      </td>
                      <td className="p-3 font-bold font-heading">{formatINR(ord.total)}</td>
                      <td className="p-3">
                        <span className="font-semibold">{ord.paymentMethod}</span>
                        <div className="text-[10px] text-slate-400">
                          {ord.paymentDetails.isPaid ? 'Paid' : 'COD Pending'}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          <option value="Placed">Placed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY ALERTS */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
              <span>
                Inventory management system tracks low stock products with threshold under 15 units.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products
              .filter((p) => p.stock < 25)
              .map((p) => (
                <div key={p.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex gap-2.5 items-center">
                    <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-800 truncate max-w-[170px]">{p.title}</h4>
                      <p className="text-slate-500 text-[11px]">{p.category}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px]">Current Stock:</span>
                      <div className="font-bold text-orange-600 text-sm">{p.stock} units</div>
                    </div>
                    <button
                      onClick={() => handleQuickRestock(p.id, 20)}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      Restock +20
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: USERS & ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-500">{u.phone || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

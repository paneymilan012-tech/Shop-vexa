import React, { useState } from 'react';
import {
  User as UserIcon,
  MapPin,
  Heart,
  Package,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { UserAddress } from '../types';
import { formatINR } from '../utils/shopLogic';

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    userOrders,
    wishlistIds,
    products,
    updateUserAddresses,
    toggleWishlist,
    addToCart,
    setIsTrackingOpen,
    setTrackingOrderId,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'wishlist' | 'orders'>('profile');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<UserAddress>({
    id: `addr-${Date.now()}`,
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    street: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    type: 'Home',
    isDefault: false,
  });

  if (!currentUser) return null;

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.pincode || !newAddress.city) {
      showToast('Please fill all mandatory fields', 'error');
      return;
    }
    const currentList = currentUser.addresses || [];
    const updated = [...currentList, { ...newAddress, id: `addr-${Date.now()}` }];
    updateUserAddresses(updated);
    setShowAddAddress(false);
    setNewAddress({
      id: `addr-${Date.now()}`,
      name: currentUser.name,
      phone: currentUser.phone || '',
      street: '',
      landmark: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      type: 'Home',
      isDefault: false,
    });
  };

  const handleDeleteAddress = (id: string) => {
    const updated = (currentUser.addresses || []).filter((a) => a.id !== id);
    updateUserAddresses(updated);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-black font-heading">{currentUser.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                {currentUser.role}
              </span>
            </div>
            <p className="text-purple-200 text-xs mt-1">{currentUser.email}</p>
            {currentUser.phone && <p className="text-purple-300 text-xs">{currentUser.phone}</p>}
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex gap-3 text-center">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
            <div className="text-lg font-black font-heading text-orange-300">{userOrders.length}</div>
            <div className="text-[10px] text-purple-200 font-medium">Orders Placed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
            <div className="text-lg font-black font-heading text-orange-300">{wishlistIds.length}</div>
            <div className="text-[10px] text-purple-200 font-medium">Saved Items</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-1 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'profile'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Settings
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-1 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'addresses'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Delivery Addresses ({currentUser.addresses?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 px-1 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'wishlist'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Wishlist ({wishlistIds.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-1 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'orders'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Past Orders ({userOrders.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-base text-slate-900 font-heading">Account Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500">Full Name</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{currentUser.name}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500">Registered Email</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{currentUser.email}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500">Phone Number</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{currentUser.phone || 'Not linked'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500">Account Type</span>
              <p className="font-bold text-purple-700 text-sm mt-0.5 uppercase">{currentUser.role} Member</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Delivery Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">Saved Addresses</h3>
              <p className="text-xs text-slate-500">Manage doorstep delivery locations across India</p>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Add Address Form Modal / Box */}
          {showAddAddress && (
            <form onSubmit={handleSaveAddress} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Add New Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="text-xs">
                <label className="block text-slate-700 font-semibold mb-1">Street Address / House No.</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  placeholder="Flat 101, Park Heights"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* List of saved addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(currentUser.addresses || []).map((addr) => (
              <div key={addr.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">{addr.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[10px]">
                      {addr.type}
                    </span>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 mt-1">{addr.street}</p>
                <p className="text-slate-500 mt-0.5">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-slate-500 font-mono text-[11px] mt-1">📞 {addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 font-heading">Saved to Wishlist</h3>
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Your wishlist is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wishlistProducts.map((p) => (
                <div key={p.id} className="p-3 bg-white rounded-2xl border border-slate-200 flex gap-3 items-center text-xs">
                  <img src={p.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{p.title}</h4>
                    <p className="font-bold text-purple-900 mt-0.5">{formatINR(p.price)}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Cart</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 font-heading">Order History</h3>
          {userOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((ord) => (
                <div key={ord.id} className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{ord.id}</span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        • {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-800">
                        {ord.status}
                      </span>
                      <button
                        onClick={() => {
                          setTrackingOrderId(ord.id);
                          setIsTrackingOpen(true);
                        }}
                        className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Package className="w-3 h-3" />
                        <span>Track</span>
                      </button>
                    </div>
                  </div>

                  {/* Items in order */}
                  <div className="flex gap-2 overflow-x-auto">
                    {ord.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl shrink-0">
                        <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] truncate max-w-[120px]">{item.title}</div>
                          <div className="text-[10px] text-slate-500">Qty: {item.quantity} • {formatINR(item.price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
                    <span>Paid via {ord.paymentMethod}</span>
                    <span className="font-extrabold text-sm text-slate-900 font-heading">
                      Total: {formatINR(ord.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

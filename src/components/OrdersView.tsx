import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  Download,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../utils/shopLogic';

export const OrdersView: React.FC = () => {
  const {
    userOrders,
    currentUser,
    setTrackingOrderId,
    setIsTrackingOpen,
    addToCart,
    showToast,
    refreshUserOrders,
  } = useShop();

  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filtered = userOrders.filter((o) =>
    filterStatus === 'All' ? true : o.status === filterStatus
  );

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Cancelled',
          description: 'Cancelled by customer via self-service portal',
        }),
      });
      if (res.ok) {
        showToast(`Order #${orderId} has been cancelled`, 'info');
        refreshUserOrders();
      }
    } catch {
      showToast('Failed to cancel order', 'error');
    }
  };

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      addToCart(item, item.quantity);
    });
    showToast('Items added to cart!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" />
            <h1 className="text-2xl font-black font-heading">My Orders & Invoices</h1>
          </div>
          <p className="text-purple-200 text-xs mt-1">
            Track real-time shipment status, download tax invoices, and manage past purchases.
          </p>
        </div>

        <button
          onClick={() => setIsTrackingOpen(true)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Package className="w-4 h-4 text-orange-300" />
          <span>Track by Order ID</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 text-xs font-semibold">
        {['All', 'Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
              filterStatus === st
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white hover:bg-purple-50 text-slate-600 border border-slate-200'
            }`}
          >
            {st} {st === 'All' ? `(${userOrders.length})` : ''}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {filterStatus === 'All'
              ? 'You have not placed any orders yet. Explore our top deals to get started!'
              : `No orders currently in "${filterStatus}" status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden text-xs"
            >
              {/* Order Card Header */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-mono font-extrabold text-sm text-purple-950">
                      {order.id}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Order Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTrackingOrderId(order.id);
                      setIsTrackingOpen(true);
                    }}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                  </button>

                  <button
                    onClick={() => showToast(`Downloaded invoice for ${order.id}`, 'success')}
                    className="p-1.5 bg-white border border-slate-200 hover:border-purple-300 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="Download Tax Invoice"
                  >
                    <Download className="w-4 h-4 text-purple-700" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 text-xs truncate max-w-xs sm:max-w-md">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Brand: {item.brand} • Qty: {item.quantity}{' '}
                          {item.selectedVariant && `• Option: ${item.selectedVariant}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900 font-heading">
                        {formatINR(item.price * item.quantity)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatINR(item.price)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer with Destination & Actions */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                <div>
                  Delivered to: <strong className="text-slate-800">{order.address.name}</strong>,{' '}
                  {order.address.city} - {order.address.pincode} •{' '}
                  <span className="font-medium text-slate-700">Payment: {order.paymentMethod}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    Total Paid:{' '}
                    <strong className="text-purple-950 font-heading font-black text-sm">
                      {formatINR(order.total)}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleReorder(order)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold rounded-lg cursor-pointer"
                  >
                    Buy Again
                  </button>

                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-2.5 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

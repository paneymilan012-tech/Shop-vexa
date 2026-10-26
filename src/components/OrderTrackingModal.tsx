import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  CheckCircle,
  Truck,
  Clock,
  MapPin,
  Search,
  AlertCircle,
  Receipt,
  Download,
  Share2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order, OrderStatus } from '../types';
import { formatINR } from '../utils/shopLogic';

const ORDER_STEPS: OrderStatus[] = [
  'Placed',
  'Confirmed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const OrderTrackingModal: React.FC = () => {
  const {
    isTrackingOpen,
    setIsTrackingOpen,
    trackingOrderId,
    setTrackingOrderId,
    showToast,
  } = useShop();

  const [inputQuery, setInputQuery] = useState(trackingOrderId || 'SVX-849201');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (queryId: string) => {
    if (!queryId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(queryId.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No order found with this ID');
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch {
      setError('Failed to reach tracking server');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingOrderId) {
      setInputQuery(trackingOrderId);
      fetchOrder(trackingOrderId);
    } else {
      fetchOrder('SVX-849201');
    }
  }, [trackingOrderId, isTrackingOpen]);

  if (!isTrackingOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(inputQuery);
  };

  // Determine active step index
  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return ORDER_STEPS.indexOf(status);
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-purple-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base font-heading">Track Shipment Live</h2>
              <p className="text-[11px] text-purple-200">
                Real-time express logistics tracking across India
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTrackingOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close tracking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar for Order ID */}
        <div className="p-4 bg-purple-50/60 border-b border-purple-100">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. SVX-849201) or AWB Tracking #"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Locating...' : 'Track'}
            </button>
          </form>

          {/* Quick chip demo IDs */}
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
            <span>Demo Orders:</span>
            <button
              type="button"
              onClick={() => {
                setInputQuery('SVX-849201');
                fetchOrder('SVX-849201');
              }}
              className="font-mono text-purple-700 hover:underline bg-white px-1.5 py-0.5 rounded border border-purple-200 cursor-pointer"
            >
              SVX-849201 (Shipped)
            </button>
            <button
              type="button"
              onClick={() => {
                setInputQuery('SVX-520193');
                fetchOrder('SVX-520193');
              }}
              className="font-mono text-purple-700 hover:underline bg-white px-1.5 py-0.5 rounded border border-purple-200 cursor-pointer"
            >
              SVX-520193 (Delivered)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <>
              {/* Top Order Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {order.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    AWB: <span className="font-mono font-medium">{order.trackingNumber}</span> • Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Estimated Delivery</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {order.status === 'Delivered' ? 'Delivered' : order.estimatedDeliveryDate}
                  </div>
                </div>
              </div>

              {/* Status Timeline Stepper */}
              {order.status !== 'Cancelled' ? (
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                    Tracking Progress:
                  </h3>
                  <div className="relative flex items-center justify-between">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0">
                      <div
                        className="h-full bg-purple-600 transition-all duration-500"
                        style={{
                          width: `${(Math.max(0, currentStepIdx) / (ORDER_STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {ORDER_STEPS.map((s, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={s} className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs ${
                              isCompleted
                                ? 'bg-purple-700 text-white'
                                : 'bg-white border-2 border-slate-200 text-slate-400'
                            } ${isCurrent ? 'ring-4 ring-purple-100' : ''}`}
                          >
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 max-w-[65px] font-medium leading-tight ${
                              isCompleted ? 'text-slate-900 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {s}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
                  This order was cancelled. Any authorized amounts have been refunded to the source account.
                </div>
              )}

              {/* Status Milestones log */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Shipment Activity:
                </h3>
                <div className="space-y-2 border-l-2 border-purple-200 pl-3 ml-2">
                  {order.statusHistory.map((hist, hIdx) => (
                    <div key={hIdx} className="relative pb-2 text-xs">
                      <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{hist.status}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(hist.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{hist.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in order */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Package Contents ({order.items.length}):
                </h3>
                <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl p-3 border border-slate-200">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />
                        <div>
                          <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Qty: {item.quantity} {item.selectedVariant && `• ${item.selectedVariant}`}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 font-heading">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Payment details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>Shipping Address</span>
                  </div>
                  <p className="font-bold text-slate-900">{order.address.name}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">{order.address.street}</p>
                  <p className="text-slate-500 text-[11px]">
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                  <p className="text-slate-500 text-[11px]">📞 {order.address.phone}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Receipt className="w-3.5 h-3.5 text-purple-600" />
                    <span>Payment Information</span>
                  </div>
                  <p className="font-bold text-slate-900">
                    Method: {order.paymentMethod}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Status: {order.paymentDetails.isPaid ? 'Paid in Full' : 'Cash on Delivery'}
                  </p>
                  {order.paymentDetails.maskedCardNumber && (
                    <p className="text-[11px] font-mono text-slate-500">
                      Card: {order.paymentDetails.maskedCardNumber} ({order.paymentDetails.cardNetwork})
                    </p>
                  )}
                  {order.paymentDetails.upiId && (
                    <p className="text-[11px] font-mono text-slate-500">
                      UPI: {order.paymentDetails.upiId}
                    </p>
                  )}
                  <p className="text-[11px] font-bold text-purple-900 mt-1">
                    Total Amount: {formatINR(order.total)}
                  </p>
                </div>
              </div>

              {/* Simulated Invoice Download */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => showToast(`Invoice for ${order.id} downloaded!`, 'success')}
                  className="px-4 py-2 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600" />
                  <span>Download Tax Invoice (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTrackingOpen(false)}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

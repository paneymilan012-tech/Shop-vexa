import React, { useState } from 'react';
import {
  X,
  MapPin,
  CreditCard,
  CheckCircle,
  Truck,
  ShieldCheck,
  ChevronRight,
  Plus,
  QrCode,
  Smartphone,
  Banknote,
  Building,
  AlertCircle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PaymentMethod, UserAddress } from '../types';
import { detectCardNetwork, formatINR, validateTestCard } from '../utils/shopLogic';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    pricing,
    appliedCoupon,
    currentUser,
    isCheckoutOpen,
    setIsCheckoutOpen,
    placeOrder,
    setTrackingOrderId,
    setIsTrackingOpen,
    showToast,
  } = useShop();

  // Steps: 'address' -> 'payment' -> 'success'
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');

  // Address selection & form
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    currentUser?.addresses?.[0]?.id || 'new'
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    !currentUser?.addresses || currentUser.addresses.length === 0
  );

  const [addressForm, setAddressForm] = useState<UserAddress>({
    id: `addr-${Date.now()}`,
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    street: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    type: 'Home',
    isDefault: true,
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Milan Pandey');
  const [upiId, setUpiId] = useState('milan@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [codOtpVerified, setCodOtpVerified] = useState(false);
  const [codOtpInput, setCodOtpInput] = useState('8492');

  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  if (!isCheckoutOpen) return null;

  // Selected Address object
  const currentAddress: UserAddress =
    selectedAddressId === 'new' || showNewAddressForm
      ? addressForm
      : currentUser?.addresses.find((a) => a.id === selectedAddressId) || addressForm;

  // Fill pre-configured test cards for seamless testing
  const fillTestCard = (type: 'visa' | 'rupay' | 'mastercard') => {
    if (type === 'visa') {
      setCardNumber('4111 2222 3333 4444');
      setCardExpiry('12/28');
      setCardCvv('123');
    } else if (type === 'rupay') {
      setCardNumber('6073 1234 5678 9012');
      setCardExpiry('08/29');
      setCardCvv('456');
    } else if (type === 'mastercard') {
      setCardNumber('5105 1051 0510 5100');
      setCardExpiry('10/27');
      setCardCvv('789');
    }
    setPaymentError('');
  };

  const handleAddressProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAddress.name || !currentAddress.phone || !currentAddress.street || !currentAddress.pincode) {
      showToast('Please fill all mandatory address fields', 'error');
      return;
    }
    if (currentAddress.pincode.length !== 6 || isNaN(Number(currentAddress.pincode))) {
      showToast('Enter a valid 6-digit Indian PIN code', 'error');
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setPaymentError('');
    setProcessing(true);

    try {
      // Validate payment if CARD
      if (paymentMethod === 'CARD') {
        const check = validateTestCard(cardNumber, cardExpiry, cardCvv);
        if (!check.isValid) {
          setPaymentError(check.error || 'Invalid card information');
          setProcessing(false);
          return;
        }
      }

      // If COD, ensure verified
      if (paymentMethod === 'COD' && !codOtpVerified) {
        setCodOtpVerified(true);
      }

      const orderPayload = {
        userId: currentUser?.id || 'guest-user',
        userEmail: currentUser?.email || 'customer@shopvexa.in',
        userName: currentAddress.name,
        items: cart,
        address: currentAddress,
        paymentMethod,
        paymentInput: {
          cardNumber,
          expiry: cardExpiry,
          cvv: cardCvv,
          cardHolder,
          upiId,
          bankName: selectedBank,
        },
        couponCode: appliedCoupon?.code,
      };

      const order = await placeOrder(orderPayload);
      setCompletedOrder(order);
      setStep('success');
      showToast(`Order #${order.id} placed successfully!`, 'success');
    } catch (err: any) {
      setPaymentError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-purple-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
              <h2 className="font-extrabold text-base sm:text-lg font-heading">
                ShopVexa Express Checkout
              </h2>
            </div>
            <p className="text-[11px] text-purple-200 mt-0.5">
              100% Encrypted & Safe • Cash on Delivery & Instant UPI Available
            </p>
          </div>

          {step !== 'success' && (
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        {step !== 'success' && (
          <div className="bg-purple-50 px-6 py-2.5 border-b border-purple-100 flex items-center justify-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setStep('address')}
              className={`flex items-center gap-1.5 cursor-pointer ${
                step === 'address' ? 'text-purple-700 font-bold' : 'text-slate-500'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'address' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>Delivery Address</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-300" />

            <button
              onClick={() => {
                if (currentAddress.street && currentAddress.pincode) setStep('payment');
              }}
              className={`flex items-center gap-1.5 cursor-pointer ${
                step === 'payment' ? 'text-purple-700 font-bold' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'payment' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                2
              </span>
              <span>Payment & Place Order</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800">
          {/* STEP 1: DELIVERY ADDRESS */}
          {step === 'address' && (
            <form onSubmit={handleAddressProceed} className="space-y-5">
              {/* Existing Addresses */}
              {currentUser?.addresses && currentUser.addresses.length > 0 && !showNewAddressForm && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Select Saved Address:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentUser.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                          selectedAddressId === addr.id
                            ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900">{addr.name}</span>
                          <span className="text-[10px] uppercase font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            {addr.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{addr.street}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">📞 {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Form */}
              {(showNewAddressForm || !currentUser?.addresses?.length) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Delivery Address in India:
                    </h3>
                    {currentUser?.addresses && currentUser.addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-xs text-purple-700 hover:underline cursor-pointer"
                      >
                        Use Saved Address
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        placeholder="e.g. Milan Pandey"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        10-Digit Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Flat / House No. / Building / Street Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="e.g. Flat 402, Royal Palms Residency, 100ft Ring Road, Indiranagar"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        placeholder="560038"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="Bengaluru"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="Karnataka"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressForm.landmark || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                      placeholder="e.g. Near Metro Pillar 124"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Address Type:
                    </label>
                    <div className="flex gap-2">
                      {(['Home', 'Work', 'Other'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAddressForm({ ...addressForm, type: t })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${
                            addressForm.type === t
                              ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items Preview */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="font-semibold text-slate-800 mb-1.5">
                  Items to deliver ({cart.reduce((s, i) => s + i.quantity, 0)}):
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shrink-0">
                      <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <div className="text-left">
                        <div className="font-bold text-[11px] truncate max-w-[120px]">{item.title}</div>
                        <div className="text-[10px] text-slate-500">Qty: {item.quantity} • {formatINR(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue to Payment button */}
              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <div>
                  <div className="text-[11px] text-slate-500">Payable Amount:</div>
                  <div className="text-base font-extrabold text-purple-950 font-heading">
                    {formatINR(pricing.total)}
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT & CONFIRMATION */}
          {step === 'payment' && (
            <div className="space-y-5">
              {paymentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Payment Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Choose Payment Method:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('CARD');
                      setPaymentError('');
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'CARD'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Debit/Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('UPI');
                      setPaymentError('');
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'UPI'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs">Instant UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('COD');
                      setPaymentError('');
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'COD'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">Cash on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('NETBANKING');
                      setPaymentError('');
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'NETBANKING'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Building className="w-5 h-5 text-amber-600" />
                    <span className="text-xs">Net Banking</span>
                  </button>
                </div>
              </div>

              {/* CARD PAYMENT FORM */}
              {paymentMethod === 'CARD' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  {/* Test Cards Selector Chips */}
                  <div className="bg-purple-100/70 p-2.5 rounded-xl border border-purple-200">
                    <div className="text-[11px] font-bold text-purple-900 mb-1.5 flex items-center justify-between">
                      <span>🧪 TEST GATEWAY: Click to auto-fill sample card:</span>
                      <span className="text-[10px] text-purple-700">Safe sandbox</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => fillTestCard('visa')}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-purple-300 rounded-lg text-xs font-semibold text-purple-900 cursor-pointer"
                      >
                        Visa (4111...)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('rupay')}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-purple-300 rounded-lg text-xs font-semibold text-purple-900 cursor-pointer"
                      >
                        RuPay (6073...)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('mastercard')}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-purple-300 rounded-lg text-xs font-semibold text-purple-900 cursor-pointer"
                      >
                        Mastercard (5105...)
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">Card Number</label>
                      <span className="text-xs font-bold text-purple-700">
                        {detectCardNetwork(cardNumber)}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on Card"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Raw card data is never stored on disk. Encrypted test sandbox.</span>
                  </div>
                </div>
              )}

              {/* UPI PAYMENT */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-center">
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 max-w-xs mx-auto">
                    <QrCode className="w-28 h-28 text-purple-900" />
                    <span className="text-[11px] text-slate-500 mt-1">Scan with GPay, PhonePe, Paytm, or BHIM</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Or enter UPI ID / VPA</label>
                    <div className="flex gap-2 max-w-sm mx-auto">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600"
                      />
                      <button
                        type="button"
                        onClick={() => showToast('UPI ID verified successfully!', 'success')}
                        className="px-3 py-2 bg-purple-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CASH ON DELIVERY (COD) */}
              {paymentMethod === 'COD' && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Banknote className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">Cash on Delivery (COD) Selected</h4>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Pay exact cash or scan delivery partner QR code upon doorstep arrival.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs">
                    <div className="font-semibold text-slate-800 mb-1">Delivery Security Verification:</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Auto-generated OTP:</span>
                      <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-purple-900">
                        8492
                      </span>
                      <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
                        <input
                          type="checkbox"
                          checked={codOtpVerified}
                          onChange={(e) => setCodOtpVerified(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-[11px] font-semibold text-emerald-800">Confirm COD Order</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* NET BANKING */}
              {paymentMethod === 'NETBANKING' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">Select Bank:</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2 rounded-xl border text-left cursor-pointer ${
                          selectedBank === b
                            ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Bill Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span>Deliver To:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {currentAddress.name}, {currentAddress.city} ({currentAddress.pincode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatINR(pricing.subtotal)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount ({appliedCoupon?.code}):</span>
                    <span>-{formatINR(pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className={pricing.shippingFee === 0 ? 'text-emerald-600 font-semibold' : 'text-slate-800'}>
                    {pricing.shippingFee === 0 ? 'FREE' : formatINR(pricing.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2 font-heading">
                  <span>Total Payable:</span>
                  <span className="text-purple-900">{formatINR(pricing.total)}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back to Address
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={handlePlaceOrder}
                  className="px-7 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
                >
                  {processing ? (
                    <span>Authorizing Payment...</span>
                  ) : (
                    <>
                      <span>Pay & Confirm Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER SUCCESS & TRACKING PREVIEW */}
          {step === 'success' && completedOrder && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Thank you for shopping with ShopVexa. A confirmation SMS & email has been dispatched to{' '}
                  <strong className="text-slate-700">{completedOrder.userEmail}</strong>.
                </p>
              </div>

              {/* Order Snapshot Card */}
              <div className="max-w-md mx-auto bg-purple-50/60 border border-purple-100 rounded-2xl p-4 text-xs text-left space-y-2">
                <div className="flex justify-between border-b border-purple-100 pb-2">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-purple-900">{completedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-purple-100 pb-2">
                  <span className="text-slate-500">Tracking Number:</span>
                  <span className="font-mono font-semibold text-slate-800">{completedOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between border-b border-purple-100 pb-2">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-semibold text-emerald-700">{completedOrder.estimatedDeliveryDate}</span>
                </div>
                <div className="flex justify-between border-b border-purple-100 pb-2">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-semibold text-slate-800">
                    {completedOrder.paymentMethod} • {completedOrder.paymentDetails.isPaid ? 'Paid' : 'Pending (COD)'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-slate-900">
                  <span>Total Paid:</span>
                  <span className="text-purple-900">{formatINR(completedOrder.total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setTrackingOrderId(completedOrder.id);
                    setIsTrackingOpen(true);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Track This Order Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setStep('address');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

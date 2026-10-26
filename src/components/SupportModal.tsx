import React, { useState } from 'react';
import {
  Headphones,
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const SupportModal: React.FC = () => {
  const { currentUser, showToast } = useShop();

  const [activeSupportTab, setActiveSupportTab] = useState<'faqs' | 'ticket' | 'chat'>('faqs');

  // FAQs Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqs = [
    {
      q: 'How does Cash on Delivery (COD) work on ShopVexa?',
      a: 'We offer Cash on Delivery across 19,000+ Indian PIN codes. You can pay via cash or by scanning our delivery partner’s UPI QR code right at your doorstep. No extra surcharge is levied!',
    },
    {
      q: 'What is the 7-Day Easy Return & Replacement Policy?',
      a: 'If your item is damaged, defective, or different from described, you can initiate a return or replacement within 7 days of delivery through the Orders section. Free reverse doorstep pickup is arranged within 24-48 hours.',
    },
    {
      q: 'What are the delivery timelines across India?',
      a: 'Metro cities (Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Chennai, Kolkata): 2-3 business days. Tier 2 & Tier 3 cities: 3-5 business days. Remote areas: 5-7 business days.',
    },
    {
      q: 'Are all products 100% genuine with brand warranty?',
      a: 'Yes, ShopVexa sources directly from authorized Indian brand distributors. All consumer electronics and gadgets include 1 to 2 years of official manufacturer warranty.',
    },
  ];

  // Ticket Form
  const [ticketName, setTicketName] = useState(currentUser?.name || '');
  const [ticketEmail, setTicketEmail] = useState(currentUser?.email || '');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketCategory, setTicketCategory] = useState<any>('Order Status');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName || !ticketEmail || !ticketMessage) {
      showToast('Please complete all required fields', 'error');
      return;
    }
    setSubmittingTicket(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ticketName,
          email: ticketEmail,
          orderId: ticketOrderId,
          category: ticketCategory,
          message: ticketMessage,
        }),
      });
      if (res.ok) {
        setTicketSubmitted(true);
        showToast('Support ticket logged successfully!', 'success');
      }
    } catch {
      showToast('Failed to submit ticket', 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Live Concierge Chatbot Simulation
  const [chatMessages, setChatMessages] = useState<{ sender: 'bot' | 'user'; text: string; time: string }[]>([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to ShopVexa Support. How may I assist you today? You can ask about order tracking, delivery times, or returns.',
      time: '10:00 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (textToSend?: string) => {
    const query = (textToSend || chatInput).trim();
    if (!query) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulated Smart Support Bot Response
    setTimeout(() => {
      let reply = 'Our executive will review this and assist you shortly.';
      const lower = query.toLowerCase();

      if (lower.includes('track') || lower.includes('where is my order') || lower.includes('order status')) {
        reply = 'You can track any order live using the "Track Order" link in our top navigation bar with your Order ID (e.g. SVX-849201). Deliveries usually reach within 2-4 business days.';
      } else if (lower.includes('return') || lower.includes('refund')) {
        reply = 'We provide a 7-day hassle-free replacement and return policy on all eligible purchases! Doorstep reverse pickup is completely free.';
      } else if (lower.includes('cod') || lower.includes('cash')) {
        reply = 'Yes! Cash on Delivery is available across all Indian pincodes. You can also pay via UPI QR upon parcel arrival.';
      } else if (lower.includes('coupon') || lower.includes('discount')) {
        reply = 'Use promo code VEXA20 for 20% instant discount (up to ₹500) or WELCOME100 for ₹100 off on your first order!';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Support Hero Card */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold mb-2 border border-orange-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>24/7 Dedicated Concierge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            How can we help you today?
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-lg">
            Have questions about an order, delivery times, or returns? Our Indian support team is here to assist you 24/7.
          </p>
        </div>

        {/* Quick Contact Chips */}
        <div className="flex flex-col gap-2 text-xs text-purple-100 shrink-0">
          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
            <Phone className="w-4 h-4 text-orange-300" />
            <span>1800-SHOP-VEXA (Toll Free)</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
            <Mail className="w-4 h-4 text-orange-300" />
            <span>support@shopvexa.in</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveSupportTab('faqs')}
          className={`pb-3 px-1 transition-colors cursor-pointer ${
            activeSupportTab === 'faqs'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Frequently Asked Questions
        </button>
        <button
          onClick={() => setActiveSupportTab('chat')}
          className={`pb-3 px-1 transition-colors cursor-pointer ${
            activeSupportTab === 'chat'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Virtual Assistant
        </button>
        <button
          onClick={() => setActiveSupportTab('ticket')}
          className={`pb-3 px-1 transition-colors cursor-pointer ${
            activeSupportTab === 'ticket'
              ? 'border-b-2 border-purple-600 text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Raise Support Ticket
        </button>
      </div>

      {/* TAB 1: FAQS */}
      {activeSupportTab === 'faqs' && (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-between gap-3 cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-purple-700 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE CHATBOT */}
      {activeSupportTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[460px]">
          {/* Chat Header */}
          <div className="bg-purple-50 p-3.5 border-b border-purple-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800">ShopVexa Smart Concierge</div>
              <div className="text-[10px] text-emerald-600 font-medium">● Online • Instant Reply</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-purple-700 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Suggested Quick Prompts */}
          <div className="p-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSendChat('Where is my order?')}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shrink-0 cursor-pointer"
            >
              Where is my order?
            </button>
            <button
              onClick={() => handleSendChat('What is your return policy?')}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shrink-0 cursor-pointer"
            >
              Return policy
            </button>
            <button
              onClick={() => handleSendChat('Available coupon codes')}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shrink-0 cursor-pointer"
            >
              Coupons
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="p-3 bg-white border-t border-slate-200 flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about products, delivery or payment..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SUPPORT TICKET */}
      {activeSupportTab === 'ticket' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          {ticketSubmitted ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Ticket Logged Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We've received your request and our resolution specialist will contact you at{' '}
                <strong className="text-slate-700">{ticketEmail}</strong> within 2 business hours.
              </p>
              <button
                type="button"
                onClick={() => setTicketSubmitted(false)}
                className="px-5 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Order ID (Optional)</label>
                  <input
                    type="text"
                    value={ticketOrderId}
                    onChange={(e) => setTicketOrderId(e.target.value)}
                    placeholder="e.g. SVX-849201"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Inquiry Type</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option>Order Status</option>
                    <option>Payment & Refund</option>
                    <option>Product Inquiry</option>
                    <option>Returns & Exchange</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Describe Your Issue *</label>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Please share detailed information regarding your inquiry..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={submittingTicket}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {submittingTicket ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import {
  Bot, ChevronDown, MessageSquare, RefreshCw, Send, Sparkles, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import http from '../services/http';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BookingConciergeProps {
  bookingId: number;
  productName?: string;
  location?:   string;
}

// ── Quick question chips ──────────────────────────────────────────────────────
const QUICK_QUESTIONS = [
  'Apa yang perlu dibawa?',
  'Restoran halal terdekat?',
  'Tips persiapan sebelum berangkat',
  'Cuaca seperti apa di sana?',
  'Cara ke lokasi dari bandara?',
];

// ── Bubble component ──────────────────────────────────────────────────────────
const ChatBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
  >
    {msg.role === 'assistant' && (
      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-3 h-3 text-primary-600" />
      </div>
    )}
    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
      msg.role === 'user'
        ? 'bg-primary-600 text-white rounded-br-none'
        : 'bg-gray-100 text-gray-700 rounded-bl-none'
    }`}>
      {msg.content}
    </div>
  </motion.div>
);

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-2 items-start">
    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
      <Bot className="w-3 h-3 text-primary-600" />
    </div>
    <div className="bg-gray-100 rounded-2xl rounded-bl-none px-3 py-2.5 flex items-center gap-1">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.span key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay, ease: 'easeInOut' }}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"
        />
      ))}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const BookingConcierge: React.FC<BookingConciergeProps> = ({
  bookingId, productName, location,
}) => {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [error,     setError]     = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Greeting saat pertama kali dibuka
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      const greeting = `Halo! Saya concierge AI untuk booking **${productName ?? 'paketmu'}**${location ? ` di ${location}` : ''}. Ada yang bisa saya bantu? Misalnya tips persiapan, rekomendasi tempat makan, atau informasi lokal di sekitar destinasi kamu.`;
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, hasOpened, productName, location]);

  // Auto scroll ke bawah
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isOpen, isLoading]);

  const sendMessage = async (text: string) => {
    const userText = text.trim();
    if (!userText || isLoading) return;

    setInput('');
    setError('');

    const userMsg: ChatMessage = { role: 'user', content: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await http.post('/ai/concierge/chat', {
        bookingId,
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
      });

      if (res.data?.error) throw new Error(res.data.message);

      const reply = res.data.data.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Gagal terhubung ke AI.';
      const isRateLimit = err?.response?.data?.code === 'RATE_LIMIT';
      setError(isRateLimit ? 'AI sedang sibuk. Tunggu sebentar lalu coba lagi.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);
  const handleQuick = (q: string) => sendMessage(q);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClear = () => {
    setMessages([]);
    setHasOpened(false);
    setError('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        whileTap={{ scale: 0.96 }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
          isOpen
            ? 'bg-primary-50 border-primary-200 text-primary-700'
            : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200 hover:bg-primary-50/50'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-bold leading-none mb-0.5">Tanya AI Concierge</p>
          <p className="text-[10px] text-gray-400 leading-none">Tips persiapan, kuliner, info lokal</p>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        </motion.div>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <Bot className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-xs font-bold text-gray-700 flex-1">AI Concierge</span>
                <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  Online
                </span>
                <button onClick={handleClear} className="text-gray-300 hover:text-gray-500 transition-colors ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Messages */}
              <div className="px-3 py-3 space-y-3 max-h-72 overflow-y-auto">
                {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                {isLoading && <TypingIndicator />}
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-2">
                    <p className="text-[10px] text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick questions */}
              {messages.length <= 1 && !isLoading && (
                <div className="px-3 pb-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Pertanyaan umum</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map(q => (
                      <button key={q} onClick={() => handleQuick(q)} disabled={isLoading}
                        className="text-[10px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all disabled:opacity-40">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2 p-3 border-t border-gray-50">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya apa saja tentang tripmu..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-all disabled:opacity-50"
                />
                <motion.button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 flex items-center justify-center bg-primary-600 text-white rounded-xl disabled:opacity-40 hover:bg-primary-700 transition-colors flex-shrink-0"
                >
                  {isLoading
                    ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><RefreshCw className="w-3.5 h-3.5" /></motion.span>
                    : <Send className="w-3.5 h-3.5" />
                  }
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingConcierge;


// ─────────────────────────────────────────────────────────────────────────────
// CARA INTEGRASI — taruh di halaman booking detail customer
// ─────────────────────────────────────────────────────────────────────────────
//
// Import:
//   import BookingConcierge from '../../components/BookingConcierge';
//
// Render di halaman booking detail, setelah info booking:
//
//   <BookingConcierge
//     bookingId={booking.id}
//     productName={booking.product_name}
//     location={booking.location}
//   />
//
// Pastikan route booking detail ada di customer routes, e.g.:
//   GET /api/v1/customer/bookings/:id
//
// Komponen ini bisa juga dipakai di halaman "My Bookings" list —
// tambahkan sebagai expandable panel per booking item.

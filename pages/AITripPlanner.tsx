import {
  AlertCircle, ArrowRight, Bookmark, BookmarkCheck,
  Calendar, Check, ChevronDown, Clock, Download,
  Lightbulb, Link2, Map, MapPin, MessageSquare, Package,
  RefreshCw, Send, Share2, ShoppingCart, Sparkles, Star,
  Sunrise, Sunset, UtensilsCrossed, Wallet, X, Users,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  generateTripPlan, refineTripPlan, saveItinerary as saveItineraryAPI,
  ConvMessage, TravelDates,
} from '../services/aiTripService';
import { useAuth } from '../AuthContext';
import { useCart } from '../components/CartContext';
import { useToast } from '../components/ToastContext';
import { Product } from '../types';
import { encodeId } from '../utils/hashids';
import { generateSlug } from '../utils/slugify';
import ItineraryMap from '../components/ItineraryMap';

// ── Variants ──────────────────────────────────────────────────────────────────
const fadeUp: Variants     = { hidden: { opacity: 0, y: 20 },  show: { opacity: 1, y: 0,  transition: { duration: 0.4, ease: 'easeOut' } } };
const stagger: Variants    = { hidden: {},                      show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const fadeIn: Variants     = { hidden: { opacity: 0 },          show: { opacity: 1,        transition: { duration: 0.35 } } };
const slideLeft: Variants  = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0,  transition: { duration: 0.4, ease: 'easeOut' } } };
const slideRight: Variants = { hidden: { opacity: 0, x: 16 },  show: { opacity: 1, x: 0,  transition: { duration: 0.4, ease: 'easeOut' } } };

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return num.toLocaleString('id-ID');
}

function toDateStr(date: Date | null): string {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDateStr(s: string): Date | null { return s ? new Date(s) : null; }

function formatDisplayDate(s: string): string {
  if (!s) return '';
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface DaySection { day: number; title: string; body: string; }

function parseItineraryToDays(text: string): DaySection[] {
  if (!text) return [];
  const matches = [...text.matchAll(/^(#{1,3}\s*(Day\s*\d+|Hari\s*(ke-?)?\d+)[^\n]*)/gim)];
  if (matches.length === 0) return [];
  return matches.map((m, i) => {
    const start   = m.index!;
    const end     = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const heading = m[0].replace(/^#+\s*/, '').trim();
    const body    = text.slice(start + m[0].length, end).trim();
    const n       = heading.match(/\d+/);
    return { day: n ? parseInt(n[0]) : i + 1, title: heading, body };
  });
}

function getDayIcon(body: string) {
  const l = body.toLowerCase();
  if (l.includes('sunrise') || l.includes('pagi') || l.includes('morning')) return <Sunrise className="w-3.5 h-3.5" />;
  if (l.includes('dinner')  || l.includes('makan malam'))                   return <UtensilsCrossed className="w-3.5 h-3.5" />;
  if (l.includes('sunset')  || l.includes('sore'))                          return <Sunset className="w-3.5 h-3.5" />;
  return <Calendar className="w-3.5 h-3.5" />;
}

function findUpsell(bookedProduct: Product, allProducts: Product[], cartAdded: Set<number>): Product | null {
  const bookedCat  = categoryLabel(bookedProduct.category_id);
  const bookedCity = bookedProduct.location?.split(',')[0]?.trim().toLowerCase() ?? '';
  const sameCity   = allProducts.find(p =>
    !cartAdded.has(p.id) && p.id !== bookedProduct.id &&
    categoryLabel(p.category_id) !== bookedCat &&
    p.location?.toLowerCase().includes(bookedCity)
  );
  if (sameCity) return sameCity;
  return allProducts.find(p =>
    !cartAdded.has(p.id) && p.id !== bookedProduct.id &&
    categoryLabel(p.category_id) !== bookedCat
  ) ?? null;
}

const DAY_ORDINALS: Record<number, string> = {
  1: 'Hari Pertama', 2: 'Hari Kedua',   3: 'Hari Ketiga',
  4: 'Hari Keempat', 5: 'Hari Kelima',  6: 'Hari Keenam', 7: 'Hari Ketujuh',
};

function categoryLabel(catId: number): string {
  if (catId === 1 || catId === 3) return 'Tour';
  if (catId === 2)                 return 'Stay';
  return 'Transport';
}

function autoTitle(userStory: string): string {
  if (!userStory?.trim()) return 'Trip Plan';
  const s = userStory.trim();
  if (s.length <= 70) return s;
  const cut = s.substring(0, 67);
  const sp  = cut.lastIndexOf(' ');
  return (sp > 30 ? cut.substring(0, sp) : cut) + '...';
}

// ── ScarcityBadge ─────────────────────────────────────────────────────────────
const ScarcityBadge: React.FC<{
  remaining: number | null | undefined;
  urgency:   string | undefined;
}> = ({ remaining, urgency }) => {
  if (!urgency || urgency === 'none' || urgency === 'available' || remaining === null || remaining === undefined)
    return null;

  const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
    sold_out: { bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200',   label: 'Habis terjual' },
    critical: { bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200',   label: `Sisa ${remaining} slot!` },
    low:      { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: `Sisa ${remaining} slot` },
  };

  const c = config[urgency];
  if (!c) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold flex-shrink-0 ${c.bg} ${c.text} ${c.border}`}
    >
      {(urgency === 'critical' || urgency === 'sold_out') ? (
        <motion.span
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-current inline-block"
        />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block opacity-60" />
      )}
      {c.label}
    </motion.div>
  );
};

// ── Date Range Picker ─────────────────────────────────────────────────────────
const DateRangePicker: React.FC<{
  startDate:     string;
  endDate:       string;
  onStartChange: (d: string) => void;
  onEndChange:   (d: string) => void;
  onClear:       () => void;
}> = ({ startDate, endDate, onStartChange, onEndChange, onClear }) => {
  const today = new Date();
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-500" />
            Tanggal Perjalanan <span className="text-gray-400 font-normal">(opsional — untuk cek ketersediaan)</span>
          </p>
          {(startDate || endDate) && (
            <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
              <X className="w-3 h-3" /> Hapus tanggal
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Mulai</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10 pointer-events-none" />
              <DatePicker
                selected={parseDateStr(startDate)}
                onChange={(date: Date | null) => { const s = toDateStr(date); onStartChange(s); if (endDate && s > endDate) onEndChange(''); }}
                minDate={today} dateFormat="dd MMM yyyy" placeholderText="Pilih tanggal"
                wrapperClassName="w-full" popperProps={{ strategy: 'fixed' }} popperPlacement="bottom-start"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Sampai</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10 pointer-events-none" />
              <DatePicker
                selected={parseDateStr(endDate)}
                onChange={(date: Date | null) => onEndChange(toDateStr(date))}
                minDate={parseDateStr(startDate) ?? today} dateFormat="dd MMM yyyy"
                placeholderText={startDate ? 'Pilih tanggal' : 'Pilih mulai dulu'} disabled={!startDate}
                wrapperClassName="w-full" popperProps={{ strategy: 'fixed' }} popperPlacement="bottom-start"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
        {startDate && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-xl px-3 py-2">
            <Check className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
            <p className="text-xs text-primary-700 font-bold">
              {formatDisplayDate(startDate)}
              {endDate && endDate !== startDate && ` – ${formatDisplayDate(endDate)}`}
            </p>
            <span className="text-[10px] text-primary-500 ml-auto">AI akan cek ketersediaan produk</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ── Unavailable Products Panel ────────────────────────────────────────────────
const UnavailablePanel: React.FC<{ products: Product[]; langPath: (p: string) => string }> = ({ products, langPath }) => {
  const [open, setOpen] = useState(false);
  if (products.length === 0) return null;
  return (
    <motion.div variants={fadeUp} className="bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-2 p-4 hover:bg-amber-100/50 transition-colors">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-sm font-bold text-amber-800 flex-1 text-left">{products.length} paket sudah penuh di tanggalmu</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2 border-t border-amber-200">
              <p className="text-xs text-amber-700 mt-3 mb-2">Paket ini tidak tersedia di tanggal yang kamu pilih. Coba ubah tanggal atau pesan di tanggal lain.</p>
              {products.map(p => (
                <Link key={p.id} to={langPath(`/product/${encodeId(p.id)}/${generateSlug(p.name)}`)}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100 hover:border-amber-300 transition-colors group">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center"><X className="w-4 h-4 text-amber-700" /></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 line-clamp-1 group-hover:text-primary-600 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Penuh di tanggal ini · Cek tanggal lain</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Upsell Modal ──────────────────────────────────────────────────────────────
const UpsellModal: React.FC<{
  trigger:   Product; suggested: Product | null; langPath: (p: string) => string;
  onBook: (p: Product) => void; onDismiss: () => void; isBooking: boolean; isInCart: boolean;
}> = ({ trigger, suggested, langPath, onBook, onDismiss, isBooking, isInCart }) => {
  if (!suggested) return null;
  const catLabel = (catId: number) => catId === 1 || catId === 3 ? 'paket tour' : catId === 2 ? 'akomodasi' : 'transport';
  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-primary-100 shadow-xl overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-primary-400 to-orange-400" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wider mb-0.5">Lengkapi perjalananmu</p>
            <p className="text-xs text-gray-600 leading-snug">Tambahkan {catLabel(suggested.category_id)} untuk trip yang lebih lengkap</p>
          </div>
          <button onClick={onDismiss} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5"><X className="w-4 h-4" /></button>
        </div>
        <Link to={langPath(`/product/${encodeId(suggested.id)}/${generateSlug(suggested.name)}`)}
          className="group flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all mb-3" onClick={onDismiss}>
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
            <img src={suggested.image} alt={suggested.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1"><MapPin className="w-2.5 h-2.5" /><span className="truncate">{suggested.location?.split(',')[0]}</span></div>
            <p className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">{suggested.name}</p>
            <p className="text-xs font-bold text-primary-700 mt-1 tabular-nums">{suggested.currency} {formatPrice(suggested.price)}</p>
          </div>
        </Link>
        <div className="flex gap-2">
          <button onClick={onDismiss} className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors">Nanti saja</button>
          <motion.button onClick={() => onBook(suggested)} disabled={isBooking || isInCart} whileTap={!isInCart ? { scale: 0.97 } : {}}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${isInCart ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60'}`}>
            {isBooking ? (<><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} className="inline-block"><RefreshCw className="w-3 h-3" /></motion.span>Menambahkan...</>)
              : isInCart ? (<><Check className="w-3 h-3" />Ditambahkan</>)
              : (<><ShoppingCart className="w-3 h-3" />Tambah ke Cart</>)}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ── Share Dropdown ────────────────────────────────────────────────────────────
const ShareDropdown: React.FC<{
  shareToken: string; itineraryTitle: string; langPath: (p: string) => string;
  onExportPDF: () => void; onClose: () => void;
}> = ({ shareToken, itineraryTitle, langPath, onExportPDF, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { showToast }       = useToast();
  const shareUrl = `${window.location.origin}${langPath(`/itinerary/share/${shareToken}`)}`;
  const handleCopy = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); showToast('Link berhasil disalin!', 'success'); };
  const handleWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(`Lihat rencana perjalananku "${itineraryTitle}" dari Trivgoo AI Trip Planner!\n\n${shareUrl}`)}`, '_blank'); onClose(); };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
      <button onClick={handleCopy} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${copied ? 'bg-green-100' : 'bg-gray-100'}`}>
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5 text-gray-600" />}
        </div>
        <span className="text-xs font-bold text-gray-700">{copied ? 'Link disalin!' : 'Salin Link'}</span>
      </button>
      <button onClick={handleWhatsApp} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.099 1.51 5.82L.057 23.012a.5.5 0 0 0 .617.63l5.354-1.404A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.954 9.954 0 0 1-5.13-1.42l-.37-.22-3.18.834.847-3.084-.241-.389A9.958 9.958 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
        </div>
        <span className="text-xs font-bold text-gray-700">WhatsApp</span>
      </button>
      <button onClick={() => { onExportPDF(); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0"><Download className="w-3.5 h-3.5 text-red-500" /></div>
        <span className="text-xs font-bold text-gray-700">Export PDF</span>
      </button>
    </motion.div>
  );
};

// ── Day Card ──────────────────────────────────────────────────────────────────
const DayCard: React.FC<{ section: DaySection; index: number }> = ({ section, index }) => {
  const [open, setOpen] = useState(index === 0);
  const clean = section.title.replace(/^(Day\s*\d+|Hari\s*(ke-)?\d+)\s*[:\-–]?\s*/i, '');
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 p-4 md:p-5 text-left hover:bg-gray-50/70 transition-colors">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-600 text-white flex flex-col items-center justify-center leading-none shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">Day</span>
          <span className="text-lg font-bold leading-tight">{section.day}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-primary-500 mb-0.5">
            {getDayIcon(section.body)}
            <span className="text-[10px] font-bold uppercase tracking-wider">{DAY_ORDINALS[section.day] ?? `Hari ${section.day}`}</span>
          </div>
          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{clean || section.title}</h4>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="b" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden">
            <div className="px-4 md:px-5 pb-5 border-t border-gray-50 pt-4">
              <div className="prose prose-sm prose-primary max-w-none text-gray-600 leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ul>li]:mb-1.5 [&>h4]:font-bold [&>h4]:text-gray-800 [&>h4]:mt-4 [&>h4]:mb-2 [&>h4]:text-sm [&>strong]:text-gray-800">
                <ReactMarkdown>{section.body}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Budget Estimator ──────────────────────────────────────────────────────────
const BudgetEstimator: React.FC<{ products: Product[] }> = ({ products }) => {
  const [open, setOpen]     = useState(true);
  const [people, setPeople] = useState(2);
  if (products.length === 0) return null;

  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const c = categoryLabel(p.category_id); (acc[c] = acc[c] ?? []).push(p); return acc;
  }, {});
  const totals = products.reduce<Record<string, number>>((acc, p) => {
    const c = p.currency ?? 'IDR'; acc[c] = (acc[c] ?? 0) + parseFloat(String(p.price) || '0'); return acc;
  }, {});
  const catColors: Record<string, string> = {
    Tour: 'bg-blue-50 text-blue-700', Stay: 'bg-purple-50 text-purple-700', Transport: 'bg-amber-50 text-amber-700',
  };

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-2 p-4 hover:bg-gray-50/70 transition-colors">
        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"><Wallet className="w-3.5 h-3.5 text-green-600" /></div>
        <span className="text-sm font-bold text-gray-900 flex-1 text-left">Estimasi Budget</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-3.5 h-3.5 text-gray-400" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="bb" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-gray-50">
              {Object.entries(grouped).map(([cat, prods]) => (
                <div key={cat} className="mt-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catColors[cat] ?? 'bg-gray-100 text-gray-600'}`}>{cat}</span>
                  <div className="mt-2 space-y-1.5">
                    {prods.map(p => (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500 truncate flex-1">{p.name}</span>
                        <span className="text-xs font-bold text-gray-700 flex-shrink-0 tabular-nums">{formatPrice(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200 space-y-1.5">
                {Object.entries(totals).map(([cur, total]) => (
                  <div key={cur} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Total paket</span>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 block leading-none mb-0.5">{cur}</span>
                      <span className="text-base font-bold text-green-700 tabular-nums">{formatPrice(total)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary-500" />Bagi per orang</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPeople(v => Math.max(1, v - 1))} className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors text-sm font-bold leading-none">−</button>
                    <span className="text-sm font-bold text-gray-900 tabular-nums w-4 text-center">{people}</span>
                    <button onClick={() => setPeople(v => Math.min(20, v + 1))} className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors text-sm font-bold leading-none">+</button>
                  </div>
                </div>
                {Object.entries(totals).map(([cur, total]) => (
                  <motion.div key={cur} layout className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-[10px] text-primary-500 font-bold uppercase tracking-wide leading-none mb-0.5">Per orang · {people} traveler</p>
                      <p className="text-[9px] text-primary-400">dibagi rata dari total paket</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-primary-400 block leading-none mb-0.5">{cur}</span>
                      <motion.span key={people} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-base font-bold text-primary-700 tabular-nums">
                        {formatPrice(Math.ceil(total / people))}
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">*Belum termasuk makan, transport lokal, dan biaya tak terduga</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Cart Banner ───────────────────────────────────────────────────────────────
const CartBanner: React.FC<{ count: number; onDismiss: () => void; langPath: (p: string) => string }> = ({ count, onDismiss, langPath }) => (
  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
    className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
    <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0"><ShoppingCart className="w-4 h-4 text-white" /></div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-green-800 leading-none mb-0.5">{count} paket di keranjang</p>
      <p className="text-[10px] text-green-600">Siap untuk di-checkout</p>
    </div>
    <Link to={langPath('/cart')} className="flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-900 transition-colors flex-shrink-0">Lihat <ArrowRight className="w-3 h-3" /></Link>
    <button onClick={onDismiss} className="text-green-400 hover:text-green-600 transition-colors ml-1"><X className="w-3.5 h-3.5" /></button>
  </motion.div>
);

// ── Product Card (with ScarcityBadge) ─────────────────────────────────────────
const ProductCard: React.FC<{
  product: Product; langPath: (p: string) => string;
  isInCart: boolean; isBooking: boolean; onBook: (p: Product) => void;
}> = ({ product, langPath, isInCart, isBooking, onBook }) => (
  <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all overflow-hidden">
    <Link to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)} className="group flex gap-3 p-3 pb-2 block">
      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden relative">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {Number(product.rating) > 4.5 && (
          <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[9px] font-bold shadow-sm flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />{Number(product.rating).toFixed(1)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{product.location}</span>
        </div>
        <h4 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h4>
        {/* ── Scarcity badge + price ── */}
        <div className="mt-1.5">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-[9px] text-gray-400 leading-none">{product.currency}</span>
            <ScarcityBadge
              remaining={(product as any).slotsRemaining}
              urgency={(product as any).scarcityUrgency}
            />
          </div>
          <span className="text-sm font-bold text-primary-700 tabular-nums">{formatPrice(product.price)}</span>
        </div>
      </div>
    </Link>
    <div className="flex gap-2 px-3 pb-3">
      <Link to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">
        Detail <ArrowRight className="w-3 h-3" />
      </Link>
      <motion.button onClick={() => onBook(product)} disabled={isBooking || isInCart} whileTap={!isInCart ? { scale: 0.97 } : {}}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${isInCart ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60'}`}>
        {isBooking ? (<><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} className="inline-block"><RefreshCw className="w-3 h-3" /></motion.span>Menambahkan...</>)
          : isInCart ? (<><Check className="w-3 h-3" />Ditambahkan</>)
          : (<><ShoppingCart className="w-3 h-3" />Pesan</>)}
      </motion.button>
    </div>
  </motion.div>
);

// ── Chat Section ──────────────────────────────────────────────────────────────
interface ChatBubble { role: 'user' | 'assistant'; text: string; }

const ChatSection: React.FC<{ onRefine: (t: string) => Promise<void>; isRefining: boolean; bubbles: ChatBubble[] }> = ({ onRefine, isRefining, bubbles }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isRefining) return;
    setInput('');
    await onRefine(text);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
  };
  const QUICK = ['Kurangi budget', 'Tambah 1 hari', 'Fokus wisata alam', 'Lebih santai'];
  return (
    <motion.div variants={fadeUp} className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <MessageSquare className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-bold text-gray-700">Minta revisi ke AI</span>
        {isRefining && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="ml-auto"><RefreshCw className="w-3.5 h-3.5 text-primary-500" /></motion.div>}
      </div>
      {bubbles.length > 0 && (
        <div className="px-4 pt-3 pb-1 space-y-2 max-h-44 overflow-y-auto">
          {bubbles.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${b.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${b.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-700 rounded-bl-none'}`}>{b.text}</div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
      <div className="px-4 pt-3 flex flex-wrap gap-1.5">
        {QUICK.map(chip => <button key={chip} onClick={() => setInput(chip)} disabled={isRefining} className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-all disabled:opacity-40">{chip}</button>)}
      </div>
      <div className="flex gap-2 p-3">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder='Contoh: "Tambah 1 hari" atau "Kurangi budget jadi 1 juta"' disabled={isRefining}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-all disabled:opacity-50" />
        <motion.button onClick={handleSend} disabled={isRefining || !input.trim()} whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center bg-primary-600 text-white rounded-xl disabled:opacity-40 flex-shrink-0 hover:bg-primary-700 transition-colors">
          {isRefining ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><RefreshCw className="w-4 h-4" /></motion.span> : <Send className="w-4 h-4" />}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ── Skeletons ─────────────────────────────────────────────────────────────────
const SkeletonDay = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-3 items-center">
    <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
    <div className="flex-1 space-y-2"><div className="h-2.5 bg-gray-100 rounded w-1/4" /><div className="h-4 bg-gray-100 rounded w-2/3" /></div>
  </div>
);
const SkeletonProduct = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-3 animate-pulse">
    <div className="flex gap-3"><div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0" /><div className="flex-1 space-y-2 py-1"><div className="h-2.5 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-full" /><div className="h-4 bg-gray-100 rounded w-1/2 mt-1" /></div></div>
    <div className="flex gap-2 mt-3"><div className="flex-1 h-8 bg-gray-100 rounded-xl" /><div className="flex-1 h-8 bg-gray-100 rounded-xl" /></div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const AITripPlanner: React.FC = () => {
  const { t }                      = useTranslation();
  const { langPath, langNavigate } = useLangNavigate();
  const { user }                   = useAuth();
  const { addToCart }              = useCart();
  const { showToast }              = useToast();

  // Core state
  const [userStory, setUserStory]                     = useState('');
  const [rawItinerary, setRawItinerary]               = useState('');
  const [daySections, setDaySections]                 = useState<DaySection[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [unavailableProducts, setUnavailableProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading]                     = useState(false);
  const [hasSearched, setHasSearched]                 = useState(false);

  // Rate limit state — harus di dalam komponen
  const [isRateLimited, setIsRateLimited]   = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Date state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [travelStart, setTravelStart]       = useState('');
  const [travelEnd, setTravelEnd]           = useState('');
  const activeDates: TravelDates | undefined = travelStart
    ? { start: travelStart, end: travelEnd || travelStart }
    : undefined;

  // Chat state
  const [convHistory, setConvHistory] = useState<ConvMessage[]>([]);
  const [chatBubbles, setChatBubbles] = useState<ChatBubble[]>([]);
  const [isRefining, setIsRefining]   = useState(false);

  // Cart state
  const [cartAdded, setCartAdded]           = useState<Set<number>>(new Set());
  const [bookingId, setBookingId]           = useState<number | null>(null);
  const [isBookingAll, setIsBookingAll]     = useState(false);
  const [showCartBanner, setShowCartBanner] = useState(false);
  const [upsellTrigger, setUpsellTrigger]   = useState<Product | null>(null);
  const [upsellProduct, setUpsellProduct]   = useState<Product | null>(null);
  const [upsellBooking, setUpsellBooking]   = useState(false);

  // Save + share state
  const [isSaving, setIsSaving]                   = useState(false);
  const [savedId, setSavedId]                     = useState<number | null>(null);
  const [savedTitle, setSavedTitle]               = useState('');
  const [shareToken, setShareToken]               = useState<string | null>(null);
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  const SUGGESTIONS = [t('ai_planner.suggestion_1'), t('ai_planner.suggestion_2'), t('ai_planner.suggestion_3'), t('ai_planner.suggestion_4')];

  // ── applyResult ────────────────────────────────────────────────────────────
  const applyResult = (itinerary: string, products: Product[], unavailable: Product[]) => {
    if (itinerary === '__RATE_LIMIT__') {
      setIsRateLimited(true);
      setIsLoading(false);
      let secs = 60;
      setRetryCountdown(secs);
      const timer = setInterval(() => {
        secs--;
        setRetryCountdown(secs);
        if (secs <= 0) {
          clearInterval(timer);
          setIsRateLimited(false);
          setHasSearched(false);
        }
      }, 1000);
      return;
    }
    setIsRateLimited(false);
    setDaySections(parseItineraryToDays(itinerary));
    setRawItinerary(itinerary);
    setRecommendedProducts(products);
    setUnavailableProducts(unavailable);
  };

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userStory.trim()) return;
    setIsLoading(true); setHasSearched(true);
    setRawItinerary(''); setDaySections([]); setRecommendedProducts([]); setUnavailableProducts([]);
    setConvHistory([]); setChatBubbles([]);
    setCartAdded(new Set()); setShowCartBanner(false);
    setSavedId(null); setShareToken(null); setSavedTitle('');

    const result = await generateTripPlan(userStory, activeDates);
    applyResult(result.itinerary, result.recommendedProducts, result.unavailableProducts);
    const historySnippet = result.rawForHistory.substring(0, 800) + '\n[...itinerary continues...]';
    setConvHistory([
      { role: 'user',      content: userStory },
      { role: 'assistant', content: historySnippet },
    ]);
    setIsLoading(false);
  };

  // ── Refine ─────────────────────────────────────────────────────────────────
  const handleRefine = async (userText: string) => {
    if (!userText.trim() || isRefining) return;
    const userMsg: ConvMessage = { role: 'user', content: userText };
    const updated = [...convHistory, userMsg];
    setConvHistory(updated);
    setChatBubbles(prev => [...prev, { role: 'user', text: userText }]);
    setIsRefining(true);
    const result = await refineTripPlan(updated, activeDates);
    applyResult(result.itinerary, result.recommendedProducts, result.unavailableProducts);
    setCartAdded(new Set()); setShowCartBanner(false);
    setSavedId(null); setShareToken(null);
    const refineSnippet = result.rawForHistory.substring(0, 800) + '\n[...itinerary continues...]';
    setConvHistory([...updated, { role: 'assistant', content: refineSnippet }]);
    setChatBubbles(prev => [...prev, { role: 'assistant', text: 'Itinerary berhasil diperbarui.' }]);
    setIsRefining(false);
  };

  // ── Book ───────────────────────────────────────────────────────────────────
  const handleBook = async (product: Product) => {
    if (cartAdded.has(product.id) || bookingId === product.id) return;
    setBookingId(product.id);
    try {
      await addToCart(product, 1);
      const newCart = new Set([...cartAdded, product.id]);
      setCartAdded(newCart);
      setShowCartBanner(true);
      showToast(`${product.name} ditambahkan ke keranjang!`, 'success');
      const upsell = findUpsell(product, recommendedProducts, newCart);
      if (upsell) { setUpsellTrigger(product); setUpsellProduct(upsell); }
    } catch { showToast('Gagal menambahkan ke keranjang.', 'error'); }
    finally { setBookingId(null); }
  };

  const handleBookAll = async () => {
    const toAdd = recommendedProducts.filter(p => !cartAdded.has(p.id));
    if (!toAdd.length) return;
    setIsBookingAll(true);
    let count = 0;
    for (const p of toAdd) { try { await addToCart(p, 1); setCartAdded(prev => new Set([...prev, p.id])); count++; } catch {} }
    setIsBookingAll(false);
    if (count > 0) { setShowCartBanner(true); showToast(`${count} paket ditambahkan!`, 'success'); }
    else showToast('Gagal menambahkan paket.', 'error');
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) { langNavigate('/login'); return; }
    if (isSaving || savedId) return;
    setIsSaving(true);
    try {
      const title  = autoTitle(userStory);
      const result = await saveItineraryAPI({ title, userStory, itinerary: rawItinerary, recommendedProducts });
      setSavedId(result.id); setSavedTitle(result.title); setShareToken(result.shareToken);
      showToast('Itinerary berhasil disimpan!', 'success');
    } catch (err: any) { showToast(err?.message ?? 'Gagal menyimpan.', 'error'); }
    finally { setIsSaving(false); }
  };

  const handleUpsellBook = async (product: Product) => {
    setUpsellBooking(true);
    try {
      await addToCart(product, 1);
      setCartAdded(prev => new Set([...prev, product.id]));
      showToast(`${product.name} ditambahkan ke keranjang!`, 'success');
      setTimeout(() => { setUpsellProduct(null); setUpsellTrigger(null); }, 1200);
    } catch { showToast('Gagal menambahkan ke keranjang.', 'error'); }
    finally { setUpsellBooking(false); }
  };

  const handleUpsellDismiss = () => { setUpsellProduct(null); setUpsellTrigger(null); };

  const handleShareClick = async () => {
    if (showShareDropdown) { setShowShareDropdown(false); return; }
    if (!shareToken) await handleSave();
    setShowShareDropdown(true);
  };

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) { showToast('Aktifkan popup untuk export PDF.', 'error'); return; }
    const title     = savedTitle || autoTitle(userStory);
    const date      = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const dateRange = travelStart ? ` · ${formatDisplayDate(travelStart)}${travelEnd && travelEnd !== travelStart ? ` – ${formatDisplayDate(travelEnd)}` : ''}` : '';
    const body      = rawItinerary
      .replace(/^### (.*)/gm, '<h3>$1</h3>').replace(/^## (.*)/gm, '<h2>$1</h2>').replace(/^# (.*)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^- (.*)/gm, '<li>$1</li>').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    win.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>${title}</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#1a1a2e;line-height:1.7}
      .logo{color:#e05845;font-size:18px;font-weight:800;margin-bottom:6px}.head{border-bottom:3px solid #e05845;padding-bottom:18px;margin-bottom:28px}
      h1{font-size:26px;font-weight:800}.meta{font-size:12px;color:#888;margin-top:4px}h2{font-size:17px;font-weight:700;color:#e05845;margin:26px 0 10px;border-left:4px solid #e05845;padding-left:10px}
      h3{font-size:15px;font-weight:700;color:#1a1a2e;margin:20px 0 8px}p{margin:8px 0;font-size:13px;color:#444}li{margin:4px 0 4px 20px;font-size:13px;color:#444}strong{color:#1a1a2e;font-weight:700}
      .foot{margin-top:50px;padding-top:16px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:11px;color:#aaa}</style></head>
      <body><div class="head"><div class="logo">trivgoo</div><h1>${title}</h1><div class="meta">AI Trip Plan · Dibuat ${date}${dateRange} · trivgoo.com</div></div>
      <p>${body}</p><div class="foot"><span>trivgoo.com</span><span>Dibuat dengan Trivgoo AI Trip Planner</span></div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const allInCart    = recommendedProducts.length > 0 && recommendedProducts.every(p => cartAdded.has(p.id));
  const notYetInCart = recommendedProducts.filter(p => !cartAdded.has(p.id));

  // Produk dengan urgency critical/sold_out untuk warning banner
  const criticalProducts = recommendedProducts.filter(
    p => (p as any).scarcityUrgency === 'critical' || (p as any).scarcityUrgency === 'sold_out'
  );

  return (
    <>
      <SEO title="AI Trip Planner | Trivgoo" />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <motion.div className="text-center mb-10" variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4"
              animate={{ y: [0, -7, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
              <Sparkles className="w-6 h-6 text-primary-600" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">{t('ai_planner.title')}</motion.h1>
            <motion.p variants={fadeUp} className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto px-4">{t('ai_planner.desc1')}{t('ai_planner.desc2')}</motion.p>
          </motion.div>

          {/* Input Card */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-10">
            <div className="h-1 bg-gradient-to-r from-primary-400 via-purple-500 to-orange-400" />
            <div className="p-6 md:p-8">
              <form onSubmit={handleGenerate}>
                <div className="relative">
                  <textarea
                    className="w-full h-36 p-5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-base text-gray-700 bg-gray-50 focus:bg-white transition-all shadow-inner"
                    placeholder={t('ai_planner.placeholder')} value={userStory}
                    onChange={e => setUserStory(e.target.value)} disabled={isLoading} />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <motion.button type="button" onClick={() => setShowDatePicker(v => !v)} whileTap={{ scale: 0.97 }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        showDatePicker || travelStart ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {travelStart ? formatDisplayDate(travelStart).split(' ').slice(0, 2).join(' ') : 'Tanggal'}
                    </motion.button>
                    <motion.button type="submit" disabled={isLoading || !userStory.trim()}
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? (<><motion.span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />{t('ai_planner.thinking')}</>) : (<>{t('ai_planner.generate')} <Send className="w-3.5 h-3.5" /></>)}
                    </motion.button>
                  </div>
                </div>
              </form>
              <AnimatePresence>
                {showDatePicker && (
                  <DateRangePicker startDate={travelStart} endDate={travelEnd}
                    onStartChange={setTravelStart} onEndChange={setTravelEnd}
                    onClear={() => { setTravelStart(''); setTravelEnd(''); }} />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {!hasSearched && (
                  <motion.div className="mt-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5" />{t('ai_planner.try_prompts')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s, i) => (
                        <motion.button key={i} onClick={() => setUserStory(s)} whileTap={{ scale: 0.97 }}
                          className="text-xs px-3.5 py-2 bg-white border border-gray-200 hover:border-primary-400 hover:bg-primary-50 rounded-xl transition-all text-gray-500 hover:text-primary-700">"{s}"</motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Rate Limit Banner */}
          <AnimatePresence>
            {isRateLimited && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-amber-800 mb-1">AI sedang istirahat sebentar</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Terlalu banyak permintaan masuk. AI akan siap lagi dalam{' '}
                  <span className="font-bold tabular-nums">{retryCountdown} detik</span>.
                </p>
                <div className="w-full bg-amber-200 rounded-full h-1.5 max-w-xs mx-auto">
                  <motion.div className="bg-amber-500 h-1.5 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(retryCountdown / 60) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }} />
                </div>
                <p className="text-xs text-amber-500 mt-3">Atau coba gunakan prompt yang lebih singkat untuk hemat token</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {hasSearched && (
              <motion.div key="results" variants={stagger} initial="hidden" animate="show"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Left — Itinerary */}
                <motion.div variants={slideLeft} className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Map className="w-[18px] h-[18px] text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t('ai_planner.your_itinerary')}</h3>
                    {!isLoading && daySections.length > 0 && (
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />{daySections.length} hari
                      </span>
                    )}
                    {!isLoading && rawItinerary && travelStart && (
                      <span className="text-xs font-bold text-primary-600 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDisplayDate(travelStart)}{travelEnd && travelEnd !== travelStart && ` – ${formatDisplayDate(travelEnd)}`}
                      </span>
                    )}
                    {!isLoading && rawItinerary && (
                      <div className="ml-auto flex items-center gap-2">
                        <motion.button onClick={handleSave} disabled={isSaving || !!savedId} whileTap={!savedId ? { scale: 0.97 } : {}}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${savedId ? 'bg-primary-50 text-primary-700 border-primary-200 cursor-default' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700'}`}>
                          {isSaving ? (<><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} className="inline-block"><RefreshCw className="w-3 h-3" /></motion.span>Menyimpan...</>)
                            : savedId ? (<><BookmarkCheck className="w-3.5 h-3.5" />Tersimpan</>)
                            : (<><Bookmark className="w-3.5 h-3.5" />{user ? 'Simpan' : 'Login & Simpan'}</>)}
                        </motion.button>
                        <div className="relative">
                          <motion.button onClick={handleShareClick} whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-all">
                            <Share2 className="w-3.5 h-3.5" />Bagikan
                          </motion.button>
                          <AnimatePresence>
                            {showShareDropdown && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowShareDropdown(false)} />
                                {shareToken ? (
                                  <ShareDropdown shareToken={shareToken} itineraryTitle={savedTitle} langPath={langPath} onExportPDF={handleExportPDF} onClose={() => setShowShareDropdown(false)} />
                                ) : (
                                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
                                    <button onClick={() => { handleExportPDF(); setShowShareDropdown(false); }}
                                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center"><Download className="w-3.5 h-3.5 text-red-500" /></div>
                                      <span className="text-xs font-bold text-gray-700">Export PDF</span>
                                    </button>
                                  </motion.div>
                                )}
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>

                  {isLoading ? (
                    <motion.div variants={stagger} className="space-y-3">{[1,2,3].map(i => <SkeletonDay key={i} />)}</motion.div>
                  ) : daySections.length > 0 ? (
                    <motion.div variants={stagger} className={`space-y-3 transition-opacity duration-300 ${isRefining ? 'opacity-50 pointer-events-none' : ''}`}>
                      {daySections.map((s, i) => <DayCard key={`${s.day}-${i}`} section={s} index={i} />)}
                    </motion.div>
                  ) : rawItinerary ? (
                    <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="prose prose-sm prose-teal max-w-none text-gray-600"><ReactMarkdown>{rawItinerary}</ReactMarkdown></div>
                    </motion.div>
                  ) : null}

                  {savedId && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center gap-2 text-xs text-primary-600 bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5">
                      <BookmarkCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1">Disimpan sebagai "<span className="font-bold">{savedTitle}</span>"</span>
                      <Link to={langPath('/my-itineraries')} className="font-bold hover:underline flex-shrink-0">Lihat semua →</Link>
                    </motion.div>
                  )}
                  {!isLoading && recommendedProducts.length > 0 && <BudgetEstimator products={recommendedProducts} />}
                  {!isLoading && rawItinerary && <ChatSection onRefine={handleRefine} isRefining={isRefining} bubbles={chatBubbles} />}
                </motion.div>

                {/* Right — Sidebar */}
                <motion.div variants={slideRight} className="lg:col-span-1">
                  <div className="sticky top-24 space-y-3">

                    <AnimatePresence>
                      {showCartBanner && cartAdded.size > 0 && (
                        <CartBanner count={cartAdded.size} onDismiss={() => setShowCartBanner(false)} langPath={langPath} />
                      )}
                    </AnimatePresence>

                    {/* Upsell Modal */}
                    <AnimatePresence>
                      {upsellProduct && (
                        <UpsellModal trigger={upsellTrigger!} suggested={upsellProduct} langPath={langPath}
                          onBook={handleUpsellBook} onDismiss={handleUpsellDismiss}
                          isBooking={upsellBooking} isInCart={cartAdded.has(upsellProduct.id)} />
                      )}
                    </AnimatePresence>

                    {/* Scarcity warning banner */}
                    <AnimatePresence>
                      {!isLoading && criticalProducts.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          <p className="text-[11px] font-bold text-red-700">
                            {criticalProducts.length} paket hampir habis di tanggal ini — segera booking!
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Product list header */}
                    <div className="flex items-center gap-2">
                      <Star className="w-[18px] h-[18px] text-amber-400 fill-amber-400 flex-shrink-0" />
                      <h3 className="text-base font-bold text-gray-900 flex-1">{t('ai_planner.recommended')}</h3>
                      {!isLoading && recommendedProducts.length > 0 && !allInCart && (
                        <motion.button onClick={handleBookAll} disabled={isBookingAll} whileTap={{ scale: 0.96 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-xl text-[11px] font-bold hover:bg-primary-700 transition-colors disabled:opacity-60 flex-shrink-0">
                          {isBookingAll ? (<><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}><RefreshCw className="w-3 h-3" /></motion.span>Menambahkan...</>) : (<><Package className="w-3 h-3" />Pesan Semua{notYetInCart.length > 0 && ` (${notYetInCart.length})`}</>)}
                        </motion.button>
                      )}
                      {!isLoading && allInCart && <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 flex-shrink-0"><Check className="w-3 h-3" />Semua di keranjang</span>}
                    </div>

                    {isLoading ? (
                      <><SkeletonProduct /><SkeletonProduct /></>
                    ) : recommendedProducts.length > 0 ? (
                      <motion.div variants={stagger} className="space-y-3">
                        {recommendedProducts.map(p => (
                          <ProductCard key={p.id} product={p} langPath={langPath}
                            isInCart={cartAdded.has(p.id)} isBooking={bookingId === p.id} onBook={handleBook} />
                        ))}
                        <motion.div variants={fadeUp}>
                          <Link to={langPath('/explore')}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-xs font-bold text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors">
                            Lihat semua paket <ArrowRight className="w-3 h-3" />
                          </Link>
                        </motion.div>
                      </motion.div>
                    ) : !isLoading && hasSearched ? (
                      <motion.div variants={fadeIn} className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                        <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">{t('ai_planner.no_match')}{t('ai_planner.options')}</p>
                        <Link to={langPath('/explore')} className="inline-block mt-3 text-primary-600 font-bold text-sm hover:underline">{t('common.see_all')}</Link>
                      </motion.div>
                    ) : null}

                    {!isLoading && <UnavailablePanel products={unavailableProducts} langPath={langPath} />}
                    {!isLoading && recommendedProducts.length > 0 && <ItineraryMap products={recommendedProducts} />}

                  </div>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
};

export default AITripPlanner;

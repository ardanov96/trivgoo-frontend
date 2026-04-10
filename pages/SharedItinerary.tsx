import {
  ArrowRight, Calendar, ChevronDown, Clock, Link2,
  MapPin, Sparkles, Star, Sunrise, Sunset, UtensilsCrossed,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { getSharedItinerary, SavedItinerary } from '../services/aiTripService';
import { Product } from '../types';
import { encodeId } from '../utils/hashids';
import { generateSlug } from '../utils/slugify';
import { useToast } from '../components/ToastContext';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return num.toLocaleString('id-ID');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
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
  if (l.includes('dinner') || l.includes('makan malam'))                    return <UtensilsCrossed className="w-3.5 h-3.5" />;
  if (l.includes('sunset') || l.includes('sore'))                           return <Sunset className="w-3.5 h-3.5" />;
  return <Calendar className="w-3.5 h-3.5" />;
}

const DAY_ORDINALS: Record<number, string> = {
  1: 'Hari Pertama', 2: 'Hari Kedua',   3: 'Hari Ketiga',
  4: 'Hari Keempat', 5: 'Hari Kelima',  6: 'Hari Keenam', 7: 'Hari Ketujuh',
};

// ── Day Card (read-only) ──────────────────────────────────────────────────────
const DayCard: React.FC<{ section: DaySection; index: number }> = ({ section, index }) => {
  const [open, setOpen] = useState(index === 0);
  const clean = section.title.replace(/^(Day\s*\d+|Hari\s*(ke-)?\d+)\s*[:\-–]?\s*/i, '');
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
              <div className="prose prose-sm prose-primary max-w-none text-gray-600 leading-relaxed
                [&>p]:mb-3 [&>ul]:mb-3 [&>ul>li]:mb-1.5 [&>h4]:font-bold [&>h4]:text-gray-800
                [&>h4]:mt-4 [&>h4]:mb-2 [&>h4]:text-sm [&>strong]:text-gray-800">
                <ReactMarkdown>{section.body}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Product Card (view-only) ──────────────────────────────────────────────────
const ProductCard: React.FC<{ product: Product; langPath: (p: string) => string }> = ({ product, langPath }) => (
  <Link to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}
    className="group flex gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all overflow-hidden p-3">
    <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden relative">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      {Number(product.rating) > 4.5 && (
        <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[9px] font-bold shadow-sm flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />{Number(product.rating).toFixed(1)}
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
      <div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1"><MapPin className="w-2.5 h-2.5 flex-shrink-0" /><span className="truncate">{product.location}</span></div>
        <h4 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h4>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="text-[9px] text-gray-400 block leading-none mb-0.5">{product.currency}</span>
          <span className="text-sm font-bold text-primary-700 tabular-nums">{formatPrice(product.price)}</span>
        </div>
        <span className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  </Link>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const SharedItinerary: React.FC = () => {
  const { token }      = useParams<{ token: string }>();
  const { langPath }   = useLangNavigate();
  const { showToast }  = useToast();

  const [data, setData]         = useState<SavedItinerary | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [daySections, setDaySections] = useState<DaySection[]>([]);

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await getSharedItinerary(token);
        setData(result);
        setDaySections(parseItineraryToDays(result.itinerary));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link disalin!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <>
        <SEO title="Itinerary Tidak Ditemukan | Trivgoo" noindex />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Itinerary Tidak Ditemukan</h1>
            <p className="text-gray-500 text-sm mb-6">Link ini sudah tidak valid atau itinerary telah dihapus oleh pemiliknya.</p>
            <Link to={langPath('/ai-planner')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors">
              <Sparkles className="w-4 h-4" /> Buat Itinerary Sendiri
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${data.title} | Trivgoo AI Trip Planner`}
        description={data.user_story ? `Rencana perjalanan: ${data.user_story.substring(0, 120)}` : 'Itinerary perjalanan dari Trivgoo AI Trip Planner'}
      />
      <div className="min-h-screen bg-gray-50 pt-16 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="h-1 bg-gradient-to-r from-primary-400 via-purple-500 to-orange-400" />
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Trip Plan
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2 leading-tight">{data.title}</h1>
                  {data.user_story && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{data.user_story}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" /> Dibuat {formatDate(data.created_at)}
                    </span>
                    {daySections.length > 0 && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" /> {daySections.length} hari
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors flex-shrink-0">
                  <Link2 className="w-4 h-4" /> Salin Link
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Left: Itinerary */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Rencana Perjalanan</h2>
                {daySections.length > 0 && (
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />{daySections.length} hari
                  </span>
                )}
              </div>

              {daySections.length > 0 ? (
                <div className="space-y-3">
                  {daySections.map((s, i) => <DayCard key={`${s.day}-${i}`} section={s} index={i} />)}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="prose prose-sm prose-teal max-w-none text-gray-600"><ReactMarkdown>{data.itinerary}</ReactMarkdown></div>
                </div>
              )}
            </div>

            {/* Right: Products + CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">

                {data.recommended_products && data.recommended_products.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-[18px] h-[18px] text-amber-400 fill-amber-400" />
                      <h3 className="text-base font-bold text-gray-900">Paket Direkomendasikan</h3>
                    </div>
                    <div className="space-y-3">
                      {(data.recommended_products as Product[]).map(p => (
                        <ProductCard key={p.id} product={p} langPath={langPath} />
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white text-center">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5">Buat Trip Versimu!</h3>
                  <p className="text-primary-100 text-xs mb-4 leading-relaxed">Ceritakan rencanamu dan AI Trivgoo akan buat itinerary personalmu dalam hitungan detik.</p>
                  <Link to={langPath('/ai-planner')}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-primary-700 rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors">
                    Coba AI Trip Planner <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default SharedItinerary;

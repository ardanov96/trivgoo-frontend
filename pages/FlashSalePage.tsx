// pages/FlashSalePage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Search, SlidersHorizontal, X, ArrowUpDown, Tag } from 'lucide-react';
import { useTranslation }      from 'react-i18next';
import { useWishlist }         from '../components/WishlistContext';
import { useCart }             from '../components/CartContext';
import { useToast }            from '../components/ToastContext';
import { useAuth }             from '../AuthContext';
import { agentProductService } from '../services/agentProductService';
import { FlashSaleCard, type FlashProduct } from '../components/FlashSaleCard';
import SEO from '../components/SEO';

// ── Inject styles ─────────────────────────────────────────────────────────────

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('flash-page-styles')) return;
  const s = document.createElement('style');
  s.id = 'flash-page-styles';
  s.textContent = `
    @keyframes flashSlide {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    @keyframes flashPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    .fs-title {
      background: linear-gradient(90deg, #FF4500 0%, #FF8C00 30%, #FFE066 50%, #FF8C00 70%, #FF4500 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flashSlide 3s linear infinite;
    }
    .fs-dot { animation: flashPulse 1s ease-in-out infinite; }
  `;
  document.head.appendChild(s);
}

// ── Countdown hook ─────────────────────────────────────────────────────────────

function useCountdown(endsAt?: string | null) {
  const calc = () => {
    if (!endsAt) return null;
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return t;
}

const pad = (n: number) => String(n).padStart(2, '0');

// ── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="aspect-[4/3] bg-gradient-to-br from-orange-50 to-red-50" />
    <div className="p-3.5 space-y-2">
      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-orange-100 rounded w-1/3 mt-3" />
    </div>
  </div>
);

// ── Stat badge ────────────────────────────────────────────────────────────────

const StatBadge: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div
    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
  >
    <span className="text-orange-400">{icon}</span>
    <div>
      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">{label}</p>
      <p className="text-white font-black text-sm leading-none">{value}</p>
    </div>
  </div>
);

// ── Countdown display ─────────────────────────────────────────────────────────

const CountdownDisplay: React.FC<{ time: { h: number; m: number; s: number } | null }> = ({ time }) => {
  if (!time) return null;
  return (
    <div className="flex items-center gap-1.5">
      {[
        { v: time.h, l: 'Jam' },
        { v: time.m, l: 'Mnt' },
        { v: time.s, l: 'Dtk' },
      ].map(({ v, l }, i) => (
        <React.Fragment key={l}>
          {i > 0 && <span className="text-orange-400 font-black text-lg mb-3">:</span>}
          <div className="flex flex-col items-center">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-lg"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={v}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {pad(v)}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-[9px] font-bold text-orange-300 mt-0.5">{l}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'discount_desc', label: 'Diskon Terbesar' },
  { value: 'price_asc',     label: 'Harga Terendah' },
  { value: 'price_desc',    label: 'Harga Tertinggi' },
  { value: 'ending_soon',   label: 'Segera Berakhir' },
];

const CATEGORY_OPTIONS = [
  { value: '',         label: 'Semua' },
  { value: 'tour',     label: '🏔️ Tour' },
  { value: 'stay',     label: '🏨 Penginapan' },
  { value: 'car',      label: '🚗 Sewa Mobil' },
  { value: 'transfer', label: '✈️ Transfer' },
  { value: 'event',    label: '🎟️ Event' },
];

const FlashSalePage: React.FC = () => {
  const { t }                              = useTranslation();
  const { user }                           = useAuth();
  const { toggleWishlist, isInWishlist }   = useWishlist();
  const { addToCart, isInCart }            = useCart();
  const { showToast }                      = useToast();
  const isLoggedIn                         = !!user;

  const [products,  setProducts]  = useState<FlashProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState('discount_desc');
  const [category,  setCategory]  = useState('');
  const [visible,   setVisible]   = useState(12);

  // Find nearest ending
  const nearestEnd = useMemo(() => {
    if (!products.length) return null;
    const now = Date.now();
    const validProducts = products.filter(
      (p) => p.flash_ends_at && new Date(p.flash_ends_at).getTime() > now
    );
    if (!validProducts.length) return null;
    return validProducts.reduce<string | null>((acc, p) => {
      if (!p.flash_ends_at) return acc;
      if (!acc) return p.flash_ends_at;
      return new Date(p.flash_ends_at) < new Date(acc) ? p.flash_ends_at : acc;
    }, null);
  }, [products]);

  const time = useCountdown(nearestEnd);

  useEffect(() => {
    injectStyles();
    const load = async () => {
      setIsLoading(true);
      try {
        const all  = await agentProductService.getAllProducts();
        const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const flash: FlashProduct[] = all
          .filter((p: any) => p.is_flash_sale && p.flash_sale_price)
          .map((p: any) => ({
            ...p,
            image_url: p.image_url && !p.image_url.startsWith('http')
              ? `${BASE}/${p.image_url}`
              : p.image_url,
          }));
        setProducts(flash);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Filter + sort
  const filtered = useMemo(() => {
    let arr = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((p) => p.name.toLowerCase().includes(q) || (p.location ?? '').toLowerCase().includes(q));
    }

    if (category) {
      arr = arr.filter((p) => (p.details?.type ?? '') === category);
    }

    switch (sort) {
      case 'discount_desc':
        arr.sort((a, b) => (b.flash_discount_pct ?? 0) - (a.flash_discount_pct ?? 0));
        break;
      case 'price_asc':
        arr.sort((a, b) => (a.flash_sale_price ?? a.price) - (b.flash_sale_price ?? b.price));
        break;
      case 'price_desc':
        arr.sort((a, b) => (b.flash_sale_price ?? b.price) - (a.flash_sale_price ?? a.price));
        break;
      case 'ending_soon':
        arr.sort((a, b) => {
          if (!a.flash_ends_at) return 1;
          if (!b.flash_ends_at) return -1;
          return new Date(a.flash_ends_at).getTime() - new Date(b.flash_ends_at).getTime();
        });
        break;
    }

    return arr;
  }, [products, search, sort, category]);

  const handleWishlist  = (e: React.MouseEvent, p: FlashProduct) => {
    e.preventDefault(); e.stopPropagation(); toggleWishlist(p as any);
  };
  const handleAddToCart = (e: React.MouseEvent, p: FlashProduct) => {
    e.preventDefault(); e.stopPropagation();
    if (isInCart(p.id)) return;
    addToCart(p as any, 1);
    showToast(`${p.name} ditambahkan ke keranjang!`, 'success');
  };

  const avgDiscount = products.length
    ? Math.round(products.reduce((acc, p) => acc + (p.flash_discount_pct ?? 0), 0) / products.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="⚡ Flash Sale – Trivgoo"
        description="Dapatkan penawaran eksklusif dengan diskon terbatas. Flash Sale Trivgoo – harga terbaik, stok terbatas!"
      />

      {/* ── Hero header ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f0f0f 0%, #1a0500 50%, #0f0f0f 100%)' }}
      >
        {/* Noise */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,140,0,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            <div className="flex items-center gap-2 mb-3">
              <span className="fs-dot w-2 h-2 rounded-full bg-orange-500 inline-block" />
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.25em]">
                Penawaran Terbatas
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-2 leading-none">
              <span className="fs-title">⚡ Flash Sale</span>
            </h1>
            <p className="text-white/50 text-sm md:text-base mb-8 max-w-md">
              Harga spesial untuk waktu terbatas. Jangan sampai kehabisan!
            </p>

            {/* Stats + countdown */}
            <div className="flex flex-wrap items-center gap-3">
              <StatBadge icon={<Zap className="w-4 h-4 fill-current" />} label="Produk" value={`${products.length} Item`} />
              <StatBadge icon={<Tag className="w-4 h-4" />} label="Rata-rata Diskon" value={`${avgDiscount}% OFF`} />
              {time && (
                <div
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <div>
                    <p className="text-[10px] text-orange-400 uppercase tracking-widest font-black flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3" /> Berakhir Dalam
                    </p>
                    <CountdownDisplay time={time} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk flash sale..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-sm transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category chips (scrollable) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    category === c.value
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-600'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-400 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Product grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-gray-500 font-medium mb-5">
            <span className="font-bold text-gray-800">{filtered.length}</span> produk flash sale
            {search && <> untuk "<span className="text-orange-600 font-bold">{search}</span>"</>}
          </p>
        )}

        {/* Grid */}
        <motion.div
          key={`${sort}-${category}-${search}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
        >
          {isLoading
            ? [...Array(10)].map((_, i) => <Skeleton key={i} />)
            : filtered.slice(0, visible).map((p, i) => (
                <FlashSaleCard
                  key={p.id}
                  product={p}
                  isLoggedIn={isLoggedIn}
                  isSaved={isInWishlist(p.id)}
                  isInCart={isInCart(p.id)}
                  onWishlist={(e) => handleWishlist(e, p)}
                  onAddToCart={(e) => handleAddToCart(e, p)}
                  index={i}
                />
              ))
          }
        </motion.div>

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-orange-300" />
            </div>
            <p className="text-gray-500 font-medium">Tidak ada produk flash sale ditemukan.</p>
            {search && (
              <button
                onClick={() => { setSearch(''); setCategory(''); }}
                className="mt-3 text-sm text-orange-600 font-bold hover:underline"
              >
                Reset filter
              </button>
            )}
          </motion.div>
        )}

        {/* Load more */}
        {!isLoading && filtered.length > visible && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-10"
          >
            <button
              onClick={() => setVisible((v) => v + 12)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all hover:scale-105 hover:shadow-2xl shadow-orange-500/30"
              style={{ background: 'linear-gradient(135deg, #FF8C00, #FF4500)' }}
            >
              <Zap className="w-4 h-4 fill-current" />
              Muat Lebih Banyak ({filtered.length - visible} tersisa)
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FlashSalePage;

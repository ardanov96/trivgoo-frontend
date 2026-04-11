// components/flash/FlashSaleSection.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from './WishlistContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { useAuth } from '@/AuthContext';
import { useLangNavigate } from '@/src/hooks/useLangNavigate';
import { agentProductService } from '@/services/agentProductService';
import { FlashSaleCard, type FlashProduct } from './FlashSaleCard';

// ── Inject styles ─────────────────────────────────────────────────────────────

function injectFlashStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('flash-sale-styles')) return;
  const s = document.createElement('style');
  s.id = 'flash-sale-styles';
  s.textContent = `
    @keyframes flashPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }
    @keyframes flashSlide {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    .flash-title-shimmer {
      background: linear-gradient(90deg, #FF4500 0%, #FF8C00 30%, #FFE066 50%, #FF8C00 70%, #FF4500 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flashSlide 3s linear infinite;
    }
    .flash-dot {
      animation: flashPulse 1s ease-in-out infinite;
    }
  `;
  document.head.appendChild(s);
}

// ── Countdown hook ─────────────────────────────────────────────────────────────

function useGlobalCountdown(products: FlashProduct[]) {
  const nearest = products.reduce<string | null>((acc, p) => {
    if (!p.flash_ends_at) return acc;
    if (!acc) return p.flash_ends_at;
    return new Date(p.flash_ends_at) < new Date(acc) ? p.flash_ends_at : acc;
  }, null);

  const calc = () => {
    if (!nearest) return null;
    const diff = new Date(nearest).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  };

  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!nearest) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [nearest]);

  return time;
}

const pad = (n: number) => String(n).padStart(2, '0');

// ── Skeleton ──────────────────────────────────────────────────────────────────

const FlashSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="aspect-[4/3] bg-gradient-to-br from-orange-50 to-red-50" />
    <div className="p-3.5 space-y-2">
      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-orange-100 rounded w-1/3 mt-3" />
    </div>
  </div>
);

// ── Digit block for countdown ─────────────────────────────────────────────────

const DigitBlock: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-lg"
      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {pad(value)}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="text-[9px] font-bold text-orange-200 uppercase tracking-widest mt-1">{label}</span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

interface FlashSaleSectionProps {
  limit?: number;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ limit = 6 }) => {
  const { t }                              = useTranslation();
  const { langNavigate, langPath }         = useLangNavigate();
  const { user }                           = useAuth();
  const { toggleWishlist, isInWishlist }   = useWishlist();
  const { addToCart, isInCart }            = useCart();
  const { showToast }                      = useToast();
  const isLoggedIn                         = !!user;

  const [products,  setProducts]  = useState<FlashProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const time = useGlobalCountdown(products);

  useEffect(() => {
    injectFlashStyles();
    const load = async () => {
      setIsLoading(true);
      try {
        const all  = await agentProductService.getAllProducts();
        const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const flash: FlashProduct[] = all
          .filter((p: any) => p.is_flash_sale && p.flash_sale_price)
          .slice(0, limit)
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
  }, [limit]);

  // Don't render if no flash products and not loading
  if (!isLoading && products.length === 0) return null;

  const handleWishlist  = (e: React.MouseEvent, p: FlashProduct) => {
    e.preventDefault(); e.stopPropagation(); toggleWishlist(p as any);
  };
  const handleAddToCart = (e: React.MouseEvent, p: FlashProduct) => {
    e.preventDefault(); e.stopPropagation();
    if (isInCart(p.id)) return;
    addToCart(p as any, 1);
    showToast(`${p.name} ditambahkan ke keranjang!`, 'success');
  };

  return (
    <section className="relative overflow-hidden py-10 md:py-14">

      {/* ── Decorative background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(160deg, #0f0f0f 0%, #1a0500 40%, #0f0f0f 100%)',
        }}
      />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />
      {/* Glow blobs */}
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="absolute -bottom-20 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">

          {/* Left: title + countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flash-dot w-2 h-2 rounded-full bg-orange-500 inline-block" />
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                  Limited Time Offer
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black leading-none">
                <span className="flash-title-shimmer">⚡ Flash Sale</span>
              </h2>
            </div>

            {/* Countdown blocks */}
            {time && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <DigitBlock value={time.h} label="Jam" />
                  <span className="text-orange-400 font-black text-xl mb-3">:</span>
                  <DigitBlock value={time.m} label="Menit" />
                  <span className="text-orange-400 font-black text-xl mb-3">:</span>
                  <DigitBlock value={time.s} label="Detik" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: CTA */}
          <Link
            to={langPath('/flash-sale')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all group shrink-0"
            style={{
              background:    'rgba(255,255,255,0.08)',
              border:        '1px solid rgba(255,255,255,0.15)',
              color:         '#fff',
            }}
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Product grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {isLoading
            ? [...Array(6)].map((_, i) => (
                <div key={i} style={{ opacity: 1 - i * 0.12 }}>
                  <FlashSkeleton />
                </div>
              ))
            : products.map((p, i) => (
                <FlashSaleCard
                  key={p.id}
                  product={p}
                  isLoggedIn={isLoggedIn}
                  isSaved={isInWishlist(p.id)}
                  isInCart={isInCart(p.id)}
                  onWishlist={(e) => handleWishlist(e, p)}
                  onAddToCart={(e) => handleAddToCart(e, p)}
                  index={i}
                  compact
                />
              ))
          }
        </div>

        {/* ── Bottom CTA ── */}
        {!isLoading && products.length >= limit && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-8"
          >
            <Link
              to={langPath('/flash-sale')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-gray-900 transition-all hover:scale-105 hover:shadow-2xl shadow-orange-500/40"
              style={{ background: 'linear-gradient(135deg, #FF8C00, #FF4500)' }}
            >
              <Zap className="w-4 h-4 fill-current" />
              Lihat Semua Flash Sale
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default FlashSaleSection;

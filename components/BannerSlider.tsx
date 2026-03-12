// components/BannerSlider.tsx
// Full-width banner (1010x298 ratio) dengan overlay info dinamis
// Navigasi prev/next/dots di pojok kanan bawah — tidak overlap konten utama

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Zap, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type PromoCampaign, resolveBannerUrl } from '../services/promoService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, {
  label: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
}> = {
  flash_sale:     { label: 'Flash Sale',       icon: <Zap className="w-3 h-3" />,      bg: 'bg-red-500',    text: 'text-white' },
  seasonal:       { label: 'Special Season',   icon: <Sparkles className="w-3 h-3" />, bg: 'bg-blue-500',   text: 'text-white' },
  member_only:    { label: 'Member Eksklusif', icon: <Sparkles className="w-3 h-3" />, bg: 'bg-purple-600', text: 'text-white' },
  referral_bonus: { label: 'Referral Bonus',   icon: <Sparkles className="w-3 h-3" />, bg: 'bg-green-500',  text: 'text-white' },
  bundle:         { label: 'Bundle Deal',      icon: <Tag className="w-3 h-3" />,      bg: 'bg-amber-500',  text: 'text-white' },
};

const GRADIENT_FALLBACKS = [
  'from-primary-600 via-primary-700 to-rose-800',
  'from-blue-700 via-indigo-700 to-purple-800',
  'from-emerald-600 via-teal-700 to-cyan-800',
  'from-amber-600 via-orange-700 to-red-800',
  'from-violet-600 via-purple-700 to-pink-800',
];

function formatDiscount(c: PromoCampaign): string {
  if (c.discount_type === 'percent') return `${c.discount_value}%`;
  return `Rp ${Number(c.discount_value).toLocaleString('id-ID')}`;
}

// ── Motion Variants ───────────────────────────────────────────────────────────

const bannerVariants = {
  enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
};

const infoVariants = {
  enter:  (d: number) => ({ opacity: 0, y: d > 0 ? 12 : -12 }),
  center: { opacity: 1, y: 0 },
  exit:   (d: number) => ({ opacity: 0, y: d > 0 ? -12 : 12 }),
};

const slideTransition = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const };
const infoTransition  = { duration: 0.35, ease: 'easeOut' as const };

// ── Inject keyframes ──────────────────────────────────────────────────────────

const STYLE_ID = 'banner-glow-styles';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes borderGlow {
      0%, 100% { box-shadow: 0 0 0 1px rgba(251,191,36,0.25), 0 0 10px rgba(251,191,36,0.10); }
      50%       { box-shadow: 0 0 0 1px rgba(251,191,36,0.60), 0 0 22px rgba(251,191,36,0.25); }
    }
    @keyframes edgeSweep {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    .banner-border-glow {
      animation: borderGlow 3s ease-in-out infinite;
    }
    .banner-top-line {
      background: linear-gradient(
        to right,
        transparent,
        rgba(251,191,36,0.40) 25%,
        rgba(255,240,160,0.90) 50%,
        rgba(251,191,36,0.40) 75%,
        transparent
      );
      background-size: 200% 100%;
      animation: edgeSweep 2.8s linear infinite;
    }
    .banner-bottom-line {
      background: linear-gradient(
        to right,
        transparent,
        rgba(251,191,36,0.20) 30%,
        rgba(251,191,36,0.45) 50%,
        rgba(251,191,36,0.20) 70%,
        transparent
      );
      background-size: 200% 100%;
      animation: edgeSweep 3.4s linear infinite reverse;
    }
  `;
  document.head.appendChild(style);
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface BannerSliderProps {
  campaigns: PromoCampaign[];
  autoplay?: boolean;
  autoplay_interval?: number;
  onSlideChange?: (index: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const BannerSlider: React.FC<BannerSliderProps> = ({
  campaigns,
  autoplay = true,
  autoplay_interval = 5000,
  onSlideChange,
}) => {
  const [current, setCurrent]     = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused]       = useState(false);

  useEffect(() => { injectStyles(); }, []);

  const active = campaigns.filter(c => c.is_active === 1);

  const go_to = useCallback((idx: number, dir: 1 | -1) => {
    setDirection(dir);
    setCurrent(idx);
    onSlideChange?.(idx);
  }, [onSlideChange]);

  const prev = () => go_to((current - 1 + active.length) % active.length, -1);
  const next = useCallback(
    () => go_to((current + 1) % active.length, 1),
    [current, active.length, go_to],
  );

  useEffect(() => {
    if (!autoplay || paused || active.length <= 1) return;
    const t = setTimeout(next, autoplay_interval);
    return () => clearTimeout(t);
  }, [autoplay, paused, active.length, next, autoplay_interval]);

  if (!active.length) return null;

  const c        = active[current];
  const badge    = TYPE_BADGE[c.type] ?? TYPE_BADGE.seasonal;
  const fallback = GRADIENT_FALLBACKS[current % GRADIENT_FALLBACKS.length];
  const hasBanner = !!c.banner_image;

  return (
    <div
      className="relative w-full select-none rounded-2xl overflow-hidden banner-border-glow"
      style={{ aspectRatio: '1010 / 298' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Animated gold top edge ─────────────────────────────────────── */}
      <div className="banner-top-line absolute top-0 left-0 w-full h-[2px] z-20 pointer-events-none" />

      {/* ── Animated gold bottom edge ──────────────────────────────────── */}
      <div className="banner-bottom-line absolute bottom-0 left-0 w-full h-[2px] z-20 pointer-events-none" />

      {/* ══ LAYER 1: Banner image ══════════════════════════════════════════ */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={`banner-${c.id}`}
          custom={direction}
          variants={bannerVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          className="absolute inset-0"
        >
          {hasBanner ? (
            <img
              src={resolveBannerUrl(c.banner_image)}
              alt={c.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${fallback}`} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ══ LAYER 2: Left-to-right dark gradient — teks selalu terbaca ════ */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.15) 60%, transparent 80%)',
        }}
      />

      {/* ══ LAYER 3: Konten info — pojok KIRI ════════════════════════════ */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`info-${c.id}`}
          custom={direction}
          variants={infoVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={infoTransition}
          className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 py-4 pointer-events-none z-[2]"
        >
          {/* Badge */}
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest w-fit mb-2 ${badge.bg} ${badge.text}`}>
            {badge.icon}
            {badge.label}
          </div>

          {/* Discount */}
          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <span
              className="text-white text-2xl md:text-4xl font-black tracking-tight leading-none"
              style={{
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 3px 10px rgba(0,0,0,0.8)',
                WebkitTextStroke: '1px rgba(0,0,0,0.6)',
              }}
            >
              {formatDiscount(c)}
            </span>
            <span
              className="text-white text-sm md:text-base font-semibold"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)' }}
            >
              OFF
            </span>
          </div>

          {/* Nama campaign */}
          <h3
            className="text-white font-bold text-sm md:text-lg leading-snug line-clamp-1 mb-0.5"
            style={{
              textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 8px rgba(0,0,0,0.9)',
              WebkitTextStroke: '0.5px rgba(0,0,0,0.5)',
            }}
          >
            {c.name}
          </h3>

          {/* Deskripsi */}
          {c.description && (
            <p
              className="hidden md:block text-white text-xs leading-relaxed line-clamp-1"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.8)' }}
            >
              {c.description}
            </p>
          )}

          {/* Min transaksi */}
          {c.min_transaction > 0 && (
            <p
              className="text-white/80 text-[10px] mt-1 font-medium hidden md:block"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
            >
              Min. Rp {Number(c.min_transaction).toLocaleString('id-ID')}
              {c.min_tier_name ? ` · Member ${c.min_tier_name}` : ''}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ══ LAYER 4: CTA button — kiri bawah ════════════════════════════ */}
      <div className="absolute bottom-3 left-6 md:bottom-4 md:left-10 pointer-events-auto z-[3]">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 bg-white text-gray-900 font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-all shadow-lg active:scale-95 group"
        >
          Lihat Promo
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ══ LAYER 5: Navigasi — pojok KANAN BAWAH ════════════════════════ */}
      {active.length > 1 && (
        <div className="absolute bottom-3 right-4 md:bottom-4 md:right-6 flex items-center gap-2 pointer-events-auto z-[3]">
          <button
            onClick={prev}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/50 transition-all active:scale-90"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>

          <div className="flex gap-1">
            {active.map((_, i) => (
              <button
                key={i}
                onClick={() => go_to(i, i > current ? 1 : -1)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/50 transition-all active:scale-90"
            aria-label="Next"
          >
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      )}

      {/* ══ LAYER 6: Progress bar ════════════════════════════════════════ */}
      {autoplay && !paused && active.length > 1 && (
        <motion.div
          key={`${c.id}-progress`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: autoplay_interval / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-[2px] bg-white/50 origin-left w-full pointer-events-none z-[4]"
        />
      )}
    </div>
  );
};

export default BannerSlider;

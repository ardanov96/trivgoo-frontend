import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Zap, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type PromoCampaign, resolveBannerUrl } from '../services/promoService';
import { useLangNavigate } from '@/src/hooks/useLangNavigate';

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
    .nav-btn-side {
      transition: opacity 0.2s ease, background 0.2s ease;
      opacity: 0;
    }
    .banner-container:hover .nav-btn-side {
      opacity: 1;
    }
    .nav-btn-side > span {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      transition: transform 0.2s ease;
    }
    .nav-btn-side:hover > span {
      transform: scale(1.15);
    }
    .nav-btn-side:active > span {
      transform: scale(0.88);
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

  const { langNavigate, langPath } = useLangNavigate();

  useEffect(() => { injectStyles(); }, []);

  const active = campaigns.filter(c => c.is_active === 1);

  const go_to = useCallback((idx: number, dir: 1 | -1) => {
    setDirection(dir);
    setCurrent(idx);
    onSlideChange?.(idx);
  }, [onSlideChange]);

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    go_to((current - 1 + active.length) % active.length, -1);
  };

  const next = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      go_to((current + 1) % active.length, 1);
    },
    [current, active.length, go_to],
  );

  useEffect(() => {
    if (!autoplay || paused || active.length <= 1) return;
    const t = setTimeout(() => next(), autoplay_interval);
    return () => clearTimeout(t);
  }, [autoplay, paused, active.length, next, autoplay_interval]);

  if (!active.length) return null;

  const c        = active[current];
  const badge    = TYPE_BADGE[c.type] ?? TYPE_BADGE.seasonal;
  const fallback = GRADIENT_FALLBACKS[current % GRADIENT_FALLBACKS.length];
  const hasBanner = !!c.banner_image;

  // Apakah banner gelap → pakai teks putih, atau terang → pakai shadow gelap
  // Default: selalu pakai teks putih + text-shadow agar terbaca di atas gambar apapun
  const hasOverlayNeeded = hasBanner;

  return (
    <div
      className="relative w-full select-none rounded-2xl overflow-hidden banner-border-glow banner-container"
      style={{ aspectRatio: '1010 / 298' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Animated gold top edge ─────────────────────────────────────── */}
      <div className="banner-top-line absolute top-0 left-0 w-full h-[2px] z-20 pointer-events-none" />

      {/* ── Animated gold bottom edge ──────────────────────────────────── */}
      <div className="banner-bottom-line absolute bottom-0 left-0 w-full h-[2px] z-20 pointer-events-none" />

      {/* ══ LAYER 1: Banner image — CLICKABLE ═════════════════════════════ */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={`banner-${c.id}`}
          custom={direction}
          variants={bannerVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          className="absolute inset-0 cursor-pointer"
          onClick={() => langNavigate(`/promo/campaign/${c.id}`)}
          title={`Lihat promo ${c.name}`}
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

          {/* ── Gradient overlay kiri agar teks terbaca di atas foto ── */}
          {hasOverlayNeeded && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ══ LAYER 2: Info promo — overlay kiri ══════════════════════════ */}
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
          {/* Badge tipe promo */}
          <div className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[11px] font-bold mb-2 ${badge.bg} ${badge.text}`}>
            {badge.icon}
            {badge.label}
          </div>

          {/* Nama campaign */}
          <h3
            className="text-white font-extrabold leading-tight mb-1 drop-shadow-lg"
            style={{
              fontSize: 'clamp(0.85rem, 2.2vw, 1.35rem)',
              maxWidth: '55%',
              textShadow: '0 1px 6px rgba(0,0,0,0.55)',
            }}
          >
            {c.name}
          </h3>

          {/* Deskripsi singkat */}
          {c.description && (
            <p
              className="text-white/85 font-medium leading-snug mb-2.5 drop-shadow"
              style={{
                fontSize: 'clamp(0.7rem, 1.4vw, 0.85rem)',
                maxWidth: '50%',
                textShadow: '0 1px 4px rgba(0,0,0,0.50)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {c.description}
            </p>
          )}

          {/* Nominal diskon */}
          <div className="flex items-center gap-2">
            <span
              className="font-extrabold text-amber-300 drop-shadow-lg"
              style={{
                fontSize: 'clamp(1rem, 2.8vw, 1.6rem)',
                textShadow: '0 1px 8px rgba(0,0,0,0.50)',
              }}
            >
              {formatDiscount(c)}
            </span>
            <span
              className="text-white/70 font-semibold"
              style={{ fontSize: 'clamp(0.65rem, 1.2vw, 0.78rem)' }}
            >
              {c.discount_type === 'percent' ? 'DISKON' : 'POTONGAN'}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ══ LAYER 3: CTA button — kiri bawah ════════════════════════════ */}
      <div className="absolute bottom-3 left-6 md:bottom-4 md:left-10 pointer-events-auto z-[3]">
        <Link
          to={langPath(`/promo/campaign/${c.id}`)}
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 bg-white text-gray-900 font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-all shadow-lg active:scale-95 group"
        >
          Lihat Promo
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ══ LAYER 4: Navigasi — sisi KIRI & KANAN banner ═════════════════ */}
      {active.length > 1 && (
        <>
          <button
            onClick={prev}
            className="nav-btn-side absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/25 text-white hover:bg-black/60 z-[3] shadow-lg overflow-hidden"
            style={{ transform: 'translateY(-50%)' }}
            aria-label="Previous"
          >
            <span><ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /></span>
          </button>

          <button
            onClick={next}
            className="nav-btn-side absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/25 text-white hover:bg-black/60 z-[3] shadow-lg overflow-hidden"
            style={{ transform: 'translateY(-50%)' }}
            aria-label="Next"
          >
            <span><ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></span>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-auto z-[3]">
            {active.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); go_to(i, i > current ? 1 : -1); }}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* ══ LAYER 5: Progress bar ════════════════════════════════════════ */}
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
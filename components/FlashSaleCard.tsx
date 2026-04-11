// components/FlashSaleCard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, MapPin, Zap, Clock } from 'lucide-react';
import { encodeId } from '@/utils/hashids';
import { generateSlug } from '@/utils/slugify';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FlashProduct {
  id:                number;
  name:              string;
  image_url?:        string;
  image?:            string;
  price:             number;
  currency?:         string;
  location?:         string;
  is_flash_sale?:    boolean;
  flash_sale_price?: number;
  flash_discount_pct?: number;
  flash_ends_at?:    string;
  owner?: { name?: string };
  details?: { type?: string };
}

interface FlashSaleCardProps {
  product:     FlashProduct;
  isLoggedIn?: boolean;
  isSaved?:    boolean;
  isInCart?:   boolean;
  onWishlist?: (e: React.MouseEvent) => void;
  onAddToCart?:(e: React.MouseEvent) => void;
  index?:      number;
  compact?:    boolean;
}

// ── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(endsAt?: string) {
  const calc = () => {
    if (!endsAt) return null;
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return { h, m, s, expired: false };
  };

  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return time;
}

// ── Pad helper ────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

// ── FlashSaleCard ─────────────────────────────────────────────────────────────

export const FlashSaleCard: React.FC<FlashSaleCardProps> = ({
  product, isLoggedIn, isSaved, isInCart, onWishlist, onAddToCart, index = 0, compact = false,
}) => {
  const time  = useCountdown(product.flash_ends_at);
  const img   = product.image_url || product.image || '';
  const price = product.flash_sale_price ?? product.price;
  const orig  = product.price;
  const pct   = product.flash_discount_pct ?? 0;
  const curr  = product.currency ?? 'IDR';
  const to    = `/product/${encodeId(product.id)}/${generateSlug(product.name)}`;
  const isFlash = !!product.is_flash_sale && !!product.flash_sale_price;
  const urgency = time && !time.expired && time.h < 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative"
    >
      {/* ── Glow ring on urgent flash ── */}
      {urgency && (
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
          style={{ background: 'linear-gradient(135deg, #FF4500 0%, #FF8C00 50%, #FF4500 100%)', filter: 'blur(8px)' }}
        />
      )}

      <Link
        to={to}
        className="relative z-10 block bg-white rounded-2xl overflow-hidden border border-gray-100 group-hover:border-orange-200 shadow-sm group-hover:shadow-xl transition-all duration-300"
      >
        {/* ── Image ── */}
        <div className={`relative overflow-hidden bg-gray-100 ${compact ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}>
          {img ? (
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
              <Zap className="w-10 h-10 text-orange-300" />
            </div>
          )}

          {/* Discount badge */}
          {isFlash && pct > 0 && (
            <div
              className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[11px] font-extrabold shadow-md"
              style={{ background: 'linear-gradient(135deg, #FF4500, #FF8C00)' }}
            >
              <Zap className="w-2.5 h-2.5 fill-current" />
              -{pct}%
            </div>
          )}

          {/* Countdown */}
          {isFlash && time && !time.expired && (
            <div
              className={`absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-white text-[10px] font-bold backdrop-blur-sm shadow-lg ${urgency ? 'animate-pulse' : ''}`}
              style={{ background: urgency ? 'rgba(180,20,0,0.85)' : 'rgba(0,0,0,0.65)' }}
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span>
                {time.h > 0 && `${pad(time.h)}:`}{pad(time.m)}:{pad(time.s)}
              </span>
              <span className="text-white/70">tersisa</span>
            </div>
          )}

          {/* Wishlist button */}
          {onWishlist && (
            <button
              onClick={onWishlist}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
          )}
        </div>

        {/* ── Info ── */}
        <div className="p-3.5">
          <h3 className={`font-bold text-gray-900 line-clamp-2 leading-snug mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {product.name}
          </h3>

          {product.location && !compact && (
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 shrink-0" />
              {product.location}
            </p>
          )}

          {/* Price */}
          <div className="flex items-end justify-between gap-2 mt-2">
            <div>
              {isFlash && orig !== price ? (
                <>
                  <p className={`text-gray-400 line-through leading-none ${compact ? 'text-[10px]' : 'text-xs'}`}>
                    {curr} {orig.toLocaleString('id-ID')}
                  </p>
                  <p className={`font-extrabold text-orange-600 leading-tight ${compact ? 'text-sm' : 'text-base'}`}>
                    {curr} {price.toLocaleString('id-ID')}
                  </p>
                </>
              ) : (
                <p className={`font-extrabold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
                  {curr} {orig.toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Add to cart */}
            {onAddToCart && !compact && (
              <button
                onClick={onAddToCart}
                className={`shrink-0 p-2 rounded-xl transition-all hover:scale-110 shadow-sm ${
                  isInCart
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FlashSaleCard;

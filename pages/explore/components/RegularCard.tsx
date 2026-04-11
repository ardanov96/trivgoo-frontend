import { Heart, MapPin, ShoppingCart, Star, Tag, Zap, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { Product } from '../../../types';
import { generateSlug } from '../../../utils/slugify';
import { encodeId } from '../../../utils/hashids';
import { getImageUrl, FALLBACK_IMAGE } from '../../../utils/imageUtils';
import { getActiveVouchers, calcBestDiscount, formatLocation, formatRp } from '../utils';
import { VoucherPillList } from './SharedUI';

interface Props {
  product:    Product;
  isLoggedIn: boolean;
  isSaved:    boolean;
  isInCart:   boolean;
  onWishlist: (e: React.MouseEvent) => void;
  onAddToCart:(e: React.MouseEvent) => void;
}

// ── Countdown hook ────────────────────────────────────────────────────────────

function useFlashCountdown(endsAt?: string | null) {
  const calc = () => {
    if (!endsAt) return null;
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return { h, m, s };
  };
  const [time, setTime] = React.useState(calc);
  React.useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return time;
}

import React from 'react';
const pad = (n: number) => String(n).padStart(2, '0');

// ── Component ─────────────────────────────────────────────────────────────────

export const RegularCard = ({ product, isLoggedIn, isSaved, isInCart, onWishlist, onAddToCart }: Props) => {
  const { t }          = useTranslation();
  const { langPath }   = useLangNavigate();
  const activeVouchers = getActiveVouchers(product);
  const bestDiscount   = calcBestDiscount(activeVouchers, Number(product.price));

  // ✅ Flash sale fields (cast ke any karena belum ada di type Product lama)
  const p = product as any;
  const isFlash    = !!p.is_flash_sale && !!p.flash_sale_price;
  const flashPrice = p.flash_sale_price ? Number(p.flash_sale_price) : null;
  const flashPct   = p.flash_discount_pct ? Number(p.flash_discount_pct) : null;
  const flashEnds  = p.flash_ends_at ?? null;
  const urgency    = flashEnds && (new Date(flashEnds).getTime() - Date.now()) < 3 * 3_600_000;

  const time = useFlashCountdown(isFlash ? flashEnds : null);

  const displayPrice = isFlash && flashPrice ? flashPrice : Number(product.price);

  return (
    <Link
      to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200 hover:-translate-y-1 flex flex-col relative"
      style={isFlash && urgency ? { boxShadow: '0 0 0 1.5px #FF4500' } : undefined}
    >
      {/* ── Image ── */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={getImageUrl(product.image_url || product.image)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
        />

        {/* Wishlist */}
        {isLoggedIn && (
          <button
            onClick={onWishlist}
            className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90"
            title={t('product.save_wishlist', 'Save to Wishlist')}
          >
            <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
          </button>
        )}

        {/* Rating */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
          <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />
          {product.rating}
        </div>

        {/* ✅ Flash Sale badge — prioritas lebih tinggi dari voucher badge */}
        {isFlash && flashPct ? (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] font-extrabold shadow-md z-10"
            style={{ background: 'linear-gradient(135deg, #FF4500, #FF8C00)' }}
          >
            <Zap className="w-3 h-3 fill-current" />
            FLASH -{flashPct}%
          </div>
        ) : activeVouchers.length > 0 ? (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md z-10">
            <Tag className="w-3 h-3" />
            {activeVouchers.length === 1
              ? `${activeVouchers[0].type === 'percent' ? activeVouchers[0].value + '%' : formatRp(activeVouchers[0].value)} OFF`
              : `${activeVouchers.length} ${t('common.popular', 'Promo')}`}
          </div>
        ) : null}

        {/* ✅ Countdown overlay di bawah gambar */}
        {isFlash && time && (
          <div
            className={`absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[10px] font-bold z-10 ${urgency ? 'animate-pulse' : ''}`}
            style={{ background: urgency ? 'rgba(180,20,0,0.85)' : 'rgba(0,0,0,0.60)', backdropFilter: 'blur(4px)' }}
          >
            <Clock className="w-2.5 h-2.5 shrink-0" />
            {time.h > 0 && `${pad(time.h)}:`}{pad(time.m)}:{pad(time.s)}
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {product.location && (
          <p className="text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {formatLocation(product.location)}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-1">{t('explore.from', 'From')}</p>

          {/* ✅ Harga flash sale dengan harga asli dicoret */}
          {isFlash && flashPrice ? (
            <div>
              <p className="text-sm text-gray-400 line-through leading-none">
                {product.currency} {Number(product.price).toLocaleString('id-ID')}
              </p>
              <p className="text-lg font-bold text-orange-600">
                {product.currency} {flashPrice.toLocaleString('id-ID')}
                <span className="text-sm font-medium text-gray-500"> /{t('common.per_person', 'pax')}</span>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-gray-900">
                {product.currency} {Number(product.price).toLocaleString('id-ID')}
                <span className="text-sm font-medium text-gray-500"> /{t('common.per_person', 'pax')}</span>
              </p>
              {bestDiscount > 0 && (
                <p className="text-xs text-green-600 font-semibold mt-0.5">
                  {t('explore.from', 'From')} {product.currency} {(Number(product.price) - bestDiscount).toLocaleString('id-ID')} {t('explore.after_promo', 'after promo')}
                </p>
              )}
              <VoucherPillList vouchers={activeVouchers} max={2} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <Link
              to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}
              onClick={(e) => e.stopPropagation()}
              className="border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center flex items-center justify-center"
            >
              {t('explore.view_details', 'See Details')}
            </Link>
            <button
              onClick={onAddToCart}
              disabled={isInCart}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border transform active:scale-[0.98] ${
                isInCart
                  ? 'border-green-500 text-green-600 bg-green-50 cursor-default'
                  : isFlash
                  ? 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600 hover:border-orange-600 shadow-md'
                  : 'border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md'
              }`}
            >
              <ShoppingCart className={`w-3.5 h-3.5 shrink-0 ${isInCart ? 'stroke-green-600' : ''}`} />
              <span className="truncate">
                {isInCart ? t('product.added_to_cart', 'Added') : t('product.add_to_cart', 'Add to Cart')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

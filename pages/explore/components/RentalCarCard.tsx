import { Award, Briefcase, Car, Clock, Droplet, Gauge, Heart, MapPin, ShoppingCart, Sparkles, Star, Users, UserCog, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { useTranslation } from 'react-i18next';
import { Product } from '../../../types';
import { CarDetails } from '../../../types';
import { generateSlug } from '../../../utils/slugify';
import { encodeId } from '../../../utils/hashids';
import { getImageUrl, FALLBACK_IMAGE } from '../../../utils/imageUtils';
import { getActiveVouchers, calcBestDiscount, formatLocation, formatRp } from '../utils';
import { VoucherPillList } from './SharedUI';

const PREVIEW_DAYS = 2;

interface Props {
  product:     Product;
  agentCount?: number;
  isLoggedIn:  boolean;
  isSaved:     boolean;
  isInCart:    boolean;
  onWishlist:  (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
}

// ── Countdown hook ────────────────────────────────────────────────────────────

function useFlashCountdown(endsAt?: string | null) {
  const calc = () => {
    if (!endsAt) return null;
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return time;
}

const pad = (n: number) => String(n).padStart(2, '0');

// ── Component ─────────────────────────────────────────────────────────────────

export const RentalCarCard = ({ product, agentCount = 1, isLoggedIn, isSaved, isInCart, onWishlist, onAddToCart }: Props) => {
  const details        = product.details as CarDetails;
  const activeVouchers = getActiveVouchers(product);
  const baseTotal      = Number(product.price) * PREVIEW_DAYS;
  const bestDiscount   = calcBestDiscount(activeVouchers, baseTotal);
  const finalTotal     = baseTotal - bestDiscount;
  const { langPath }   = useLangNavigate();
  const { t }          = useTranslation();

  // ✅ Flash sale fields
  const p          = product as any;
  const isFlash    = !!p.is_flash_sale && !!p.flash_sale_price;
  const flashPrice = isFlash ? Number(p.flash_sale_price) : null;
  const flashPct   = isFlash ? Number(p.flash_discount_pct) : null;
  const flashEnds  = isFlash ? (p.flash_ends_at ?? null) : null;
  const urgency    = flashEnds && (new Date(flashEnds).getTime() - Date.now()) < 3 * 3_600_000;
  const flashTotal = flashPrice ? flashPrice * PREVIEW_DAYS : null;
  const time       = useFlashCountdown(flashEnds);

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border hover:border-orange-200 hover:-translate-y-1 flex flex-col md:flex-row relative w-full"
      style={{
        borderColor: isFlash && urgency ? '#FF4500' : '#f3f4f6',
        borderWidth: '1px',
      }}
    >
      {/* ── Image column ── */}
      <div className="md:w-1/3 relative overflow-hidden">
        <div className="aspect-[4/3] md:aspect-auto md:h-full">
          <img
            src={getImageUrl(product.image_url || product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
          />
        </div>

        {/* Wishlist */}
        {isLoggedIn && (
          <button
            onClick={(e) => { e.stopPropagation(); onWishlist(e); }}
            className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90"
          >
            <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
          </button>
        )}

        {/* Rating */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
          <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />
          {product.rating || '-'}
        </div>

        {/* ✅ Flash badge — menggantikan voucher badge */}
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
            <Sparkles className="w-3 h-3" />
            {activeVouchers.length} {t('common.popular')}
          </div>
        ) : null}

        {/* ✅ Countdown */}
        {isFlash && time && (
          <div
            className={`absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[10px] font-bold z-10 ${urgency ? 'animate-pulse' : ''}`}
            style={{ background: urgency ? 'rgba(180,20,0,0.85)' : 'rgba(0,0,0,0.60)', backdropFilter: 'blur(4px)' }}
          >
            <Clock className="w-2.5 h-2.5 shrink-0" />
            {time.h > 0 && `${pad(time.h)}:`}{pad(time.m)}:{pad(time.s)}
          </div>
        )}

        {/* Agent count badge */}
        {agentCount > 1 && (
          <div className="absolute top-14 left-4 bg-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md z-10 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {agentCount} {t('rental.select_agent', { count: agentCount }).split('(')[0].trim()}
          </div>
        )}
      </div>

      {/* ── Info column ── */}
      <div className="md:w-2/3 p-6 flex flex-col">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-serif font-bold text-2xl text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-1 shrink-0" />
              {formatLocation(product.location || '')}
            </div>
          </div>

          {/* ✅ Price block — flash sale dengan harga coret */}
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-0.5">
              {agentCount > 1 ? t('rental.starting_from') : t('rental.price_label')}
            </p>

            {isFlash && flashPrice ? (
              <>
                <p className="text-sm text-gray-400 line-through leading-none">
                  {product.currency} {Number(product.price).toLocaleString('id-ID')}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {product.currency} {flashPrice.toLocaleString('id-ID')}
                  <span className="text-sm font-medium text-gray-500 ml-1">{t('rental.per_day')}</span>
                </p>
                <p className="text-xs text-orange-500 font-semibold mt-0.5">
                  ⚡ Flash -{flashPct}% · Est. {PREVIEW_DAYS} hari:{' '}
                  <span className="font-extrabold">{formatRp(flashTotal!)}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  {product.currency} {Number(product.price).toLocaleString('id-ID')}
                  <span className="text-sm font-medium text-gray-500 ml-1">{t('rental.per_day')}</span>
                </p>
                {bestDiscount > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-0.5">
                    {t('rental.estimated_days', { days: PREVIEW_DAYS })}:{' '}
                    <span className="line-through text-gray-400">{formatRp(baseTotal)}</span>{' '}
                    <span className="text-green-700 font-extrabold">{formatRp(finalTotal)}</span>
                  </p>
                )}
                <div className="flex justify-end mt-1">
                  <VoucherPillList vouchers={activeVouchers} max={2} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { icon: Gauge,   label: t('explore.transmission'), value: details?.transmission === 'Automatic' ? t('explore.automatic') : t('explore.manual') },
            { icon: Users,   label: t('rental.seats'),         value: `${details?.seats} ${t('common.passengers')}` },
            { icon: Award,   label: 'Year',                    value: details?.year || '-' },
            { icon: Droplet, label: 'Fuel Policy',             value: details?.fuelPolicy || 'Standard' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <Icon className="w-5 h-5 text-primary-600 mx-auto mb-2" />
              <div className="text-xs text-gray-500">{label}</div>
              <div className="font-semibold text-sm">{value}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {details?.luggage && (
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full">
              <Briefcase className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-medium">{details.luggage} {t('rental.luggage')}</span>
            </div>
          )}
          {details?.driver && (
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full">
              <UserCog className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-medium">{t('rental.with_driver')}</span>
            </div>
          )}
          {details?.transportCategory && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${details.transportCategory === 'Airport Transfer' ? 'bg-green-50' : 'bg-primary-50'}`}>
              <Car className={`w-4 h-4 ${details.transportCategory === 'Airport Transfer' ? 'text-green-600' : 'text-primary-600'}`} />
              <span className={`text-xs font-medium ${details.transportCategory === 'Airport Transfer' ? 'text-green-700' : 'text-primary-700'}`}>
                {details.transportCategory}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
          {agentCount > 1 ? (
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex-1 border-2 border-primary-600 text-primary-600 py-3 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-all text-center flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              {t('rental.select_agent', { count: agentCount })}
            </button>
          ) : (
            <Link
              to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center"
            >
              {t('explore.view_details')}
            </Link>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(e); }}
            disabled={isInCart}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border-2 transform active:scale-[0.98] ${
              isInCart
                ? 'border-green-500 text-green-600 bg-green-50 cursor-default'
                : isFlash
                ? 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600 hover:border-orange-600 shadow-md'
                : 'border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md'
            }`}
          >
            <ShoppingCart className={`w-4 h-4 ${isInCart ? 'stroke-green-600' : ''}`} />
            {isInCart ? t('product.added_to_cart') : t('product.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
};

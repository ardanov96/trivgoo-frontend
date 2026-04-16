'use client';

import { ArrowRight, ChevronLeft, ChevronRight, Flame, MapPin, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { Product } from '../../../types';
import { generateSlug } from '../../../utils/slugify';
import { encodeId } from '../../../utils/hashids';
import BannerSlider from '../../../components/BannerSlider';
import type { PromoCampaign } from '../../../services/promoService';

interface TimerState {
  h: string; m: string; s: string;
  isCritical: boolean; isUrgent: boolean; progressPercent: number;
}

interface Props {
  flashSaleProducts: Product[];
  activeCampaigns:   PromoCampaign[];
  activeCampaign:    PromoCampaign | null;
  timer:             TimerState;
  displayedCampaign: PromoCampaign | null;
  onSlideChange:     (index: number) => void;
}

export const FlashSaleSection = ({
  flashSaleProducts, activeCampaigns, activeCampaign,
  timer, displayedCampaign, onSlideChange,
}: Props) => {
  const { langNavigate } = useLangNavigate();
  const { t } = useTranslation();
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    sliderRef.current?.scrollTo({
      left: sliderRef.current.scrollLeft + (dir === 'right' ? 350 : -350),
      behavior: 'smooth',
    });
  };

  const hasCampaignBg    = !!activeCampaign;
  const hasCampaigns     = activeCampaigns.length > 0;
  const hasFlashProducts = flashSaleProducts.length > 0;

  if (!hasCampaigns && !hasFlashProducts) return null;

  const urgencyLabel = timer.isCritical
    ? t('home.flash_hurry',     '⚡ Hurry Up!')
    : timer.isUrgent
    ? t('home.flash_urgent',    '🔥 Less than 1 hour!')
    : t('home.flash_dont_miss', "Don't Miss Out");

  return (
    <div className={`py-16 md:py-24 overflow-hidden relative transition-colors duration-500 ${hasCampaignBg ? 'text-white' : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50'}`}>

      {/* ── Background ── */}
      {hasCampaignBg ? (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{
  background: 'linear-gradient(135deg, #c8922a 0%, #e8b84b 20%, #fad96b 38%, #fce97f 50%, #f5cc55 62%, #d4a030 80%, #b8800f 100%)'
}} />
<div className="absolute inset-0" style={{
  background: 'linear-gradient(to bottom right, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 30%, transparent 55%, rgba(0,0,0,0.08) 80%, rgba(0,0,0,0.15) 100%)'
}} />
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl"
  style={{ background: 'radial-gradient(circle, rgba(255,240,150,0.3) 0%, transparent 70%)' }} />
<div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full blur-3xl"
  style={{ background: 'radial-gradient(circle, rgba(180,120,0,0.25) 0%, transparent 70%)' }} />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        </div>
      ) : (
        <>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── 1. Countdown widget — paling atas ── */}
        <motion.div
          key={displayedCampaign?.id ?? 'no-campaign'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 px-6 py-4 rounded-2xl mb-10 ${hasCampaignBg ? 'bg-black/25 backdrop-blur-md border border-yellow-400/40 shadow-xl shadow-yellow-900/40' : 'bg-white shadow-xl shadow-orange-100/50 border border-orange-100'}`}
        >
          <div className="flex items-center gap-3 shrink-0">
            <div className={`p-2 rounded-lg ${hasCampaignBg ? 'bg-yellow-400/20 border border-yellow-400/30' : 'bg-red-50'}`}>
              <Timer className={`w-5 h-5 animate-pulse ${hasCampaignBg ? 'text-yellow-300' : 'text-red-500'}`} />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-sm whitespace-nowrap ${hasCampaignBg ? 'text-yellow-100' : 'text-gray-900'}`}>
                {displayedCampaign ? displayedCampaign.name : t('home.flash_offer_ends', 'Offer Ends In')}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${hasCampaignBg ? 'text-yellow-300 drop-shadow-sm' : 'text-red-500'}`}>
                {urgencyLabel}
              </span>
            </div>
          </div>

          <div className={`hidden sm:block h-10 w-px shrink-0 ${hasCampaignBg ? 'bg-yellow-400/30' : 'bg-gray-200'}`} />

          <div className="flex gap-2 items-center shrink-0">
            {[
              { label: t('home.flash_hrs', 'Hrs'), value: timer.h },
              { label: t('home.flash_min', 'Min'), value: timer.m },
            ].map(({ label, value }) => (
              <div key={label} className={`rounded-lg px-3 py-2 min-w-[48px] text-center ${hasCampaignBg ? 'bg-black/40 text-yellow-300 border border-yellow-500/30' : 'bg-gray-900 text-white'}`}>
                <span className="text-xl font-mono font-bold block leading-none">{value}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">{label}</span>
              </div>
            ))}
            <span className={`font-bold text-lg ${hasCampaignBg ? 'text-yellow-400/70' : 'text-gray-300'}`}>:</span>
            <div className={`rounded-lg px-3 py-2 min-w-[48px] text-center shadow-lg transition-colors duration-500 ${
              hasCampaignBg
                ? timer.isCritical ? 'bg-red-500 text-white shadow-red-500/40 animate-pulse border border-red-400/50'
                  : timer.isUrgent ? 'bg-amber-400 text-black shadow-amber-400/30 border border-amber-300/50'
                  : 'bg-yellow-400 text-black shadow-yellow-400/30 border border-yellow-300/50'
                : timer.isCritical ? 'bg-red-600 text-white shadow-red-600/30 animate-pulse'
                  : 'bg-red-500 text-white shadow-red-500/30'
            }`}>
              <span className="text-xl font-mono font-bold block leading-none">{timer.s}</span>
              <span className={`text-[9px] font-bold uppercase ${hasCampaignBg && !timer.isCritical ? 'text-black/70' : 'text-white/80'}`}>
                {t('home.flash_sec', 'Sec')}
              </span>
            </div>
          </div>

          {displayedCampaign && (
            <>
              <div className="hidden sm:block h-10 w-px shrink-0 bg-yellow-400/30" />
              <div className="flex-1 min-w-[140px] max-w-xs">
                <div className="flex justify-between text-[10px] font-bold mb-1.5">
                  <span className="text-yellow-200/60">{t('home.flash_campaign_progress', 'Campaign Progress')}</span>
                  <span className="text-yellow-300 font-bold">{timer.progressPercent}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-yellow-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(251,191,36,0.55)]"
                    style={{ width: `${timer.progressPercent}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* ── 2. Campaign Banner ── */}
        {hasCampaigns && (
          <div className="mb-10">
            <BannerSlider campaigns={activeCampaigns} onSlideChange={onSlideChange} />
          </div>
        )}

        {/* ── 3. Flash Sale Products ── */}
        {hasFlashProducts && (
          <>
            {hasCampaigns && (
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-px flex-1 ${hasCampaignBg ? 'bg-yellow-400/30' : 'bg-orange-200'}`} />
                <span className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md"
                  style={{ background: 'rgba(0,0,0,0.55)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.4)', letterSpacing: '0.2em' }}>
                  ⚡ Flash Sale
                </span>
                <div className={`h-px flex-1 ${hasCampaignBg ? 'bg-yellow-400/30' : 'bg-orange-200'}`} />
              </div>
            )}

            {/* Product slider */}
            <div
              ref={sliderRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0"
              style={{ scrollBehavior: 'smooth' }}
            >
              {flashSaleProducts.map((product) => {
                const isCampaignProduct = activeCampaign && (product as any).flashSale?.campaignId === activeCampaign.id;
                return (
                  <div
                    key={product.id}
                    onClick={() => langNavigate(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}
                    className="min-w-[220px] max-w-[260px] snap-center group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                  >
                    {isCampaignProduct && (
                      <div className="absolute top-0 left-0 w-full bg-yellow-400 text-black text-[10px] font-bold text-center py-1 z-20 uppercase tracking-widest">
                        {t('home.flash_official_deal', 'Official Event Deal')}
                      </div>
                    )}

                    {/* Image */}
                    <div className="h-44 relative overflow-hidden shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Discount badge */}
                      <div className={`absolute top-3 left-3 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-lg tracking-wide ${isCampaignProduct ? 'bg-amber-600' : 'bg-red-600'}`}>
                        -{(product as any).flash_discount_pct}% OFF
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <p className="absolute bottom-3 left-3 right-3 text-[10px] font-bold text-white/90 flex items-center gap-1 uppercase tracking-wide truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {product.location}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      {/* Name */}
                      <h3 className="text-sm font-bold leading-snug text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Stock bar */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 animate-pulse">
                            <Flame className="w-3 h-3 fill-red-500" />
                            {t('home.flash_almost_sold', 'Almost Sold Out!')}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">85%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isCampaignProduct ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-orange-400 to-red-600'}`}
                            style={{ width: '85%' }}
                          />
                        </div>
                      </div>

                      {/* Price block — stacked, masing-masing satu baris */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                        {/* Harga asli — baris 1 */}
                        <span className="text-gray-400 line-through text-xs font-medium">
                          {product.currency} {Number(product.price).toLocaleString('id-ID')}
                        </span>
                        {/* Harga flash — baris 2 */}
                        <span className="text-xl font-bold text-red-600 leading-none">
                          {product.currency} {Number((product as any).flash_sale_price).toLocaleString('id-ID')}
                        </span>
                        {/* Button — baris 3, full width */}
                        <button
                          className={`w-full mt-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${isCampaignProduct ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-900 hover:bg-red-600'}`}
                        >
                          {t('home.flash_grab_deal', 'Grab Deal')}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll controls */}
            {flashSaleProducts.length > 1 && (
              <div className="flex justify-center gap-4 mt-2">
                <button
                  onClick={() => scroll('left')}
                  aria-label="Previous"
                  className="p-3 rounded-full transition-all hover:scale-110 active:scale-95 group"
                  style={{ background: 'rgba(0,0,0,0.75)', border: '1.5px solid rgba(255,215,0,0.4)', color: '#ffd700', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  aria-label="Next"
                  className="p-3 rounded-full transition-all hover:scale-110 active:scale-95 group"
                  style={{ background: 'rgba(0,0,0,0.75)', border: '1.5px solid rgba(255,215,0,0.4)', color: '#ffd700', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                >
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
'use client';

import { ArrowRight, ChevronLeft, ChevronRight, Flame, MapPin, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { Product } from '../../../types';
import { generateSlug } from '../../../utils/slugify';
import { encodeId } from '../../../utils/hashids';
import BannerSlider from '../../../components/BannerSlider';
import type { PromoCampaign } from '../../../services/promoService';

interface TimerState { h: string; m: string; s: string; isCritical: boolean; isUrgent: boolean; progressPercent: number; }

interface Props {
  flashSaleProducts: Product[];
  activeCampaigns:   PromoCampaign[];
  activeCampaign:    PromoCampaign | null;
  timer:             TimerState;
  displayedCampaign: PromoCampaign | null;
  onSlideChange:     (index: number) => void;
}

export const FlashSaleSection = ({ flashSaleProducts, activeCampaigns, activeCampaign, timer, displayedCampaign, onSlideChange }: Props) => {
  const navigate    = useNavigate();
  const { langNavigate, langPath } = useLangNavigate();
  const { t } = useTranslation();
  const sliderRef   = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    sliderRef.current?.scrollTo({ left: sliderRef.current.scrollLeft + (dir === 'right' ? 350 : -350), behavior: 'smooth' });
  };

  const hasCampaignBg = !!activeCampaign;

  return (
    <div className={`py-16 md:py-24 overflow-hidden relative transition-colors duration-500 ${hasCampaignBg ? 'text-white' : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50'}`}>
      {/* Background */}
      {hasCampaignBg ? (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-yellow-900 to-amber-900" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-amber-300/15 to-transparent" />
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-yellow-400/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-amber-500/30 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
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
        {/* Product slider or banner */}
        <div ref={sliderRef} className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollBehavior: 'smooth' }}>
          {flashSaleProducts.length > 0
            ? flashSaleProducts.map((product) => {
                const isCampaignProduct = activeCampaign && product.flashSale?.campaignId === activeCampaign.id;
                return (
                  <div key={product.id} onClick={() => langNavigate(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)} className="min-w-[300px] md:min-w-[350px] snap-center group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full relative cursor-pointer border border-gray-100">
                    {isCampaignProduct && <div className="absolute top-0 left-0 w-full bg-yellow-400 text-black text-[10px] font-bold text-center py-1 z-20 uppercase tracking-widest">Official Event Deal</div>}
                    <div className="h-64 md:h-72 relative overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 flex flex-col gap-2 mt-4">
                        <div className={`text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg z-10 tracking-wide w-fit ${isCampaignProduct ? 'bg-amber-600' : 'bg-red-600'}`}>{product.flashSale?.discountPercentage}% OFF</div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-5 left-6 right-6">
                        <p className="text-xs font-bold text-white/90 flex items-center mb-2 uppercase tracking-wide"><MapPin className="w-3.5 h-3.5 mr-1.5" /> {product.location}</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-7 flex-1 flex flex-col justify-between relative bg-white">
                      <h3 className="text-xl font-bold leading-tight font-serif text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center text-xs font-bold text-red-500 animate-pulse"><Flame className="w-3.5 h-3.5 mr-1 fill-red-500" /> Almost Sold Out!</div>
                          <span className="text-xs font-bold text-gray-500">85% Sold</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${isCampaignProduct ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-orange-400 to-red-600'}`} style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-gray-400 line-through text-sm font-medium block mb-0.5">{product.currency} {Number(product.price).toLocaleString('id-ID')}</span>
                          <span className="text-2xl font-bold text-red-600 tracking-tight">{product.currency} {product.flashSale?.salePrice}</span>
                        </div>
                        <button className={`text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center ${isCampaignProduct ? 'bg-amber-600 shadow-amber-600/25 hover:bg-amber-700' : 'bg-gray-900 shadow-gray-900/10 hover:bg-red-600 hover:shadow-red-600/30'}`}>
                          Grab Deal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            : <BannerSlider campaigns={activeCampaigns} onSlideChange={onSlideChange} />
          }
        </div>

        {/* Scroll controls */}
        {flashSaleProducts.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={() => scroll('left')}  aria-label="Previous" className={`p-3 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 group ${hasCampaignBg ? 'bg-yellow-400/20 text-yellow-200 hover:bg-yellow-400/30 backdrop-blur-sm border border-yellow-400/30' : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'}`}><ChevronLeft  className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" /></button>
            <button onClick={() => scroll('right')} aria-label="Next"     className={`p-3 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 group ${hasCampaignBg ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-yellow-400/30'              : 'bg-gray-900 border border-gray-900 text-white hover:bg-gray-800'}`}><ChevronRight className="w-6 h-6 group-hover:translate-x-0.5  transition-transform" /></button>
          </div>
        )}

        {/* Countdown widget */}
        <motion.div
          key={displayedCampaign?.id ?? 'no-campaign'}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 px-6 py-4 rounded-2xl mt-6 ${hasCampaignBg ? 'bg-black/25 backdrop-blur-md border border-yellow-400/40 shadow-xl shadow-yellow-900/40' : 'bg-white shadow-xl shadow-orange-100/50 border border-orange-100'}`}
        >
          {/* Label */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`p-2 rounded-lg ${hasCampaignBg ? 'bg-yellow-400/20 border border-yellow-400/30' : 'bg-red-50'}`}>
              <Timer className={`w-5 h-5 animate-pulse ${hasCampaignBg ? 'text-yellow-300' : 'text-red-500'}`} />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-sm whitespace-nowrap ${hasCampaignBg ? 'text-yellow-100' : 'text-gray-900'}`}>{displayedCampaign ? displayedCampaign.name : 'Offer Ends In'}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${hasCampaignBg ? 'text-yellow-300 drop-shadow-sm' : 'text-red-500'}`}>{timer.isCritical ? '⚡ Hurry Up!' : timer.isUrgent ? '🔥 Less than 1 hour!' : "Don't Miss Out"}</span>
            </div>
          </div>

          <div className={`hidden sm:block h-10 w-px shrink-0 ${hasCampaignBg ? 'bg-yellow-400/30' : 'bg-gray-200'}`} />

          {/* Clock digits */}
          <div className="flex gap-2 items-center shrink-0">
            {[{ label: 'Hrs', value: timer.h }, { label: 'Min', value: timer.m }].map(({ label, value }) => (
              <div key={label} className={`rounded-lg px-3 py-2 min-w-[48px] text-center ${hasCampaignBg ? 'bg-black/40 text-yellow-300 border border-yellow-500/30' : 'bg-gray-900 text-white'}`}>
                <span className="text-xl font-mono font-bold block leading-none">{value}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">{label}</span>
              </div>
            ))}
            <span className={`font-bold text-lg ${hasCampaignBg ? 'text-yellow-400/70' : 'text-gray-300'}`}>:</span>
            {/* Seconds with urgency colour */}
            <div className={`rounded-lg px-3 py-2 min-w-[48px] text-center shadow-lg transition-colors duration-500 ${
              hasCampaignBg
                ? timer.isCritical ? 'bg-red-500 text-white shadow-red-500/40 animate-pulse border border-red-400/50'
                : timer.isUrgent  ? 'bg-amber-400 text-black shadow-amber-400/30 border border-amber-300/50'
                : 'bg-yellow-400 text-black shadow-yellow-400/30 border border-yellow-300/50'
                : timer.isCritical ? 'bg-red-600 text-white shadow-red-600/30 animate-pulse' : 'bg-red-500 text-white shadow-red-500/30'
            }`}>
              <span className="text-xl font-mono font-bold block leading-none">{timer.s}</span>
              <span className={`text-[9px] font-bold uppercase ${hasCampaignBg && !timer.isCritical ? 'text-black/70' : 'text-white/80'}`}>Sec</span>
            </div>
          </div>

          {/* Progress bar */}
          {displayedCampaign && (
            <>
              <div className="hidden sm:block h-10 w-px shrink-0 bg-yellow-400/30" />
              <div className="flex-1 min-w-[140px] max-w-xs">
                <div className="flex justify-between text-[10px] font-bold mb-1.5">
                  <span className="text-yellow-200/60">Campaign Progress</span>
                  <span className="text-yellow-300 font-bold">{timer.progressPercent}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-yellow-500/20">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(251,191,36,0.55)]" style={{ width: `${timer.progressPercent}%` }} />
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

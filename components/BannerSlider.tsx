// src/components/BannerSlider.tsx
// Gantikan komponen BannerSlider inline di Home.tsx dengan komponen ini.
// Mendukung banner dari DB (campaign.banner_image) dengan fallback ke banner statis.

import React, { useEffect, useState } from 'react';
import type { PromoCampaign } from '../services/promoService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001';

// ── Fallback banners statis (tidak berubah dari sebelumnya) ───────────────────
const STATIC_BANNERS = [
  { src: '/banner/BG_Merah.png', alt: 'Promo Banner Merah' },
  { src: '/banner/Hitam.png',    alt: 'Promo Banner Hitam' },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface Slide {
  src: string;
  alt: string;
  campaign?: PromoCampaign;
}

interface Props {
  campaigns?: PromoCampaign[];
  interval?: number; // ms, default 4000
}

// ── Helper: resolve URL banner ────────────────────────────────────────────────
function resolve_banner(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${BASE_URL}/${src.replace(/^\//, '')}`;
}

// ── Build slides dari campaigns atau fallback statis ─────────────────────────
function build_slides(campaigns: PromoCampaign[]): Slide[] {
  const campaign_slides: Slide[] = campaigns
    .map((c) => {
      const src = resolve_banner(c.banner_image);
      return src ? { src, alt: c.name, campaign: c } : null;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  if (campaign_slides.length > 0) return campaign_slides;

  return STATIC_BANNERS.map((b) => ({ src: b.src, alt: b.alt }));
}

// ── Component ──────────────────────────────────────────────────────────────────
const BannerSlider: React.FC<Props> = ({ campaigns = [], interval = 4000 }) => {
  const [current, setCurrent] = useState(0);
  const slides = build_slides(campaigns);

  // Reset ke slide 0 saat campaigns berubah
  useEffect(() => { setCurrent(0); }, [campaigns.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);

  if (!slides.length) return null;

  return (
    <div className="w-full" style={{ aspectRatio: '1010/298' }}>
      <div className="relative w-full h-full rounded-3xl overflow-hidden">

        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />

            {/* Overlay info campaign jika tersedia */}
            {slide.campaign && (
              <div className="absolute bottom-0 left-0 right-0 p-6
                              bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest
                                     text-yellow-400 mb-1 block">
                      {slide.campaign.type.replace('_', ' ')}
                    </span>
                    <h3 className="text-white text-xl md:text-3xl font-bold font-serif
                                   leading-tight line-clamp-1">
                      {slide.campaign.name}
                    </h3>
                    {slide.campaign.description && (
                      <p className="text-white/70 text-sm mt-1 max-w-lg line-clamp-1">
                        {slide.campaign.description}
                      </p>
                    )}
                  </div>
                  {slide.campaign.discount_value > 0 && (
                    <div className="bg-red-500 text-white text-lg md:text-2xl font-extrabold
                                    px-4 py-2 rounded-xl shadow-lg flex-shrink-0 ml-4">
                      {slide.campaign.discount_type === 'percent'
                        ? `${slide.campaign.discount_value}% OFF`
                        : `Hemat Rp ${Number(slide.campaign.discount_value)
                            .toLocaleString('id-ID')}`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerSlider;

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import ReferralModal from '../components/ReferralModal';

import { agentProductService }          from '../services/agentProductService';
import { promoService }                 from '../services/promoService';
import { Product }                      from '../types';
import type { PromoCampaign }           from '../services/promoService';

import { HeroSection }      from './home/components/HeroSection';
import { FlashSaleSection } from './home/components/FlashSaleSection'; // ← homepage version, bukan components/
import { ProductsSection }  from './home/components/ProductsSection';
import {
  AiPlannerSection, DestinationsSection, ItinerarySection,
  WhyChooseUsSection, TestimonialsSection, AppCtaSection,
} from './home/components/Sections';

// ── Timer state type ──────────────────────────────────────────────────────────

interface TimerState {
  h: string; m: string; s: string;
  isCritical: boolean; isUrgent: boolean; progressPercent: number;
}

const TIMER_ZERO: TimerState = {
  h: '00', m: '00', s: '00',
  isCritical: false, isUrgent: false, progressPercent: 0,
};

// ── Component ─────────────────────────────────────────────────────────────────

const Home: React.FC = () => {
  const { t } = useTranslation();

  // ── Products ────────────────────────────────────────────────────────────────
  const [products,  setProducts]  = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Campaigns ───────────────────────────────────────────────────────────────
  const [activeCampaigns,  setActiveCampaigns]  = useState<PromoCampaign[]>([]);
  const [activeCampaign,   setActiveCampaign]   = useState<PromoCampaign | null>(null);
  const [displayedCampaign,setDisplayedCampaign]= useState<PromoCampaign | null>(null);
  const [timer,            setTimer]            = useState<TimerState>(TIMER_ZERO);

  // ── Misc ────────────────────────────────────────────────────────────────────
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // Flash products — derived dari products yang sudah di-fetch
  const flashSaleProducts = products.filter(
    (p) => (p as any).is_flash_sale && (p as any).flash_sale_price
  );

  // ── Fetch products ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const prods = await agentProductService.getAllProducts();
        const BASE  = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const normalized: Product[] = prods.map((p: Product) => ({
          ...p,
          image_url: p.image_url && !p.image_url.startsWith('http')
            ? `${BASE}/${p.image_url}`
            : p.image_url,
        }));
        setProducts(normalized);
      } catch (err) {
        console.error('[Home] products error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Fetch active campaigns ───────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const campaigns = await promoService.getActiveCampaigns();
        setActiveCampaigns(campaigns);
        if (campaigns.length > 0) {
          setActiveCampaign(campaigns[0]);
          setDisplayedCampaign(campaigns[0]);
        }
      } catch (err) {
        console.error('[Home] campaigns error:', err);
      }
    };
    load();
  }, []);

  // ── Timer untuk campaign aktif ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeCampaign) {
      setTimer(TIMER_ZERO);
      return;
    }

    const tick = () => {
      const now   = Date.now();
      const end   = new Date(activeCampaign.ends_at).getTime();
      const start = new Date(activeCampaign.starts_at).getTime();
      const diff  = end - now;

      if (diff <= 0) {
        setTimer({ ...TIMER_ZERO, progressPercent: 100 });
        return;
      }

      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);

      const total   = end - start;
      const elapsed = now - start;
      const progressPercent = total > 0
        ? Math.min(100, Math.round((elapsed / total) * 100))
        : 0;

      setTimer({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
        isCritical: diff < 600_000,    // < 10 menit
        isUrgent:   diff < 3_600_000,  // < 1 jam
        progressPercent,
      });
    };

    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [activeCampaign]);

  // ── Slide change dari BannerSlider ───────────────────────────────────────────
  const handleSlideChange = (index: number) => {
    const c = activeCampaigns[index];
    if (c) setDisplayedCampaign(c);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      <SEO
        title={t('home.seo_title', 'Trivgoo - Find Your Adventure')}
        description={t('home.seo_description', 'Discover perfect destinations, best car rentals, and amazing hotels.')}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Trivgoo",
            "url": "https://trivgoo.com",
            "logo": "https://trivgoo.com/favicon_trp.png",
            "sameAs": [
              "https://facebook.com/trivgoo",
              "https://instagram.com/trivgoo",
              "https://twitter.com/trivgoo",
              "https://linkedin.com/company/trivgoo"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+62-821-4444-3784",
              "contactType": "customer service",
              "availableLanguage": ["Indonesian", "English"]
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Trivgoo",
            "url": "https://trivgoo.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://trivgoo.com/explore?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ]}
      />

      <HeroSection />

      {/*
        FlashSaleSection (homepage version dari pages/home/components/):
        - Tampilkan campaign banner jika ada activeCampaigns
        - Tampilkan flash sale products jika ada
        - Otomatis hilang jika keduanya kosong (sudah ada guard di dalam komponen)
      */}
      <FlashSaleSection
        flashSaleProducts={flashSaleProducts as Product[]}
        activeCampaigns={activeCampaigns}
        activeCampaign={activeCampaign}
        timer={timer}
        displayedCampaign={displayedCampaign}
        onSlideChange={handleSlideChange}
      />

      <ProductsSection products={products} isLoading={isLoading} />
      <AiPlannerSection />
      <DestinationsSection />
      <ItinerarySection onReferralOpen={() => setIsReferralModalOpen(true)} />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <AppCtaSection />

      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        referralCode="TRIVGOO2025"
      />
    </div>
  );
};

export default Home;
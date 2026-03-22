'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import ReferralModal from '../components/ReferralModal';

import { agentProductService }               from '../services/agentProductService';
import { useActiveCampaigns }                from '../src/hooks/useActiveCampaigns';
import { useCampaignTimer }                  from '../src/hooks/useCampaignTimer';
import type { PromoCampaign }                from '../services/promoService';
import { Product }                           from '../types';

// Section components
import { HeroSection }         from './home/components/HeroSection';
import { FlashSaleSection }    from './home/components/FlashSaleSection';
import { ProductsSection }     from './home/components/ProductsSection';
import {
  AiPlannerSection,
  DestinationsSection,
  ItinerarySection,
  WhyChooseUsSection,
  TestimonialsSection,
  AppCtaSection,
} from './home/components/Sections';

// ─────────────────────────────────────────────────────────────────────────────

const Home: React.FC = () => {
  // ── Products ──────────────────────────────────────────────────────────────
  const [products,          setProducts]          = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [isLoading,         setIsLoading]         = useState(true);

  // ── Campaigns ─────────────────────────────────────────────────────────────
  const { campaigns: activeCampaigns, primaryCampaign: activeCampaign } = useActiveCampaigns();
  const [visibleSlideIndex, setVisibleSlideIndex] = useState(0);

  const displayedCampaign: PromoCampaign | null = (() => {
    if (flashSaleProducts.length > 0) {
      const current = flashSaleProducts[visibleSlideIndex];
      if (current?.flashSale?.campaignId) {
        return activeCampaigns.find((c) => c.id === current.flashSale!.campaignId) ?? activeCampaign;
      }
      return activeCampaign;
    }
    return activeCampaigns[visibleSlideIndex] ?? activeCampaign;
  })();

  const timer = useCampaignTimer(displayedCampaign);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // ── Flash sale scroll tracker ─────────────────────────────────────────────
  const flashSaleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = flashSaleRef.current;
    if (!el || flashSaleProducts.length === 0) return;
    const handleScroll = () => {
      const cardWidth = el.scrollWidth / flashSaleProducts.length;
      const index = Math.round(el.scrollLeft / cardWidth);
      setVisibleSlideIndex(Math.min(index, flashSaleProducts.length - 1));
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [flashSaleProducts.length]);

  const handleBannerSlideChange = useCallback((index: number) => setVisibleSlideIndex(index), []);

  // ── Load products ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const prods    = await agentProductService.getAllProducts();
        const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const normalized = prods.map((p: Product) => ({
          ...p,
          image_url: p.image_url && !p.image_url.startsWith('http') ? `${BASE_URL}/${p.image_url}` : p.image_url,
        }));
        setProducts(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <SEO
        title="Trivgoo - Find Your Adventure"
        description="Discover perfect destinations, best car rentals, and amazing hotels with Trivgoo."
      />

      <HeroSection />

      <FlashSaleSection
        flashSaleProducts={flashSaleProducts}
        activeCampaigns={activeCampaigns}
        activeCampaign={activeCampaign}
        timer={timer}
        displayedCampaign={displayedCampaign}
        onSlideChange={handleBannerSlideChange}
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

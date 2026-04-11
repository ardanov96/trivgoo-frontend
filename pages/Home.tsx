'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import ReferralModal from '../components/ReferralModal';

import { agentProductService } from '../services/agentProductService';
import { Product }             from '../types';

import { HeroSection }         from './home/components/HeroSection';
import { FlashSaleSection }    from '../components/FlashSaleSection';
import { ProductsSection }     from './home/components/ProductsSection';
import {
  AiPlannerSection, DestinationsSection, ItinerarySection,
  WhyChooseUsSection, TestimonialsSection, AppCtaSection,
} from './home/components/Sections';

const Home: React.FC = () => {
  const { t } = useTranslation();

  const [products,  setProducts]  = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

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
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

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

      {/* ✅ Self-contained — fetch & filter sendiri, otomatis hilang jika tidak ada flash sale */}
      <FlashSaleSection limit={6} />

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

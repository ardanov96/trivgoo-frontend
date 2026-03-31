import { ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { Product } from '../types';
import { agentProductService } from '../services/agentProductService';
import { useWishlist } from '../components/WishlistContext';
import { useCart }     from '../components/CartContext';
import { useToast }    from '../components/ToastContext';
import { useAuth }     from '../AuthContext';

import { useExploreFilters }    from './explore/hooks/useExploreFilters';
import { getDestinationBanner } from './explore/utils';
import type { CarGroup }        from './explore/utils';
import { containerVariants, cardVariants, carCardVariants, fadeUpVariants } from './explore/constants';

import { FilterPanel }          from './explore/components/FilterPanel';
import { RegularCard }          from './explore/components/RegularCard';
import { RentalCarCard }        from './explore/components/RentalCarCard';
import { AgentPickerModal }     from './explore/components/AgentPickerModal';
import { LocationPromptModal }  from './explore/components/LocationPromptModal';
import { DestinationHero, EmptyState } from './explore/components/DestinationHero';
import { SkeletonCard, SkeletonCarCard } from './explore/components/SharedUI';
import { encodeId }     from '../utils/hashids';
import { generateSlug } from '../utils/slugify';

const Explore: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { langNavigate } = useLangNavigate();

  const [products,  setProducts]  = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const prods    = await agentProductService.getAllProducts();
        const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        setProducts(prods.map((p: Product) => ({
          ...p,
          image_url: p.image_url && !p.image_url.startsWith('http')
            ? `${BASE_URL}/${p.image_url}`
            : p.image_url,
        })));
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filters = useExploreFilters(products);

  const { user }                         = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart }          = useCart();
  const { showToast }                    = useToast();
  const isLoggedIn = !!user;

  const handleWishlist  = (e: React.MouseEvent, p: Product) => {
    e.preventDefault(); e.stopPropagation(); toggleWishlist(p);
  };
  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault(); e.stopPropagation();
    if (isInCart(p.id)) return;
    addToCart(p, 1);
    showToast(`${p.name} ${t('explore.added_to_cart', 'added to cart!')}`, 'success');
  };

  // ── Modal state ────────────────────────────────────────────────────────────
  const [agentPickerGroup, setAgentPickerGroup] = useState<CarGroup | null>(null);
  const [locationPrompt,   setLocationPrompt]   = useState(false);
  const [pendingGroup,     setPendingGroup]      = useState<CarGroup | null>(null);

  // ── Helper: buka picker / navigasi langsung ke product ────────────────────
  const openGroupOrProduct = (group: CarGroup) => {
    if (group.agents.length > 1) {
      setAgentPickerGroup(group);
    } else {
      langNavigate(
        `/product/${encodeId(group.representativeProduct.id)}/${generateSlug(group.representativeProduct.name)}`
      );
    }
  };

  // ── Handler klik card rental ───────────────────────────────────────────────
  const handleCarCardClick = (group: CarGroup) => {
    if (!filters.searchQuery.trim()) {
      // Belum ada lokasi — simpan group, tampilkan prompt
      setPendingGroup(group);
      setLocationPrompt(true);
      return;
    }
    openGroupOrProduct(group);
  };

  // ── Handler konfirmasi lokasi dari prompt ─────────────────────────────────
  const handleLocationConfirm = (loc: string) => {
    filters.updateSearch(loc);
    setLocationPrompt(false);
    if (pendingGroup) {
      openGroupOrProduct(pendingGroup);
      setPendingGroup(null);
    }
  };

  const handleLocationPromptClose = () => {
    setLocationPrompt(false);
    setPendingGroup(null);
  };

  // ── Destination hero ───────────────────────────────────────────────────────
  const destinationBanner = filters.fromItinerary ? getDestinationBanner(filters.searchQuery) : null;
  const showHero          = filters.fromItinerary && !!destinationBanner;

  const makeCardProps = (p: Product) => ({
    product:     p,
    isLoggedIn,
    isSaved:     isInWishlist(p.id),
    isInCart:    isInCart(p.id),
    onWishlist:  (e: React.MouseEvent) => handleWishlist(e, p),
    onAddToCart: (e: React.MouseEvent) => handleAddToCart(e, p),
  });

  return (
    <div>
      <SEO
        title={t('explore.seo_title', 'Explore - Trivgoo')}
        description={t('explore.seo_desc', 'Discover the perfect travel packages, rentals, and experiences for your next trip.')}
      />

      {showHero
        ? <DestinationHero
            image={destinationBanner!.image}
            query={filters.searchQuery}
            subtitle={destinationBanner!.subtitle}
          />
        : <div className="pt-24" />
      }

      <div className={`bg-gray-50 min-h-screen pb-12 ${showHero ? 'pt-6' : ''}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {!showHero && (
            <motion.div initial="hidden" animate="visible" variants={fadeUpVariants} className="mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                {t('explore.title', 'Explore the World')}
              </h1>
              <p className="text-gray-500">
                {t('explore.subtitle', 'Discover unique experiences and hidden gems.')}
              </p>
            </motion.div>
          )}

          <FilterPanel
            searchQuery={filters.searchQuery}
            selectedCategory={filters.selectedCategory}
            selectedSubCategory={filters.selectedSubCategory}
            sortBy={filters.sortBy}
            rentalFilters={filters.rentalFilters}
            isCarCategory={filters.isCarCategory}
            onSearch={filters.updateSearch}
            onCategorySelect={filters.handleCategorySelect}
            onSubCategorySelect={filters.setSelectedSubCategory}
            onSortChange={filters.setSortBy}
            onRentalFilterChange={filters.handleRentalFilterChange}
          />

          {/* ── Car rental grid ── */}
          {filters.isCarCategory ? (
            <motion.div
              key={`car-${filters.selectedCategory}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-6"
            >
              {isLoading
                ? [...Array(3)].map((_, i) => <SkeletonCarCard key={i} />)
                : filters.carGroups.map((group) => (
                    <motion.div
                      key={group.groupKey}
                      variants={carCardVariants}
                      onClick={() => handleCarCardClick(group)}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="cursor-pointer"
                    >
                      <RentalCarCard
                        {...makeCardProps(group.representativeProduct)}
                        agentCount={group.agents.length}
                      />
                    </motion.div>
                  ))
              }
            </motion.div>
          ) : (
            /* ── Regular product grid ── */
            <motion.div
              key={`grid-${filters.selectedCategory}-${filters.selectedSubCategory}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {isLoading
                ? [...Array(8)].map((_, i) => (
                    <motion.div key={i} variants={cardVariants}><SkeletonCard /></motion.div>
                  ))
                : filters.filteredProducts.slice(0, filters.visibleCount).map((p) => (
                    <motion.div
                      key={p.id}
                      variants={cardVariants}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    >
                      <RegularCard {...makeCardProps(p)} />
                    </motion.div>
                  ))
              }
            </motion.div>
          )}

          {/* ── Load more ── */}
          {!isLoading && !filters.isCarCategory && filters.filteredProducts.length > filters.visibleCount && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mt-10"
            >
              <motion.button
                onClick={() => filters.setVisibleCount((p) => p + 8)}
                whileHover={{ y: -3, scale: 1.03, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-colors duration-300 group"
              >
                {t('common.show_more', 'Load More')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}

          {/* ── Empty state ── */}
          {!isLoading && (
            filters.isCarCategory
              ? filters.carGroups.length === 0
              : filters.filteredProducts.length === 0
          ) && (
            <EmptyState isCarCategory={filters.isCarCategory} onClear={filters.clearAll} />
          )}

        </div>
      </div>

      {/* ── Agent picker modal ── */}
      {agentPickerGroup && (
        <AgentPickerModal
          group={agentPickerGroup}
          onClose={() => setAgentPickerGroup(null)}
        />
      )}

      {/* ── Location prompt modal ── */}
      {locationPrompt && (
        <LocationPromptModal
          onConfirm={handleLocationConfirm}
          onClose={handleLocationPromptClose}
        />
      )}
    </div>
  );
};

export default Explore;
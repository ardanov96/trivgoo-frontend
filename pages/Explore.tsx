import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { motion, AnimatePresence } from 'framer-motion';
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
import { StayCard }             from './explore/components/StayCard';
import { StayFilterPanel }      from './explore/components/StayFilterPanel';
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
  // Mobile side-filter drawer
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const { categorySlug } = useParams<{ categorySlug?: string }>();

  const SEO_META: Record<string, { title: string; description: string }> = {
    'tours':            { title: 'Paket Wisata & Tour Indonesia - Trivgoo', description: 'Temukan paket wisata terbaik di Indonesia.' },
    'stays':            { title: 'Hotel & Villa Indonesia - Trivgoo',       description: 'Penginapan terbaik dengan harga terjangkau.' },
    'car-rental':       { title: 'Sewa Mobil Bali & Indonesia - Trivgoo',   description: 'Rental mobil murah dengan atau tanpa driver.' },
    'airport-transfer': { title: 'Airport Transfer Indonesia - Trivgoo',    description: 'Layanan antar jemput bandara terpercaya.' },
    'events':           { title: 'Event & Aktivitas - Trivgoo',             description: 'Temukan event dan aktivitas seru di sekitar Anda.' },
  };
  const meta = categorySlug ? SEO_META[categorySlug] : null;

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

  const openGroupOrProduct = (group: CarGroup) => {
    if (group.agents.length > 1) {
      setAgentPickerGroup(group);
    } else {
      langNavigate(
        `/product/${encodeId(group.representativeProduct.id)}/${generateSlug(group.representativeProduct.name)}`
      );
    }
  };

  const handleCarCardClick = (group: CarGroup) => {
    if (filters.isTransferCategory) {
      openGroupOrProduct(group);
      return;
    }
    if (!filters.searchQuery.trim()) {
      setPendingGroup(group);
      setLocationPrompt(true);
      return;
    }
    openGroupOrProduct(group);
  };

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

  // ── Stay category skeleton placeholder ────────────────────────────────────
  const StaySkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col sm:flex-row animate-pulse">
      <div className="sm:w-72 lg:w-80 shrink-0 aspect-[4/3] sm:aspect-auto bg-gray-200" />
      <div className="flex-1 p-6 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-gray-200 rounded-lg w-20" />
          <div className="h-8 bg-gray-200 rounded-lg w-20" />
        </div>
        <div className="flex justify-between items-end pt-4 mt-4 border-t border-gray-100">
          <div className="space-y-1">
            <div className="h-7 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="space-y-2">
            <div className="h-9 bg-gray-200 rounded-xl w-28" />
            <div className="h-9 bg-gray-200 rounded-xl w-28" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <SEO
        title={meta?.title ?? t('explore.seo_title', 'Explore - Trivgoo')}
        description={meta?.description ?? t('explore.seo_desc', 'Discover the perfect travel packages, rentals, and experiences for your next trip.')}
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
                {filters.isTransferCategory
                  ? t('explore.airport_transfer_title', 'Airport Transfer')
                  : t('explore.title', 'Explore the World')
                }
              </h1>
              <p className="text-gray-500">
                {filters.isTransferCategory
                  ? t('explore.airport_transfer_subtitle', 'Layanan antar jemput bandara terpercaya ke seluruh tujuan.')
                  : t('explore.subtitle', 'Discover unique experiences and hidden gems.')
                }
              </p>
            </motion.div>
          )}

          {/* ── Filter panel ── */}
          <FilterPanel
            searchQuery={filters.searchQuery}
            selectedCategory={filters.selectedCategory}
            selectedSubCategory={filters.selectedSubCategory}
            sortBy={filters.sortBy}
            rentalFilters={filters.rentalFilters}
            transferFilters={filters.transferFilters}
            isCarCategory={filters.isCarCategory}
            isTransferCategory={filters.isTransferCategory}
            onSearch={filters.updateSearch}
            onCategorySelect={filters.handleCategorySelect}
            onSubCategorySelect={filters.setSelectedSubCategory}
            onSortChange={filters.setSortBy}
            onRentalFilterChange={filters.handleRentalFilterChange}
            onTransferFilterChange={filters.updateTransferFilters}
          />

          {/* ── Stay layout: sidebar + 1-col cards ── */}
          {filters.isStayCategory ? (
            <div className="flex gap-6 items-start">

              {/* ── Desktop side filter ── */}
              <motion.aside
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="hidden lg:block w-64 xl:w-72 shrink-0"
              >
                <StayFilterPanel
                  filters={filters.stayFilters}
                  onChange={filters.updateStayFilters}
                  onClear={filters.clearStayFilters}
                />
              </motion.aside>

              {/* ── Main content ── */}
              <div className="flex-1 min-w-0">
                {/* Mobile filter button */}
                <div className="lg:hidden mb-4">
                  <button
                    onClick={() => setShowMobileFilter(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:border-primary-400 hover:text-primary-600 transition-all"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {t('explore.filters', 'Filter')}
                    {(filters.stayFilters.starRatings.length + filters.stayFilters.hotelTypes.length + filters.stayFilters.areas.length) > 0 && (
                      <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {filters.stayFilters.starRatings.length + filters.stayFilters.hotelTypes.length + filters.stayFilters.areas.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Results count */}
                {!isLoading && (
                  <p className="text-sm text-gray-500 mb-4 font-medium">
                    {filters.filteredProducts.length} {t('explore.stays_found', 'penginapan ditemukan')}
                  </p>
                )}

                {/* Cards */}
                <motion.div
                  key={`stay-${filters.selectedCategory}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-5"
                >
                  {isLoading
                    ? [...Array(4)].map((_, i) => <StaySkeletonCard key={i} />)
                    : filters.filteredProducts.slice(0, filters.visibleCount).map((p) => (
                        <motion.div key={p.id} variants={cardVariants}>
                          <StayCard {...makeCardProps(p)} />
                        </motion.div>
                      ))
                  }
                </motion.div>

                {/* Load more */}
                {!isLoading && filters.filteredProducts.length > filters.visibleCount && (
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

                {/* Empty state */}
                {!isLoading && filters.filteredProducts.length === 0 && (
                  <EmptyState isCarCategory={false} onClear={filters.clearAll} />
                )}
              </div>

              {/* ── Mobile filter drawer ── */}
              <AnimatePresence>
                {showMobileFilter && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                      onClick={() => setShowMobileFilter(false)}
                    />
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className="fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-gray-50 z-50 overflow-y-auto lg:hidden"
                    >
                      <div className="p-4">
                        <StayFilterPanel
                          filters={filters.stayFilters}
                          onChange={filters.updateStayFilters}
                          onClear={filters.clearStayFilters}
                          isMobile
                          onClose={() => setShowMobileFilter(false)}
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          /* ── Car / Transfer grid ── */
          ) : filters.isCarCategory ? (
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

          {/* ── Load more (non-stay) ── */}
          {!isLoading && !filters.isCarCategory && !filters.isStayCategory && filters.filteredProducts.length > filters.visibleCount && (
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

          {/* ── Empty state (non-stay, non-car) ── */}
          {!isLoading && !filters.isStayCategory && (
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

      {/* ── Location prompt ── */}
      {locationPrompt && !filters.isTransferCategory && (
        <LocationPromptModal
          onConfirm={handleLocationConfirm}
          onClose={handleLocationPromptClose}
        />
      )}
    </div>
  );
};

export default Explore;

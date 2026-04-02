'use client';

import { ArrowRight, Building2, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../../../types';
import { useAuth }     from '../../../AuthContext';
import { useCart }     from '../../../components/CartContext';
import { useWishlist } from '../../../components/WishlistContext';
import { useToast }    from '../../../components/ToastContext';
import { ProductCard, SkeletonCard } from './ProductCard';
import { containerVariants } from '../constants/variants';
import { TRAVEL_FILTERS } from '../constants';
import { getSubCategoryValue } from '../utils';

interface Props {
  products:  Product[];
  isLoading: boolean;
}

export const ProductsSection = ({ products, isLoading }: Props) => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCars,   setVisibleCars]   = useState(4);
  const [visibleHotels, setVisibleHotels] = useState(4);

  const { user }                         = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart }          = useCart();
  const { showToast }                    = useToast();

  const handleWishlist  = (e: React.MouseEvent, p: Product) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p); };
  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault(); e.stopPropagation();
    if (isInCart(p.id)) return;
    addToCart(p, 1);
    showToast(t('home.products_added_to_cart', '{{name}} added to cart!', { name: p.name }), 'success');
  };

  // Translated filter labels — index matches TRAVEL_FILTERS order
  const filterKeys = [
    'home.filter_all', 'home.filter_family', 'home.filter_honeymoon', 'home.filter_solo',
    'home.filter_healing', 'home.filter_workation', 'home.filter_adventure',
    'home.filter_cultural', 'home.filter_culinary', 'home.filter_eco',
  ];

  const filteredTours = products
    .filter((p) => {
      if (Number(p.category_id) !== 1) return false;
      if (activeFilter === 'All') return true;
      return getSubCategoryValue(p.details) === activeFilter.toLowerCase();
    })
    .slice(0, 4);

  const hotelProducts        = products.filter((p) => p.category_id === 2);
  const carProducts          = products.filter((p) => p.category_id === 3);
  const visibleHotelProducts = hotelProducts.slice(0, visibleHotels);
  const visibleCarProducts   = carProducts.slice(0, visibleCars);

  const makeCardProps = (p: Product, i: number, unit: string) => ({
    product: p, index: i, priceUnit: unit,
    isLoggedIn: !!user,
    isSaved:    isInWishlist(p.id),
    isInCart:   isInCart(p.id),
    onWishlist: (e: React.MouseEvent) => handleWishlist(e, p),
    onAddToCart:(e: React.MouseEvent) => handleAddToCart(e, p),
  });

  const totalTours = products.filter((p) => Number(p.category_id) === 1 && (activeFilter === 'All' || getSubCategoryValue(p.details) === activeFilter.toLowerCase())).length;

  return (
    <div className="bg-white py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
            {t('home.products_title', 'Our Travel Experience')}
          </h2>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 mb-8">
          {TRAVEL_FILTERS.map((f, i) => {
            const label = t(filterKeys[i] ?? `home.filter_${f.toLowerCase()}`, f);
            return (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${activeFilter === f ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600'}`}>
                {label}
              </button>
            );
          })}
        </motion.div>

        {/* Tours grid */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {isLoading
            ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            : filteredTours.length > 0
              ? filteredTours.map((p, i) => <ProductCard key={p.id} {...makeCardProps(p, i, '/pax')} />)
              : <div className="col-span-full text-center py-16 text-gray-400" />
          }
        </motion.div>

        {totalTours > 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex justify-center mt-10">
            <Link to={langPath('/explore')} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group">
              {t('home.products_explore_tours', 'Explore More Tours')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}

        {/* Hotels */}
        {hotelProducts.length > 0 && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-16 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-emerald-600" /></div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                {t('home.products_hotel_title', 'Hotel & Villa')}
              </h3>
            </motion.div>
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {isLoading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : visibleHotelProducts.map((p, i) => <ProductCard key={p.id} {...makeCardProps(p, i, '/night')} />)}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center mt-10">
              {hotelProducts.length > visibleHotels
                ? <button onClick={() => setVisibleHotels((p) => p + 4)} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all hover:-translate-y-0.5 active:scale-95 group">
                    {t('home.products_load_more', 'Load More')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                : <Link to={langPath('/explore?category_id=2')} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all hover:-translate-y-0.5 active:scale-95 group">
                    {t('home.products_explore_hotels', 'Explore More Hotels & Villa')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
              }
            </motion.div>
          </>
        )}

        {/* Cars */}
        {carProducts.length > 0 && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-16 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Car className="w-5 h-5 text-blue-600" /></div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                {t('home.products_car_title', 'Car Rental')}
              </h3>
            </motion.div>
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {isLoading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : visibleCarProducts.map((p, i) => <ProductCard key={p.id} {...makeCardProps(p, i, '/day')} />)}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center mt-10">
              <Link to={langPath('/explore?category_id=3')} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all hover:-translate-y-0.5 active:scale-95 group">
                {t('home.products_explore_cars', 'Explore More Cars')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

'use client';

import { Heart, MapPin, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// ✅ useTranslation dihapus karena belum dipakai
import { Product } from '../../../types';
import { generateSlug } from '../../../utils/slugify';
import { encodeId } from '../../../utils/hashids';
import { getImageUrl, FALLBACK_IMAGE } from '../../../utils/imageUtils';
import { formatLocation } from '../utils';

interface Props {
  product:      Product;
  index:        number;
  priceUnit:    string;
  isLoggedIn:   boolean;
  isSaved:      boolean;
  isInCart:     boolean;
  onWishlist:   (e: React.MouseEvent) => void;
  onAddToCart:  (e: React.MouseEvent) => void;
}

export const ProductCard = ({ product, index, priceUnit, isLoggedIn, isSaved, isInCart, onWishlist, onAddToCart }: Props) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
    <Link to={`/product/${encodeId(product.id)}/${generateSlug(product.name)}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative h-full">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img src={getImageUrl(product.image_url || product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
        {isLoggedIn && (
          <button onClick={onWishlist} className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90">
            <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
          </button>
        )}
        {priceUnit !== '/day' && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
            <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />{product.rating}
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h3>
        {product.location && (
          <p className="text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" /> {formatLocation(product.location)}
          </p>
        )}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-1">From</p>
          <p className="text-lg font-bold text-gray-900">
            {product.currency} {Number(product.price).toLocaleString('id-ID')}
            <span className="text-sm font-medium text-gray-500"> {priceUnit}</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <Link to={`/product/${encodeId(product.id)}/${generateSlug(product.name)}`} onClick={(e) => e.stopPropagation()} className="border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center flex items-center justify-center">
              See Details
            </Link>
            <button onClick={onAddToCart} disabled={isInCart} className={`py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border transform active:scale-[0.98] ${isInCart ? 'border-green-500 text-green-600 bg-green-50 cursor-default' : 'border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md'}`}>
              <ShoppingCart className={`w-3.5 h-3.5 shrink-0 ${isInCart ? 'stroke-green-600' : ''}`} />
              <span className="truncate">{isInCart ? 'Added' : priceUnit === '/night' ? 'Book Now' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" />
      <div className="flex gap-2 mt-3">
        <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
        <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);
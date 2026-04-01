import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../components/WishlistContext';
import { Link } from 'react-router-dom';
import { Heart, MapPin, ArrowRight, Star, Trash2 } from 'lucide-react';
import { encodeId } from '../utils/hashids';
import { generateSlug } from '../utils/slugify';
import { useLangNavigate } from '../src/hooks/useLangNavigate';

const Wishlist: React.FC = () => {
  const { t } = useTranslation();
  const { langPath } = useLangNavigate();
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            {t('wishlist.title')}
          </h1>
          <p className="text-gray-500">
            {t('wishlist.subtitle')}
          </p>
        </div>

        {/* Empty state */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Heart className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('wishlist.empty')}
            </h3>
            <p className="text-gray-500 mb-8">
              {t('wishlist.empty_desc')}
            </p>
            <Link
              to={langPath('/explore')}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg"
            >
              {t('wishlist.explore_now')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlist.map((product) => (
              <div key={product.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Link to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </Link>

                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:bg-red-50 transition-colors group/btn"
                    title={t('wishlist.remove')}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500" />
                  </button>

                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
                    <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />
                    {product.rating}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center text-primary-600 text-xs font-bold uppercase tracking-wide mb-2">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                    {product.location}
                  </div>
                  <Link to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}>
                    <h3 className="font-serif font-bold text-xl text-gray-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        {t('explore.from')}
                      </span>
                      <p className="text-xl font-bold text-gray-900">{product.currency} {product.price}</p>
                    </div>
                    <Link
                      to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

import { Award, Briefcase, Car, Droplet, Gauge, Heart, MapPin, ShoppingCart, Sparkles, Star, Users, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { useTranslation } from 'react-i18next';
import { Product } from '../../../types';
import { CarDetails } from '../../../types';
import { generateSlug } from '../../../utils/slugify';
import { encodeId } from '../../../utils/hashids';
import { getImageUrl, FALLBACK_IMAGE } from '../../../utils/imageUtils';
import { getActiveVouchers, calcBestDiscount, formatLocation, formatRp } from '../utils';
import { VoucherPillList } from './SharedUI';

const PREVIEW_DAYS = 2;

interface Props {
  product:    Product;
  agentCount?: number;
  isLoggedIn: boolean;
  isSaved:    boolean;
  isInCart:   boolean;
  onWishlist: (e: React.MouseEvent) => void;
  onAddToCart:(e: React.MouseEvent) => void;
}

export const RentalCarCard = ({ product, agentCount = 1, isLoggedIn, isSaved, isInCart, onWishlist, onAddToCart }: Props) => {
  const details        = product.details as CarDetails;
  const activeVouchers = getActiveVouchers(product);
  const baseTotal      = Number(product.price) * PREVIEW_DAYS;
  const bestDiscount   = calcBestDiscount(activeVouchers, baseTotal);
  const finalTotal     = baseTotal - bestDiscount;
  const { langPath } = useLangNavigate();

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col md:flex-row relative w-full">
      {/* Image column */}
      <div className="md:w-1/3 relative overflow-hidden">
        <div className="aspect-[4/3] md:aspect-auto md:h-full">
          <img src={getImageUrl(product.image_url || product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
        </div>

        {isLoggedIn && (
          <button onClick={(e) => { e.stopPropagation(); onWishlist(e); }} className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90">
            <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
          </button>
        )}

        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
          <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />{product.rating || '-'}
        </div>

        {activeVouchers.length > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md z-10">
            <Sparkles className="w-3 h-3" />{activeVouchers.length} Promo
          </div>
        )}

        {agentCount > 1 && (
          <div className="absolute bottom-3 left-3 bg-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md z-10 flex items-center gap-1">
            <Users className="w-3 h-3" />{agentCount} Agent
          </div>
        )}
      </div>

      {/* Info column */}
      <div className="md:w-2/3 p-6 flex flex-col">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-serif font-bold text-2xl text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{product.name}</h3>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-1 shrink-0" />{formatLocation(product.location || '')}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-0.5">{agentCount > 1 ? 'Mulai dari' : 'Price'}</p>
            <p className="text-2xl font-bold text-gray-900">
              {product.currency} {Number(product.price).toLocaleString('id-ID')}
              <span className="text-sm font-medium text-gray-500 ml-1">/hari</span>
            </p>
            {bestDiscount > 0 && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">
                Est. {PREVIEW_DAYS}h: <span className="line-through text-gray-400">{formatRp(baseTotal)}</span>{' '}
                <span className="text-green-700 font-extrabold">{formatRp(finalTotal)}</span>
              </p>
            )}
            <div className="flex justify-end mt-1">
              <VoucherPillList vouchers={activeVouchers} max={2} />
            </div>
          </div>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { icon: Gauge,   label: 'Transmission', value: details?.transmission === 'Automatic' ? 'Matic' : 'Manual' },
            { icon: Users,   label: 'Seats',        value: `${details?.seats} Passengers` },
            { icon: Award,   label: 'Year',         value: details?.year || '-' },
            { icon: Droplet, label: 'Fuel Policy',  value: details?.fuelPolicy || 'Standard' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <Icon className="w-5 h-5 text-primary-600 mx-auto mb-2" />
              <div className="text-xs text-gray-500">{label}</div>
              <div className="font-semibold text-sm">{value}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {details?.luggage && (
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full">
              <Briefcase className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-medium">{details.luggage} Luggage</span>
            </div>
          )}
          {details?.driver && (
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full">
              <UserCog className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-medium">With Driver</span>
            </div>
          )}
          {details?.transportCategory && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${details.transportCategory === 'Airport Transfer' ? 'bg-green-50' : 'bg-primary-50'}`}>
              <Car className={`w-4 h-4 ${details.transportCategory === 'Airport Transfer' ? 'text-green-600' : 'text-primary-600'}`} />
              <span className={`text-xs font-medium ${details.transportCategory === 'Airport Transfer' ? 'text-green-700' : 'text-primary-700'}`}>{details.transportCategory}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
          {agentCount > 1 ? (
            <button onClick={(e) => e.stopPropagation()} className="flex-1 border-2 border-primary-600 text-primary-600 py-3 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-all text-center flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />Pilih Agent ({agentCount})
            </button>
          ) : (
            <Link to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)} onClick={(e) => e.stopPropagation()} className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center">
              See Details
            </Link>
          )}
          <button onClick={(e) => { e.stopPropagation(); onAddToCart(e); }} disabled={isInCart} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border-2 transform active:scale-[0.98] ${isInCart ? 'border-green-500 text-green-600 bg-green-50 cursor-default' : 'border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md'}`}>
            <ShoppingCart className={`w-4 h-4 ${isInCart ? 'stroke-green-600' : ''}`} />
            {isInCart ? 'Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

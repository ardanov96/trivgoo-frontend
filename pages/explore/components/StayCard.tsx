import { Heart, MapPin, ShoppingCart, Star, Tag, Wifi, Dumbbell, Waves, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { Product } from '../../../types';
import { generateSlug } from '../../../utils/slugify';
import { encodeId } from '../../../utils/hashids';
import { getImageUrl, FALLBACK_IMAGE } from '../../../utils/imageUtils';
import { getActiveVouchers, calcBestDiscount, formatLocation, formatRp } from '../utils';
import { VoucherPillList } from './SharedUI';

interface Props {
  product:    Product;
  isLoggedIn: boolean;
  isSaved:    boolean;
  isInCart:   boolean;
  onWishlist: (e: React.MouseEvent) => void;
  onAddToCart:(e: React.MouseEvent) => void;
}

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  'wifi':          <Wifi className="w-3.5 h-3.5" />,
  'wi-fi':         <Wifi className="w-3.5 h-3.5" />,
  'swimming pool': <Waves className="w-3.5 h-3.5" />,
  'gym':           <Dumbbell className="w-3.5 h-3.5" />,
};

// ── Gallery Modal ─────────────────────────────────────────────────────────────

interface GalleryModalProps {
  images:       string[];
  initialIndex: number;
  productName:  string;
  onClose:      () => void;
}

const GalleryModal = ({ images, initialIndex, productName, onClose }: GalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const prev = useCallback(() => {
    setCurrentIndex(i => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrentIndex(i => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next, onClose]);

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    // Backdrop — clicking the dark area closes the modal
    <div
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* ── Close ── */}
      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        className="absolute top-5 right-5 text-white/70 hover:text-white p-2 bg-black/50 hover:bg-black/80 rounded-full transition-all z-20"
      >
        <X className="w-6 h-6" />
      </button>

      {/* ── Counter ── */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 text-white/90 font-medium text-sm bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md z-20 whitespace-nowrap pointer-events-none"
      >
        {currentIndex + 1} / {images.length}
      </div>

      {/* ── Prev button ── */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* ── Main image (stops click-through to backdrop) ── */}
      <div
        className="absolute inset-0 flex items-center justify-center px-20 pb-24"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={`${productName} ${currentIndex + 1}`}
          className="max-h-[75vh] max-w-full object-contain shadow-2xl rounded-lg select-none"
          draggable={false}
          onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
        />
      </div>

      {/* ── Next button ── */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-8 overflow-x-auto z-20"
          onClick={e => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={e => { e.stopPropagation(); setCurrentIndex(idx); }}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === idx
                  ? 'border-white opacity-100 scale-110'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img
                src={img}
                className="w-full h-full object-cover"
                alt={`Thumb ${idx + 1}`}
                draggable={false}
                onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── StayCard ──────────────────────────────────────────────────────────────────

export const StayCard = ({ product, isLoggedIn, isSaved, isInCart, onWishlist, onAddToCart }: Props) => {
  const { t }          = useTranslation();
  const activeVouchers = getActiveVouchers(product);
  const bestDiscount   = calcBestDiscount(activeVouchers, Number(product.price));
  const { langPath }   = useLangNavigate();

  const [galleryOpen,  setGalleryOpen]  = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Build full image list: main + gallery extras
  const mainImgSrc       = getImageUrl(product.image_url || product.image);
  const galleryImagesArr = Array.isArray((product as any).images)
    ? (product as any).images
        .map((item: any) => getImageUrl(typeof item === 'string' ? item : item?.url))
        .filter(Boolean)
    : [];
  const allImages: string[] = [mainImgSrc, ...galleryImagesArr];

  const openGallery = (e: React.MouseEvent, index = 0) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const facilities: string[] = (product.details as any)?.facilities || [];
  const stars = (product.details as any)?.starRating || Math.round(product.rating || 4);
  const productPath = langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`);

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-gray-100 flex flex-col sm:flex-row">

        {/* ── Image (click = gallery) ── */}
        <div className="relative sm:w-72 lg:w-80 shrink-0 overflow-hidden aspect-[4/3] sm:aspect-auto">
          <button
            type="button"
            onClick={e => openGallery(e, 0)}
            className="block w-full h-full focus:outline-none cursor-zoom-in"
            title={t('product.gallery', 'Lihat Semua Foto')}
          >
            <img
              src={mainImgSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
            {/* Hover overlay with photo count */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-end justify-start p-3 pointer-events-none">
              {allImages.length > 1 && (
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 bg-black/65 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
                  <Images className="w-3.5 h-3.5" />
                  {allImages.length} {t('product.photos', 'Foto')}
                </span>
              )}
            </div>
          </button>

          {/* Wishlist button */}
          {isLoggedIn && (
            <button
              onClick={onWishlist}
              className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform active:scale-90"
              title={t('product.save_wishlist', 'Save to Wishlist')}
            >
              <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} />
            </button>
          )}

          {/* Promo badge */}
          {activeVouchers.length > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md z-10 pointer-events-none">
              <Tag className="w-3 h-3" />
              {activeVouchers.length === 1
                ? `${activeVouchers[0].type === 'percent' ? activeVouchers[0].value + '%' : formatRp(activeVouchers[0].value)} OFF`
                : `${activeVouchers.length} ${t('common.popular', 'Promo')}`}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 flex flex-col p-5 sm:p-6">
          <div className="flex-1">
            {/* Stars */}
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" className={`w-3.5 h-3.5 ${i < stars ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-gray-500 ml-1">{stars} Star</span>
            </div>

            {/* Name */}
            <Link to={productPath}>
              <h3 className="font-serif font-bold text-xl text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                {product.name}
              </h3>
            </Link>

            {/* Location */}
            {product.location && (
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {formatLocation(product.location)}
              </p>
            )}

            {/* Description */}
            {(product as any).description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                {(product as any).description}
              </p>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {facilities.slice(0, 4).map((fac: string) => (
                  <span key={fac} className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                    {FACILITY_ICONS[fac.toLowerCase()] || null}
                    {fac}
                  </span>
                ))}
                {facilities.length > 4 && (
                  <span className="inline-flex items-center text-xs font-medium text-primary-600 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-lg">
                    +{facilities.length - 4}
                  </span>
                )}
              </div>
            )}

            <VoucherPillList vouchers={activeVouchers} max={2} />
          </div>

          {/* ── Price + Actions ── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-4 border-t border-gray-100 mt-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                {(product.details as any)?.roomType || t('explore.from', 'From')}
              </p>
              {bestDiscount > 0 && (
                <p className="text-xs text-gray-400 line-through">
                  {product.currency} {Number(product.price).toLocaleString('id-ID')}
                </p>
              )}
              <p className="text-2xl font-bold text-gray-900 leading-none">
                {product.currency}{' '}
                {bestDiscount > 0
                  ? (Number(product.price) - bestDiscount).toLocaleString('id-ID')
                  : Number(product.price).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('common.per_night', '/ malam')} · {t('common.total_room', '1 Kamar')}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  {product.rating}
                </div>
                <span className="text-xs text-gray-500">{t('explore.rating_label', 'Penilaian')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <Link
                to={productPath}
                className="px-5 py-2.5 bg-[#1a3a5c] hover:bg-[#1e4570] text-white rounded-xl text-sm font-bold transition-colors text-center whitespace-nowrap"
              >
                {t('explore.view_details', 'Lihat Detail')}
              </Link>
              <button
                onClick={onAddToCart}
                disabled={isInCart}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border whitespace-nowrap
                  ${isInCart
                    ? 'border-green-500 text-green-600 bg-green-50 cursor-default'
                    : 'border-gray-200 text-gray-700 bg-white hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50'
                  }`}
              >
                <ShoppingCart className={`w-3.5 h-3.5 shrink-0 ${isInCart ? 'stroke-green-600' : ''}`} />
                {isInCart ? t('product.added_to_cart', 'Ditambahkan') : t('product.add_to_cart', 'Tambah ke Keranjang')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gallery Modal ── */}
      {galleryOpen && (
        <GalleryModal
          images={allImages}
          initialIndex={galleryIndex}
          productName={product.name}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
};

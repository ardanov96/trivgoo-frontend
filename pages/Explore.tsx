import { ArrowRight, ArrowUpDown, Heart, MapPin, Search, Star, X, Users, Gauge, Briefcase, Droplet, UserCog, Award, CheckCircle2, Tag, ShieldCheck, Ticket, ChevronLeft, Percent, DollarSign, Sparkles } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { generateSlug } from '../utils/slugify';
import { encodeId } from '../utils/hashids';
import { motion, type Variants } from 'framer-motion';
import { useWishlist } from '../components/WishlistContext';
import { getImageUrl, FALLBACK_IMAGE } from '../utils/imageUtils';
import {
  Category,
  Product,
  StayCategory,
  TourCategory,
  TransportCategory,
  CarDetails,
  TourDetails,
  StayDetails,
} from '../types';
import { agentProductService } from '../services/agentProductService';
import { ShoppingCart, Car } from "lucide-react";
import { useCart } from "../components/CartContext";
import { useToast } from "../components/ToastContext";
import { useAuth } from "../AuthContext";

// ── Framer Motion Variants ────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const filterContainerVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05, delayChildren: 0.1 } },
};
const filterItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};
const carCardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

// ── Type guards ───────────────────────────────────────────────
const isTour = (d: any): d is TourDetails => d?.type === "tour";
const isStay = (d: any): d is StayDetails => d?.type === "stay";
const isCar  = (d: any): d is CarDetails  => d?.type === "car";

// ── Voucher helpers ───────────────────────────────────────────
const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

function getActiveVouchers(product: Product): any[] {
  const now = new Date();
  return ((product as any).vouchers || []).filter(
    (v: any) => v.is_active && (!v.expires_at || new Date(v.expires_at) >= now)
  );
}

function calcBestDiscount(vouchers: any[], amount: number): number {
  if (!vouchers.length) return 0;
  return Math.max(
    ...vouchers.map((v: any) => {
      if (Number(amount) < Number(v.min_transaction)) return 0;
      if (v.type === 'percent') {
        const d = Math.floor((amount * Number(v.value)) / 100);
        return v.max_discount != null ? Math.min(d, Number(v.max_discount)) : d;
      }
      return Math.min(Number(v.value), amount);
    })
  );
}

// ── Car Grouping ──────────────────────────────────────────────
function extractProvince(location: string): string {
  if (!location) return '';
  return location.split(',').at(-1)?.trim().toLowerCase() || '';
}
function extractCarModel(name: string): string {
  return name.split(' ').slice(0, 2).join(' ').toLowerCase();
}
type CarGroup = { groupKey: string; representativeProduct: Product; agents: Product[] };

function groupCarProducts(products: Product[]): CarGroup[] {
  const map = new Map<string, Product[]>();
  products.forEach((p) => {
    const key = `${extractCarModel(p.name)}__${extractProvince(p.location || '')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  });
  const groups: CarGroup[] = [];
  map.forEach((agents, groupKey) => {
    const sorted = [...agents].sort((a, b) => Number(a.price) - Number(b.price));
    groups.push({ groupKey, representativeProduct: sorted[0], agents });
  });
  return groups;
}

const formatLocation = (location: string): string => {
  if (!location) return '';
  const parts = location.split(',').map(p => p.trim()).filter(Boolean);
  const cleaned = parts.filter(p =>
    !/\d/.test(p) &&
    !['indonesia', 'jawa', 'java'].includes(p.toLowerCase()) &&
    !/^dusun/i.test(p) && !/^rt/i.test(p) && !/^rw/i.test(p) &&
    !/^jalan/i.test(p) && !/^jl/i.test(p) && !/^gg/i.test(p) && !/^gang/i.test(p)
  );
  return cleaned.slice(-3).join(', ');
};

// ── Destination Banner Map ────────────────────────────────────
const DESTINATION_BANNERS: Record<string, { image: string; subtitle: string }> = {
  'bali':        { image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80', subtitle: "Don't forget to check out these activities while you're here." },
  'raja ampat':  { image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1600&q=80', subtitle: "Explore the world's best diving and marine paradise." },
  'yogyakarta':  { image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1600&q=80', subtitle: "Discover the cultural heart of Java." },
  'lombok':      { image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=80', subtitle: "Find your paradise on pristine white-sand beaches." },
  'komodo':      { image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=1600&q=80', subtitle: "Home to dragons, pink beaches, and crystal waters." },
  'tokyo':       { image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80', subtitle: "Where ancient tradition meets futuristic wonder." },
  'kyoto':       { image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80', subtitle: "Step into the timeless beauty of old Japan." },
  'seoul':       { image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1600&q=80', subtitle: "A city alive with culture, food, and energy." },
  'bangkok':     { image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1600&q=80', subtitle: "Temples, street food, and endless adventure." },
  'singapore':   { image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1600&q=80', subtitle: "Asia's most iconic city-state awaits you." },
  'padar island':{ image: 'https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?auto=format&fit=crop&w=1600&q=80', subtitle: "Breathtaking hilltop views over Komodo's hidden gem." },
  'hong kong':   { image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80', subtitle: "A dazzling skyline where East meets West." },
};
const getDestinationBanner = (query: string) => DESTINATION_BANNERS[query.toLowerCase().trim()] ?? null;

// ══════════════════════════════════════════════════════════════
//  VoucherPillList — tampilkan voucher aktif dalam bentuk pill
// ══════════════════════════════════════════════════════════════
const VoucherPillList: React.FC<{ vouchers: any[]; max?: number }> = ({ vouchers, max = 2 }) => {
  if (!vouchers.length) return null;
  const shown = vouchers.slice(0, max);
  const rest  = vouchers.length - max;
  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
      {shown.map((v: any) => (
        <span key={v.id}
          className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">
          {v.type === 'percent'
            ? <Percent className="w-2.5 h-2.5" />
            : <DollarSign className="w-2.5 h-2.5" />
          }
          {v.type === 'percent' ? `${v.value}% OFF` : `${formatRp(v.value)} OFF`}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[10px] text-orange-500 font-bold">+{rest} lagi</span>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  Explore
// ══════════════════════════════════════════════════════════════
const Explore: React.FC = () => {
  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { showToast }           = useToast();
  const { user }                = useAuth();
  const isLoggedIn              = !!user;

  const [agentPickerGroup, setAgentPickerGroup] = useState<CarGroup | null>(null);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); e.stopPropagation();
    if (isInCart(product.id)) return;
    addToCart(product, 1);
    showToast(`${product.name} ditambahkan ke keranjang!`, "success");
  };

  const [selectedCategory,    setSelectedCategory]    = useState<number | null>(1);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [sortBy,     setSortBy]     = useState<'price_asc' | 'price_desc' | 'rating' | null>(null);
  const [rentalFilters, setRentalFilters] = useState({
    transmission: '', minPrice: '', maxPrice: '', location: '', passengerCapacity: '',
  });
  const [isLoading,    setIsLoading]    = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  const searchQuery       = searchParams.get('search') || '';
  const fromItinerary     = searchParams.get('from') === 'itinerary';
  const destinationBanner = fromItinerary ? getDestinationBanner(searchQuery) : null;

  useEffect(() => {
    const categoryIdParam = searchParams.get('category_id');
    if (categoryIdParam) setSelectedCategory(Number(categoryIdParam));
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          agentProductService.getAllProducts(),
          agentProductService.getCategories(),
        ]);
        const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
        const normalizedProducts = prods.map((p: Product) => ({
          ...p,
          image_url: p.image_url && !p.image_url.startsWith("http")
            ? `${BASE_URL}/${p.image_url}` : p.image_url,
        }));
        setProducts(normalizedProducts);
        setCategories(cats);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const updateSearch = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set('search', value); else newParams.delete('search');
    setSearchParams(newParams);
    setVisibleCount(8);
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategory(id);
    setSelectedSubCategory(null);
    setRentalFilters({ transmission: '', minPrice: '', maxPrice: '', location: '', passengerCapacity: '' });
    setVisibleCount(8);
  };

  const clearSearch = () => {
    setSearchParams({});
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSortBy(null);
    setRentalFilters({ transmission: '', minPrice: '', maxPrice: '', location: '', passengerCapacity: '' });
  };

  const handleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); e.stopPropagation(); toggleWishlist(product);
  };

  const handleRentalFilterChange = (field: string, value: string) => {
    setRentalFilters(prev => ({ ...prev, [field]: value }));
  };

  // ── Filter & Sort ─────────────────────────────────────────────
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(query) ||
        (p.location || "").toLowerCase().includes(query);

      if (selectedCategory === 3 || selectedCategory === 4) {
        if (!p.details || !isCar(p.details)) return false;
        if (selectedCategory === 3 && p.details.transportCategory !== "Car Rental") return false;
        if (selectedCategory === 4 && p.details.transportCategory !== "Airport Transfer") return false;
        if (rentalFilters.transmission && p.details.transmission &&
          p.details.transmission.toLowerCase() !== rentalFilters.transmission.toLowerCase()) return false;
        const price = Number(p.price);
        if (rentalFilters.minPrice && price < Number(rentalFilters.minPrice)) return false;
        if (rentalFilters.maxPrice && price > Number(rentalFilters.maxPrice)) return false;
        if (rentalFilters.location && !(p.location || '').toLowerCase().includes(rentalFilters.location.toLowerCase())) return false;
        if (rentalFilters.passengerCapacity && p.details.seats &&
          Number(p.details.seats) < Number(rentalFilters.passengerCapacity)) return false;
        return matchSearch;
      }

      const matchCat = selectedCategory ? Number(p.category_id) === Number(selectedCategory) : true;
      let matchSubCat = true;
      if (selectedCategory && selectedSubCategory && p.details) {
        let detailValue = '';
        if (isTour(p.details) && p.details.tourCategory) detailValue = p.details.tourCategory.toLowerCase();
        else if (isStay(p.details) && p.details.stayCategory) detailValue = p.details.stayCategory.toLowerCase();
        else if (isCar(p.details) && p.details.transportCategory) detailValue = p.details.transportCategory.toLowerCase();
        matchSubCat = detailValue === selectedSubCategory.toLowerCase();
      }
      return matchCat && matchSubCat && matchSearch;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':  return Number(a.price) - Number(b.price);
          case 'price_desc': return Number(b.price) - Number(a.price);
          case 'rating':     return (b.rating || 0) - (a.rating || 0);
          default:           return 0;
        }
      });
    }
    return filtered;
  }, [products, searchQuery, selectedCategory, selectedSubCategory, sortBy, rentalFilters]);

  const carGroups = useMemo(() => {
    if (selectedCategory !== 3 && selectedCategory !== 4) return [];
    return groupCarProducts(filteredAndSortedProducts.filter(p => isCar(p.details)));
  }, [filteredAndSortedProducts, selectedCategory]);

  const isCarCategory = selectedCategory === 3 || selectedCategory === 4;

  // ── Skeleton ──────────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-50">
          <div><div className="h-3 bg-gray-200 rounded w-10 mb-1" /><div className="h-6 bg-gray-200 rounded w-24" /></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  //  RegularCard
  // ══════════════════════════════════════════════════════════════
  const RegularCard = ({ product }: { product: Product }) => {
    const isSaved        = isInWishlist(product.id);
    const activeVouchers = getActiveVouchers(product);
    const bestDiscount   = calcBestDiscount(activeVouchers, Number(product.price));

    return (
      <Link
        to={`/product/${encodeId(product.id)}/${generateSlug(product.name)}`}
        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative"
      >
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={getImageUrl(product.image_url || product.image)} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
          />

          {/* Wishlist */}
          {isLoggedIn && (
            <button
              onClick={(e) => handleWishlist(e, product)}
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90"
            >
              <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
            </button>
          )}

          {/* Rating */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
            <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />{product.rating}
          </div>

          {/* Promo badge — overlay di gambar */}
          {activeVouchers.length > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md z-10">
              <Tag className="w-3 h-3" />
              {activeVouchers.length === 1
                ? `${activeVouchers[0].type === 'percent' ? activeVouchers[0].value + '%' : formatRp(activeVouchers[0].value)} OFF`
                : `${activeVouchers.length} Promo`
              }
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          {product.location && (
            <p className="text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {formatLocation(product.location || '')}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">From</p>
            <p className="text-lg font-bold text-gray-900">
              {product.currency} {Number(product.price).toLocaleString('id-ID')}
              <span className="text-sm font-medium text-gray-500"> /pax</span>
            </p>

            {/* Harga setelah diskon terbaik */}
            {bestDiscount > 0 && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">
                Mulai {product.currency} {(Number(product.price) - bestDiscount).toLocaleString('id-ID')} setelah promo
              </p>
            )}

            {/* Voucher pills */}
            <VoucherPillList vouchers={activeVouchers} max={2} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <Link
                to={`/product/${encodeId(product.id)}/${generateSlug(product.name)}`}
                onClick={(e) => e.stopPropagation()}
                className="border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center flex items-center justify-center"
              >
                See Details
              </Link>
              <button
                onClick={(e) => handleAddToCart(e, product)}
                disabled={isInCart(product.id)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border transform active:scale-[0.98] ${
                  isInCart(product.id)
                    ? "border-green-500 text-green-600 bg-green-50 cursor-default"
                    : "border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md"
                }`}
              >
                <ShoppingCart className={`w-3.5 h-3.5 shrink-0 ${isInCart(product.id) ? "stroke-green-600" : ""}`} />
                <span className="truncate">{isInCart(product.id) ? "Added" : "Add to Cart"}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  RentalCarCard
  // ══════════════════════════════════════════════════════════════
  const RentalCarCard = ({ product, agentCount = 1 }: { product: Product; agentCount?: number }) => {
    const isSaved        = isInWishlist(product.id);
    const details        = product.details as CarDetails;
    const activeVouchers = getActiveVouchers(product);
    const PREVIEW_DAYS   = 2;
    const baseTotal      = Number(product.price) * PREVIEW_DAYS;
    const bestDiscount   = calcBestDiscount(activeVouchers, baseTotal);
    const finalTotal     = baseTotal - bestDiscount;

    return (
      <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col md:flex-row relative w-full">
        {/* Image column */}
        <div className="md:w-1/3 relative overflow-hidden">
          <div className="aspect-[4/3] md:aspect-auto md:h-full">
            <img
              src={getImageUrl(product.image_url || product.image)} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
          </div>

          {isLoggedIn && (
            <button
              onClick={(e) => { e.stopPropagation(); handleWishlist(e, product); }}
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90"
            >
              <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
            </button>
          )}

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
            <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />{product.rating || '-'}
          </div>

          {/* Promo badge di atas gambar */}
          {activeVouchers.length > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md z-10">
              <Sparkles className="w-3 h-3" />
              {activeVouchers.length} Promo
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
              <h3 className="font-serif font-bold text-2xl text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
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
              {/* Harga setelah diskon terbaik */}
              {bestDiscount > 0 && (
                <p className="text-xs text-green-600 font-semibold mt-0.5">
                  Est. {PREVIEW_DAYS}h: <span className="line-through text-gray-400">{formatRp(baseTotal)}</span>{' '}
                  <span className="text-green-700 font-extrabold">{formatRp(finalTotal)}</span>
                </p>
              )}
              {/* Voucher pills */}
              <div className="flex justify-end mt-1">
                <VoucherPillList vouchers={activeVouchers} max={2} />
              </div>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { icon: Gauge,   label: 'Transmission', value: details.transmission === 'Automatic' ? 'Matic' : 'Manual' },
              { icon: Users,   label: 'Seats',        value: `${details.seats} Passengers` },
              { icon: Award,   label: 'Year',         value: details.year || '-' },
              { icon: Droplet, label: 'Fuel Policy',  value: details.fuelPolicy || 'Standard' },
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
            {details.luggage && (
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full">
                <Briefcase className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-medium">{details.luggage} Luggage</span>
              </div>
            )}
            {details.driver && (
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full">
                <UserCog className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-medium">With Driver</span>
              </div>
            )}
            {details.transportCategory && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${details.transportCategory === 'Airport Transfer' ? 'bg-green-50' : 'bg-primary-50'}`}>
                <Car className={`w-4 h-4 ${details.transportCategory === 'Airport Transfer' ? 'text-green-600' : 'text-primary-600'}`} />
                <span className={`text-xs font-medium ${details.transportCategory === 'Airport Transfer' ? 'text-green-700' : 'text-primary-700'}`}>
                  {details.transportCategory}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
            {agentCount > 1 ? (
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex-1 border-2 border-primary-600 text-primary-600 py-3 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-all text-center flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />Pilih Agent ({agentCount})
              </button>
            ) : (
              <Link
                to={`/product/${encodeId(product.id)}/${generateSlug(product.name)}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center"
              >
                See Details
              </Link>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
              disabled={isInCart(product.id)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border-2 transform active:scale-[0.98] ${
                isInCart(product.id)
                  ? "border-green-500 text-green-600 bg-green-50 cursor-default"
                  : "border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md"
              }`}
            >
              <ShoppingCart className={`w-4 h-4 ${isInCart(product.id) ? "stroke-green-600" : ""}`} />
              {isInCart(product.id) ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  AgentPickerModal — dengan voucher real + harga perkiraan
  // ══════════════════════════════════════════════════════════════
  const AgentPickerModal = ({ group, onClose }: { group: CarGroup; onClose: () => void }) => {
    const PREVIEW_DAYS = 2;

    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 leading-tight">Pilih Penyedia Rental</h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-500" />
                {group.representativeProduct.location?.split(',').slice(-2).join(',').trim()} ·{' '}
                <span className="font-semibold text-gray-700">{group.agents.length} penyedia tersedia</span>
              </p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0 mt-0.5">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Agent list */}
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {group.agents
              .sort((a, b) => Number(a.price) - Number(b.price))
              .map((agent, idx) => {
                const details        = agent.details as CarDetails;
                const activeVouchers = getActiveVouchers(agent);
                const baseTotal      = Number(agent.price) * PREVIEW_DAYS;
                const bestDiscount   = calcBestDiscount(activeVouchers, baseTotal);
                const finalTotal     = baseTotal - bestDiscount;
                const hasPromo       = bestDiscount > 0;

                // Ambil voucher terbaik untuk ditampilkan
                const bestVoucher = activeVouchers.find((v: any) => {
                  const d = calcBestDiscount([v], baseTotal);
                  return d === bestDiscount;
                });

                const reviewHighlights = ['Kemudahan Pickup', 'Kebersihan Mobil', 'Sikap Staff'];

                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.07 }}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all duration-200 group/item"
                  >
                    {/* Badge row — voucher real */}
                    <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 flex-wrap">
                      {activeVouchers.length > 0 ? (
                        <>
                          {activeVouchers.slice(0, 2).map((v: any) => (
                            <span key={v.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-500 text-white">
                              <Tag className="w-3 h-3" />
                              {v.code}
                              {' · '}
                              {v.type === 'percent' ? `${v.value}% OFF` : `${formatRp(v.value)} OFF`}
                            </span>
                          ))}
                          {activeVouchers.length > 2 && (
                            <span className="text-[10px] text-orange-500 font-bold">+{activeVouchers.length - 2} promo</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-500 text-white">
                            <ShieldCheck className="w-3 h-3" /> Terverifikasi
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-start gap-4 px-4 pb-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        <img
                          src={getImageUrl(agent.image_url || agent.image)} alt={agent.name}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {(agent as any).owner?.name || 'Penyedia Rental'}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-gray-800">
                              {agent.rating ? `${agent.rating}/10.0` : '7.5/10.0'}
                            </span>
                          </div>
                        </div>

                        {/* Review highlights */}
                        <div className="mb-2">
                          <div className="space-y-0.5">
                            {reviewHighlights.map((h, hi) => (
                              <div key={hi} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Spec pills */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {details?.transmission === 'Automatic' ? 'Matic' : 'Manual'}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {details?.seats || 4} Penumpang
                          </span>
                          {details?.driver && (
                            <span className="bg-primary-50 text-primary-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              + Driver
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price + CTA */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-2">
                        <div>
                          {/* Harga per hari */}
                          <p className="text-xs text-gray-500 font-medium">
                            {agent.currency} {Number(agent.price).toLocaleString('id-ID')}/hari
                          </p>

                          {/* Total estimasi */}
                          {hasPromo ? (
                            <>
                              <p className="text-xs text-gray-400 line-through">
                                {formatRp(baseTotal)} est.
                              </p>
                              <p className="text-base font-extrabold text-green-600 leading-tight">
                                {formatRp(finalTotal)}
                                <span className="text-[10px] font-bold text-green-500 ml-0.5">est.</span>
                              </p>
                              {bestVoucher && (
                                <p className="text-[10px] text-orange-500 font-bold mt-0.5">
                                  Hemat {formatRp(bestDiscount)}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-base font-extrabold text-primary-600 leading-tight">
                              {formatRp(baseTotal)}
                              <span className="text-[10px] font-bold text-primary-500 ml-0.5">est.</span>
                            </p>
                          )}
                        </div>

                        <Link
                          to={`/product/${encodeId(agent.id)}/${generateSlug(agent.name)}`}
                          onClick={onClose}
                          className="inline-flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-primary-600/25 transition-all active:scale-95 whitespace-nowrap"
                        >
                          Choose <ArrowRight className="w-3.5 h-3.5 group-hover/item:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
            <p className="text-xs text-gray-400 text-center">
              Estimasi {PREVIEW_DAYS} hari sewa · Harga sudah termasuk promo terbaik jika tersedia
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div>
      <SEO title="Explore - Trivgoo" description="Discover the perfect travel packages, rentals, and experiences for your next trip." />

      {/* Destination Hero Banner */}
      {fromItinerary && destinationBanner ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
          className="relative w-full h-[220px] md:h-[300px] overflow-hidden">
          <motion.img src={destinationBanner.image} alt={searchQuery} className="w-full h-full object-cover"
            initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/55 via-gray-900/35 to-gray-900/75" />
          <motion.button onClick={() => navigate(-1)}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="absolute top-20 left-6 md:left-10 flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
          </motion.button>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-4">
            <motion.p initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="text-white/70 text-[11px] md:text-sm font-semibold uppercase tracking-[0.2em] mb-2">
              All Time Favourite Activities In
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg mb-3 leading-tight">
              {searchQuery}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-white/75 text-sm md:text-base max-w-lg leading-relaxed">
              {destinationBanner.subtitle}
            </motion.p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent" />
        </motion.div>
      ) : (
        <div className="pt-24" />
      )}

      {/* Main Content */}
      <div className={`bg-gray-50 min-h-screen pb-12 ${fromItinerary && destinationBanner ? 'pt-6' : ''}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {!(fromItinerary && destinationBanner) && (
            <motion.div initial="hidden" animate="visible" variants={fadeUpVariants} className="mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Explore the World</h1>
              <p className="text-gray-500">Discover unique experiences and hidden gems.</p>
            </motion.div>
          )}

          {/* Filter Container */}
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariants} transition={{ delay: 0.1 }}
            className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 mb-12">
            <div className="flex flex-col gap-8">

              {/* Category Buttons */}
              <motion.div variants={filterContainerVariants} initial="hidden" animate="visible" className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {[
                  { label: "Travel", id: 1 }, { label: "Hotel & Villa", id: 2 },
                  { label: "Car Rental", id: 3 }, { label: "Airport Transfer", id: 4 }, { label: "Event", id: 5 },
                ].map((item) => (
                  <motion.button key={item.label} variants={filterItemVariants} onClick={() => handleCategorySelect(item.id)} whileTap={{ scale: 0.95 }}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${selectedCategory === item.id ? "bg-gray-900 text-white border-gray-900 shadow-md" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900"}`}>
                    {item.label}
                  </motion.button>
                ))}
              </motion.div>

              {/* Search + Sort */}
              <motion.div variants={slideLeftVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                  <input type="text" placeholder={isCarCategory ? "Search rental location..." : "Search destination or package..."}
                    value={searchQuery} onChange={(e) => updateSearch(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium" />
                  {searchQuery && (
                    <button onClick={() => updateSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {selectedCategory === 1 && (
                  <div className="relative w-full lg:w-56">
                    <select value={selectedSubCategory || ""} onChange={(e) => setSelectedSubCategory(e.target.value || null)}
                      className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer">
                      <option value="">Trip Type</option>
                      <option value="Open Trip">Open Trip</option>
                      <option value="Private Trip">Private Trip</option>
                      <option value="Group Trip">Group Trip</option>
                    </select>
                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                )}
                <div className="relative w-full lg:w-56">
                  <select value={sortBy || ""} onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer">
                    <option value="">Sort by</option>
                    <option value="price_asc">Lowest Price</option>
                    <option value="price_desc">Highest Price</option>
                    <option value="rating">Highest Rating</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </motion.div>

              {/* Rental Filters */}
              {isCarCategory && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Gauge className="h-5 w-5 text-gray-400" /></div>
                    <select value={rentalFilters.transmission} onChange={(e) => handleRentalFilterChange('transmission', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer appearance-none">
                      <option value="">Transmission Type</option><option value="Automatic">Matic</option><option value="Manual">Manual</option>
                    </select>
                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Users className="h-5 w-5 text-gray-400" /></div>
                    <select value={rentalFilters.passengerCapacity} onChange={(e) => handleRentalFilterChange('passengerCapacity', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer appearance-none">
                      <option value="">Passenger Capacity</option><option value="2">2 Passengers</option><option value="4">4 Passengers</option><option value="6">6 Passengers</option><option value="8">8+ Passengers</option>
                    </select>
                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-gray-400 font-medium">Rp</span></div>
                    <input type="number" placeholder="Min Price" value={rentalFilters.minPrice} onChange={(e) => handleRentalFilterChange('minPrice', e.target.value)} min="0"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-gray-400 font-medium">Rp</span></div>
                    <input type="number" placeholder="Max Price" value={rentalFilters.maxPrice} onChange={(e) => handleRentalFilterChange('maxPrice', e.target.value)} min="0"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                </motion.div>
              )}

              {/* Experience Tags */}
              {(selectedCategory === 1 || selectedCategory === 2) && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  <button onClick={() => setSelectedSubCategory(null)}
                    className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${selectedSubCategory === null ? "bg-primary-600 text-white border-primary-600 shadow-md" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600"}`}>
                    Semua
                  </button>
                  {(selectedCategory === 1
                    ? ["Family", "Honeymoon", "Solo Travel", "Healing", "Workation", "Adventure", "Cultural", "Culinary", "Eco Tourism"]
                    : ["Hotel", "Villa", "Homestay", "Resort"]
                  ).map((tag) => (
                    <button key={tag} onClick={() => setSelectedSubCategory(tag)}
                      className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${selectedSubCategory === tag ? "bg-primary-600 text-white border-primary-600 shadow-md" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600"}`}>
                      {tag}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Results */}
          {isCarCategory ? (
            <motion.div key={`car-${selectedCategory}`} variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-6">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                    <div className="md:flex">
                      <div className="md:w-1/3 h-48 md:h-auto bg-gray-200" />
                      <div className="md:w-2/3 p-6 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, j) => <div key={j} className="h-16 bg-gray-200 rounded" />)}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                carGroups.map((group) => (
                  <motion.div key={group.groupKey} variants={carCardVariants}
                    onClick={() => {
                      group.agents.length > 1
                        ? setAgentPickerGroup(group)
                        : navigate(`/product/${encodeId(group.representativeProduct.id)}/${generateSlug(group.representativeProduct.name)}`);
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }} className="cursor-pointer">
                    <RentalCarCard product={group.representativeProduct} agentCount={group.agents.length} />
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div key={`grid-${selectedCategory}-${selectedSubCategory}`} variants={containerVariants} initial="hidden" animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {isLoading
                ? [...Array(8)].map((_, i) => <motion.div key={i} variants={cardVariants}><SkeletonCard /></motion.div>)
                : filteredAndSortedProducts.slice(0, visibleCount).map((product) => (
                    <motion.div key={product.id} variants={cardVariants} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                      <RegularCard product={product} />
                    </motion.div>
                  ))
              }
            </motion.div>
          )}

          {/* Load More */}
          {!isLoading && !isCarCategory && filteredAndSortedProducts.length > visibleCount && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex justify-center mt-10">
              <motion.button onClick={() => setVisibleCount(prev => prev + 8)}
                whileHover={{ y: -3, scale: 1.03, transition: { duration: 0.2 } }} whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-colors duration-300 group">
                Load More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && (isCarCategory ? carGroups.length === 0 : filteredAndSortedProducts.length === 0) && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
              className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">No results found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                We couldn't find any {selectedCategory === 3 ? 'rental cars' : 'items'} matching your search.
              </p>
              <button onClick={clearSearch}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Agent Picker Modal */}
      {agentPickerGroup && (
        <AgentPickerModal group={agentPickerGroup} onClose={() => setAgentPickerGroup(null)} />
      )}
    </div>
  );
};

export default Explore;

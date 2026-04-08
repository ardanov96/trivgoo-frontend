import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Product } from '../../../types';
import { isCar, isTour, isStay, groupCarProducts } from '../utils';
import { CATEGORY_SLUG_MAP, CATEGORY_ID_TO_SLUG } from '../constants';
import type { StayFilters } from '../components/StayFilterPanel';
import { INITIAL_STAY_FILTERS } from '../components/StayFilterPanel';

export interface RentalFilters {
  transmission:      string;
  minPrice:          string;
  maxPrice:          string;
  location:          string;
  passengerCapacity: string;
  driverType:        string;
}

// ── Airport Transfer filters ──────────────────────────────────────────────────
export interface TransferFilters {
  from:        string;   // bandara asal
  to:          string;   // tujuan
  pickupDate:  string;   // YYYY-MM-DD
  pickupTime:  string;   // HH:MM
}

const INITIAL_RENTAL_FILTERS: RentalFilters = {
  transmission: '', minPrice: '', maxPrice: '', location: '', passengerCapacity: '', driverType: '',
};

const INITIAL_TRANSFER_FILTERS: TransferFilters = {
  from: '', to: '', pickupDate: '', pickupTime: '',
};

export type { StayFilters };

export const useExploreFilters = (products: Product[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug, lang }          = useParams<{ categorySlug?: string; lang: string }>();
  const navigate                        = useNavigate();

  const categoryFromSlug  = categorySlug ? (CATEGORY_SLUG_MAP[categorySlug] ?? null) : null;
  const categoryFromParam = searchParams.get('category_id') ? Number(searchParams.get('category_id')) : null;

  const [selectedCategory,    setSelectedCategory]    = useState<number | null>(
    categoryFromSlug ?? categoryFromParam ?? 1
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [sortBy,              setSortBy]              = useState<'price_asc' | 'price_desc' | 'rating' | null>(null);
  const [rentalFilters,       setRentalFilters]       = useState<RentalFilters>(INITIAL_RENTAL_FILTERS);
  const [stayFilters,         setStayFilters]         = useState<StayFilters>(INITIAL_STAY_FILTERS);
  const [visibleCount,        setVisibleCount]        = useState(8);

  // ── Airport Transfer state — di-init dari URL params ─────────────────────
  const [transferFilters, setTransferFilters] = useState<TransferFilters>({
    from:       searchParams.get('from')        || '',
    to:         searchParams.get('to')          || '',
    pickupDate: searchParams.get('pickup_date') || '',
    pickupTime: searchParams.get('pickup_time') || '',
  });

  const searchQuery   = searchParams.get('search') || '';
  const fromItinerary = searchParams.get('from_itinerary') === '1';

  // Sync category saat slug URL berubah
  useEffect(() => {
    if (categoryFromSlug !== null) {
      setSelectedCategory(categoryFromSlug);
    } else if (!categorySlug) {
      setSelectedCategory(categoryFromParam ?? 1);
    }
  }, [categorySlug]);

  // Sync transfer filters saat URL params berubah (misal dari hero search)
  useEffect(() => {
    const fromParam = searchParams.get('from')        || '';
    const toParam   = searchParams.get('to')          || '';
    const dateParam = searchParams.get('pickup_date') || '';
    const timeParam = searchParams.get('pickup_time') || '';

    // Hanya update jika category airport transfer aktif dan ada nilai baru
    if (selectedCategory === 4 && (fromParam || toParam || dateParam)) {
      setTransferFilters({ from: fromParam, to: toParam, pickupDate: dateParam, pickupTime: timeParam });
    }
  }, [searchParams, selectedCategory]);

  const updateSearch = (value: string) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set('search', value) : p.delete('search');
    setSearchParams(p);
    setVisibleCount(8);
  };

  // ── Update transfer filters + sync URL params ─────────────────────────────
  const updateTransferFilters = (field: keyof TransferFilters, value: string) => {
    const updated = { ...transferFilters, [field]: value };
    setTransferFilters(updated);

    // Sync ke URL supaya shareable & reload-safe
    const p = new URLSearchParams(searchParams);
    const keyMap: Record<keyof TransferFilters, string> = {
      from:       'from',
      to:         'to',
      pickupDate: 'pickup_date',
      pickupTime: 'pickup_time',
    };
    const urlKey = keyMap[field];
    value ? p.set(urlKey, value) : p.delete(urlKey);
    setSearchParams(p, { replace: true });
  };

  // ── Update stay filters ───────────────────────────────────────────────────
  const updateStayFilters = (filters: StayFilters) => {
    setStayFilters(filters);
    setVisibleCount(8);
  };

  const clearStayFilters = () => {
    setStayFilters(INITIAL_STAY_FILTERS);
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategory(id);
    setSelectedSubCategory(null);
    setRentalFilters(INITIAL_RENTAL_FILTERS);
    setTransferFilters(INITIAL_TRANSFER_FILTERS);
    setStayFilters(INITIAL_STAY_FILTERS);
    setVisibleCount(8);

    const slug        = id ? CATEGORY_ID_TO_SLUG[id] : null;
    const currentLang = lang ?? 'id';
    const search      = searchParams.get('search');
    const query       = search ? `?search=${encodeURIComponent(search)}` : '';

    navigate(slug
      ? `/${currentLang}/explore/${slug}${query}`
      : `/${currentLang}/explore${query}`
    );
  };

  const handleRentalFilterChange = (field: keyof RentalFilters, value: string) =>
    setRentalFilters((prev) => ({ ...prev, [field]: value }));

  const clearAll = () => {
    navigate(`/${lang ?? 'id'}/explore`);
    setSelectedCategory(1);
    setSelectedSubCategory(null);
    setSortBy(null);
    setRentalFilters(INITIAL_RENTAL_FILTERS);
    setTransferFilters(INITIAL_TRANSFER_FILTERS);
    setStayFilters(INITIAL_STAY_FILTERS);
  };

  const isCarCategory      = selectedCategory === 3 || selectedCategory === 4;
  const isTransferCategory = selectedCategory === 4;
  const isStayCategory     = selectedCategory === 2;

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const query       = searchQuery.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(query) || (p.location || '').toLowerCase().includes(query);

      if (selectedCategory === 3 || selectedCategory === 4) {
        if (!p.details || !isCar(p.details)) return false;
        if (selectedCategory === 3 && p.details.transportCategory !== 'Car Rental')      return false;
        if (selectedCategory === 4 && p.details.transportCategory !== 'Airport Transfer') return false;

        if (rentalFilters.transmission && p.details.transmission?.toLowerCase() !== rentalFilters.transmission.toLowerCase()) return false;
        if (rentalFilters.driverType === 'with_driver'    && !p.details.driver) return false;
        if (rentalFilters.driverType === 'without_driver' &&  p.details.driver) return false;

        const price = Number(p.price);
        if (rentalFilters.minPrice && price < Number(rentalFilters.minPrice)) return false;
        if (rentalFilters.maxPrice && price > Number(rentalFilters.maxPrice)) return false;
        if (rentalFilters.location && !(p.location || '').toLowerCase().includes(rentalFilters.location.toLowerCase())) return false;
        if (rentalFilters.passengerCapacity && p.details.seats && Number(p.details.seats) < Number(rentalFilters.passengerCapacity)) return false;

        // Filter berdasarkan airport transfer dari/ke (jika diisi)
        if (isTransferCategory && transferFilters.from) {
          const loc = (p.location || '').toLowerCase();
          if (!loc.includes(transferFilters.from.toLowerCase())) return false;
        }

        return matchSearch;
      }

      // ── Stay filters ──────────────────────────────────────────────────────
      if (selectedCategory === 2) {
        if (!isStay(p.details)) return false;

        const price = Number(p.price);
        if (stayFilters.minPrice && price < Number(stayFilters.minPrice)) return false;
        if (stayFilters.maxPrice && price > Number(stayFilters.maxPrice)) return false;

        if (stayFilters.starRatings.length > 0) {
          const pStars = (p.details as any)?.starRating || Math.round(p.rating || 4);
          if (!stayFilters.starRatings.includes(pStars)) return false;
        }

        if (stayFilters.hotelTypes.length > 0) {
          const pType = (p.details as any)?.stayCategory || '';
          if (!stayFilters.hotelTypes.some(t => pType.toLowerCase().includes(t.toLowerCase()))) return false;
        }

        if (stayFilters.areas.length > 0) {
          const pLoc = (p.location || '').toLowerCase();
          if (!stayFilters.areas.some(a => pLoc.includes(a.toLowerCase()))) return false;
        }

        if (stayFilters.facilities.length > 0) {
          const pFac: string[] = (p.details as any)?.facilities || [];
          const pFacLower = pFac.map(f => f.toLowerCase());
          if (!stayFilters.facilities.every(f => pFacLower.includes(f.toLowerCase()))) return false;
        }

        // Promotions filter (basic — check vouchers)
        if (stayFilters.promotions.includes('Free Cancellation')) {
          const vouchers = (p as any).vouchers || [];
          const hasRefund = vouchers.some((v: any) => v.type === 'free_cancellation');
          if (!hasRefund) return false;
        }

        return matchSearch;
      }

      const matchCat = selectedCategory ? Number(p.category_id) === Number(selectedCategory) : true;
      let matchSubCat = true;
      if (selectedCategory && selectedSubCategory && p.details) {
        let detailValue = '';
        if (isTour(p.details) && p.details.tourCategory)           detailValue = p.details.tourCategory.toLowerCase();
        else if (isStay(p.details) && p.details.stayCategory)      detailValue = p.details.stayCategory.toLowerCase();
        else if (isCar(p.details)  && p.details.transportCategory) detailValue = p.details.transportCategory.toLowerCase();
        matchSubCat = detailValue === selectedSubCategory.toLowerCase();
      }
      return matchCat && matchSubCat && matchSearch;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === 'price_asc')  return Number(a.price) - Number(b.price);
        if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'rating')     return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
    }
    return filtered;
  }, [products, searchQuery, selectedCategory, selectedSubCategory, sortBy, rentalFilters, transferFilters, isTransferCategory, stayFilters]);

  const carGroups = useMemo(() => {
    if (!isCarCategory) return [];
    return groupCarProducts(filteredProducts.filter((p) => isCar(p.details)));
  }, [filteredProducts, isCarCategory]);

  return {
    searchQuery, selectedCategory, selectedSubCategory, sortBy,
    rentalFilters, transferFilters, stayFilters,
    visibleCount, fromItinerary, isCarCategory, isTransferCategory, isStayCategory,
    filteredProducts, carGroups,
    setSelectedSubCategory, setSortBy, setVisibleCount,
    updateSearch, updateTransferFilters, updateStayFilters, clearStayFilters,
    handleCategorySelect, handleRentalFilterChange, clearAll,
  };
};
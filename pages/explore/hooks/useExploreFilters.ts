import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Product } from '../../../types';
import { isCar, isTour, isStay, groupCarProducts } from '../utils';
import { CATEGORY_SLUG_MAP, CATEGORY_ID_TO_SLUG } from '../constants';

export interface RentalFilters {
  transmission:      string;
  minPrice:          string;
  maxPrice:          string;
  location:          string;
  passengerCapacity: string;
  driverType:        string;
}

const INITIAL_RENTAL_FILTERS: RentalFilters = {
  transmission: '', minPrice: '', maxPrice: '', location: '', passengerCapacity: '', driverType: '',
};

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
  const [visibleCount,        setVisibleCount]        = useState(8);

  const searchQuery   = searchParams.get('search') || '';
  const fromItinerary = searchParams.get('from') === 'itinerary';

  // Sync state saat slug URL berubah (back/forward browser)
  useEffect(() => {
    if (categoryFromSlug !== null) {
      setSelectedCategory(categoryFromSlug);
    } else if (!categorySlug) {
      setSelectedCategory(categoryFromParam ?? 1);
    }
  }, [categorySlug]);

  const updateSearch = (value: string) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set('search', value) : p.delete('search');
    setSearchParams(p);
    setVisibleCount(8);
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategory(id);
    setSelectedSubCategory(null);
    setRentalFilters(INITIAL_RENTAL_FILTERS);
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
  };

  const isCarCategory = selectedCategory === 3 || selectedCategory === 4;

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const query       = searchQuery.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(query) || (p.location || '').toLowerCase().includes(query);

      if (selectedCategory === 3 || selectedCategory === 4) {
        if (!p.details || !isCar(p.details)) return false;
        if (selectedCategory === 3 && p.details.transportCategory !== 'Car Rental') return false;
        if (selectedCategory === 4 && p.details.transportCategory !== 'Airport Transfer') return false;
        if (rentalFilters.transmission && p.details.transmission?.toLowerCase() !== rentalFilters.transmission.toLowerCase()) return false;
        if (rentalFilters.driverType === 'with_driver'    && !p.details.driver) return false;
        if (rentalFilters.driverType === 'without_driver' &&  p.details.driver) return false;
        const price = Number(p.price);
        if (rentalFilters.minPrice && price < Number(rentalFilters.minPrice)) return false;
        if (rentalFilters.maxPrice && price > Number(rentalFilters.maxPrice)) return false;
        if (rentalFilters.location && !(p.location || '').toLowerCase().includes(rentalFilters.location.toLowerCase())) return false;
        if (rentalFilters.passengerCapacity && p.details.seats && Number(p.details.seats) < Number(rentalFilters.passengerCapacity)) return false;
        return matchSearch;
      }

      const matchCat = selectedCategory ? Number(p.category_id) === Number(selectedCategory) : true;
      let matchSubCat = true;
      if (selectedCategory && selectedSubCategory && p.details) {
        let detailValue = '';
        if (isTour(p.details) && p.details.tourCategory)      detailValue = p.details.tourCategory.toLowerCase();
        else if (isStay(p.details) && p.details.stayCategory) detailValue = p.details.stayCategory.toLowerCase();
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
  }, [products, searchQuery, selectedCategory, selectedSubCategory, sortBy, rentalFilters]);

  const carGroups = useMemo(() => {
    if (!isCarCategory) return [];
    return groupCarProducts(filteredProducts.filter((p) => isCar(p.details)));
  }, [filteredProducts, isCarCategory]);

  return {
    searchQuery, selectedCategory, selectedSubCategory, sortBy, rentalFilters,
    visibleCount, fromItinerary, isCarCategory,
    filteredProducts, carGroups,
    setSelectedSubCategory, setSortBy, setVisibleCount,
    updateSearch, handleCategorySelect, handleRentalFilterChange, clearAll,
  };
};
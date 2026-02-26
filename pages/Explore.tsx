import { ArrowRight, ArrowUpDown, Calendar, Heart, MapPin, Search, Star, X, Users, Gauge, Fuel, Briefcase, Droplet, UserCog, Award } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  ProductDetails 
} from '../types';
import { agentProductService } from '../services/agentProductService';
import { ShoppingCart, Car} from "lucide-react";
import { useCart } from "../components/CartContext";
import { useToast } from "../components/ToastContext";
import { useAuth } from "../AuthContext";

// Type guard functions matching ProductDetail.tsx
const isTour = (details: any): details is TourDetails => details?.type === "tour";
const isStay = (details: any): details is StayDetails => details?.type === "stay";
const isCar = (details: any): details is CarDetails => details?.type === "car";

const Explore: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCart(product.id)) return;

    addToCart(product, 1);
    showToast(`${product.name} ditambahkan ke keranjang!`, "success");
  };

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<number | null>(1);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | null>(null);
  
  // Rental Car Specific Filters
  const [rentalFilters, setRentalFilters] = useState({
    transmission: '', // 'Automatic' | 'Manual' | ''
    minPrice: '',
    maxPrice: '',
    location: '',
    passengerCapacity: '', // seats
  });

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  const searchQuery = searchParams.get('search') || '';
  const dateQuery = searchParams.get('date') || '';

  useEffect(() => {
    const categoryIdParam = searchParams.get('category_id');
    if (categoryIdParam) {
      setSelectedCategory(Number(categoryIdParam));
    }
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          agentProductService.getAllProducts(),
          agentProductService.getCategories(),
        ]);

        const BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

        const normalizedProducts = prods.map((p: Product) => ({
          ...p,
          image_url:
            p.image_url && !p.image_url.startsWith("http")
              ? `${BASE_URL}/${p.image_url}`
              : p.image_url,
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
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategory(id);
    setSelectedSubCategory(null);
    // Reset rental filters when switching categories
    setRentalFilters({
      transmission: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      passengerCapacity: '',
    });
  };

  const clearSearch = () => {
    setSearchParams({});
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSortBy(null);
    setRentalFilters({
      transmission: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      passengerCapacity: '',
    });
  };

  const handleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleRentalFilterChange = (field: string, value: string) => {
    setRentalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- SUB-CATEGORY LOGIC ---
  const getSubCategories = () => {
    if (!selectedCategory) return [];
    if (selectedCategory === 1) return Object.values(TourCategory);
    if (selectedCategory === 2) return Object.values(StayCategory);
    if (selectedCategory === 3) return Object.values(TransportCategory);
    return [];
  };

  const subCategories = getSubCategories();

  // --- FILTER DAN SORT LOGIC dengan useMemo ---
  const filteredAndSortedProducts = useMemo(() => {
    // Step 1: Filter produk
    let filtered = products.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(query) ||
        (p.location || "").toLowerCase().includes(query);
      
      // Untuk kategori Transport (3 dan 4), filter berdasarkan transportCategory
      if (selectedCategory === 3 || selectedCategory === 4) {
        // Hanya tampilkan produk yang bertipe car
        if (!p.details || !isCar(p.details)) return false;
        
        if (selectedCategory === 3) {
          // CAR RENTAL
          const isCarRental = p.details.transportCategory === "Car Rental";
          console.log('Car Rental Filter -', p.name, ':', p.details.transportCategory, '->', isCarRental);
          if (!isCarRental) return false;
        }
        
        if (selectedCategory === 4) {
          // AIRPORT TRANSFER
          const isAirportTransfer = p.details.transportCategory === "Airport Transfer";
          console.log('Airport Transfer Filter -', p.name, ':', p.details.transportCategory, '->', isAirportTransfer);
          if (!isAirportTransfer) return false;
        }
        
        // Filter tambahan untuk semua produk transport (baik Car Rental maupun Airport Transfer)
        // Filter by transmission type
        if (rentalFilters.transmission && p.details.transmission) {
          const transmissionMatch = p.details.transmission.toLowerCase() === rentalFilters.transmission.toLowerCase();
          if (!transmissionMatch) return false;
        }

        // Filter by price range
        const price = Number(p.price);
        if (rentalFilters.minPrice && price < Number(rentalFilters.minPrice)) return false;
        if (rentalFilters.maxPrice && price > Number(rentalFilters.maxPrice)) return false;

        // Filter by location (using p.location)
        if (rentalFilters.location) {
          const locationMatch = (p.location || '').toLowerCase().includes(rentalFilters.location.toLowerCase());
          if (!locationMatch) return false;
        }

        // Filter by passenger capacity (seats)
        if (rentalFilters.passengerCapacity && p.details.seats) {
          const capacity = Number(p.details.seats);
          const requestedCapacity = Number(rentalFilters.passengerCapacity);
          if (capacity < requestedCapacity) return false;
        }
        
        // Jika sudah lolos semua filter, return matchSearch
        return matchSearch;
      }
      
      // Untuk kategori non-transport (1,2,5), gunakan filter berdasarkan category_id
      const matchCat = selectedCategory ? Number(p.category_id) === Number(selectedCategory) : true;
      
      // SubCategory match for Travel and Stay
      let matchSubCat = true;
      if (selectedCategory && selectedSubCategory && p.details) {
        let detailValue = '';
        
        if (isTour(p.details) && p.details.tourCategory) {
          detailValue = p.details.tourCategory.toLowerCase();
        } else if (isStay(p.details) && p.details.stayCategory) {
          detailValue = p.details.stayCategory.toLowerCase();
        } else if (isCar(p.details) && p.details.transportCategory) {
          detailValue = p.details.transportCategory.toLowerCase();
        }
        
        matchSubCat = detailValue === selectedSubCategory.toLowerCase();
      }

      return matchCat && matchSubCat && matchSearch;
    });

    // Step 2: Sort produk berdasarkan sortBy
    if (sortBy) {
      filtered.sort((a, b) => {
        const priceA = Number(a.price);
        const priceB = Number(b.price);
        
        switch (sortBy) {
          case 'price_asc':
            return priceA - priceB;
          case 'price_desc':
            return priceB - priceA;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });
    }

    // Log hasil filtering
    console.log(`Selected Category: ${selectedCategory}`);
    console.log('Filtered products:', filtered.map(p => ({
      name: p.name,
      category_id: p.category_id,
      transportCategory: p.details && isCar(p.details) ? p.details.transportCategory : 'N/A'
    })));

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedSubCategory, sortBy, rentalFilters]);

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
      <div className="aspect-[4/3] bg-gray-200"></div>
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-50">
          <div>
            <div className="h-3 bg-gray-200 rounded w-10 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  // Rental Car Card Component (1 column layout)
  const RentalCarCard = ({ product }: { product: Product }) => {
    const isSaved = isInWishlist(product.id);
    const details = product.details as CarDetails;

    return (
      <Link
        to={`/product/${product.id}`}
        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col md:flex-row relative w-full"
      >
        {/* Image Section - 1/3 width on desktop */}
        <div className="md:w-1/3 relative overflow-hidden">
          <div className="aspect-[4/3] md:aspect-auto md:h-full">
            <img
              src={getImageUrl(product.image_url || product.image)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
          </div>

          {/* Wishlist Button */}
          {isLoggedIn && (
            <button
              onClick={(e) => handleWishlist(e, product)}
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-400 group-hover/btn:text-red-500'
                }`}
              />
            </button>
          )}

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
            <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />
            {product.rating}
          </div>
        </div>

        {/* Content Section - 2/3 width on desktop */}
        <div className="md:w-2/3 p-6 flex flex-col">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-serif font-bold text-2xl text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {product.location}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {product.currency} {Number(product.price).toLocaleString('id-ID')}
                <span className="text-sm font-medium text-gray-500 ml-1">/day</span>
              </p>
            </div>
          </div>

          {/* Car Specifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Transmission */}
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Gauge className="w-5 h-5 text-primary-600 mx-auto mb-2" />
              <div className="text-xs text-gray-500">Transmission</div>
              <div className="font-semibold text-sm">
                {details.transmission === 'Automatic' ? 'Matic' : 'Manual'}
              </div>
            </div>

            {/* Seats */}
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-primary-600 mx-auto mb-2" />
              <div className="text-xs text-gray-500">Seats</div>
              <div className="font-semibold text-sm">{details.seats} Passengers</div>
            </div>

            {/* Year */}
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Award className="w-5 h-5 text-primary-600 mx-auto mb-2" />
              <div className="text-xs text-gray-500">Year</div>
              <div className="font-semibold text-sm">{details.year || '-'}</div>
            </div>

            {/* Fuel Policy */}
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Droplet className="w-5 h-5 text-primary-600 mx-auto mb-2" />
              <div className="text-xs text-gray-500">Fuel Policy</div>
              <div className="font-semibold text-sm">{details.fuelPolicy || 'Standard'}</div>
            </div>
          </div>

        {/* Additional Features */}
        <div className="flex flex-wrap gap-3 mb-6">
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
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
              details.transportCategory === 'Airport Transfer' 
                ? 'bg-green-50' 
                : 'bg-primary-50'
            }`}>
              <Car className={`w-4 h-4 ${
                details.transportCategory === 'Airport Transfer' 
                  ? 'text-green-600' 
                  : 'text-primary-600'
              }`} />
              <span className={`text-xs font-medium ${
                details.transportCategory === 'Airport Transfer' 
                  ? 'text-green-700' 
                  : 'text-primary-700'
              }`}>
                {details.transportCategory}
              </span>
            </div>
          )}
        </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
            {/* See Details — always visible */}
            <Link
              to={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center"
            >
              See Details
            </Link>

            {/* Add To Cart — tersedia untuk user login maupun guest */}
            <button
              onClick={(e) => handleAddToCart(e, product)}
              disabled={isInCart(product.id)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border-2 transform active:scale-[0.98]
                ${
                  isInCart(product.id)
                    ? "border-green-500 text-green-600 bg-green-50 cursor-default"
                    : "border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md"
                }`}
            >
              <ShoppingCart
                className={`w-4 h-4 ${isInCart(product.id) ? "stroke-green-600" : ""}`}
              />
              {isInCart(product.id) ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </Link>
    );
  };

  // Regular Card Component (multiple columns)
  const RegularCard = ({ product }: { product: Product }) => {
    const isSaved = isInWishlist(product.id);
    const details = product.details;

    return (
      <Link
        to={`/product/${product.id}`}
        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative"
      >
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={getImageUrl(product.image_url || product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />

          {/* Wishlist Button */}
          {isLoggedIn && (
            <button
              onClick={(e) => handleWishlist(e, product)}
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-400 group-hover/btn:text-red-500'
                }`}
              />
            </button>
          )}

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
            <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />
            {product.rating}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Package Name */}
          <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Location */}
          {product.location && (
            <p className="text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {product.location}
            </p>
          )}

          {/* Price */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">From</p>
            <p className="text-lg font-bold text-gray-900">
              {product.currency} {Number(product.price).toLocaleString('id-ID')} 
              <span className="text-sm font-medium text-gray-500"> /pax-*</span>
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              {/* See Details */}
              <Link
                to={`/product/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className={`border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center
                  ${isLoggedIn ? 'flex-1' : 'w-full'}`}
              >
                See Details
              </Link>

              {/* Add To Cart */}
              <button
                onClick={(e) => handleAddToCart(e, product)}
                disabled={isInCart(product.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border transform active:scale-[0.98]
                  ${
                    isInCart(product.id)
                      ? "border-green-500 text-green-600 bg-green-50 cursor-default"
                      : "border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md"
                  }`}
              >
                <ShoppingCart
                  className={`w-4 h-4 ${isInCart(product.id) ? "stroke-green-600" : ""}`}
                />
                {isInCart(product.id) ? "Added" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            Explore the World
          </h1>
          <p className="text-gray-500">Discover unique experiences and hidden gems.</p>
        </div>

        {/* Search and Filter Container */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 mb-12">
          <div className="flex flex-col gap-8">

            {/* MAIN SERVICE FILTER BUTTONS */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {[
                { label: "Travel", id: 1 },
                { label: "Hotel & Villa", id: 2 },
                { label: "Car Rental", id: 3 },
                { label: "Airport Transfer", id: 4 },
                { label: "Event", id: 5 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleCategorySelect(item.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
                    ${
                      selectedCategory === item.id
                        ? "bg-gray-900 text-white border-gray-900 shadow-md"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* SEARCH + DROPDOWN FILTER */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* SEARCH */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={selectedCategory === 3 ? "Search rental location..." : "Search destination or package..."}
                  value={searchQuery}
                  onChange={(e) => updateSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium"
                />
                {searchQuery && (
                  <button onClick={() => updateSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* TRIP TYPE */}
              {selectedCategory === 1 && (
                <div className="relative w-full lg:w-56 animate-in fade-in slide-in-from-top-2 duration-300">
                  <select
                    value={selectedSubCategory || ""}
                    onChange={(e) => setSelectedSubCategory(e.target.value || null)}
                    className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="">Trip Type</option>
                    <option value="Open Trip">Open Trip</option>
                    <option value="Private Trip">Private Trip</option>
                    <option value="Group Trip">Group Trip</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}

              {/* SORT PRICE */}
              <div className="relative w-full lg:w-56">
                <select
                  value={sortBy || ""}
                  onChange={(e) => setSortBy(e.target.value as 'price_asc' | 'price_desc' | 'rating' | null)}
                  className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="">Sort by</option>
                  <option value="price_asc">Lowest Price</option>
                  <option value="price_desc">Highest Price</option>
                  <option value="rating">Highest Rating</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* RENTAL CAR SPECIFIC FILTERS - Tampil untuk Car Rental (3) dan Airport Transfer (4) */}
            {(selectedCategory === 3 || selectedCategory === 4) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Transmission Type */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Gauge className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={rentalFilters.transmission}
                    onChange={(e) => handleRentalFilterChange('transmission', e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer appearance-none"
                  >
                    <option value="">Transmission Type</option>
                    <option value="Automatic">Matic</option>
                    <option value="Manual">Manual</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Passenger Capacity */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={rentalFilters.passengerCapacity}
                    onChange={(e) => handleRentalFilterChange('passengerCapacity', e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer appearance-none"
                  >
                    <option value="">Passenger Capacity</option>
                    <option value="2">2 Passengers</option>
                    <option value="4">4 Passengers</option>
                    <option value="6">6 Passengers</option>
                    <option value="8">8+ Passengers</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Min Price */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-medium">Rp</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={rentalFilters.minPrice}
                    onChange={(e) => handleRentalFilterChange('minPrice', e.target.value)}
                    min="0"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Max Price */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-medium">Rp</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={rentalFilters.maxPrice}
                    onChange={(e) => handleRentalFilterChange('maxPrice', e.target.value)}
                    min="0"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* EXPERIENCE TAG FILTER */}
            {(selectedCategory === 1 || selectedCategory === 2) && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 animate-in fade-in slide-in-from-left-4 duration-500">
                <button
                  onClick={() => setSelectedSubCategory(null)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
                    ${selectedSubCategory === null
                      ? "bg-primary-600 text-white border-primary-600 shadow-md"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600"
                    }`}
                >
                  Semua
                </button>

                {(selectedCategory === 1 
                  ? [
                      "Family", "Honeymoon", "Solo Travel", "Healing", 
                      "Workation", "Adventure", "Cultural", "Culinary", "Eco Tourism"
                    ]
                  : ["Hotel", "Villa", "Homestay", "Resort"]
                ).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedSubCategory(tag)}
                    className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
                      ${selectedSubCategory === tag
                        ? "bg-primary-600 text-white border-primary-600 shadow-md"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600"
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Grid - Dynamic based on category */}
        <div className={selectedCategory === 3 || selectedCategory === 4 ? "flex flex-col gap-6" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-5"}>
          {isLoading ? (
            selectedCategory === 3 || selectedCategory === 4 ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                  <div className="md:flex">
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-200"></div>
                    <div className="md:w-2/3 p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            )
          ) : (
            filteredAndSortedProducts.map((product) => {
              // Gunakan RentalCarCard untuk semua produk mobil (baik Car Rental maupun Airport Transfer)
              if ((selectedCategory === 3 || selectedCategory === 4) && isCar(product.details)) {
                return <RentalCarCard key={product.id} product={product} />;
              } else {
                return <RegularCard key={product.id} product={product} />;
              }
            })
          )}
        </div>

        {!isLoading && filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">No results found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
              We couldn't find any {selectedCategory === 3 ? 'rental cars' : 'items'}{' '}
              matching your search.
            </p>
            <button
              onClick={clearSearch}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
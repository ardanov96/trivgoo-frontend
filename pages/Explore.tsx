import { ArrowRight, ArrowUpDown, Calendar, Heart, MapPin, Search, Star, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// import { mockService } from '../services/mockService';
import { useWishlist } from '../components/WishlistContext';
import { Category, Product, StayCategory, TourCategory, TransportCategory } from '../types';

const Explore: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | null>(null);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  const searchQuery = searchParams.get('search') || '';
  const dateQuery = searchParams.get('date') || '';

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      // const [prods, cats] = await Promise.all([
      //   mockService.getProducts(),
      //   mockService.getCategories(),
      // ]);
      // setProducts(prods);
      // setCategories(cats);

      // Auto-select category if passed in params (optional enhancement)
      // const catParam = searchParams.get('category');
      // if (catParam) {
      //   const foundCat = cats.find((c) => c.slug === catParam);
      //   if (foundCat) setSelectedCategory(foundCat.id);
      // }

      setIsLoading(false);
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
    setSelectedSubCategory(null); // Reset sub-category when main category changes
  };

  const clearSearch = () => {
    setSearchParams({});
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSortBy(null);
  };

  const handleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  // --- SUB-CATEGORY LOGIC ---
  const getSubCategories = () => {
    if (!selectedCategory) return [];

    // ID 1 = Tours, 2 = Stays, 4 = Transport (Based on mockService data)
    if (selectedCategory === 1) return Object.values(TourCategory);
    if (selectedCategory === 2) return Object.values(StayCategory);
    if (selectedCategory === 4) return Object.values(TransportCategory);

    return [];
  };

  const subCategories = getSubCategories();

  // --- MAIN FILTER LOGIC ---
  const filteredProducts = products
    .filter((p) => {
      // 1. Main Category Filter
      // const matchCat = selectedCategory ? p.categoryId === selectedCategory : true;

      // 2. Sub Category Filter (Deep Filtering)
      let matchSubCat = true;
      if (selectedCategory && selectedSubCategory && p.details) {
        if (selectedCategory === 1 && p.details.type === 'tour') {
          matchSubCat = p.details.tourCategory === selectedSubCategory;
        } else if (selectedCategory === 2 && p.details.type === 'stay') {
          matchSubCat = p.details.stayCategory === selectedSubCategory;
        } else if (selectedCategory === 4 && p.details.type === 'car') {
          matchSubCat = p.details.transportCategory === selectedSubCategory;
        }
      }

      // 3. Search Query
      const query = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(query) || p.location.toLowerCase().includes(query);

      // 4. Availability Filter
      // let isAvailable = true;
      // if (dateQuery && p.blockedDates) {
      //   if (p.blockedDates.includes(dateQuery)) {
      //     isAvailable = false;
      //   }
      // }
      // if (p.isActive === false) isAvailable = false;

      // return matchCat && matchSubCat && matchSearch && isAvailable;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

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
        <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
          <div>
            <div className="h-3 bg-gray-200 rounded w-10 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            Explore the World
          </h1>
          <p className="text-gray-500">Discover unique experiences and hidden gems.</p>
        </div>

        {/* Search and Filter Container - REMOVED STICKY */}
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-soft border border-gray-100 mb-10 relative">
          <div className="flex flex-col gap-6">
            {/* Top Row: Search & Sort */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search destinations, tours, or activities..."
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => updateSearch(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => updateSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Advanced Filter Toggle */}
              <div className="flex gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <select
                    className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                    value={sortBy || ''}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="">Sort By</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Active Date Badge */}
              {dateQuery && (
                <div className="inline-flex items-center px-4 py-3 bg-primary-50 text-primary-700 rounded-xl border border-primary-100 whitespace-nowrap shadow-sm animate-in fade-in self-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm font-bold">Date: {dateQuery}</span>
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('date');
                      setSearchParams(newParams);
                    }}
                    className="ml-3 p-0.5 hover:bg-primary-100 rounded-full text-primary-500 hover:text-primary-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* MAIN CATEGORIES */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Categories
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                      !selectedCategory
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  {isLoading
                    ? [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-24 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
                        ></div>
                      ))
                    : categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                            selectedCategory === cat.id
                              ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                </div>
              </div>

              {/* SUB CATEGORIES - Only visible when a main category is selected */}
              {selectedCategory && subCategories.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                    Type of Experience
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
                    <button
                      onClick={() => setSelectedSubCategory(null)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                        !selectedSubCategory
                          ? 'bg-primary-100 text-primary-700 border-primary-200'
                          : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      All {categories.find((c) => c.id === selectedCategory)?.name}
                    </button>
                    {subCategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                          selectedSubCategory === sub
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading
            ? // Show 8 Skeletons
              [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            : filteredProducts.map((product) => {
                const isSaved = isInWishlist(product.id);
                // Get sub-category label for display card
                let subLabel = '';
                if (product.details?.type === 'tour') subLabel = product.details.tourCategory;
                if (product.details?.type === 'stay') subLabel = product.details.stayCategory;
                if (product.details?.type === 'car') subLabel = product.details.transportCategory;

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative"
                  >
                    {/* Unavailable Overlay */}
                    {/* {(!product.isActive ||
                      (dateQuery && product.blockedDates?.includes(dateQuery))) && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl">
                          Unavailable
                        </div>
                      </div>
                    )} */}

                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => handleWishlist(e, product)}
                        className={`absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90`}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isSaved
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-400 group-hover/btn:text-red-500'
                          }`}
                        />
                      </button>

                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
                        <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />
                        {product.rating}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center text-primary-600 text-xs font-bold uppercase tracking-wide">
                          <MapPin className="w-3.5 h-3.5 mr-1.5" />
                          {product.location}
                        </div>
                        {subLabel && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase">
                            {subLabel}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-xl text-gray-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">
                            From
                          </span>
                          <p className="text-xl font-bold text-gray-900">
                            {product.currency} {product.price}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">No results found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
              We couldn't find any {selectedSubCategory || ''}{' '}
              {categories.find((c) => c.id === selectedCategory)?.name.toLowerCase() || 'items'}{' '}
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

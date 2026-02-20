import { ArrowRight, ArrowUpDown, Calendar, Heart, MapPin, Search, Star, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWishlist } from '../components/WishlistContext';
import { Category, Product, StayCategory, TourCategory, TransportCategory } from '../types';
import { mockService } from '@/services/mockService';
import { agentProductService } from '../services/agentProductService';
import { ShoppingCart } from "lucide-react";
import { useCart } from "../components/CartContext";
import { useToast } from "../components/ToastContext";
import { useAuth } from "../AuthContext"; // ← tambah import

const Explore: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();           // ← ambil user session
  const isLoggedIn = !!user;            // ← true jika sudah login

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCart(product.id)) return;

    addToCart(product, 1);
    showToast(`${product.name} ditambahkan ke keranjang!`, "success");
  };

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
      try {
        const [prods, cats] = await Promise.all([
          agentProductService.getAllProducts(),
          agentProductService.getCategories(),
        ]);
        setProducts(prods);
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
    if (selectedCategory === 1) return Object.values(TourCategory);
    if (selectedCategory === 2) return Object.values(StayCategory);
    if (selectedCategory === 4) return Object.values(TransportCategory);
    return [];
  };

  const subCategories = getSubCategories();

  // --- MAIN FILTER LOGIC ---
  const filteredProducts = products
    .filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(query) ||
        (p.location || "").toLowerCase().includes(query);
      const matchCat = selectedCategory ? Number(p.category_id) === Number(selectedCategory) : true;
      let matchSubCat = true;
      if (selectedCategory && selectedSubCategory && p.details) {
        const detailsValues = Object.values(p.details).map(v => String(v).toLowerCase());
        matchSubCat = detailsValues.includes(selectedSubCategory.toLowerCase());
      }
      return matchCat && matchSubCat && matchSearch;
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
                { label: "Rental Mobil", id: 4 },
                { label: "Jemput Bandara", id: 4 },
                { label: "Event", id: 3 },
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
                  placeholder="Search destination or package..."
                  value={searchQuery}
                  onChange={(e) => updateSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => updateSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* TRIP TYPE */}
              <div className="relative w-full lg:w-56">
                <select
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

              {/* SORT PRICE */}
              <div className="relative w-full lg:w-56">
                <select
                  value={sortBy || ""}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="">Sort by Price</option>
                  <option value="price_asc">Lowest Price</option>
                  <option value="price_desc">Highest Price</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* EXPERIENCE TAG FILTER */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {[
                "Semua", "Keluarga", "Honeymoon", "Transport",
                "Solo Travel", "Healing", "Workation", "Adventure",
                "Cultural", "Culinary", "Eco Tourism",
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedSubCategory(tag === "Semua" ? null : tag)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
                    ${
                      selectedSubCategory === tag
                        ? "bg-primary-600 text-white border-primary-600 shadow-md"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-5">
          {isLoading
            ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            : filteredProducts.map((product) => {
                const isSaved = isInWishlist(product.id);

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={product.image_url || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Wishlist Button — hanya tampil jika login */}
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

                      {/* Date */}
                      <p className="text-sm text-gray-500 font-medium mb-2">
                        {dateQuery ? dateQuery : "Available Daily"}
                      </p>

                      {/* Price */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">From</p>
                        <p className="text-lg font-bold text-gray-900">
                          {product.currency} {product.price}
                          <span className="text-sm font-medium text-gray-500"> /pax-*</span>
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 mt-4">

                          {/* See Details — selalu tampil */}
                          <Link
                            to={`/product/${product.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center
                              ${isLoggedIn ? 'flex-1' : 'w-full'}`}
                          >
                            See Details
                          </Link>

                          {/* Add To Cart — hanya tampil jika login */}
                          {isLoggedIn && (
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
                          )}

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

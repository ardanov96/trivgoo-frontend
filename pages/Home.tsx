import {
  ArrowRight,
  Brain,
  Building2,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Map,
  MapPin,
  Palmtree,
  Plane,
  Quote,
  Search,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { mockService } from '../services/mockService';
import { Category, FlashSaleCampaign, Product } from '../types';

const POPULAR_DESTINATIONS = [
  'Bali, Indonesia',
  'Kyoto, Japan',
  'Santorini, Greece',
  'Paris, France',
  'Raja Ampat, Indonesia',
  'Swiss Alps, Switzerland',
  'Tokyo, Japan',
  'Rome, Italy',
  'New York, USA',
];

const DESTINATION_STORIES = [
  {
    name: 'Bali',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Japan',
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Paris',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Swiss',
    image:
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Italy',
    image:
      'https://images.unsplash.com/photo-1529260830199-42c42dda5f30?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Greece',
    image:
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'New York',
    image:
      'https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'London',
    image:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=300&q=80',
  },
];

const REVIEWS = [
  {
    id: 1,
    user: 'Sarah Jenkins',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    text: 'The trip to Bali was absolutely magical. The guide knew all the hidden spots away from the crowds. Best vacation ever!',
    location: 'Ubud, Bali',
    tripImage:
      'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    user: 'Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    text: 'Our honeymoon in Santorini was handled perfectly by Trivgoo. From the private villa to the sunset dinner, everything was seamless.',
    location: 'Oia, Santorini',
    tripImage:
      'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    user: 'Emma Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4.8,
    text: 'I was nervous traveling solo to Japan, but the itinerary was so well planned. I felt safe and had the adventure of a lifetime.',
    location: 'Kyoto, Japan',
    tripImage:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
  },
];

const SEARCH_CATEGORIES = [
  { id: 'tours', label: 'Wisata', icon: Palmtree, placeholder: 'Where do you want to go?' },
  {
    id: 'stays',
    label: 'Hotel & Villa',
    icon: Building2,
    placeholder: 'City, hotel, or destination',
  },
  { id: 'cars', label: 'Rental Mobil', icon: Car, placeholder: 'Pick-up location' },
  { id: 'transfers', label: 'Jemput Bandara', icon: Plane, placeholder: 'Airport or Hotel' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  // Categories state kept if needed for other parts, but removed from main display
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);

  // Campaign State
  const [activeCampaign, setActiveCampaign] = useState<FlashSaleCampaign | null>(null);

  // Search State
  const [searchCategory, setSearchCategory] = useState('tours');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>(POPULAR_DESTINATIONS);
  const searchRef = useRef<HTMLDivElement>(null);

  // Date Picker State
  const [searchDate, setSearchDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Typewriter State
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const typingWords = ['Paradise', 'Adventure', 'Serenity', 'Escape'];

  // Countdown State
  const [expiryTime, setExpiryTime] = useState(24 * 60 * 60);

  // Flash Sale Slider Ref
  const flashSaleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      // const cats = await mockService.getCategories();
      // const prods = await mockService.getProducts();
      // const campaigns = await mockService.getCampaigns();
      // setCategories(cats);
      // setFeaturedProducts(prods.slice(0, 3));
      // 1. Determine Active Campaign
      // const today = new Date().toISOString().split('T')[0];
      // const currentCampaign = campaigns.find(
      //   (c) => c.isActive && c.startDate <= today && c.endDate >= today,
      // );
      // setActiveCampaign(currentCampaign || null);
      // 2. Filter for products that have an active flash sale
      // let flashSales = prods.filter((p) => p.flashSale && p.flashSale.status === 'approved');
      // 3. If Campaign Active, Sort Campaign Products to First
      // if (currentCampaign) {
      //   flashSales = flashSales.sort((a, b) => {
      //     const aInCampaign = a.flashSale?.campaignId === currentCampaign.id ? 1 : 0;
      //     const bInCampaign = b.flashSale?.campaignId === currentCampaign.id ? 1 : 0;
      //     return bInCampaign - aInCampaign; // Descending (1 comes first)
      //   });
      // }
      // setFlashSaleProducts(flashSales);
    };
    fetchData();

    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const type = () => {
      const currentWord = typingWords[wordIndex % typingWords.length];
      const isFullWord = !isDeleting && typewriterText === currentWord;
      const isWordDeleted = isDeleting && typewriterText === '';

      if (isFullWord) {
        setTimeout(() => setIsDeleting(true), 2000);
        return;
      }

      if (isWordDeleted) {
        setIsDeleting(false);
        setWordIndex((prev: number) => prev + 1);
        return;
      }

      const nextText = isDeleting
        ? currentWord.substring(0, typewriterText.length - 1)
        : currentWord.substring(0, typewriterText.length + 1);

      setTypewriterText(nextText);
    };

    const speed = isDeleting ? 50 : 100;
    const timer = setTimeout(type, speed);

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, wordIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setExpiryTime((prev: number) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeParts = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
    };
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const filtered = POPULAR_DESTINATIONS.filter((dest) =>
        dest.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredDestinations(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredDestinations(POPULAR_DESTINATIONS);
    }
  };

  const handleDestinationSelect = (destination: string) => {
    setSearchQuery(destination);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (searchDate) params.append('date', searchDate);
    if (searchCategory) params.append('category', searchCategory);
    navigate(`/explore?${params.toString()}`);
  };

  const goToExplore = (dest: string) => {
    navigate(`/explore?search=${dest}`);
  };

  const scrollFlashSale = (direction: 'left' | 'right') => {
    if (flashSaleRef.current) {
      const scrollAmount = 350; // Card width + gap
      const newScrollPosition =
        flashSaleRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      flashSaleRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    setSearchDate(`${year}-${month}-${dayStr}`);
    setIsDatePickerOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setPickerDate(today);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const dayStr = String(today.getDate()).padStart(2, '0');
    setSearchDate(`${year}-${month}-${dayStr}`);
    setIsDatePickerOpen(false);
  };

  const handleClear = () => {
    setSearchDate('');
    setIsDatePickerOpen(false);
  };

  const renderCalendarGrid = () => {
    const year = pickerDate.getFullYear();
    const month = pickerDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
        2,
        '0',
      )}`;
      const isSelected = searchDate === dateStr;
      days.push(
        <button
          key={day}
          onClick={(e: { preventDefault: () => void }) => {
            e.preventDefault();
            handleDateClick(day);
          }}
          className={`h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors
            ${
              isSelected ? 'bg-primary-600 text-white font-bold' : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          {day}
        </button>,
      );
    }
    return days;
  };

  const timeParts = getTimeParts(expiryTime);

  // Helper to get active category config
  const activeCategoryConfig =
    SEARCH_CATEGORIES.find((c) => c.id === searchCategory) || SEARCH_CATEGORIES[0];

  return (
    <div>
      {/* Immersive Hero Section */}
      <div className="relative min-h-[100dvh] md:h-[90vh] flex items-center justify-center px-4 pt-28 md:pt-0 pb-12">
        {/* Background Image - Isolated z-0 and overflow handling */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
            alt="Tropical Paradise"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/20 to-gray-900/70"></div>
        </div>

        {/* Hero Content - z-20 to sit above background but below search popup */}
        <div className="relative z-20 w-full max-w-7xl mx-auto text-center px-4">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] md:text-xs font-bold tracking-[0.2em] mb-6 md:mb-8 border border-white/20 uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">
            The World Awaits
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
            Find Your <br className="md:hidden" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white">
              {typewriterText}
            </span>
            <span className="animate-pulse text-teal-200">|</span>
          </h1>
          <p className="mt-4 md:mt-6 max-w-2xl text-base md:text-xl text-gray-100 mx-auto font-light leading-relaxed mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-2">
            Curated tours, luxury villas, and unforgettable experiences designed just for you.
          </p>

          {/* SEARCH WIDGET CONTAINER - VERY HIGH Z-INDEX to prevent clipping */}
          <div className="w-full max-w-4xl mx-auto relative z-[60] animate-in zoom-in duration-500 delay-300">
            {/* Category Tabs - Mobile Flex Wrap Fix */}
            <div className="flex justify-center mb-4 md:mb-6 px-4 md:px-0">
              <div className="bg-gray-900/40 backdrop-blur-md p-1.5 rounded-3xl flex flex-wrap justify-center gap-1 border border-white/10 w-full md:w-auto">
                {SEARCH_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isActive = searchCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSearchCategory(category.id)}
                      className={`flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap mb-1 md:mb-0
                           ${
                             isActive
                               ? 'bg-white text-primary-700 shadow-lg scale-105'
                               : 'text-white/80 hover:bg-white/10 hover:text-white'
                           }`}
                    >
                      <Icon
                        className={`w-4 h-4 mr-2 ${
                          isActive ? 'text-primary-600' : 'text-white/80'
                        }`}
                      />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Search Input Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch md:items-center border border-white/40 divide-y divide-gray-100 md:divide-y-0 relative pr-0 md:pr-16"
            >
              {/* Destination Input */}
              <div
                className="flex-1 flex items-center md:border-r md:border-gray-200 p-4 md:p-3 md:pl-8 relative"
                ref={searchRef}
              >
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0 transition-all duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-left w-full relative">
                  <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {searchCategory === 'cars'
                      ? 'Pick-up Location'
                      : searchCategory === 'transfers'
                      ? 'From/To'
                      : 'Destination'}
                  </label>
                  <input
                    type="text"
                    placeholder={activeCategoryConfig.placeholder}
                    className="w-full text-base text-gray-800 font-medium focus:outline-none placeholder-gray-400 bg-transparent"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 mt-4 w-full md:w-80 bg-white rounded-2xl shadow-2xl py-2 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2 z-[70]">
                    <div className="absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100"></div>
                    <div className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                      {searchQuery ? 'Suggestions' : 'Popular Destinations'}
                    </div>
                    {filteredDestinations.length > 0 ? (
                      <ul className="max-h-64 overflow-y-auto">
                        {filteredDestinations.map((dest: string, index: any) => (
                          <li key={index}>
                            <button
                              type="button"
                              onClick={() => handleDestinationSelect(dest)}
                              className="w-full text-left px-5 py-3 flex items-center hover:bg-gray-50 transition-colors border border-gray-50 last:border-0"
                            >
                              <div className="p-2 bg-primary-50 rounded-lg mr-3 text-primary-600">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <span className="text-sm text-gray-700 font-medium">{dest}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-5 py-4 text-sm text-gray-500 text-center">
                        No destinations found.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Custom Date Picker */}
              <div
                className="flex-1 flex items-center md:border-r md:border-gray-200 p-4 md:p-3 md:px-6 relative"
                ref={datePickerRef}
              >
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0 transition-all duration-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div
                  className="text-left w-full cursor-pointer"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                >
                  <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 cursor-pointer">
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="Add dates"
                    className="w-full text-base text-gray-800 font-medium focus:outline-none placeholder-gray-400 cursor-pointer bg-transparent"
                    value={searchDate}
                    readOnly
                  />
                </div>

                {/* Styled Calendar Popup - High Z-Index & Absolute Positioning */}
                {isDatePickerOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-2xl p-6 w-[280px] md:w-[320px] z-[70] animate-in fade-in slide-in-from-top-2 border border-gray-100 ring-1 ring-black/5">
                    {/* Arrow pointing up */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <h3 className="text-lg font-serif font-bold text-gray-900">
                        {months[pickerDate.getMonth()]} {pickerDate.getFullYear()}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={handlePrevMonth}
                          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextMonth}
                          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 mb-3 text-center">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-wide"
                        >
                          {day}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 place-items-center mb-6">
                      {renderCalendarGrid()}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <button
                        onClick={(e: { preventDefault: () => void }) => {
                          e.preventDefault();
                          handleClear();
                        }}
                        className="text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-gray-800 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={(e: { preventDefault: () => void }) => {
                          e.preventDefault();
                          handleToday();
                        }}
                        className="text-xs font-bold uppercase tracking-wide text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Guests Input */}
              <div className="flex-1 flex items-center p-4 md:p-3 md:px-6">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0 transition-all duration-300">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left w-full">
                  <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {searchCategory === 'cars' || searchCategory === 'transfers'
                      ? 'Passengers'
                      : 'Guests'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder={`Add ${
                      searchCategory === 'cars' || searchCategory === 'transfers'
                        ? 'passengers'
                        : 'guests'
                    }`}
                    className="w-full text-base text-gray-800 font-medium focus:outline-none placeholder-gray-400 bg-transparent"
                  />
                </div>
              </div>

              {/* Search Button - Fixed Positioning - Perfectly Circular and Centered */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:block z-10">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl shadow-primary-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Button (Visible only on small screens) */}
              <div className="p-4 md:hidden">
                <button
                  type="submit"
                  className="w-full bg-primary-600 active:bg-primary-700 text-white rounded-xl h-12 font-bold shadow-lg transition-transform active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Trusted By Section - Improved spacing for mobile */}
          <div className="mt-12 md:mt-12 flex items-center justify-center gap-2 text-white/90 text-sm font-medium animate-in fade-in delay-500 relative z-10 pb-8 md:pb-0">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-primary-900 bg-gray-300"
                >
                  <img
                    src={`https://randomuser.me/api/portraits/thumb/women/${i + 20}.jpg`}
                    className="w-full h-full rounded-full"
                    alt="User"
                  />
                </div>
              ))}
            </div>
            <span className="ml-2 text-xs md:text-sm">Trusted by 50,000+ travelers worldwide</span>
          </div>
        </div>
      </div>

      {/* Popular Destinations (Instagram Stories Style - Optimized) - Z-Index lower than Hero search */}
      <div className="bg-white py-8 md:py-12 border-b border-gray-100 relative z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
              Popular Destinations
            </h2>
            <Link
              to="/explore"
              className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Desktop: Centered, No Wrap. Mobile: Horizontal Scroll */}
          <div className="flex items-center justify-start md:justify-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible py-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar md:flex-nowrap">
            {DESTINATION_STORIES.map((dest, index) => (
              <div
                key={index}
                onClick={() => goToExplore(dest.name)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group transition-all"
              >
                {/* Circle Size Adjusted for single row on desktop: Mobile 70px, Tablet 80px, Desktop 96px */}
                <div className="w-[70px] h-[70px] md:w-[84px] md:h-[84px] lg:w-[100px] lg:h-[100px] rounded-full p-[2px] md:p-[3px] bg-gradient-to-tr from-amber-400 via-orange-500 to-primary-600 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 relative">
                  <div className="w-full h-full rounded-full border-[2px] md:border-[3px] border-white overflow-hidden bg-white relative z-10">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <span className="mt-3 text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors transform group-hover:translate-y-0.5 block">
                  {dest.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DYNAMIC FLASH SALE / CAMPAIGN SECTION (Theme Takeover) */}
      <div
        className={`py-16 md:py-24 overflow-hidden relative transition-colors duration-500 ${
          activeCampaign
            ? 'text-white'
            : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50'
        }`}
      >
        {/* Dynamic Background for Campaign */}
        {activeCampaign ? (
          <div className="absolute inset-0 z-0">
            <img
              src={activeCampaign.image}
              className="w-full h-full object-cover"
              alt="Campaign Background"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            {/* Decorative particles */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
          </div>
        ) : (
          <>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="mb-2 md:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse flex items-center shadow-lg ${
                    activeCampaign
                      ? 'bg-yellow-400 text-black shadow-yellow-400/30'
                      : 'bg-red-500 text-white shadow-red-500/30'
                  }`}
                >
                  {activeCampaign ? (
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  ) : (
                    <Flame className="w-3.5 h-3.5 mr-1.5 fill-white" />
                  )}
                  {activeCampaign ? 'SPECIAL EVENT' : 'FLAME HOT'}
                </div>
                <div
                  className={`flex items-center text-xs font-bold gap-1 ${
                    activeCampaign ? 'text-yellow-400' : 'text-orange-600'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="uppercase tracking-wide">High Demand</span>
                </div>
              </div>

              <h2
                className={`text-3xl md:text-5xl font-serif font-bold leading-tight text-left ${
                  activeCampaign ? 'text-white' : 'text-gray-900'
                }`}
              >
                {activeCampaign ? (
                  activeCampaign.name
                ) : (
                  <>
                    Flash Sale <br className="hidden md:block" /> Ending Soon
                  </>
                )}
              </h2>
              {activeCampaign && (
                <p className="text-gray-300 mt-2 max-w-lg">{activeCampaign.description}</p>
              )}
            </div>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-6 px-8 py-5 rounded-2xl shadow-xl justify-between md:justify-start w-full md:w-auto ${
                activeCampaign
                  ? 'bg-white/10 backdrop-blur-md border border-white/20'
                  : 'bg-white shadow-orange-100/50 border border-orange-100'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg mr-3 ${activeCampaign ? 'bg-white/20' : 'bg-red-50'}`}
                >
                  <Timer
                    className={`w-6 h-6 animate-pulse ${
                      activeCampaign ? 'text-white' : 'text-red-500'
                    }`}
                  />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-bold text-sm ${
                      activeCampaign ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Offer Ends In
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      activeCampaign ? 'text-yellow-400' : 'text-red-500'
                    }`}
                  >
                    Don't Miss Out
                  </span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div
                  className={`rounded-lg p-2 min-w-[40px] text-center ${
                    activeCampaign ? 'bg-black/50 text-white' : 'bg-gray-900 text-white'
                  }`}
                >
                  <span className="text-xl font-mono font-bold block leading-none">
                    {timeParts.h}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Hrs</span>
                </div>
                <span className={`font-bold ${activeCampaign ? 'text-white/50' : 'text-gray-300'}`}>
                  :
                </span>
                <div
                  className={`rounded-lg p-2 min-w-[40px] text-center ${
                    activeCampaign ? 'bg-black/50 text-white' : 'bg-gray-900 text-white'
                  }`}
                >
                  <span className="text-xl font-mono font-bold block leading-none">
                    {timeParts.m}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Min</span>
                </div>
                <span className={`font-bold ${activeCampaign ? 'text-white/50' : 'text-gray-300'}`}>
                  :
                </span>
                <div
                  className={`rounded-lg p-2 min-w-[40px] text-center shadow-lg ${
                    activeCampaign
                      ? 'bg-yellow-500 text-black shadow-yellow-500/30'
                      : 'bg-red-500 text-white shadow-red-500/30'
                  }`}
                >
                  <span className="text-xl font-mono font-bold block leading-none">
                    {timeParts.s}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase ${
                      activeCampaign ? 'text-black/70' : 'text-white/80'
                    }`}
                  >
                    Sec
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Container */}
          <div
            ref={flashSaleRef}
            className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollBehavior: 'smooth' }}
          >
            {flashSaleProducts.length > 0 ? (
              flashSaleProducts.map((product: Product) => {
                // Highlight product if it belongs to current campaign
                const isCampaignProduct =
                  activeCampaign && product.flashSale?.campaignId === activeCampaign.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className={`min-w-[300px] md:min-w-[350px] snap-center group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full relative cursor-pointer border border-gray-100`}
                  >
                    {isCampaignProduct && (
                      <div className="absolute top-0 left-0 w-full bg-yellow-400 text-black text-[10px] font-bold text-center py-1 z-20 uppercase tracking-widest">
                        Official Event Deal
                      </div>
                    )}

                    <div className="h-64 md:h-72 relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2 mt-4">
                        <div
                          className={`text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg z-10 tracking-wide w-fit ${
                            isCampaignProduct ? 'bg-purple-600' : 'bg-red-600'
                          }`}
                        >
                          {product.flashSale?.discountPercentage}% OFF
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-5 left-6 right-6">
                        <div className="flex justify-between items-end text-white">
                          <div>
                            <p className="text-xs font-bold text-white/90 flex items-center mb-2 uppercase tracking-wide">
                              <MapPin className="w-3.5 h-3.5 mr-1.5" /> {product.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 md:p-7 flex-1 flex flex-col justify-between relative bg-white">
                      <h3 className="text-xl font-bold leading-tight font-serif text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Progress Bar for FOMO */}
                      <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center text-xs font-bold text-red-500 animate-pulse">
                            <Flame className="w-3.5 h-3.5 mr-1 fill-red-500" />
                            Almost Sold Out!
                          </div>
                          <span className="text-xs font-bold text-gray-500">85% Sold</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isCampaignProduct
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                                : 'bg-gradient-to-r from-orange-400 to-red-600'
                            }`}
                            style={{ width: `85%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-gray-400 line-through text-sm font-medium block mb-0.5">
                            {product.currency} {product.price}
                          </span>
                          <span className="text-2xl font-bold text-red-600 tracking-tight">
                            {product.currency} {product.flashSale?.salePrice}
                          </span>
                        </div>
                        <button
                          className={`text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center ${
                            isCampaignProduct
                              ? 'bg-purple-600 shadow-purple-600/20 hover:bg-purple-700'
                              : 'bg-gray-900 shadow-gray-900/10 hover:bg-red-600 hover:shadow-red-600/30'
                          }`}
                        >
                          Grab Deal{' '}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-20 bg-white/50 rounded-3xl border border-orange-100 flex flex-col items-center justify-center">
                <div className="bg-orange-100 p-4 rounded-full mb-4">
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No Flash Sales Currently Active</h3>
                <p className="text-gray-500">Check back later for amazing deals!</p>
              </div>
            )}
          </div>

          {/* New Bottom Pagination/Navigation */}
          {flashSaleProducts.length > 0 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => scrollFlashSale('left')}
                className={`p-3 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 group ${
                  activeCampaign
                    ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => scrollFlashSale('right')}
                className={`p-3 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 group ${
                  activeCampaign
                    ? 'bg-white text-gray-900 hover:bg-white/90'
                    : 'bg-gray-900 border border-gray-900 text-white hover:bg-gray-800'
                }`}
                aria-label="Next Slide"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Smart AI Trip Planner Section - UI Colors Synchronized (Teal/Primary) */}
      <div className="bg-white py-16 md:py-24 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
        <div className="absolute -left-20 top-40 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block animate-in fade-in slide-in-from-bottom-2">
              Future of Travel
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Smart AI Trip Planner
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
              Leading AI technology that understands your preferences and creates the perfect
              itinerary according to your wishes and budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 group text-center hover:-translate-y-2">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3 ring-1 ring-gray-100">
                <Brain className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Recommendations</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                AI learns your preferences to suggest hidden gems you'll love.
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 group text-center hover:-translate-y-2">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:-rotate-3 ring-1 ring-gray-100">
                <Clock className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Time Optimization</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Maximize your holiday with efficiently planned routes and schedules.
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 group text-center hover:-translate-y-2">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3 ring-1 ring-gray-100">
                <Map className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Maps</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Visualize your journey with integrated maps and navigation.
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 group text-center hover:-translate-y-2">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:-rotate-3 ring-1 ring-gray-100">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Personalized For You</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every itinerary is unique, tailored specifically to your travel style.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/ai-planner"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-full font-bold text-lg shadow-xl shadow-primary-600/30 hover:bg-primary-700 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-600/40 group active:scale-95"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
              Try AI Planner Free
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Experiences (Grid Layout) */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                Curated Experiences
              </h2>
              <p className="text-gray-500 max-w-xl text-lg">
                Handpicked adventures that go beyond the ordinary.
              </p>
            </div>
            <Link
              to="/explore"
              className="hidden md:flex items-center text-primary-600 font-bold hover:text-primary-700 transition-colors"
            >
              View All Tours <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(
              (product: {
                id: any;
                image: any;
                name: any;
                rating: any;
                location: any;
                description: any;
                currency: any;
                price: any;
              }) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col h-full"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center text-xs font-bold text-gray-900 shadow-lg">
                      <Star className="w-3.5 h-3.5 text-amber-400 mr-1.5 fill-current" />
                      {product.rating}
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-white/90 backdrop-blur text-gray-900 px-6 py-3 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        View Details
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center text-primary-600 text-xs font-bold uppercase tracking-wide mb-3">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      {product.location}
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">
                      {product.description}
                    </p>

                    <div className="pt-6 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-bold block mb-1">
                          Starting from
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {product.currency} {product.price}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 shadow-sm"
            >
              View All Tours <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-primary-400 font-bold text-sm uppercase tracking-widest mb-3 block">
              Happy Travelers
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Stories from the Road
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-gray-800 p-8 rounded-3xl border border-gray-700 relative hover:bg-gray-750 transition-colors"
              >
                <Quote className="w-10 h-10 text-primary-900 absolute top-6 right-6 opacity-50" />
                <div className="flex items-center mb-6">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-12 h-12 rounded-full border-2 border-primary-500 mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{review.user}</h4>
                    <div className="flex text-amber-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating ? 'fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 italic mb-6 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
                  {review.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary-600 py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">
            Ready for your next adventure?
          </h2>
          <p className="text-primary-100 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of travelers who have found their perfect getaway with Trivgoo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/explore"
              className="px-10 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              Start Exploring
            </Link>
            <Link
              to="/login"
              className="px-10 py-4 bg-primary-700 text-white rounded-full font-bold text-lg border border-primary-500 hover:bg-primary-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

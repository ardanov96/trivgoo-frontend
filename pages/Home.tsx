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
  ShoppingCart,
  Heart,
  BookOpen,
  CreditCard,
  Gift,
  Award,
  Sliders,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category, FlashSaleCampaign, Product } from '../types';
import { useAuth } from '../AuthContext';
import { agentProductService } from '../services/agentProductService';
import { useCart } from '../components/CartContext';
import { useWishlist } from '../components/WishlistContext';
import { useToast } from '../components/ToastContext';
import { motion, type Variants } from 'framer-motion';
import { getImageUrl, FALLBACK_IMAGE } from '../utils/imageUtils';
import ReferralModal from '../components/ReferralModal';

const POPULAR_DESTINATIONS = [
  'Bali, Indonesia',
  'Raja Ampat, Indonesia',
  'Yogyakarta, Indonesia',
  'Padar Island, Indonesia',

  'Tokyo, Japan',
  'Seoul, South Korea',
  'Bangkok, Thailand',
  'Singapore, Singapore',
  'Kyoto, Japan',
  'Hong Kong, China',
];

const DESTINATION_STORIES = [
  {
    name: 'Bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Raja Ampat',
    image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Yogyakarta',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Padar Island',
    image: 'https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tokyo',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Seoul',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Bangkok',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Singapore',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Kyoto',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Hong Kong',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80',
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
  { id: 'cars', label: 'Car Rental', icon: Car, placeholder: 'Pick-up location' },
  { id: 'transfers', label: 'Airport Transfer', icon: Plane, placeholder: 'Airport or Hotel' },
  { id: 'events', label: 'Event', icon: Calendar, placeholder: 'Concert, festival, or event' },
];

const TRAVEL_FILTERS = ['All', 'Family', 'Honeymoon', 'Solo Travel', 'Healing', 'Workation', 'Adventure', 'Cultural', 'Culinary', 'Eco Tourism'];

// ✅ Taruh di luar component Home (level module)
const getSubCategoryValue = (details: any): string => {
  if (!details) return '';
  return (
    details.tourCategory ||
    details.stayCategory ||
    details.transportCategory ||
    ''
  ).toLowerCase();
};

const formatLocation = (location: string): string => {
  if (!location) return '';
  const parts = location.split(',').map(p => p.trim()).filter(Boolean);
  // Buang bagian yang mengandung angka (kode pos), "Indonesia", "Jawa", "DUSUN", dll
  const cleaned = parts.filter(p =>
    !/\d/.test(p) &&
    !['indonesia', 'jawa', 'java'].includes(p.toLowerCase()) &&
    !/^dusun/i.test(p) &&
    !/^rt/i.test(p) &&
    !/^rw/i.test(p) &&
    !/^jalan/i.test(p) &&
    !/^jl/i.test(p) &&
    !/^gg/i.test(p) &&
    !/^gang/i.test(p)
  );
  // Ambil maksimal 3 bagian terakhir yang tersisa
  return cleaned.slice(-3).join(', ');
};

const PROMO_BANNERS = [
  { src: '/banner/BG_Merah.png', alt: 'Promo Banner Merah' },
  { src: '/banner/Hitam.png',    alt: 'Promo Banner Hitam' },
];

const BannerSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % PROMO_BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full" style={{ aspectRatio: '1010/298' }}>
      <div className="relative w-full h-full rounded-3xl overflow-hidden">
        {PROMO_BANNERS.map((banner, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner.src}
              alt={banner.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Dot Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {PROMO_BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  // Categories state kept if needed for other parts, but removed from main display
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);

  // Login Session Visibility
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Campaign State
  const [activeCampaign, setActiveCampaign] = useState<FlashSaleCampaign | null>(null);

  // Referral Modal State
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2, 
    }
  }
};

const destContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1
    }
  }
};

const leftToRightVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8 }
  }
};

const rightToLeftVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8 }
  }
};

// Smart AI Trip Planner Morphing Variants
const aiCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: { 
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const }
  },
  hover: {
    scale: 1.06,
    y: -12,
    transition: { duration: 0.35 }
  }
} as const satisfies Record<string, object>;

const aiContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 }
  }
};

// Variants untuk destination bubble images:
const destBubbleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: {
      duration: 0.5,
      type: 'spring',
      stiffness: 200,
      damping: 15
    }
  }
};

  // Our Travel Experience 
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
  try {
    setIsLoading(true);
    const prods = await agentProductService.getAllProducts();
    console.log('✅ Total products loaded:', prods?.length, prods);

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
        console.log('✅ Normalized products:', normalizedProducts?.length, normalizedProducts[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart(product.id)) return;
    addToCart(product, 1);
    showToast(`${product.name} ditambahkan ke keranjang!`, 'success');
  };

  const filteredProducts = products
  .filter((p) => {
    if (activeFilter === 'All') return true;
    return getSubCategoryValue(p.details) === activeFilter.toLowerCase();
  })
  .slice(0, 4);

  // Car Rental (category_id === 3)
  const [visibleCars, setVisibleCars] = useState(4);
  const carProducts = products.filter((p) => p.category_id === 3);
  const visibleCarProducts = carProducts.slice(0, visibleCars);

  // Hotel & Villa (category_id === 2)
  const [visibleHotels, setVisibleHotels] = useState(4);
  const hotelProducts = products.filter((p) => p.category_id === 2);
  const visibleHotelProducts = hotelProducts.slice(0, visibleHotels);

  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="aspect-[4/3] bg-gray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  ); 

  // Inspiration Itinerary
  const ITINERARY_CARDS = [
    {
      id: 1,
      destination: 'Bali',
      title: '5D4N Bali Cultural Escape',
      duration: '5 Days 4 Nights',
      pax: 'For 2–8 pax',
      tag: 'Honeymoon',
      tagColor: 'bg-rose-100 text-rose-600',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
      activities: ['Tanah Lot Sunset', 'Ubud Rice Terrace', 'Kecak Dance', 'Spa Day'],
    },
    {
      id: 2,
      destination: 'Raja Ampat',
      title: '7D6N Raja Ampat Dive Adventure',
      duration: '7 Days 6 Nights',
      pax: 'For 4–10 pax',
      tag: 'Adventure',
      tagColor: 'bg-blue-100 text-blue-600',
      image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=600&q=80',
      activities: ['Snorkeling', 'Island Hopping', 'Kayaking', 'Night Dive'],
    },
    {
      id: 3,
      destination: 'Yogyakarta',
      title: '4D3N Jogja Heritage Trail',
      duration: '4 Days 3 Nights',
      pax: 'For 2–12 pax',
      tag: 'Cultural',
      tagColor: 'bg-amber-100 text-amber-700',
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80',
      activities: ['Borobudur', 'Prambanan', 'Batik Workshop', 'Gudeg Dinner'],
    },
    {
      id: 4,
      destination: 'Lombok',
      title: '6D5N Lombok & Gili Islands',
      duration: '6 Days 5 Nights',
      pax: 'For 2–6 pax',
      tag: 'Healing',
      tagColor: 'bg-green-100 text-green-600',
      image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80',
      activities: ['Gili Snorkel', 'Mount Rinjani View', 'Sunset Cruise', 'Beach Yoga'],
    },
    {
      id: 5,
      destination: 'Komodo',
      title: '5D4N Komodo & Pink Beach',
      duration: '5 Days 4 Nights',
      pax: 'For 4–8 pax',
      tag: 'Adventure',
      tagColor: 'bg-blue-100 text-blue-600',
      image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=600&q=80',
      activities: ['Komodo Trek', 'Pink Beach', 'Manta Ray Dive', 'Padar Viewpoint'],
    },
  ];

  const PROMO_CARDS = [
  {
    id: 'blog',
    promoImage: '/homepage-asset/card1.png',
    title: 'Check out the Trivgoo Blog',
    description: 'Follow the latest travel trends, tips, and stories and plan your next unforgettable trip.',
    buttonLabel: 'Read Now',
    buttonLink: '/travel-blog',
    bg: 'from-primary-50/50 to-rose-50/50',
    border: 'border-primary-100/50',
    iconColor: 'text-primary-600',
    buttonStyle: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/25',
    accent: 'bg-primary-500',
  },
  {
    id: 'trivpay',
    promoImage: '/homepage-asset/card2.png',
    title: 'Save on Fun with TrivPay',
    description: 'Find out how to save more when you book and leave a review',
    buttonLabel: 'How It Works',
    buttonLink: '/trivpay',
    bg: 'from-primary-50/50 to-rose-50/50',
    border: 'border-primary-100/50',
    iconColor: 'text-primary-600',
    buttonStyle: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/25',
    accent: 'bg-primary-500',
  },
  {
    id: 'referral',
    promoImage: '/homepage-asset/card3.png',
    title: 'Share Joy & Get Reward',
    description: 'Invite your friends to explore with Trivgoo and earn travel credits for every successful referral.',
    buttonLabel: 'Invite Friend',
    buttonLink: '/referral',
    bg: 'from-primary-50/50 to-rose-50/50',
    border: 'border-primary-100/50',
    iconColor: 'text-primary-600',
    buttonStyle: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/25',
    accent: 'bg-primary-500',
  },
];

  const WHY_CHOOSE_US = [
      {
        id: 'quality',
        promoImage: '/homepage-asset/whychoose1.png',
        title: 'Best Quality',
        description: 'We ensure every destination and activity meets our high standards for your comfort.',
        bg: 'from-orange-50/50 to-amber-50/50',
        border: 'border-emerald-100/50',
        iconColor: 'text-emerald-600',
        accent: 'bg-red-500',
      },
      {
        id: 'price',
        promoImage: '/homepage-asset/whychoose2.png',
        title: 'Best Price',
        description: 'Get the most competitive prices and exclusive deals for your dream vacation.',
        bg: 'from-orange-50/50 to-amber-50/50',
        border: 'border-emerald-100/50',
        iconColor: 'text-emerald-600',
        accent: 'bg-red-500',
      },
      {
        id: 'support',
        promoImage: '/homepage-asset/whychoose3.png',
        title: '24/7 Support',
        description: 'Our dedicated team is always ready to help you anytime, anywhere during your trip.',
        bg: 'from-orange-50/50 to-amber-50/50',
        border: 'border-emerald-100/50',
        iconColor: 'text-emerald-600',
        accent: 'bg-red-500',
      },
      {
        id: 'secure',
        promoImage: '/homepage-asset/whychoose4.png',
        title: 'Secure Payment',
        description: 'Your transactions are protected with the latest security technology for peace of mind.',
        bg: 'from-orange-50/50 to-amber-50/50',
        border: 'border-emerald-100/50',
        iconColor: 'text-emerald-600',
        accent: 'bg-red-500',
      },
  ];

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

  const CATEGORY_ID_MAP: Record<string, number> = {
    tours:     1,
    stays:     2,
    cars:      3,
    transfers: 4,
    events:    5,
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (searchDate) params.append('date', searchDate);

    // ✅ Kirim category_id sebagai number, bukan string id
    const categoryId = CATEGORY_ID_MAP[searchCategory];
    if (categoryId) params.append('category_id', String(categoryId));

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
      <div className="relative min-h-[100dvh] flex items-start justify-center px-4 pt-28 md:pt-24 lg:pt-28 pb-12">
        {/* Background Image - Isolated z-0 and overflow handling */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            className="w-full h-full object-cover"
            src="/videos/video-bg.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/20 to-gray-900/70"></div>
        </div>

        {/* Hero Content - z-20 to sit above background but below search popup */}
        <div className="relative z-20 w-full max-w-7xl mx-auto text-center px-4">
          <motion.h1 className="font-serif font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="block text-sm md:text-base lg:text-lg font-medium tracking-widest text-white/80 mb-2"
              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              🌟Hello Triverse, Let's
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="block text-2xl md:text-4xl lg:text-5xl opacity-90"
              style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700 }}>
              Find Your
            </motion.span>

            <motion.span
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="block text-6xl md:text-8xl lg:text-[10rem] text-outlined bg-clip-text bg-gradient-to-r from-primary-200 to-white mb-10 md:mb-14"
              style={{ 
                fontFamily: "'Vlogger', serif",
                minHeight: '1.2em',
                lineHeight: '1.2'
              }}
            >
              {typewriterText || '\u00A0'}
            </motion.span>
          </motion.h1>

          {/* SEARCH WIDGET CONTAINER - VERY HIGH Z-INDEX to prevent clipping */}
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="w-full max-w-4xl mx-auto relative z-[60]"
          >
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
          </motion.div>

          {/* Trusted By Section - Improved spacing for mobile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-12 md:mt-12 flex items-center justify-center gap-2 text-white/90 text-sm font-medium relative z-10 pb-8 md:pb-0"
          >
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
          </motion.div>
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
                            {product.currency} {Number(product.price).toLocaleString('id-ID')}
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
              <BannerSlider />
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

      {/* Our Travel Experience Section */}
      <div className="bg-white py-16 md:py-24 relative overflow-hidden">
        {/* Decorative elements tetap sama */}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header dengan Motion */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                Our Travel Experience
              </h2>
            </div>
          </motion.div>

          {/* Filter Buttons dengan Motion */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 mb-8"
          >
            {TRAVEL_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
                  ${activeFilter === filter
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600'
                  }`}
              >
                {filter}
              </button>
            ))}
          </motion.div>

          {/* Product Grid dengan Stagger Animation */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }} // Animasi mulai sedikit sebelum elemen terlihat penuh
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {isLoading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : filteredProducts.length > 0
              ? filteredProducts.map((product, index) => {
                  const isSaved = isInWishlist(product.id);
                  return (
                    <motion.div 
                      key={product.id} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative h-full"
                      >
                        {/* Product Image */}
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={getImageUrl(product.image_url || product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                          />
                          {isLoggedIn && (
                            <button
                              onClick={(e) => handleWishlist(e, product)}
                              className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90"
                            >
                              <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
                            </button>
                          )}
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
                            <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />
                            {product.rating}
                          </div>
                        </div>

                        {/* Product Content */}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                              <Link
                                to={`/product/${product.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center flex items-center justify-center"
                              >
                                See Details
                              </Link>
                              <button
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={isInCart(product.id)}
                                className={`py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border transform active:scale-[0.98]
                                  ${isInCart(product.id)
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
                    </motion.div>
                  );
                })
              : (
                <div className="col-span-full text-center py-16 text-gray-400">
                  {/* ... No packages found ... */}
                </div>
              )}
          </motion.div>
          {/* Load More - Tour */}
          {products.filter(p => activeFilter === 'All' || getSubCategoryValue(p.details) === activeFilter.toLowerCase()).length > 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center mt-10"
            >
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group"
              >
                Explore More Tours
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}

          {/* ── HOTEL & VILLA SECTION ── */}
          {hotelProducts.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-16 mb-8 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Hotel & Villa</h3>
                    <p className="text-sm text-gray-500">{hotelProducts.length} properties available</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
              >
                {isLoading
                  ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                  : visibleHotelProducts.map((product, index) => {
                      const isSaved = isInWishlist(product.id);
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <Link
                            to={`/product/${product.id}`}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative h-full"
                          >
                            <div className="aspect-[4/3] relative overflow-hidden">
                              <img
                                src={getImageUrl(product.image_url || product.image)}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                              />
                              {isLoggedIn && (
                                <button
                                  onClick={(e) => handleWishlist(e, product)}
                                  className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90"
                                >
                                  <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
                                </button>
                              )}
                              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
                                <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />
                                {product.rating}
                              </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                {product.name}
                              </h3>
                              {product.location && (
                                <p className="text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {formatLocation(product.location)}
                                </p>
                              )}
                              <div className="mt-auto pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">From</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {product.currency} {Number(product.price).toLocaleString('id-ID')}
                                  <span className="text-sm font-medium text-gray-500"> /night</span>
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                                  <Link
                                    to={`/product/${product.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center flex items-center justify-center"
                                  >
                                    See Details
                                  </Link>
                                  <button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={isInCart(product.id)}
                                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border transform active:scale-[0.98]
                                      ${isInCart(product.id)
                                        ? "border-green-500 text-green-600 bg-green-50 cursor-default"
                                        : "border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md"
                                      }`}
                                  >
                                    <ShoppingCart className={`w-3.5 h-3.5 shrink-0 ${isInCart(product.id) ? "stroke-green-600" : ""}`} />
                                    <span className="truncate">{isInCart(product.id) ? "Added" : "Book Now"}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })
                }
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-center mt-10"
              >
                {hotelProducts.length > visibleHotels ? (
                  <button
                    onClick={() => setVisibleHotels(prev => prev + 4)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group"
                  >
                    Load More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <Link
                    to="/explore?category_id=2"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group"
                  >
                    Explore More Hotels & Villa
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </motion.div>
            </>
          )}

          {/* ── CAR RENTAL SECTION ── */}
          {carProducts.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-16 mb-8 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Car Rental</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
              >
                {isLoading
                  ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                  : visibleCarProducts.map((product, index) => {
                      const isSaved = isInWishlist(product.id);
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <Link
                            to={`/product/${product.id}`}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative h-full"
                          >
                            <div className="aspect-[4/3] relative overflow-hidden">
                              <img
                                src={getImageUrl(product.image_url || product.image)}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                              />
                              {isLoggedIn && (
                                <button
                                  onClick={(e) => handleWishlist(e, product)}
                                  className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90"
                                >
                                  <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
                                </button>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                {product.name}
                              </h3>
                              {product.location && (
                                <p className="text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {formatLocation(product.location)}
                                </p>
                              )}
                              <div className="mt-auto pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">From</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {product.currency} {Number(product.price).toLocaleString('id-ID')}
                                  <span className="text-sm font-medium text-gray-500"> /day</span>
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                                  <Link
                                    to={`/product/${product.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center flex items-center justify-center"
                                  >
                                    See Details
                                  </Link>
                                  <button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={isInCart(product.id)}
                                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border transform active:scale-[0.98]
                                      ${isInCart(product.id)
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
                        </motion.div>
                      );
                    })
                }
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-center mt-10"
              >
                {carProducts.length > visibleCars ? (
                  <button
                    onClick={() => setVisibleCars(prev => prev + 4)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group"
                  >
                    Load More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <Link
                    to="/explore?category_id=3"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group"
                  >
                    Explore More Cars
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </motion.div>
            </>
          )}

          
        </div>
      </div>

      {/* Smart AI Trip Planner Section - */}
      <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={aiContainerVariants}
          className="bg-white py-16 md:py-24 relative overflow-hidden"
        >
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

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[
                {
                  Icon: Brain,
                  title: 'Smart Recommendations',
                  desc: 'AI learns your preferences to suggest hidden gems you\'ll love.'
                },
                {
                  Icon: Clock,
                  title: 'Time Optimization',
                  desc: 'Maximize your holiday with efficiently planned routes and schedules.'
                },
                {
                  Icon: Map,
                  title: 'Interactive Maps',
                  desc: 'Visualize your journey with integrated maps and navigation.'
                },
                {
                  Icon: Sparkles,
                  title: 'Personalized For You',
                  desc: 'Every itinerary is unique, tailored specifically to your travel style.'
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  variants={aiCardVariants}
                  whileHover="hover"
                  className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 group text-center cursor-pointer relative will-change-transform"
                >
                  <motion.div 
                    className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-100"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <item.Icon className="w-8 h-8 text-primary-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>

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
      </motion.div>

      {/* Popular Destinations (Instagram Stories Style - Optimized) - Z-Index lower than Hero search */}
      <div className="relative py-8 md:py-12 border-b border-gray-100 overflow-hidden">
  
      {/* Base Soft Background */}
      <div className="absolute inset-0 bg-[#FFEEEB]"></div>

      {/* Glow Orb Top Right */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-400 rounded-full blur-3xl opacity-20"></div>

      {/* Glow Orb Bottom Left */}
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-300 rounded-full blur-3xl opacity-20"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
          <motion.div variants={destContainerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  className="flex items-center justify-start md:justify-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible py-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar md:flex-nowrap"
>
            {DESTINATION_STORIES.map((dest, index) => (
  <motion.div
  key={index}
  variants={destBubbleVariants}   // ← tidak pakai custom lagi
  whileHover={{ scale: 1.12, y: -6, transition: { type: 'spring', stiffness: 300 } }}
  onClick={() => goToExplore(dest.name)}
  className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
>
    <motion.div
      className="w-[70px] h-[70px] md:w-[84px] md:h-[84px] lg:w-[100px] lg:h-[100px] rounded-full p-[2px] md:p-[3px] bg-gradient-to-tr from-amber-400 via-orange-500 to-primary-600 relative"
      whileHover={{
        boxShadow: '0 0 20px rgba(224,88,69,0.6)',
      }}
    >
      {/* Rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute -inset-[3px] rounded-full border-2 border-dashed border-primary-400/40 pointer-events-none"
      />
      <div className="w-full h-full rounded-full border-[2px] md:border-[3px] border-white overflow-hidden bg-white relative z-10">
        <img
          src={dest.image}
          alt={dest.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
      </div>
      {/* Pulse ring on hover */}
      <motion.div
        initial={{ scale: 1, opacity: 0 }}
        whileHover={{ scale: 1.3, opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 rounded-full bg-primary-400/30 pointer-events-none"
      />
    </motion.div>
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: index * 0.07 + 0.3 }}
      className="mt-3 text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors block"
    >
      {dest.name}
    </motion.span>
  </motion.div>
))}
          </motion.div>

        </div>
      </div>

      {/* Inspiration Itinerary */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={leftToRightVariants}
        className="bg-gray-50 py-16 md:py-24 relative overflow-hidden"
      >
        {/* Subtle texture / decorative */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(224,88,69,0.05),_transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(251,191,36,0.06),_transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* ── SECTION HEADER ── */}
          <div className="mb-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
              Inspiration for Your<br className="hidden md:block" /> Itinerary
            </h2>
          </div>

          {/* ROW 1: Slider dengan 5 Cards per Baris (pada Desktop) */}
          <div className="relative group mb-12">
            
            {/* Navigation Buttons */}
            <button
              onClick={() => {
                const el = document.getElementById('itinerary-slider');
                if (el) el.scrollBy({ left: -250, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-20 w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('itinerary-slider');
                if (el) el.scrollBy({ left: 250, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-20 w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slider Container */}
            <div
              id="itinerary-slider"
              className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
            >
              {ITINERARY_CARDS.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[300px] md:min-w-[380px] flex-shrink-0 relative rounded-2xl overflow-hidden cursor-pointer group h-[160px] md:h-[180px]"
                >
                  {/* Background Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Overlay - gradient hanya 50% dari kiri */}
                  <div
  className="absolute inset-0"
  style={{ background: 'linear-gradient(to right, rgba(224,88,69,0.90) 0%, rgba(224,88,69,0.75) 35%, rgba(224,88,69,0.10) 50%, transparent 75%)' }}
></div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-5">
                    {/* Top: Tag */}
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${item.tagColor}`}>
                      {item.tag}
                    </span>

                    {/* Middle: Title & subtitle */}
                    <div>
                      <h3 className="text-white font-bold text-lg md:text-xl leading-snug mb-1 drop-shadow-sm">
                        {item.title}
                      </h3>
                      <p className="text-white/70 text-xs leading-relaxed">
                        {item.duration} · {item.pax}
                      </p>
                    </div>

                    {/* Bottom: Button */}
                    <Link
                      to={`/explore?search=${item.destination}`}
                      className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg w-fit hover:bg-primary-50 transition-colors shadow-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      See Activities
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 2: Promo Cards (Tetap 3 per Baris) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROMO_CARDS.map((card) => {
              return (
                <div
                  key={card.id}
                  className={`relative rounded-3xl overflow-hidden border ${card.border} bg-gradient-to-br ${card.bg} group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center`}
                >
                  {/* Top Accent Stripe */}
                  <div className={`h-1.5 w-full ${card.accent}`}></div>

                  <div className="p-8 flex flex-col flex-1 relative z-10 items-center w-full">
                    {/* LARGE PNG IMAGE - Centered & Transparent Background */}
                    <div className="w-full flex justify-center mb-6 h-28 items-center">
                      <img 
                        src={card.promoImage} 
                        alt={card.title} 
                        className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${card.iconColor}`}>
                      {card.id}
                    </span>
                    
                    <h3 className="font-serif font-bold text-2xl text-gray-900 leading-tight mb-4">
                      {card.title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1 max-w-[280px]">
                      {card.description}
                    </p>
                    
                    {card.id === 'referral' ? (
                      <button
                        onClick={() => setIsReferralModalOpen(true)}
                        className={`inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 group/btn w-full md:w-auto ${card.buttonStyle}`}
                      >
                        {card.buttonLabel}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <Link
                        to={card.buttonLink}
                        className={`inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 group/btn w-full md:w-auto ${card.buttonStyle}`}
                      >
                        {card.buttonLabel}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </motion.div>

      {/* Why Choose Us */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={rightToLeftVariants}
        className="bg-white py-16 md:py-24 relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-60"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
              Why Choose Us
            </h2>
          </div>

          {/* 4-column row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_US.map((card) => {
              return (
                <div
                  key={card.id}
                  className={`relative rounded-3xl overflow-hidden border ${card.border} bg-gradient-to-br ${card.bg} group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center`}
                >
                  {/* Top Accent Stripe */}
                  <div className={`h-1.5 w-full ${card.accent}`}></div>

                  <div className="p-6 flex flex-col flex-1 relative z-10 items-center w-full">
                    <div className="w-full flex justify-center mb-6 h-40 items-center overflow-hidden">
                      <img 
                        src={card.promoImage} 
                        alt={card.title} 
                        className="h-full w-auto object-contain scale-110 group-hover:scale-125 transition-transform duration-500"
                      />
                    </div>
                    
                    <h3 className="font-serif font-bold text-xl text-gray-900 leading-tight mb-3">
                      {card.title}
                    </h3>
                    
                    <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>


      {/* Testimonials Section */}
      <div className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        {/* HEADER tetap dalam container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Stories from the Road
            </h2>
          </div>
        </div>

        {/* MARQUEE FULL WIDTH */}
        <div className="relative z-10 space-y-8 overflow-hidden
                        [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">

          {/* Row 1 */}
          <div className="flex gap-6 marquee-left w-max px-6">
            {[...REVIEWS, ...REVIEWS].map((review, index) => (
              <div
                key={`row1-${index}`}
                className="w-[260px] bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:bg-gray-800/80 transition-colors flex-shrink-0 relative"
              >
                <Quote className="w-6 h-6 text-primary-500 absolute top-4 right-4 opacity-40" />

                <div className="flex items-center mb-4">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-10 h-10 rounded-full border-2 border-primary-500 mr-3"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {review.user}
                    </h4>
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

                <p className="text-gray-300 text-sm italic leading-relaxed line-clamp-4">
                  "{review.text}"
                </p>

                <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide mt-4">
                  <MapPin className="w-3 h-3 mr-1 text-primary-500" />
                  {review.location}
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex gap-6 marquee-right w-max px-6">
            {[...REVIEWS, ...REVIEWS].map((review, index) => (
              <div
                key={`row2-${index}`}
                className="w-[260px] bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:bg-gray-800/80 transition-colors flex-shrink-0 relative"
              >
                <Quote className="w-6 h-6 text-primary-500 absolute top-4 right-4 opacity-40" />

                <div className="flex items-center mb-4">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-10 h-10 rounded-full border-2 border-primary-500 mr-3"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {review.user}
                    </h4>
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

                <p className="text-gray-300 text-sm italic leading-relaxed line-clamp-4">
                  "{review.text}"
                </p>

                <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide mt-4">
                  <MapPin className="w-3 h-3 mr-1 text-primary-500" />
                  {review.location}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      
      {/* Call to Action */}
      <div className="relative bg-primary-600 py-24 px-4 overflow-hidden">
        {/* Luxury Glow Background */}
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-primary-400/40 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">

          {/* LEFT SIDE */}
          <div className="text-white max-w-xl text-center lg:text-left">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Unlock App-Only Deals
            </h2>

            <p className="text-primary-100 text-lg md:text-xl mb-10">
              Save up to 
              <span className="font-bold text-white"> IDR 400.000 </span>
              on your first transaction.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">

              {/* App Store Button */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-black px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95"
              >
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="App Store"
                  className="h-8"
                />
              </a>

              {/* Google Play Button */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-black px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Google Play"
                  className="h-8"
                />
              </a>

            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-8 rounded-[32px] shadow-2xl">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://trivgoo.com/app"
                alt="QR Code Download Trivgoo App"
                className="w-56 h-56 md:w-64 md:h-64 object-contain"
              />
            </div>
            <span className="text-white mt-6 text-sm uppercase tracking-widest font-semibold">
              Scan to download
            </span>
          </div>

        </div>
      </div>
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        referralCode="TRIVGOO2025"
      />
    </div>
  );
};

export default Home;

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
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category, Product } from '../types';
import { useAuth } from '../AuthContext';
import { agentProductService } from '../services/agentProductService';
import { useCart } from '../components/CartContext';
import { useWishlist } from '../components/WishlistContext';
import { useToast } from '../components/ToastContext';
import { motion, type Variants } from 'framer-motion';
import { getImageUrl, FALLBACK_IMAGE } from '../utils/imageUtils';
import ReferralModal from '../components/ReferralModal';
import { useActiveCampaigns } from '../src/hooks/useActiveCampaigns';
import { useCampaignTimer }   from '../src/hooks/useCampaignTimer';
import BannerSlider from '../components/BannerSlider';
import { resolveBannerUrl } from '../services/promoService';
import type { PromoCampaign } from '../services/promoService';

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
  { name: 'Bali',        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=300&q=80' },
  { name: 'Raja Ampat',  image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=300&q=80' },
  { name: 'Yogyakarta',  image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80' },
  { name: 'Padar Island',image: 'https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tokyo',       image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80' },
  { name: 'Seoul',       image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=300&q=80' },
  { name: 'Bangkok',     image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=300&q=80' },
  { name: 'Singapore',   image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=300&q=80' },
  { name: 'Kyoto',       image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80' },
  { name: 'Hong Kong',   image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80' },
];

const REVIEWS = [
  {
    id: 1, user: 'Sarah Jenkins', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5,
    text: 'The trip to Bali was absolutely magical. The guide knew all the hidden spots away from the crowds. Best vacation ever!',
    location: 'Ubud, Bali',
    tripImage: 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2, user: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5,
    text: 'Our honeymoon in Santorini was handled perfectly by Trivgoo. From the private villa to the sunset dinner, everything was seamless.',
    location: 'Oia, Santorini',
    tripImage: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3, user: 'Emma Wilson', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 4.8,
    text: 'I was nervous traveling solo to Japan, but the itinerary was so well planned. I felt safe and had the adventure of a lifetime.',
    location: 'Kyoto, Japan',
    tripImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
  },
];

const SEARCH_CATEGORIES = [
  { id: 'tours',     label: 'Wisata',           icon: Palmtree,  placeholder: 'Where do you want to go?' },
  { id: 'stays',     label: 'Hotel & Villa',    icon: Building2, placeholder: 'City, hotel, or destination' },
  { id: 'cars',      label: 'Car Rental',       icon: Car,       placeholder: 'Pick-up location' },
  { id: 'transfers', label: 'Airport Transfer', icon: Plane,     placeholder: 'Airport or Hotel' },
  { id: 'events',    label: 'Event',            icon: Calendar,  placeholder: 'Concert, festival, or event' },
];

const TRAVEL_FILTERS = [
  'All', 'Family', 'Honeymoon', 'Solo Travel', 'Healing',
  'Workation', 'Adventure', 'Cultural', 'Culinary', 'Eco Tourism',
];

const getSubCategoryValue = (details: any): string => {
  if (!details) return '';
  return (details.tourCategory || details.stayCategory || details.transportCategory || '').toLowerCase();
};

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

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories]               = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts]   = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // ── Campaigns — HARUS sebelum useCampaignTimer ────────────────────────────
  const {
    campaigns: activeCampaigns,
    primaryCampaign: activeCampaign,
  } = useActiveCampaigns();

  // ── Slide tracking ────────────────────────────────────────────────────────
  const [visibleSlideIndex, setVisibleSlideIndex] = useState(0);

  const displayedCampaign: PromoCampaign | null = (() => {
    if (flashSaleProducts.length > 0) {
      const currentProduct = flashSaleProducts[visibleSlideIndex];
      if (currentProduct?.flashSale?.campaignId) {
        return activeCampaigns.find(c => c.id === currentProduct.flashSale!.campaignId) ?? activeCampaign;
      }
      return activeCampaign;
    }
    return activeCampaigns[visibleSlideIndex] ?? activeCampaign;
  })();

  // ── Timer — mengikuti displayedCampaign ───────────────────────────────────
  const timer = useCampaignTimer(displayedCampaign);

  // ── Referral Modal ────────────────────────────────────────────────────────
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // ── Search ────────────────────────────────────────────────────────────────
  const [searchCategory, setSearchCategory]             = useState('tours');
  const [searchQuery, setSearchQuery]                   = useState('');
  const [showSuggestions, setShowSuggestions]           = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>(POPULAR_DESTINATIONS);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Date Picker ───────────────────────────────────────────────────────────
  const [searchDate, setSearchDate]             = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerDate, setPickerDate]             = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  // ── Typewriter ────────────────────────────────────────────────────────────
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting]         = useState(false);
  const [wordIndex, setWordIndex]           = useState(0);
  const typingWords = ['Paradise', 'Adventure', 'Serenity', 'Escape'];

  // ── Flash Sale Slider ─────────────────────────────────────────────────────
  const flashSaleRef = useRef<HTMLDivElement>(null);

  // ── Scroll listener ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = flashSaleRef.current;
    if (!el || flashSaleProducts.length === 0) return;
    const handleScroll = () => {
      const cardWidth = el.scrollWidth / flashSaleProducts.length;
      const index = Math.round(el.scrollLeft / cardWidth);
      setVisibleSlideIndex(Math.min(index, flashSaleProducts.length - 1));
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [flashSaleProducts.length]);

  // ── BannerSlider slide sync ───────────────────────────────────────────────
  const handleBannerSlideChange = useCallback((index: number) => {
    setVisibleSlideIndex(index);
  }, []);

  // ── Click-outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setIsDatePickerOpen(false);
      if (searchRef.current    && !searchRef.current.contains(event.target as Node))    setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Framer Motion Variants ────────────────────────────────────────────────
  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const destContainerVariants: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };
  const leftToRightVariants  = { hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.8 } } };
  const rightToLeftVariants  = { hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.8 } } };
  const aiCardVariants = {
    hidden:  { opacity: 0, y: 30, scale: 0.92 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
    hover:   { scale: 1.06, y: -12, transition: { duration: 0.35 } },
  } as const satisfies Record<string, object>;
  const aiContainerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const destBubbleVariants: Variants = {
    hidden:  { opacity: 0, scale: 0.5, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, type: 'spring', stiffness: 200, damping: 15 } },
  };
  const ctaContainerVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const ctaLeftVariants: Variants   = { hidden: { opacity: 0, x: -60 },            visible: { opacity: 1, x: 0,         transition: { duration: 0.8, ease: 'easeOut' } } };
  const ctaRightVariants: Variants  = { hidden: { opacity: 0, x: 60, scale: 0.9 }, visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } } };
  const ctaBadgeVariants: Variants  = { hidden: { opacity: 0, y: -20 },             visible: { opacity: 1, y: 0,         transition: { duration: 0.5, ease: 'easeOut' } } };
  const ctaButtonVariants: Variants = {
    hidden:  { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' } }),
  };

  // ── Products ──────────────────────────────────────────────────────────────
  const [products, setProducts]         = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading]       = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart }          = useCart();
  const { showToast }                    = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const prods    = await agentProductService.getAllProducts();
        const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const normalized = prods.map((p: Product) => ({
          ...p,
          image_url: p.image_url && !p.image_url.startsWith('http') ? `${BASE_URL}/${p.image_url}` : p.image_url,
        }));
        setProducts(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleWishlist  = (e: React.MouseEvent, p: Product) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p); };
  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault(); e.stopPropagation();
    if (isInCart(p.id)) return;
    addToCart(p, 1);
    showToast(`${p.name} ditambahkan ke keranjang!`, 'success');
  };

  const filteredProducts = products
    .filter((p) => { if (Number(p.category_id) !== 1) return false; if (activeFilter === 'All') return true; return getSubCategoryValue(p.details) === activeFilter.toLowerCase(); })
    .slice(0, 4);

  const [visibleCars,   setVisibleCars]   = useState(4);
  const [visibleHotels, setVisibleHotels] = useState(4);
  const carProducts          = products.filter((p) => p.category_id === 3);
  const hotelProducts        = products.filter((p) => p.category_id === 2);
  const visibleCarProducts   = carProducts.slice(0, visibleCars);
  const visibleHotelProducts = hotelProducts.slice(0, visibleHotels);

  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" />
        <div className="flex gap-2 mt-3"><div className="flex-1 h-9 bg-gray-200 rounded-xl" /><div className="flex-1 h-9 bg-gray-200 rounded-xl" /></div>
      </div>
    </div>
  );

  // ── Static data ───────────────────────────────────────────────────────────
  const ITINERARY_CARDS = [
    { id:1, destination:'Bali',       title:'5D4N Bali Cultural Escape',      duration:'5 Days 4 Nights', pax:'For 2–8 pax',  tag:'Honeymoon', tagColor:'bg-rose-100 text-rose-600',   image:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', activities:[] },
    { id:2, destination:'Raja Ampat', title:'7D6N Raja Ampat Dive Adventure', duration:'7 Days 6 Nights', pax:'For 4–10 pax', tag:'Adventure', tagColor:'bg-blue-100 text-blue-600',   image:'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=600&q=80', activities:[] },
    { id:3, destination:'Yogyakarta', title:'4D3N Jogja Heritage Trail',      duration:'4 Days 3 Nights', pax:'For 2–12 pax', tag:'Cultural',  tagColor:'bg-amber-100 text-amber-700', image:'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80', activities:[] },
    { id:4, destination:'Lombok',     title:'6D5N Lombok & Gili Islands',     duration:'6 Days 5 Nights', pax:'For 2–6 pax',  tag:'Healing',   tagColor:'bg-green-100 text-green-600', image:'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80', activities:[] },
    { id:5, destination:'Komodo',     title:'5D4N Komodo & Pink Beach',       duration:'5 Days 4 Nights', pax:'For 4–8 pax',  tag:'Adventure', tagColor:'bg-blue-100 text-blue-600',   image:'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=600&q=80', activities:[] },
  ];

  const PROMO_CARDS = [
    { id:'blog',    promoImage:'/homepage-asset/card1.png', title:'Check out the Trivgoo Blog',  description:'Follow the latest travel trends, tips, and stories and plan your next unforgettable trip.', buttonLabel:'Read Now',     buttonLink:'/travel-blog', bg:'from-primary-50/50 to-rose-50/50', border:'border-primary-100/50', iconColor:'text-primary-600', accent:'bg-primary-500', buttonStyle:'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/25' },
    { id:'trivpay', promoImage:'/homepage-asset/card2.png', title:'Save on Fun with TrivPay',    description:'Find out how to save more when you book and leave a review',                                buttonLabel:'How It Works', buttonLink:'/trivpay',     bg:'from-primary-50/50 to-rose-50/50', border:'border-primary-100/50', iconColor:'text-primary-600', accent:'bg-primary-500', buttonStyle:'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/25' },
    { id:'referral',promoImage:'/homepage-asset/card3.png', title:'Share Joy & Get Reward',      description:'Invite your friends to explore with Trivgoo and earn travel credits for every successful referral.', buttonLabel:'Invite Friend',buttonLink:'/referral',   bg:'from-primary-50/50 to-rose-50/50', border:'border-primary-100/50', iconColor:'text-primary-600', accent:'bg-primary-500', buttonStyle:'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/25' },
  ];

  const WHY_CHOOSE_US = [
    { id:'quality', promoImage:'/homepage-asset/whychoose1.png', title:'Best Quality',   description:'We ensure every destination and activity meets our high standards for your comfort.',     bg:'from-orange-50/50 to-amber-50/50', border:'border-emerald-100/50', iconColor:'text-emerald-600', accent:'bg-red-500' },
    { id:'price',   promoImage:'/homepage-asset/whychoose2.png', title:'Best Price',     description:'Get the most competitive prices and exclusive deals for your dream vacation.',            bg:'from-orange-50/50 to-amber-50/50', border:'border-emerald-100/50', iconColor:'text-emerald-600', accent:'bg-red-500' },
    { id:'support', promoImage:'/homepage-asset/whychoose3.png', title:'24/7 Support',   description:'Our dedicated team is always ready to help you anytime, anywhere during your trip.',     bg:'from-orange-50/50 to-amber-50/50', border:'border-emerald-100/50', iconColor:'text-emerald-600', accent:'bg-red-500' },
    { id:'secure',  promoImage:'/homepage-asset/whychoose4.png', title:'Secure Payment', description:'Your transactions are protected with the latest security technology for peace of mind.', bg:'from-orange-50/50 to-amber-50/50', border:'border-emerald-100/50', iconColor:'text-emerald-600', accent:'bg-red-500' },
  ];

  // ── Typewriter ────────────────────────────────────────────────────────────
  useEffect(() => {
    const currentWord   = typingWords[wordIndex % typingWords.length];
    const isFullWord    = !isDeleting && typewriterText === currentWord;
    const isWordDeleted =  isDeleting && typewriterText === '';
    if (isFullWord)    { const t = setTimeout(() => setIsDeleting(true), 2000); return () => clearTimeout(t); }
    if (isWordDeleted) { setIsDeleting(false); setWordIndex((p) => p + 1); return; }
    const next = isDeleting ? currentWord.substring(0, typewriterText.length - 1) : currentWord.substring(0, typewriterText.length + 1);
    const t = setTimeout(() => setTypewriterText(next), isDeleting ? 50 : 100);
    return () => clearTimeout(t);
  }, [typewriterText, isDeleting, wordIndex]);

  // ── Search helpers ────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 0) { setFilteredDestinations(POPULAR_DESTINATIONS.filter(d => d.toLowerCase().includes(q.toLowerCase()))); setShowSuggestions(true); }
    else              { setFilteredDestinations(POPULAR_DESTINATIONS); }
  };
  const handleDestinationSelect = (dest: string) => { setSearchQuery(dest); setShowSuggestions(false); };

  const CATEGORY_ID_MAP: Record<string, number> = { tours:1, stays:2, cars:3, transfers:4, events:5 };
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (searchDate)         params.append('date', searchDate);
    const cid = CATEGORY_ID_MAP[searchCategory];
    if (cid)                params.append('category_id', String(cid));
    navigate(`/explore?${params.toString()}`);
  };
  const goToExplore     = (dest: string) => navigate(`/explore?search=${dest}`);
  const scrollFlashSale = (dir: 'left' | 'right') => {
    if (flashSaleRef.current) flashSaleRef.current.scrollTo({ left: flashSaleRef.current.scrollLeft + (dir === 'right' ? 350 : -350), behavior: 'smooth' });
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const months             = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const getDaysInMonth     = (y:number,m:number) => new Date(y,m+1,0).getDate();
  const getFirstDayOfMonth = (y:number,m:number) => new Date(y,m,1).getDay();
  const handlePrevMonth    = (e: React.MouseEvent) => { e.preventDefault(); setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth()-1,1)); };
  const handleNextMonth    = (e: React.MouseEvent) => { e.preventDefault(); setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth()+1,1)); };
  const handleDateClick    = (day:number) => { const d=new Date(pickerDate.getFullYear(),pickerDate.getMonth(),day); setSearchDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`); setIsDatePickerOpen(false); };
  const handleToday        = () => { const d=new Date(); setPickerDate(d); setSearchDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`); setIsDatePickerOpen(false); };
  const handleClear        = () => { setSearchDate(''); setIsDatePickerOpen(false); };
  const renderCalendarGrid = () => {
    const y=pickerDate.getFullYear(), m=pickerDate.getMonth();
    const days: React.ReactNode[] = [];
    for (let i=0;i<getFirstDayOfMonth(y,m);i++) days.push(<div key={`e${i}`} className="h-8 w-8"/>);
    for (let day=1;day<=getDaysInMonth(y,m);day++) {
      const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      days.push(<button key={day} onClick={e=>{e.preventDefault();handleDateClick(day);}} className={`h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors ${searchDate===ds?'bg-primary-600 text-white font-bold':'text-gray-700 hover:bg-gray-100'}`}>{day}</button>);
    }
    return days;
  };

  const activeCategoryConfig = SEARCH_CATEGORIES.find(c=>c.id===searchCategory) || SEARCH_CATEGORIES[0];

  // ── Product card factory (DRY) ────────────────────────────────────────────
  const renderProductCard = (product: Product, index: number, priceUnit: string) => {
    const isSaved = isInWishlist(product.id);
    return (
      <motion.div key={product.id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:index*0.1 }}>
        <Link to={`/product/${product.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1 flex flex-col relative h-full">
          <div className="aspect-[4/3] relative overflow-hidden">
            <img src={getImageUrl(product.image_url || product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={e=>{(e.currentTarget as HTMLImageElement).src=FALLBACK_IMAGE;}} />
            {isLoggedIn && (
              <button onClick={e=>handleWishlist(e,product)} className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm z-10 hover:scale-110 transition-transform group/btn active:scale-90">
                <Heart className={`w-4 h-4 transition-colors ${isSaved?'text-red-500 fill-red-500':'text-gray-400 group-hover/btn:text-red-500'}`} />
              </button>
            )}
            {priceUnit !== '/day' && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs font-bold text-gray-900 shadow-sm z-10">
                <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />{product.rating}
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h3>
            {product.location && <p className="text-sm text-gray-500 font-medium mb-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" /> {formatLocation(product.location)}</p>}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">From</p>
              <p className="text-lg font-bold text-gray-900">{product.currency} {Number(product.price).toLocaleString('id-ID')}<span className="text-sm font-medium text-gray-500"> {priceUnit}</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                <Link to={`/product/${product.id}`} onClick={e=>e.stopPropagation()} className="border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-center flex items-center justify-center">See Details</Link>
                <button onClick={e=>handleAddToCart(e,product)} disabled={isInCart(product.id)} className={`py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border transform active:scale-[0.98] ${isInCart(product.id)?'border-green-500 text-green-600 bg-green-50 cursor-default':'border-gray-900 bg-gray-900 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md'}`}>
                  <ShoppingCart className={`w-3.5 h-3.5 shrink-0 ${isInCart(product.id)?'stroke-green-600':''}`} />
                  <span className="truncate">{isInCart(product.id)?'Added': priceUnit==='/night'?'Book Now':'Add to Cart'}</span>
                </button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative min-h-[100dvh] flex items-start justify-center px-4 pt-28 md:pt-24 lg:pt-28 pb-12">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video className="w-full h-full object-cover" src="/videos/video-bg.mp4" autoPlay loop muted playsInline />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/20 to-gray-900/70" />
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto text-center px-4">
          <motion.h1 className="font-serif font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
            <motion.span initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.1}} className="block text-sm md:text-base lg:text-lg font-medium tracking-widest text-white/80 mb-2" style={{fontFamily:'Helvetica, Arial, sans-serif'}}>
              🌟Hello Triverse, Let's
            </motion.span>
            <motion.span initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.3}} className="block text-2xl md:text-4xl lg:text-5xl opacity-90" style={{fontFamily:'Helvetica, Arial, sans-serif',fontWeight:700}}>
              Find Your
            </motion.span>
            <motion.span initial={{opacity:0,scale:0.8,y:20}} animate={{opacity:1,scale:1,y:0}} transition={{duration:1,delay:0.5}} className="block text-6xl md:text-8xl lg:text-[10rem] text-outlined bg-clip-text bg-gradient-to-r from-primary-200 to-white mb-10 md:mb-14" style={{fontFamily:"'Vlogger', serif",minHeight:'1.2em',lineHeight:'1.2'}}>
              {typewriterText || '\u00A0'}
            </motion.span>
          </motion.h1>

          {/* Search Widget */}
          <motion.div initial={{opacity:0,y:30,scale:0.95}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.8,delay:0.8}} className="w-full max-w-4xl mx-auto relative z-[60]">
            <div className="flex justify-center mb-4 md:mb-6 px-4 md:px-0">
              <div className="bg-gray-900/40 backdrop-blur-md p-1.5 rounded-3xl flex flex-wrap justify-center gap-1 border border-white/10 w-full md:w-auto">
                {SEARCH_CATEGORIES.map(cat => {
                  const Icon=cat.icon, isActive=searchCategory===cat.id;
                  return (
                    <button key={cat.id} onClick={()=>setSearchCategory(cat.id)} className={`flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap mb-1 md:mb-0 ${isActive?'bg-white text-primary-700 shadow-lg scale-105':'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                      <Icon className={`w-4 h-4 mr-2 ${isActive?'text-primary-600':'text-white/80'}`} />{cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch md:items-center border border-white/40 divide-y divide-gray-100 md:divide-y-0 relative pr-0 md:pr-16">
              {/* Destination */}
              <div className="flex-1 flex items-center md:border-r md:border-gray-200 p-4 md:p-3 md:pl-8 relative" ref={searchRef}>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0"><MapPin className="w-5 h-5" /></div>
                <div className="text-left w-full relative">
                  <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{searchCategory==='cars'?'Pick-up Location':searchCategory==='transfers'?'From/To':'Destination'}</label>
                  <input type="text" placeholder={activeCategoryConfig.placeholder} className="w-full text-base text-gray-800 font-medium focus:outline-none placeholder-gray-400 bg-transparent" value={searchQuery} onChange={handleSearchChange} onFocus={()=>setShowSuggestions(true)} />
                </div>
                {showSuggestions && (
                  <div className="absolute top-full left-0 mt-4 w-full md:w-80 bg-white rounded-2xl shadow-2xl py-2 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2 z-[70]">
                    <div className="absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100" />
                    <div className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">{searchQuery?'Suggestions':'Popular Destinations'}</div>
                    {filteredDestinations.length>0 ? (
                      <ul className="max-h-64 overflow-y-auto">
                        {filteredDestinations.map((dest,i)=>(
                          <li key={i}><button type="button" onClick={()=>handleDestinationSelect(dest)} className="w-full text-left px-5 py-3 flex items-center hover:bg-gray-50 transition-colors border border-gray-50 last:border-0">
                            <div className="p-2 bg-primary-50 rounded-lg mr-3 text-primary-600"><MapPin className="w-4 h-4" /></div>
                            <span className="text-sm text-gray-700 font-medium">{dest}</span>
                          </button></li>
                        ))}
                      </ul>
                    ) : <div className="px-5 py-4 text-sm text-gray-500 text-center">No destinations found.</div>}
                  </div>
                )}
              </div>

              {/* Date Picker */}
              <div className="flex-1 flex items-center md:border-r md:border-gray-200 p-4 md:p-3 md:px-6 relative" ref={datePickerRef}>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0"><Calendar className="w-5 h-5" /></div>
                <div className="text-left w-full cursor-pointer" onClick={()=>setIsDatePickerOpen(!isDatePickerOpen)}>
                  <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 cursor-pointer">Date</label>
                  <input type="text" placeholder="Add dates" className="w-full text-base text-gray-800 font-medium focus:outline-none placeholder-gray-400 cursor-pointer bg-transparent" value={searchDate} readOnly />
                </div>
                {isDatePickerOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-2xl p-6 w-[280px] md:w-[320px] z-[70] animate-in fade-in slide-in-from-top-2 border border-gray-100 ring-1 ring-black/5">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <h3 className="text-lg font-serif font-bold text-gray-900">{months[pickerDate.getMonth()]} {pickerDate.getFullYear()}</h3>
                      <div className="flex space-x-2">
                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 mb-3 text-center">{['S','M','T','W','T','F','S'].map((d,i)=><span key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{d}</span>)}</div>
                    <div className="grid grid-cols-7 gap-y-2 place-items-center mb-6">{renderCalendarGrid()}</div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <button onClick={e=>{e.preventDefault();handleClear();}} className="text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-gray-800 transition-colors">Clear</button>
                      <button onClick={e=>{e.preventDefault();handleToday();}} className="text-xs font-bold uppercase tracking-wide text-primary-600 hover:text-primary-700 transition-colors">Today</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Guests */}
              <div className="flex-1 flex items-center p-4 md:p-3 md:px-6">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0"><Users className="w-5 h-5" /></div>
                <div className="text-left w-full">
                  <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{searchCategory==='cars'||searchCategory==='transfers'?'Passengers':'Guests'}</label>
                  <input type="number" min="1" placeholder={`Add ${searchCategory==='cars'||searchCategory==='transfers'?'passengers':'guests'}`} className="w-full text-base text-gray-800 font-medium focus:outline-none placeholder-gray-400 bg-transparent" />
                </div>
              </div>

              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:block z-10">
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl shadow-primary-600/30 transition-all hover:scale-105 active:scale-95"><Search className="w-5 h-5" /></button>
              </div>
              <div className="p-4 md:hidden">
                <button type="submit" className="w-full bg-primary-600 active:bg-primary-700 text-white rounded-xl h-12 font-bold shadow-lg transition-transform active:scale-95">Search</button>
              </div>
            </form>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:1.1}} className="mt-12 md:mt-12 flex items-center justify-center gap-2 text-white/90 text-sm font-medium relative z-10 pb-8 md:pb-0">
            <div className="flex -space-x-2">
              {[1,2,3].map(i=><div key={i} className="w-8 h-8 rounded-full border-2 border-primary-900 bg-gray-300"><img src={`https://randomuser.me/api/portraits/thumb/women/${i+20}.jpg`} className="w-full h-full rounded-full" alt="User" /></div>)}
            </div>
            <span className="ml-2 text-xs md:text-sm">Trusted by 50,000+ travelers worldwide</span>
          </motion.div>
        </div>
      </div>

      {/* ── FLASH SALE / CAMPAIGN ─────────────────────────────────────────── */}
      <div className={`py-16 md:py-24 overflow-hidden relative transition-colors duration-500 ${activeCampaign ? 'text-white' : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50'}`}>
        {activeCampaign ? (
          <div className="absolute inset-0 z-0">
            {/* Base gold-brown gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-yellow-900 to-amber-900" />
            {/* Warm golden overlay shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-amber-300/15 to-transparent" />
            {/* Glow orbs */}
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-yellow-400/25 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-amber-500/30 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-yellow-300/10 rounded-full blur-3xl" />
            {/* Subtle stardust texture */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
            {/* Gold shimmer top edge */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          </div>
        ) : (
          <>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          </>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Slider */}
          <div ref={flashSaleRef} className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollBehavior:'smooth' }}>
            {flashSaleProducts.length > 0 ? flashSaleProducts.map((product: Product) => {
              const isCampaignProduct = activeCampaign && product.flashSale?.campaignId === activeCampaign.id;
              return (
                <div key={product.id} onClick={()=>navigate(`/product/${product.id}`)} className="min-w-[300px] md:min-w-[350px] snap-center group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full relative cursor-pointer border border-gray-100">
                  {isCampaignProduct && <div className="absolute top-0 left-0 w-full bg-yellow-400 text-black text-[10px] font-bold text-center py-1 z-20 uppercase tracking-widest">Official Event Deal</div>}
                  <div className="h-64 md:h-72 relative overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2 mt-4">
                      <div className={`text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg z-10 tracking-wide w-fit ${isCampaignProduct?'bg-amber-600':'bg-red-600'}`}>{product.flashSale?.discountPercentage}% OFF</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-5 left-6 right-6"><p className="text-xs font-bold text-white/90 flex items-center mb-2 uppercase tracking-wide"><MapPin className="w-3.5 h-3.5 mr-1.5" /> {product.location}</p></div>
                  </div>
                  <div className="p-6 md:p-7 flex-1 flex flex-col justify-between relative bg-white">
                    <h3 className="text-xl font-bold leading-tight font-serif text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center text-xs font-bold text-red-500 animate-pulse"><Flame className="w-3.5 h-3.5 mr-1 fill-red-500" /> Almost Sold Out!</div>
                        <span className="text-xs font-bold text-gray-500">85% Sold</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${isCampaignProduct?'bg-gradient-to-r from-amber-400 to-yellow-500':'bg-gradient-to-r from-orange-400 to-red-600'}`} style={{width:'85%'}} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 line-through text-sm font-medium block mb-0.5">{product.currency} {Number(product.price).toLocaleString('id-ID')}</span>
                        <span className="text-2xl font-bold text-red-600 tracking-tight">{product.currency} {product.flashSale?.salePrice}</span>
                      </div>
                      <button className={`text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center ${isCampaignProduct?'bg-amber-600 shadow-amber-600/25 hover:bg-amber-700':'bg-gray-900 shadow-gray-900/10 hover:bg-red-600 hover:shadow-red-600/30'}`}>
                        Grab Deal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) : <BannerSlider campaigns={activeCampaigns} onSlideChange={handleBannerSlideChange} />}
          </div>

          {flashSaleProducts.length > 0 && (
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={()=>scrollFlashSale('left')}  aria-label="Previous" className={`p-3 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 group ${activeCampaign ? 'bg-yellow-400/20 text-yellow-200 hover:bg-yellow-400/30 backdrop-blur-sm border border-yellow-400/30' : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'}`}><ChevronLeft  className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" /></button>
              <button onClick={()=>scrollFlashSale('right')} aria-label="Next"     className={`p-3 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 group ${activeCampaign ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-yellow-400/30'               : 'bg-gray-900 border border-gray-900 text-white hover:bg-gray-800'}`}><ChevronRight className="w-6 h-6 group-hover:translate-x-0.5  transition-transform" /></button>
            </div>
          )}

          {/* ── Countdown Widget — horizontal gold edition ───────────────── */}
          <motion.div
            key={displayedCampaign?.id ?? 'no-campaign'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 px-6 py-4 rounded-2xl mt-6 ${
              activeCampaign
                ? 'bg-black/25 backdrop-blur-md border border-yellow-400/40 shadow-xl shadow-yellow-900/40'
                : 'bg-white shadow-xl shadow-orange-100/50 border border-orange-100'
            }`}
          >

            {/* Label */}
            <div className="flex items-center gap-3 shrink-0">
              <div className={`p-2 rounded-lg ${activeCampaign ? 'bg-yellow-400/20 border border-yellow-400/30' : 'bg-red-50'}`}>
                <Timer className={`w-5 h-5 animate-pulse ${activeCampaign ? 'text-yellow-300' : 'text-red-500'}`} />
              </div>
              <div className="flex flex-col">
                <span className={`font-bold text-sm whitespace-nowrap ${activeCampaign ? 'text-yellow-100' : 'text-gray-900'}`}>
                  {displayedCampaign ? displayedCampaign.name : 'Offer Ends In'}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${activeCampaign ? 'text-yellow-300 drop-shadow-sm' : 'text-red-500'}`}>
                  {timer.isCritical ? '⚡ Hurry Up!' : timer.isUrgent ? '🔥 Less than 1 hour!' : "Don't Miss Out"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className={`hidden sm:block h-10 w-px shrink-0 ${activeCampaign ? 'bg-yellow-400/30' : 'bg-gray-200'}`} />

            {/* Clock */}
            <div className="flex gap-2 items-center shrink-0">
              {/* Hours */}
              <div className={`rounded-lg px-3 py-2 min-w-[48px] text-center ${activeCampaign ? 'bg-black/40 text-yellow-300 border border-yellow-500/30' : 'bg-gray-900 text-white'}`}>
                <span className="text-xl font-mono font-bold block leading-none">{timer.h}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">Hrs</span>
              </div>
              <span className={`font-bold text-lg ${activeCampaign ? 'text-yellow-400/70' : 'text-gray-300'}`}>:</span>
              {/* Minutes */}
              <div className={`rounded-lg px-3 py-2 min-w-[48px] text-center ${activeCampaign ? 'bg-black/40 text-yellow-300 border border-yellow-500/30' : 'bg-gray-900 text-white'}`}>
                <span className="text-xl font-mono font-bold block leading-none">{timer.m}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">Min</span>
              </div>
              <span className={`font-bold text-lg ${activeCampaign ? 'text-yellow-400/70' : 'text-gray-300'}`}>:</span>
              {/* Seconds — dynamic urgency colour */}
              <div className={`rounded-lg px-3 py-2 min-w-[48px] text-center shadow-lg transition-colors duration-500 ${
                activeCampaign
                  ? timer.isCritical
                    ? 'bg-red-500 text-white shadow-red-500/40 animate-pulse border border-red-400/50'
                    : timer.isUrgent
                      ? 'bg-amber-400 text-black shadow-amber-400/30 border border-amber-300/50'
                      : 'bg-yellow-400 text-black shadow-yellow-400/30 border border-yellow-300/50 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                  : timer.isCritical
                    ? 'bg-red-600 text-white shadow-red-600/30 animate-pulse'
                    : 'bg-red-500 text-white shadow-red-500/30'
              }`}>
                <span className="text-xl font-mono font-bold block leading-none">{timer.s}</span>
                <span className={`text-[9px] font-bold uppercase ${activeCampaign && !timer.isCritical ? 'text-black/70' : 'text-white/80'}`}>Sec</span>
              </div>
            </div>

            {/* Progress bar — only when campaign active */}
            {displayedCampaign && (
              <>
                <div className="hidden sm:block h-10 w-px shrink-0 bg-yellow-400/30" />
                <div className="flex-1 min-w-[140px] max-w-xs">
                  <div className="flex justify-between text-[10px] font-bold mb-1.5">
                    <span className="text-yellow-200/60">Campaign Progress</span>
                    <span className="text-yellow-300 font-bold">{timer.progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-yellow-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(251,191,36,0.55)]"
                      style={{ width: `${timer.progressPercent}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>

        </div>
      </div>

      {/* ── OUR TRAVEL EXPERIENCE ─────────────────────────────────────────── */}
      <div className="bg-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">Our Travel Experience</h2>
          </motion.div>

          <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.2}} className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 mb-8">
            {TRAVEL_FILTERS.map(f=>(
              <button key={f} onClick={()=>setActiveFilter(f)} className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${activeFilter===f?'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20':'bg-white text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600'}`}>{f}</button>
            ))}
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{once:true,margin:'-100px'}} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {isLoading ? [...Array(8)].map((_,i)=><SkeletonCard key={i}/>) : filteredProducts.length>0 ? filteredProducts.map((p,i)=>renderProductCard(p,i,'/pax')) : <div className="col-span-full text-center py-16 text-gray-400" />}
          </motion.div>

          {products.filter(p=>Number(p.category_id)===1&&(activeFilter==='All'||getSubCategoryValue(p.details)===activeFilter.toLowerCase())).length>4 && (
            <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.3}} className="flex justify-center mt-10">
              <Link to="/explore" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group">Explore More Tours <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
            </motion.div>
          )}

          {/* Hotel & Villa */}
          {hotelProducts.length > 0 && (
            <>
              <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="mt-16 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-emerald-600" /></div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Hotel & Villa</h3>
              </motion.div>
              <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{once:true,margin:'-100px'}} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {isLoading ? [...Array(4)].map((_,i)=><SkeletonCard key={i}/>) : visibleHotelProducts.map((p,i)=>renderProductCard(p,i,'/night'))}
              </motion.div>
              <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="flex justify-center mt-10">
                {hotelProducts.length>visibleHotels
                  ? <button onClick={()=>setVisibleHotels(p=>p+4)} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group">Load More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
                  : <Link to="/explore?category_id=2" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group">Explore More Hotels & Villa <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
                }
              </motion.div>
            </>
          )}

          {/* Car Rental */}
          {carProducts.length > 0 && (
            <>
              <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="mt-16 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Car className="w-5 h-5 text-blue-600" /></div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Car Rental</h3>
              </motion.div>
              <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{once:true,margin:'-100px'}} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {isLoading ? [...Array(4)].map((_,i)=><SkeletonCard key={i}/>) : visibleCarProducts.map((p,i)=>renderProductCard(p,i,'/day'))}
              </motion.div>
              <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="flex justify-center mt-10">
                <Link to="/explore?category_id=3" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group">Explore More Cars <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* ── SMART AI TRIP PLANNER ─────────────────────────────────────────── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{once:true,margin:'-100px'}} variants={aiContainerVariants} className="bg-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
        <div className="absolute -left-20 top-40 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block animate-in fade-in slide-in-from-bottom-2">Future of Travel</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Smart AI Trip Planner</h2>
            <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">Leading AI technology that understands your preferences and creates the perfect itinerary according to your wishes and budget.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { Icon:Brain,    title:'Smart Recommendations', desc:"AI learns your preferences to suggest hidden gems you'll love." },
              { Icon:Clock,    title:'Time Optimization',     desc:'Maximize your holiday with efficiently planned routes and schedules.' },
              { Icon:Map,      title:'Interactive Maps',      desc:'Visualize your journey with integrated maps and navigation.' },
              { Icon:Sparkles, title:'Personalized For You',  desc:'Every itinerary is unique, tailored specifically to your travel style.' },
            ].map((item,i)=>(
              <motion.div key={i} variants={aiCardVariants} whileHover="hover" className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 group text-center cursor-pointer relative will-change-transform">
                <motion.div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-100" whileHover={{rotate:360,scale:1.1}} transition={{duration:0.8}}>
                  <item.Icon className="w-8 h-8 text-primary-500" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center">
            <Link to="/ai-planner" className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-full font-bold text-lg shadow-xl shadow-primary-600/30 hover:bg-primary-700 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-600/40 group active:scale-95">
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" /> Try AI Planner Free
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── POPULAR DESTINATIONS ──────────────────────────────────────────── */}
      <div className="relative py-8 md:py-12 border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-[#FFEEEB]" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-400 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-300 rounded-full blur-3xl opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">Popular Destinations</h2>
            <Link to="/explore" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </div>
          <motion.div variants={destContainerVariants} initial="hidden" whileInView="visible" viewport={{once:true}} className="flex items-center justify-start md:justify-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible py-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar md:flex-nowrap">
            {DESTINATION_STORIES.map((dest,index)=>(
              <motion.div key={index} variants={destBubbleVariants} whileHover={{scale:1.12,y:-6,transition:{type:'spring',stiffness:300}}} onClick={()=>goToExplore(dest.name)} className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
                <motion.div className="w-[70px] h-[70px] md:w-[84px] md:h-[84px] lg:w-[100px] lg:h-[100px] rounded-full p-[2px] md:p-[3px] bg-gradient-to-tr from-amber-400 via-orange-500 to-primary-600 relative" whileHover={{boxShadow:'0 0 20px rgba(224,88,69,0.6)'}}>
                  <motion.div animate={{rotate:360}} transition={{duration:8,repeat:Infinity,ease:'linear'}} className="absolute -inset-[3px] rounded-full border-2 border-dashed border-primary-400/40 pointer-events-none" />
                  <div className="w-full h-full rounded-full border-[2px] md:border-[3px] border-white overflow-hidden bg-white relative z-10">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <motion.div initial={{scale:1,opacity:0}} whileHover={{scale:1.3,opacity:0}} transition={{duration:0.6}} className="absolute inset-0 rounded-full bg-primary-400/30 pointer-events-none" />
                </motion.div>
                <motion.span initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:index*0.07+0.3}} className="mt-3 text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors block">{dest.name}</motion.span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── INSPIRATION ITINERARY ─────────────────────────────────────────── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{once:true,margin:'-100px'}} variants={leftToRightVariants} className="bg-gray-50 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(224,88,69,0.05),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(251,191,36,0.06),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-10"><h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">Inspiration for Your<br className="hidden md:block" /> Itinerary</h2></div>
          <div className="relative group mb-12">
            <button onClick={()=>{const el=document.getElementById('itinerary-slider');if(el)el.scrollBy({left:-250,behavior:'smooth'});}} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-20 w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={()=>{const el=document.getElementById('itinerary-slider');if(el)el.scrollBy({left:250,behavior:'smooth'});}} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-20 w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex"><ChevronRight className="w-6 h-6" /></button>
            <div id="itinerary-slider" className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
              {ITINERARY_CARDS.map(item=>(
                <div key={item.id} className="min-w-[300px] md:min-w-[380px] flex-shrink-0 relative rounded-2xl overflow-hidden cursor-pointer group h-[160px] md:h-[180px]">
                  <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0" style={{background:'linear-gradient(to right, rgba(224,88,69,0.90) 0%, rgba(224,88,69,0.75) 35%, rgba(224,88,69,0.10) 50%, transparent 75%)'}} />
                  <div className="relative z-10 h-full flex flex-col justify-between p-5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${item.tagColor}`}>{item.tag}</span>
                    <div><h3 className="text-white font-bold text-lg md:text-xl leading-snug mb-1 drop-shadow-sm">{item.title}</h3><p className="text-white/70 text-xs leading-relaxed">{item.duration} · {item.pax}</p></div>
                    <Link to={`/explore?search=${item.destination}`} className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg w-fit hover:bg-primary-50 transition-colors shadow-md" onClick={e=>e.stopPropagation()}>See Activities</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROMO_CARDS.map(card=>(
              <div key={card.id} className={`relative rounded-3xl overflow-hidden border ${card.border} bg-gradient-to-br ${card.bg} group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center`}>
                <div className={`h-1.5 w-full ${card.accent}`} />
                <div className="p-8 flex flex-col flex-1 relative z-10 items-center w-full">
                  <div className="w-full flex justify-center mb-6 h-28 items-center"><img src={card.promoImage} alt={card.title} className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500" /></div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${card.iconColor}`}>{card.id}</span>
                  <h3 className="font-serif font-bold text-2xl text-gray-900 leading-tight mb-4">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1 max-w-[280px]">{card.description}</p>
                  {card.id==='referral'
                    ? <button onClick={()=>setIsReferralModalOpen(true)} className={`inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 group/btn w-full md:w-auto ${card.buttonStyle}`}>{card.buttonLabel} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" /></button>
                    : <Link to={card.buttonLink} className={`inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 group/btn w-full md:w-auto ${card.buttonStyle}`}>{card.buttonLabel} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" /></Link>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{once:true,margin:'-100px'}} variants={rightToLeftVariants} className="bg-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16"><h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">Why Choose Us</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_US.map(card=>(
              <div key={card.id} className={`relative rounded-3xl overflow-hidden border ${card.border} bg-gradient-to-br ${card.bg} group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center`}>
                <div className={`h-1.5 w-full ${card.accent}`} />
                <div className="p-6 flex flex-col flex-1 relative z-10 items-center w-full">
                  <div className="w-full flex justify-center mb-6 h-40 items-center overflow-hidden"><img src={card.promoImage} alt={card.title} className="h-full w-auto object-contain scale-110 group-hover:scale-125 transition-transform duration-500" /></div>
                  <h3 className="font-serif font-bold text-xl text-gray-900 leading-tight mb-3">{card.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-1">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <div className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16"><h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Stories from the Road</h2></div>
        </div>
        <div className="relative z-10 space-y-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          {(['marquee-left','marquee-right'] as const).map((dir,ri)=>(
            <div key={ri} className={`flex gap-6 ${dir} w-max px-6`}>
              {[...REVIEWS,...REVIEWS].map((review,index)=>(
                <div key={`r${ri}-${index}`} className="w-[260px] bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:bg-gray-800/80 transition-colors flex-shrink-0 relative">
                  <Quote className="w-6 h-6 text-primary-500 absolute top-4 right-4 opacity-40" />
                  <div className="flex items-center mb-4">
                    <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full border-2 border-primary-500 mr-3" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{review.user}</h4>
                      <div className="flex text-amber-400 text-xs">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3 h-3 ${i<review.rating?'fill-current':'text-gray-600'}`}/>)}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic leading-relaxed line-clamp-4">"{review.text}"</p>
                  <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide mt-4"><MapPin className="w-3 h-3 mr-1 text-primary-500" />{review.location}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── APP DOWNLOAD CTA ──────────────────────────────────────────────── */}
      <motion.div className="relative bg-primary-600 py-24 px-4 overflow-hidden" initial="hidden" whileInView="visible" viewport={{once:true,margin:'-100px'}} variants={ctaContainerVariants}>
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-primary-400/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
          <motion.div variants={ctaLeftVariants} className="text-white max-w-xl text-center lg:text-left">
            <motion.div variants={ctaBadgeVariants} className="mb-4">
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full"><Sparkles className="w-3.5 h-3.5" /> App Exclusive</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">Unlock App-Only Deals</h2>
            <p className="text-primary-100 text-lg md:text-xl mb-10">Save up to <span className="font-bold text-white">IDR 400.000</span> on your first transaction.</p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              {[
                {src:'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg',alt:'App Store',i:0},
                {src:'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg',alt:'Google Play',i:1},
              ].map(({src,alt,i})=>(
                <motion.a key={alt} href="#" target="_blank" rel="noopener noreferrer" custom={i} variants={ctaButtonVariants} whileHover={{y:-4,scale:1.03,transition:{duration:0.2}}} whileTap={{scale:0.95}} className="flex items-center gap-4 bg-black px-6 py-4 rounded-2xl shadow-xl">
                  <img src={src} alt={alt} className="h-8" />
                </motion.a>
              ))}
            </div>
          </motion.div>
          <motion.div variants={ctaRightVariants} className="flex flex-col items-center">
            <motion.div className="bg-white p-8 rounded-[32px] shadow-2xl" whileHover={{scale:1.05,rotate:1,boxShadow:'0 30px 60px rgba(0,0,0,0.25)',transition:{duration:0.3}}}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://trivgoo.com/app" alt="QR Code Download Trivgoo App" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            </motion.div>
            <motion.div initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} transition={{delay:0.6,duration:0.5}} className="flex items-center gap-2 mt-6">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>
              <span className="text-white text-sm uppercase tracking-widest font-semibold">Scan to download</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <ReferralModal isOpen={isReferralModalOpen} onClose={()=>setIsReferralModalOpen(false)} referralCode="TRIVGOO2025" />
    </div>
  );
};

export default Home;

// pages/ProductDetail.tsx
// ✅ FULL CODE (mockService tetap ada & di-comment sesuai request)

import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Calendar,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Heart,
  Home,
  Image,
  Info,
  Mail,
  MapPin,
  Maximize2,
  Mountain,
  Navigation,
  Phone,
  Share2,
  Star,
  User,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastContext';
import { useWishlist } from '../components/WishlistContext';
import { adminService } from '../services/adminService';
import { CarDetails, Product, StayDetails, TourDetails, TransportCategory } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Date States
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Calendar UI State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [pickerDate, setPickerDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const [guests, setGuests] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Contact Details State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ✅ Fetch product by ADMIN API: /admin/agents/products/:id
  useEffect(() => {
    if (!id) return;

    window.scrollTo(0, 0);

    (async () => {
      try {
        const pid = Number(id);
        if (!Number.isFinite(pid) || pid <= 0) {
          showToast('Invalid product id', 'error');
          return;
        }

        const res = await adminService.getAgentProductDetail(pid);
        const p = res?.data || null;

        setProduct(p);

        // ✅ related products sementara masih mock (comment jangan dihapus)
        // if (p) {
        //   mockService.getRelatedProducts(p.category_id, p.id).then(setRelatedProducts);
        // }

        // Reset states
        setCheckIn('');
        setCheckOut('');
        setGuests(1);
      } catch (e: any) {
        console.error(e);
        showToast(e?.message || 'Failed to load product', 'error');
        setProduct(null);
        setRelatedProducts([]);
      }
    })();

    // ✅ mockService detail tetap ada tapi di-comment (jangan dihapus)
    // mockService.getProductById(Number(id)).then((p) => {
    //   setProduct(p);
    //   if (p) {
    //     mockService.getRelatedProducts(p.category_id, p.id).then(setRelatedProducts);
    //   }
    // });
  }, [id, showToast]);

  useEffect(() => {
    if (user) {
      setContactName(user.name);
      setContactEmail(user.email);
    }
  }, [user]);

  // Click outside to close calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!product) return <div className="p-20 text-center">Loading...</div>;

  const isLiked = isInWishlist(product.id);
  const details = product.details;

  // Type Guards
  const isTour = (d: any): d is TourDetails => d?.type === 'tour';
  const isStay = (d: any): d is StayDetails => d?.type === 'stay';
  const isCar = (d: any): d is CarDetails => d?.type === 'car';

  // Airport transfer behaves like a Tour (Single date)
  const isSingleDaySelection =
    isTour(details) ||
    (isCar(details) && details.transportCategory === TransportCategory.AIRPORT_TRANSFER);

  // --- FLASH SALE LOGIC (kalau belum ada di API, aman karena optional) ---
  const activeFlashSale =
    (product as any).flashSale && (product as any).flashSale.status === 'approved'
      ? (product as any).flashSale
      : null;
  const effectivePrice = activeFlashSale ? activeFlashSale.salePrice : product.price;

  // --- LIGHTBOX LOGIC ---
  const heroImage = (product as any).image_url || product.image;

  const galleryImages =
    product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((x: any) => (typeof x === 'string' ? x : x?.url)).filter(Boolean)
      : [heroImage, heroImage, heroImage, heroImage, heroImage].filter(Boolean);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // --- CALENDAR LOGIC ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const isDateBlocked = (dateStr: string) => {
    if (!(product as any).blocked_dates) return false;
    return (product as any).blocked_dates.includes(dateStr);
  };

  const formatDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateLocal = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = parseDateLocal(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
    const dateStr = formatDateStr(selectedDate);

    if (selectedDate < today) return;

    const blocked = isDateBlocked(dateStr);

    if (isSingleDaySelection) {
      if (blocked) {
        showToast('This date is fully booked or unavailable.', 'error');
        return;
      }
      setCheckIn(dateStr);
      setCheckOut('');
      setIsCalendarOpen(false);
      return;
    }

    if (calendarMode === 'checkIn') {
      if (blocked) {
        showToast('Check-in date is unavailable.', 'error');
        return;
      }
      setCheckIn(dateStr);
      if (checkOut && parseDateLocal(dateStr) >= parseDateLocal(checkOut)) {
        setCheckOut('');
      }
      setCalendarMode('checkOut');
    } else {
      if (parseDateLocal(dateStr) <= parseDateLocal(checkIn)) {
        if (blocked) {
          showToast('Check-in date is unavailable.', 'error');
          return;
        }
        setCheckIn(dateStr);
        setCheckOut('');
        return;
      }

      let ok = true;
      let current = parseDateLocal(checkIn);
      const end = parseDateLocal(dateStr);

      while (current.getTime() < end.getTime()) {
        if (isDateBlocked(formatDateStr(current))) {
          ok = false;
          break;
        }
        current.setDate(current.getDate() + 1);
      }

      if (!ok) {
        showToast('Selected dates include unavailable nights.', 'error');
        return;
      }

      setCheckOut(dateStr);
      setIsCalendarOpen(false);
    }
  };

  const renderCalendar = () => {
    const year = pickerDate.getFullYear();
    const month = pickerDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: React.ReactNode[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateStr(date);

      const blocked = isDateBlocked(dateStr);
      const isPast = date < today;

      let disabled = isPast;
      if (!disabled) {
        if (isSingleDaySelection && blocked) disabled = true;
        else if (calendarMode === 'checkIn' && blocked) disabled = true;
      }

      let selected = false;
      let inRange = false;

      if (isSingleDaySelection) {
        selected = checkIn === dateStr;
      } else {
        selected = checkIn === dateStr || checkOut === dateStr;
        if (checkIn && checkOut) {
          const start = parseDateLocal(checkIn);
          const end = parseDateLocal(checkOut);
          inRange = date > start && date < end;
        }
      }

      const showBlockedStyle = !disabled && blocked;

      days.push(
        <button
          key={day}
          onClick={(e) => {
            e.preventDefault();
            !disabled && handleDateSelect(day);
          }}
          disabled={disabled}
          className={`h-9 w-9 text-xs font-bold rounded-full flex items-center justify-center transition-all relative
              ${
                disabled
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : selected
                  ? 'bg-primary-600 text-white shadow-md z-10'
                  : inRange
                  ? 'bg-primary-50 text-primary-700 rounded-none'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
              }
              ${showBlockedStyle ? 'bg-orange-50 text-orange-400 ring-1 ring-orange-200' : ''}
            `}
          title={
            blocked
              ? calendarMode === 'checkOut' && !isSingleDaySelection
                ? 'Available for Checkout'
                : 'Fully Booked'
              : isPast
              ? 'Past Date'
              : 'Available'
          }
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  const calculateDuration = () => {
    if (isSingleDaySelection) return 1;
    if (!checkIn || !checkOut) return 1;

    const start = parseDateLocal(checkIn);
    const end = parseDateLocal(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const duration = calculateDuration();

  const getUnitCapacity = () => {
    if (isCar(details)) return details.seats;
    if (isStay(details)) return details.rooms * 2;
    return 1;
  };

  const capacity = getUnitCapacity();
  const unitsNeeded = isTour(details) ? guests : Math.ceil(guests / capacity);

  const totalPrice = isTour(details)
    ? effectivePrice * guests
    : effectivePrice * unitsNeeded * duration;

  const priceUnitLabel = isTour(details) ? 'person' : isStay(details) ? 'night' : 'day';
  const itemLabel = isTour(details) ? 'Guest' : isCar(details) ? 'Passenger' : 'Guest';
  const unitLabel = isCar(details) ? 'Car' : isStay(details) ? 'Unit' : 'Ticket';

  const handleBookNow = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!checkIn) {
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsCalendarOpen(true);
        setCalendarMode('checkIn');
      }
      showToast('Please select a date first.', 'info');
      return;
    }

    if (!user) {
      showToast('Please login to continue.', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!isSingleDaySelection && !checkOut) {
      showToast('Please select an end date.', 'error');
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsCalendarOpen(true);
        setCalendarMode('checkOut');
      }
      return;
    }

    setIsProcessing(true);

    const productForPayment = {
      ...product,
      price: effectivePrice,
    };

    navigate('/payment', {
      state: {
        product: productForPayment,
        quantity: isTour(details) ? guests : unitsNeeded,
        guestCount: guests,
        duration: duration,
        totalPrice: totalPrice,
        date: isSingleDaySelection
          ? formatDateDisplay(checkIn)
          : `${formatDateDisplay(checkIn)} - ${formatDateDisplay(checkOut)}`,
        currency: product.currency,
        contactDetails: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
        },
      },
    });
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all md:left-8"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={galleryImages[lightboxIndex]}
            alt="Gallery Fullscreen"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
          />

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all md:right-8"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      {/* Product Hero Image */}
      <div
        className="h-[40vh] md:h-[60vh] relative group cursor-pointer"
        onClick={() => openLightbox(0)}
      >
        <img
          src={heroImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* View Photos Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold flex items-center hover:bg-black/70 transition-colors pointer-events-none">
            <Maximize2 className="w-5 h-5 mr-2" /> View Photos
          </div>
        </div>

        {/* Navigation Overlays */}
        <div className="absolute top-0 w-full p-4 md:p-8 flex justify-between items-start z-10 pt-24 md:pt-28">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
            className="bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-gray-900 p-3 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleToggleLike}
              className={`bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-red-500 p-3 rounded-full transition-all ${
                isLiked ? 'bg-white text-red-500' : ''
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-blue-500 p-3 rounded-full transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center text-white/70 text-sm mb-4 space-x-2">
              <Link to="/" className="hover:text-white transition-colors flex items-center">
                <Home className="w-3 h-3 mr-1" /> Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/explore" className="hover:text-white transition-colors">
                Explore
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium truncate max-w-[200px]">{product.name}</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center px-3 py-1 rounded-lg bg-primary-600 text-white text-xs font-bold uppercase tracking-wider">
                {isTour(details)
                  ? 'Tour Package'
                  : isStay(details)
                  ? 'Luxury Stay'
                  : isCar(details)
                  ? 'Vehicle Rental'
                  : 'Experience'}
              </div>
              {activeFlashSale && (
                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Zap className="w-3 h-3 mr-1 fill-white" /> Flash Sale
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center text-white/90 gap-4 md:gap-8 text-sm md:text-base">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-400" />
                <span className="font-medium">{product.location}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-amber-400 fill-current mr-2" />
                <span className="font-bold">{product.rating}</span>
                <span className="ml-1 opacity-70">
                  ({(product as any).reviews?.length || 0} reviews)
                </span>
              </div>
              {isTour(details) && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary-400" />
                  <span className="font-medium">{details.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:-mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {/* Description Card */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-8">
              <div className="flex space-x-6 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Overview
                </button>
                {isTour(details) && (
                  <button
                    onClick={() => setActiveTab('itinerary')}
                    className={`pb-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap ${
                      activeTab === 'itinerary'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Itinerary
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`pb-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap ${
                    activeTab === 'gallery'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Gallery
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap ${
                    activeTab === 'reviews'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Reviews
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="animate-in fade-in">
                  <p className="text-gray-600 leading-loose text-lg mb-8">{product.description}</p>

                  <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                    <span className="w-1 h-6 bg-primary-500 rounded-full mr-3"></span>
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                    {(product.features || []).map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <Check className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Updated Location Map Section */}
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                      <MapPin className="w-5 h-5 mr-2 text-primary-500" /> Location & Surroundings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 relative rounded-2xl overflow-hidden h-64 border border-gray-200 group cursor-pointer shadow-sm">
                        <img
                          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                          alt="Map View"
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-110"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-bold text-gray-800 text-sm">
                              {product.location}
                            </span>
                          </div>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold shadow-md flex items-center hover:bg-gray-50 border border-gray-100">
                            <Navigation className="w-3 h-3 mr-2" />
                            Open Maps
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                          Nearby Highlights
                        </h4>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                            <Utensils className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">Local Cuisine</p>
                            <p className="text-[10px] text-gray-500">5 mins walk</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">Airport Access</p>
                            <p className="text-[10px] text-gray-500">45 mins drive</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                            <Mountain className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">Scenic Spot</p>
                            <p className="text-[10px] text-gray-500">10 mins drive</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {details && 'rules' in details && (details as any).rules && (
                    <>
                      <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900 mt-8">
                        <Info className="w-5 h-5 mr-2 text-primary-500" /> Important Info
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        {(details as any).rules.map((rule: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {/* GALLERY TAB CONTENT */}
              {activeTab === 'gallery' && (
                <div className="animate-in fade-in">
                  <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                    <Image className="w-5 h-5 mr-2 text-primary-500" /> Photo Gallery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {galleryImages.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => openLightbox(index)}
                        className={`relative rounded-2xl overflow-hidden group shadow-sm cursor-pointer ${
                          index === 0 ? 'md:col-span-2 md:h-80' : 'h-48'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Gallery ${index}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/30 backdrop-blur-sm p-3 rounded-full text-white">
                            <Maximize2 className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REVIEWS TAB CONTENT */}
              {activeTab === 'reviews' && (
                <div className="animate-in fade-in">
                  <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                    <Star className="w-5 h-5 mr-2 text-primary-500 fill-current" /> Customer Reviews
                  </h3>
                  {!(product as any).reviews || (product as any).reviews.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl">
                      <p className="text-gray-500">
                        No reviews yet. Be the first to review this adventure!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {(product as any).reviews.map((review: any) => (
                        <div
                          key={review.id}
                          className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold mr-3">
                                {review.userName?.charAt?.(0) || 'U'}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">
                                  {review.userName}
                                </h4>
                                <span className="text-xs text-gray-400">{review.date}</span>
                              </div>
                            </div>
                            <div className="flex bg-amber-50 px-2 py-1 rounded-lg">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TOUR ITINERARY */}
              {activeTab === 'itinerary' && isTour(details) && (
                <div className="space-y-8 animate-in fade-in">
                  {details.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="relative pl-8 border-l-2 border-gray-100 last:border-0"
                    >
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-500 border-4 border-white shadow-sm"></div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        Day {day.day}: {day.title}
                      </h4>
                      <p className="text-gray-600 mb-4 leading-relaxed">{day.description}</p>

                      <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-3 border border-gray-100">
                        {day.accommodation && (
                          <div className="flex items-center text-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mr-3 shadow-sm text-blue-600">
                              <BedDouble className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-400 uppercase block">
                                Accommodation
                              </span>
                              <span className="font-medium">{day.accommodation}</span>
                            </div>
                          </div>
                        )}
                        {day.meals && day.meals.length > 0 && (
                          <div className="flex items-center text-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mr-3 shadow-sm text-orange-500">
                              <Utensils className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-400 uppercase block">
                                Meals Included
                              </span>
                              <span className="font-medium">{day.meals.join(', ')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RELATED PRODUCTS SECTION */}
            {relatedProducts.length > 0 && (
              <div className="mt-16 animate-in fade-in slide-in-from-bottom-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-serif font-bold text-gray-900">
                    You Might Also Like
                  </h3>
                  <Link
                    to="/explore"
                    className="text-primary-600 font-bold text-sm hover:underline flex items-center"
                  >
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProducts.map((rp) => (
                    <Link
                      key={rp.id}
                      to={`/product/${rp.id}`}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden group hover:-translate-y-1 block"
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={(rp as any).image_url || rp.image}
                          alt={rp.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                          {rp.rating} ⭐
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3 mr-1" /> {rp.location}
                        </div>
                        <h4 className="font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {rp.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary-600">
                            {rp.currency} {rp.price}
                          </span>
                          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            Details
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card - Sticky */}
          <div className="lg:col-span-1" id="booking-section" ref={bookingSectionRef}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-28 relative overflow-hidden">
              {activeFlashSale && (
                <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-center py-1 text-xs font-bold uppercase tracking-wider animate-pulse">
                  ⚡ Limited Time Offer Ends in 24h
                </div>
              )}

              <div className="flex justify-between items-end mb-8 pb-6 border-b border-gray-100 mt-4">
                <div>
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                    Price per {priceUnitLabel}
                  </span>
                  <div className="flex items-end gap-2 mt-1">
                    {activeFlashSale && (
                      <span className="text-lg text-gray-400 line-through mb-1">
                        {product.currency} {product.price}
                      </span>
                    )}
                    <div
                      className={`text-3xl font-bold ${
                        activeFlashSale ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {product.currency} {effectivePrice}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                    Available Today
                  </div>
                </div>
              </div>

              <form onSubmit={handleBookNow} className="space-y-5">
                {/* CALENDAR SECTION */}
                <div className="relative" ref={calendarRef}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {isSingleDaySelection ? 'Select Date' : 'Select Dates'}
                  </label>
                  <div
                    onClick={() => {
                      setIsCalendarOpen(true);
                      setCalendarMode('checkIn');
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    <div className="flex items-center text-gray-700 text-sm font-medium">
                      <Calendar className="w-4 h-4 mr-3 text-primary-500" />
                      {checkIn ? (
                        isSingleDaySelection ? (
                          formatDateDisplay(checkIn)
                        ) : (
                          `${formatDateDisplay(checkIn)} — ${
                            checkOut ? formatDateDisplay(checkOut) : 'End Date'
                          }`
                        )
                      ) : (
                        <span className="text-gray-400">
                          Select {isSingleDaySelection ? 'Date' : 'Dates'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CALENDAR POPUP */}
                  {isCalendarOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl p-5 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-center gap-3 mb-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase">
                          <span className="w-2 h-2 rounded-full bg-primary-600 mr-1.5"></span>{' '}
                          Selected
                        </div>
                        <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase">
                          <span className="w-2 h-2 rounded-full bg-orange-400 mr-1.5"></span>{' '}
                          Full/Busy
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={handlePrevMonth}
                          className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h4 className="text-sm font-bold text-gray-900">
                          {months[pickerDate.getMonth()]} {pickerDate.getFullYear()}
                        </h4>
                        <button
                          onClick={handleNextMonth}
                          className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                          <div key={i} className="text-[10px] font-bold text-gray-400">
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 place-items-center">
                        {renderCalendar()}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                        <button
                          onClick={() => setIsCalendarOpen(false)}
                          className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {checkIn && checkOut && !isSingleDaySelection && (
                  <div className="p-3 bg-primary-50 rounded-xl text-center">
                    <span className="text-xs font-bold text-primary-700">
                      {duration} {isStay(details) ? 'Nights' : 'Days'} Selected
                    </span>
                  </div>
                )}

                {/* Guests/Units Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {itemLabel}s{' '}
                    {unitsNeeded > 1 && !isTour(details) && (
                      <span className="text-orange-500 ml-1">
                        ({unitsNeeded} {unitLabel}s required)
                      </span>
                    )}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    <input
                      type="number"
                      min="1"
                      max={isTour(details) ? 20 : 30}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium bg-gray-50 focus:bg-white transition-all text-sm"
                      value={guests}
                      onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  {!isTour(details) && (
                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                      Max capacity per {unitLabel.toLowerCase()}: {capacity}{' '}
                      {itemLabel.toLowerCase()}s
                    </p>
                  )}
                </div>

                {/* CONTACT DETAILS SECTION */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    Contact Details (E-Ticket)
                  </h4>

                  <div className="space-y-3">
                    <div className="relative group">
                      <User className="absolute left-4 top-3 w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3 w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-3 w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 pb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    {isTour(details) ? (
                      <span>
                        {product.currency} {effectivePrice} x {guests} {itemLabel.toLowerCase()}s
                      </span>
                    ) : (
                      <span>
                        {product.currency} {effectivePrice} x {unitsNeeded}{' '}
                        {unitLabel.toLowerCase()}(s) x {duration}{' '}
                        {isStay(details) ? 'night' : 'day'}(s)
                      </span>
                    )}
                    <span className="font-medium">
                      {product.currency} {totalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Service fee</span>
                    <span className="font-medium">{product.currency} 0</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl pt-4 border-t border-dashed border-gray-200">
                    <span>Total</span>
                    <span className="text-primary-600">
                      {product.currency} {totalPrice}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-600 transition-all shadow-xl shadow-gray-900/20 disabled:opacity-50 flex justify-center items-center transform active:scale-[0.98]"
                >
                  <CreditCard className="w-5 h-5 mr-3" />
                  Reserve Now
                </button>
                <p className="text-center text-xs text-gray-400 font-medium">
                  You won't be charged yet
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 md:hidden z-40 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Total Price
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-primary-600">
              {product.currency} {totalPrice}
            </span>
            {isStay(details) && duration > 1 && (
              <span className="text-xs text-gray-400">/{duration} nights</span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => handleBookNow(e)}
          className="bg-gray-900 active:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-gray-900/20 active:scale-95 transition-all transform"
        >
          {checkIn ? 'Reserve' : 'Check Availability'}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;

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
  ShoppingCart,
  Star,
  User,
  Utensils,
  X,
  Zap,
  Fuel,
  Gauge,
  Briefcase,
  Users,
  UserCog,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useToast } from "../components/ToastContext";
import { useWishlist } from "../components/WishlistContext";
import { useCart } from "../components/CartContext";
import { agentProductService } from "../services/agentProductService";
import {
  CarDetails,
  Product,
  StayDetails,
  TourDetails,
  TransportCategory,
} from "../types";
import { getImageUrl, FALLBACK_IMAGE } from '../utils/imageUtils';

type LatLng = { lat: number; lng: number };

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Date utilities
const formatDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateLocal = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Type guard functions
const isTour = (d: any): d is TourDetails => d?.type === "tour";
const isStay = (d: any): d is StayDetails => d?.type === "stay";
const isCar = (d: any): d is CarDetails => d?.type === "car";

// Car Detail Component
const CarProductDetail: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const isLoggedIn = !!user;
  const isLiked = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const details = product.details as CarDetails;

  const [coords, setCoords] = useState<LatLng | null>(null);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"pickup" | "return">("pickup");
  const [pickerDate, setPickerDate] = useState(new Date());
  const [withDriver, setWithDriver] = useState(details.driver || false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    phone: false,
    pickupDate: false,
    returnDate: false,
  });

  const calendarRef = useRef<HTMLDivElement>(null);
  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const activeFlashSale =
    (product as any).flashSale && (product as any).flashSale.status === "approved"
      ? (product as any).flashSale
      : null;
  const effectivePrice = activeFlashSale ? activeFlashSale.salePrice : product.price;

  const heroImage = getImageUrl((product as any).image_url || product.image);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPickupDate(formatDateStr(today));
    setReturnDate(formatDateStr(tomorrow));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      setContactName(user.name);
      setContactEmail(user.email);
    }
  }, [user]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = parseDateLocal(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
    const dateStr = formatDateStr(selectedDate);
    if (selectedDate < today) return;
    const blocked = isDateBlocked(dateStr);

    if (blocked) {
      showToast("Date is not available", "error");
      return;
    }

    if (calendarMode === "pickup") {
      setPickupDate(dateStr);
      setTouchedFields(prev => ({ ...prev, pickupDate: true }));
      if (returnDate && parseDateLocal(dateStr) >= parseDateLocal(returnDate)) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setReturnDate(formatDateStr(nextDay));
        setTouchedFields(prev => ({ ...prev, returnDate: true }));
      }
      setCalendarMode("return");
    } else {
      if (parseDateLocal(dateStr) <= parseDateLocal(pickupDate)) {
        showToast("Return date must be after pickup date", "error");
        return;
      }
      setReturnDate(dateStr);
      setTouchedFields(prev => ({ ...prev, returnDate: true }));
      setIsCalendarOpen(false);
    }
  };

  const handleFieldBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
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

      let isSelected = false;
      if (calendarMode === "pickup") {
        isSelected = pickupDate === dateStr;
      } else {
        isSelected = returnDate === dateStr;
      }

      const isInRange = pickupDate && returnDate &&
        date > parseDateLocal(pickupDate) && date < parseDateLocal(returnDate);

      days.push(
        <button
          key={day}
          onClick={() => !isPast && !blocked && handleDateSelect(day)}
          disabled={isPast || blocked}
          className={`h-9 w-9 text-xs font-medium rounded-lg flex items-center justify-center transition-all
            ${isPast || blocked ? "text-gray-300 cursor-not-allowed bg-gray-50"
              : isSelected ? "bg-primary-600 text-white shadow-md"
              : isInRange ? "bg-primary-50 text-primary-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-primary-600"
            }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  const calculateDuration = () => {
    if (!pickupDate || !returnDate) return 1;
    const start = parseDateLocal(pickupDate);
    const end = parseDateLocal(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const duration = calculateDuration();
  const totalPrice = effectivePrice * duration;

  const getTransmissionLabel = (transmission?: string) => {
    if (!transmission) return "-";
    return transmission.toLowerCase() === "automatic" ? "Matic" : "Manual";
  };

  const getFuelPolicyLabel = (policy?: string) => {
    if (!policy) return "Kebijakan Bahan Bakar";
    const policyMap: Record<string, string> = {
      "Full to Full": "Full to Full",
      "Full to Empty": "Full to Empty",
      "Same to Same": "Same to Same",
    };
    return policyMap[policy] || policy;
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[0-9+\-\s()]{8,20}$/;
    return re.test(phone);
  };

  const isFormValid = () => {
    if (!pickupDate) {
      showToast("Please select pickup date", "error");
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    if (!returnDate) {
      showToast("Please select return date", "error");
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    if (!contactName.trim()) {
      showToast("Please enter your full name", "error");
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    if (!contactEmail.trim()) {
      showToast("Please enter your email", "error");
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    if (!validateEmail(contactEmail)) {
      showToast("Please enter a valid email address", "error");
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    if (!contactPhone.trim()) {
      showToast("Please enter your phone number", "error");
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    if (!validatePhone(contactPhone)) {
      showToast("Please enter a valid phone number (8-20 digits)", "error");
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    return true;
  };

  const faqs = [
    {
      question: "Apa saja yang termasuk dalam harga sewa?",
      answer: "Harga sewa sudah termasuk mobil, pajak, dan asuransi dasar. Belum termasuk bahan bakar, tol, parkir, dan biaya pengemudi jika menggunakan layanan dengan sopir."
    },
    {
      question: "Apakah bisa mengembalikan mobil di lokasi berbeda?",
      answer: "Ya, tersedia opsi one-way rental dengan biaya tambahan. Silakan hubungi customer service untuk informasi lebih lanjut."
    },
    {
      question: "Bagaimana kebijakan pembatalan?",
      answer: "Pembatalan gratis hingga 24 jam sebelum waktu pengambilan. Pembatalan kurang dari 24 jam akan dikenakan biaya 50% dari total harga."
    },
    {
      question: "Apakah ada batasan kilometer?",
      answer: "Tidak ada batasan kilometer untuk rental harian. Untuk rental bulanan, ada batasan kilometer yang akan diinformasikan saat pemesanan."
    }
  ];

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard!");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) return;
    addToCart(product, 1);
    showToast(`${product.name} ditambahkan ke keranjang!`, "success");
  };

  const handleBookNow = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("Please login to continue.", "info");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!isFormValid()) {
      return;
    }

    setIsProcessing(true);

    navigate("/checkout-summary", {
      state: {
        productId: product.id,
        productName: product.name,
        location: product.location,
        date: `${pickupDate} - ${returnDate}`,
        pax: 1,
        pricePerPax: effectivePrice,
        totalPrice: totalPrice,
        image: heroImage,
        currency: product.currency,
        duration: duration,
        contactDetails: { 
          name: contactName, 
          email: contactEmail, 
          phone: contactPhone 
        },
        vehicleType: "car",
        transmission: details.transmission,
        seats: details.seats,
        luggage: details.luggage,
        year: details.year,
        fuelPolicy: details.fuelPolicy,
        withDriver: withDriver,
        pickupTime: pickupTime,
        returnTime: returnTime,
      },
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "unset";
  };

  const getInputClassName = (field: keyof typeof touchedFields, isValid: boolean = true) => {
    const baseClass = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors";
    if (!touchedFields[field]) return baseClass + " border-gray-300";
    return baseClass + (isValid ? " border-gray-300" : " border-red-500 bg-red-50");
  };

  return (
    <div className="bg-white min-h-screen pt-20 pb-24">
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
          <img src={heroImage} alt={product.name} className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" />
        </div>
      )}

      {/* Back Button */}
      <div className="fixed top-20 left-4 z-40">
        <button
          onClick={() => navigate(-1)}
          className="bg-white shadow-lg hover:shadow-xl text-gray-700 p-3 rounded-full transition-all border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Car Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={heroImage}
                alt={product.name}
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
              <button
                onClick={() => openLightbox(0)}
                className="absolute bottom-4 right-4 bg-black/70 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
                View Fullscreen
              </button>
            </div>

            {/* Car Title and Rating */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {details.transportCategory || "Rental Mobil"}
                  </span>
                  {details.transmission && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      {getTransmissionLabel(details.transmission)}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{product.rating}</span>
                    <span className="text-gray-500">({(product as any).reviews?.length || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {product.location}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleLike}
                  className={`p-3 rounded-full transition-colors border ${
                    isLiked 
                      ? "bg-red-50 border-red-200 text-red-500" 
                      : "bg-gray-50 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-gray-50 border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Key Specifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="text-center">
                <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Penumpang</div>
                <div className="font-bold text-lg">{details.seats} Orang</div>
              </div>
              <div className="text-center">
                <Briefcase className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Bagasi</div>
                <div className="font-bold text-lg">{details.luggage || '-'} Koper</div>
              </div>
              <div className="text-center">
                <Gauge className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Transmisi</div>
                <div className="font-bold text-lg">{getTransmissionLabel(details.transmission)}</div>
              </div>
              <div className="text-center">
                <Award className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Tahun</div>
                <div className="font-bold text-lg">{details.year || '-'}</div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold mb-4">Deskripsi Mobil</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold mb-4">Fasilitas & Layanan</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {details.driver && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <UserCog className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <span className="text-sm">Sopir tersedia</span>
                    </div>
                  )}
                  {details.fuelPolicy && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Fuel className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <span className="text-sm">{getFuelPolicyLabel(details.fuelPolicy)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fuel Policy & Requirements */}
            {(details.fuelPolicy || details.requirements?.length > 0) && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold mb-4">Kebijakan & Persyaratan</h2>
                <div className="space-y-4">
                  {details.fuelPolicy && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                      <Fuel className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-blue-900 mb-1">Kebijakan Bahan Bakar</h3>
                        <p className="text-sm text-blue-800">{getFuelPolicyLabel(details.fuelPolicy)}</p>
                      </div>
                    </div>
                  )}
                  {details.requirements && details.requirements.length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Persyaratan Penyewa</h3>
                        <ul className="space-y-1">
                          {details.requirements.map((req, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2"></span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold mb-4">Pertanyaan Umum</h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFaq === idx ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    {expandedFaq === idx && (
                      <div className="px-4 pb-3 text-sm text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1" ref={bookingSectionRef}>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
              {/* Price */}
              <div className="mb-6">
                <span className="text-sm text-gray-500">Harga per hari</span>
                <div className="flex items-baseline gap-2">
                  {activeFlashSale && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(product.price, product.currency)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-primary-600">
                    {formatCurrency(effectivePrice, product.currency)}
                  </span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Ambil <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => {
                      setIsCalendarOpen(true);
                      setCalendarMode("pickup");
                    }}
                    className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between cursor-pointer hover:border-primary-400 transition-colors ${
                      touchedFields.pickupDate && !pickupDate 
                        ? "border-red-500 bg-red-50" 
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{formatDateDisplay(pickupDate)}</span>
                    </div>
                    <span className="text-sm text-gray-500">{pickupTime}</span>
                  </div>
                  {touchedFields.pickupDate && !pickupDate && (
                    <p className="text-xs text-red-500 mt-1">Tanggal ambil harus dipilih</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Kembali <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => {
                      setIsCalendarOpen(true);
                      setCalendarMode("return");
                    }}
                    className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between cursor-pointer hover:border-primary-400 transition-colors ${
                      touchedFields.returnDate && !returnDate 
                        ? "border-red-500 bg-red-50" 
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{formatDateDisplay(returnDate)}</span>
                    </div>
                    <span className="text-sm text-gray-500">{returnTime}</span>
                  </div>
                  {touchedFields.returnDate && !returnDate && (
                    <p className="text-xs text-red-500 mt-1">Tanggal kembali harus dipilih</p>
                  )}
                </div>

                {/* Calendar Popup */}
                {isCalendarOpen && (
                  <div className="relative" ref={calendarRef}>
                    <div className="absolute top-0 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="font-bold">
                          {months[pickerDate.getMonth()]} {pickerDate.getFullYear()}
                        </h3>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                          <div key={day} className="text-center text-xs font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600">Durasi Sewa</span>
                  <span className="font-bold text-gray-900">{duration} Hari</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {formatCurrency(effectivePrice, product.currency)} x {duration} hari
                  </span>
                  <span className="font-medium">{formatCurrency(totalPrice, product.currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t border-dashed border-gray-200">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(totalPrice, product.currency)}</span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3">Kontak Penyewa</h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nama Lengkap *"
                      className={getInputClassName('name', contactName.trim() !== '')}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      onBlur={() => handleFieldBlur('name')}
                    />
                    {touchedFields.name && !contactName.trim() && (
                      <p className="text-xs text-red-500 mt-1">Nama lengkap harus diisi</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email *"
                      className={getInputClassName('email', validateEmail(contactEmail))}
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      onBlur={() => handleFieldBlur('email')}
                    />
                    {touchedFields.email && !contactEmail.trim() && (
                      <p className="text-xs text-red-500 mt-1">Email harus diisi</p>
                    )}
                    {touchedFields.email && contactEmail.trim() && !validateEmail(contactEmail) && (
                      <p className="text-xs text-red-500 mt-1">Email tidak valid</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Nomor Telepon *"
                      className={getInputClassName('phone', validatePhone(contactPhone))}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      onBlur={() => handleFieldBlur('phone')}
                    />
                    {touchedFields.phone && !contactPhone.trim() && (
                      <p className="text-xs text-red-500 mt-1">Nomor telepon harus diisi</p>
                    )}
                    {touchedFields.phone && contactPhone.trim() && !validatePhone(contactPhone) && (
                      <p className="text-xs text-red-500 mt-1">Nomor telepon tidak valid (min. 8 digit)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isLoggedIn && (
                  <button
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2
                      ${inCart
                        ? "bg-green-50 text-green-600 cursor-default border-2 border-green-500"
                        : "bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-400 hover:text-primary-600"
                      }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {inCart ? "Sudah di Keranjang" : "Masukkan Keranjang"}
                  </button>
                )}

                <button
                  onClick={handleBookNow}
                  disabled={isProcessing}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  {isProcessing ? "Memproses..." : "Pesan Sekarang"}
                </button>

                <p className="text-xs text-center text-gray-500">
                  Anda belum akan ditagih
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Non-Car Product Detail Component
const NonCarProductDetail: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const isLoggedIn = !!user;
  const isLiked = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const details = product.details;

  const [coords, setCoords] = useState<LatLng | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"checkIn" | "checkOut">("checkIn");
  const [pickerDate, setPickerDate] = useState(new Date());
  const [guests, setGuests] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const calendarRef = useRef<HTMLDivElement>(null);
  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const isSingleDaySelection =
    isTour(details) ||
    (isCar(details) && details.transportCategory === TransportCategory.AIRPORT_TRANSFER);

  const activeFlashSale =
    (product as any).flashSale && (product as any).flashSale.status === "approved"
      ? (product as any).flashSale
      : null;
  const effectivePrice = activeFlashSale ? activeFlashSale.salePrice : product.price;

  const heroImage = getImageUrl((product as any).image_url || product.image);

  const galleryImages = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
        .map((x: any) => getImageUrl(typeof x === "string" ? x : x?.url))
        .filter(Boolean)
    : [heroImage, heroImage, heroImage, heroImage, heroImage].filter(Boolean);

  useEffect(() => {
    if (user) {
      setContactName(user.name);
      setContactEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = parseDateLocal(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
    const dateStr = formatDateStr(selectedDate);
    if (selectedDate < today) return;
    const blocked = isDateBlocked(dateStr);

    if (isSingleDaySelection) {
      if (blocked) { showToast("This date is fully booked or unavailable.", "error"); return; }
      setCheckIn(dateStr);
      setCheckOut("");
      setIsCalendarOpen(false);
      return;
    }

    if (calendarMode === "checkIn") {
      if (blocked) { showToast("Check-in date is unavailable.", "error"); return; }
      setCheckIn(dateStr);
      if (checkOut && parseDateLocal(dateStr) >= parseDateLocal(checkOut)) setCheckOut("");
      setCalendarMode("checkOut");
    } else {
      if (parseDateLocal(dateStr) <= parseDateLocal(checkIn)) {
        if (blocked) { showToast("Check-in date is unavailable.", "error"); return; }
        setCheckIn(dateStr);
        setCheckOut("");
        return;
      }
      let ok = true;
      let current = parseDateLocal(checkIn);
      const end = parseDateLocal(dateStr);
      while (current.getTime() < end.getTime()) {
        if (isDateBlocked(formatDateStr(current))) { ok = false; break; }
        current.setDate(current.getDate() + 1);
      }
      if (!ok) { showToast("Selected dates include unavailable nights.", "error"); return; }
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
        else if (calendarMode === "checkIn" && blocked) disabled = true;
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
          onClick={(e) => { e.preventDefault(); !disabled && handleDateSelect(day); }}
          disabled={disabled}
          className={`h-9 w-9 text-xs font-bold rounded-full flex items-center justify-center transition-all relative
            ${disabled ? "text-gray-300 cursor-not-allowed bg-gray-50"
              : selected ? "bg-primary-600 text-white shadow-md z-10"
              : inRange ? "bg-primary-50 text-primary-700 rounded-none"
              : "text-gray-700 hover:bg-gray-100 hover:text-primary-600"}
            ${showBlockedStyle ? "bg-orange-50 text-orange-400 ring-1 ring-orange-200" : ""}`}
          title={blocked ? (calendarMode === "checkOut" && !isSingleDaySelection ? "Available for Checkout" : "Fully Booked") : isPast ? "Past Date" : "Available"}
        >
          {day}
        </button>
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
    if (isStay(details)) return details.rooms * 2;
    return 1;
  };

  const capacity = getUnitCapacity();
  const unitsNeeded = isTour(details) ? guests : Math.ceil(guests / capacity);

  const totalPrice = isTour(details)
    ? effectivePrice * guests
    : effectivePrice * unitsNeeded * duration;

  const priceUnitLabel = isTour(details) ? "person" : isStay(details) ? "night" : "day";
  const itemLabel = isTour(details) ? "Guest" : "Guest";
  const unitLabel = isStay(details) ? "Unit" : "Ticket";

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard!");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) return;
    addToCart(product, 1);
    showToast(`${product.name} ditambahkan ke keranjang!`, "success");
  };

  const handleBookNow = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!checkIn) {
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        setIsCalendarOpen(true);
        setCalendarMode("checkIn");
      }
      showToast("Please select a date first.", "info");
      return;
    }

    if (!user) {
      showToast("Please login to continue.", "info");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!isSingleDaySelection && !checkOut) {
      showToast("Please select an end date.", "error");
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        setIsCalendarOpen(true);
        setCalendarMode("checkOut");
      }
      return;
    }

    setIsProcessing(true);

    navigate("/checkout-summary", {
      state: {
        productName: product.name,
        location: product.location,
        date: isSingleDaySelection ? checkIn : `${checkIn} - ${checkOut}`,
        pax: isTour(details) ? guests : unitsNeeded,
        pricePerPax: effectivePrice,
        totalPrice: totalPrice,
        image: heroImage,
        currency: product.currency,
        duration: duration,
        guestCount: guests,
        unitLabel: unitLabel,
        priceUnitLabel: priceUnitLabel,
        contactDetails: { name: contactName, email: contactEmail, phone: contactPhone },
      },
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "unset";
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleOpenMaps = () => {
    const gmaps = buildGoogleMapsUrl(product, coords);
    window.open(gmaps, "_blank", "noopener,noreferrer");
  };

  const buildGoogleMapsUrl = (p: Product | null, c: LatLng | null) => {
    if (c) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.lat},${c.lng}`)}`;
    const q = (p as any)?.location || (p as any)?.name || "";
    if (typeof q === "string" && q.trim()) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q.trim())}`;
    return "https://www.google.com/maps";
  };

  const buildAppleMapsUrl = (p: Product | null, c: LatLng | null) => {
    const label = (p as any)?.name || (p as any)?.location || "Destination";
    if (c) return `https://maps.apple.com/?ll=${encodeURIComponent(`${c.lat},${c.lng}`)}&q=${encodeURIComponent(String(label))}`;
    const q = (p as any)?.location || (p as any)?.name || "";
    if (typeof q === "string" && q.trim()) return `https://maps.apple.com/?q=${encodeURIComponent(q.trim())}`;
    return "https://maps.apple.com/";
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-20 pb-24">
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
          <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all md:left-8">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img src={galleryImages[lightboxIndex]} alt="Gallery Fullscreen" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" />
          <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all md:right-8">
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="fixed top-20 left-4 z-40">
        <button
          onClick={() => navigate(-1)}
          className="bg-white shadow-lg hover:shadow-xl text-gray-700 p-3 rounded-full transition-all border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Product Hero Image */}
      <div className="h-[40vh] md:h-[60vh] relative group cursor-pointer" onClick={() => openLightbox(0)}>
        <img 
          src={heroImage} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold flex items-center hover:bg-black/70 transition-colors pointer-events-none">
            <Maximize2 className="w-5 h-5 mr-2" /> View Photos
          </div>
        </div>

        {/* Like & Share Buttons */}
        <div className="absolute top-24 right-4 md:right-8 flex gap-2 z-10">
          <button
            onClick={handleToggleLike}
            className={`bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full transition-all shadow-lg ${
              isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-600 hover:text-blue-500 p-3 rounded-full transition-all shadow-lg"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center px-3 py-1 rounded-lg bg-primary-600 text-white text-xs font-bold uppercase tracking-wider">
                {isTour(details) ? "Tour Package" : isStay(details) ? "Luxury Stay" : "Experience"}
              </div>
              {activeFlashSale && (
                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Zap className="w-3 h-3 mr-1 fill-white" /> Flash Sale
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">{product.name}</h1>
            <div className="flex flex-wrap items-center text-white/90 gap-4 md:gap-8 text-sm md:text-base">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-400" />
                <span className="font-medium">{product.location}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-amber-400 fill-current mr-2" />
                <span className="font-bold">{product.rating}</span>
                <span className="ml-1 opacity-70">({(product as any).reviews?.length || 0} reviews)</span>
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
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-8">
              <div className="flex space-x-6 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
                {["overview", isTour(details) ? "itinerary" : null, "gallery", "reviews"]
                  .filter(Boolean)
                  .map((tab) => (
                    <button
                      key={tab!}
                      onClick={() => setActiveTab(tab!)}
                      className={`pb-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap ${
                        activeTab === tab
                          ? "text-primary-600 border-b-2 border-primary-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab === "itinerary" ? "Itinerary" : tab!.charAt(0).toUpperCase() + tab!.slice(1)}
                    </button>
                  ))}
              </div>

              {activeTab === "overview" && (
                <div className="animate-in fade-in">
                  <p className="text-gray-600 leading-loose text-lg mb-8">{product.description}</p>
                  <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                    <span className="w-1 h-6 bg-primary-500 rounded-full mr-3"></span>Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                    {Array.isArray(product?.features) && product.features.length > 0 ? (
                      product.features.filter((item) => item && item.trim() !== "").map((feature, idx) => (
                        <div key={idx} className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <Check className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="font-medium text-sm md:text-base">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 italic text-sm col-span-2 ml-4">No features listed for this product.</p>
                    )}
                  </div>

                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                      <MapPin className="w-5 h-5 mr-2 text-primary-500" /> Location & Surroundings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 relative rounded-2xl overflow-hidden h-64 border border-gray-200 group cursor-pointer shadow-sm">
                        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map View" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-110" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-bold text-gray-800 text-sm">{product.location}</span>
                          </div>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenMaps(); }} className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold shadow-md flex items-center hover:bg-gray-50 border border-gray-100">
                            <Navigation className="w-3 h-3 mr-2" /> Open Maps
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-mono text-gray-700 border border-gray-100 shadow-sm">
                          {typeof coords?.lat === 'number' && typeof coords?.lng === 'number'
                            ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : "lat/lng: -"}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Nearby Highlights</h4>
                        {[
                          { icon: Utensils, color: "orange", label: "Local Cuisine", sub: "5 mins walk" },
                          { icon: Car, color: "blue", label: "Airport Access", sub: "45 mins drive" },
                          { icon: Mountain, color: "green", label: "Scenic Spot", sub: "10 mins drive" },
                        ].map(({ icon: Icon, color, label, sub }) => (
                          <div key={label} className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center text-${color}-600 mr-3`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{label}</p>
                              <p className="text-[10px] text-gray-500">{sub}</p>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => { const url = buildAppleMapsUrl(product, coords); window.open(url, "_blank", "noopener,noreferrer"); }} className="w-full mt-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center">
                          <Navigation className="w-3 h-3 mr-2" /> Open Apple Maps
                        </button>
                      </div>
                    </div>
                  </div>

                  {details && "rules" in details && (details as any).rules && (
                    <>
                      <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900 mt-8">
                        <Info className="w-5 h-5 mr-2 text-primary-500" /> Important Info
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        {(details as any).rules.map((rule: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>{rule}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="animate-in fade-in">
                  <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                    <Image className="w-5 h-5 mr-2 text-primary-500" /> Photo Gallery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {galleryImages.map((img, index) => (
                      <div key={index} onClick={() => openLightbox(index)} className={`relative rounded-2xl overflow-hidden group shadow-sm cursor-pointer ${index === 0 ? "md:col-span-2 md:h-80" : "h-48"}`}>
                        <img 
                          src={img} 
                          alt={`Gallery ${index}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/30 backdrop-blur-sm p-3 rounded-full text-white"><Maximize2 className="w-6 h-6" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="animate-in fade-in">
                  <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                    <Star className="w-5 h-5 mr-2 text-primary-500 fill-current" /> Customer Reviews
                  </h3>
                  {!(product as any).reviews || (product as any).reviews.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl">
                      <p className="text-gray-500">No reviews yet. Be the first to review this adventure!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {(product as any).reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold mr-3">{review.userName?.charAt?.(0) || "U"}</div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">{review.userName}</h4>
                                <span className="text-xs text-gray-400">{review.date}</span>
                              </div>
                            </div>
                            <div className="flex bg-amber-50 px-2 py-1 rounded-lg">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
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

              {activeTab === "itinerary" && isTour(details) && (
                <div className="space-y-8 animate-in fade-in">
                  {details.itinerary.map((day) => (
                    <div key={day.day} className="relative pl-8 border-l-2 border-gray-100 last:border-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-500 border-4 border-white shadow-sm"></div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Day {day.day}: {day.title}</h4>
                      <p className="text-gray-600 mb-4 leading-relaxed">{day.description}</p>
                      <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-3 border border-gray-100">
                        {day.accommodation && (
                          <div className="flex items-center text-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mr-3 shadow-sm text-blue-600"><BedDouble className="w-4 h-4" /></div>
                            <div><span className="text-xs font-bold text-gray-400 uppercase block">Accommodation</span><span className="font-medium">{day.accommodation}</span></div>
                          </div>
                        )}
                        {day.meals && day.meals.length > 0 && (
                          <div className="flex items-center text-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mr-3 shadow-sm text-orange-500"><Utensils className="w-4 h-4" /></div>
                            <div><span className="text-xs font-bold text-gray-400 uppercase block">Meals Included</span><span className="font-medium">{day.meals.join(", ")}</span></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1" id="booking-section" ref={bookingSectionRef}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-24 relative overflow-hidden">
              {activeFlashSale && (
                <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-center py-1 text-xs font-bold uppercase tracking-wider animate-pulse">
                  ⚡ Limited Time Offer Ends in 24h
                </div>
              )}

              <div className="flex justify-between items-end mb-8 pb-6 border-t border-gray-100 mt-4">
                <div>
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Price per {priceUnitLabel}</span>
                  <div className="flex items-end gap-2 mt-1">
                    {activeFlashSale && <span className="text-lg text-gray-400 line-through mb-1">{product.currency} {Number(product.price).toLocaleString('id-ID')}</span>}
                    <div className={`text-3xl font-bold ${activeFlashSale ? "text-red-600" : "text-gray-900"}`}>{product.currency} {Number(effectivePrice).toLocaleString('id-ID')}</div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBookNow} className="space-y-5">
                {/* Calendar */}
                <div className="relative" ref={calendarRef}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {isSingleDaySelection ? "Select Date" : "Select Dates"}
                  </label>
                  <div onClick={() => { setIsCalendarOpen(true); setCalendarMode("checkIn"); }} className="w-full px-4 py-3 border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-50 bg-white">
                    <div className="flex items-center text-gray-700 text-sm font-medium">
                      <Calendar className="w-4 h-4 mr-3 text-primary-500" />
                      {checkIn ? (isSingleDaySelection ? formatDateDisplay(checkIn) : `${formatDateDisplay(checkIn)} — ${checkOut ? formatDateDisplay(checkOut) : "End Date"}`) : <span className="text-gray-400">Select {isSingleDaySelection ? "Date" : "Dates"}</span>}
                    </div>
                  </div>

                  {isCalendarOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl p-5 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-center gap-3 mb-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase"><span className="w-2 h-2 rounded-full bg-primary-600 mr-1.5"></span> Selected</div>
                        <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase"><span className="w-2 h-2 rounded-full bg-orange-400 mr-1.5"></span> Full/Busy</div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft className="w-4 h-4" /></button>
                        <h4 className="text-sm font-bold text-gray-900">{months[pickerDate.getMonth()]} {pickerDate.getFullYear()}</h4>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} className="text-[10px] font-bold text-gray-400">{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1 place-items-center">{renderCalendar()}</div>
                      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                        <button onClick={() => setIsCalendarOpen(false)} className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase">Close</button>
                      </div>
                    </div>
                  )}
                </div>

                {checkIn && checkOut && !isSingleDaySelection && (
                  <div className="p-3 bg-primary-50 rounded-xl text-center">
                    <span className="text-xs font-bold text-primary-700">{duration} {isStay(details) ? "Nights" : "Days"} Selected</span>
                  </div>
                )}

                {/* Guests */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {itemLabel}s {unitsNeeded > 1 && !isTour(details) && <span className="text-orange-500 ml-1">({unitsNeeded} {unitLabel}s required)</span>}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    <input type="number" min="1" max={isTour(details) ? 20 : 30} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium bg-gray-50 focus:bg-white transition-all text-sm" value={guests} onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))} />
                  </div>
                  {!isTour(details) && <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Max capacity per {unitLabel.toLowerCase()}: {capacity} {itemLabel.toLowerCase()}s</p>}
                </div>

                {/* Contact Details */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Contact Details (E-Ticket)</h4>
                  <div className="space-y-3">
                    <div className="relative group">
                      <User className="absolute left-4 top-3 w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      <input type="text" required placeholder="Full Name" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3 w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      <input type="email" required placeholder="Email Address" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-3 w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      <input type="tel" required placeholder="Phone Number" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="pt-4 pb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    {isTour(details)
                      ? <span>{product.currency} {effectivePrice} x {guests} {itemLabel.toLowerCase()}s</span>
                      : <span>{product.currency} {effectivePrice} x {unitsNeeded} {unitLabel.toLowerCase()}(s) x {duration} {isStay(details) ? "night" : "day"}(s)</span>}
                    <span className="font-medium">{product.currency} {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Service fee</span>
                    <span className="font-medium">{product.currency} 0</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl pt-4 border-t border-dashed border-gray-200">
                    <span>Total</span>
                    <span className="text-primary-600">{product.currency} {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Add to Cart - only if logged in */}
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all border-2 flex justify-center items-center gap-3 transform active:scale-[0.98] ${
                      inCart
                        ? "border-green-500 text-green-600 bg-green-50 cursor-default"
                        : "border-gray-200 text-gray-700 bg-white hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50"
                    }`}
                  >
                    <ShoppingCart className={`w-5 h-5 ${inCart ? "fill-green-100 stroke-green-600" : ""}`} />
                    {inCart ? "✓ Sudah di Keranjang" : "Tambah ke Keranjang"}
                  </button>
                )}

                {/* Reserve Now - always visible */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-600 transition-all shadow-xl shadow-gray-900/20 disabled:opacity-50 flex justify-center items-center transform active:scale-[0.98]"
                >
                  <CreditCard className="w-5 h-5 mr-3" />
                  Reserve Now
                </button>
                <p className="text-center text-xs text-gray-400 font-medium">You won't be charged yet</p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 md:hidden z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-primary-600">{product.currency} {totalPrice}</span>
              {isStay(details) && duration > 1 && <span className="text-xs text-gray-400">/{duration} nights</span>}
            </div>
          </div>

          <div className={`flex gap-2 ${isLoggedIn ? 'flex-1' : ''}`}>
            {/* Add to Cart - only if logged in */}
            {isLoggedIn && (
              <button
                onClick={handleAddToCart}
                disabled={inCart}
                className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 active:scale-95 transform flex-shrink-0
                  ${inCart
                    ? "border-green-500 text-green-600 bg-green-50 cursor-default"
                    : "border-gray-200 bg-white text-gray-700 hover:border-primary-400 hover:text-primary-600"
                  }`}
              >
                <ShoppingCart className={`w-4 h-4 ${inCart ? "stroke-green-600" : ""}`} />
                {inCart ? "Added" : "Cart"}
              </button>
            )}

            {/* Reserve Now - always visible */}
            <button
              onClick={(e) => handleBookNow(e)}
              className={`bg-gray-900 active:bg-gray-800 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-gray-900/20 active:scale-95 transition-all transform
                ${isLoggedIn ? 'flex-1' : 'px-8'}`}
            >
              {checkIn ? "Reserve" : "Check Availability"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ProductDetail Component
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    (async () => {
      try {
        const pid = Number(id);
        if (!Number.isFinite(pid) || pid <= 0) { 
          showToast("Invalid product id", "error"); 
          setLoading(false);
          return; 
        }
        const p = await agentProductService.getProductById(pid);
        setProduct(p);
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        showToast(e?.message || "Failed to load product", "error");
        setProduct(null);
        setLoading(false);
      }
    })();
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate component based on product type
  if (isCar(product.details)) {
    return <CarProductDetail product={product} />;
  } else {
    return <NonCarProductDetail product={product} />;
  }
};

export default ProductDetail;
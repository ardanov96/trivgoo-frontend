import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Star, MapPin, ChevronLeft, Heart, ShoppingCart,
  Users, Gauge, Briefcase, Award, UserCog, Car,
  CheckCircle2, Shield, Clock, Phone, MapPinned, Navigation,
  Info, ChevronDown, ChevronUp, Plus, Minus, Check,
  Fuel, CalendarDays, BadgeCheck, Headphones, Package, AlertCircle,
  Tag, Percent, DollarSign, Sparkles, Loader2, AlertTriangle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { agentProductService } from '../services/agentProductService';
import http from '../services/http';
import { useCart } from '../components/CartContext';
import { useWishlist } from '../components/WishlistContext';
import { useToast } from '../components/ToastContext';
import { useAuth } from '../AuthContext';
import UserAvatar from '../components/UserAvatar';
import { getImageUrl, FALLBACK_IMAGE } from '../utils/imageUtils';
import { Product, CarDetails, TourDetails, StayDetails } from '../types';
import { decodeId } from '../utils/hashids';

const isCar  = (details: any): details is CarDetails  => details?.type === 'car';
const isTour = (details: any): details is TourDetails => details?.type === 'tour';
const isStay = (details: any): details is StayDetails => details?.type === 'stay';

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

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
const DRIVER_PRICE_PER_12H = 150_000;

// ─── Delivery Fee Config Types (mirror dari AgentAddProduct) ──────────────
interface DeliveryZone { maxKm: number; fee: number; label: string; }
interface DeliveryConfig {
  enabled: boolean;
  freeRadiusKm: number;
  minCharge: number;
  zones: DeliveryZone[];
}

// Fallback default jika product belum punya delivery_config
const FALLBACK_DELIVERY_CONFIG: DeliveryConfig = {
  enabled: true,
  freeRadiusKm: 0,
  minCharge: 15_000,
  zones: [
    { maxKm: 2,        fee: 15_000,  label: '0–2 km' },
    { maxKm: 5,        fee: 25_000,  label: '2–5 km' },
    { maxKm: 15,       fee: 50_000,  label: '5–15 km' },
    { maxKm: 30,       fee: 85_000,  label: '15–30 km' },
    { maxKm: 60,       fee: 150_000, label: '30–60 km' },
    { maxKm: Infinity, fee: -1,      label: '>60 km (konfirmasi)' },
  ],
};

/**
 * Hitung fee berdasarkan delivery_config milik agent (bukan hardcoded).
 * - freeRadiusKm: jika km <= freeRadiusKm → gratis (fee = 0)
 * - minCharge: biaya minimum untuk jarak apapun di luar zona gratis
 * - zones: tabel zona tiered; zone pertama yang maxKm >= km dipakai
 */
function calcFeeFromConfig(km: number, config: DeliveryConfig): number {
  // Cek zona gratis dulu
  if (config.freeRadiusKm > 0 && km <= config.freeRadiusKm) return 0;

  // Cari zone yang cocok
  const zone = config.zones.find(z => km <= z.maxKm);
  if (!zone) return -1; // di luar semua zona → konfirmasi manual

  if (zone.fee === -1) return -1; // zona konfirmasi

  // Terapkan minimum charge
  return Math.max(zone.fee, config.minCharge);
}

type DeliveryInfo = {
  km: number | null;
  fee: number; // -1 = needs manual confirmation
  label: string;
  loading: boolean;
  error: string | null;
};

const INITIAL_DELIVERY: DeliveryInfo = { km: null, fee: 0, label: '', loading: false, error: null };

/** Hitung jarak & biaya antar/jemput berdasarkan delivery_config agent.
 *  Pakai Google Maps Distance Matrix jika tersedia, fallback ke Nominatim+Haversine. */
async function calcDeliveryFee(
  originAddress: string,
  destinationAddress: string,
  config: DeliveryConfig,
): Promise<{ km: number; fee: number; label: string }> {
  let km: number;

  // ── Coba Google Maps Distance Matrix ────────────────────────────────────
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    km = await new Promise<number>((resolve, reject) => {
      const service = new (window as any).google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        { origins: [originAddress], destinations: [destinationAddress], travelMode: 'DRIVING', unitSystem: 0 },
        (response: any, status: string) => {
          if (status !== 'OK') { reject(new Error('Distance API error: ' + status)); return; }
          const element = response.rows?.[0]?.elements?.[0];
          if (element?.status !== 'OK') { reject(new Error('Route not found')); return; }
          resolve(element.distance.value / 1000);
        },
      );
    });
  } else {
    // ── Fallback: Nominatim geocode + Haversine ────────────────────────────
    const geocode = async (q: string): Promise<[number, number]> => {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`);
      const data = await r.json();
      if (!data.length) throw new Error('Alamat tidak ditemukan: ' + q);
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    };

    const [lat1, lon1] = await geocode(originAddress);
    const [lat2, lon2] = await geocode(destinationAddress);

    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
    km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  const kmRounded = Math.round(km * 10) / 10;
  const fee = calcFeeFromConfig(kmRounded, config);

  // Label zona yang cocok
  const zone = config.zones.find(z => kmRounded <= z.maxKm);
  const label = fee === 0 ? `Gratis (< ${config.freeRadiusKm} km)` : zone?.label ?? 'Konfirmasi';

  return { km: kmRounded, fee, label };
}

// ─── Delivery Fee Badge UI ─────────────────────────────────────────────────
interface DeliveryFeeBadgeProps {
  info: DeliveryInfo;
  type: 'pickup' | 'dropoff';
}
const DeliveryFeeBadge: React.FC<DeliveryFeeBadgeProps> = ({ info, type }) => {
  if (info.loading) return (
    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      <span>Menghitung biaya {type === 'pickup' ? 'penjemputan' : 'pengantaran'}…</span>
    </div>
  );
  if (info.error) return (
    <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
      <AlertCircle className="w-3.5 h-3.5" />
      <span>{info.error}</span>
    </div>
  );
  if (info.km === null) return null;

  const isManual = info.fee === -1;
  const isFree   = info.fee === 0;

  return (
    <div className={`mt-2 rounded-xl px-3 py-2.5 flex items-start gap-2.5 border text-xs
      ${isManual ? 'bg-amber-50 border-amber-200' : isFree ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="shrink-0 mt-0.5">
        {isManual
          ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          : isFree
          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          : <Navigation className="w-3.5 h-3.5 text-blue-500" />
        }
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-bold ${isManual ? 'text-amber-700' : isFree ? 'text-green-700' : 'text-blue-700'}`}>
            Biaya {type === 'pickup' ? 'Penjemputan' : 'Pengantaran'}
          </span>
          <span className={`font-extrabold ${isManual ? 'text-amber-600' : isFree ? 'text-green-600' : 'text-blue-700'}`}>
            {isManual ? 'Hubungi Agen' : isFree ? 'GRATIS' : formatRp(info.fee)}
          </span>
        </div>
        <p className={`mt-0.5 ${isManual ? 'text-amber-600' : isFree ? 'text-green-600' : 'text-blue-600'}`}>
          {info.km} km dari kantor
          {isManual && ' — Lokasi di luar jangkauan standar. Agen akan konfirmasi biaya setelah booking.'}
          {isFree && ' — Dalam radius layanan gratis kami.'}
        </p>
      </div>
    </div>
  );
};


interface ProductVoucherBannerProps { vouchers: any[]; }
const ProductVoucherBanner: React.FC<ProductVoucherBannerProps> = ({ vouchers }) => {
  const [expanded, setExpanded] = useState(false);
  if (!vouchers || vouchers.length === 0) return null;
  const now = new Date();
  const active = vouchers.filter(v => v.is_active && (!v.expires_at || new Date(v.expires_at) >= now));
  if (active.length === 0) return null;
  const PREVIEW_COUNT = 2;
  const displayed = expanded ? active : active.slice(0, PREVIEW_COUNT);
  const hasMore = active.length > PREVIEW_COUNT;
  return (
    <div className="rounded-2xl overflow-hidden border border-orange-200 shadow-sm mb-5">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-white" />
        <p className="text-white text-xs font-extrabold uppercase tracking-wider">{active.length} Promo Tersedia!</p>
      </div>
      <div className="bg-gradient-to-b from-orange-50 to-amber-50 divide-y divide-orange-100">
        {displayed.map((v: any) => (
          <div key={v.id} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${v.type === 'percent' ? 'bg-blue-100' : 'bg-green-100'}`}>
              {v.type === 'percent' ? <Percent className="w-4 h-4 text-blue-600" /> : <DollarSign className="w-4 h-4 text-green-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-xs text-gray-900 font-mono tracking-widest">{v.code}</span>
                {v.expires_at && <span className="text-[10px] text-orange-500 font-semibold">s/d {new Date(v.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
              </div>
              {v.description && <p className="text-[11px] text-gray-500 truncate mt-0.5">{v.description}</p>}
              {v.min_transaction > 0 && <p className="text-[10px] text-gray-400 mt-0.5">Min. transaksi {formatRp(v.min_transaction)}</p>}
            </div>
            <div className="shrink-0 text-right">
              <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-extrabold ${v.type === 'percent' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                {v.type === 'percent' ? `${v.value}% OFF` : `${formatRp(v.value)} OFF`}
              </span>
              {v.type === 'percent' && v.max_discount && <p className="text-[10px] text-gray-400 mt-0.5 text-right">maks. {formatRp(v.max_discount)}</p>}
            </div>
          </div>
        ))}
        {hasMore && (
          <button type="button" onClick={() => setExpanded(p => !p)}
            className="w-full py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors flex items-center justify-center gap-1">
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Sembunyikan</> : <><ChevronDown className="w-3.5 h-3.5" /> +{active.length - PREVIEW_COUNT} promo lainnya</>}
          </button>
        )}
      </div>
      <div className="bg-orange-50 border-t border-orange-100 px-4 py-2 flex items-center gap-1.5">
        <Tag className="w-3 h-3 text-orange-400 shrink-0" />
        <p className="text-[10px] text-orange-500 font-semibold">Pilih voucher di halaman checkout untuk mendapat diskon</p>
      </div>
    </div>
  );
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pickupType, setPickupType] = useState<'kantor' | 'lokasi_lain'>('kantor');
  const [dropoffType, setDropoffType] = useState<'kantor' | 'lokasi_lain'>('kantor');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');

  // Delivery fee states — per leg
  const [pickupDelivery, setPickupDelivery] = useState<DeliveryInfo>(INITIAL_DELIVERY);
  const [dropoffDelivery, setDropoffDelivery] = useState<DeliveryInfo>(INITIAL_DELIVERY);

  const [addOns, setAddOns] = useState<{ withDriver: boolean; premiumInsurance: boolean; childSeat: boolean }>({
    withDriver: false, premiumInsurance: false, childSeat: false,
  });
  const [termsOpen, setTermsOpen] = useState(false);
  const [tourDate, setTourDate] = useState('');
  const [tourPax, setTourPax] = useState(1);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [carPickupDate, setCarPickupDate] = useState('');
  const [carPickupTime, setCarPickupTime] = useState('09:00');
  const [carDropoffDate, setCarDropoffDate] = useState('');
  const [carDropoffTime, setCarDropoffTime] = useState('09:00');
  const [stayGuests, setStayGuests] = useState(2);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});

  const toggleReply = (id: number) => setExpandedReplies(p => ({ ...p, [id]: !p[id] }));

  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // ─── Debounced delivery fee calculator ─────────────────────────────────
  const calcDelivery = useCallback(
    async (
      address: string,
      productLocation: string,
      config: DeliveryConfig,
      setter: React.Dispatch<React.SetStateAction<DeliveryInfo>>,
    ) => {
      if (!address.trim() || address.trim().length < 8) {
        setter(INITIAL_DELIVERY);
        return;
      }
      // Cek apakah layanan antar-jemput diaktifkan oleh agent
      if (!config.enabled) {
        setter({ km: null, fee: 0, label: '', loading: false, error: 'Layanan antar-jemput tidak tersedia untuk produk ini.' });
        return;
      }
      setter(prev => ({ ...prev, loading: true, error: null }));
      try {
        const result = await calcDeliveryFee(productLocation, address, config);
        setter({ ...result, loading: false, error: null });
      } catch (e: any) {
        setter({ km: null, fee: 0, label: '', loading: false, error: 'Alamat tidak ditemukan. Periksa kembali.' });
      }
    },
    [],
  );

  // Debounce pickup address input
  useEffect(() => {
    if (pickupType !== 'lokasi_lain' || !product) { setPickupDelivery(INITIAL_DELIVERY); return; }
    const config: DeliveryConfig = (product as any).delivery_config || FALLBACK_DELIVERY_CONFIG;
    const timer = setTimeout(() => calcDelivery(pickupAddress, product.location || 'Bali, Indonesia', config, setPickupDelivery), 900);
    return () => clearTimeout(timer);
  }, [pickupAddress, pickupType, product, calcDelivery]);

  // Debounce dropoff address input
  useEffect(() => {
    if (dropoffType !== 'lokasi_lain' || !product) { setDropoffDelivery(INITIAL_DELIVERY); return; }
    const config: DeliveryConfig = (product as any).delivery_config || FALLBACK_DELIVERY_CONFIG;
    const timer = setTimeout(() => calcDelivery(dropoffAddress, product.location || 'Bali, Indonesia', config, setDropoffDelivery), 900);
    return () => clearTimeout(timer);
  }, [dropoffAddress, dropoffType, product, calcDelivery]);

  // Reset delivery info when switching back to 'kantor'
  useEffect(() => { if (pickupType === 'kantor') setPickupDelivery(INITIAL_DELIVERY); }, [pickupType]);
  useEffect(() => { if (dropoffType === 'kantor') setDropoffDelivery(INITIAL_DELIVERY); }, [dropoffType]);

  useEffect(() => {
    const load = async () => {
      if (!id) { setError('Product ID is missing.'); setIsLoading(false); return; }
      const numericId = decodeId(id);
      if (numericId === null) { setError('Product not found or invalid URL.'); setIsLoading(false); return; }
      setIsLoading(true); setError(null);
      try {
        const data = await agentProductService.getProductById(numericId);
        const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
        if (data.image_url && !data.image_url.startsWith('http')) data.image_url = `${BASE_URL}/${data.image_url.replace(/^\//, '')}`;
        if (data.image && !data.image.startsWith('http')) data.image = `${BASE_URL}/${data.image.replace(/^\//, '')}`;
        setProduct(data);
        
        try {
          const revRes = await http.get(`/bookings/reviews/product/${numericId}`);
          if (!revRes.data?.error) setReviews(revRes.data.data);
        } catch (err) { console.error('Failed to fetch reviews', err); }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    load();
  }, [id]);

  // ─── Effective delivery fees (0 if kantor, calculated otherwise) ───────
  const effectivePickupFee  = pickupType  === 'lokasi_lain' && pickupDelivery.fee  >= 0 ? pickupDelivery.fee  : 0;
  const effectiveDropoffFee = dropoffType === 'lokasi_lain' && dropoffDelivery.fee >= 0 ? dropoffDelivery.fee : 0;
  const needsManualPickup   = pickupType  === 'lokasi_lain' && pickupDelivery.fee  === -1;
  const needsManualDropoff  = dropoffType === 'lokasi_lain' && dropoffDelivery.fee === -1;

  const generateCheckoutPayload = (type: 'tour_stay' | 'car') => {
    if (!product) return null;
    const errors: Record<string, string> = {};
    if (type === 'tour_stay') {
      const isTourProduct = isTour(product.details);
      if (isTourProduct) {
        if (!tourDate) errors.tourDate = 'Pilih tanggal tour terlebih dahulu';
        if (tourPax < 1) errors.tourPax = 'Minimal 1 peserta';
      } else {
        if (!checkInDate) errors.checkIn = 'Pilih tanggal check-in';
        if (!checkOutDate) errors.checkOut = 'Pilih tanggal check-out';
        if (checkInDate && checkOutDate && checkInDate >= checkOutDate) errors.checkOut = 'Check-out harus setelah check-in';
        if (stayGuests < 1) errors.stayGuests = 'Minimal 1 tamu';
      }
    } else {
      if (!carPickupDate) errors.carPickupDate = 'Pilih tanggal pengambilan';
      if (!carDropoffDate) errors.carDropoffDate = 'Pilih tanggal pengembalian';
      if (carPickupDate && carDropoffDate) {
        const start = new Date(`${carPickupDate}T${carPickupTime}`);
        const end = new Date(`${carDropoffDate}T${carDropoffTime}`);
        if (start >= end) errors.carDropoffDate = 'Waktu pengembalian tidak valid';
      }
      // Validasi alamat custom wajib diisi
      if (pickupType === 'lokasi_lain' && !pickupAddress.trim())
        errors.pickupAddress = 'Masukkan alamat penjemputan';
      if (dropoffType === 'lokasi_lain' && !dropoffAddress.trim())
        errors.dropoffAddress = 'Masukkan alamat pengantaran';
      // Blokir jika masih loading
      if (pickupDelivery.loading || dropoffDelivery.loading)
        errors.deliveryCalc = 'Tunggu perhitungan biaya selesai';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Swal.fire({ icon: 'warning', title: 'Lengkapi Konfigurasi', text: Object.values(errors)[0], confirmButtonColor: '#0ea5e9' });
      return null;
    }
    setFieldErrors({});
    const productVouchers = (product as any).vouchers || [];

    if (type === 'tour_stay') {
      const isTourProduct = isTour(product.details);
      const nights = calcNights();
      const qty = isTourProduct ? tourPax : stayGuests;
      const dur = isTourProduct ? 1 : nights;
      return {
        productId: product.id, productName: product.name, location: product.location,
        image: product.image_url || product.image, currency: product.currency || 'IDR',
        pricePerPax: Number(product.price), pax: qty, guestCount: qty, duration: dur,
        totalPrice: Number(product.price) * qty * dur,
        date: isTourProduct ? tourDate : `${checkInDate} - ${checkOutDate}`,
        unitLabel: isTourProduct ? 'Tiket' : 'Malam',
        priceUnitLabel: isTourProduct ? 'orang' : 'malam',
        vehicleType: isTourProduct ? 'tour' : 'stay',
        availableVouchers: productVouchers,
      };
    } else {
      const start = new Date(`${carPickupDate}T${carPickupTime}`);
      const end = new Date(`${carDropoffDate}T${carDropoffTime}`);
      let calculatedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (calculatedDays < 1) calculatedDays = 1;

      const driverPrice    = addOns.withDriver ? DRIVER_PRICE_PER_12H : 0;
      const insurancePrice = addOns.premiumInsurance ? 75_000 : 0;
      const childSeatPrice = addOns.childSeat ? 50_000 : 0;
      const totalPerDay    = Number(product.price) + driverPrice + insurancePrice + childSeatPrice;

      // Biaya antar-jemput (satu kali, bukan per hari)
      const pickupFeeTotal  = effectivePickupFee;
      const dropoffFeeTotal = effectiveDropoffFee;
      const deliveryTotal   = pickupFeeTotal + dropoffFeeTotal;

      return {
        productId: product.id, productName: product.name, location: product.location,
        image: product.image_url || product.image, currency: product.currency || 'IDR',
        pricePerPax: totalPerDay, basePricePerPax: Number(product.price), pax: 1, guestCount: 1, duration: calculatedDays,
        totalPrice: totalPerDay * calculatedDays + deliveryTotal,
        date: `${carPickupDate} - ${carDropoffDate}`,
        startTime: `${carPickupDate} ${carPickupTime}:00`, endTime: `${carDropoffDate} ${carDropoffTime}:00`,
        unitLabel: 'Hari', priceUnitLabel: 'hari', vehicleType: 'car',
        transmission: (product.details as CarDetails)?.transmission,
        seats: (product.details as CarDetails)?.seats,
        luggage: (product.details as CarDetails)?.luggage,
        year: (product.details as CarDetails)?.year,
        fuelPolicy: (product.details as CarDetails)?.fuelPolicy,
        withDriver: addOns.withDriver,
        addOns,
        // Delivery fields
        pickupType, dropoffType,
        pickupAddress: pickupType === 'lokasi_lain' ? pickupAddress : null,
        dropoffAddress: dropoffType === 'lokasi_lain' ? dropoffAddress : null,
        pickupFee: pickupFeeTotal,
        dropoffFee: dropoffFeeTotal,
        pickupDeliveryKm: pickupDelivery.km,
        dropoffDeliveryKm: dropoffDelivery.km,
        needsManualPickupConfirmation: needsManualPickup,
        needsManualDropoffConfirmation: needsManualDropoff,
        availableVouchers: productVouchers,
      };
    }
  };

  const handleAddToCart = () => {
    if (!product || isInCart(product.id)) return;
    const type = isTour(product.details) || isStay(product.details) ? 'tour_stay' : 'car';
    const payload = generateCheckoutPayload(type);
    if (!payload) return;
    const cartQty = payload.duration;
    addToCart(product, cartQty, payload);
    showToast(`${product.name} ditambahkan ke keranjang!`, 'success');
  };

  const calcNights = () =>
    checkInDate && checkOutDate
      ? Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000))
      : 0;

  const handleReserveNow = (type: 'tour_stay' | 'car') => {
    const payload = generateCheckoutPayload(type);
    if (!payload) return;
    navigate('/checkout-summary', { state: payload });
  };

  const FieldError = ({ name }: { name: string }) =>
    fieldErrors[name] ? <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" /> {fieldErrors[name]}</p> : null;

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6"><div className="aspect-[16/9] bg-gray-200 rounded-3xl" /><div className="h-40 bg-gray-200 rounded-3xl" /></div>
          <div className="h-96 bg-gray-200 rounded-3xl" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Produk tidak ditemukan</h2>
        <Link to="/explore" className="text-primary-600 font-semibold hover:underline">← Kembali ke Explore</Link>
      </div>
    </div>
  );

  const isSaved        = isInWishlist(product.id);
  const isCarProduct   = isCar(product.details);
  const carDetails     = isCarProduct ? (product.details as CarDetails) : null;
  const tourDetails    = isTour(product.details) ? (product.details as TourDetails) : null;
  const stayDetails    = isStay(product.details) ? (product.details as StayDetails) : null;
  const productVouchers = (product as any).vouchers || [];

  // ════════════════════════════════════════════════════════
  //  TOUR / STAY
  // ════════════════════════════════════════════════════════
  if (!isCarProduct) {
    const isTourProduct = !!tourDetails;
    const categoryLabel = isTourProduct ? 'Tour & Activity' : 'Hotel & Villa';
    const categoryLink  = isTourProduct ? '/explore?category_id=1' : '/explore?category_id=2';
    const highlights = isTourProduct ? [
      { icon: Clock,        label: 'Durasi',       value: (tourDetails as any)?.duration || 'Full Day' },
      { icon: Users,        label: 'Min. Peserta',  value: `${(tourDetails as any)?.minPax || 1} orang` },
      { icon: Award,        label: 'Kategori',      value: (tourDetails as any)?.tourCategory || 'Wisata' },
      { icon: CheckCircle2, label: 'Bahasa',        value: (tourDetails as any)?.language || 'Indonesia' },
    ] : [
      { icon: CalendarDays, label: 'Min. Menginap', value: `${(stayDetails as any)?.minNight || 1} malam` },
      { icon: Users,        label: 'Tamu',          value: `${(stayDetails as any)?.maxGuest || 2} tamu` },
      { icon: Award,        label: 'Tipe',          value: (stayDetails as any)?.stayCategory || 'Hotel' },
      { icon: BadgeCheck,   label: 'Check-in',      value: (stayDetails as any)?.checkIn || '14:00' },
    ];
    const inclusions: string[] = (isTourProduct
      ? (tourDetails as any)?.inclusions
      : (stayDetails as any)?.inclusions
    )?.filter(Boolean) || (isTourProduct
      ? ['Transportasi AC', 'Pemandu wisata', 'Tiket masuk', 'Makan siang']
      : ['Sarapan', 'Kolam renang', 'WiFi gratis', 'Parkir gratis']
    );
    const exclusions: string[] = (isTourProduct
      ? (tourDetails as any)?.exclusions
      : (stayDetails as any)?.exclusions
    )?.filter(Boolean) || (isTourProduct
      ? ['Pengeluaran pribadi', 'Tips pemandu', 'Foto/video profesional']
      : ['Airport transfer', 'Laundry', 'Minibar']
    );
    
    const reviewCount = reviews.length;
    const avgRatingStr = reviewCount > 0 ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviewCount).toFixed(1) : (product.rating || '0.0');
    const getPct = (filterFn: (r: any) => boolean) => reviewCount === 0 ? 0 : Math.round((reviews.filter(filterFn).length / reviewCount) * 100);
    const reviewDistribution = [
      ['Sangat Baik', getPct(r => Number(r.rating) === 5)],
      ['Baik', getPct(r => Number(r.rating) === 4)],
      ['Cukup', getPct(r => Number(r.rating) === 3)],
      ['Buruk', getPct(r => Number(r.rating) <= 2)]
    ];

    const itinerary: { time: string; desc: string }[] = isTourProduct ? [
      { time: '07:00', desc: 'Penjemputan dari hotel' }, { time: '09:00', desc: 'Tiba di destinasi pertama' },
      { time: '12:00', desc: 'Makan siang bersama' }, { time: '14:00', desc: 'Kunjungan destinasi kedua' },
      { time: '17:00', desc: 'Kembali ke hotel' },
    ] : [];
    const nights = calcNights();
    const tourStayTotal = isTourProduct ? Number(product.price) * tourPax : Number(product.price) * (nights || 1) * stayGuests;

    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <SEO 
          title={(product as any).seo_title || `${product.name} | Trivgoo`} 
          description={(product as any).seo_description || (product as any).description || `Book ${product.name} at ${formatLocation(product.location || '')} on Trivgoo.`} 
          image={(product as any).seo_og_image || product.image_url || product.image || FALLBACK_IMAGE} 
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-primary-600 font-medium text-gray-500"><ChevronLeft className="w-3.5 h-3.5" /> Kembali</button>
            <span>/</span><Link to="/" className="hover:text-primary-600">Beranda</Link>
            <span>/</span><Link to={categoryLink} className="hover:text-primary-600">{categoryLabel}</Link>
            <span>/</span><span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
          </div>
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1"><span className="bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded"><Star className="w-3 h-3 inline mr-0.5" />{avgRatingStr}</span><span className="text-sm font-semibold text-gray-700 ml-1">{reviewCount} ulasan</span></div>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary-500" />{formatLocation(product.location || '')}</span>
              {productVouchers.filter((v: any) => v.is_active).length > 0 && (<><span className="text-gray-300">·</span><span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full"><Tag className="w-3 h-3" />{productVouchers.filter((v: any) => v.is_active).length} Promo</span></>)}
              {isLoggedIn && (<><span className="text-gray-300">·</span><button onClick={() => toggleWishlist(product)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"><Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-red-500' : ''}`} />{isSaved ? 'Tersimpan' : 'Simpan ke wishlist'}</button></>)}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: '400px' }}>
            <div className="grid gap-1.5 h-full" style={{ gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
              <div className="row-span-2 relative overflow-hidden bg-gray-200"><img src={getImageUrl(product.image_url || product.image)} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} /></div>
              {[0,1,2,3].map((i) => (<div key={i} className="relative overflow-hidden bg-gray-200"><img src={getImageUrl(product.image_url || product.image)} alt={`${product.name} ${i+2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />{i === 3 && (<div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"><div className="bg-white rounded-lg px-4 py-2"><p className="text-gray-900 font-bold text-sm">Gallery</p></div></div>)}</div>))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{highlights.map((h, i) => (<div key={i} className="text-center"><div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2"><h.icon className="w-5 h-5 text-primary-600" /></div><p className="text-xs text-gray-400 mb-0.5">{h.label}</p><p className="text-sm font-bold text-gray-800">{h.value}</p></div>))}</div></div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"><h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-primary-600" /> Deskripsi</h2><p className="text-sm text-gray-600 leading-relaxed">{(product as any).description || `Nikmati pengalaman ${isTourProduct ? 'wisata' : 'menginap'} terbaik di ${formatLocation(product.location || '')}. ${product.name} menawarkan layanan premium dengan fasilitas lengkap.`}</p></div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"><h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-primary-600" /> Yang Termasuk</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">✓ Termasuk</p>{inclusions.map((item, i) => (<div key={i} className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{item}</div>))}</div><div className="space-y-2"><p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">✗ Tidak Termasuk</p>{exclusions.map((item, i) => (<div key={i} className="flex items-center gap-2 text-sm text-gray-700"><div className="w-4 h-4 rounded-full border-2 border-red-300 flex items-center justify-center shrink-0"><div className="w-1.5 h-0.5 bg-red-400 rounded" /></div>{item}</div>))}</div></div></div>
              {isTourProduct && itinerary.length > 0 && (<div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"><h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary-600" /> Itinerary</h2><div className="relative pl-4"><div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary-100 rounded" /><div className="space-y-4">{itinerary.map((item, i) => (<div key={i} className="relative pl-5"><div className="absolute left-[-17px] top-1 w-3 h-3 rounded-full bg-primary-500 border-2 border-white shadow-sm" /><span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mr-2">{item.time}</span><span className="text-sm text-gray-700">{item.desc}</span></div>))}</div></div></div>)}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"><h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPinned className="w-4 h-4 text-primary-600" />{isTourProduct ? 'Titik Penjemputan' : 'Lokasi'}</h2><div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4"><MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" /><p className="text-sm text-gray-600">{product.location || 'Lokasi akan dikonfirmasi setelah booking'}</p></div></div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"><h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-600" /> Kebijakan Pembatalan</h2><div className="space-y-2">{[{label:'Batalkan 24 jam sebelum',value:'Refund penuh',color:'text-green-600'},{label:'Batalkan kurang dari 24 jam',value:'Tidak ada refund',color:'text-red-500'},{label:'No Show',value:'Tidak ada refund',color:'text-red-500'}].map((row,i) => (<div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0"><span className="text-gray-600">{row.label}</span><span className={`font-bold ${row.color}`}>{row.value}</span></div>))}</div></div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"><h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Ulasan Traveler</h2><div className="flex items-center gap-6 mb-5 pb-5 border-b border-gray-100"><div className="text-center"><p className="text-5xl font-extrabold text-gray-900">{avgRatingStr}</p><div className="flex justify-center gap-0.5 my-1">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3.5 h-3.5 ${i<Math.round(Number(avgRatingStr))?'text-amber-400 fill-amber-400':'text-gray-200 fill-gray-200'}`}/>)}</div><p className="text-xs text-gray-400">{reviewCount} ulasan</p></div><div className="flex-1 space-y-1.5">{reviewDistribution.map(([label,pct])=>(<div key={label as string} className="flex items-center gap-2 text-xs"><span className="text-gray-500 w-20">{label}</span><div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width:`${pct}%`}}/></div><span className="text-gray-400 w-6">{pct}%</span></div>))}</div></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{reviews.length > 0 ? reviews.map(review=>(<div key={review.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100"><div className="flex items-center gap-3 mb-3"><UserAvatar user={{ name: review.customer_name, avatar: review.customer_avatar }} className="w-9 h-9 border-2 border-primary-100" /><div><p className="font-bold text-gray-900 text-sm">{review.customer_name || 'Customer'}</p><p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('id-ID')}</p></div></div><div className="flex gap-0.5 mb-2">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3 h-3 ${i<review.rating?'text-amber-400 fill-amber-400':'text-gray-200 fill-gray-200'}`}/>)}</div><p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{review.comment || 'No comment provided.'}</p>{review.agent_reply && (<div className="mt-3"><button onClick={() => toggleReply(review.id)} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">{expandedReplies[review.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}{expandedReplies[review.id] ? 'Tutup Balasan' : 'Lihat Balasan'}</button>{expandedReplies[review.id] && (<div className="mt-2 bg-primary-50 rounded-xl p-3 border border-primary-100 relative"><div className="absolute -top-1.5 left-4 w-3 h-3 bg-primary-50 border-t border-l border-primary-100 transform rotate-45" /><div className="flex items-center gap-2 mb-1.5 relative z-10"><div className="w-4 h-4 bg-primary-100 rounded-full flex items-center justify-center shrink-0"><BadgeCheck className="w-2.5 h-2.5 text-primary-600" /></div><span className="text-xs font-bold text-primary-900">Respon Agen</span></div><p className="text-xs text-primary-800 leading-relaxed relative z-10">{review.agent_reply}</p></div>)}</div>)}</div>)) : <p className="text-sm text-gray-500 col-span-full">Belum ada ulasan untuk produk ini.</p>}</div></div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl">
                  <div className="mb-5 pb-4 border-b border-gray-100"><p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Mulai dari</p><p className="text-3xl font-extrabold text-gray-900">{product.currency} {Number(product.price).toLocaleString('id-ID')}<span className="text-sm font-medium text-gray-400 ml-1">/{isTourProduct?'orang':'malam'}</span></p><div className="flex items-center gap-1.5 mt-1"><span className="bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded"><Star className="w-3 h-3 inline mr-0.5" />{avgRatingStr}</span><span className="text-xs text-gray-500">{reviewCount} ulasan</span></div></div>
                  <ProductVoucherBanner vouchers={productVouchers} />
                  {isTourProduct ? (<>
                    <div className="mb-4"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Tanggal <span className="text-red-500">*</span></label><div className="relative"><CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="date" value={tourDate} onChange={(e)=>{setTourDate(e.target.value);setFieldErrors(p=>({...p,tourDate:''}));}} min={new Date().toISOString().split('T')[0]} className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 ${fieldErrors.tourDate?'border-red-400 focus:ring-red-500/20':'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'}`}/></div><FieldError name="tourDate"/></div>
                    <div className="mb-5"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Jumlah Peserta <span className="text-red-500">*</span></label><div className={`flex items-center gap-3 border rounded-xl p-2 bg-gray-50 ${fieldErrors.tourPax?'border-red-400':'border-gray-200'}`}><button onClick={()=>setTourPax(p=>Math.max(1,p-1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Minus className="w-3.5 h-3.5"/></button><span className="flex-1 text-center font-extrabold text-gray-900">{tourPax} orang</span><button onClick={()=>setTourPax(p=>p+1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Plus className="w-3.5 h-3.5"/></button></div><FieldError name="tourPax"/></div>
                  </>) : (<>
                    <div className="mb-4"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Tanggal Menginap <span className="text-red-500">*</span></label><div className={`grid grid-cols-2 gap-1 border rounded-xl overflow-hidden ${fieldErrors.checkIn||fieldErrors.checkOut?'border-red-400':'border-gray-200'}`}><div className="p-3 bg-gray-50 border-r border-gray-200"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Check-in</label><input type="date" value={checkInDate} onChange={(e)=>{setCheckInDate(e.target.value);if(checkOutDate&&e.target.value>=checkOutDate)setCheckOutDate('');setFieldErrors(p=>({...p,checkIn:'',checkOut:''}));}} min={new Date().toISOString().split('T')[0]} className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"/></div><div className="p-3 bg-gray-50"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Check-out</label><input type="date" value={checkOutDate} onChange={(e)=>{setCheckOutDate(e.target.value);setFieldErrors(p=>({...p,checkOut:''}));}} min={checkInDate||new Date().toISOString().split('T')[0]} className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"/></div></div>{checkInDate&&checkOutDate&&nights>0&&<p className="text-xs text-primary-600 font-semibold mt-1.5 pl-1">{nights} malam</p>}<FieldError name="checkIn"/><FieldError name="checkOut"/></div>
                    <div className="mb-5"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Tamu <span className="text-red-500">*</span></label><div className="flex items-center gap-3 border border-gray-200 rounded-xl p-2 bg-gray-50"><button onClick={()=>setStayGuests(g=>Math.max(1,g-1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Minus className="w-3.5 h-3.5"/></button><span className="flex-1 text-center font-extrabold text-gray-900">{stayGuests} tamu</span><button onClick={()=>setStayGuests(g=>g+1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Plus className="w-3.5 h-3.5"/></button></div></div>
                  </>)}
                  <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                    {isTourProduct ? (<div className="flex justify-between text-sm text-gray-600"><span>{tourPax} orang × {product.currency} {Number(product.price).toLocaleString('id-ID')}</span><span className="font-semibold">{product.currency} {(Number(product.price)*tourPax).toLocaleString('id-ID')}</span></div>) : (<div className="flex justify-between text-sm text-gray-600"><span>{nights>0?`${nights} malam`:'— malam'} × {stayGuests} tamu × {product.currency} {Number(product.price).toLocaleString('id-ID')}</span><span className="font-semibold">{nights>0?`${product.currency} ${(Number(product.price)*nights*stayGuests).toLocaleString('id-ID')}`:'—'}</span></div>)}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-gray-900"><span>Total</span><span className="text-primary-600">{nights>0||isTourProduct?`${product.currency} ${tourStayTotal.toLocaleString('id-ID')}`:'—'}</span></div>
                  </div>
                  <button onClick={handleAddToCart} disabled={isInCart(product.id)} className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98] shadow-lg ${isInCart(product.id)?'bg-green-50 border-2 border-green-400 text-green-700 cursor-default':'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30'}`}>{isInCart(product.id)?<span className="flex items-center justify-center gap-2"><Check className="w-4 h-4"/> Added to Cart</span>:<span className="flex items-center justify-center gap-2"><ShoppingCart className="w-4 h-4"/> Pesan Sekarang</span>}</button>
                  <button onClick={()=>handleReserveNow('tour_stay')} className="w-full py-4 rounded-2xl font-extrabold text-sm border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-all active:scale-[0.98] mt-3">Reserve Now</button>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400"><span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500"/> Aman</span><span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-blue-500"/> Terverifikasi</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500"/> 24/7</span></div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"><div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-primary-600"/></div><div><p className="text-xs text-gray-500">Butuh bantuan?</p><p className="text-sm font-bold text-gray-800">Hubungi Customer Service</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  //  CAR RENTAL
  // ════════════════════════════════════════════════════════
  let rentalDays = 0;
  if (carPickupDate && carDropoffDate) {
    const start = new Date(`${carPickupDate}T${carPickupTime}`);
    const end = new Date(`${carDropoffDate}T${carDropoffTime}`);
    rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (rentalDays < 1) rentalDays = 0;
  }

  const reviewCount = reviews.length;
  const avgRatingStr = reviewCount > 0 ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviewCount).toFixed(1) : (product.rating || '0.0');

  const basePrice      = Number(product.price);
  const driverPrice    = addOns.withDriver ? DRIVER_PRICE_PER_12H : 0;
  const insurancePrice = addOns.premiumInsurance ? 75_000 : 0;
  const childSeatPrice = addOns.childSeat ? 50_000 : 0;
  const totalPerDay    = basePrice + driverPrice + insurancePrice + childSeatPrice;
  const totalCarPrice  = totalPerDay * rentalDays + effectivePickupFee + effectiveDropoffFee;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <SEO 
        title={(product as any).seo_title || `${product.name} Rental | Trivgoo`} 
        description={(product as any).seo_description || `Rent ${product.name} starting from ${product.currency} ${Number(product.price).toLocaleString('id-ID')}/day on Trivgoo.`} 
        image={(product as any).seo_og_image || product.image_url || product.image || FALLBACK_IMAGE} 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 pt-4">
          <button onClick={()=>navigate(-1)} className="flex items-center gap-1 hover:text-primary-600 transition-colors font-medium"><ChevronLeft className="w-4 h-4"/> Kembali</button>
          <span>/</span><Link to="/explore?category_id=3" className="hover:text-primary-600 transition-colors">Car Rental</Link>
          <span>/</span><span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full"><Car className="w-3.5 h-3.5"/> Booking Details</div>
              {productVouchers.filter((v:any)=>v.is_active).length>0&&(<div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold px-3 py-1 rounded-full"><Tag className="w-3.5 h-3.5"/>{productVouchers.filter((v:any)=>v.is_active).length} Promo</div>)}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400"/><span className="font-bold text-gray-800 text-sm">{avgRatingStr}</span><span className="text-gray-400 text-sm">({reviewCount} reviews)</span></div>
              <span className="text-gray-300">·</span>
              <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary-500"/>{formatLocation(product.location||'')}</p>
            </div>
          </div>
          {isLoggedIn&&(<button onClick={()=>toggleWishlist(product)} className={`shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${isSaved?'border-red-400 bg-red-50':'border-gray-200 bg-white'}`}><Heart className={`w-5 h-5 ${isSaved?'text-red-500 fill-red-500':'text-gray-400'}`}/></button>)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100"><img src={getImageUrl(product.image_url||product.image)} alt={product.name} className="w-full h-auto object-contain" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=FALLBACK_IMAGE;}}/></div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"><h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Car className="w-5 h-5 text-primary-600"/> Detail Mobil</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[{icon:Users,label:'Penumpang',value:`${carDetails?.seats||4} Orang`},{icon:Gauge,label:'Transmisi',value:carDetails?.transmission==='Automatic'?'Matic':'Manual'},{icon:Fuel,label:'Bahan Bakar',value:carDetails?.fuelPolicy||'Gas'},{icon:Briefcase,label:'Bagasi',value:`${carDetails?.luggage||2} Koper`}].map((item,i)=>(<div key={i} className="bg-gray-50 rounded-2xl p-4 text-center"><item.icon className="w-6 h-6 text-primary-600 mx-auto mb-2"/><p className="text-xs text-gray-500 mb-1">{item.label}</p><p className="font-bold text-gray-900 text-sm">{item.value}</p></div>))}</div></div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"><h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-primary-600"/> Facility &amp; Include</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{[{icon:Navigation,label:'Free Pick Up'},{icon:Shield,label:'Basic Insurance'},{icon:Headphones,label:'24hr Support'}].map((item,i)=>(<div key={i} className="flex items-center gap-3 bg-green-50 rounded-2xl px-4 py-3"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/><div className="flex items-center gap-2"><item.icon className="w-4 h-4 text-green-600 shrink-0"/><span className="text-sm font-semibold text-gray-800">{item.label}</span></div></div>))}</div></div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"><button onClick={()=>setTermsOpen(!termsOpen)} className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"><h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Info className="w-5 h-5 text-primary-600"/> Terma &amp; Kondisi</h2>{termsOpen?<ChevronUp className="w-5 h-5 text-gray-400"/>:<ChevronDown className="w-5 h-5 text-gray-400"/>}</button>{termsOpen&&(<div className="px-6 pb-6 space-y-2 border-t border-gray-100">{['Self-Drive Policy','Cancellation Policy','Checklist dan Sisa Arka'].map((term,i)=>(<div key={i} className="flex items-start gap-2 py-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0"/><span className="text-sm text-gray-700 font-medium">{term}</span></div>))}</div>)}</div>

            {/* ── Lokasi Pengambilan ── */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPinned className="w-5 h-5 text-primary-600"/> Lokasi Pengambilan</h2>
              <div className="flex gap-3 mb-4">
                {[{value:'kantor',label:'Kantor Rental'},{value:'lokasi_lain',label:'Lokasi Lainnya'}].map(opt=>(
                  <button key={opt.value} onClick={()=>setPickupType(opt.value as any)} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${pickupType===opt.value?'border-primary-500 bg-primary-50 text-primary-700':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {pickupType===opt.value&&<Check className="w-3.5 h-3.5 inline mr-1"/>}{opt.label}
                  </button>
                ))}
              </div>
              {pickupType==='lokasi_lain' ? (
                <div>
                  <input
                    type="text"
                    placeholder="Masukkan alamat pickup lengkap… (min. 8 karakter)"
                    value={pickupAddress}
                    onChange={(e)=>{setPickupAddress(e.target.value);setFieldErrors(p=>({...p,pickupAddress:''}));}}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-gray-50 ${fieldErrors.pickupAddress?'border-red-400':'border-gray-200'}`}
                  />
                  <FieldError name="pickupAddress"/>
                  <DeliveryFeeBadge info={pickupDelivery} type="pickup" />
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-gray-400"/>
                  <span className="text-sm text-gray-500">{formatLocation(product.location||'Lokasi Kantor Rental')}</span>
                </div>
              )}
            </div>

            {/* ── Lokasi Pengembalian ── */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Navigation className="w-5 h-5 text-primary-600"/> Lokasi Pengembalian</h2>
              <div className="flex gap-3 mb-4">
                {[{value:'kantor',label:'Kantor Rental'},{value:'lokasi_lain',label:'Lokasi Lainnya'}].map(opt=>(
                  <button key={opt.value} onClick={()=>setDropoffType(opt.value as any)} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${dropoffType===opt.value?'border-primary-500 bg-primary-50 text-primary-700':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {dropoffType===opt.value&&<Check className="w-3.5 h-3.5 inline mr-1"/>}{opt.label}
                  </button>
                ))}
              </div>
              {dropoffType==='lokasi_lain' ? (
                <div>
                  <input
                    type="text"
                    placeholder="Masukkan alamat pengembalian… (min. 8 karakter)"
                    value={dropoffAddress}
                    onChange={(e)=>{setDropoffAddress(e.target.value);setFieldErrors(p=>({...p,dropoffAddress:''}));}}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-gray-50 ${fieldErrors.dropoffAddress?'border-red-400':'border-gray-200'}`}
                  />
                  <FieldError name="dropoffAddress"/>
                  <DeliveryFeeBadge info={dropoffDelivery} type="dropoff" />
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-gray-400"/>
                  <span className="text-sm text-gray-500">{formatLocation(product.location||'Lokasi Kantor Rental')}</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"><h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Info className="w-5 h-5 text-primary-600"/> Notes</h2><textarea rows={3} placeholder="Tambahkan catatan atau permintaan khusus..." className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-gray-50 resize-none"/></div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"><h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2"><Star className="w-5 h-5 text-amber-400 fill-amber-400"/> Reviews</h2><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{reviews.length > 0 ? reviews.map(review=>(<div key={review.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100"><div className="flex items-center gap-3 mb-3"><UserAvatar user={{ name: review.customer_name, avatar: review.customer_avatar }} className="w-10 h-10 border-2 border-primary-100" /><div><p className="font-bold text-gray-900 text-sm">{review.customer_name || 'Customer'}</p><p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('id-ID')}</p></div></div><div className="flex gap-0.5 mb-2">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3.5 h-3.5 ${i<review.rating?'text-amber-400 fill-amber-400':'text-gray-200 fill-gray-200'}`}/>)}</div><p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.comment || 'No comment provided.'}</p>{review.agent_reply && (<div className="mt-3 border-t border-gray-100 pt-3"><button onClick={() => toggleReply(review.id)} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">{expandedReplies[review.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}{expandedReplies[review.id] ? 'Tutup Balasan' : 'Lihat Balasan'}</button>{expandedReplies[review.id] && (<div className="mt-2 bg-primary-50 rounded-xl p-3 border border-primary-100 relative"><div className="absolute -top-1.5 left-4 w-3 h-3 bg-primary-50 border-t border-l border-primary-100 transform rotate-45" /><div className="flex items-center gap-2 mb-1.5 relative z-10"><div className="w-4 h-4 bg-primary-100 rounded-full flex items-center justify-center shrink-0"><BadgeCheck className="w-2.5 h-2.5 text-primary-600" /></div><span className="text-xs font-bold text-primary-900">Respon Agen</span></div><p className="text-xs text-primary-800 leading-relaxed relative z-10">{review.agent_reply}</p></div>)}</div>)}</div>)) : <p className="text-sm text-gray-500 col-span-full">Belum ada ulasan untuk mobil ini.</p>}</div></div>
          </div>

          {/* RIGHT — Car Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <div className="mb-5 pb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">No. ID: {String(product.id).padStart(6,'0')}</p>
                  <p className="text-3xl font-extrabold text-gray-900">{product.currency} {Number(product.price).toLocaleString('id-ID')}<span className="text-sm font-medium text-gray-400 ml-1">/hari</span></p>
                  <div className="flex items-center gap-1 mt-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400"/><span className="text-sm font-bold text-gray-700">{avgRatingStr}</span><span className="text-xs text-gray-400">({reviewCount} reviews)</span></div>
                </div>

                <ProductVoucherBanner vouchers={productVouchers} />

                {/* Pickup & Dropoff Date & Time */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Waktu Pengambilan <span className="text-red-500">*</span></label>
                  <div className={`grid grid-cols-2 gap-1 border rounded-xl overflow-hidden ${fieldErrors.carPickupDate?'border-red-400':'border-gray-200'}`}>
                    <div className="p-3 bg-gray-50 border-r border-gray-200">
                      <input type="date" value={carPickupDate} onChange={(e)=>{setCarPickupDate(e.target.value);setFieldErrors(p=>({...p,carPickupDate:''}))}} min={new Date().toISOString().split('T')[0]} className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"/>
                    </div>
                    <div className="p-3 bg-gray-50">
                      <input type="time" value={carPickupTime} onChange={(e)=>setCarPickupTime(e.target.value)} className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"/>
                    </div>
                  </div>
                  <FieldError name="carPickupDate"/>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Waktu Pengembalian <span className="text-red-500">*</span></label>
                  <div className={`grid grid-cols-2 gap-1 border rounded-xl overflow-hidden ${fieldErrors.carDropoffDate?'border-red-400':'border-gray-200'}`}>
                    <div className="p-3 bg-gray-50 border-r border-gray-200">
                      <input type="date" value={carDropoffDate} onChange={(e)=>{setCarDropoffDate(e.target.value);setFieldErrors(p=>({...p,carDropoffDate:''}))}} min={carPickupDate||new Date().toISOString().split('T')[0]} className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"/>
                    </div>
                    <div className="p-3 bg-gray-50">
                      <input type="time" value={carDropoffTime} onChange={(e)=>setCarDropoffTime(e.target.value)} className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"/>
                    </div>
                  </div>
                  {rentalDays > 0 && <p className="text-xs text-primary-600 font-semibold mt-1.5 pl-1">Durasi: {rentalDays} hari</p>}
                  <FieldError name="carDropoffDate"/>
                </div>

                {/* ── Add-Ons ── */}
                <div className="mb-5">
                  <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-primary-500"/> Add-Ons</p>
                  <div className="space-y-2">
                    {[
                      { key:'withDriver',        label:'Dengan Sopir',       desc:`${formatRp(DRIVER_PRICE_PER_12H)} / 12 jam`, price:DRIVER_PRICE_PER_12H, icon:UserCog },
                      { key:'premiumInsurance',  label:'Premium Insurance',  desc:'Perlindungan penuh',                          price:75_000,              icon:Shield },
                      { key:'childSeat',         label:'Child Seat',         desc:'Kursi aman untuk anak',                       price:50_000,              icon:Users },
                    ].map((addon) => {
                      const isChecked = addOns[addon.key as keyof typeof addOns];
                      const AddonIcon = addon.icon;
                      return (
                        <button key={addon.key}
                          onClick={()=>setAddOns(prev=>({...prev,[addon.key]:!prev[addon.key as keyof typeof addOns]}))}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isChecked?'border-green-400 bg-green-50':'border-gray-200 hover:border-gray-300 bg-white'}`}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-all ${isChecked?'bg-green-500 border-green-500':'border-gray-300'}`}>
                            {isChecked&&<Check className="w-3 h-3 text-white"/>}
                          </div>
                          <AddonIcon className={`w-4 h-4 shrink-0 ${isChecked?'text-green-600':'text-gray-400'}`}/>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${isChecked?'text-green-700':'text-gray-800'}`}>{addon.label}</p>
                            <p className="text-[11px] text-gray-400">{addon.desc}</p>
                          </div>
                          <p className="text-xs font-bold text-gray-500 shrink-0">+{product.currency} {addon.price.toLocaleString('id-ID')}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Price Summary ── */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sewa {rentalDays} hari × {product.currency} {basePrice.toLocaleString('id-ID')}</span>
                    <span className="font-semibold">{product.currency} {(basePrice*rentalDays).toLocaleString('id-ID')}</span>
                  </div>
                  {addOns.withDriver&&(<div className="flex justify-between text-sm text-gray-600"><span>Sopir × {rentalDays} hari</span><span className="font-semibold">+{product.currency} {(DRIVER_PRICE_PER_12H*rentalDays).toLocaleString('id-ID')}</span></div>)}
                  {addOns.premiumInsurance&&(<div className="flex justify-between text-sm text-gray-600"><span>Premium Insurance × {rentalDays} hari</span><span className="font-semibold">+{product.currency} {(75_000*rentalDays).toLocaleString('id-ID')}</span></div>)}
                  {addOns.childSeat&&(<div className="flex justify-between text-sm text-gray-600"><span>Child Seat × {rentalDays} hari</span><span className="font-semibold">+{product.currency} {(50_000*rentalDays).toLocaleString('id-ID')}</span></div>)}

                  {/* Delivery fee rows — hanya muncul jika custom location */}
                  {pickupType === 'lokasi_lain' && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-primary-400 shrink-0"/>
                        Biaya Penjemputan
                        {pickupDelivery.loading && <Loader2 className="w-3 h-3 animate-spin ml-1"/>}
                      </span>
                      <span className={`font-semibold ${needsManualPickup ? 'text-amber-500' : effectivePickupFee === 0 ? 'text-green-600' : ''}`}>
                        {pickupDelivery.loading ? '…' : needsManualPickup ? 'Konfirmasi agen' : effectivePickupFee === 0 ? 'GRATIS' : `+${product.currency} ${effectivePickupFee.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  )}
                  {dropoffType === 'lokasi_lain' && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPinned className="w-3 h-3 text-primary-400 shrink-0"/>
                        Biaya Pengantaran
                        {dropoffDelivery.loading && <Loader2 className="w-3 h-3 animate-spin ml-1"/>}
                      </span>
                      <span className={`font-semibold ${needsManualDropoff ? 'text-amber-500' : effectiveDropoffFee === 0 ? 'text-green-600' : ''}`}>
                        {dropoffDelivery.loading ? '…' : needsManualDropoff ? 'Konfirmasi agen' : effectiveDropoffFee === 0 ? 'GRATIS' : `+${product.currency} ${effectiveDropoffFee.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary-600">
                      {(needsManualPickup || needsManualDropoff)
                        ? <span className="text-amber-500 text-sm">+ biaya antar/jemput (konfirmasi)</span>
                        : `${product.currency} ${totalCarPrice.toLocaleString('id-ID')}`
                      }
                    </span>
                  </div>
                  {(needsManualPickup || needsManualDropoff) && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5"/>
                      Biaya antar/jemput untuk lokasi &gt;60 km akan dikonfirmasi agen dalam 1×24 jam setelah booking.
                    </p>
                  )}
                </div>

                <button onClick={handleAddToCart} disabled={isInCart(product.id)} className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98] shadow-lg ${isInCart(product.id)?'bg-green-50 border-2 border-green-400 text-green-700 cursor-default':'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30 hover:shadow-primary-700/40'}`}>{isInCart(product.id)?<span className="flex items-center justify-center gap-2"><Check className="w-4 h-4"/> Added to Cart</span>:<span className="flex items-center justify-center gap-2"><ShoppingCart className="w-4 h-4"/> Proceed to Booking</span>}</button>
                <button onClick={()=>handleReserveNow('car')} className="w-full py-4 rounded-2xl font-extrabold text-sm border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-all active:scale-[0.98] mt-3">Reserve Now</button>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400"><span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500"/> Aman</span><span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-blue-500"/> Terverifikasi</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500"/> 24/7 Support</span></div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"><div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-primary-600"/></div><div><p className="text-xs text-gray-500">Butuh bantuan?</p><p className="text-sm font-bold text-gray-800">Hubungi Customer Service</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

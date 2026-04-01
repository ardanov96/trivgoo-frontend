import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../src/hooks/useLangNavigate';

import { useParams, useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Star, MapPin, ChevronLeft, Heart, ShoppingCart,
  Users, Gauge, Briefcase, Award, UserCog, Car,
  CheckCircle2, Shield, Clock, Phone, MapPinned, Navigation,
  Info, ChevronDown, ChevronUp, Plus, Minus, Check,
  Fuel, CalendarDays, BadgeCheck, Headphones, Package, AlertCircle,
  Tag, Percent, DollarSign, Sparkles, Loader2, AlertTriangle, X, ChevronRight, Search,
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

const isCar = (details: any): details is CarDetails => details?.type === 'car';
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

// ─── Delivery Fee Config Types ──────────────────────────────────────────────
interface DeliveryZone { maxKm: number; fee: number; label: string; }
interface DeliveryConfig {
  enabled: boolean;
  freeRadiusKm: number;
  minCharge: number;
  zones: DeliveryZone[];
}

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

function calcFeeFromConfig(km: number, config: DeliveryConfig): number {
  if (config.freeRadiusKm > 0 && km <= config.freeRadiusKm) return 0;
  const zone = config.zones.find(z => km <= z.maxKm);
  if (!zone) return -1;
  if (zone.fee === -1) return -1;
  return Math.max(zone.fee, config.minCharge);
}

type DeliveryInfo = {
  km: number | null;
  fee: number;
  label: string;
  loading: boolean;
  error: string | null;
};

const INITIAL_DELIVERY: DeliveryInfo = { km: null, fee: 0, label: '', loading: false, error: null };

async function calcDeliveryFee(
  originAddress: string,
  destinationAddress: string,
  config: DeliveryConfig,
): Promise<{ km: number; fee: number; label: string }> {
  let km: number;

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
    const geocode = async (q: string): Promise<[number, number]> => {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`);
      const data = await r.json();
      if (!data.length) throw new Error('Address not found: ' + q);
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    };
    const [lat1, lon1] = await geocode(originAddress);
    const [lat2, lon2] = await geocode(destinationAddress);
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const kmRounded = Math.round(km * 10) / 10;
  const fee = calcFeeFromConfig(kmRounded, config);
  const zone = config.zones.find(z => kmRounded <= z.maxKm);
  const label = fee === 0 ? `Free (< ${config.freeRadiusKm} km)` : zone?.label ?? 'Confirm';
  return { km: kmRounded, fee, label };
}

// ─── Delivery Fee Badge ────────────────────────────────────────────────────
interface DeliveryFeeBadgeProps { info: DeliveryInfo; type: 'pickup' | 'dropoff'; }
const DeliveryFeeBadge: React.FC<DeliveryFeeBadgeProps> = ({ info, type }) => {
  const { t } = useTranslation();
  if (info.loading) return (
    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      <span>{type === 'pickup' ? t('delivery.calculating_pickup') : t('delivery.calculating_dropoff')}</span>
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
  const isFree = info.fee === 0;
  return (
    <div className={`mt-2 rounded-xl px-3 py-2.5 flex items-start gap-2.5 border text-xs
      ${isManual ? 'bg-amber-50 border-amber-200' : isFree ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="shrink-0 mt-0.5">
        {isManual ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          : isFree ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            : <Navigation className="w-3.5 h-3.5 text-blue-500" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-bold ${isManual ? 'text-amber-700' : isFree ? 'text-green-700' : 'text-blue-700'}`}>
            {type === 'pickup' ? t('delivery.pickup_fee_label') : t('delivery.dropoff_fee_label')}
          </span>
          <span className={`font-extrabold ${isManual ? 'text-amber-600' : isFree ? 'text-green-600' : 'text-blue-700'}`}>
            {isManual ? t('delivery.agent_confirm') : isFree ? t('delivery.free') : formatRp(info.fee)}
          </span>
        </div>
        <p className={`mt-0.5 ${isManual ? 'text-amber-600' : isFree ? 'text-green-600' : 'text-blue-600'}`}>
          {info.km} {t('delivery.km_from_office')}
          {isManual && ` — ${t('delivery.out_of_range')}`}
          {isFree && ` — ${t('delivery.free_radius')}`}
        </p>
      </div>
    </div>
  );
};

// ─── Voucher Banner ────────────────────────────────────────────────────────
interface ProductVoucherBannerProps { vouchers: any[]; }
const ProductVoucherBanner: React.FC<ProductVoucherBannerProps> = ({ vouchers }) => {
  const { t } = useTranslation();
  const [expandedAdmin, setExpandedAdmin] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState(false);
  if (!vouchers || vouchers.length === 0) return null;
  const now = new Date();
  const adminVouchers = vouchers.filter(v =>
    (v.scope_owner === 'admin' || !v.scope_owner) && v.is_active &&
    (!v.expires_at || new Date(v.expires_at) >= now)
  );
  const agentVouchers = vouchers.filter(v =>
    v.scope_owner === 'agent' && v.is_active &&
    (!v.expires_at || new Date(v.expires_at) >= now)
  );
  if (adminVouchers.length === 0 && agentVouchers.length === 0) return null;
  const PREVIEW_COUNT = 2;
  const VoucherRow = ({ v }: { v: any }) => (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${v.type === 'percent' ? 'bg-blue-100' : 'bg-green-100'}`}>
        {v.type === 'percent' ? <Percent className="w-4 h-4 text-blue-600" /> : <DollarSign className="w-4 h-4 text-green-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-extrabold text-xs text-gray-900 font-mono tracking-widest">{v.code}</span>
          {v.expires_at && (
            <span className="text-[10px] text-orange-500 font-semibold">
              {t('voucher.valid_until')} {new Date(v.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        {v.description && <p className="text-[11px] text-gray-500 truncate mt-0.5">{v.description}</p>}
        {v.min_transaction > 0 && (
          <p className="text-[10px] text-gray-400 mt-0.5">{t('voucher.min_transaction')} {formatRp(v.min_transaction)}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-extrabold ${v.type === 'percent' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
          {v.type === 'percent' ? `${v.value}% ${t('voucher.off')}` : `${formatRp(v.value)} ${t('voucher.off')}`}
        </span>
        {v.type === 'percent' && v.max_discount && (
          <p className="text-[10px] text-gray-400 mt-0.5 text-right">{t('voucher.max_discount')} {formatRp(v.max_discount)}</p>
        )}
      </div>
    </div>
  );
  return (
    <div className="space-y-3 mb-5">
      {adminVouchers.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-blue-200 shadow-sm">
          <div className="bg-gradient-to-r from-blue-500 to-primary-500 px-4 py-2.5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-white" />
            <p className="text-white text-xs font-extrabold uppercase tracking-wider">{adminVouchers.length} {t('voucher.platform_vouchers')}</p>
            <span className="ml-auto text-[10px] text-blue-100 font-semibold">{t('voucher.valid_all_products')}</span>
          </div>
          <div className="bg-gradient-to-b from-blue-50 to-white divide-y divide-blue-100">
            {(expandedAdmin ? adminVouchers : adminVouchers.slice(0, PREVIEW_COUNT)).map((v: any) => (<VoucherRow key={v.id} v={v} />))}
            {adminVouchers.length > PREVIEW_COUNT && (
              <button type="button" onClick={() => setExpandedAdmin(p => !p)} className="w-full py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                {expandedAdmin
                  ? <><ChevronUp className="w-3.5 h-3.5" /> {t('voucher.show_less')}</>
                  : <><ChevronDown className="w-3.5 h-3.5" /> +{adminVouchers.length - PREVIEW_COUNT} {t('voucher.more_vouchers')}</>}
              </button>
            )}
          </div>
        </div>
      )}
      {agentVouchers.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-orange-200 shadow-sm">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <p className="text-white text-xs font-extrabold uppercase tracking-wider">{agentVouchers.length} {t('voucher.agent_exclusive')}</p>
            <span className="ml-auto text-[10px] text-orange-100 font-semibold">{t('voucher.exclusive_this_product')}</span>
          </div>
          <div className="bg-gradient-to-b from-orange-50 to-amber-50 divide-y divide-orange-100">
            {(expandedAgent ? agentVouchers : agentVouchers.slice(0, PREVIEW_COUNT)).map((v: any) => (<VoucherRow key={v.id} v={v} />))}
            {agentVouchers.length > PREVIEW_COUNT && (
              <button type="button" onClick={() => setExpandedAgent(p => !p)} className="w-full py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors flex items-center justify-center gap-1">
                {expandedAgent
                  ? <><ChevronUp className="w-3.5 h-3.5" /> {t('voucher.show_less')}</>
                  : <><ChevronDown className="w-3.5 h-3.5" /> +{agentVouchers.length - PREVIEW_COUNT} {t('voucher.more_promos')}</>}
              </button>
            )}
          </div>
        </div>
      )}
      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-1.5">
        <Tag className="w-3 h-3 text-gray-400 shrink-0" />
        <p className="text-[10px] text-gray-500 font-semibold">{t('voucher.checkout_info')}</p>
      </div>
    </div>
  );
};

// ─── Availability Calendar ─────────────────────────────────────────────────
const AvailabilityCalendar: React.FC<{ blockedDates: string[] }> = ({ blockedDates }) => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const buildDays = () => {
    let days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    return days;
  };
  const isBlocked = (date: Date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    if (date < today) return true;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    return blockedDates.includes(dateStr);
  };
  const dayKeys = ['sun','mon','tue','wed','thu','fri','sat'] as const;
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary-600" /> {t('tour.check_availability')}
      </h2>
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-primary-50 hover:text-primary-600 rounded-full transition-colors border border-gray-100">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="font-bold text-gray-800 text-sm">
          {t(`calendar.months.${currentMonth.getMonth()}`)} {currentMonth.getFullYear()}
        </span>
        <button onClick={handleNextMonth} className="p-2 hover:bg-primary-50 hover:text-primary-600 rounded-full transition-colors border border-gray-100">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayKeys.map((key) => (
          <div key={key} className="text-xs font-bold text-gray-400 py-1">{t(`calendar.days_short.${key}`)}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {buildDays().map((date, idx) => {
          if (!date) return <div key={idx} className="p-2"></div>;
          const blocked = isBlocked(date);
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div key={idx} className={`flex items-center justify-center p-2 rounded-xl text-sm font-semibold transition-all
              ${blocked ? 'bg-gray-50 text-gray-400 line-through decoration-gray-300 cursor-not-allowed border border-gray-100 opacity-60'
                : 'bg-white text-gray-800 border border-gray-100 hover:border-primary-300 hover:bg-primary-50 cursor-pointer shadow-sm'}
              ${isToday && !blocked ? '!bg-primary-50 !text-primary-700 !border-primary-300' : ''}`}>
              {date.getDate()}
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-gray-500 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white shadow-sm border border-gray-200"></div>
          {t('tour.availability_available')}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200 line-through decoration-gray-400"></div>
          {t('tour.availability_unavailable')}
        </div>
      </div>
    </div>
  );
};

// ─── Location Autocomplete ─────────────────────────────────────────────────
interface LocationResult { place_id: number; display_name: string; lat: string; lon: string; }
const LocationAutocomplete: React.FC<{
  placeholder: string; value: string; onChange: (val: string) => void; error?: boolean;
}> = ({ placeholder, value, onChange, error }) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    if (!query || query === value || query.length < 3) { setResults([]); setIsOpen(false); return; }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=id`);
        const data = await res.json();
        setResults(data); setIsOpen(true);
      } catch (e) { console.error('Location search error:', e); }
      finally { setIsLoading(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, value]);
  const handleSelect = (result: LocationResult) => { setQuery(result.display_name); onChange(result.display_name); setIsOpen(false); };
  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="w-4 h-4 text-gray-400" /></div>
        <input type="text" placeholder={placeholder} value={query}
          onChange={(e) => { setQuery(e.target.value); if (e.target.value === '') onChange(''); }}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-gray-50 ${error ? 'border-red-400' : 'border-gray-200'}`}
        />
        {isLoading && (<div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><Loader2 className="w-4 h-4 text-primary-500 animate-spin" /></div>)}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <ul className="max-h-60 overflow-y-auto">
            {results.map((item, idx) => {
              const parts = item.display_name.split(',');
              const mainName = parts[0];
              const addressDetail = parts.slice(1).join(',').trim();
              return (
                <li key={item.place_id || idx} onClick={() => handleSelect(item)}
                  className="flex items-start gap-3 p-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                  <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{mainName}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{addressDetail || mainName}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Share Buttons ─────────────────────────────────────────────────────────
interface ShareButtonsProps { productName: string; productImage: string; productUrl: string; }
const ShareButtons: React.FC<ShareButtonsProps> = ({ productName, productImage, productUrl }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const encodedUrl   = encodeURIComponent(productUrl);
  const encodedTitle = encodeURIComponent(productName + ' | Trivgoo');
  const encodedImg   = encodeURIComponent(productImage);
  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: (<svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>),
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: (<svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&picture=${encodedImg}&title=${encodedTitle}`,
    },
    {
      name: 'Instagram',
      icon: (<svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>),
      color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90',
      url: `https://www.instagram.com/?url=${encodedUrl}`,
    },
    {
      name: 'TikTok',
      icon: (<svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z"/></svg>),
      color: 'bg-black hover:bg-gray-800',
      url: `https://www.tiktok.com/share?url=${encodedUrl}`,
    },
  ];
  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setShowDropdown(o => !o)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors group"
        title={t('share.share_label')}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="text-sm font-medium">{t('share.share_label')}</span>
      </button>
      {showDropdown && (
        <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 w-52 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('share.share_to')}</p>
          <div className="space-y-1">
            {shareLinks.map(link => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                onClick={() => setShowDropdown(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${link.color}`}>
                {link.icon}{link.name}
              </a>
            ))}
            <button onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all bg-gray-100 hover:bg-gray-200 text-gray-700">
              {copied
                ? (<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)
                : (<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>)}
              {copied ? t('share.link_copied') : t('share.copy_link')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { langNavigate, langPath } = useLangNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pickupType, setPickupType] = useState<'kantor' | 'lokasi_lain'>('kantor');
  const [dropoffType, setDropoffType] = useState<'kantor' | 'lokasi_lain'>('kantor');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupDelivery, setPickupDelivery] = useState<DeliveryInfo>(INITIAL_DELIVERY);
  const [dropoffDelivery, setDropoffDelivery] = useState<DeliveryInfo>(INITIAL_DELIVERY);
  const [addOns, setAddOns] = useState<{ withDriver: boolean; premiumInsurance: boolean; childSeat: boolean }>({ withDriver: false, premiumInsurance: false, childSeat: false });
  const [termsOpen, setTermsOpen] = useState(false);
  const [tourDate, setTourDate] = useState('');
  const [tourPax, setTourPax] = useState(2);
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const [infantPax, setInfantPax] = useState(0);
  const [childPax, setChildPax] = useState(0);
  const [teenPax, setTeenPax] = useState(0);
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

  const calcDelivery = useCallback(async (
    address: string, productLocation: string, config: DeliveryConfig,
    setter: React.Dispatch<React.SetStateAction<DeliveryInfo>>,
  ) => {
    if (!address.trim() || address.trim().length < 8) { setter(INITIAL_DELIVERY); return; }
    if (!config.enabled) { setter({ km: null, fee: 0, label: '', loading: false, error: t('delivery.service_unavailable') }); return; }
    setter(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await calcDeliveryFee(productLocation, address, config);
      setter({ ...result, loading: false, error: null });
    } catch (e: any) {
      setter({ km: null, fee: 0, label: '', loading: false, error: t('delivery.address_not_found') });
    }
  }, [t]);

  useEffect(() => {
    if (pickupType !== 'lokasi_lain' || !product) { setPickupDelivery(INITIAL_DELIVERY); return; }
    const config: DeliveryConfig = (product as any).delivery_config || FALLBACK_DELIVERY_CONFIG;
    const timer = setTimeout(() => calcDelivery(pickupAddress, product.location || 'Bali, Indonesia', config, setPickupDelivery), 900);
    return () => clearTimeout(timer);
  }, [pickupAddress, pickupType, product, calcDelivery]);

  useEffect(() => {
    if (dropoffType !== 'lokasi_lain' || !product) { setDropoffDelivery(INITIAL_DELIVERY); return; }
    const config: DeliveryConfig = (product as any).delivery_config || FALLBACK_DELIVERY_CONFIG;
    const timer = setTimeout(() => calcDelivery(dropoffAddress, product.location || 'Bali, Indonesia', config, setDropoffDelivery), 900);
    return () => clearTimeout(timer);
  }, [dropoffAddress, dropoffType, product, calcDelivery]);

  useEffect(() => { if (pickupType === 'kantor') setPickupDelivery(INITIAL_DELIVERY); }, [pickupType]);
  useEffect(() => { if (dropoffType === 'kantor') setDropoffDelivery(INITIAL_DELIVERY); }, [dropoffType]);

  useEffect(() => {
    if (!product) return;
    const tt = (product.details as any)?.tripType || 'Open Trip';
    const defaultMin = tt === 'Private Trip' ? 1 : tt === 'Group Trip' ? 6 : 2;
    setTourPax(prev => Math.max(prev, defaultMin));
  }, [product]);

  useEffect(() => {
    const load = async () => {
      if (!id) { setProduct(null); setReviews([]); setError(t('product.not_found')); setIsLoading(false); return; }
      const numericId = decodeId(id);
      if (numericId === null) { setProduct(null); setReviews([]); setError(t('product.not_found')); setIsLoading(false); return; }
      setIsLoading(true); setError(null); setProduct(null); setReviews([]);
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
      } catch (e: any) {
        console.error('Failed to load product detail', e);
        setProduct(null); setReviews([]);
        setError(e?.response?.status === 404 ? t('product.not_found') : t('product.load_error'));
      } finally { setIsLoading(false); }
    };
    load();
  }, [id, t]);

  const effectivePickupFee = pickupType === 'lokasi_lain' && pickupDelivery.fee >= 0 ? pickupDelivery.fee : 0;
  const effectiveDropoffFee = dropoffType === 'lokasi_lain' && dropoffDelivery.fee >= 0 ? dropoffDelivery.fee : 0;
  const needsManualPickup = pickupType === 'lokasi_lain' && pickupDelivery.fee === -1;
  const needsManualDropoff = dropoffType === 'lokasi_lain' && dropoffDelivery.fee === -1;

  const getGroupTiers = () => (tourDetails as any)?.groupPricingTiers || [];
  const getChildPricing = () => (tourDetails as any)?.childPricing;
  const getTierPrice = (basePrice: number) => {
    const tiers = getGroupTiers();
    if (!tiers.length || tourDetails?.tripType !== 'Group Trip') return basePrice;
    const tier = tiers[selectedTierIdx];
    if (!tier) return basePrice;
    return Math.round(basePrice * (1 - tier.discountPct / 100));
  };
  const getChildPrice = (basePrice: number, type: 'infant' | 'child' | 'teen') => {
    const cp = getChildPricing();
    if (!cp?.enabled) return basePrice;
    const discountPct = cp[type] ?? 0;
    return Math.round(basePrice * (1 - discountPct / 100));
  };
  const calcTourTotal = (basePrice: number) => {
    const tierPrice = getTierPrice(basePrice);
    const adultTotal = tierPrice * tourPax;
    const cp = getChildPricing();
    if (!cp?.enabled) return adultTotal;
    return adultTotal + getChildPrice(basePrice, 'infant') * infantPax + getChildPrice(basePrice, 'child') * childPax + getChildPrice(basePrice, 'teen') * teenPax;
  };
  const totalPaxCount = () => tourPax + infantPax + childPax + teenPax;

  const generateCheckoutPayload = (type: 'tour_stay' | 'car') => {
    if (!product) return null;
    const errors: Record<string, string> = {};
    if (type === 'tour_stay') {
      const isTourProduct = isTour(product.details);
      if (isTourProduct) {
        const _tripType = (product.details as any)?.tripType || 'Open Trip';
        const _minPax = _tripType === 'Private Trip' ? 1 : _tripType === 'Group Trip' ? 6 : 2;
        if (!tourDate) errors.tourDate = t('validation.select_tour_date');
        if (tourPax < _minPax) errors.tourPax = t('validation.min_participants', { min: _minPax, type: _tripType });
      } else {
        if (!checkInDate) errors.checkIn = t('validation.select_checkin');
        if (!checkOutDate) errors.checkOut = t('validation.select_checkout');
        if (checkInDate && checkOutDate && checkInDate >= checkOutDate) errors.checkOut = t('validation.checkout_after_checkin');
        if (stayGuests < 1) errors.stayGuests = t('validation.min_1_guest');
      }
    } else {
      if (!carPickupDate) errors.carPickupDate = t('validation.select_pickup_date');
      if (!carDropoffDate) errors.carDropoffDate = t('validation.select_return_date');
      if (carPickupDate && carDropoffDate) {
        const start = new Date(`${carPickupDate}T${carPickupTime}`);
        const end = new Date(`${carDropoffDate}T${carDropoffTime}`);
        if (start >= end) {
          errors.carDropoffDate = t('validation.invalid_return_time');
        } else {
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          if (days < 2) errors.carDropoffDate = t('validation.min_2_days');
        }
      }
      if (pickupType === 'lokasi_lain' && !pickupAddress.trim()) errors.pickupAddress = t('validation.enter_pickup_address');
      if (dropoffType === 'lokasi_lain' && !dropoffAddress.trim()) errors.dropoffAddress = t('validation.enter_dropoff_address');
      if (pickupDelivery.loading || dropoffDelivery.loading) errors.deliveryCalc = t('validation.wait_fee_calc');
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Swal.fire({ icon: 'warning', title: t('booking.complete_details'), text: Object.values(errors)[0], confirmButtonColor: '#0ea5e9' });
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
        pricePerPax: isTourProduct ? getTierPrice(Number(product.price)) : Number(product.price),
        basePricePerPax: Number(product.price),
        pax: isTourProduct ? totalPaxCount() : qty, guestCount: isTourProduct ? totalPaxCount() : qty,
        duration: dur,
        totalPrice: isTourProduct ? calcTourTotal(Number(product.price)) : Number(product.price) * qty * dur,
        adultPax: isTourProduct ? tourPax : qty, infantPax: isTourProduct ? infantPax : 0,
        childPax: isTourProduct ? childPax : 0, teenPax: isTourProduct ? teenPax : 0,
        selectedTier: isTourProduct ? getGroupTiers()[selectedTierIdx] : null,
        childPricing: isTourProduct ? getChildPricing() : null,
        date: isTourProduct ? tourDate : `${checkInDate} - ${checkOutDate}`,
        unitLabel: isTourProduct ? t('tour.check_availability') : t('stay.nights_label'),
        priceUnitLabel: isTourProduct ? 'person' : 'night',
        vehicleType: isTourProduct ? 'tour' : 'stay', availableVouchers: productVouchers,
      };
    } else {
      const start = new Date(`${carPickupDate}T${carPickupTime}`);
      const end = new Date(`${carDropoffDate}T${carDropoffTime}`);
      let calculatedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (calculatedDays < 1) calculatedDays = 1;
      const driverPrice = addOns.withDriver ? DRIVER_PRICE_PER_12H : 0;
      const insurancePrice = addOns.premiumInsurance ? 75_000 : 0;
      const childSeatPrice = addOns.childSeat ? 50_000 : 0;
      const totalPerDay = Number(product.price) + driverPrice + insurancePrice + childSeatPrice;
      const deliveryTotal = effectivePickupFee + effectiveDropoffFee;
      return {
        productId: product.id, productName: product.name, location: product.location,
        image: product.image_url || product.image, currency: product.currency || 'IDR',
        pricePerPax: totalPerDay, basePricePerPax: Number(product.price), pax: 1, guestCount: 1, duration: calculatedDays,
        totalPrice: totalPerDay * calculatedDays + deliveryTotal,
        date: `${carPickupDate} - ${carDropoffDate}`,
        startTime: `${carPickupDate} ${carPickupTime}:00`, endTime: `${carDropoffDate} ${carDropoffTime}:00`,
        unitLabel: t('common.days'), priceUnitLabel: 'day', vehicleType: 'car',
        transmission: (product.details as CarDetails)?.transmission, seats: (product.details as CarDetails)?.seats,
        luggage: (product.details as CarDetails)?.luggage, year: (product.details as CarDetails)?.year,
        fuelPolicy: (product.details as CarDetails)?.fuelPolicy, withDriver: addOns.withDriver, addOns,
        pickupType, dropoffType,
        pickupAddress: pickupType === 'lokasi_lain' ? pickupAddress : null,
        dropoffAddress: dropoffType === 'lokasi_lain' ? dropoffAddress : null,
        pickupFee: effectivePickupFee, dropoffFee: effectiveDropoffFee,
        pickupDeliveryKm: pickupDelivery.km, dropoffDeliveryKm: dropoffDelivery.km,
        needsManualPickupConfirmation: needsManualPickup, needsManualDropoffConfirmation: needsManualDropoff,
        availableVouchers: productVouchers,
      };
    }
  };

  const handleAddToCart = () => {
    if (!product || isInCart(product.id)) return;
    const type = isTour(product.details) || isStay(product.details) ? 'tour_stay' : 'car';
    const payload = generateCheckoutPayload(type);
    if (!payload) return;
    addToCart(product, payload.duration, payload);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const calcNights = () =>
    checkInDate && checkOutDate
      ? Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000))
      : 0;

  const handleReserveNow = (type: 'tour_stay' | 'car') => {
    const payload = generateCheckoutPayload(type);
    if (!payload) return;
    langNavigate('/checkout-summary', { state: payload });
  };

  const FieldError = ({ name }: { name: string }) =>
    fieldErrors[name] ? <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" /> {fieldErrors[name]}</p> : null;

  const excludedDates = useMemo(() => {
    let bd = product?.blocked_dates;
    if (typeof bd === 'string') { try { bd = JSON.parse(bd); } catch (e) { bd = []; } }
    return (Array.isArray(bd) ? bd : []).map((d: string) => new Date(d));
  }, [product?.blocked_dates]);

  // ── Loading ──
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

  // ── Error ──
  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{error}</h2>
        <p className="text-gray-600 mb-6">{t('product.try_again_desc')}</p>
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">{t('common.save')}</button>
          <Link to={langPath('/explore')} className="text-primary-600 font-semibold hover:underline">{t('product.back_to_explore')}</Link>
        </div>
      </div>
    </div>
  );

  // ── Not found ──
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('product.not_found')}</h2>
        <Link to={langPath('/explore')} className="text-primary-600 font-semibold hover:underline">← {t('product.back_to_explore')}</Link>
      </div>
    </div>
  );

  const isSaved = isInWishlist(product.id);
  const isCarProduct = isCar(product.details);
  const carDetails = isCarProduct ? (product.details as CarDetails) : null;
  const tourDetails = isTour(product.details) ? (product.details as TourDetails) : null;
  const stayDetails = isStay(product.details) ? (product.details as StayDetails) : null;
  const productVouchers = (product as any).vouchers || [];

  const shareUrl = window.location.href;

  const parseDateStr = (dStr: string) => dStr ? new Date(dStr) : null;
  const toDateStr = (date: Date | null) => date ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` : '';

  // ════════════════════════════════════════════════════════
  //  TOUR / STAY
  // ════════════════════════════════════════════════════════
  if (!isCarProduct) {
    const isTourProduct = !!tourDetails;
    const categoryLabel = isTourProduct ? t('tour.category_label') : t('stay.category_label');
    const categoryLink = isTourProduct ? '/explore?category_id=1' : '/explore?category_id=2';
    const tripType = (tourDetails as any)?.tripType || 'Open Trip';
    const minPaxFromTripType = tripType === 'Private Trip' ? 1 : tripType === 'Group Trip' ? 6 : 2;
    const minPax = (tourDetails as any)?.minPax ?? minPaxFromTripType;
    const highlights = isTourProduct ? [
      { icon: Clock,        label: t('highlights.duration'),        value: (tourDetails as any)?.duration || 'Full Day' },
      { icon: Users,        label: t('highlights.min_participants'), value: `${minPax} ${t('common.guests')}` },
      { icon: Award,        label: t('highlights.trip_type'),       value: tripType },
      { icon: CheckCircle2, label: t('highlights.category'),        value: (tourDetails as any)?.tourCategory || 'Wisata' },
    ] : [
      { icon: CalendarDays, label: t('highlights.min_stay'),  value: `${(stayDetails as any)?.minNight || 1} ${t('stay.nights_label')}` },
      { icon: Users,        label: t('highlights.guests'),    value: `${(stayDetails as any)?.maxGuest || 2} ${t('common.guests')}` },
      { icon: Award,        label: t('highlights.type'),      value: (stayDetails as any)?.stayCategory || 'Hotel' },
      { icon: BadgeCheck,   label: t('highlights.check_in'),  value: (stayDetails as any)?.checkIn || '14:00' },
    ];
    const inclusions: string[] = (isTourProduct ? (tourDetails as any)?.inclusions : (stayDetails as any)?.inclusions)?.filter(Boolean) || [];
    const exclusions: string[] = (isTourProduct ? (tourDetails as any)?.exclusions : (stayDetails as any)?.exclusions)?.filter(Boolean) || [];
    const reviewCount = reviews.length;
    const avgRatingStr = reviewCount > 0 ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviewCount).toFixed(1) : (product.rating || '0.0');
    const getPct = (filterFn: (r: any) => boolean) => reviewCount === 0 ? 0 : Math.round((reviews.filter(filterFn).length / reviewCount) * 100);
    const reviewDistribution = [
      [t('product.excellent'), getPct(r => Number(r.rating) === 5)],
      [t('product.good'),      getPct(r => Number(r.rating) === 4)],
      [t('product.average'),   getPct(r => Number(r.rating) === 3)],
      [t('product.poor'),      getPct(r => Number(r.rating) <= 2)],
    ];
    const itinerary = (isTourProduct && tourDetails?.itinerary) || [];
    const nights = calcNights();
    const tourStayTotal = isTourProduct ? Number(product.price) * tourPax : Number(product.price) * (nights || 1) * stayGuests;
    const galleryImagesArray = Array.isArray(product.images) ? product.images : [];
    const mainImgSrc = getImageUrl(product.image_url || product.image);
    const allImages = [mainImgSrc, ...galleryImagesArray.map(item => getImageUrl(typeof item === 'string' ? item : item?.url)).filter(Boolean)];
    const openGallery = (index: number) => { setCurrentImageIndex(index); setIsGalleryOpen(true); };

    return (
      <>
        <div className="min-h-screen bg-gray-50 pt-20">
          <SEO
            title={(product as any).seo_title || `${product.name} | Trivgoo`}
            description={(product as any).seo_description || (product as any).description || `Book ${product.name} at ${formatLocation(product.location || '')} on Trivgoo.`}
            image={(product as any).seo_og_image || product.image_url || product.image || FALLBACK_IMAGE}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-primary-600 font-medium text-gray-500">
                <ChevronLeft className="w-3.5 h-3.5" /> {t('common.back')}
              </button>
              <span>/</span>
              <Link to={langPath('/')} className="hover:text-primary-600">{t('product.breadcrumb_home')}</Link>
              <span>/</span>
              <Link to={categoryLink} className="hover:text-primary-600">{categoryLabel}</Link>
              <span>/</span>
              <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
            </div>

            {/* Title + Meta */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 inline mr-0.5" />{avgRatingStr}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 ml-1">{reviewCount} {t('reviews_section.reviews_label')}</span>
                </div>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />{formatLocation(product.location || '')}
                </span>
                {productVouchers.filter((v: any) => v.is_active).length > 0 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                      <Tag className="w-3 h-3" />{productVouchers.filter((v: any) => v.is_active).length} Promo
                    </span>
                  </>
                )}
                {isLoggedIn && (
                  <>
                    <span className="text-gray-300">·</span>
                    <button onClick={() => toggleWishlist(product)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-red-500' : ''}`} />
                      {isSaved ? t('wishlist.saved') : t('wishlist.save')}
                    </button>
                  </>
                )}
                <span className="text-gray-300">·</span>
                <ShareButtons productName={product.name} productImage={allImages[0] || product.image_url || product.image || ''} productUrl={shareUrl} />
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: '400px' }}>
              <div className="grid gap-1.5 h-full" style={{ gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
                <div className="row-span-2 relative overflow-hidden bg-gray-200">
                  <img src={allImages[0]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => openGallery(0)} onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                </div>
                {[0,1,2,3].map((i) => {
                  const src = allImages[i+1] || allImages[0];
                  const hasMore = allImages.length > 5;
                  const remainingCount = allImages.length - 5;
                  return (
                    <div key={i} className="relative overflow-hidden bg-gray-200">
                      <img src={src} alt={`${product.name} ${i+2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => openGallery(i+1)} onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                      {i === 3 && (
                        <div onClick={() => openGallery(4)} className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                          <div className="bg-white rounded-lg px-4 py-2">
                            <p className="text-gray-900 font-bold text-sm">
                              {hasMore ? `+${remainingCount} ${t('product.gallery')}` : t('product.gallery')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT CONTENT */}
              <div className="lg:col-span-2 space-y-6">
                {/* Highlights */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {highlights.map((h, i) => (
                      <div key={i} className="text-center">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2"><h.icon className="w-5 h-5 text-primary-600" /></div>
                        <p className="text-xs text-gray-400 mb-0.5">{h.label}</p>
                        <p className="text-sm font-bold text-gray-800">{h.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary-600" />{t('product.description')}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {(product as any).description || `Enjoy the best ${isTourProduct ? 'tour' : 'stay'} experience in ${formatLocation(product.location || '')}. ${product.name} offers premium service with complete facilities.`}
                  </p>
                </div>

                {/* Inclusions / Exclusions */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary-600" />{t('product.whats_included')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">✓ {t('product.included')}</p>
                      {inclusions.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{item}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">✗ {t('product.excluded')}</p>
                      {exclusions.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-4 h-4 rounded-full border-2 border-red-300 flex items-center justify-center shrink-0"><div className="w-1.5 h-0.5 bg-red-400 rounded" /></div>{item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Itinerary */}
                {isTourProduct && itinerary.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary-600" />{t('product.itinerary')}
                    </h2>
                    <div className="relative pl-4">
                      <div className="absolute left-0 top-3 bottom-0 w-0.5 bg-primary-100 rounded" />
                      <div className="space-y-6">
                        {itinerary.map((item: any, i: number) => (
                          <div key={i} className="relative pl-6">
                            <div className="absolute left-[-21px] top-1 w-4 h-4 rounded-full bg-primary-500 border-4 border-white shadow-sm" />
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-extrabold text-white bg-primary-600 px-2 py-0.5 rounded-md tracking-wider uppercase">{t('itinerary.day_label')} {item.day}</span>
                              <span className="text-sm font-bold text-gray-900">{item.title}</span>
                            </div>
                            {item.description && <p className="text-xs text-gray-600 leading-relaxed max-w-2xl mb-2">{item.description}</p>}
                            {(item.accommodation || (item.meals && item.meals.length > 0)) && (
                              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                                {item.accommodation && <span className="text-primary-700 bg-primary-50 border border-primary-100 px-2 py-1 rounded-md">{t('itinerary.stay_label')}: {item.accommodation}</span>}
                                {item.meals && item.meals.length > 0 && <span className="text-orange-700 bg-orange-50 border border-orange-100 px-2 py-1 rounded-md">{t('itinerary.meals_label')}: {item.meals.join(', ')}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPinned className="w-4 h-4 text-primary-600" />
                    {isTourProduct ? t('tour.pickup_point') : t('stay.location_label')}
                  </h2>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-600">{product.location || t('tour.location_confirmed')}</p>
                  </div>
                </div>

                {/* Availability Calendar */}
                <AvailabilityCalendar blockedDates={product.blocked_dates as unknown as string[] || []} />

                {/* Cancellation Policy */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-600" />{t('product.cancellation_policy')}
                  </h2>
                  <div className="space-y-2">
                    {[
                      { label: t('product.cancel_24h'),      value: t('product.full_refund'), color: 'text-green-600' },
                      { label: t('product.cancel_less_24h'), value: t('product.no_refund'),   color: 'text-red-500' },
                      { label: t('product.no_show'),         value: t('product.no_refund'),   color: 'text-red-500' },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                        <span className="text-gray-600">{row.label}</span>
                        <span className={`font-bold ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />{t('product.traveler_reviews')}
                  </h2>
                  <div className="flex items-center gap-6 mb-5 pb-5 border-b border-gray-100">
                    <div className="text-center">
                      <p className="text-5xl font-extrabold text-gray-900">{avgRatingStr}</p>
                      <div className="flex justify-center gap-0.5 my-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRatingStr)) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />)}
                      </div>
                      <p className="text-xs text-gray-400">{reviewCount} {t('reviews_section.reviews_label')}</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {reviewDistribution.map(([label, pct]) => (
                        <div key={label as string} className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 w-20">{label}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-gray-400 w-6">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {reviews.length > 0 ? reviews.map(review => (
                      <div key={review.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                          <UserAvatar user={{ name: review.customer_name, avatar: review.customer_avatar }} className="w-9 h-9 border-2 border-primary-100" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{review.customer_name || 'Customer'}</p>
                            <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />)}</div>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{review.comment || t('reviews_section.no_comment')}</p>
                        {review.agent_reply && (
                          <div className="mt-3">
                            <button onClick={() => toggleReply(review.id)} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                              {expandedReplies[review.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              {expandedReplies[review.id] ? t('product.close_reply') : t('product.view_reply')}
                            </button>
                            {expandedReplies[review.id] && (
                              <div className="mt-2 bg-primary-50 rounded-xl p-3 border border-primary-100 relative">
                                <div className="absolute -top-1.5 left-4 w-3 h-3 bg-primary-50 border-t border-l border-primary-100 transform rotate-45" />
                                <div className="flex items-center gap-2 mb-1.5 relative z-10">
                                  <div className="w-4 h-4 bg-primary-100 rounded-full flex items-center justify-center shrink-0"><BadgeCheck className="w-2.5 h-2.5 text-primary-600" /></div>
                                  <span className="text-xs font-bold text-primary-900">{t('product.agent_response')}</span>
                                </div>
                                <p className="text-xs text-primary-800 leading-relaxed relative z-10">{review.agent_reply}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )) : <p className="text-sm text-gray-500 col-span-full">{t('product.no_reviews')}</p>}
                  </div>
                </div>
              </div>

              {/* RIGHT — Booking Panel */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl">
                    {/* Price */}
                    <div className="mb-5 pb-4 border-b border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('explore.from')}</p>
                      <p className="text-3xl font-extrabold text-gray-900">
                        {product.currency} {Number(product.price).toLocaleString('id-ID')}
                        <span className="text-sm font-medium text-gray-400 ml-1">/{isTourProduct ? 'person' : 'night'}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded"><Star className="w-3 h-3 inline mr-0.5" />{avgRatingStr}</span>
                        <span className="text-xs text-gray-500">{reviewCount} {t('reviews_section.reviews_label')}</span>
                      </div>
                    </div>

                    <ProductVoucherBanner vouchers={productVouchers} />

                    {/* TOUR Booking Fields */}
                    {isTourProduct ? (
                      <>
                        {/* Group Tier Selector */}
                        {tourDetails?.tripType === 'Group Trip' && getGroupTiers().length > 0 && (
                          <div className="mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                              {t('tour.select_group_size')} <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              {getGroupTiers().map((tier: any, idx: number) => {
                                const tierPrice = Math.round(Number(product.price) * (1 - tier.discountPct / 100));
                                const isSelected = selectedTierIdx === idx;
                                return (
                                  <button key={idx} type="button" onClick={() => { setSelectedTierIdx(idx); setTourPax(tier.minPax); }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                    <div className="text-left">
                                      <p className={`text-sm font-bold ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>{tier.label}</p>
                                      <p className="text-xs text-gray-400 mt-0.5">{tier.minPax}–{tier.maxPax === 99 ? '∞' : tier.maxPax} {t('tour.participants_label')}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                      <p className={`text-sm font-extrabold ${isSelected ? 'text-primary-600' : 'text-gray-900'}`}>{product.currency} {tierPrice.toLocaleString('id-ID')}</p>
                                      <p className="text-[10px] text-gray-400">{t('tour.per_person')}</p>
                                      {tier.discountPct > 0 && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">-{tier.discountPct}%</span>}
                                    </div>
                                    {isSelected && <div className="ml-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white" /></div>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Tour Date */}
                        <div className="mb-4">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            {t('product.select_date')} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                            <DatePicker
                              selected={parseDateStr(tourDate)}
                              onChange={(date: Date | null) => { setTourDate(toDateStr(date)); setFieldErrors(p => ({ ...p, tourDate: '' })); }}
                              minDate={new Date()} excludeDates={excludedDates} dateFormat="yyyy-MM-dd"
                              placeholderText={t('product.select_date')} wrapperClassName="w-full"
                              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 ${fieldErrors.tourDate ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'}`}
                            />
                          </div>
                          <FieldError name="tourDate" />
                        </div>

                        {/* Participants */}
                        <div className="mb-4">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            {t('product.participants')} <span className="text-red-500">*</span>
                          </label>
                          <div className={`flex items-center gap-3 border rounded-xl p-2 bg-gray-50 mb-2 ${fieldErrors.tourPax ? 'border-red-400' : 'border-gray-200'}`}>
                            <span className="text-xs text-gray-500 w-16 shrink-0">🧑 {t('tour.adult')}</span>
                            <button onClick={() => {
                              const _tt = (product?.details as any)?.tripType || 'Open Trip';
                              const tier = getGroupTiers()[selectedTierIdx];
                              const _min = tier ? tier.minPax : (_tt === 'Private Trip' ? 1 : _tt === 'Group Trip' ? 6 : 2);
                              setTourPax(p => Math.max(_min, p - 1));
                            }} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="flex-1 text-center font-extrabold text-gray-900">{tourPax}</span>
                            <button onClick={() => {
                              const tier = getGroupTiers()[selectedTierIdx];
                              if (tier && tier.maxPax !== 99 && tourPax >= tier.maxPax) return;
                              setTourPax(p => p + 1);
                            }} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <FieldError name="tourPax" />

                          {/* Child Pricing */}
                          {getChildPricing()?.enabled && (
                            <div className="space-y-2 mt-2">
                              {[
                                { key: 'infant', label: `🍼 ${t('tour.infant')}`, desc: t('tour.infant_age'), pax: infantPax, setter: setInfantPax, priceType: 'infant' as const },
                                { key: 'child',  label: `👦 ${t('tour.child')}`,  desc: t('tour.child_age'),  pax: childPax,  setter: setChildPax,  priceType: 'child' as const },
                                { key: 'teen',   label: `🧑 ${t('tour.teen')}`,   desc: t('tour.teen_age'),   pax: teenPax,   setter: setTeenPax,   priceType: 'teen' as const },
                              ].map(cat => {
                                const price = getChildPrice(Number(product.price), cat.priceType);
                                const discountPct = getChildPricing()?.[cat.priceType] ?? 0;
                                return (
                                  <div key={cat.key} className="flex items-center gap-3 border border-amber-100 rounded-xl p-2 bg-amber-50">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs font-bold text-gray-700">{cat.label}</span>
                                      <span className="text-[10px] text-gray-400 ml-1">{cat.desc}</span>
                                      <div className="text-[10px] text-amber-600 font-semibold">
                                        {discountPct === 100 ? t('tour.free') : `${product.currency} ${price.toLocaleString('id-ID')}${t('tour.per_person')}`}
                                      </div>
                                    </div>
                                    <button onClick={() => cat.setter(p => Math.max(0, p - 1))} className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex items-center justify-center hover:border-amber-400 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                                    <span className="w-6 text-center font-extrabold text-gray-900 text-sm">{cat.pax}</span>
                                    <button onClick={() => cat.setter(p => p + 1)} className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex items-center justify-center hover:border-amber-400 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // STAY Booking Fields
                      <>
                        <div className="mb-4">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            {t('product.stay_dates')} <span className="text-red-500">*</span>
                          </label>
                          <div className={`grid grid-cols-2 gap-1 border rounded-xl overflow-hidden ${fieldErrors.checkIn || fieldErrors.checkOut ? 'border-red-400' : 'border-gray-200'}`}>
                            <div className="p-3 bg-gray-50 border-r border-gray-200">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{t('stay.check_in_label')}</label>
                              <DatePicker selected={parseDateStr(checkInDate)} onChange={(date: Date | null) => { const str = toDateStr(date); setCheckInDate(str); if (checkOutDate && str >= checkOutDate) setCheckOutDate(''); setFieldErrors(p => ({ ...p, checkIn: '', checkOut: '' })); }} minDate={new Date()} excludeDates={excludedDates} dateFormat="yyyy-MM-dd" placeholderText={t('stay.check_in_label')} wrapperClassName="w-full" className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none" />
                            </div>
                            <div className="p-3 bg-gray-50">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{t('stay.check_out_label')}</label>
                              <DatePicker selected={parseDateStr(checkOutDate)} onChange={(date: Date | null) => { setCheckOutDate(toDateStr(date)); setFieldErrors(p => ({ ...p, checkOut: '' })); }} minDate={parseDateStr(checkInDate) || new Date()} excludeDates={excludedDates} dateFormat="yyyy-MM-dd" placeholderText={t('stay.check_out_label')} wrapperClassName="w-full" className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none" />
                            </div>
                          </div>
                          {checkInDate && checkOutDate && nights > 0 && (
                            <p className="text-xs text-primary-600 font-semibold mt-1.5 pl-1">{nights} {t('tour.nights')}</p>
                          )}
                          <FieldError name="checkIn" />
                          <FieldError name="checkOut" />
                        </div>
                        <div className="mb-5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            {t('common.guests')} <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-2 bg-gray-50">
                            <button onClick={() => setStayGuests(g => Math.max(1, g - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="flex-1 text-center font-extrabold text-gray-900">{stayGuests} {t('stay.guests_count')}</span>
                            <button onClick={() => setStayGuests(g => g + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Price Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                      {isTourProduct ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{tourPax} {t('price_summary.adult_pax')} × {product.currency} {getTierPrice(Number(product.price)).toLocaleString('id-ID')}</span>
                            <span className="font-semibold">{product.currency} {(getTierPrice(Number(product.price)) * tourPax).toLocaleString('id-ID')}</span>
                          </div>
                          {getChildPricing()?.enabled && infantPax > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{infantPax} {t('tour.infant')} × {getChildPricing().infant === 100 ? t('tour.free') : `${product.currency} ${getChildPrice(Number(product.price),'infant').toLocaleString('id-ID')}`}</span>
                              <span className="font-semibold">{product.currency} {(getChildPrice(Number(product.price),'infant') * infantPax).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          {getChildPricing()?.enabled && childPax > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{childPax} {t('tour.child')} × {product.currency} {getChildPrice(Number(product.price),'child').toLocaleString('id-ID')}</span>
                              <span className="font-semibold">{product.currency} {(getChildPrice(Number(product.price),'child') * childPax).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          {getChildPricing()?.enabled && teenPax > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{teenPax} {t('tour.teen')} × {product.currency} {getChildPrice(Number(product.price),'teen').toLocaleString('id-ID')}</span>
                              <span className="font-semibold">{product.currency} {(getChildPrice(Number(product.price),'teen') * teenPax).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{nights > 0 ? `${nights} ${t('tour.nights')}` : `— ${t('tour.nights')}`} × {stayGuests} {t('stay.guests_count')} × {product.currency} {Number(product.price).toLocaleString('id-ID')}</span>
                          <span className="font-semibold">{nights > 0 ? `${product.currency} ${(Number(product.price) * nights * stayGuests).toLocaleString('id-ID')}` : '—'}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-gray-900">
                        <span>{t('checkout.total')}</span>
                        <span className="text-primary-600">
                          {isTourProduct
                            ? `${product.currency} ${calcTourTotal(Number(product.price)).toLocaleString('id-ID')}`
                            : nights > 0 ? `${product.currency} ${tourStayTotal.toLocaleString('id-ID')}` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <button onClick={handleAddToCart} disabled={isInCart(product.id)}
                      className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98] shadow-lg ${isInCart(product.id) ? 'bg-green-50 border-2 border-green-400 text-green-700 cursor-default' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30'}`}>
                      {isInCart(product.id)
                        ? <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> {t('product.added_to_cart')}</span>
                        : <span className="flex items-center justify-center gap-2"><ShoppingCart className="w-4 h-4" /> {t('product.reserve_now')}</span>}
                    </button>
                    <button onClick={() => handleReserveNow('tour_stay')} className="w-full py-4 rounded-2xl font-extrabold text-sm border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-all active:scale-[0.98] mt-3">
                      {t('product.reserve_now')}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500" /> {t('badge.safe')}</span>
                      <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-blue-500" /> {t('badge.verified')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {t('badge.support_24')}</span>
                    </div>
                  </div>

                  {/* Contact CS */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-primary-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">{t('product.need_help')}</p>
                      <p className="text-sm font-bold text-gray-800">{t('product.contact_cs')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Modal */}
        {isGalleryOpen && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsGalleryOpen(false)}>
            <button onClick={() => setIsGalleryOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-black/50 hover:bg-black/80 rounded-full transition-all"><X className="w-6 h-6" /></button>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/90 font-medium text-sm bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">{currentImageIndex + 1} / {allImages.length}</div>
            {allImages.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(p => (p === 0 ? allImages.length - 1 : p - 1)); }} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all"><ChevronLeft className="w-6 h-6" /></button>
            )}
            <div className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center -mt-10" onClick={(e) => e.stopPropagation()}>
              <img src={allImages[currentImageIndex]} className="max-h-[75vh] max-w-full object-contain shadow-2xl rounded-lg" alt={`Gallery ${currentImageIndex + 1}`} />
            </div>
            {allImages.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(p => (p === allImages.length - 1 ? 0 : p + 1)); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all"><ChevronRight className="w-6 h-6" /></button>
            )}
            <div className="absolute bottom-6 w-full px-8 flex justify-center gap-2 overflow-x-auto pb-4" onClick={(e) => e.stopPropagation()}>
              {allImages.map((img, idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }} className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-primary-500 opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </>
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
  const basePrice = Number(product.price);
  const driverPrice = addOns.withDriver ? DRIVER_PRICE_PER_12H : 0;
  const insurancePrice = addOns.premiumInsurance ? 75_000 : 0;
  const childSeatPrice = addOns.childSeat ? 50_000 : 0;
  const totalPerDay = basePrice + driverPrice + insurancePrice + childSeatPrice;
  const totalCarPrice = totalPerDay * rentalDays + effectivePickupFee + effectiveDropoffFee;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <SEO
        title={(product as any).seo_title || `${product.name} Rental | Trivgoo`}
        description={(product as any).seo_description || `Rent ${product.name} starting from ${product.currency} ${Number(product.price).toLocaleString('id-ID')}/day on Trivgoo.`}
        image={(product as any).seo_og_image || product.image_url || product.image || FALLBACK_IMAGE}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 pt-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-primary-600 transition-colors font-medium">
            <ChevronLeft className="w-4 h-4" /> {t('common.back')}
          </button>
          <span>/</span>
          <Link to={langPath('/explore?category_id=3')} className="hover:text-primary-600 transition-colors">Car Rental</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Car Title + Meta */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                <Car className="w-3.5 h-3.5" /> {t('car.booking_details')}
              </div>
              {productVouchers.filter((v: any) => v.is_active).length > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold px-3 py-1 rounded-full">
                  <Tag className="w-3.5 h-3.5" />{productVouchers.filter((v: any) => v.is_active).length} Promo
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-gray-800 text-sm">{avgRatingStr}</span>
                <span className="text-gray-400 text-sm">({reviewCount} {t('reviews_section.reviews_label')})</span>
              </div>
              <span className="text-gray-300">·</span>
              <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary-500" />{formatLocation(product.location || '')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button onClick={() => toggleWishlist(product)} className={`shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${isSaved ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}>
                <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
              </button>
            )}
            <ShareButtons productName={product.name} productImage={getImageUrl(product.image_url || product.image)} productUrl={shareUrl} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Image */}
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100">
              <img src={getImageUrl(product.image_url || product.image)} alt={product.name} className="w-full h-auto object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
            </div>

            {/* Car Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary-600" />{t('product.car_details')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Users,    label: t('product.passengers'),  value: `${carDetails?.seats || 4} ${t('common.guests')}` },
                  { icon: Gauge,    label: t('product.transmission'), value: carDetails?.transmission === 'Automatic' ? 'Automatic' : 'Manual' },
                  { icon: Fuel,     label: t('product.fuel'),         value: carDetails?.fuelPolicy || 'Gas' },
                  { icon: Briefcase,label: t('product.luggage'),      value: `${carDetails?.luggage || 2} Bags` },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4 text-center">
                    <item.icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className="font-bold text-gray-900 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />{t('product.facility_include')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Navigation,  label: t('facilities.free_pickup') },
                  { icon: Shield,      label: t('facilities.basic_insurance') },
                  { icon: Headphones,  label: t('facilities.support_24') },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-green-50 rounded-2xl px-4 py-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <button onClick={() => setTermsOpen(!termsOpen)} className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Info className="w-5 h-5 text-primary-600" />{t('product.terms')}</h2>
                {termsOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {termsOpen && (
                <div className="px-6 pb-6 space-y-2 border-t border-gray-100">
                  {[t('terms_items.self_drive'), t('terms_items.cancellation'), t('terms_items.checklist')].map((term, i) => (
                    <div key={i} className="flex items-start gap-2 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                      <span className="text-sm text-gray-700 font-medium">{term}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pickup Location */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinned className="w-5 h-5 text-primary-600" />{t('product.pickup_location')}
              </h2>
              <div className="flex gap-3 mb-4">
                {[{ value: 'kantor', label: t('product.rental_office') }, { value: 'lokasi_lain', label: t('product.other_location') }].map(opt => (
                  <button key={opt.value} onClick={() => setPickupType(opt.value as any)} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${pickupType === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {pickupType === opt.value && <Check className="w-3.5 h-3.5 inline mr-1" />}{opt.label}
                  </button>
                ))}
              </div>
              {pickupType === 'lokasi_lain' ? (
                <div>
                  <LocationAutocomplete
                    placeholder={t('product.pickup_location') + '…'}
                    value={pickupAddress}
                    onChange={(val) => { setPickupAddress(val); setFieldErrors(p => ({ ...p, pickupAddress: '' })); }}
                    error={!!fieldErrors.pickupAddress}
                  />
                  <FieldError name="pickupAddress" />
                  <DeliveryFeeBadge info={pickupDelivery} type="pickup" />
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{formatLocation(product.location || t('product.rental_office'))}</span>
                </div>
              )}
            </div>

            {/* Dropoff Location */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary-600" />{t('product.dropoff_location')}
              </h2>
              <div className="flex gap-3 mb-4">
                {[{ value: 'kantor', label: t('product.rental_office') }, { value: 'lokasi_lain', label: t('product.other_location') }].map(opt => (
                  <button key={opt.value} onClick={() => setDropoffType(opt.value as any)} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${dropoffType === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {dropoffType === opt.value && <Check className="w-3.5 h-3.5 inline mr-1" />}{opt.label}
                  </button>
                ))}
              </div>
              {dropoffType === 'lokasi_lain' ? (
                <div>
                  <LocationAutocomplete
                    placeholder={t('product.dropoff_location') + '…'}
                    value={dropoffAddress}
                    onChange={(val) => { setDropoffAddress(val); setFieldErrors(p => ({ ...p, dropoffAddress: '' })); }}
                    error={!!fieldErrors.dropoffAddress}
                  />
                  <FieldError name="dropoffAddress" />
                  <DeliveryFeeBadge info={dropoffDelivery} type="dropoff" />
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{formatLocation(product.location || t('product.rental_office'))}</span>
                </div>
              )}
            </div>

            {/* Availability Calendar */}
            <AvailabilityCalendar blockedDates={product.blocked_dates as unknown as string[] || []} />

            {/* Reviews */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />{t('product.reviews')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <UserAvatar user={{ name: review.customer_name, avatar: review.customer_avatar }} className="w-10 h-10 border-2 border-primary-100" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{review.customer_name || 'Customer'}</p>
                        <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />)}</div>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.comment || t('reviews_section.no_comment')}</p>
                    {review.agent_reply && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <button onClick={() => toggleReply(review.id)} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                          {expandedReplies[review.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {expandedReplies[review.id] ? t('product.close_reply') : t('product.view_reply')}
                        </button>
                        {expandedReplies[review.id] && (
                          <div className="mt-2 bg-primary-50 rounded-xl p-3 border border-primary-100 relative">
                            <div className="absolute -top-1.5 left-4 w-3 h-3 bg-primary-50 border-t border-l border-primary-100 transform rotate-45" />
                            <div className="flex items-center gap-2 mb-1.5 relative z-10">
                              <div className="w-4 h-4 bg-primary-100 rounded-full flex items-center justify-center shrink-0"><BadgeCheck className="w-2.5 h-2.5 text-primary-600" /></div>
                              <span className="text-xs font-bold text-primary-900">{t('product.agent_response')}</span>
                            </div>
                            <p className="text-xs text-primary-800 leading-relaxed relative z-10">{review.agent_reply}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )) : <p className="text-sm text-gray-500 col-span-full">{t('product.no_reviews')}</p>}
              </div>
            </div>
          </div>

          {/* RIGHT — Car Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                {/* Price */}
                <div className="mb-5 pb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('car.rental_id')}: {String(product.id).padStart(6, '0')}</p>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {product.currency} {Number(product.price).toLocaleString('id-ID')}
                    <span className="text-sm font-medium text-gray-400 ml-1">{t('car.per_day')}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-gray-700">{avgRatingStr}</span>
                    <span className="text-xs text-gray-400">({reviewCount} {t('reviews_section.reviews_label')})</span>
                  </div>
                </div>

                <ProductVoucherBanner vouchers={productVouchers} />

                {/* Pickup Date/Time */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    {t('product.pickup_time')} <span className="text-red-500">*</span>
                  </label>
                  <div className={`grid grid-cols-2 gap-1 border rounded-xl overflow-hidden ${fieldErrors.carPickupDate ? 'border-red-400' : 'border-gray-200'}`}>
                    <div className="p-3 bg-gray-50 border-r border-gray-200">
                      <DatePicker selected={parseDateStr(carPickupDate)} onChange={(date: Date | null) => { setCarPickupDate(toDateStr(date)); setFieldErrors(p => ({ ...p, carPickupDate: '' })); }} minDate={new Date()} excludeDates={excludedDates} dateFormat="yyyy-MM-dd" placeholderText={t('product.select_date')} wrapperClassName="w-full" className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none" />
                    </div>
                    <div className="p-3 bg-gray-50">
                      <input type="time" value={carPickupTime} onChange={(e) => setCarPickupTime(e.target.value)} className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none" />
                    </div>
                  </div>
                  <FieldError name="carPickupDate" />
                </div>

                {/* Return Date/Time */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    {t('product.return_time')} <span className="text-red-500">*</span>
                  </label>
                  <div className={`grid grid-cols-2 gap-1 border rounded-xl overflow-hidden ${fieldErrors.carDropoffDate ? 'border-red-400' : 'border-gray-200'}`}>
                    <div className="p-3 bg-gray-50 border-r border-gray-200">
                      <DatePicker selected={parseDateStr(carDropoffDate)} onChange={(date: Date | null) => { setCarDropoffDate(toDateStr(date)); setFieldErrors(p => ({ ...p, carDropoffDate: '' })); }} minDate={parseDateStr(carPickupDate) || new Date()} excludeDates={excludedDates} dateFormat="yyyy-MM-dd" placeholderText={t('product.select_date')} wrapperClassName="w-full" className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none" />
                    </div>
                    <div className="p-3 bg-gray-50">
                      <input type="time" value={carDropoffTime} onChange={(e) => setCarDropoffTime(e.target.value)} className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none" />
                    </div>
                  </div>
                  {rentalDays > 0 && (
                    <p className={`text-xs font-semibold mt-1.5 pl-1 ${rentalDays < 2 ? 'text-red-500' : 'text-primary-600'}`}>
                      {t('product.duration_label')}: {rentalDays} {t('common.days')}
                      {rentalDays < 2 && ` — ${t('car.min_rental_days')}`}
                    </p>
                  )}
                  <FieldError name="carDropoffDate" />
                </div>

                {/* Add-Ons */}
                <div className="mb-5">
                  <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-primary-500" />{t('product.add_ons')}
                  </p>
                  <div className="space-y-2">
                    {[
                      ...(carDetails?.driver ? [{
                        key: 'withDriver',
                        label: t('product.with_driver'),
                        desc: `${formatRp(DRIVER_PRICE_PER_12H)} / 12 jam`,
                        price: DRIVER_PRICE_PER_12H,
                        icon: UserCog,
                        warning: t('car.driver_warning'),
                      }] : []),
                      { key: 'premiumInsurance', label: t('product.premium_insurance'), desc: t('product.full_protection'), price: 75_000, icon: Shield },
                      { key: 'childSeat',        label: t('product.child_seat'),        desc: t('product.child_seat_desc'),  price: 50_000, icon: Users },
                    ].map((addon) => {
                      const isChecked = addOns[addon.key as keyof typeof addOns];
                      const AddonIcon = addon.icon;
                      return (
                        <button key={addon.key}
                          onClick={() => setAddOns(prev => ({ ...prev, [addon.key]: !prev[addon.key as keyof typeof addOns] }))}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${isChecked ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                          <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-all ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                            {isChecked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <AddonIcon className={`mt-0.5 w-4 h-4 shrink-0 ${isChecked ? 'text-green-600' : 'text-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${isChecked ? 'text-green-700' : 'text-gray-800'}`}>{addon.label}</p>
                            <p className="text-[11px] text-gray-400 leading-relaxed">{addon.desc}</p>
                            {'warning' in addon && (addon as any).warning && (
                              <p className="text-[10px] text-amber-500 font-semibold mt-1">{(addon as any).warning}</p>
                            )}
                          </div>
                          <p className="text-xs font-bold text-gray-500 shrink-0">+{product.currency} {addon.price.toLocaleString('id-ID')}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('price_summary.rental_label')} {rentalDays} {t('common.days')} × {product.currency} {basePrice.toLocaleString('id-ID')}</span>
                    <span className="font-semibold">{product.currency} {(basePrice * rentalDays).toLocaleString('id-ID')}</span>
                  </div>
                  {addOns.withDriver && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{t('price_summary.driver_label')} × {rentalDays} {t('common.days')}</span>
                      <span className="font-semibold">+{product.currency} {(DRIVER_PRICE_PER_12H * rentalDays).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {addOns.premiumInsurance && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{t('price_summary.insurance_label')} × {rentalDays} {t('common.days')}</span>
                      <span className="font-semibold">+{product.currency} {(75_000 * rentalDays).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {addOns.childSeat && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{t('price_summary.child_seat_label')} × {rentalDays} {t('common.days')}</span>
                      <span className="font-semibold">+{product.currency} {(50_000 * rentalDays).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {pickupType === 'lokasi_lain' && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-primary-400 shrink-0" />{t('product.pickup_fee')}
                        {pickupDelivery.loading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                      </span>
                      <span className={`font-semibold ${needsManualPickup ? 'text-amber-500' : effectivePickupFee === 0 ? 'text-green-600' : ''}`}>
                        {pickupDelivery.loading ? '…' : needsManualPickup ? t('delivery.manual_confirm') : effectivePickupFee === 0 ? t('delivery.free') : `+${product.currency} ${effectivePickupFee.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  )}
                  {dropoffType === 'lokasi_lain' && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPinned className="w-3 h-3 text-primary-400 shrink-0" />{t('product.dropoff_fee')}
                        {dropoffDelivery.loading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                      </span>
                      <span className={`font-semibold ${needsManualDropoff ? 'text-amber-500' : effectiveDropoffFee === 0 ? 'text-green-600' : ''}`}>
                        {dropoffDelivery.loading ? '…' : needsManualDropoff ? t('delivery.manual_confirm') : effectiveDropoffFee === 0 ? t('delivery.free') : `+${product.currency} ${effectiveDropoffFee.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-gray-900">
                    <span>{t('checkout.total')}</span>
                    <span className="text-primary-600">
                      {(needsManualPickup || needsManualDropoff)
                        ? <span className="text-amber-500 text-sm">{t('car.plus_agent_fee')}</span>
                        : `${product.currency} ${totalCarPrice.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  {(needsManualPickup || needsManualDropoff) && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{t('delivery.outside_range_note')}
                    </p>
                  )}
                </div>

                {/* CTA Buttons */}
                <button onClick={handleAddToCart} disabled={isInCart(product.id)}
                  className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98] shadow-lg ${isInCart(product.id) ? 'bg-green-50 border-2 border-green-400 text-green-700 cursor-default' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30 hover:shadow-primary-700/40'}`}>
                  {isInCart(product.id)
                    ? <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> {t('product.added_to_cart')}</span>
                    : <span className="flex items-center justify-center gap-2"><ShoppingCart className="w-4 h-4" /> {t('car.proceed_booking')}</span>}
                </button>
                <button onClick={() => handleReserveNow('car')} className="w-full py-4 rounded-2xl font-extrabold text-sm border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-all active:scale-[0.98] mt-3">
                  {t('product.reserve_now')}
                </button>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500" /> {t('badge.safe')}</span>
                  <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-blue-500" /> {t('badge.verified')}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {t('car.support_24')}</span>
                </div>
              </div>

              {/* Contact CS */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-primary-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">{t('product.need_help')}</p>
                  <p className="text-sm font-bold text-gray-800">{t('product.contact_cs')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

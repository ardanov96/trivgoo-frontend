import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Calendar, Package, Clock, CreditCard, AlertTriangle, Shield,
  CheckCircle2, Ticket, MapPin, User, Phone, Mail, FileText, Car, ShieldCheck,
  Baby, CircleDot,
} from 'lucide-react';
import { useAuth } from '../../AuthContext';
import http from '../../services/http';
import { useLangNavigate } from '../../src/hooks/useLangNavigate';
import { getImageUrl, FALLBACK_IMAGE } from '../../utils/imageUtils';

/* ─── Constants (must match pricing_service.js) ─── */
const DRIVER_PRICE_PER_12H = 150_000;
const PREMIUM_INSURANCE    = 75_000;
const CHILD_SEAT           = 50_000;

interface BookingDetailData {
  id: number;
  externalId: string;
  productId: number;
  productName: string;
  userName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  startTime: string;
  endTime: string;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  withDriver: number;
  vehicleType: string | null;
  duration: number;
  pickupFee: number;
  dropoffFee: number;
  adminFee: number;
  addOnsJson: string | null;
  specialRequest: string | null;
  status: string;
  paymentUrl: string;
  paymentStatus: string;
  paymentGateway: string;
  paymentMethod: string;
  paymentChannel: string;
  paymentExpiredAt: string;
  createdAt: string;
  paidAt: string;
  productImage: string;
  productLocation: string;
  productBasePrice?: number;
  agentName: string;
  agentEmail: string;
  customerEmail: string;
  customerPhone: string;
  reviewId: number | null;
  rescheduleCount?: number;
}

/* ─── Helpers ─── */
const getStatusColor = (status: string) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
    case 'paid':      return 'bg-green-100 text-green-700 border-green-200';
    case 'pending':   return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
    case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'expired':   return 'bg-red-50 text-red-600 border-red-100';
    default:          return 'bg-gray-100 text-gray-600';
  }
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function parseAddOns(raw: string | null): { withDriver: boolean; premiumInsurance: boolean; childSeat: boolean } {
  const fallback = { withDriver: false, premiumInsurance: false, childSeat: false };
  if (!raw) return fallback;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

/* ─── Countdown Hook ─── */
const useCountdown = (expiredAt?: string) => {
  const calc = useCallback(() => {
    if (!expiredAt) return null;
    const diff = new Date(expiredAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, diff };
  }, [expiredAt]);

  const [remaining, setRemaining] = useState(calc);
  useEffect(() => {
    if (!expiredAt) return;
    const timer = setInterval(() => { const r = calc(); setRemaining(r); if (!r) clearInterval(timer); }, 1000);
    return () => clearInterval(timer);
  }, [expiredAt, calc]);
  return remaining;
};

/* ─── Small UI blocks ─── */
const InfoRow: React.FC<{ label: string; value: React.ReactNode; bold?: boolean }> = ({ label, value, bold }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'font-medium text-gray-800'} text-right`}>{value}</span>
  </div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
    {icon} {title}
  </h3>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const CustomerBookingDetail: React.FC = () => {
  const { id }              = useParams<{ id: string }>();
  const navigate            = useNavigate();
  const { langNavigate }    = useLangNavigate();
  const { t }               = useTranslation();
  const { user }            = useAuth();

  const [booking, setBooking]   = useState<BookingDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDetail = async () => {
    try {
      setIsLoading(true);
      const res = await http.get(`/bookings/my/${id}`);
      setBooking(res.data.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t('booking_detail.load_error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) loadDetail();
  }, [user, id]);

  const remaining = useCountdown(
    booking?.status === 'PENDING' && booking?.paymentStatus !== 'PAID' ? booking.paymentExpiredAt : undefined
  );
  const isExpired = booking?.status === 'PENDING' && booking?.paymentStatus !== 'PAID'
    && booking?.paymentExpiredAt && new Date(booking.paymentExpiredAt).getTime() <= Date.now();

  const handlePayNow = () => {
    if (!booking) return;
    if (booking.paymentUrl) window.location.href = booking.paymentUrl;
    else alert(t('bookings_page.pay_no_link'));
  };

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ─── Error ─── */
  if (errorMsg || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 px-4 flex flex-col items-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold font-serif text-gray-900 mb-2">{t('booking_detail.error_title')}</h1>
        <p className="text-gray-500 mb-8 max-w-sm text-center">{errorMsg || t('booking_detail.not_found')}</p>
        <button
          onClick={() => langNavigate('/my-bookings')}
          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          {t('booking_detail.back_to_bookings')}
        </button>
      </div>
    );
  }

  /* ─── Derived data ─── */
  const displayStatus = isExpired ? 'EXPIRED' : (booking.paymentStatus === 'PAID' ? 'PAID' : booking.status);
  const addOns        = parseAddOns(booking.addOnsJson);
  const basePrice     = booking.productBasePrice ? Number(booking.productBasePrice) : 0;

  const computedDuration = (() => {
    if (booking.duration && booking.duration > 1) return booking.duration;
    if (booking.startTime && booking.endTime) {
      const s = new Date(booking.startTime);
      const e = new Date(booking.endTime);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        const days = Math.ceil((e.getTime() - s.getTime()) / 86400000);
        if (days > 0) return days;
      }
    }
    return 1;
  })();
  const dur = computedDuration;

  const isCar = (booking.vehicleType || '').toLowerCase() === 'car'
    || (basePrice > 0 && dur > 1 && booking.quantity === 1);

  const rentalCost    = isCar ? basePrice * dur : basePrice * booking.quantity * (isCar ? dur : 1);
  const driverCost    = addOns.withDriver       ? DRIVER_PRICE_PER_12H * dur : 0;
  const insuranceCost = addOns.premiumInsurance  ? PREMIUM_INSURANCE          : 0;
  const childSeatCost = addOns.childSeat         ? CHILD_SEAT                 : 0;
  const pickupFee     = Number(booking.pickupFee)  || 0;
  const dropoffFee    = Number(booking.dropoffFee) || 0;
  const adminFee      = Number(booking.adminFee)   || 0;

  const knownCosts         = rentalCost + driverCost + insuranceCost + childSeatCost + pickupFee + dropoffFee + adminFee;
  const hasFullItemizedData = booking.addOnsJson !== null || pickupFee > 0 || dropoffFee > 0 || adminFee > 0;
  const remainingFees       = booking.totalPrice - knownCosts;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      {/* ── TOP NAV BAR ── */}
      <div className="bg-primary-900 sticky top-0 md:top-[72px] z-30 shadow-md border-b border-primary-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center text-white">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-primary-800 transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold leading-tight">{t('booking_detail.page_title')}</h1>
            <p className="text-[11px] text-primary-300 font-mono">{booking.externalId || `#${booking.id}`}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-5 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ═══════ LEFT COLUMN ═══════ */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">

            {/* ── 1. PRODUCT INFO ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <SectionTitle icon={<Package className="w-4 h-4 text-primary-500" />} title={t('booking_detail.section_product')} />
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={getImageUrl(booking.productImage)}
                  alt={booking.productName}
                  className="w-full sm:w-28 h-28 rounded-xl object-cover border border-gray-100 shadow-sm"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="flex-1 min-w-0">
                  {isCar && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold mb-1.5 uppercase">
                      <Car className="w-3 h-3" /> {t('booking_detail.car_rental_badge')}
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-gray-900 mb-3 leading-snug">{booking.productName}</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-3.5 h-3.5" /></div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{t('booking_detail.label_date')}</p>
                        <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><Clock className="w-3.5 h-3.5" /></div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{t('booking_detail.label_time_duration')}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDateTime(booking.startTime).split(', ')[1] || '-'} — {formatDateTime(booking.endTime).split(', ')[1] || '-'}
                          {dur > 1 && (
                            <span className="text-primary-600 ml-1.5 font-bold">
                              ({dur} {t('booking_detail.days_unit')})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {booking.productLocation && (
                      <div className="flex items-center gap-2.5 sm:col-span-2">
                        <div className="p-1.5 bg-red-50 text-red-500 rounded-lg"><MapPin className="w-3.5 h-3.5" /></div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{t('booking_detail.label_location')}</p>
                          <p className="text-sm font-medium text-gray-900">{booking.productLocation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. PICKUP & DROP-OFF ── */}
            {(isCar || booking.pickupLocation || booking.dropoffLocation) && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <SectionTitle icon={<MapPin className="w-4 h-4 text-red-500" />} title={t('booking_detail.section_pickup')} />
                <div className="relative pl-6">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />

                  {/* Pickup */}
                  <div className="relative mb-6">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CircleDot className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{t('booking_detail.pickup_label')}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {booking.pickupLocation
                        || <span className="text-gray-400 italic">{t('booking_detail.location_not_recorded')}</span>
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(booking.startTime)}</p>
                  </div>

                  {/* Drop-off */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <CircleDot className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{t('booking_detail.dropoff_label')}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {booking.dropoffLocation || booking.pickupLocation
                        || <span className="text-gray-400 italic">{t('booking_detail.location_not_recorded')}</span>
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(booking.endTime)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. BOOKING CONFIGURATION ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <SectionTitle icon={<Ticket className="w-4 h-4 text-primary-500" />} title={t('booking_detail.section_config')} />
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-200">

                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm text-gray-600">{t('booking_detail.config_quantity')}</span>
                  <span className="font-bold text-gray-900">{booking.quantity}</span>
                </div>

                {isCar && (
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-600 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-gray-400" /> {t('booking_detail.config_driver')}
                    </span>
                    <span className={`text-sm font-bold ${addOns.withDriver ? 'text-green-600' : 'text-gray-400'}`}>
                      {addOns.withDriver ? t('booking_detail.with_driver') : t('booking_detail.without_driver')}
                    </span>
                  </div>
                )}

                {isCar && (
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-600 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-gray-400" /> {t('booking_detail.config_insurance')}
                    </span>
                    <span className={`text-sm font-bold ${addOns.premiumInsurance ? 'text-green-600' : 'text-gray-400'}`}>
                      {addOns.premiumInsurance ? t('booking_detail.addon_active') : t('booking_detail.addon_inactive')}
                    </span>
                  </div>
                )}

                {isCar && (
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-600 flex items-center gap-1.5">
                      <Baby className="w-4 h-4 text-gray-400" /> {t('booking_detail.config_child_seat')}
                    </span>
                    <span className={`text-sm font-bold ${addOns.childSeat ? 'text-green-600' : 'text-gray-400'}`}>
                      {addOns.childSeat ? t('booking_detail.addon_active') : t('booking_detail.addon_inactive')}
                    </span>
                  </div>
                )}

                {booking.specialRequest && (
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-600 mb-1">{t('booking_detail.config_special_request')}</p>
                    <p className="text-sm font-medium text-gray-900 italic">"{booking.specialRequest}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── 4. GUEST INFO ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <SectionTitle icon={<User className="w-4 h-4 text-primary-500" />} title={t('booking_detail.section_guest')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><User className="w-4 h-4 text-primary-600" /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{t('booking_detail.guest_name')}</p>
                    <p className="text-sm font-bold text-gray-900">{booking.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><Phone className="w-4 h-4 text-green-600" /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{t('booking_detail.guest_phone')}</p>
                    <p className="text-sm font-bold text-gray-900">{booking.customerPhone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl sm:col-span-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><Mail className="w-4 h-4 text-blue-600" /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{t('booking_detail.guest_email')}</p>
                    <p className="text-sm font-bold text-gray-900">{booking.customerEmail || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5. PROVIDER ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <SectionTitle icon={<Shield className="w-4 h-4 text-primary-500" />} title={t('booking_detail.section_provider')} />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary-50 rounded-full flex items-center justify-center border border-primary-100">
                  <Shield className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{t('booking_detail.operated_by')}</p>
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    {booking.agentName || 'Trivgoo Official'} <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT COLUMN ═══════ */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">

            {/* ── STATUS CARD ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600" />
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                    {t('booking_detail.status_label')}
                  </p>
                  <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-lg border ${getStatusColor(displayStatus)} uppercase tracking-wider`}>
                    {displayStatus}
                  </span>
                </div>
                {booking.status === 'PENDING' && !isExpired && remaining && (
                  <div className="text-right">
                    <p className="text-[10px] text-amber-600 font-bold mb-1 uppercase">
                      {t('booking_detail.pay_before')}
                    </p>
                    <p className="text-base font-bold font-mono text-gray-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                      {remaining.h > 0 && `${String(remaining.h).padStart(2, '0')}:`}
                      {String(remaining.m).padStart(2, '0')}:{String(remaining.s).padStart(2, '0')}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-gray-100 space-y-0.5">
                <p className="text-xs text-gray-400 font-mono">
                  {t('booking_detail.created_at')}: {new Date(booking.createdAt).toLocaleString('id-ID')}
                </p>
                {booking.paidAt && (
                  <p className="text-xs text-gray-400 font-mono">
                    {t('booking_detail.paid_at')}: {new Date(booking.paidAt).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>

            {/* ── PAYMENT BREAKDOWN ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <SectionTitle icon={<CreditCard className="w-4 h-4 text-primary-500" />} title={t('booking_detail.section_payment')} />

              <div className="divide-y divide-gray-100">
                {basePrice > 0 && (
                  <InfoRow
                    label={
                      isCar
                        ? `${t('booking_detail.price_rental')} (${formatCurrency(basePrice)} × ${dur} ${t('booking_detail.days_unit')})`
                        : `${t('booking_detail.price_base')} (${formatCurrency(basePrice)} × ${booking.quantity})`
                    }
                    value={formatCurrency(rentalCost)}
                  />
                )}
                {driverCost > 0 && (
                  <InfoRow
                    label={`${t('booking_detail.price_driver')} (${formatCurrency(DRIVER_PRICE_PER_12H)} × ${dur} ${t('booking_detail.days_unit')})`}
                    value={formatCurrency(driverCost)}
                  />
                )}
                {insuranceCost > 0 && (
                  <InfoRow label={t('booking_detail.config_insurance')} value={formatCurrency(insuranceCost)} />
                )}
                {childSeatCost > 0 && (
                  <InfoRow label={t('booking_detail.config_child_seat')} value={formatCurrency(childSeatCost)} />
                )}
                {pickupFee > 0 && (
                  <InfoRow label={t('booking_detail.price_pickup_fee')} value={formatCurrency(pickupFee)} />
                )}
                {dropoffFee > 0 && (
                  <InfoRow label={t('booking_detail.price_dropoff_fee')} value={formatCurrency(dropoffFee)} />
                )}
                {adminFee > 0 && (
                  <InfoRow label={t('booking_detail.price_admin_fee')} value={formatCurrency(adminFee)} />
                )}
                {remainingFees > 0 && (
                  <InfoRow label={t('booking_detail.price_delivery_fee')} value={formatCurrency(remainingFees)} />
                )}
              </div>

              {/* Grand Total */}
              <div className="bg-primary-50 rounded-xl p-4 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900 uppercase">{t('booking_detail.total_label')}</span>
                  <span className="text-xl font-bold text-primary-700">{formatCurrency(booking.totalPrice)}</span>
                </div>
                {booking.paymentMethod && (
                  <p className="text-xs text-primary-600 font-medium text-right mt-1.5">
                    {t('booking_detail.via_label')} <strong className="uppercase">{booking.paymentMethod}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:relative lg:bg-transparent lg:border-t-0 lg:shadow-none lg:p-0 z-40">
              <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
                {booking.status === 'PENDING' && !isExpired && booking.paymentStatus !== 'PAID' && (
                  <button
                    onClick={handlePayNow}
                    className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> {t('booking_detail.action_pay_now')}
                  </button>
                )}
                {(booking.paymentStatus === 'PAID' || booking.status === 'COMPLETED') && (
                  <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> {t('booking_detail.action_download_ticket')}
                  </button>
                )}
                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                  <button className="w-full py-2.5 bg-white text-gray-500 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all">
                    {t('booking_detail.action_cancel_booking')}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingDetail;

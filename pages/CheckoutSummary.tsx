import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../components/CartContext';
import http from '../services/http';
import {
  CreditCard, MapPin, Calendar, Users, ChevronRight, ShieldCheck,
  ArrowLeft, User, Mail, Phone, Clock, Briefcase, Award, Fuel, UserCog,
  Tag, X, CheckCircle2, Percent, DollarSign, ChevronDown, ChevronUp,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getImageUrl } from '../utils/imageUtils';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
const ADMIN_FEE = 4000;

function calcDiscount(voucher: any, amount: number): number {
  if (!voucher) return 0;
  let discount = 0;
  if (voucher.type === 'percent') {
    discount = Math.floor((amount * Number(voucher.value)) / 100);
    if (voucher.max_discount != null) discount = Math.min(discount, Number(voucher.max_discount));
  } else {
    discount = Number(voucher.value);
  }
  return Math.min(discount, amount);
}

// ── VoucherPicker — pilih voucher dengan klik ─────────────────────────────────
interface VoucherPickerProps {
  availableVouchers: any[];
  amount: number;
  appliedVoucher: any | null;
  onApply: (voucher: any, discount: number) => void;
  onRemove: () => void;
}

const VoucherPicker: React.FC<VoucherPickerProps> = ({
  availableVouchers,
  amount,
  appliedVoucher,
  onApply,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);

  const now = new Date();
  const activeVouchers = useMemo(() =>
    availableVouchers.filter(v =>
      v.is_active &&
      (!v.expires_at || new Date(v.expires_at) >= now) &&
      (v.max_usage == null || v.used_count < v.max_usage)
    ),
    [availableVouchers]
  );

  // Jika tidak ada voucher sama sekali, jangan render apa-apa
  if (activeVouchers.length === 0 && !appliedVoucher) return null;

  const handleSelect = (v: any) => {
    if (Number(amount) < Number(v.min_transaction)) return;
    const discount = calcDiscount(v, amount);
    onApply(v, discount);
    setOpen(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
    setOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
          <Tag className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">Voucher & Promo</h3>
        {activeVouchers.length > 0 && !appliedVoucher && (
          <span className="ml-auto text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            {activeVouchers.length} tersedia
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Sudah dipilih */}
        {appliedVoucher ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-green-800 text-sm font-mono tracking-widest">
                {appliedVoucher.code}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Hemat {formatRp(calcDiscount(appliedVoucher, amount))}
                {appliedVoucher.type === 'percent' && ` (${appliedVoucher.value}%)`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 rounded-full bg-green-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors shrink-0"
              title="Hapus voucher"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Tombol buka/tutup pilihan voucher */
          <button
            type="button"
            onClick={() => setOpen(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 transition-all text-left"
          >
            <span className="text-sm font-semibold text-orange-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Pilih voucher promo
            </span>
            {open
              ? <ChevronUp className="w-4 h-4 text-orange-500" />
              : <ChevronDown className="w-4 h-4 text-orange-500" />
            }
          </button>
        )}

        {/* Daftar voucher (dropdown) */}
        {open && !appliedVoucher && activeVouchers.length > 0 && (
          <div className="mt-3 space-y-2">
            {activeVouchers.map((v: any) => {
              const eligible = Number(amount) >= Number(v.min_transaction);
              const discount = eligible ? calcDiscount(v, amount) : 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => eligible && handleSelect(v)}
                  disabled={!eligible}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all ${
                    eligible
                      ? 'border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50 cursor-pointer active:scale-[0.98]'
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Icon tipe */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    v.type === 'percent' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {v.type === 'percent'
                      ? <Percent className="w-4 h-4 text-blue-600" />
                      : <DollarSign className="w-4 h-4 text-green-600" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-gray-900 font-mono tracking-widest">
                      {v.code}
                    </p>
                    {v.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{v.description}</p>
                    )}
                    {v.expires_at && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Berlaku s/d {new Date(v.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    {!eligible && (
                      <p className="text-[10px] text-red-400 font-semibold mt-0.5">
                        Min. transaksi {formatRp(v.min_transaction)}
                      </p>
                    )}
                  </div>

                  {/* Nilai diskon */}
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-extrabold ${
                      v.type === 'percent' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {v.type === 'percent' ? `${v.value}% OFF` : `${formatRp(v.value)} OFF`}
                    </span>
                    {v.type === 'percent' && v.max_discount && (
                      <p className="text-[10px] text-gray-400">maks. {formatRp(v.max_discount)}</p>
                    )}
                    {eligible && discount > 0 && (
                      <p className="text-[10px] text-green-500 font-semibold mt-0.5">
                        Hemat {formatRp(discount)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  CheckoutSummary
// ══════════════════════════════════════════════════════════════
const CheckoutSummary: React.FC = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { user }    = useAuth();
  const { removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  // Guard double-submit: ref lebih reliable dari state karena update sinkron
  const isSubmitting = React.useRef(false);

  const [contactName,  setContactName]  = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  const [appliedVoucher,  setAppliedVoucher]  = useState<any | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const bookingData = location.state;

  React.useEffect(() => {
    if (!bookingData || !bookingData.productName) {
      navigate('/explore', { replace: true });
    }
  }, [bookingData, navigate]);

  if (!bookingData || !bookingData.productName) return null;

  const {
    productId,
    productName           = 'Trivgoo Booking',
    location: productLocation = '-',
    date                  = '',
    pax                   = 1,
    pricePerPax           = 0,
    totalPrice            = 0,
    image                 = '',
    currency              = 'IDR',
    duration              = 1,
    guestCount,
    unitLabel             = 'Tiket',
    priceUnitLabel        = 'orang',
    vehicleType,
    transmission,
    seats,
    luggage,
    year,
    fuelPolicy,
    withDriver,
    pickupTime,
    returnTime,
    availableVouchers     = [],
  } = bookingData;

  const isCarBooking = vehicleType === 'car';

  // ── Kalkulasi harga ───────────────────────────────────────
  const baseTotal  = Number(totalPrice);
  const afterDiscount = Math.max(0, baseTotal - appliedDiscount);
  const finalTotal = afterDiscount + ADMIN_FEE;

  // ── Helpers ───────────────────────────────────────────────
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        });
      }
      return dateStr;
    } catch { return dateStr; }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '-';
    if (dateStr.includes(' - ')) {
      const [start, end] = dateStr.split(' - ');
      return `${formatDateString(start)} – ${formatDateString(end)}`;
    }
    return formatDateString(dateStr);
  };

  const formatDateRangeWithTime = () => {
    if (!date || !date.includes(' - ')) return <span>{formatDateDisplay(date)}</span>;
    const [start, end] = date.split(' - ');
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">Ambil:</span>
          <span className="font-medium">{formatDateString(start)}</span>
          {pickupTime && <span className="text-sm text-gray-400">({pickupTime})</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">Kembali:</span>
          <span className="font-medium">{formatDateString(end)}</span>
          {returnTime && <span className="text-sm text-gray-400">({returnTime})</span>}
        </div>
      </div>
    );
  };

  const formatCurrency   = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const getTransmissionLabel = (t?: string) =>
    !t ? '-' : t.toLowerCase() === 'automatic' ? 'Matic' : 'Manual';

  // ── Validasi kontak ───────────────────────────────────────
  const validateContact = () => {
    const errors: Record<string, string> = {};
    if (!contactName.trim())  errors.name  = 'Nama wajib diisi';
    if (!contactEmail.trim()) errors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) errors.email = 'Format email tidak valid';
    if (!contactPhone.trim()) errors.phone = 'No. HP wajib diisi';
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handle payment ────────────────────────────────────────
  const handlePayment = async () => {
    // Cegah double-submit — ref update sinkron, tidak ada race condition
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    try {
      setLoading(true);
      const orderId = `TRV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const res = await http.post('/payment/create-payment', {
        id:           orderId,
        amount:       finalTotal,
        name:         contactName,
        email:        contactEmail,
        product_name: productName,
        quantity:     pax || 1,
        user_id:      user?.id || null,
        product_id:   productId || null,
        admin_fee:    ADMIN_FEE,
        ...(appliedVoucher ? {
          voucher_code:    appliedVoucher.code,
          voucher_id:      appliedVoucher.id,
          discount_amount: appliedDiscount,
          original_amount: baseTotal,
        } : {}),
      });

      const { payment_url } = res.data?.data || {};
      if (!payment_url) throw new Error('Payment URL tidak terdeteksi.');

      if (productId) {
        removeFromCart(productId);
        try {
          const raw = window.localStorage.getItem('triv_cart_v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            const newCart = parsed.filter((item: any) => item.product.id !== productId);
            window.localStorage.setItem('triv_cart_v1', JSON.stringify(newCart));
          }
        } catch { /* silent */ }
      }

      window.location.href = payment_url;
    } catch (error: any) {
      setLoading(false);
      isSubmitting.current = false; // Reset hanya saat error agar bisa coba lagi
      Swal.fire('Error', error.message || 'Gagal memproses pembayaran', 'error');
    }
    // Catatan: jika sukses (redirect), isSubmitting tetap true — tidak relevan karena halaman berganti
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Review Pesanan</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">

        {/* ── Produk ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex p-4 gap-4">
            <img
              src={getImageUrl(image)}
              alt={productName}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              onError={(e) => {
                const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
                if (image && !image.startsWith('http'))
                  (e.currentTarget as HTMLImageElement).src = `${BASE_URL}/${image.replace(/^\//, '')}`;
              }}
            />
            <div className="flex-1">
              <h2 className="font-bold text-gray-800 leading-tight">{productName}</h2>
              <div className="flex items-center text-sm text-gray-500 mt-1.5">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                {productLocation}
              </div>
              {isCarBooking && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Rental Mobil</span>
                  {transmission && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      {getTransmissionLabel(transmission)}
                    </span>
                  )}
                </div>
              )}
              {vehicleType === 'tour' && (
                <span className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  Tour & Activity
                </span>
              )}
              {vehicleType === 'stay' && (
                <span className="mt-2 inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  Hotel & Vila
                </span>
              )}
            </div>
          </div>

          {/* Detail booking */}
          <div className="bg-gray-50 p-4 border-t border-gray-100">
            {isCarBooking ? (
              <div className="space-y-3">
                {date && (
                  <div className="flex items-start gap-3 text-sm">
                    <Calendar className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                    <div className="flex-1 text-gray-600">{formatDateRangeWithTime()}</div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-gray-600">Durasi Sewa: <span className="font-semibold">{duration} Hari</span></span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                  {seats     && <div className="flex items-center gap-2 text-sm"><Users     className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{seats} Penumpang</span></div>}
                  {luggage   && <div className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{luggage} Koper</span></div>}
                  {year      && <div className="flex items-center gap-2 text-sm"><Award     className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Tahun {year}</span></div>}
                  {fuelPolicy && <div className="flex items-center gap-2 text-sm"><Fuel     className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{fuelPolicy}</span></div>}
                </div>
                {withDriver !== undefined && (
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200">
                    <UserCog className="w-4 h-4 text-primary-500" />
                    <span className="text-gray-600">
                      {withDriver ? 'Dengan Sopir' : 'Tanpa Sopir (Lepas Kunci)'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {date && (
                  <div className="flex items-start gap-2 col-span-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                    <span className="text-gray-600">{formatDateDisplay(date)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-gray-600">
                    {guestCount ?? pax} {vehicleType === 'stay' ? 'Tamu' : 'Orang'}
                  </span>
                </div>
                {duration > 1 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-gray-600">
                      {duration} {priceUnitLabel === 'malam' ? 'Malam' : 'Hari'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Form Data Pemesan ── */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Data Pemesan</h3>
          <div className="space-y-3">

            {/* Nama */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={contactName}
                  onChange={(e) => { setContactName(e.target.value); setContactErrors(p => ({...p, name: ''})); }}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    contactErrors.name ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {contactErrors.name && <p className="text-red-500 text-xs mt-1">{contactErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={contactEmail}
                  onChange={(e) => { setContactEmail(e.target.value); setContactErrors(p => ({...p, email: ''})); }}
                  placeholder="nama@email.com"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    contactErrors.email ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {contactErrors.email && <p className="text-red-500 text-xs mt-1">{contactErrors.email}</p>}
            </div>

            {/* No HP */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                No. HP / WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={contactPhone}
                  onChange={(e) => { setContactPhone(e.target.value); setContactErrors(p => ({...p, phone: ''})); }}
                  placeholder="08xxxxxxxxxx"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    contactErrors.phone ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {contactErrors.phone && <p className="text-red-500 text-xs mt-1">{contactErrors.phone}</p>}
            </div>
          </div>
        </div>

        {/* ── Voucher Picker ── */}
        <VoucherPicker
          availableVouchers={availableVouchers}
          amount={baseTotal}
          appliedVoucher={appliedVoucher}
          onApply={(voucher, discount) => {
            setAppliedVoucher(voucher);
            setAppliedDiscount(discount);
          }}
          onRemove={() => {
            setAppliedVoucher(null);
            setAppliedDiscount(0);
          }}
        />

        {/* ── Rincian Harga ── */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Rincian Harga</h3>
          <div className="space-y-3">

            {/* Harga produk */}
            {isCarBooking ? (
              <div className="flex justify-between text-gray-600 text-sm">
                <span>{formatCurrency(pricePerPax)} / hari × {duration} hari</span>
                <span>{formatCurrency(pricePerPax * duration)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-gray-600 text-sm">
                <span>
                  {formatCurrency(pricePerPax)} / {priceUnitLabel} × {guestCount ?? pax} {unitLabel}
                  {duration > 1 && ` × ${duration} ${priceUnitLabel}`}
                </span>
                <span>{formatCurrency(baseTotal)}</span>
              </div>
            )}

            {/* Diskon voucher */}
            {appliedVoucher && appliedDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Voucher ({appliedVoucher.code})
                </span>
                <span>− {formatCurrency(appliedDiscount)}</span>
              </div>
            )}

            {/* Biaya admin */}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Biaya Admin</span>
              <span>+ {formatCurrency(ADMIN_FEE)}</span>
            </div>

            <hr className="border-dashed border-gray-200" />

            {/* Subtotal dicoret jika ada diskon */}
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-gray-400 text-sm line-through">
                <span>Subtotal</span>
                <span>{formatCurrency(baseTotal + ADMIN_FEE)}</span>
              </div>
            )}

            {/* Total final */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold text-gray-800">Total Pembayaran</span>
              <div className="text-right">
                <span className="text-lg font-bold text-primary-600">{formatCurrency(finalTotal)}</span>
                {appliedDiscount > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-0.5">
                    Hemat {formatCurrency(appliedDiscount)}!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Info Rental ── */}
        {isCarBooking && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Informasi Penting
            </h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Harap bawa SIM asli dan KTP saat pengambilan mobil</li>
              <li>Deposit dikembalikan saat mobil dikembalikan dalam kondisi baik</li>
              <li>Bahan bakar tidak termasuk dalam harga sewa</li>
              <li>Pengembalian terlambat dikenakan biaya tambahan</li>
            </ul>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="pt-2 pb-6">
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-primary-600 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Lanjut ke Pembayaran
                {appliedDiscount > 0 && (
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                    Hemat {formatCurrency(appliedDiscount)}
                  </span>
                )}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Dengan mengklik tombol di atas, Anda menyetujui Syarat & Ketentuan yang berlaku.
          </p>
        </div>

      </div>
    </div>
  );
};

export default CheckoutSummary;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../components/CartContext';
import http from '../services/http';
import {
  CreditCard, MapPin, Calendar, Users, ChevronRight, ShieldCheck,
  ArrowLeft, User, Mail, Phone, Clock, Briefcase, Award, Fuel, UserCog,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getImageUrl } from '../utils/imageUtils';

const CheckoutSummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);

  // ── State form kontak (dynamic dari user input) ──────────────────────────
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  // ── Guard: redirect jika tidak ada state (akses langsung URL) ──────────
  const bookingData = location.state;

  console.log('bookingData:', bookingData);
  console.log('image value:', bookingData?.image);

  
  React.useEffect(() => {
    if (!bookingData || !bookingData.productName) {
      navigate('/explore', { replace: true });
    }
  }, [bookingData, navigate]);

  if (!bookingData || !bookingData.productName) {
    return null; // Will redirect
  }

  const {
    productId,
    productName    = 'Trivgoo Booking',
    location: productLocation = '-',
    date           = '',
    pax            = 1,
    pricePerPax    = 0,
    totalPrice     = 0,
    image          = '',
    currency       = 'IDR',
    duration       = 1,
    guestCount,
    unitLabel      = 'Tiket',
    priceUnitLabel = 'orang',
    vehicleType,
    transmission,
    seats,
    luggage,
    year,
    fuelPolicy,
    withDriver,
    pickupTime,
    returnTime,
  } = bookingData;

  const isCarBooking = vehicleType === 'car';

  // ── Helpers ──────────────────────────────────────────────────────────────
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

  const formatCurrency = (amount: number) =>
    `Rp ${amount.toLocaleString('id-ID')}`;

  const getTransmissionLabel = (t?: string) =>
    !t ? '-' : t.toLowerCase() === 'automatic' ? 'Matic' : 'Manual';

  // ── Validasi kontak ──────────────────────────────────────────────────────
  const validateContact = () => {
    const errors: Record<string, string> = {};
    if (!contactName.trim()) errors.name = 'Nama wajib diisi';
    if (!contactEmail.trim()) errors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) errors.email = 'Format email tidak valid';
    if (!contactPhone.trim()) errors.phone = 'No. HP wajib diisi';
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handle payment ───────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!validateContact()) {
      Swal.fire('Lengkapi Data', 'Mohon isi data pemesan terlebih dahulu', 'warning');
      return;
    }

    try {
      setLoading(true);

      const orderId = `TRV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const res = await http.post('/payment/create-payment', {
        id: orderId,
        amount: totalPrice,
        name: contactName,
        email: contactEmail,
        product_name: productName,
        quantity: pax || 1,
        user_id: user?.id || null,
        product_id: productId || null,
      });

      const { payment_url } = res.data?.data || {};

      if (!payment_url) {
        throw new Error('Payment URL tidak terdeteksi. Pastikan konfigurasi DOKU sudah benar.');
      }

      // Clear cart jika dari keranjang
      if (productId) {
        removeFromCart(productId);
        try {
          const raw = window.localStorage.getItem('triv_cart_v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            const newCart = parsed.filter((item: any) => item.product.id !== productId);
            window.localStorage.setItem('triv_cart_v1', JSON.stringify(newCart));
          }
        } catch (e) { /* silent */ }
      }

      window.location.href = payment_url;

    } catch (error: any) {
      setLoading(false);
      Swal.fire('Error', error.response?.data?.message || error.message || 'Gagal memproses pembayaran', 'error');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
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
    // Coba construct URL manual jika getImageUrl gagal
    if (image && !image.startsWith('http')) {
      (e.currentTarget as HTMLImageElement).src = `${BASE_URL}/${image.replace(/^\//, '')}`;
    }
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
                <span className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">Tour & Activity</span>
              )}
              {vehicleType === 'stay' && (
                <span className="mt-2 inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Hotel & Vila</span>
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
                  {seats && <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{seats} Penumpang</span></div>}
                  {luggage && <div className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{luggage} Koper</span></div>}
                  {year && <div className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Tahun {year}</span></div>}
                  {fuelPolicy && <div className="flex items-center gap-2 text-sm"><Fuel className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{fuelPolicy}</span></div>}
                </div>
                {withDriver !== undefined && (
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200">
                    <UserCog className="w-4 h-4 text-primary-500" />
                    <span className="text-gray-600">{withDriver ? 'Dengan Sopir' : 'Tanpa Sopir (Lepas Kunci)'}</span>
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
                    <span className="text-gray-600">{duration} {priceUnitLabel === 'malam' ? 'Malam' : 'Hari'}</span>
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
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => { setContactName(e.target.value); setContactErrors(p => ({...p, name: ''})); }}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    contactErrors.name
                      ? 'border-red-400 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'
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
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => { setContactEmail(e.target.value); setContactErrors(p => ({...p, email: ''})); }}
                  placeholder="nama@email.com"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    contactErrors.email
                      ? 'border-red-400 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'
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
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => { setContactPhone(e.target.value); setContactErrors(p => ({...p, phone: ''})); }}
                  placeholder="08xxxxxxxxxx"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    contactErrors.phone
                      ? 'border-red-400 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {contactErrors.phone && <p className="text-red-500 text-xs mt-1">{contactErrors.phone}</p>}
            </div>
          </div>
        </div>

        {/* ── Rincian Harga ── */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Rincian Harga</h3>
          <div className="space-y-3">
            {isCarBooking ? (
              <>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>{formatCurrency(pricePerPax)} / hari × {duration} hari</span>
                  <span>{formatCurrency(pricePerPax * duration)}</span>
                </div>
                {withDriver && (
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Biaya Sopir</span>
                    <span className="text-green-600">Termasuk</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between text-gray-600 text-sm">
                <span>
                  {formatCurrency(pricePerPax)} / {priceUnitLabel} × {guestCount ?? pax} {unitLabel}
                  {duration > 1 && ` × ${duration} ${priceUnitLabel}`}
                </span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            )}
            <hr className="border-dashed border-gray-200" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold text-gray-800">Total Pembayaran</span>
              <span className="text-lg font-bold text-primary-600">{formatCurrency(totalPrice)}</span>
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

        {/* ── CTA Button ── */}
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

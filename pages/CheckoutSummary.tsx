import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import http from '../services/http';
import {
  CreditCard,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Clock,
  Gauge,
  Briefcase,
  Award,
  Fuel,
  UserCog,
} from 'lucide-react';
import Swal from 'sweetalert2';

const CheckoutSummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'xendit' | 'midtrans'>('xendit');

  useEffect(() => {
    const fetchGateway = async () => {
      try {
        const res = await http.get('/admin/payment-settings');
        const gw = res.data?.data?.selected_gateway || 'xendit';
        setSelectedGateway(gw);
      } catch (error) {
        console.error('Failed to fetch payment settings:', error);
      }
    };
    fetchGateway();
  }, []);

  const bookingData = location.state || {
    productName: 'Bali Tropical Tour - Nusa Penida',
    location: 'Klungkung, Bali',
    date: '2024-05-20',
    pax: 2,
    pricePerPax: 750000,
    totalPrice: 1500000,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    currency: 'IDR',
    duration: 1,
    guestCount: 2,
    unitLabel: 'Ticket',
    priceUnitLabel: 'person',
    contactDetails: { name: '', email: '', phone: '' },
    vehicleType: 'car',
    transmission: 'Automatic',
    seats: 7,
    luggage: 2,
    year: 2023,
    fuelPolicy: 'Full to Full',
    withDriver: false,
    pickupTime: '10:00',
    returnTime: '10:00',
  };

  const {
    productName,
    location: productLocation,
    date,
    pax,
    pricePerPax,
    totalPrice,
    image,
    currency = 'IDR',
    duration = 1,
    guestCount,
    unitLabel = 'Ticket',
    priceUnitLabel = 'person',
    contactDetails = {},
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

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      if (dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('-').map(Number);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          return new Date(y, m - 1, d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
      }
      return dateStr;
    } catch { return dateStr; }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      if (dateStr.includes(' - ')) {
        const [start, end] = dateStr.split(' - ');
        return `${formatDateString(start)} – ${formatDateString(end)}`;
      }
      return formatDateString(dateStr);
    } catch { return dateStr; }
  };

  const formatDateRangeWithTime = () => {
    if (!date || !date.includes(' - ')) return <span>{formatDateDisplay(date)}</span>;
    try {
      const [start, end] = date.split(' - ');
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Ambil:</span>
            <span className="font-medium">{formatDateString(start)}</span>
            {pickupTime && <span className="text-sm text-gray-500">({pickupTime})</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Kembali:</span>
            <span className="font-medium">{formatDateString(end)}</span>
            {returnTime && <span className="text-sm text-gray-500">({returnTime})</span>}
          </div>
        </div>
      );
    } catch { return <span>{date}</span>; }
  };

  const formatCurrency = (amount: number) => {
    if (currency === 'IDR') return `Rp ${amount.toLocaleString('id-ID')}`;
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getTransmissionLabel = (t?: string) => {
    if (!t) return '-';
    return t.toLowerCase() === 'automatic' ? 'Matic' : 'Manual';
  };

  const getFuelPolicyLabel = (policy?: string) => {
    if (!policy) return 'Kebijakan Bahan Bakar';
    const map: Record<string, string> = { 'Full to Full': 'Full to Full', 'Full to Empty': 'Full to Empty', 'Same to Same': 'Same to Same' };
    return map[policy] || policy;
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      if (selectedGateway === 'midtrans') {
        try {
          const cartTokenKey = 'triv_cart_token_v1';
          let cartToken = null;
          if (typeof window !== 'undefined') {
            cartToken = window.localStorage.getItem(cartTokenKey);
            if (!cartToken) {
              cartToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
              window.localStorage.setItem(cartTokenKey, cartToken);
            }
          }
          await http.post('/cart/lock', {
            productId: bookingData.productId,
            quantity: 1,
            startDate: date && date.includes(' - ') ? date.split(' - ')[0] : date,
            endDate: date && date.includes(' - ') ? date.split(' - ')[1] : date,
            ttlSeconds: 15 * 60,
            metadata: { isCarBooking },
            cartToken,
          });
        } catch (e) {
          console.error('Failed to create booking lock:', e);
        }

        const paymentState = {
          product: {
            id: 0, owner_id: 0, owner_name: '', category_id: isCarBooking ? 2 : 1,
            name: productName, description: '', price: pricePerPax, currency,
            location: productLocation, image, images: [], image_url: image, rating: 0, is_active: true, features: [],
          },
          quantity: pax, guestCount, duration, totalPrice, date, currency, contactDetails,
        };
        navigate('/payment', { state: paymentState });
        setLoading(false);
        return;
      }

      setTimeout(() => {
        window.location.href = 'https://checkout.xendit.co/web/609123456789';
      }, 1500);
    } catch (error: any) {
      setLoading(false);
      Swal.fire('Error', error.message || 'Gagal memproses pembayaran', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
          <h1 className="text-lg font-bold text-gray-800">Review Pesanan</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        {/* Detail Produk */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex p-4 gap-4">
            <img src={image} alt={productName} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1">
              <h2 className="font-bold text-gray-800 leading-tight">{productName}</h2>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />{productLocation}
              </div>
              {isCarBooking && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Rental Mobil</span>
                  {transmission && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{getTransmissionLabel(transmission)}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 border-t border-gray-100">
            {isCarBooking ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                  <div className="flex-1 text-gray-600">{formatDateRangeWithTime()}</div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-gray-600">Durasi Sewa: <span className="font-medium">{duration} Hari</span></span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  {seats && <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-gray-500" /><span className="text-gray-600">{seats} Penumpang</span></div>}
                  {luggage && <div className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4 text-gray-500" /><span className="text-gray-600">{luggage} Koper</span></div>}
                  {year && <div className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-gray-500" /><span className="text-gray-600">Tahun {year}</span></div>}
                  {fuelPolicy && <div className="flex items-center gap-2 text-sm"><Fuel className="w-4 h-4 text-gray-500" /><span className="text-gray-600">{getFuelPolicyLabel(fuelPolicy)}</span></div>}
                </div>
                {withDriver !== undefined && (
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200">
                    <UserCog className="w-4 h-4 text-primary-500" />
                    <span className="text-gray-600">{withDriver ? 'Dengan Sopir' : 'Tanpa Sopir (Lepas Kunci)'}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                  <span>{formatDateDisplay(date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{guestCount ?? pax} Tamu{duration > 1 && <span className="ml-1 text-gray-400">· {duration} Malam</span>}</span>
                </div>
                {duration > 1 && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span>{duration} {priceUnitLabel === 'night' ? 'Malam' : 'Hari'} · {pax} {unitLabel}(s)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Kontak Pemesan */}
        {(contactDetails.name || contactDetails.email || contactDetails.phone) && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Data Pemesan</h3>
            <div className="space-y-3">
              {contactDetails.name && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary-500" /></div>
                  <span>{contactDetails.name}</span>
                </div>
              )}
              {contactDetails.email && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 text-primary-500" /></div>
                  <span>{contactDetails.email}</span>
                </div>
              )}
              {contactDetails.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-primary-500" /></div>
                  <span>{contactDetails.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rincian Harga */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Rincian Harga</h3>
          <div className="space-y-3">
            {isCarBooking ? (
              <>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>{formatCurrency(pricePerPax)} / hari × {duration} hari</span>
                  <span>{formatCurrency(totalPrice)}</span>
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
                <span>{formatCurrency(pricePerPax)} / {priceUnitLabel} × {pax} {unitLabel}{duration > 1 && ` × ${duration} ${priceUnitLabel === 'night' ? 'malam' : 'hari'}`}</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            )}
            <hr className="border-dashed" />
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-bold text-gray-800">Total Pembayaran</span>
              <span className="text-lg font-bold text-primary-600">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Info Rental */}
        {isCarBooking && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Informasi Penting</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Harap bawa SIM asli dan KTP saat pengambilan mobil</li>
              <li>Deposit akan dikembalikan saat mobil dikembalikan dalam kondisi baik</li>
              <li>Bahan bakar tidak termasuk dalam harga sewa</li>
              <li>Pengembalian terlambat akan dikenakan biaya tambahan</li>
            </ul>
          </div>
        )}

        {/* Button */}
        <div className="pt-4">
          <button onClick={handlePayment} disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-primary-600 active:scale-95'}`}>
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><CreditCard className="w-5 h-5" />Lanjut ke Pembayaran<ChevronRight className="w-5 h-5" /></>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">Dengan mengklik tombol di atas, Anda menyetujui Syarat & Ketentuan yang berlaku.</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;

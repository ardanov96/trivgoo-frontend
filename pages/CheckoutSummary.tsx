import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import Swal from 'sweetalert2';

const CheckoutSummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Data passed from ProductDetail handleBookNow
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
    contactDetails: {
      name: '',
      email: '',
      phone: '',
    },
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
  } = bookingData;

  // Format date display: handles both single date (YYYY-MM-DD) and range (YYYY-MM-DD - YYYY-MM-DD)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '-';
    // Range check
    if (dateStr.includes(' - ')) {
      const [start, end] = dateStr.split(' - ');
      const fmt = (s: string) => {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      };
      return `${fmt(start)} – ${fmt(end)}`;
    }
    // Single date
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
      dateStyle: 'long',
    });
  };

  const formatCurrency = (amount: number) => {
    if (currency === 'IDR') return `Rp ${amount.toLocaleString('id-ID')}`;
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      // Dummy — ganti dengan API call ke backend
      setTimeout(() => {
        const xenditInvoiceUrl = 'https://checkout.xendit.co/web/609123456789';
        window.location.href = xenditInvoiceUrl;
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
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Review Pesanan</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">

        {/* Detail Produk */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex p-4 gap-4">
            <img
              src={image}
              alt={productName}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h2 className="font-bold text-gray-800 leading-tight">{productName}</h2>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                {productLocation}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start text-gray-600 gap-2">
              <Calendar className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
              <span>{formatDateDisplay(date)}</span>
            </div>
            <div className="flex items-center text-gray-600 gap-2">
              <Users className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>
                {guestCount ?? pax} Tamu
                {duration > 1 && (
                  <span className="ml-1 text-gray-400">· {duration} Malam</span>
                )}
              </span>
            </div>
            {duration > 1 && (
              <div className="flex items-center text-gray-600 gap-2 col-span-2">
                <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>{duration} {priceUnitLabel === 'night' ? 'Malam' : 'Hari'} · {pax} {unitLabel}(s)</span>
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
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-500" />
                  </div>
                  <span>{contactDetails.name}</span>
                </div>
              )}
              {contactDetails.email && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary-500" />
                  </div>
                  <span>{contactDetails.email}</span>
                </div>
              )}
              {contactDetails.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-primary-500" />
                  </div>
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
            <div className="flex justify-between text-gray-600 text-sm">
              <span>
                {formatCurrency(pricePerPax)} / {priceUnitLabel} × {pax} {unitLabel}
                {duration > 1 && ` × ${duration} ${priceUnitLabel === 'night' ? 'malam' : 'hari'}`}
              </span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Biaya Layanan</span>
              <span className="text-green-600 font-medium">Gratis</span>
            </div>
            <hr className="border-dashed" />
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-bold text-gray-800">Total Pembayaran</span>
              <span className="text-lg font-bold text-primary-600">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Button Action */}
        <div className="pt-4">
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-primary-600 active:scale-95'}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Lanjut ke Pembayaran
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">
            Dengan mengklik tombol di atas, Anda menyetujui Syarat & Ketentuan yang berlaku.
          </p>
        </div>

      </div>
    </div>
  );
};

export default CheckoutSummary;

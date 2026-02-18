import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CreditCard, 
  MapPin, 
  Calendar, 
  Users, 
  ChevronRight, 
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';

const CheckoutSummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Data pesanan biasanya dilempar dari page sebelumnya melalui state router
  const bookingData = location.state || {
    productName: "Bali Tropical Tour - Nusa Penida",
    location: "Klungkung, Bali",
    date: "2024-05-20",
    pax: 2,
    pricePerPax: 750000,
    totalPrice: 1500000,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4"
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Dummy Response simulasi dari Backend
      setTimeout(() => {
        const xenditInvoiceUrl = "https://checkout.xendit.co/web/609123456789";
        window.location.href = xenditInvoiceUrl; // Redirect ke Xendit
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
              src={bookingData.image} 
              alt="product" 
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="font-bold text-gray-800 leading-tight">{bookingData.productName}</h2>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <MapPin className="w-3 h-3 mr-1" />
                {bookingData.location}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              {new Date(bookingData.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-primary" />
              {bookingData.pax} Peserta
            </div>
          </div>
        </div>

        {/* Rincian Harga */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Rincian Harga</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>{bookingData.productName} (x{bookingData.pax})</span>
              <span>Rp {bookingData.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Biaya Layanan</span>
              <span className="text-green-600 font-medium">Gratis</span>
            </div>
            <hr className="border-dashed" />
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-gray-800">Total Pembayaran</span>
              <span className="text-lg font-bold text-blue-600">Rp {bookingData.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Keamanan & Info */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl text-blue-700 text-sm border border-blue-100">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <p>Pembayaran aman & terenkripsi. Anda akan diarahkan ke halaman pembayaran aman Xendit untuk menyelesaikan transaksi.</p>
        </div>

        {/* Button Action */}
        <div className="pt-4">
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2
              ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
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
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Clock, 
  ArrowRight, 
  Copy, 
  ExternalLink, 
  Info,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

const BookingPending: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data ini diambil dari state router setelah user memilih metode pembayaran di Xendit
  const pendingInfo = location.state || {
    bookingId: "INV-20240520-002",
    productName: "Bali Tropical Tour - Nusa Penida",
    totalAmount: 1500000,
    expiryDate: "2024-05-21 14:00:00",
    paymentUrl: "https://checkout.xendit.co/web/..." // URL Invoice Xendit jika mereka ingin balik
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      title: 'Copied!',
      text: 'ID Pesanan berhasil disalin',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 pb-12 px-4">
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        
        {/* Konten Utama */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse opacity-60 scale-125"></div>
              <Clock className="w-20 h-20 text-amber-500 relative" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Menunggu Pembayaran</h1>
          <p className="text-gray-500 text-sm px-4">
            Pesanan Anda telah kami terima. Silakan selesaikan pembayaran sebelum batas waktu berakhir.
          </p>
        </div>

        {/* Info Batas Waktu */}
        <div className="mx-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-600" />
            <div className="text-xs text-amber-800">
              <p className="font-bold">Batas Waktu Bayar</p>
              <p>{pendingInfo.expiryDate}</p>
            </div>
          </div>
        </div>

        {/* Ringkasan Transaksi */}
        <div className="bg-gray-50 px-8 py-6 mt-6 space-y-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">ID Pesanan</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-gray-700">{pendingInfo.bookingId}</span>
              <button onClick={() => copyToClipboard(pendingInfo.bookingId)} className="text-blue-500">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Total Tagihan</span>
            <span className="font-bold text-gray-800">Rp {pendingInfo.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 space-y-3">
          {/* Tombol instruksi bayar (Mengarahkan kembali ke Xendit Invoice) */}
          <button
            onClick={() => window.open(pendingInfo.paymentUrl, '_blank')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <ExternalLink className="w-5 h-5" />
            Lihat Cara Bayar
          </button>
          
          <button
            onClick={() => navigate('/my-bookings')}
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            Cek Status Pesanan
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      <div className="mt-8 max-w-md text-center">
        <p className="text-gray-400 text-xs leading-relaxed px-6">
          Jika Anda sudah melakukan transfer, sistem kami memerlukan waktu hingga 5 menit untuk memverifikasi secara otomatis.
        </p>
      </div>

      <p className="mt-6 text-gray-400 text-sm flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Secure payment by Xendit
      </p>
    </div>
  );
};

export default BookingPending;
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  CreditCard,
  Ticket
} from 'lucide-react';

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingInfo = location.state || {
    bookingId: "INV-20240520-001",
    productName: "Bali Tropical Tour - Nusa Penida",
    totalAmount: 1500000,
    date: "2024-05-20"
  };

  return (
    /* Ditambahkan 'pt-24' (padding-top) agar konten turun di bawah navbar.
       'min-h-[calc(100vh-64px)]' memastikan layout tetap full screen dikurangi tinggi standar navbar.
    */
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 pb-12 px-4">
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        
        {/* Konten Utama */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
              <CheckCircle className="w-20 h-20 text-green-500 relative" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-gray-500 text-sm">
            E-voucher Anda sedang diproses dan akan segera dikirim melalui email.
          </p>
        </div>

        {/* Ringkasan Transaksi */}
        <div className="bg-gray-50 px-8 py-6 space-y-4 border-y border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">ID Pesanan</span>
            <span className="font-mono font-bold text-gray-700">{bookingInfo.bookingId}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Total Dibayar</span>
            <span className="font-bold text-blue-600">Rp {bookingInfo.totalAmount.toLocaleString()}</span>
          </div>
          
          <hr className="border-gray-200 border-dashed" />

          <div className="flex gap-3 items-center text-xs text-gray-600">
            <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 line-clamp-1">{bookingInfo.productName}</p>
              <p>{new Date(bookingInfo.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 space-y-3">
          <button
            onClick={() => navigate('/my-bookings')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <Ticket className="w-5 h-5" />
            Lihat Tiket Saya
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl font-semibold transition-all active:scale-[0.98]"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <p className="mt-8 text-gray-400 text-sm flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Secure payment processed by Xendit
      </p>
    </div>
  );
};

export default BookingSuccess;
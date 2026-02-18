import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  XCircle, 
  RefreshCcw, 
  Home, 
  AlertCircle, 
  HelpCircle,
  CreditCard
} from 'lucide-react';

const BookingFailed: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mengambil info error dari state router (jika ada)
  const errorInfo = location.state || {
    message: "Pembayaran dibatalkan atau waktu transaksi telah habis.",
    bookingId: "INV-20240520-XXX"
  };

  return (
    /* pt-24 agar tidak tertutup navbar, sama dengan Success Page */
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 pb-12 px-4">
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        
        {/* Konten Utama */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Efek merah transparan di belakang icon */}
              <div className="absolute inset-0 bg-red-100 rounded-full scale-125 opacity-50"></div>
              <XCircle className="w-20 h-20 text-red-500 relative" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Gagal</h1>
          <p className="text-gray-500 text-sm">
            {errorInfo.message}
          </p>
        </div>

        {/* Informasi Masalah */}
        <div className="bg-orange-50 px-8 py-6 space-y-3 border-y border-orange-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-bold">Apa yang harus dilakukan?</p>
              <ul className="list-disc list-inside mt-1 opacity-80">
                <li>Cek saldo atau limit kartu Anda</li>
                <li>Pastikan koneksi internet stabil</li>
                <li>Coba gunakan metode pembayaran lain</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 space-y-3">
          <button
            onClick={() => navigate(-1)} // Kembali ke Checkout Summary
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <RefreshCcw className="w-5 h-5" />
            Coba Bayar Lagi
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </button>
        </div>

        {/* Link Bantuan */}
        <div className="px-8 pb-8 text-center">
          <button className="text-sm text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 mx-auto">
            <HelpCircle className="w-4 h-4" />
            Butuh bantuan? Hubungi CS kami
          </button>
        </div>

      </div>

      <p className="mt-8 text-gray-400 text-sm flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Secure payment processed by Xendit
      </p>
    </div>
  );
};

export default BookingFailed;
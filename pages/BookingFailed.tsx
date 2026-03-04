import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCcw, Home, AlertCircle, HelpCircle, CreditCard } from 'lucide-react';

const BookingFailed: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Ambil dari query params (redirect Midtrans) ATAU dari router state (onError callback)
  const orderId     = searchParams.get('order_id')  || location.state?.orderId  || '-';
  const statusCode  = searchParams.get('status_code') || '-';
  const errorMessage = location.state?.result?.status_message
    || 'Pembayaran dibatalkan atau waktu transaksi telah habis.';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 pb-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">

        {/* Icon */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full scale-125 opacity-50"></div>
              <XCircle className="w-20 h-20 text-red-500 relative" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Gagal</h1>
          <p className="text-gray-500 text-sm">{errorMessage}</p>
          {orderId !== '-' && (
            <p className="text-xs text-gray-400 mt-2 font-mono">ID: {orderId}</p>
          )}
          {statusCode !== '-' && (
            <p className="text-xs text-gray-400">Kode: {statusCode}</p>
          )}
        </div>

        {/* Info */}
        <div className="bg-orange-50 px-8 py-6 space-y-3 border-y border-orange-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-bold">Apa yang harus dilakukan?</p>
              <ul className="list-disc list-inside mt-1 opacity-80 space-y-1">
                <li>Cek saldo atau limit kartu Anda</li>
                <li>Pastikan koneksi internet stabil</li>
                <li>Coba gunakan metode pembayaran lain</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 space-y-3">
          <button
            onClick={() => navigate(-1)}
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

        <div className="px-8 pb-8 text-center">
          <button className="text-sm text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 mx-auto">
            <HelpCircle className="w-4 h-4" />
            Butuh bantuan? Hubungi CS kami
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Secure payment processed by Midtrans
      </p>
    </div>
  );
};

export default BookingFailed;

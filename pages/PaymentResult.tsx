import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ArrowRight, Home, BookCheckIcon } from 'lucide-react';
import http from '../services/http';

type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'EXPIRED' | 'loading';

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [invoice, setInvoice] = useState('');
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const rawStatus = (searchParams.get('status') || '').toUpperCase();
    const invoiceNumber = searchParams.get('invoice') || '';
    const mock = searchParams.get('mock') === 'true';

    setInvoice(invoiceNumber);
    setIsMock(mock);

    // Map status dari DOKU ke status internal
    const statusMap: Record<string, PaymentStatus> = {
      SUCCESS: 'SUCCESS',
      PAID: 'SUCCESS',
      PENDING: 'PENDING',
      FAILED: 'FAILED',
      EXPIRED: 'EXPIRED',
      CANCELLED: 'FAILED',
    };

    const mappedStatus = statusMap[rawStatus] || 'PENDING';
    setStatus(mappedStatus);

    // Update booking status di backend jika ada invoice
    if (invoiceNumber && mappedStatus === 'SUCCESS') {
      http.post('/payment/confirm-callback', {
        invoice_number: invoiceNumber,
        status: mappedStatus,
      }).catch(() => {
        // Silent fail — webhook akan handle jika ini gagal
      });
    }
  }, [searchParams]);

  const config = {
    SUCCESS: {
      icon: <CheckCircle2 className="w-20 h-20 text-green-500" />,
      title: 'Pembayaran Berhasil!',
      subtitle: 'Terima kasih! Pesanan Anda telah dikonfirmasi.',
      bg: 'bg-green-50',
      border: 'border-green-200',
      badgeColor: 'bg-green-100 text-green-700',
    },
    FAILED: {
      icon: <XCircle className="w-20 h-20 text-red-500" />,
      title: 'Pembayaran Gagal',
      subtitle: 'Transaksi tidak berhasil diproses. Silakan coba lagi.',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badgeColor: 'bg-red-100 text-red-700',
    },
    PENDING: {
      icon: <Clock className="w-20 h-20 text-yellow-500" />,
      title: 'Menunggu Pembayaran',
      subtitle: 'Pembayaran Anda sedang diproses. Kami akan memberi tahu Anda segera.',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-700',
    },
    EXPIRED: {
      icon: <Clock className="w-20 h-20 text-gray-400" />,
      title: 'Pembayaran Kedaluwarsa',
      subtitle: 'Batas waktu pembayaran telah habis. Silakan buat pesanan baru.',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      badgeColor: 'bg-gray-100 text-gray-700',
    },
    loading: {
      icon: <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />,
      title: 'Memproses...',
      subtitle: 'Mohon tunggu sebentar.',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      badgeColor: 'bg-gray-100 text-gray-700',
    },
  };

  const current = config[status];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className={`bg-white rounded-2xl shadow-lg border ${current.border} overflow-hidden`}>
          {/* Top colored band */}
          <div className={`${current.bg} px-6 py-8 flex flex-col items-center text-center`}>
            {current.icon}
            <h1 className="text-2xl font-bold text-gray-800 mt-4">{current.title}</h1>
            <p className="text-gray-500 mt-2 text-sm">{current.subtitle}</p>
          </div>

          {/* Detail */}
          <div className="px-6 py-5 space-y-3">
            {invoice && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Nomor Invoice</span>
                <span className="font-mono font-semibold text-gray-800">{invoice}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${current.badgeColor}`}>
                {status === 'loading' ? 'Memproses...' : status}
              </span>
            </div>

            {isMock && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <p className="text-yellow-700 text-xs text-center">
                  ⚠️ <strong>Mode Test</strong> — Ini adalah simulasi pembayaran (mock mode)
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            {status === 'SUCCESS' && (
              <button
                onClick={() => navigate('/my-bookings')}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
              >
                Lihat Pesanan Saya <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {(status === 'FAILED' || status === 'EXPIRED') && (
              <button
                onClick={() => navigate(-2)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                Coba Lagi <ArrowRight className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <BookCheckIcon className="w-4 h-4" /> Lihat Daftar Booking
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" /> Kembali ke Beranda
            </button>
            
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Butuh bantuan? Hubungi <a href="mailto:cs@trivgoo.com" className="text-primary-600 hover:underline">cs@trivgoo.com</a>
        </p>
      </div>
    </div>
  );
};

export default PaymentResult;

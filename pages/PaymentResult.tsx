import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ArrowRight, Home, BookCheckIcon } from 'lucide-react';
import http from '../services/http';
import { useLangNavigate } from '../src/hooks/useLangNavigate';

type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'EXPIRED' | 'loading';

type PaymentStatusPayload = {
  external_id: string;
  booking_id: number;
  booking_status: string;
  payment_status: string;
  payment_gateway?: string | null;
  payment_url?: string | null;
  payment_method?: string | null;
  payment_channel?: string | null;
  payment_expires_at?: string | null;
  paid_at?: string | null;
  total_price?: number | null;
  product_name?: string | null;
  updated_at?: string | null;
};

const mapQueryStatus = (rawStatus: string | null): PaymentStatus => {
  const value = (rawStatus || '').toUpperCase();
  const statusMap: Record<string, PaymentStatus> = {
    SUCCESS: 'SUCCESS',
    PAID: 'SUCCESS',
    PENDING: 'PENDING',
    FAILED: 'FAILED',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'FAILED',
  };

  return statusMap[value] || 'PENDING';
};

const mapBackendStatus = (paymentStatus?: string | null, bookingStatus?: string | null): PaymentStatus => {
  const payment = (paymentStatus || '').toUpperCase();
  const booking = (bookingStatus || '').toUpperCase();

  if (payment === 'PAID') return 'SUCCESS';
  if (payment === 'EXPIRED') return 'EXPIRED';
  if (payment === 'FAILED' || payment === 'CANCELLED' || payment === 'REFUNDED') return 'FAILED';
  if (booking === 'CANCELLED' && payment !== 'PAID') return 'FAILED';
  if (payment === 'PENDING' || !payment) return 'PENDING';

  return 'PENDING';
};

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID');
};

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { langNavigate } = useLangNavigate();

  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [invoice, setInvoice] = useState('');
  const [isMock, setIsMock] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentStatusPayload | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const invoiceNumber =
      searchParams.get('invoice') ||
      searchParams.get('external_id') ||
      searchParams.get('invoice_number') ||
      '';
    const mock = searchParams.get('mock') === 'true';
    const fallbackStatus = mapQueryStatus(searchParams.get('status'));

    setInvoice(invoiceNumber);
    setIsMock(mock);
    setPaymentData(null);
    setStatus(invoiceNumber ? 'loading' : fallbackStatus);
    setStatusMessage(
      invoiceNumber
        ? null
        : 'Nomor invoice tidak ditemukan. Silakan cek booking Anda atau hubungi tim support.'
    );

    if (!invoiceNumber) return;

    let isActive = true;
    let attempts = 0;
    let timerId: number | undefined;

    const stopPolling = () => {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = undefined;
      }
    };

    const syncPaymentStatus = async () => {
      if (!isActive) return;
      attempts += 1;

      try {
        const res = await http.get(`/payment/status/${encodeURIComponent(invoiceNumber)}`);
        if (!isActive) return;

        const payload = res.data?.data as PaymentStatusPayload | undefined;
        const nextStatus = mapBackendStatus(payload?.payment_status, payload?.booking_status);

        setPaymentData(payload || null);
        setStatus(nextStatus);
        setStatusMessage(null);

        if (nextStatus !== 'PENDING' || attempts >= 15) {
          stopPolling();
        }
      } catch (error: any) {
        if (!isActive) return;

        const apiMessage =
          error?.response?.data?.message ||
          'Status pembayaran sedang menunggu sinkronisasi. Silakan cek lagi beberapa saat.';

        setStatus(fallbackStatus);
        setStatusMessage(apiMessage);

        if (attempts >= 15) {
          stopPolling();
        }
      }
    };

    syncPaymentStatus();
    timerId = window.setInterval(syncPaymentStatus, 4000);

    return () => {
      isActive = false;
      stopPolling();
    };
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
    <>
      <SEO title="Payment Result | Trivgoo" noindex={true} />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className={`bg-white rounded-2xl shadow-lg border ${current.border} overflow-hidden`}>
          <div className={`${current.bg} px-6 py-8 flex flex-col items-center text-center`}>
            {current.icon}
            <h1 className="text-2xl font-bold text-gray-800 mt-4">{current.title}</h1>
            <p className="text-gray-500 mt-2 text-sm">{current.subtitle}</p>
          </div>

          <div className="px-6 py-5 space-y-3">
            {invoice && (
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-gray-500">Nomor Invoice</span>
                <span className="font-mono font-semibold text-gray-800 text-right break-all">{invoice}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${current.badgeColor}`}>
                {status === 'loading' ? 'Memproses...' : status}
              </span>
            </div>

            {paymentData?.product_name && (
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-gray-500">Produk</span>
                <span className="font-semibold text-gray-800 text-right">{paymentData.product_name}</span>
              </div>
            )}

            {paymentData?.payment_gateway && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Gateway</span>
                <span className="font-semibold text-gray-800 uppercase">{paymentData.payment_gateway}</span>
              </div>
            )}

            {paymentData?.payment_expires_at && (
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-gray-500">Berlaku Sampai</span>
                <span className="font-semibold text-gray-800 text-right">
                  {formatDateTime(paymentData.payment_expires_at)}
                </span>
              </div>
            )}

            {statusMessage && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <p className="text-yellow-800 text-xs leading-relaxed">{statusMessage}</p>
              </div>
            )}

            {isMock && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <p className="text-yellow-700 text-xs text-center">
                  <strong>Mode Test</strong> - Ini adalah simulasi pembayaran (mock mode)
                </p>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 space-y-3">
            {status === 'PENDING' && paymentData?.payment_url && (
              <button
                onClick={() => { window.location.href = paymentData.payment_url as string; }}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
              >
                Lanjutkan Pembayaran <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {status === 'SUCCESS' && (
              <button
                onClick={() => langNavigate('/my-bookings')}
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
              onClick={() => window.location.reload()}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              Cek Status Lagi
            </button>

            <button
              onClick={() => langNavigate('/my-bookings')}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <BookCheckIcon className="w-4 h-4" /> Lihat Daftar Booking
            </button>

            <button
              onClick={() => langNavigate('/')}
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
    </>
  );
};

export default PaymentResult;

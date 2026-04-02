import React from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Clock, Home, CreditCard, HelpCircle, ArrowRight, Ticket } from 'lucide-react';
import { useLangNavigate } from '../src/hooks/useLangNavigate';

const BookingPending: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { langNavigate } = useLangNavigate();

  const orderId   = searchParams.get('order_id') || location.state?.orderId || '-';
  const vaNumber  = location.state?.vaNumber     || location.state?.result?.va_numbers?.[0]?.va_number || null;
  const bank      = location.state?.bank         || location.state?.result?.va_numbers?.[0]?.bank     || null;
  const expiry    = location.state?.expiry       || null;

  return (
    <>
      <SEO title="Payment Pending | Trivgoo" noindex={true} />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 pb-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">

        {/* Icon */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse opacity-50"></div>
              <Clock className="w-20 h-20 text-amber-500 relative" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('booking.pending_title', 'Payment Pending')}
          </h1>
          <p className="text-gray-500 text-sm">
            {t('booking.pending_desc', 'Your booking is awaiting payment confirmation.')}
          </p>
        </div>

        {/* Info */}
        <div className="bg-amber-50 px-8 py-6 space-y-3 border-y border-amber-100">
          {orderId !== '-' && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{t('booking.order_id', 'Order ID')}</span>
              <span className="font-mono font-bold text-gray-700">{orderId}</span>
            </div>
          )}
          {vaNumber && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{t('booking.va_number', 'Virtual Account')}{bank ? ` ${bank.toUpperCase()}` : ''}</span>
              <span className="font-mono font-bold text-amber-700">{vaNumber}</span>
            </div>
          )}
          {expiry && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{t('booking.pay_before', 'Pay Before')}</span>
              <span className="font-bold text-red-500">{expiry}</span>
            </div>
          )}
          <div className="flex items-start gap-3 pt-2">
            <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              {t('booking.pending_info', 'Complete your payment before the deadline. Your booking will be confirmed automatically after payment is received.')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 space-y-3">
          <button
            onClick={() => langNavigate('/my-bookings')}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <Ticket className="w-5 h-5" />
            {t('booking.view_bookings', 'View My Bookings')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => langNavigate('/')}
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            {t('booking.back_home', 'Back to Home')}
          </button>
        </div>

        <div className="px-8 pb-8 text-center">
          <button className="text-sm text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 mx-auto">
            <HelpCircle className="w-4 h-4" />
            {t('booking.contact_support', 'Need help? Contact our support')}
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        {t('common.secure_payment', 'Secure payment')} by DOKU
      </p>
    </div>
    </>
  );
};

export default BookingPending;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Calendar, CreditCard, Ticket } from 'lucide-react';
import { useLangNavigate } from '../src/hooks/useLangNavigate';

const BookingSuccess: React.FC = () => {
  const { t } = useTranslation();
  const { langNavigate } = useLangNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const orderId     = searchParams.get('order_id')            || location.state?.orderId            || '-';
  const totalAmount = location.state?.bookingData?.totalPrice || location.state?.totalAmount        || 0;
  const productName = location.state?.bookingData?.productName || location.state?.productName       || '-';
  const date        = location.state?.bookingData?.date        || location.state?.date              || new Date().toISOString().split('T')[0];

  const formatAmount = (amount: number) =>
    amount > 0 ? `Rp ${amount.toLocaleString('id-ID')}` : '-';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 pb-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">

        {/* Icon */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
              <CheckCircle className="w-20 h-20 text-green-500 relative" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('booking.success_title', 'Booking Successful!')}
          </h1>
          <p className="text-gray-500 text-sm">
            {t('booking.success_desc', 'Your e-voucher is being processed and will be sent to your email shortly.')}
          </p>
        </div>

        {/* Ringkasan */}
        <div className="bg-gray-50 px-8 py-6 space-y-4 border-y border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">{t('booking.order_id', 'Order ID')}</span>
            <span className="font-mono font-bold text-gray-700">{orderId}</span>
          </div>
          {totalAmount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{t('booking.total_paid', 'Total Paid')}</span>
              <span className="font-bold text-blue-600">{formatAmount(totalAmount)}</span>
            </div>
          )}
          {productName !== '-' && (
            <>
              <hr className="border-gray-200 border-dashed" />
              <div className="flex gap-3 items-center text-xs text-gray-600">
                <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 line-clamp-1">{productName}</p>
                  <p>{new Date(date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-8 space-y-3">
          <button
            onClick={() => langNavigate('/my-bookings')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <Ticket className="w-5 h-5" />
            {t('booking.view_bookings', 'View My Bookings')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => langNavigate('/')}
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl font-semibold transition-all active:scale-[0.98]"
          >
            {t('booking.back_home', 'Back to Home')}
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        {t('common.secure_payment', 'Secure payment')} by DOKU
      </p>
    </div>
  );
};

export default BookingSuccess;

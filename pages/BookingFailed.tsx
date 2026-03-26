import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCcw, Home, AlertCircle, HelpCircle, CreditCard } from 'lucide-react';
import { useLangNavigate } from '@/src/hooks/useLangNavigate';

const BookingFailed: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { langNavigate } = useLangNavigate();

  const orderId      = searchParams.get('order_id')    || location.state?.orderId || '-';
  const statusCode   = searchParams.get('status_code') || '-';
  const errorMessage = location.state?.result?.status_message
    || t('booking.failed_desc', 'Payment was cancelled or the transaction time has expired.');

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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('booking.failed_title', 'Payment Failed')}
          </h1>
          <p className="text-gray-500 text-sm">{errorMessage}</p>
          {orderId !== '-' && (
            <p className="text-xs text-gray-400 mt-2 font-mono">ID: {orderId}</p>
          )}
          {statusCode !== '-' && (
            <p className="text-xs text-gray-400">{t('booking.status_code', 'Code')}: {statusCode}</p>
          )}
        </div>

        {/* Info */}
        <div className="bg-orange-50 px-8 py-6 space-y-3 border-y border-orange-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-bold">{t('booking.what_to_do', 'What should I do?')}</p>
              <ul className="list-disc list-inside mt-1 opacity-80 space-y-1">
                <li>{t('booking.check_balance', 'Check your balance or card limit')}</li>
                <li>{t('booking.stable_connection', 'Ensure stable internet connection')}</li>
                <li>{t('booking.try_other_payment', 'Try another payment method')}</li>
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
            {t('booking.try_again', 'Try Again')}
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
  );
};

export default BookingFailed;

import { CreditCard, ChevronRight, ShieldCheck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../constants';

// ── Pay CTA button ────────────────────────────────────────────────────────────
interface PayButtonProps {
  loading:         boolean;
  disabled?:       boolean;
  appliedDiscount: number;
  onClick:         () => void;
}

export const PayButton: React.FC<PayButtonProps> = ({ loading, disabled = false, appliedDiscount, onClick }) => {
  const { t } = useTranslation();
  const isDisabled = loading || disabled;
  return (
    <div className="pt-2 pb-6">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-primary-600 active:scale-95'}`}
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {t('pay_button.proceed')}
            {appliedDiscount > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {t('pay_button.save_discount', { amount: formatCurrency(appliedDiscount) })}
              </span>
            )}
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>
      <p className="text-center text-xs text-gray-400 mt-3">
        {t('pay_button.terms_note')}
      </p>
    </div>
  );
};

// ── Rental info banner ────────────────────────────────────────────────────────
export const RentalInfoBanner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
      <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4" /> {t('pay_button.rental_info_title')}
      </h3>
      <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
        <li>{t('pay_button.rental_info_1')}</li>
        <li>{t('pay_button.rental_info_2')}</li>
        <li>{t('pay_button.rental_info_3')}</li>
        <li>{t('pay_button.rental_info_4')}</li>
      </ul>
    </div>
  );
};

import { Tag } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ADMIN_FEE, formatCurrency } from '../constants';

interface Props {
  isCarBooking:     boolean;
  basePricePerPax:  number;
  pricePerPax:      number;
  duration:         number;
  guestCount?:      number;
  pax:              number;
  unitLabel:        string;
  priceUnitLabel:   string;
  baseTotal:        number;
  appliedVoucher:   any | null;
  appliedDiscount:  number;
  finalTotal:       number;
  addOns?:          { withDriver?: boolean; premiumInsurance?: boolean; childSeat?: boolean };
}

export const PriceSummary: React.FC<Props> = ({
  isCarBooking, basePricePerPax, pricePerPax, duration,
  guestCount, pax, unitLabel, priceUnitLabel, baseTotal,
  appliedVoucher, appliedDiscount, finalTotal, addOns,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">Rincian Harga</h3>
      <div className="space-y-3">

        {/* Base price */}
        {isCarBooking ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>{formatCurrency(basePricePerPax || pricePerPax)} / hari × {duration} hari</span>
              <span>{formatCurrency((basePricePerPax || pricePerPax) * duration)}</span>
            </div>
            {addOns?.withDriver       && <div className="flex justify-between text-gray-500 text-xs pl-2"><span>↳ Sopir × {duration} hari</span><span>+ {formatCurrency(150000 * duration)}</span></div>}
            {addOns?.premiumInsurance && <div className="flex justify-between text-gray-500 text-xs pl-2"><span>↳ Premium Insurance × {duration} hari</span><span>+ {formatCurrency(75000 * duration)}</span></div>}
            {addOns?.childSeat        && <div className="flex justify-between text-gray-500 text-xs pl-2"><span>↳ Child Seat × {duration} hari</span><span>+ {formatCurrency(50000 * duration)}</span></div>}
          </div>
        ) : (
          <div className="flex justify-between text-gray-600 text-sm">
            <span>
              {formatCurrency(pricePerPax)} / {priceUnitLabel} × {guestCount ?? pax} {unitLabel}
              {duration > 1 && ` × ${duration} ${priceUnitLabel}`}
            </span>
            <span>{formatCurrency(baseTotal)}</span>
          </div>
        )}

        {/* Voucher discount */}
        {appliedVoucher && appliedDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-semibold">
            <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Voucher ({appliedVoucher.code})</span>
            <span>− {formatCurrency(appliedDiscount)}</span>
          </div>
        )}

        {/* Admin fee */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>Biaya Admin</span><span>+ {formatCurrency(ADMIN_FEE)}</span>
        </div>

        <hr className="border-dashed border-gray-200" />

        {/* Crossed subtotal */}
        {appliedDiscount > 0 && (
          <div className="flex justify-between text-gray-400 text-sm line-through">
            <span>Subtotal</span><span>{formatCurrency(baseTotal + ADMIN_FEE)}</span>
          </div>
        )}

        {/* Final total */}
        <div className="flex justify-between items-center pt-1">
          <span className="text-base font-bold text-gray-800">Total Pembayaran</span>
          <div className="text-right">
            <span className="text-lg font-bold text-primary-600">{formatCurrency(finalTotal)}</span>
            {appliedDiscount > 0 && <p className="text-xs text-green-600 font-semibold mt-0.5">Hemat {formatCurrency(appliedDiscount)}!</p>}
          </div>
        </div>

      </div>
    </div>
  );
};
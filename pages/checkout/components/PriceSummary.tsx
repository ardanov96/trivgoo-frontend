// frontend-trivgoo/pages/checkout/components/PriceSummary.tsx

import { Shield, Tag, User } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ADMIN_FEE, formatCurrency } from '../constants';
import { AppliedVoucher, calcSingleDiscount } from '../hooks/useVoucher';

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
  appliedVoucher:       AppliedVoucher | null; // voucher admin (platform)
  appliedAgentVoucher?: AppliedVoucher | null; // voucher agent (eksklusif)
  appliedDiscount:  number;                    // total diskon keduanya
  finalTotal:       number;
  addOns?:          { withDriver?: boolean; premiumInsurance?: boolean; childSeat?: boolean };
  pickupFee?:       number;
  dropoffFee?:      number;
  needsManualPickupConfirmation?:  boolean;
  needsManualDropoffConfirmation?: boolean;
}

export const PriceSummary: React.FC<Props> = ({
  isCarBooking, basePricePerPax, pricePerPax, duration,
  guestCount, pax, unitLabel, priceUnitLabel, baseTotal,
  appliedVoucher, appliedAgentVoucher, appliedDiscount, finalTotal, addOns,
  pickupFee, dropoffFee,
  needsManualPickupConfirmation,
  needsManualDropoffConfirmation,
}) => {
  const { t } = useTranslation();

  // Hitung diskon per voucher untuk ditampilkan terpisah
  const adminDisc = appliedVoucher
    ? calcSingleDiscount(appliedVoucher, baseTotal)
    : 0;
  const afterAdmin = Math.max(0, baseTotal - adminDisc);
  const agentDisc  = appliedAgentVoucher
    ? calcSingleDiscount(appliedAgentVoucher, afterAdmin)
    : 0;

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

        {/* Delivery fees — pickup */}
        {(pickupFee ?? 0) > 0 && (
          <div className="flex justify-between text-gray-500 text-xs pl-2">
            <span>↳ Biaya Penjemputan</span>
            <span>+ {formatCurrency(pickupFee!)}</span>
          </div>
        )}
        {needsManualPickupConfirmation && (
          <div className="flex justify-between text-amber-600 text-xs pl-2 font-semibold">
            <span>↳ Biaya Penjemputan (Luar Zona)</span>
            <span>Menunggu Agen</span>
          </div>
        )}

        {/* Delivery fees — dropoff */}
        {(dropoffFee ?? 0) > 0 && (
          <div className="flex justify-between text-gray-500 text-xs pl-2">
            <span>↳ Biaya Pengembalian</span>
            <span>+ {formatCurrency(dropoffFee!)}</span>
          </div>
        )}
        {needsManualDropoffConfirmation && (
          <div className="flex justify-between text-amber-600 text-xs pl-2 font-semibold">
            <span>↳ Biaya Pengembalian (Luar Zona)</span>
            <span>Menunggu Agen</span>
          </div>
        )}

        {/* ── Voucher admin (platform) ── */}
        {appliedVoucher && adminDisc > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-semibold">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <Tag className="w-3 h-3" />
              {appliedVoucher.code}
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                Platform
              </span>
            </span>
            <span>− {formatCurrency(adminDisc)}</span>
          </div>
        )}

        {/* ── Voucher agent (eksklusif) ── */}
        {appliedAgentVoucher && agentDisc > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-semibold">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-500" />
              <Tag className="w-3 h-3" />
              {appliedAgentVoucher.code}
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                Agen
              </span>
            </span>
            <span>− {formatCurrency(agentDisc)}</span>
          </div>
        )}

        {/* Admin fee */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>Biaya Admin</span>
          <span>+ {formatCurrency(ADMIN_FEE)}</span>
        </div>

        <hr className="border-dashed border-gray-200" />

        {/* Crossed subtotal jika ada diskon */}
        {appliedDiscount > 0 && (
          <div className="flex justify-between text-gray-400 text-sm line-through">
            <span>Subtotal</span>
            <span>{formatCurrency(baseTotal + ADMIN_FEE)}</span>
          </div>
        )}

        {/* Final total */}
        <div className="flex justify-between items-center pt-1">
          <span className="text-base font-bold text-gray-800">Total Pembayaran</span>
          <div className="text-right">
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(finalTotal)}
            </span>
            {appliedDiscount > 0 && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">
                Hemat {formatCurrency(appliedDiscount)}!
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
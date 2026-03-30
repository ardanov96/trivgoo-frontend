// frontend-trivgoo/pages/checkout/components/VoucherPicker.tsx
// Multi-voucher: tampilkan voucher admin & agent, bisa pilih keduanya sekaligus

import {
  CheckCircle2, ChevronDown, ChevronUp, DollarSign,
  Percent, Shield, Tag, User, X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { calcDiscount, formatRp } from '../constants';
import { AppliedVoucherPair, calcSingleDiscount } from '../hooks/useVoucher';

interface Props {
  availableVouchers: any[];
  amount:            number;
  appliedPair:       AppliedVoucherPair;
  onApply:           (voucher: any) => void;
  onRemove:          (owner: 'admin' | 'agent') => void;
}

export const VoucherPicker: React.FC<Props> = ({
  availableVouchers,
  amount,
  appliedPair,
  onApply,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const now = new Date();

  // Pisahkan berdasarkan scope_owner
  const adminVouchers = useMemo(() =>
    availableVouchers.filter(v =>
      (v.scope_owner === 'admin' || !v.scope_owner) &&
      v.is_active &&
      (!v.expires_at || new Date(v.expires_at) >= now) &&
      (v.max_usage == null || v.used_count < v.max_usage)
    ), [availableVouchers]);

  const agentVouchers = useMemo(() =>
    availableVouchers.filter(v =>
      v.scope_owner === 'agent' &&
      v.is_active &&
      (!v.expires_at || new Date(v.expires_at) >= now) &&
      (v.max_usage == null || v.used_count < v.max_usage)
    ), [availableVouchers]);

  const hasAny = adminVouchers.length > 0 || agentVouchers.length > 0;
  const hasApplied = appliedPair.admin || appliedPair.agent;

  if (!hasAny && !hasApplied) return null;

  const handleSelect = (v: any) => {
    if (Number(amount) < Number(v.min_transaction)) return;
    onApply(v);
  };

  const VoucherRow = ({ v, appliedOwner }: { v: any; appliedOwner: 'admin' | 'agent' }) => {
    const eligible = Number(amount) >= Number(v.min_transaction);
    const isApplied = appliedPair[appliedOwner]?.id === v.id;
    const discount = eligible ? calcSingleDiscount(v, amount) : 0;

    return (
      <button
        key={v.id}
        type="button"
        onClick={() => eligible && handleSelect(v)}
        disabled={!eligible}
        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all
          ${isApplied
            ? 'border-green-400 bg-green-50'
            : eligible
              ? 'border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50 cursor-pointer active:scale-[0.98]'
              : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
          }`}
      >
        {/* Icon tipe */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          ${v.type === 'percent' ? 'bg-blue-100' : 'bg-green-100'}`}>
          {v.type === 'percent'
            ? <Percent className="w-4 h-4 text-blue-600" />
            : <DollarSign className="w-4 h-4 text-green-600" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-extrabold text-sm text-gray-900 font-mono tracking-widest">{v.code}</p>
            {/* Badge owner */}
            {appliedOwner === 'agent' ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                <User className="w-2.5 h-2.5" /> Agen
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                <Shield className="w-2.5 h-2.5" /> Platform
              </span>
            )}
          </div>
          {v.description && <p className="text-xs text-gray-500 truncate mt-0.5">{v.description}</p>}
          {v.expires_at && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              Berlaku s/d {new Date(v.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
          {!eligible && (
            <p className="text-[10px] text-red-400 font-semibold mt-0.5">
              Min. transaksi {formatRp(v.min_transaction)}
            </p>
          )}
        </div>

        {/* Nilai diskon */}
        <div className="text-right shrink-0">
          <span className={`text-sm font-extrabold ${v.type === 'percent' ? 'text-blue-600' : 'text-green-600'}`}>
            {v.type === 'percent' ? `${v.value}% OFF` : `${formatRp(v.value)} OFF`}
          </span>
          {v.type === 'percent' && v.max_discount && (
            <p className="text-[10px] text-gray-400">maks. {formatRp(v.max_discount)}</p>
          )}
          {eligible && discount > 0 && (
            <p className="text-[10px] text-green-500 font-semibold mt-0.5">
              Hemat {formatRp(discount)}
            </p>
          )}
        </div>

        {/* Checkmark jika applied */}
        {isApplied && (
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-1" />
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
          <Tag className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">Voucher & Promo</h3>
        {/* Badge jumlah tersedia */}
        {!hasApplied && hasAny && (
          <span className="ml-auto text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            {adminVouchers.length + agentVouchers.length} tersedia
          </span>
        )}
        {/* Hint multi-voucher */}
        {hasAny && (
          <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
            Bisa 2 voucher sekaligus
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">

        {/* ── Applied badges ── */}
        {(appliedPair.admin || appliedPair.agent) && (
          <div className="space-y-2">
            {/* Admin voucher applied */}
            {appliedPair.admin && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
                <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-green-800 text-sm font-mono tracking-widest">
                    {appliedPair.admin.code}
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-600 mr-1">[Platform]</span>
                    Hemat {formatRp(calcSingleDiscount(appliedPair.admin, amount))}
                    {appliedPair.admin.type === 'percent' && ` (${appliedPair.admin.value}%)`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove('admin')}
                  className="w-7 h-7 rounded-full bg-blue-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Agent voucher applied */}
            {appliedPair.agent && (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
                <User className="w-4 h-4 text-orange-500 shrink-0" />
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-green-800 text-sm font-mono tracking-widest">
                    {appliedPair.agent.code}
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    <span className="text-[10px] font-bold text-orange-600 mr-1">[Agen]</span>
                    Hemat {formatRp(calcSingleDiscount(
                      appliedPair.agent,
                      Math.max(0, amount - (appliedPair.admin ? calcSingleDiscount(appliedPair.admin, amount) : 0))
                    ))}
                    {appliedPair.agent.type === 'percent' && ` (${appliedPair.agent.value}%)`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove('agent')}
                  className="w-7 h-7 rounded-full bg-orange-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Total saving badge */}
            {appliedPair.admin && appliedPair.agent && (
              <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-xs font-extrabold text-green-700">
                  Total hemat:{' '}
                  {formatRp(
                    calcSingleDiscount(appliedPair.admin, amount) +
                    calcSingleDiscount(
                      appliedPair.agent,
                      Math.max(0, amount - calcSingleDiscount(appliedPair.admin, amount))
                    )
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Toggle button (tampilkan list) ── */}
        {hasAny && (
          <button
            type="button"
            onClick={() => setOpen(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 transition-all text-left"
          >
            <span className="text-sm font-semibold text-orange-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {hasApplied ? 'Ganti / Tambah voucher lain' : 'Pilih voucher promo'}
            </span>
            {open
              ? <ChevronUp className="w-4 h-4 text-orange-500" />
              : <ChevronDown className="w-4 h-4 text-orange-500" />
            }
          </button>
        )}

        {/* ── Dropdown list ── */}
        {open && (
          <div className="space-y-4">
            {/* Admin vouchers */}
            {adminVouchers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Voucher Platform
                  </p>
                  <span className="text-[10px] text-gray-400">· berlaku semua produk</span>
                </div>
                <div className="space-y-2">
                  {adminVouchers.map(v => (
                    <VoucherRow key={v.id} v={v} appliedOwner="admin" />
                  ))}
                </div>
              </div>
            )}

            {/* Agent vouchers */}
            {agentVouchers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                    Voucher Eksklusif Agen
                  </p>
                  <span className="text-[10px] text-gray-400">· khusus produk ini</span>
                </div>
                <div className="space-y-2">
                  {agentVouchers.map(v => (
                    <VoucherRow key={v.id} v={v} appliedOwner="agent" />
                  ))}
                </div>
              </div>
            )}

            {/* Info multi-voucher */}
            <div className="bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-100">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                💡 Anda bisa menggunakan <strong>1 voucher platform</strong> dan{' '}
                <strong>1 voucher agen</strong> sekaligus. Diskon dihitung bertahap
                untuk hasil maksimal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

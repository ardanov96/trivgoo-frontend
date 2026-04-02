// frontend-trivgoo/pages/checkout/components/VoucherPicker.tsx

import {
  CheckCircle2, ChevronDown, ChevronUp, DollarSign,
  Percent, Shield, Tag, User, X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatRp } from '../constants';
import { AppliedVoucherPair, calcSingleDiscount } from '../hooks/useVoucher';

interface Props {
  availableVouchers: any[];
  amount:            number;
  appliedPair:       AppliedVoucherPair;
  onApply:           (voucher: any) => void;
  onRemove:          (owner: 'admin' | 'agent') => void;
  ownerFilter:       'admin' | 'agent';
}

export const VoucherPicker: React.FC<Props> = ({
  availableVouchers,
  amount,
  appliedPair,
  onApply,
  onRemove,
  ownerFilter,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const now = new Date();

  const isAgent = ownerFilter === 'agent';

  // Filter vouchers by ownerFilter
  const visibleVouchers = useMemo(() =>
    availableVouchers.filter(v => {
      const ownerVal = v.scope_owner ?? v.owner;
      const matchOwner = isAgent
        ? ownerVal === 'agent'
        : (ownerVal === 'admin' || ownerVal == null);
      return (
        matchOwner &&
        v.is_active !== false &&
        (!v.expires_at || new Date(v.expires_at) >= now) &&
        (v.max_usage == null || v.used_count < v.max_usage)
      );
    }),
    [availableVouchers, ownerFilter]
  );

  const appliedVoucher = appliedPair[ownerFilter];
  const hasAny         = visibleVouchers.length > 0;
  const hasApplied     = Boolean(appliedVoucher);

  if (!hasAny && !hasApplied) return null;

  const handleSelect = (v: any) => {
    if (Number(amount) < Number(v.min_transaction)) return;
    onApply(v);
  };

  // ── Theme per owner — only non-translatable visual tokens here ───────────
  const theme = isAgent
    ? {
        headerIconBg:  'bg-orange-100',
        headerIcon:    <User className="w-4 h-4 text-orange-600" />,
        countBadge:    'text-orange-600 bg-orange-50 border-orange-200',
        appliedBg:     'bg-orange-50 border-orange-200',
        appliedIcon:   <User className="w-4 h-4 text-orange-500 shrink-0" />,
        removeBg:      'bg-orange-200',
        toggleBorder:  'border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100',
        toggleText:    'text-orange-700',
        toggleChevron: 'text-orange-500',
        rowBorder:     'border-orange-200 hover:border-orange-400 hover:bg-orange-50',
        badge: (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
            <User className="w-2.5 h-2.5" /> {t('voucher_picker.badge_agent')}
          </span>
        ),
      }
    : {
        headerIconBg:  'bg-blue-100',
        headerIcon:    <Shield className="w-4 h-4 text-blue-600" />,
        countBadge:    'text-blue-600 bg-blue-50 border-blue-200',
        appliedBg:     'bg-blue-50 border-blue-200',
        appliedIcon:   <Shield className="w-4 h-4 text-blue-500 shrink-0" />,
        removeBg:      'bg-blue-200',
        toggleBorder:  'border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100',
        toggleText:    'text-blue-700',
        toggleChevron: 'text-blue-500',
        rowBorder:     'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
        badge: (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
            <Shield className="w-2.5 h-2.5" /> {t('voucher_picker.badge_platform')}
          </span>
        ),
      };

  // Translated strings that depend on isAgent — resolved after t() is in scope
  const titleText   = isAgent ? t('voucher_picker.title_agent')    : t('voucher_picker.title_platform');
  const subText     = isAgent ? t('voucher_picker.sub_agent')      : t('voucher_picker.sub_platform');
  const toggleLabel = hasApplied
    ? t('voucher_picker.toggle_change', { title: titleText.toLowerCase() })
    : t('voucher_picker.toggle_pick',   { title: titleText.toLowerCase() });

  // ── VoucherRow ────────────────────────────────────────────────────────────
  const VoucherRow = ({ v }: { v: any }) => {
    const eligible  = Number(amount) >= Number(v.min_transaction);
    const isApplied = appliedVoucher?.id === v.id;
    const discount  = eligible ? calcSingleDiscount(v, amount) : 0;

    return (
      <button
        type="button"
        onClick={() => eligible && handleSelect(v)}
        disabled={!eligible}
        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all
          ${isApplied
            ? 'border-green-400 bg-green-50'
            : eligible
              ? `bg-white cursor-pointer active:scale-[0.98] ${theme.rowBorder}`
              : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
          }`}
      >
        {/* Discount type icon */}
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
            <p className="font-extrabold text-sm text-gray-900 font-mono tracking-widest">
              {v.code}
            </p>
            {theme.badge}
          </div>
          {v.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{v.description}</p>
          )}
          {v.expires_at && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              {t('voucher_picker.valid_until')}{' '}
              {new Date(v.expires_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          )}
          {!eligible && (
            <p className="text-[10px] text-red-400 font-semibold mt-0.5">
              {t('voucher_picker.min_transaction', { amount: formatRp(v.min_transaction) })}
            </p>
          )}
        </div>

        {/* Discount value */}
        <div className="text-right shrink-0">
          <span className={`text-sm font-extrabold
            ${v.type === 'percent' ? 'text-blue-600' : 'text-green-600'}`}>
            {v.type === 'percent'
              ? t('voucher_picker.off_percent', { value: v.value })
              : t('voucher_picker.off_amount',  { value: formatRp(v.value) })
            }
          </span>
          {v.type === 'percent' && v.max_discount && (
            <p className="text-[10px] text-gray-400">
              {t('voucher_picker.max_discount', { amount: formatRp(v.max_discount) })}
            </p>
          )}
          {eligible && discount > 0 && (
            <p className="text-[10px] text-green-500 font-semibold mt-0.5">
              {t('voucher_picker.save', { amount: formatRp(discount) })}
            </p>
          )}
        </div>

        {isApplied && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-1" />}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Header ── */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className={`w-7 h-7 ${theme.headerIconBg} rounded-lg flex items-center justify-center`}>
          {theme.headerIcon}
        </div>
        <h3 className="font-bold text-gray-800 text-sm">{titleText}</h3>
        {hasAny && !hasApplied && (
          <span className={`ml-auto text-[11px] font-bold border px-2 py-0.5 rounded-full ${theme.countBadge}`}>
            {t('voucher_picker.available_count', { count: visibleVouchers.length })}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">

        {/* ── Applied badge ── */}
        {hasApplied && appliedVoucher && (
          <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 ${theme.appliedBg}`}>
            {theme.appliedIcon}
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-green-800 text-sm font-mono tracking-widest">
                {appliedVoucher.code}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                {t('voucher_picker.applied_save', {
                  amount: formatRp(calcSingleDiscount(appliedVoucher, amount)),
                })}
                {appliedVoucher.type === 'percent' && ` (${appliedVoucher.value}%)`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(ownerFilter)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0
                ${theme.removeBg} hover:bg-red-100 hover:text-red-600`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Toggle button ── */}
        {hasAny && (
          <button
            type="button"
            onClick={() => setOpen(p => !p)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed transition-all text-left ${theme.toggleBorder}`}
          >
            <span className={`text-sm font-semibold flex items-center gap-2 ${theme.toggleText}`}>
              <Tag className="w-4 h-4" />
              {toggleLabel}
            </span>
            {open
              ? <ChevronUp   className={`w-4 h-4 ${theme.toggleChevron}`} />
              : <ChevronDown className={`w-4 h-4 ${theme.toggleChevron}`} />
            }
          </button>
        )}

        {/* ── Dropdown list ── */}
        {open && (
          <div className="space-y-2">
            {visibleVouchers.map(v => (
              <VoucherRow key={v.id} v={v} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

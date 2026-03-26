import { CheckCircle2, ChevronDown, ChevronUp, DollarSign, Percent, Tag, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { calcDiscount, formatRp } from '../constants';

interface Props {
  availableVouchers: any[];
  amount:            number;
  appliedVoucher:    any | null;
  onApply:           (voucher: any, discount: number) => void;
  onRemove:          () => void;
}

export const VoucherPicker: React.FC<Props> = ({ availableVouchers, amount, appliedVoucher, onApply, onRemove }) => {
  const [open, setOpen] = useState(false);
  const now = new Date();

  const activeVouchers = useMemo(() =>
    availableVouchers.filter((v) =>
      v.is_active &&
      (!v.expires_at || new Date(v.expires_at) >= now) &&
      (v.max_usage == null || v.used_count < v.max_usage)
    ),
    [availableVouchers]
  );

  if (activeVouchers.length === 0 && !appliedVoucher) return null;

  const handleSelect = (v: any) => {
    if (Number(amount) < Number(v.min_transaction)) return;
    onApply(v, calcDiscount(v, amount));
    setOpen(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
    setOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
          <Tag className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">Voucher & Promo</h3>
        {activeVouchers.length > 0 && !appliedVoucher && (
          <span className="ml-auto text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            {activeVouchers.length} tersedia
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Applied state */}
        {appliedVoucher ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-green-800 text-sm font-mono tracking-widest">{appliedVoucher.code}</p>
              <p className="text-xs text-green-600 mt-0.5">
                Hemat {formatRp(calcDiscount(appliedVoucher, amount))}
                {appliedVoucher.type === 'percent' && ` (${appliedVoucher.value}%)`}
              </p>
            </div>
            <button type="button" onClick={handleRemove} className="w-7 h-7 rounded-full bg-green-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors shrink-0" title="Hapus voucher">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Toggle button */
          <button type="button" onClick={() => setOpen((p) => !p)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 transition-all text-left">
            <span className="text-sm font-semibold text-orange-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />Pilih voucher promo
            </span>
            {open ? <ChevronUp className="w-4 h-4 text-orange-500" /> : <ChevronDown className="w-4 h-4 text-orange-500" />}
          </button>
        )}

        {/* Dropdown list */}
        {open && !appliedVoucher && activeVouchers.length > 0 && (
          <div className="mt-3 space-y-2">
            {activeVouchers.map((v: any) => {
              const eligible = Number(amount) >= Number(v.min_transaction);
              const discount = eligible ? calcDiscount(v, amount) : 0;
              return (
                <button key={v.id} type="button" onClick={() => eligible && handleSelect(v)} disabled={!eligible}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all ${eligible ? 'border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50 cursor-pointer active:scale-[0.98]' : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${v.type === 'percent' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {v.type === 'percent' ? <Percent className="w-4 h-4 text-blue-600" /> : <DollarSign className="w-4 h-4 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-gray-900 font-mono tracking-widest">{v.code}</p>
                    {v.description && <p className="text-xs text-gray-500 truncate mt-0.5">{v.description}</p>}
                    {v.expires_at && <p className="text-[10px] text-gray-400 mt-0.5">Berlaku s/d {new Date(v.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                    {!eligible && <p className="text-[10px] text-red-400 font-semibold mt-0.5">Min. transaksi {formatRp(v.min_transaction)}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-extrabold ${v.type === 'percent' ? 'text-blue-600' : 'text-green-600'}`}>
                      {v.type === 'percent' ? `${v.value}% OFF` : `${formatRp(v.value)} OFF`}
                    </span>
                    {v.type === 'percent' && v.max_discount && <p className="text-[10px] text-gray-400">maks. {formatRp(v.max_discount)}</p>}
                    {eligible && discount > 0 && <p className="text-[10px] text-green-500 font-semibold mt-0.5">Hemat {formatRp(discount)}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import { DollarSign, Percent } from 'lucide-react';
import { formatRp } from '../utils';

// ── Voucher pill list ─────────────────────────────────────────────────────────

interface VoucherPillListProps { vouchers: any[]; max?: number; }

export const VoucherPillList = ({ vouchers, max = 2 }: VoucherPillListProps) => {
  if (!vouchers.length) return null;
  const shown = vouchers.slice(0, max);
  const rest  = vouchers.length - max;
  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
      {shown.map((v: any) => (
        <span key={v.id} className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">
          {v.type === 'percent' ? <Percent className="w-2.5 h-2.5" /> : <DollarSign className="w-2.5 h-2.5" />}
          {v.type === 'percent' ? `${v.value}% OFF` : `${formatRp(v.value)} OFF`}
        </span>
      ))}
      {rest > 0 && <span className="text-[10px] text-orange-500 font-bold">+{rest} lagi</span>}
    </div>
  );
};

// ── Skeleton card ─────────────────────────────────────────────────────────────

export const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-6 flex-1 flex flex-col space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-50">
        <div><div className="h-3 bg-gray-200 rounded w-10 mb-1" /><div className="h-6 bg-gray-200 rounded w-24" /></div>
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonCarCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="md:flex">
      <div className="md:w-1/3 h-48 md:h-auto bg-gray-200" />
      <div className="md:w-2/3 p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, j) => <div key={j} className="h-16 bg-gray-200 rounded" />)}</div>
      </div>
    </div>
  </div>
);

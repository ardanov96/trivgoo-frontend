import { CreditCard, ChevronRight, ShieldCheck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../constants';

// ── Pay CTA button ────────────────────────────────────────────────────────────
interface PayButtonProps {
  loading:         boolean;
  appliedDiscount: number;
  onClick:         () => void;
}

export const PayButton: React.FC<PayButtonProps> = ({ loading, appliedDiscount, onClick }) => (
  <div className="pt-2 pb-6">
    <button onClick={onClick} disabled={loading}
      className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-primary-600 active:scale-95'}`}>
      {loading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Lanjut ke Pembayaran
          {appliedDiscount > 0 && (
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              Hemat {formatCurrency(appliedDiscount)}
            </span>
          )}
          <ChevronRight className="w-5 h-5" />
        </>
      )}
    </button>
    <p className="text-center text-xs text-gray-400 mt-3">
      Dengan mengklik tombol di atas, Anda menyetujui Syarat & Ketentuan yang berlaku.
    </p>
  </div>
);

// ── Rental info banner ────────────────────────────────────────────────────────
export const RentalInfoBanner: React.FC = () => (
  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
    <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
      <ShieldCheck className="w-4 h-4" /> Informasi Penting
    </h3>
    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
      <li>Harap bawa SIM asli dan KTP saat pengambilan mobil</li>
      <li>Deposit dikembalikan saat mobil dikembalikan dalam kondisi baik</li>
      <li>Bahan bakar tidak termasuk dalam harga sewa</li>
      <li>Pengembalian terlambat dikenakan biaya tambahan</li>
    </ul>
  </div>
);

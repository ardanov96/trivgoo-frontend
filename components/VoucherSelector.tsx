// src/components/VoucherSelector.tsx
// Embed komponen ini di dalam AddProduct.tsx untuk memilih voucher per-product.

import React, { useEffect, useState, useCallback } from "react";
import { Tag, X, Check, Search, Percent, DollarSign, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { voucherService, Voucher } from "../services/voucherService";

interface VoucherSelectorProps {
  /** ID voucher yang sudah dipilih (controlled) */
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

const VoucherBadge: React.FC<{ voucher: Voucher; onRemove: () => void }> = ({ voucher, onRemove }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-xl text-xs font-bold text-primary-700 group">
    {voucher.type === "percent" ? (
      <Percent className="w-3 h-3 shrink-0" />
    ) : (
      <DollarSign className="w-3 h-3 shrink-0" />
    )}
    <span className="max-w-[140px] truncate">{voucher.code}</span>
    <span className="text-primary-400 font-normal">
      {voucher.type === "percent" ? `${voucher.value}%` : formatRp(voucher.value)}
    </span>
    <button
      type="button"
      onClick={onRemove}
      className="ml-1 text-primary-300 hover:text-red-500 transition-colors"
      title="Hapus voucher"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

const VoucherSelector: React.FC<VoucherSelectorProps> = ({ selectedIds, onChange }) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Load voucher aktif saat panel dibuka pertama kali
  useEffect(() => {
    if (!isOpen || vouchers.length > 0) return;
    setIsLoading(true);
    setError(null);
    voucherService
      .getActive()
      .then(setVouchers)
      .catch(() => setError("Gagal memuat daftar voucher."))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const selectedVouchers = vouchers.filter((v) => selectedIds.includes(v.id));

  const filteredVouchers = vouchers.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.code.toLowerCase().includes(q) ||
      (v.description ?? "").toLowerCase().includes(q)
    );
  });

  const toggle = useCallback(
    (id: number) => {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((x) => x !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    },
    [selectedIds, onChange]
  );

  const isExpired = (v: Voucher) =>
    v.expires_at ? new Date(v.expires_at) < new Date() : false;

  return (
    <div className="space-y-3">
      {/* Tombol buka/tutup panel */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-primary-300 hover:shadow-sm transition-all text-sm font-bold text-gray-700 group"
      >
        <span className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary-500" />
          Pilih Voucher Promo
          {selectedIds.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-[10px] font-extrabold rounded-full">
              {selectedIds.length}
            </span>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
        )}
      </button>

      {/* Tampilkan badge voucher yang sudah dipilih (selalu terlihat) */}
      {selectedVouchers.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {selectedVouchers.map((v) => (
            <VoucherBadge key={v.id} voucher={v} onRemove={() => toggle(v.id)} />
          ))}
        </div>
      )}

      {/* Panel dropdown */}
      {isOpen && (
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white animate-in fade-in slide-in-from-top-2">
          {/* Search bar */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode atau deskripsi voucher..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {isLoading && (
              <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mr-2" />
                Memuat voucher...
              </div>
            )}

            {error && !isLoading && (
              <div className="flex items-center gap-2 p-4 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {!isLoading && !error && filteredVouchers.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">
                {search ? "Tidak ada voucher yang cocok." : "Belum ada voucher aktif."}
              </div>
            )}

            {!isLoading &&
              filteredVouchers.map((v) => {
                const isSelected = selectedIds.includes(v.id);
                const expired = isExpired(v);
                const full =
                  v.max_usage != null && v.used_count >= v.max_usage;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={expired || full}
                    onClick={() => toggle(v.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all
                      ${isSelected
                        ? "bg-primary-50 hover:bg-primary-100"
                        : "hover:bg-gray-50"
                      }
                      ${expired || full ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    {/* Checkbox visual */}
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                        ${isSelected
                          ? "bg-primary-600 border-primary-600"
                          : "border-gray-300"
                        }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-gray-900 font-mono tracking-wide">
                          {v.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.type === "percent"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {v.type === "percent"
                            ? `${v.value}% off`
                            : `${formatRp(v.value)} off`}
                        </span>
                        {v.max_discount != null && v.type === "percent" && (
                          <span className="text-[10px] text-gray-400">
                            maks. {formatRp(v.max_discount)}
                          </span>
                        )}
                        {expired && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                            Kadaluarsa
                          </span>
                        )}
                        {full && !expired && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">
                            Kuota habis
                          </span>
                        )}
                      </div>
                      {v.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{v.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400">
                          Min. transaksi: {formatRp(v.min_transaction)}
                        </span>
                        {v.expires_at && (
                          <span className="text-[10px] text-gray-400">
                            Berlaku s/d {new Date(v.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                        {v.max_usage != null && (
                          <span className="text-[10px] text-gray-400">
                            Sisa {Math.max(0, v.max_usage - v.used_count)}/{v.max_usage}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {selectedIds.length} voucher dipilih
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-primary-600 hover:underline"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherSelector;

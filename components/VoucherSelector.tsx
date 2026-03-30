// src/components/VoucherSelector.tsx
// List voucher dinamis sama seperti AgentVouchers.tsx — pakai agentVoucherService.list()

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Tag, X, Check, Search, Percent, DollarSign,
  ChevronDown, ChevronUp, AlertCircle, Plus,
  RefreshCw, ExternalLink, CheckCircle2, Calendar, Zap,
} from 'lucide-react';
import { agentVoucherService, Voucher, CreateVoucherPayload } from '../services/voucherService';
import { useLangNavigate } from '@/src/hooks/useLangNavigate';

interface VoucherSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

const VoucherBadge: React.FC<{ voucher: Voucher; onRemove: () => void }> = ({ voucher, onRemove }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl text-xs font-bold text-orange-700">
    {voucher.type === 'percent' ? <Percent className="w-3 h-3 shrink-0" /> : <DollarSign className="w-3 h-3 shrink-0" />}
    <span className="max-w-[120px] truncate font-mono tracking-wide">{voucher.code}</span>
    <span className="font-normal text-orange-400">
      {voucher.type === 'percent' ? `${voucher.value}%` : formatRp(voucher.value)}
    </span>
    <button type="button" onClick={onRemove} className="ml-1 text-gray-300 hover:text-red-500 transition-colors">
      <X className="w-3 h-3" />
    </button>
  </div>
);

interface QuickFormData {
  code: string; description: string; type: 'percent' | 'fixed';
  value: string; min_transaction: string; expires_at: string; max_usage: string;
}
const EMPTY_QUICK: QuickFormData = {
  code: '', description: '', type: 'percent',
  value: '', min_transaction: '', expires_at: '', max_usage: '',
};

const VoucherSelector: React.FC<VoucherSelectorProps> = ({ selectedIds, onChange }) => {
  const { langNavigate } = useLangNavigate();

  const [vouchers, setVouchers]         = useState<Voucher[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [isOpen, setIsOpen]             = useState(false);
  const [search, setSearch]             = useState('');
  const [showQuick, setShowQuick]       = useState(false);
  const [quickForm, setQuickForm]       = useState<QuickFormData>(EMPTY_QUICK);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickErrors, setQuickErrors]   = useState<Partial<QuickFormData>>({});
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null);

  const fetchingRef = useRef(false);

  // ── Fetch semua voucher agent — sama seperti AgentVouchers.tsx ────────────
  const loadVouchers = async (force = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      // Gunakan .list() bukan .getActive() agar konsisten dengan AgentVouchers page
      const data = await agentVoucherService.list();
      // list() return VoucherListResponse { vouchers, total, page, limit }
      // sama persis dengan yang dipakai AgentVouchers.tsx: listRes.vouchers || []
      setVouchers(data.vouchers ?? []);
    } catch {
      setError('Gagal memuat voucher. Coba refresh.');
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  // Load saat panel pertama kali dibuka
  useEffect(() => {
    // Load segera jika ada selectedIds (edit mode) atau saat panel dibuka
    if (selectedIds.length > 0 || isOpen) {
      if (vouchers.length === 0 && !isLoading) {
        loadVouchers();
      }
    }
  }, [isOpen, selectedIds.length]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedVouchers = vouchers.filter(v => selectedIds.includes(Number(v.id)));

  const filteredVouchers = vouchers.filter(v => {
    const q = search.toLowerCase();
    return v.code.toLowerCase().includes(q) || (v.description ?? '').toLowerCase().includes(q);
  });

  const toggle = useCallback((id: number) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(x => x !== id)
        : [...selectedIds, id]
    );
  }, [selectedIds, onChange]);

  const isExpired = (v: Voucher) =>
    v.expires_at ? new Date(v.expires_at) < new Date() : false;

  const isFull = (v: Voucher) =>
    v.max_usage != null && Number(v.used_count) >= Number(v.max_usage);

  // ── Quick Create ──────────────────────────────────────────────────────────
  const validateQuick = () => {
    const e: Partial<QuickFormData> = {};
    if (!quickForm.code.trim()) e.code = 'Wajib diisi';
    else if (!/^[A-Z0-9_-]+$/i.test(quickForm.code)) e.code = 'Hanya huruf, angka, - dan _';
    if (!quickForm.value || Number(quickForm.value) <= 0) e.value = 'Harus angka positif';
    else if (quickForm.type === 'percent' && Number(quickForm.value) > 100) e.value = 'Maks 100%';
    setQuickErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleQuickCreate = async () => {
    if (!validateQuick()) return;
    setQuickLoading(true);
    setQuickSuccess(null);
    try {
      const created = await agentVoucherService.create({
        code:            quickForm.code.toUpperCase().trim(),
        description:     quickForm.description || null,
        type:            quickForm.type,
        value:           Number(quickForm.value),
        min_transaction: quickForm.min_transaction ? Number(quickForm.min_transaction) : 0,
        max_usage:       quickForm.max_usage ? Number(quickForm.max_usage) : null,
        starts_at:       null,
        expires_at:      quickForm.expires_at || null,
        is_active:       1,
      } as CreateVoucherPayload);

      // Tambah ke list & langsung pilih
      setVouchers(prev => [created, ...prev]);
      onChange([...selectedIds, Number(created.id)]);
      setQuickSuccess(`Voucher "${created.code}" dibuat & dipilih!`);
      setQuickForm(EMPTY_QUICK);
      setQuickErrors({});
      setTimeout(() => { setShowQuick(false); setQuickSuccess(null); }, 1500);
    } catch (e: any) {
      setQuickErrors({ code: e?.response?.data?.message || 'Gagal membuat voucher' });
    } finally {
      setQuickLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* Toggle button */}
      <button type="button" onClick={() => setIsOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-orange-300 hover:shadow-sm transition-all text-sm font-bold text-gray-700 group">
        <span className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-orange-500" />
          Pilih Voucher Saya
          {selectedIds.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-[10px] font-extrabold rounded-full">
              {selectedIds.length}
            </span>
          )}
        </span>
        {isOpen
          ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
          : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
        }
      </button>

      {/* Badge voucher terpilih */}
      {selectedVouchers.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {selectedVouchers.map(v => (
            <VoucherBadge key={v.id} voucher={v} onRemove={() => toggle(Number(v.id))} />
          ))}
        </div>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">

          {/* Search + actions */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cari kode atau deskripsi..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {!showQuick && (
              <button type="button" onClick={() => setShowQuick(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shrink-0">
                <Plus className="w-3.5 h-3.5" /> Buat
              </button>
            )}
            <button type="button" onClick={() => loadVouchers(true)} title="Refresh"
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-white transition-all shrink-0">
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Quick Create */}
          {showQuick && (
            <div className="p-4 border-b border-orange-100 bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-orange-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Buat Voucher Cepat
                </p>
                <button type="button" onClick={() => { setShowQuick(false); setQuickErrors({}); setQuickForm(EMPTY_QUICK); }}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              {quickSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-xs font-semibold text-green-700">{quickSuccess}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kode *</label>
                    <input type="text" value={quickForm.code}
                      onChange={e => setQuickForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="PROMO10"
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold tracking-widest focus:outline-none
                        ${quickErrors.code ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:border-orange-400'}`} />
                    {quickErrors.code && (
                      <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{quickErrors.code}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tipe</label>
                    <select value={quickForm.type}
                      onChange={e => setQuickForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400">
                      <option value="percent">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nilai *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                        {quickForm.type === 'percent' ? '%' : 'Rp'}
                      </span>
                      <input type="number" value={quickForm.value}
                        onChange={e => setQuickForm(f => ({ ...f, value: e.target.value }))}
                        placeholder={quickForm.type === 'percent' ? '10' : '50000'}
                        className={`w-full pl-7 pr-2 py-2 rounded-lg border text-xs focus:outline-none
                          ${quickErrors.value ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:border-orange-400'}`} />
                    </div>
                    {quickErrors.value && <p className="text-red-500 text-[10px] mt-0.5">{quickErrors.value}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Min. Transaksi</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">Rp</span>
                      <input type="number" value={quickForm.min_transaction}
                        onChange={e => setQuickForm(f => ({ ...f, min_transaction: e.target.value }))}
                        placeholder="0"
                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Deskripsi</label>
                  <input type="text" value={quickForm.description}
                    onChange={e => setQuickForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Diskon spesial untuk produk ini..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Kedaluwarsa
                    </label>
                    <input type="datetime-local" value={quickForm.expires_at}
                      onChange={e => setQuickForm(f => ({ ...f, expires_at: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Max Penggunaan</label>
                    <input type="number" value={quickForm.max_usage}
                      onChange={e => setQuickForm(f => ({ ...f, max_usage: e.target.value }))}
                      placeholder="∞"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400" />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={handleQuickCreate} disabled={quickLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold disabled:opacity-60">
                    {quickLoading
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...</>
                      : <><CheckCircle2 className="w-3.5 h-3.5" /> Buat & Pilih</>
                    }
                  </button>
                  <button type="button" onClick={() => langNavigate('/agent/vouchers')}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-300 text-xs font-semibold">
                    <ExternalLink className="w-3.5 h-3.5" /> Kelola
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">

            {isLoading && (
              <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mr-2" />
                Memuat...
              </div>
            )}

            {error && !isLoading && (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-500">{error}</p>
                <button type="button" onClick={() => loadVouchers(true)}
                  className="text-xs font-bold text-orange-600 hover:underline mt-1">
                  Coba lagi
                </button>
              </div>
            )}

            {!isLoading && !error && filteredVouchers.length === 0 && !showQuick && (
              <div className="py-10 px-6 text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Tag className="w-6 h-6 text-orange-200" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {search ? 'Tidak ada voucher yang cocok' : 'Belum ada voucher'}
                </p>
                {!search && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button type="button" onClick={() => setShowQuick(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold">
                      <Plus className="w-3.5 h-3.5" /> Buat Sekarang
                    </button>
                    <button type="button" onClick={() => langNavigate('/agent/vouchers')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 text-xs font-semibold">
                      <ExternalLink className="w-3.5 h-3.5" /> Halaman Voucher
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isLoading && !error && filteredVouchers.map(v => {
              const isSelected = selectedIds.includes(Number(v.id));
              const expired    = isExpired(v);
              const full       = isFull(v);
              return (
                <button key={v.id} type="button" onClick={() => toggle(Number(v.id))}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all
                    ${isSelected ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0
                    ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-gray-900 font-mono tracking-wide">{v.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${v.type === 'percent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {v.type === 'percent' ? `${v.value}% off` : `${formatRp(Number(v.value))} off`}
                      </span>
                      {/* Status badge — sama seperti AgentVouchers.tsx */}
                      {!v.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">Nonaktif</span>
                      )}
                      {v.is_active && expired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">Kadaluarsa</span>
                      )}
                      {v.is_active && !expired && full && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">Kuota habis</span>
                      )}
                      {v.is_active && !expired && !full && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Aktif</span>
                      )}
                    </div>
                    {v.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{v.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-400">Min. {formatRp(Number(v.min_transaction))}</span>
                      {v.expires_at && (
                        <span className="text-[10px] text-gray-400">
                          s/d {new Date(v.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {v.max_usage != null && (
                        <span className="text-[10px] text-gray-400">
                          {v.used_count}/{v.max_usage} digunakan
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
            <span className="text-xs text-gray-400">{selectedIds.length} voucher dipilih</span>
            <button type="button" onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-orange-600 hover:underline">
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherSelector;

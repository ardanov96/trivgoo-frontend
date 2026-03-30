// src/components/VoucherSelector.tsx
// Prioritas: voucher milik agent sendiri (tab default)
// Jika kosong: tampilkan shortcut untuk buat voucher baru langsung dari sini
// Tab kedua: voucher platform (admin)

import React, { useEffect, useState, useCallback } from 'react';
import {
  Tag, X, Check, Search, Percent, DollarSign,
  ChevronDown, ChevronUp, AlertCircle, Shield, User,
  Plus, RefreshCw, ExternalLink, CheckCircle2, XCircle,
  Calendar, Zap,
} from 'lucide-react';
import { voucherService, agentVoucherService, Voucher, CreateVoucherPayload } from '../services/voucherService';
import { useLangNavigate } from '@/src/hooks/useLangNavigate';

interface VoucherSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

// ── Form data untuk quick-create ─────────────────────────────────────────────
interface QuickFormData {
  code: string;
  description: string;
  type: 'percent' | 'fixed';
  value: string;
  max_discount: string;
  min_transaction: string;
  expires_at: string;
  max_usage: string;
  per_user: boolean;
  is_active: boolean;
}

const EMPTY_QUICK_FORM: QuickFormData = {
  code: '',
  description: '',
  type: 'percent',
  value: '',
  max_discount: '',
  min_transaction: '',
  expires_at: '',
  max_usage: '',
  per_user: true,
  is_active: true,
};

// ── Badge voucher terpilih ────────────────────────────────────────────────────
const VoucherBadge: React.FC<{ voucher: Voucher; onRemove: () => void }> = ({ voucher, onRemove }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border group
    ${voucher.scope_owner === 'agent'
      ? 'bg-orange-50 border-orange-200 text-orange-700'
      : 'bg-primary-50 border-primary-200 text-primary-700'}`}
  >
    {voucher.scope_owner === 'agent'
      ? <User className="w-3 h-3 shrink-0" />
      : <Shield className="w-3 h-3 shrink-0" />
    }
    {voucher.type === 'percent'
      ? <Percent className="w-3 h-3 shrink-0" />
      : <DollarSign className="w-3 h-3 shrink-0" />
    }
    <span className="max-w-[120px] truncate font-mono tracking-wide">{voucher.code}</span>
    <span className={`font-normal ${voucher.scope_owner === 'agent' ? 'text-orange-400' : 'text-primary-400'}`}>
      {voucher.type === 'percent' ? `${voucher.value}%` : formatRp(voucher.value)}
    </span>
    <button
      type="button"
      onClick={onRemove}
      className="ml-1 text-gray-300 hover:text-red-500 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const VoucherSelector: React.FC<VoucherSelectorProps> = ({ selectedIds, onChange }) => {
  const { langPath, langNavigate } = useLangNavigate();

  const [agentVouchers, setAgentVouchers] = useState<Voucher[]>([]);
  const [adminVouchers, setAdminVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [isOpen, setIsOpen]               = useState(false);
  const [search, setSearch]               = useState('');
  const [activeTab, setActiveTab]         = useState<'agent' | 'admin'>('agent');

  // ── Quick Create state ────────────────────────────────────────────────────
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickForm, setQuickForm]             = useState<QuickFormData>(EMPTY_QUICK_FORM);
  const [quickLoading, setQuickLoading]       = useState(false);
  const [quickErrors, setQuickErrors]         = useState<Partial<QuickFormData>>({});
  const [quickSuccess, setQuickSuccess]       = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────────────────────────
  const loadVouchers = useCallback(async (force = false) => {
    if (!force && (agentVouchers.length > 0 || adminVouchers.length > 0)) return;
    setIsLoading(true);
    setError(null);

    Promise.all([
      agentVoucherService.getActive().catch(() => [] as Voucher[]),
      voucherService.getActive().catch(() => [] as Voucher[]),
    ])
      .then(([agentRes, adminRes]) => {
        setAgentVouchers(agentRes.map(v => ({ ...v, scope_owner: 'agent' as const })));
        setAdminVouchers(adminRes.map(v => ({ ...v, scope_owner: 'admin' as const })));
      })
      .catch(() => setError('Gagal memuat daftar voucher.'))
      .finally(() => setIsLoading(false));
  }, [agentVouchers.length, adminVouchers.length]);

  useEffect(() => {
    if (isOpen) loadVouchers();
  }, [isOpen]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const allVouchers      = [...agentVouchers, ...adminVouchers];
  const displayVouchers  = activeTab === 'agent' ? agentVouchers : adminVouchers;
  const selectedVouchers = allVouchers.filter(v => selectedIds.includes(v.id));

  const filteredVouchers = displayVouchers.filter(v => {
    const q = search.toLowerCase();
    return v.code.toLowerCase().includes(q) || (v.description ?? '').toLowerCase().includes(q);
  });

  const toggle = useCallback((id: number) => {
    onChange(selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id]);
  }, [selectedIds, onChange]);

  const isExpired = (v: Voucher) =>
    v.expires_at ? new Date(v.expires_at) < new Date() : false;

  // ── Quick Create ──────────────────────────────────────────────────────────
  const validateQuick = (): boolean => {
    const errs: Partial<QuickFormData> = {};
    if (!quickForm.code.trim())   errs.code  = 'Wajib diisi';
    if (!/^[A-Z0-9_-]+$/i.test(quickForm.code.trim())) errs.code = 'Hanya huruf, angka, - dan _';
    if (!quickForm.value || isNaN(Number(quickForm.value)) || Number(quickForm.value) <= 0)
      errs.value = 'Harus angka positif';
    if (quickForm.type === 'percent' && Number(quickForm.value) > 100)
      errs.value = 'Maks 100%';
    setQuickErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleQuickCreate = async () => {
    if (!validateQuick()) return;
    setQuickLoading(true);
    setQuickSuccess(null);

    try {
      const payload: CreateVoucherPayload = {
        code:            quickForm.code.toUpperCase().trim(),
        description:     quickForm.description || null,
        type:            quickForm.type,
        value:           Number(quickForm.value),
        max_discount:    quickForm.max_discount    ? Number(quickForm.max_discount)    : null,
        min_transaction: quickForm.min_transaction ? Number(quickForm.min_transaction) : 0,
        max_usage:       quickForm.max_usage       ? Number(quickForm.max_usage)       : null,
        per_user:        quickForm.per_user ? 1 : 0,
        starts_at:       null,
        expires_at:      quickForm.expires_at || null,
        is_active:       1,
      };

      const created = await agentVoucherService.create(payload);

      // Tambahkan ke list lokal & auto-select
      const withOwner = { ...created, scope_owner: 'agent' as const };
      setAgentVouchers(prev => [withOwner, ...prev]);
      onChange([...selectedIds, created.id]);

      setQuickSuccess(`Voucher "${created.code}" berhasil dibuat & dipilih!`);
      setQuickForm(EMPTY_QUICK_FORM);
      setQuickErrors({});

      // Tutup form setelah 1.5 detik
      setTimeout(() => {
        setShowQuickCreate(false);
        setQuickSuccess(null);
      }, 1500);
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
      <button
        type="button"
        onClick={() => setIsOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-orange-300 hover:shadow-sm transition-all text-sm font-bold text-gray-700 group"
      >
        <span className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-orange-500" />
          Pilih Voucher Promo
          {selectedIds.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-[10px] font-extrabold rounded-full">
              {selectedIds.length}
            </span>
          )}
        </span>
        {isOpen
          ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
          : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
        }
      </button>

      {/* Badge voucher terpilih */}
      {selectedVouchers.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {selectedVouchers.map(v => (
            <VoucherBadge key={v.id} voucher={v} onRemove={() => toggle(v.id)} />
          ))}
        </div>
      )}

      {/* Panel dropdown */}
      {isOpen && (
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => { setActiveTab('agent'); setShowQuickCreate(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all border-b-2
                ${activeTab === 'agent'
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <User className="w-3.5 h-3.5" />
              Voucher Saya
              {agentVouchers.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold
                  ${activeTab === 'agent' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                  {agentVouchers.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setShowQuickCreate(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all border-b-2
                ${activeTab === 'admin'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Shield className="w-3.5 h-3.5" />
              Voucher Platform
              {adminVouchers.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold
                  ${activeTab === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                  {adminVouchers.length}
                </span>
              )}
            </button>
          </div>

          {/* Search + action bar */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode atau deskripsi..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {activeTab === 'agent' && !showQuickCreate && (
              <button
                type="button"
                onClick={() => setShowQuickCreate(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shrink-0"
                title="Buat voucher baru"
              >
                <Plus className="w-3.5 h-3.5" /> Buat
              </button>
            )}
            <button
              type="button"
              onClick={() => loadVouchers(true)}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-white transition-all shrink-0"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          {/* ── Quick Create Form ── */}
          {showQuickCreate && activeTab === 'agent' && (
            <div className="p-4 border-b border-orange-100 bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-orange-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Buat Voucher Cepat
                </p>
                <button
                  type="button"
                  onClick={() => { setShowQuickCreate(false); setQuickErrors({}); setQuickForm(EMPTY_QUICK_FORM); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Success state */}
              {quickSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-xs font-semibold text-green-700">{quickSuccess}</p>
                </div>
              )}

              <div className="space-y-3">
                {/* Baris 1: Kode + Tipe */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Kode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={quickForm.code}
                      onChange={e => setQuickForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="PROMO10"
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold tracking-widest focus:outline-none transition-all
                        ${quickErrors.code ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:border-orange-400'}`}
                    />
                    {quickErrors.code && (
                      <p className="text-red-500 text-[10px] mt-0.5">{quickErrors.code}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tipe</label>
                    <select
                      value={quickForm.type}
                      onChange={e => setQuickForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                    >
                      <option value="percent">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                </div>

                {/* Baris 2: Nilai + Max Diskon */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Nilai <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">
                        {quickForm.type === 'percent' ? '%' : 'Rp'}
                      </span>
                      <input
                        type="number"
                        value={quickForm.value}
                        onChange={e => setQuickForm(f => ({ ...f, value: e.target.value }))}
                        placeholder={quickForm.type === 'percent' ? '10' : '50000'}
                        className={`w-full pl-7 pr-2 py-2 rounded-lg border text-xs focus:outline-none transition-all
                          ${quickErrors.value ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:border-orange-400'}`}
                      />
                    </div>
                    {quickErrors.value && (
                      <p className="text-red-500 text-[10px] mt-0.5">{quickErrors.value}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Min. Transaksi
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">Rp</span>
                      <input
                        type="number"
                        value={quickForm.min_transaction}
                        onChange={e => setQuickForm(f => ({ ...f, min_transaction: e.target.value }))}
                        placeholder="0"
                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Baris 3: Deskripsi */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deskripsi</label>
                  <input
                    type="text"
                    value={quickForm.description}
                    onChange={e => setQuickForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Diskon spesial untuk produk ini..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                  />
                </div>

                {/* Baris 4: Expired + Max Usage */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Kedaluwarsa
                    </label>
                    <input
                      type="datetime-local"
                      value={quickForm.expires_at}
                      onChange={e => setQuickForm(f => ({ ...f, expires_at: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Max Penggunaan</label>
                    <input
                      type="number"
                      value={quickForm.max_usage}
                      onChange={e => setQuickForm(f => ({ ...f, max_usage: e.target.value }))}
                      placeholder="∞"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleQuickCreate}
                    disabled={quickLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all disabled:opacity-60"
                  >
                    {quickLoading
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...</>
                      : <><CheckCircle2 className="w-3.5 h-3.5" /> Buat & Pilih</>
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => langNavigate('/agent/vouchers')}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-300 text-xs font-semibold transition-all"
                    title="Kelola semua voucher"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Kelola
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
                Memuat voucher...
              </div>
            )}

            {error && !isLoading && (
              <div className="flex items-center gap-2 p-4 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Empty state khusus tab agent */}
            {!isLoading && !error && activeTab === 'agent' && filteredVouchers.length === 0 && !showQuickCreate && (
              <div className="py-10 px-6 text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Tag className="w-6 h-6 text-orange-200" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {search ? 'Tidak ada voucher yang cocok' : 'Belum ada voucher'}
                </p>
                {!search && (
                  <>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      Buat voucher promo eksklusif untuk produk ini
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickCreate(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Buat Sekarang
                      </button>
                      <button
                        type="button"
                        onClick={() => langNavigate('/agent/vouchers')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 text-xs font-semibold transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Halaman Voucher
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Empty state tab admin */}
            {!isLoading && !error && activeTab === 'admin' && filteredVouchers.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">
                {search ? 'Tidak ada voucher yang cocok.' : 'Tidak ada voucher platform tersedia.'}
              </div>
            )}

            {/* Voucher list */}
            {!isLoading && filteredVouchers.map(v => {
              const isSelected = selectedIds.includes(v.id);
              const expired    = isExpired(v);
              const full       = v.max_usage != null && v.used_count >= v.max_usage;
              const isAgentV   = v.scope_owner === 'agent';

              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={expired || full}
                  onClick={() => toggle(v.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all
                    ${isSelected
                      ? isAgentV ? 'bg-orange-50 hover:bg-orange-100' : 'bg-primary-50 hover:bg-primary-100'
                      : 'hover:bg-gray-50'
                    }
                    ${expired || full ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Checkbox */}
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                    ${isSelected
                      ? isAgentV ? 'bg-orange-500 border-orange-500' : 'bg-primary-600 border-primary-600'
                      : 'border-gray-300'
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${v.type === 'percent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {v.type === 'percent' ? `${v.value}% off` : `${formatRp(v.value)} off`}
                      </span>
                      {isAgentV && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 flex items-center gap-0.5">
                          <User className="w-2.5 h-2.5" /> Milik Anda
                        </span>
                      )}
                      {v.max_discount != null && v.type === 'percent' && (
                        <span className="text-[10px] text-gray-400">maks. {formatRp(v.max_discount)}</span>
                      )}
                      {expired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">Kadaluarsa</span>
                      )}
                      {full && !expired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">Kuota habis</span>
                      )}
                    </div>

                    {v.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{v.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-400">Min. {formatRp(v.min_transaction)}</span>
                      {v.expires_at && (
                        <span className="text-[10px] text-gray-400">
                          s/d {new Date(v.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
            <span className="text-xs text-gray-400">{selectedIds.length} voucher dipilih</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-orange-600 hover:underline"
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

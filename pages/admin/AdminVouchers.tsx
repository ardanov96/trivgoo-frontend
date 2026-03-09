import React, { useEffect, useState } from 'react';
import {
  Plus, Trash2, Edit2, Tag, CheckCircle2, XCircle,
  Search, RefreshCw, Copy, Check, AlertCircle,
  Ticket, TrendingUp, Users, Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import http from '../../services/http';
import { useToast } from '../../components/ToastContext';

// ── Types ────────────────────────────────────────────────────
interface Voucher {
  id: number;
  code: string;
  description: string | null;
  type: 'percent' | 'fixed';
  value: number;
  max_discount: number | null;
  min_transaction: number;
  scope: 'all' | 'category' | 'product';
  scope_ids: number[] | null;
  max_usage: number | null;
  used_count: number;
  per_user: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: number;
  usage_count?: number;
}

interface VoucherFormData {
  code: string;
  description: string;
  type: 'percent' | 'fixed';
  value: string;
  max_discount: string;
  min_transaction: string;
  scope: 'all' | 'category' | 'product';
  scope_ids: string;
  max_usage: string;
  per_user: boolean;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

const EMPTY_FORM: VoucherFormData = {
  code: '',
  description: '',
  type: 'percent',
  value: '',
  max_discount: '',
  min_transaction: '',
  scope: 'all',
  scope_ids: '',
  max_usage: '',
  per_user: true,
  starts_at: '',
  expires_at: '',
  is_active: true,
};

const SCOPE_LABELS: Record<string, string> = {
  all: 'Semua Produk',
  category: 'Per Kategori',
  product: 'Per Produk',
};

const CATEGORY_OPTIONS = [
  { id: 1, label: 'Travel / Tour' },
  { id: 2, label: 'Hotel & Villa' },
  { id: 3, label: 'Car Rental' },
  { id: 4, label: 'Airport Transfer' },
  { id: 5, label: 'Event' },
];

// ── Helpers ──────────────────────────────────────────────────
function formatRp(val: number) {
  return `Rp ${Number(val).toLocaleString('id-ID')}`;
}

function isExpired(expires_at: string | null) {
  if (!expires_at) return false;
  return new Date(expires_at) < new Date();
}

function isNotStarted(starts_at: string | null) {
  if (!starts_at) return false;
  return new Date(starts_at) > new Date();
}

function statusLabel(v: Voucher) {
  if (!v.is_active) return { label: 'Nonaktif', color: 'bg-gray-100 text-gray-500' };
  if (isExpired(v.expires_at)) return { label: 'Kedaluwarsa', color: 'bg-red-100 text-red-600' };
  if (isNotStarted(v.starts_at)) return { label: 'Belum Mulai', color: 'bg-amber-100 text-amber-700' };
  if (v.max_usage !== null && v.used_count >= v.max_usage) return { label: 'Habis', color: 'bg-orange-100 text-orange-600' };
  return { label: 'Aktif', color: 'bg-green-100 text-green-700' };
}

// ── Main Component ───────────────────────────────────────────
const AdminVouchers: React.FC = () => {
  const { showToast } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VoucherFormData>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<VoucherFormData>>({});

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // ── Load ──
  const loadVouchers = async () => {
    setLoading(true);
    try {
      const res = await http.get('/vouchers');
      setVouchers(res.data?.data?.vouchers || []);
    } catch (e) {
      showToast('Gagal memuat voucher', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVouchers(); }, []);

  // ── Filter ──
  const filtered = vouchers.filter(v => {
    const matchSearch = v.code.toLowerCase().includes(search.toLowerCase()) ||
      (v.description || '').toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterStatus === 'active') return v.is_active === 1 && !isExpired(v.expires_at);
    if (filterStatus === 'inactive') return v.is_active === 0 || isExpired(v.expires_at);
    return true;
  });

  // ── Form helpers ──
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (v: Voucher) => {
    setEditingId(v.id);
    setForm({
      code: v.code,
      description: v.description || '',
      type: v.type,
      value: String(v.value),
      max_discount: v.max_discount !== null ? String(v.max_discount) : '',
      min_transaction: String(v.min_transaction),
      scope: v.scope,
      scope_ids: v.scope_ids ? v.scope_ids.join(',') : '',
      max_usage: v.max_usage !== null ? String(v.max_usage) : '',
      per_user: v.per_user === 1,
      starts_at: v.starts_at ? v.starts_at.slice(0, 16) : '',
      expires_at: v.expires_at ? v.expires_at.slice(0, 16) : '',
      is_active: v.is_active === 1,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<VoucherFormData> = {};
    if (!form.code.trim()) errors.code = 'Kode wajib diisi';
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0)
      errors.value = 'Value harus angka positif';
    if (form.type === 'percent' && Number(form.value) > 100)
      errors.value = 'Persentase tidak boleh lebih dari 100';
    if (form.scope !== 'all' && !form.scope_ids.trim())
      errors.scope_ids = 'Scope IDs wajib diisi';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setFormLoading(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        description: form.description || null,
        type: form.type,
        value: Number(form.value),
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        min_transaction: form.min_transaction ? Number(form.min_transaction) : 0,
        scope: form.scope,
        scope_ids: form.scope_ids
          ? form.scope_ids.split(',').map(s => Number(s.trim())).filter(Boolean)
          : null,
        max_usage: form.max_usage ? Number(form.max_usage) : null,
        per_user: form.per_user ? 1 : 0,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        is_active: form.is_active ? 1 : 0,
      };

      if (editingId) {
        await http.patch(`/vouchers/${editingId}`, payload);
        showToast('Voucher berhasil diperbarui', 'success');
      } else {
        await http.post('/vouchers', payload);
        showToast('Voucher berhasil dibuat', 'success');
      }
      setModalOpen(false);
      loadVouchers();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Gagal menyimpan voucher', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await http.delete(`/vouchers/${id}`);
      showToast('Voucher dihapus', 'success');
      setDeleteConfirmId(null);
      loadVouchers();
    } catch (e) {
      showToast('Gagal menghapus voucher', 'error');
    }
  };

  const handleToggleActive = async (v: Voucher) => {
    try {
      await http.patch(`/vouchers/${v.id}`, { is_active: v.is_active === 1 ? 0 : 1 });
      showToast(`Voucher ${v.is_active === 1 ? 'dinonaktifkan' : 'diaktifkan'}`, 'success');
      loadVouchers();
    } catch (e) {
      showToast('Gagal mengubah status', 'error');
    }
  };

  const handleCopy = (v: Voucher) => {
    navigator.clipboard.writeText(v.code);
    setCopiedId(v.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Stats ──
  const totalActive = vouchers.filter(v => v.is_active && !isExpired(v.expires_at)).length;
  const totalUsage = vouchers.reduce((s, v) => s + (v.usage_count || v.used_count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">Manajemen Voucher</h1>
              <p className="text-gray-500 mt-1 text-sm">Kelola kode promo & diskon untuk pelanggan</p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-primary-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-primary-600/30 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Buat Voucher Baru
            </button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Ticket, label: 'Total Voucher', value: vouchers.length, color: 'bg-blue-50 text-blue-600' },
            { icon: CheckCircle2, label: 'Aktif', value: totalActive, color: 'bg-green-50 text-green-600' },
            { icon: TrendingUp, label: 'Total Penggunaan', value: totalUsage, color: 'bg-primary-50 text-primary-600' },
            { icon: XCircle, label: 'Nonaktif / Expired', value: vouchers.length - totalActive, color: 'bg-red-50 text-red-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Search & Filter ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kode atau deskripsi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border
                  ${filterStatus === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
              >
                {s === 'all' ? 'Semua' : s === 'active' ? 'Aktif' : 'Nonaktif'}
              </button>
            ))}
            <button onClick={loadVouchers} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Memuat voucher...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium">Tidak ada voucher ditemukan</p>
              <p className="text-sm mt-1">Coba ubah filter atau buat voucher baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Kode', 'Deskripsi', 'Diskon', 'Min. Transaksi', 'Berlaku', 'Scope', 'Penggunaan', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, idx) => {
                    const status = statusLabel(v);
                    return (
                      <motion.tr
                        key={v.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Kode */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg tracking-widest">
                              {v.code}
                            </code>
                            <button
                              onClick={() => handleCopy(v)}
                              className="text-gray-400 hover:text-gray-700 transition-colors"
                              title="Copy kode"
                            >
                              {copiedId === v.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Deskripsi */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700 max-w-[180px] truncate">{v.description || '—'}</p>
                        </td>

                        {/* Diskon */}
                        <td className="px-4 py-4">
                          <div>
                            <span className="font-bold text-primary-600 text-sm">
                              {v.type === 'percent' ? `${v.value}%` : formatRp(v.value)}
                            </span>
                            {v.max_discount && (
                              <p className="text-xs text-gray-400 mt-0.5">max {formatRp(v.max_discount)}</p>
                            )}
                          </div>
                        </td>

                        {/* Min Transaksi */}
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{formatRp(v.min_transaction)}</span>
                        </td>

                        {/* Berlaku */}
                        <td className="px-4 py-4">
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {v.starts_at && <p>Mulai: {new Date(v.starts_at).toLocaleDateString('id-ID')}</p>}
                            {v.expires_at && (
                              <p className={isExpired(v.expires_at) ? 'text-red-500' : ''}>
                                Exp: {new Date(v.expires_at).toLocaleDateString('id-ID')}
                              </p>
                            )}
                            {!v.starts_at && !v.expires_at && <p>Tidak ada batas</p>}
                          </div>
                        </td>

                        {/* Scope */}
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                            ${v.scope === 'all' ? 'bg-blue-50 text-blue-700' :
                              v.scope === 'category' ? 'bg-purple-50 text-purple-700' :
                              'bg-amber-50 text-amber-700'}`}>
                            {SCOPE_LABELS[v.scope]}
                            {v.scope_ids && ` (${JSON.parse(v.scope_ids as any).join(',')})`}
                          </span>
                        </td>

                        {/* Penggunaan */}
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <span className="font-bold text-gray-900">{v.usage_count || v.used_count}</span>
                            {v.max_usage && <span className="text-gray-400 text-xs"> / {v.max_usage}</span>}
                          </div>
                          {v.max_usage && (
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1.5">
                              <div
                                className="h-full rounded-full bg-primary-500 transition-all"
                                style={{ width: `${Math.min(100, ((v.usage_count || v.used_count) / v.max_usage) * 100)}%` }}
                              />
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleActive(v)}
                              title={v.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                              className={`p-1.5 rounded-lg transition-all text-xs
                                ${v.is_active ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-green-50 text-gray-400 hover:text-green-500'}`}
                            >
                              {v.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openEdit(v)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {deleteConfirmId === v.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(v.id)}
                                  className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all"
                                >
                                  Hapus
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(v.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Modal Create/Edit ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">
                      {editingId ? 'Edit Voucher' : 'Buat Voucher Baru'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {editingId ? 'Perbarui detail voucher' : 'Isi form untuk membuat voucher baru'}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6 space-y-5">

                {/* Kode & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Kode Voucher <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="TRIVGOO10"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold tracking-widest focus:outline-none focus:border-primary-500 transition-all
                        ${formErrors.code ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                    />
                    {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2
                        ${form.is_active ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                    >
                      {form.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {form.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Diskon 10% untuk semua produk..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>

                {/* Tipe & Value */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Tipe
                    </label>
                    <select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                    >
                      <option value="percent">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Nilai <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                        {form.type === 'percent' ? '%' : 'Rp'}
                      </span>
                      <input
                        type="number"
                        value={form.value}
                        onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                        placeholder={form.type === 'percent' ? '10' : '50000'}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-primary-500 transition-all
                          ${formErrors.value ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                      />
                    </div>
                    {formErrors.value && <p className="text-red-500 text-xs mt-1">{formErrors.value}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Max Diskon
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                      <input
                        type="number"
                        value={form.max_discount}
                        onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))}
                        placeholder="200000"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Kosongkan = tidak ada cap</p>
                  </div>
                </div>

                {/* Min Transaksi & Max Usage */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Minimum Transaksi
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                      <input
                        type="number"
                        value={form.min_transaction}
                        onChange={e => setForm(f => ({ ...f, min_transaction: e.target.value }))}
                        placeholder="500000"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Max Penggunaan Total
                    </label>
                    <input
                      type="number"
                      value={form.max_usage}
                      onChange={e => setForm(f => ({ ...f, max_usage: e.target.value }))}
                      placeholder="100"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-1">Kosongkan = unlimited</p>
                  </div>
                </div>

                {/* Scope */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Berlaku Untuk
                  </label>
                  <div className="flex gap-2 mb-3">
                    {(['all', 'category', 'product'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, scope: s, scope_ids: '' }))}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all
                          ${form.scope === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                      >
                        {SCOPE_LABELS[s]}
                      </button>
                    ))}
                  </div>

                  {form.scope === 'category' && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Pilih Kategori:</p>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_OPTIONS.map(cat => {
                          const selected = form.scope_ids.split(',').map(s => s.trim()).includes(String(cat.id));
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                const ids = form.scope_ids.split(',').map(s => s.trim()).filter(Boolean);
                                const updated = selected
                                  ? ids.filter(id => id !== String(cat.id))
                                  : [...ids, String(cat.id)];
                                setForm(f => ({ ...f, scope_ids: updated.join(',') }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                                ${selected ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'}`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                      {formErrors.scope_ids && <p className="text-red-500 text-xs mt-2">{formErrors.scope_ids}</p>}
                    </div>
                  )}

                  {form.scope === 'product' && (
                    <div>
                      <input
                        type="text"
                        value={form.scope_ids}
                        onChange={e => setForm(f => ({ ...f, scope_ids: e.target.value }))}
                        placeholder="Masukkan Product IDs, pisahkan dengan koma: 12,34,56"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-primary-500 transition-all
                          ${formErrors.scope_ids ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                      />
                      {formErrors.scope_ids && <p className="text-red-500 text-xs mt-1">{formErrors.scope_ids}</p>}
                    </div>
                  )}
                </div>

                {/* Tanggal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />Mulai Berlaku
                    </label>
                    <input
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />Kedaluwarsa
                    </label>
                    <input
                      type="datetime-local"
                      value={form.expires_at}
                      onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Per User Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">1x Pakai Per User</p>
                    <p className="text-xs text-gray-500 mt-0.5">Setiap pengguna hanya bisa memakai voucher ini 1 kali</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, per_user: !f.per_user }))}
                    className={`relative w-11 h-6 rounded-full transition-all ${form.per_user ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${form.per_user ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Preview */}
                {form.value && (
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1">Preview Voucher</p>
                    <div className="flex items-center gap-3">
                      <code className="bg-primary-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg tracking-widest">
                        {form.code || 'KODE'}
                      </code>
                      <div className="text-sm text-primary-800">
                        <span className="font-bold">
                          {form.type === 'percent' ? `${form.value}% OFF` : `Rp ${Number(form.value || 0).toLocaleString('id-ID')} OFF`}
                        </span>
                        {form.max_discount && ` (max Rp ${Number(form.max_discount).toLocaleString('id-ID')})`}
                        {form.min_transaction && ` · min. Rp ${Number(form.min_transaction).toLocaleString('id-ID')}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 pb-8 pt-4 flex gap-3 justify-end border-t border-gray-100">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-primary-600 text-white text-sm font-semibold transition-all shadow-md disabled:opacity-60 active:scale-95 flex items-center gap-2"
                >
                  {formLoading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Simpan Perubahan' : 'Buat Voucher'}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminVouchers;

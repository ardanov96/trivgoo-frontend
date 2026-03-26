// pages/admin/AdminPromoCampaigns.tsx  — UPDATED dengan fitur upload banner
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, RefreshCw, Edit2, Trash2, Eye,
  Megaphone, Calendar, Tag, Zap, ChevronRight,
  XCircle, CheckCircle2, Loader2, AlertCircle,
  ImageIcon, Upload, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  promoService,
  resolveBannerUrl,
  type PromoCampaign,
  type PromoCampaignPayload,
  type CampaignType,
} from '../../services/promoService';
import { loyaltyService, type MembershipTier } from '../../services/loyaltyService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<CampaignType, { label: string; color: string; bg: string }> = {
  flash_sale:     { label: 'Flash Sale',      color: 'text-red-700',    bg: 'bg-red-50'    },
  seasonal:       { label: 'Seasonal',        color: 'text-blue-700',   bg: 'bg-blue-50'   },
  member_only:    { label: 'Member Only',     color: 'text-purple-700', bg: 'bg-purple-50' },
  referral_bonus: { label: 'Referral Bonus',  color: 'text-green-700',  bg: 'bg-green-50'  },
  bundle:         { label: 'Bundle',          color: 'text-amber-700',  bg: 'bg-amber-50'  },
};

function campaignStatus(c: PromoCampaign): { label: string; color: string } {
  const now = new Date();
  if (!c.is_active)               return { label: 'Nonaktif', color: 'bg-gray-100 text-gray-500' };
  if (new Date(c.ends_at) < now)  return { label: 'Berakhir', color: 'bg-red-100 text-red-600' };
  if (new Date(c.starts_at) > now)return { label: 'Belum Mulai', color: 'bg-amber-100 text-amber-700' };
  return { label: 'Aktif', color: 'bg-green-100 text-green-700' };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const EMPTY_FORM: PromoCampaignPayload = {
  name: '', description: null, type: 'seasonal',
  discount_type: 'percent', discount_value: 0, max_discount: null,
  min_transaction: 0, scope: 'all', scope_ids: [],
  min_tier_id: null, starts_at: '', ends_at: '',
  max_usage: null, per_user: 1, is_active: 1,
  banner_image: null,
};

// ── BannerUploader component ──────────────────────────────────────────────────

interface BannerUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

const BannerUploader: React.FC<BannerUploaderProps> = ({ value, onChange }) => {
  const { langPath } = useLangNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value ? resolveBannerUrl(value) : null);

  // Sync preview jika value berubah dari luar (misalnya saat edit campaign)
  useEffect(() => {
    setPreview(value ? resolveBannerUrl(value) : null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi sisi client
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      setError('Ukuran file maksimal 5 MB');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Format file harus JPG, PNG, atau WebP');
      return;
    }

    setError(null);
    // Tampilkan preview lokal dulu (responsif)
    const local_preview = URL.createObjectURL(file);
    setPreview(local_preview);

    setUploading(true);
    try {
      const result = await promoService.uploadBanner(file);
      onChange(result.url);        // simpan path relatif ke form
      setPreview(resolveBannerUrl(result.url)); // resolve via helper, konsisten dengan app
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload gagal, coba lagi');
      setPreview(value ? resolveBannerUrl(value) : null); // rollback preview
    } finally {
      setUploading(false);
      // Reset input agar bisa upload ulang file yang sama
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
        Banner Gambar
        <span className="text-gray-400 font-normal normal-case ml-1">(JPG/PNG/WebP, max 5 MB · dimensi ideal <strong className="text-gray-500">1010 × 298 px</strong>)</span>
      </label>

      {preview ? (
        /* ── Preview Mode ── */
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 group">
          <img
            src={preview}
            alt="Banner preview"
            className="w-full h-40 object-cover"
          />
          {/* Overlay buttons */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
            >
              {uploading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                : <><Upload className="w-3.5 h-3.5" /> Ganti</>
              }
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
            >
              <X className="w-3.5 h-3.5" /> Hapus
            </button>
          </div>
          {/* Uploading spinner overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                Mengupload...
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Empty / Upload Mode ── */
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={`w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all
            ${uploading
              ? 'border-primary-300 bg-primary-50 cursor-not-allowed'
              : 'border-gray-200 bg-gray-50 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
            }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              <span className="text-sm font-semibold text-primary-600">Mengupload...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Klik untuk upload banner</p>
                <p className="text-xs text-gray-400 mt-0.5">atau drag & drop di sini</p>
              </div>
            </>
          )}
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const AdminPromoCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<CampaignType | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PromoCampaignPayload>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, tierRes] = await Promise.all([
        promoService.listCampaigns({ q: search, type: filterType === 'all' ? undefined : filterType }),
        loyaltyService.getAllTiers(),
      ]);
      setCampaigns(res.campaigns);
      setTiers(tierRes);
    } catch {
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterType]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: PromoCampaign) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description,
      type: c.type,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      max_discount: c.max_discount,
      min_transaction: c.min_transaction,
      scope: c.scope,
      scope_ids: [],
      min_tier_id: c.min_tier_id,
      starts_at: c.starts_at?.slice(0, 16) ?? '',
      ends_at: c.ends_at?.slice(0, 16) ?? '',
      max_usage: c.max_usage,
      per_user: c.per_user,
      is_active: c.is_active,
      banner_image: c.banner_image,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.starts_at || !form.ends_at) {
      showToast('Nama, tanggal mulai, dan tanggal berakhir wajib diisi', 'error');
      return;
    }
    setFormLoading(true);
    try {
      if (editingId) {
        await promoService.updateCampaign(editingId, form);
        showToast('Campaign diperbarui');
      } else {
        await promoService.createCampaign(form);
        showToast('Campaign berhasil dibuat');
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await promoService.deleteCampaign(id);
      showToast('Campaign dihapus');
      setDeleteConfirmId(null);
      load();
    } catch {
      showToast('Gagal menghapus', 'error');
    }
  };

  const activeCount = campaigns.filter(c => campaignStatus(c).label === 'Aktif').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold
                ${toast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'}`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Promo Campaign</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola kampanye promosi & diskon spesial</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={langPath('/admin/promo/analytics')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              Analytics <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Buat Campaign
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Megaphone, label: 'Total Campaign', value: campaigns.length, color: 'bg-blue-50 text-blue-600' },
            { icon: CheckCircle2, label: 'Aktif', value: activeCount, color: 'bg-green-50 text-green-600' },
            { icon: Zap, label: 'Flash Sale', value: campaigns.filter(c => c.type === 'flash_sale').length, color: 'bg-red-50 text-red-600' },
            { icon: Tag, label: 'Total Pemakaian', value: campaigns.reduce((s, c) => s + c.used_count, 0), color: 'bg-primary-50 text-primary-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filter */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari campaign..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'flash_sale', 'seasonal', 'member_only', 'referral_bonus', 'bundle'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all
                  ${filterType === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
              >
                {t === 'all' ? 'Semua' : TYPE_META[t]?.label ?? t}
              </button>
            ))}
            <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" /></div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium">Belum ada campaign</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Banner', 'Campaign', 'Tipe', 'Diskon', 'Periode', 'Pemakaian', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, idx) => {
                    const status = campaignStatus(c);
                    const typeMeta = TYPE_META[c.type];
                    return (
                      <motion.tr key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        {/* Banner thumbnail */}
                        <td className="px-4 py-4">
                          {c.banner_image ? (
                            <img
                              src={resolveBannerUrl(c.banner_image)}
                              alt="banner"
                              className="w-16 h-10 object-cover rounded-lg border border-gray-100"
                            />
                          ) : (
                            <div className="w-16 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                          {c.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{c.description}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeMeta?.bg} ${typeMeta?.color}`}>
                            {typeMeta?.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-primary-600 text-sm">
                            {c.discount_type === 'percent' ? `${c.discount_value}%` : `Rp ${c.discount_value.toLocaleString('id-ID')}`}
                          </p>
                          {c.max_discount && <p className="text-xs text-gray-400">max Rp {c.max_discount.toLocaleString('id-ID')}</p>}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          <p>{formatDate(c.starts_at)}</p>
                          <p className="text-gray-400">s/d {formatDate(c.ends_at)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-bold text-gray-900">{c.used_count}</div>
                          {c.max_usage && (
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1">
                              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (c.used_count / c.max_usage) * 100)}%` }} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <Link to={`/admin/promo/campaigns/${c.id}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {deleteConfirmId === c.id ? (
                              <div className="flex gap-1">
                                <button onClick={() => handleDelete(c.id)} className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700">Hapus</button>
                                <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">Batal</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirmId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
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

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900">{editingId ? 'Edit Campaign' : 'Buat Campaign Baru'}</h2>
              </div>

              <div className="px-8 py-6 space-y-5">

                {/* ── BANNER UPLOAD ── */}
                <BannerUploader
                  value={form.banner_image ?? null}
                  onChange={(url) => setForm(f => ({ ...f, banner_image: url }))}
                />

                {/* Nama */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama Campaign *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Flash Sale Lebaran 2025"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Deskripsi</label>
                  <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Deskripsi singkat kampanye..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all resize-none" />
                </div>

                {/* Tipe */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Tipe Campaign</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CampaignType }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all">
                      {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Min. Tier Member</label>
                    <select value={form.min_tier_id ?? ''} onChange={e => setForm(f => ({ ...f, min_tier_id: e.target.value ? Number(e.target.value) : null }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all">
                      <option value="">Semua User</option>
                      {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Diskon */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Tipe Diskon</label>
                    <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all">
                      <option value="percent">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nilai Diskon *</label>
                    <input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Max Diskon (Rp)</label>
                    <input type="number" value={form.max_discount ?? ''} onChange={e => setForm(f => ({ ...f, max_discount: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="Kosongkan = ∞"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                </div>

                {/* Min transaksi & Max usage */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Min. Transaksi (Rp)</label>
                    <input type="number" value={form.min_transaction} onChange={e => setForm(f => ({ ...f, min_transaction: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Max Penggunaan</label>
                    <input type="number" value={form.max_usage ?? ''} onChange={e => setForm(f => ({ ...f, max_usage: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="Kosongkan = unlimited"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                </div>

                {/* Tanggal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Mulai *</label>
                    <input type="datetime-local" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Berakhir *</label>
                    <input type="datetime-local" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                </div>

                {/* Status & Per User */}
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setForm(f => ({ ...f, is_active: f.is_active ? 0 : 1 }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-sm transition-all
                      ${form.is_active ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    {form.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {form.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, per_user: f.per_user ? 0 : 1 }))}
                    className={`flex-1 flex items-center gap-2 justify-center py-2.5 rounded-xl border font-semibold text-sm transition-all
                      ${form.per_user ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    1× per user: {form.per_user ? 'Ya' : 'Tidak'}
                  </button>
                </div>
              </div>

              <div className="px-8 pb-8 pt-4 flex gap-3 justify-end border-t border-gray-100">
                <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">Batal</button>
                <button onClick={handleSubmit} disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-primary-600 text-white text-sm font-semibold transition-all shadow-md disabled:opacity-60 active:scale-95 flex items-center gap-2">
                  {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Simpan' : 'Buat Campaign'}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPromoCampaigns;

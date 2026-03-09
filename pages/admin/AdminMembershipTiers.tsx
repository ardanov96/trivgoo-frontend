// pages/admin/AdminMembershipTiers.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Shield, Star, Crown, Zap,
  Loader2, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  Percent, Sparkles, TrendingUp,
} from 'lucide-react';
import { promoService } from '../../services/promoService';
import type { MembershipTier } from '../../services/loyaltyService';

const TIER_ICONS: Record<string, React.ReactNode> = {
  bronze: <Shield className="w-5 h-5" />,
  silver: <Star className="w-5 h-5" />,
  gold:   <Crown className="w-5 h-5" />,
  platinum: <Zap className="w-5 h-5" />,
};

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

const EMPTY_FORM: Partial<MembershipTier> = {
  name: '', slug: '', description: '', icon: '',
  color: '#cd7f32',
  min_spending: 0, min_points: 0,
  discount_percent: 0, point_multiplier: 1, max_discount_per_order: null,
  level: 0, is_active: 1,
};

const AdminMembershipTiers: React.FC = () => {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<MembershipTier>>(EMPTY_FORM);
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
      const data = await promoService.listTiers();
      setTiers(data.sort((a, b) => a.level - b.level));
    } catch (e) {
      showToast('Gagal memuat tier', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, level: tiers.length });
    setModalOpen(true);
  };

  const openEdit = (t: MembershipTier) => {
    setEditingId(t.id);
    setForm({ ...t });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      showToast('Nama dan slug wajib diisi', 'error');
      return;
    }
    setFormLoading(true);
    try {
      if (editingId) {
        await promoService.updateTier(editingId, form);
        showToast('Tier diperbarui');
      } else {
        await promoService.createTier(form);
        showToast('Tier berhasil dibuat');
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
      await promoService.deleteTier(id);
      showToast('Tier dihapus');
      setDeleteConfirmId(null);
      load();
    } catch (e) {
      showToast('Gagal menghapus tier', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold
                ${toast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Membership Tiers</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola level keanggotaan & benefit tiap tier</p>
          </div>
          <div className="flex gap-3">
            <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95">
              <Plus className="w-4 h-4" /> Tambah Tier
            </button>
          </div>
        </motion.div>

        {/* Tiers Grid */}
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tiers.map((tier, idx) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 relative overflow-hidden" style={{ backgroundColor: tier.color ?? '#cd7f32' }}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
                          {TIER_ICONS[tier.slug] ?? <Star className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="text-white font-serif font-bold text-xl">{tier.name}</h3>
                          <p className="text-white/60 text-xs">Level {tier.level} · /{tier.slug}</p>
                        </div>
                      </div>
                      {tier.description && <p className="text-white/70 text-xs">{tier.description}</p>}
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.is_active ? 'bg-white/20 text-white' : 'bg-black/20 text-white/60'}`}>
                      {tier.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <Percent className="w-4 h-4 text-primary-600 mx-auto mb-1" />
                      <p className="font-bold text-gray-900 text-lg">{tier.discount_percent}%</p>
                      <p className="text-[10px] text-gray-500 font-semibold">Diskon</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <Sparkles className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="font-bold text-gray-900 text-lg">{tier.point_multiplier}×</p>
                      <p className="text-[10px] text-gray-500 font-semibold">Point</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <p className="font-bold text-gray-900 text-sm">{tier.max_discount_per_order ? formatRp(tier.max_discount_per_order) : '∞'}</p>
                      <p className="text-[10px] text-gray-500 font-semibold">Max Diskon</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between text-xs">
                    <div>
                      <p className="text-gray-400 font-semibold">Min. Spending</p>
                      <p className="font-bold text-gray-800 mt-0.5">{formatRp(tier.min_spending)}</p>
                    </div>
                    {tier.min_points > 0 && (
                      <div className="text-right">
                        <p className="text-gray-400 font-semibold">Min. Points</p>
                        <p className="font-bold text-gray-800 mt-0.5">{tier.min_points.toLocaleString('id-ID')} pts</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(tier)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    {deleteConfirmId === tier.id ? (
                      <div className="flex gap-2 flex-1">
                        <button onClick={() => handleDelete(tier.id)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all">Hapus</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold transition-all">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(tier.id)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

              <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900">{editingId ? 'Edit Tier' : 'Tambah Tier Baru'}</h2>
              </div>

              <div className="px-8 py-6 space-y-5">
                {/* Preview warna */}
                {form.name && (
                  <div className="rounded-2xl p-4 flex items-center gap-3 text-white" style={{ backgroundColor: form.color ?? '#cd7f32' }}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      {TIER_ICONS[form.slug ?? ''] ?? <Star className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-serif font-bold text-lg">{form.name}</p>
                      <p className="text-white/60 text-xs">Preview card</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama *</label>
                    <input type="text" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Gold" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Slug *</label>
                    <input type="text" value={form.slug ?? ''} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      placeholder="gold" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Deskripsi</label>
                  <input type="text" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Member level gold dengan benefit premium" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Warna (hex)</label>
                    <div className="flex gap-2">
                      <input type="color" value={form.color ?? '#cd7f32'} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                        className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer p-1" />
                      <input type="text" value={form.color ?? ''} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-primary-500 font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Level (urutan)</label>
                    <input type="number" value={form.level ?? 0} onChange={e => setForm(f => ({ ...f, level: Number(e.target.value) }))}
                      min={0} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Min. Spending (Rp)</label>
                    <input type="number" value={form.min_spending ?? 0} onChange={e => setForm(f => ({ ...f, min_spending: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Min. Points</label>
                    <input type="number" value={form.min_points ?? 0} onChange={e => setForm(f => ({ ...f, min_points: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Diskon (%)</label>
                    <input type="number" value={form.discount_percent ?? 0} onChange={e => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))}
                      min={0} max={100} step={0.5}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Point Multiplier</label>
                    <input type="number" value={form.point_multiplier ?? 1} onChange={e => setForm(f => ({ ...f, point_multiplier: Number(e.target.value) }))}
                      min={1} max={10} step={0.5}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Max Diskon/Order</label>
                    <input type="number" value={form.max_discount_per_order ?? ''} onChange={e => setForm(f => ({ ...f, max_discount_per_order: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="∞" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  </div>
                </div>

                <button type="button" onClick={() => setForm(f => ({ ...f, is_active: f.is_active ? 0 : 1 }))}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-sm transition-all
                    ${form.is_active ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  {form.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {form.is_active ? 'Tier Aktif' : 'Tier Nonaktif'}
                </button>
              </div>

              <div className="px-8 pb-8 pt-4 flex gap-3 justify-end border-t border-gray-100">
                <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">Batal</button>
                <button onClick={handleSubmit} disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-primary-600 text-white text-sm font-semibold transition-all shadow-md disabled:opacity-60 active:scale-95 flex items-center gap-2">
                  {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Simpan' : 'Buat Tier'}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMembershipTiers;

import React, { useEffect, useState } from 'react';
import { AlertCircle, BookOpen, Check, ChevronDown, Clock, Edit2, MapPin, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import http from '../../services/http';

// ── Types ─────────────────────────────────────────────────────────────────────
interface KnowledgeTip {
  id:           number;
  location:     string;
  tip_type:     string;
  title:        string;
  content:      string;
  valid_months: string | null;
  is_approved:  number;
  is_active:    number;
  created_at:   string;
}

const TIP_TYPE_OPTIONS = [
  { value: 'best_time',      label: 'Waktu Terbaik',      color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'local_warning',  label: 'Peringatan Lokal',   color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'hidden_gem',     label: 'Hidden Gem',          color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'transport_tip',  label: 'Tips Transport',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'food_tip',       label: 'Kuliner Lokal',       color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'culture_tip',    label: 'Budaya & Adat',       color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { value: 'practical_tip',  label: 'Tips Praktis',        color: 'bg-gray-50 text-gray-700 border-gray-200' },
];

const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function getTipTypeConfig(tipType: string) {
  return TIP_TYPE_OPTIONS.find(t => t.value === tipType) ?? TIP_TYPE_OPTIONS[6];
}

function parseValidMonths(raw: string | null): number[] {
  if (!raw) return [];
  return raw.split(',').map(Number).filter(n => n >= 1 && n <= 12);
}

function formatValidMonths(months: number[]): string {
  if (!months.length) return 'Sepanjang tahun';
  return months.map(m => MONTH_NAMES[m]).join(', ');
}

// ── Form Component ────────────────────────────────────────────────────────────
const TipForm: React.FC<{
  initial?: Partial<KnowledgeTip>;
  onSave:   (data: any) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ initial, onSave, onCancel, isSaving }) => {
  const [location,    setLocation]    = useState(initial?.location    ?? '');
  const [tipType,     setTipType]     = useState(initial?.tip_type    ?? 'practical_tip');
  const [title,       setTitle]       = useState(initial?.title       ?? '');
  const [content,     setContent]     = useState(initial?.content     ?? '');
  const [validMonths, setValidMonths] = useState<number[]>(parseValidMonths(initial?.valid_months ?? null));

  const toggleMonth = (m: number) => {
    setValidMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m].sort((a,b) => a-b));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !title.trim() || !content.trim()) return;
    await onSave({
      location:     location.trim().toLowerCase(),
      tip_type:     tipType,
      title:        title.trim(),
      content:      content.trim(),
      valid_months: validMonths.length ? validMonths.join(',') : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Location */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1.5">Lokasi *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input value={location} onChange={e => setLocation(e.target.value)} required
            placeholder="e.g. Labuan Bajo, Bali, Raja Ampat"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Gunakan nama kota/destinasi dalam huruf kecil</p>
      </div>

      {/* Tip Type */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1.5">Kategori Tips *</label>
        <div className="grid grid-cols-2 gap-2">
          {TIP_TYPE_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => setTipType(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${tipType === opt.value ? opt.color + ' border' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tipType === opt.value ? 'bg-current' : 'bg-gray-300'}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1.5">Judul Tips *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={200}
          placeholder="e.g. Ferry ke Komodo tutup setiap Selasa"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{title.length}/200</p>
      </div>

      {/* Content */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1.5">Isi Tips * <span className="font-normal text-gray-400">(detail dan akurat)</span></label>
        <textarea value={content} onChange={e => setContent(e.target.value)} required maxLength={2000} rows={5}
          placeholder="Tulis tips selengkap mungkin. Semakin detail semakin berguna untuk traveler dan AI."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none" />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{content.length}/2000</p>
      </div>

      {/* Valid Months */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1.5">
          Berlaku di bulan <span className="font-normal text-gray-400">(kosongkan = berlaku sepanjang tahun)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MONTH_NAMES.slice(1).map((name, i) => {
            const m = i + 1;
            const active = validMonths.includes(m);
            return (
              <button key={m} type="button" onClick={() => toggleMonth(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300'}`}>
                {name}
              </button>
            );
          })}
        </div>
        {validMonths.length > 0 && (
          <p className="text-[10px] text-primary-600 mt-1.5 font-bold">
            Berlaku: {formatValidMonths(validMonths)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <motion.button type="submit" disabled={isSaving || !location.trim() || !title.trim() || !content.trim()}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors">
          {isSaving ? (
            <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block" />Menyimpan...</>
          ) : (
            <><Check className="w-4 h-4" />{initial?.id ? 'Simpan Perubahan' : 'Kirim Tips'}</>
          )}
        </motion.button>
      </div>
    </form>
  );
};

// ── Tip Card ──────────────────────────────────────────────────────────────────
const TipCard: React.FC<{
  tip:      KnowledgeTip;
  onEdit:   (tip: KnowledgeTip) => void;
  onDelete: (id: number) => void;
}> = ({ tip, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = getTipTypeConfig(tip.tip_type);
  const months     = parseValidMonths(tip.valid_months);

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />{tip.location}
            </span>
            {tip.is_approved ? (
              <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />Aktif di AI
              </span>
            ) : (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />Menunggu review
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-gray-900 leading-snug">{tip.title}</p>
          {months.length > 0 && (
            <p className="text-[9px] text-gray-400 mt-0.5">Berlaku: {formatValidMonths(months)}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(tip)} className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
            <Edit2 className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(tip.id)} className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
          <button onClick={() => setExpanded(v => !v)} className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-3 pb-3 border-t border-gray-50 pt-2.5">
              <p className="text-xs text-gray-600 leading-relaxed">{tip.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AgentKnowledgeBase: React.FC = () => {
  const [tips,      setTips]      = useState<KnowledgeTip[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editTip,   setEditTip]   = useState<KnowledgeTip | null>(null);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadTips = () => {
    setLoading(true);
    http.get('/agent/knowledge-base')
      .then(res => { if (!res.data?.error) setTips(res.data.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTips(); }, []);

  const handleSave = async (data: any) => {
    setIsSaving(true); setError(''); setSuccessMsg('');
    try {
      if (editTip) {
        await http.put(`/agent/knowledge-base/${editTip.id}`, data);
        setSuccessMsg('Tips diupdate. Menunggu approval ulang dari admin.');
      } else {
        await http.post('/agent/knowledge-base', data);
        setSuccessMsg('Tips berhasil dikirim! Akan aktif setelah direview admin.');
      }
      setShowForm(false); setEditTip(null);
      loadTips();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Gagal menyimpan tips.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus tips ini?')) return;
    try {
      await http.delete(`/agent/knowledge-base/${id}`);
      setTips(prev => prev.filter(t => t.id !== id));
    } catch {}
  };

  const handleEdit = (tip: KnowledgeTip) => {
    setEditTip(tip); setShowForm(true); setError(''); setSuccessMsg('');
  };

  const handleAddNew = () => {
    setEditTip(null); setShowForm(true); setError(''); setSuccessMsg('');
  };

  const approvedCount = tips.filter(t => t.is_approved).length;
  const pendingCount  = tips.filter(t => !t.is_approved).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">Local Knowledge Base</h3>
          <p className="text-xs text-gray-500">Bagikan tips lokal untuk digunakan AI Trip Planner</p>
        </div>
        <motion.button onClick={handleAddNew} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors flex-shrink-0">
          <Plus className="w-3.5 h-3.5" />Tambah Tips
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Check className="w-3 h-3" />Aktif di AI
          </p>
          <p className="text-2xl font-bold text-green-700 tabular-nums">{loading ? '...' : approvedCount}</p>
          <p className="text-[10px] text-green-400 mt-0.5">tips sudah digunakan AI</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />Menunggu Review
          </p>
          <p className="text-2xl font-bold text-amber-700 tabular-nums">{loading ? '...' : pendingCount}</p>
          <p className="text-[10px] text-amber-400 mt-0.5">tips menunggu approval</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
        <AlertCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 leading-relaxed">
          Tips yang kamu submit akan direview admin sebelum digunakan AI. Setelah approved, AI Trip Planner akan otomatis menyebutkan tips ini saat user merencanakan trip ke destinasi tersebut.
        </p>
      </div>

      {/* Success / Error message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
            <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <p className="text-xs font-bold text-green-700 flex-1">{successMsg}</p>
            <button onClick={() => setSuccessMsg('')}><X className="w-3.5 h-3.5 text-green-400" /></button>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <p className="text-xs font-bold text-red-700 flex-1">{error}</p>
            <button onClick={() => setError('')}><X className="w-3.5 h-3.5 text-red-400" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="bg-white rounded-2xl border border-primary-200 shadow-md overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-primary-500 to-green-500" />
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900">
                  {editTip ? 'Edit Tips' : 'Tambah Tips Lokal Baru'}
                </h4>
                <button onClick={() => { setShowForm(false); setEditTip(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <TipForm initial={editTip ?? undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditTip(null); }} isSaving={isSaving} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : tips.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <BookOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-500">Belum ada tips</p>
          <p className="text-xs text-gray-400 mt-1">Bagikan pengetahuan lokalmu agar AI semakin pintar</p>
          <button onClick={handleAddNew} className="mt-3 text-primary-600 font-bold text-xs hover:underline">
            + Tambah tips pertama
          </button>
        </div>
      ) : (
        <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} initial="hidden" animate="show" className="space-y-2">
          {tips.map(tip => (
            <TipCard key={tip.id} tip={tip} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </motion.div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Tips yang baik: spesifik, berdasarkan pengalaman nyata, dan membantu traveler menghindari masalah
      </p>
    </div>
  );
};

export default AgentKnowledgeBase;


// ─────────────────────────────────────────────────────────────────────────────
// CARA INTEGRASI KE AgentDashboard.tsx
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Import di AgentDashboard.tsx:
//    import AgentKnowledgeBase from './AgentKnowledgeBase';
//
// 2. Tambahkan setelah AgentAIAnalytics di dashboard:
//    {isVerified && (
//      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//        <AgentKnowledgeBase />
//      </div>
//    )}

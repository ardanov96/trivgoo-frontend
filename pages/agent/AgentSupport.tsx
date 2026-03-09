/**
 * J.11. Agent Support & Training
 * pages/agent/AgentSupport.tsx
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  LifeBuoy, BookOpen, MessageCircle, Play, CheckCircle,
  Clock, ChevronRight, Search, Star, Lock, RefreshCw,
  FileText, Video, HelpCircle, Award, ChevronDown,
} from 'lucide-react';
import http from '../../services/http';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SupportTicket {
  id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  last_reply_at: string | null;
  category: string;
}

interface TrainingModule {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'article' | 'quiz';
  duration_minutes: number;
  is_completed: boolean;
  is_locked: boolean;
  order: number;
  points: number;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG = {
  open: { label: 'Terbuka', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Diproses', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Ditutup', color: 'bg-gray-100 text-gray-500' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Rendah', color: 'text-gray-400' },
  medium: { label: 'Sedang', color: 'text-amber-500' },
  high: { label: 'Tinggi', color: 'text-red-500' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const FAQItem: React.FC<{ faq: FAQ }> = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{faq.question}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

// ── New Ticket Form ───────────────────────────────────────────────────────────

const NewTicketModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-4">Buat Tiket Support</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Subjek</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Jelaskan masalah secara singkat"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="">Pilih kategori</option>
                <option value="payment">Pembayaran</option>
                <option value="product">Produk</option>
                <option value="booking">Booking</option>
                <option value="account">Akun</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Prioritas</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Pesan</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Deskripsikan masalah kamu secara detail..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button
            onClick={() => onSubmit({ subject, category, message, priority })}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors active:scale-95"
          >
            Kirim Tiket
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const AgentSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'training' | 'tickets' | 'faq'>('training');
  const [search, setSearch] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tickRes, modRes, faqRes] = await Promise.all([
        http.get('/agent/support/tickets'),
        http.get('/agent/support/training'),
        http.get('/agent/support/faq'),
      ]);
      if (!tickRes.data?.error) setTickets(tickRes.data.data ?? []);
      if (!modRes.data?.error) setModules(modRes.data.data ?? []);
      if (!faqRes.data?.error) setFaqs(faqRes.data.data ?? []);
    } catch {
      setTickets([
        { id: 1, subject: 'Komisi tidak masuk setelah booking selesai', status: 'in_progress', priority: 'high', created_at: '2025-03-07T00:00:00Z', last_reply_at: '2025-03-08T10:00:00Z', category: 'payment' },
        { id: 2, subject: 'Produk tidak muncul di pencarian', status: 'resolved', priority: 'medium', created_at: '2025-02-28T00:00:00Z', last_reply_at: '2025-03-01T00:00:00Z', category: 'product' },
      ]);
      setModules([
        { id: 1, title: 'Pengenalan Dashboard Agen', description: 'Pelajari cara navigasi dan fitur utama dashboard', type: 'video', duration_minutes: 8, is_completed: true, is_locked: false, order: 1, points: 50 },
        { id: 2, title: 'Cara Upload & Kelola Produk', description: 'Tips foto produk, deskripsi yang menarik, dan pricing', type: 'video', duration_minutes: 15, is_completed: true, is_locked: false, order: 2, points: 100 },
        { id: 3, title: 'Strategi Harga & Kompetisi', description: 'Analisis pasar dan teknik pricing untuk meningkatkan konversi', type: 'article', duration_minutes: 12, is_completed: false, is_locked: false, order: 3, points: 75 },
        { id: 4, title: 'Menggunakan Marketing Tools', description: 'Maksimalkan link referral dan materi promosi', type: 'quiz', duration_minutes: 10, is_completed: false, is_locked: false, order: 4, points: 100 },
        { id: 5, title: 'Advanced: API & Integrasi', description: 'Hubungkan sistem kamu dengan API Trivgoo', type: 'article', duration_minutes: 20, is_completed: false, is_locked: true, order: 5, points: 150 },
      ]);
      setFaqs([
        { id: 1, question: 'Kapan komisi akan dicairkan?', answer: 'Komisi diproses setiap Jumat dan akan masuk ke rekening dalam 1-3 hari kerja setelah permintaan payout disetujui.', category: 'payment' },
        { id: 2, question: 'Bagaimana cara mengubah harga produk?', answer: 'Masuk ke menu "My Products", pilih produk yang ingin diubah, klik Edit, dan update harga di field yang tersedia. Perubahan akan aktif setelah disimpan.', category: 'product' },
        { id: 3, question: 'Apa syarat untuk menjadi agen terverifikasi?', answer: 'Kamu perlu mengunggah KTP/Paspor yang valid, dokumen NPWP, dan informasi rekening bank aktif. Proses verifikasi memakan waktu 1-3 hari kerja.', category: 'account' },
        { id: 4, question: 'Berapa persen komisi yang saya dapatkan?', answer: 'Komisi dasar adalah 10-15% tergantung kategori produk. Agen terverifikasi dengan performa tinggi bisa mendapatkan komisi hingga 20%.', category: 'payment' },
        { id: 5, question: 'Bagaimana cara menangani pelanggan yang cancel booking?', answer: 'Cancellation kebijakan ditentukan saat kamu buat produk. Jika pelanggan cancel sesuai kebijakan, refund diproses otomatis. Hubungi support jika ada sengketa.', category: 'booking' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const completedModules = modules.filter(m => m.is_completed).length;
  const totalPoints = modules.filter(m => m.is_completed).reduce((a, m) => a + m.points, 0);
  const progressPct = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;

  const filteredFaqs = faqs.filter(f =>
    f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const submitTicket = async (data: any) => {
    try {
      const res = await http.post('/agent/support/tickets', data);
      if (!res.data?.error) setTickets(prev => [res.data.data, ...prev]);
    } catch {
      const mockTicket: SupportTicket = {
        id: Date.now(),
        subject: data.subject,
        status: 'open',
        priority: data.priority,
        created_at: new Date().toISOString(),
        last_reply_at: null,
        category: data.category,
      };
      setTickets(prev => [mockTicket, ...prev]);
    }
    setShowNewTicket(false);
  };

  return (
    <div className="space-y-8">
      {showNewTicket && <NewTicketModal onClose={() => setShowNewTicket(false)} onSubmit={submitTicket} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support & Pelatihan</h2>
          <p className="text-gray-500 text-sm mt-1">Pusat bantuan, modul training, dan FAQ untuk agen</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Training Progress Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Progress Training</p>
            <h3 className="text-xl font-bold">{completedModules} dari {modules.length} modul selesai</h3>
          </div>
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
            <Award className="w-7 h-7 text-yellow-300" />
          </div>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-indigo-200">{progressPct}% selesai</span>
          <span className="text-yellow-300 font-bold">⭐ {totalPoints} poin training</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {([
          { key: 'training', label: 'Modul Training', icon: BookOpen },
          { key: 'tickets', label: 'Tiket Support', icon: LifeBuoy },
          { key: 'faq', label: 'FAQ', icon: HelpCircle },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Training */}
      {activeTab === 'training' && (
        <div className="space-y-3">
          {modules.map((m, i) => {
            const typeIcon = m.type === 'video' ? Video : m.type === 'article' ? FileText : Star;
            const typeColor = m.type === 'video' ? 'bg-red-100 text-red-600' : m.type === 'article' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600';
            const TypeIcon = typeIcon;
            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-5 transition-all ${
                  m.is_locked ? 'opacity-50 border-gray-100' : m.is_completed ? 'border-green-100' : 'border-gray-100 hover:border-primary-100 hover:shadow-md cursor-pointer'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${m.is_completed ? 'bg-green-100' : m.is_locked ? 'bg-gray-100' : typeColor}`}>
                  {m.is_completed
                    ? <CheckCircle className="w-6 h-6 text-green-600" />
                    : m.is_locked
                    ? <Lock className="w-6 h-6 text-gray-400" />
                    : <TypeIcon className="w-6 h-6" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-bold text-sm ${m.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {m.order}. {m.title}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor}`}>
                      {m.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">{m.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-gray-400 justify-end mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    {m.duration_minutes} mnt
                  </div>
                  <p className="text-xs font-bold text-amber-600">+{m.points} pts</p>
                  {!m.is_locked && !m.is_completed && (
                    <button className="mt-2 flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors">
                      Mulai <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewTicket(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors active:scale-95"
            >
              <MessageCircle className="w-4 h-4" /> Buat Tiket Baru
            </button>
          </div>
          {tickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <LifeBuoy className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium text-sm">Belum ada tiket support</p>
            </div>
          ) : (
            tickets.map(t => {
              const st = STATUS_CONFIG[t.status];
              const pr = PRIORITY_CONFIG[t.priority];
              return (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                        <span className={`text-xs font-bold ${pr.color}`}>{pr.label}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{t.category}</span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{t.subject}</p>
                      <p className="text-xs text-gray-400">Dibuat: {formatDate(t.created_at)} · Balas terakhir: {formatDate(t.last_reply_at)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={faqSearch}
              onChange={e => setFaqSearch(e.target.value)}
              placeholder="Cari pertanyaan..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
            />
          </div>
          <div className="space-y-2">
            {filteredFaqs.map(f => <FAQItem key={f.id} faq={f} />)}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <HelpCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">Tidak ada FAQ yang cocok</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSupport;

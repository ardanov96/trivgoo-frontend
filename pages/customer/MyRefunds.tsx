import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, RefreshCcw, Clock, CheckCircle2, XCircle,
  AlertCircle, ChevronDown, Search, Calendar, Banknote, ArrowUpRight,
} from 'lucide-react';

type RefundStatus = 'processing' | 'approved' | 'completed' | 'rejected';

interface Refund {
  id: string;
  bookingCode: string;
  productName: string;
  amount: number;
  requestDate: string;
  estimatedDate: string;
  status: RefundStatus;
  reason: string;
  bank: string;
  accountNumber: string;
  timeline: { date: string; label: string; done: boolean }[];
}

const MOCK_REFUNDS: Refund[] = [
  {
    id: 'RFD-001',
    bookingCode: 'TRV-20240315-001',
    productName: 'Paket Wisata Nusa Penida 3D2N',
    amount: 2_450_000,
    requestDate: '15 Mar 2024',
    estimatedDate: '22 Mar 2024',
    status: 'processing',
    reason: 'Pembatalan oleh customer',
    bank: 'BCA',
    accountNumber: '••••4291',
    timeline: [
      { date: '15 Mar 2024', label: 'Permintaan diterima', done: true },
      { date: '16 Mar 2024', label: 'Verifikasi booking',  done: true },
      { date: '18 Mar 2024', label: 'Disetujui admin',     done: false },
      { date: '22 Mar 2024', label: 'Dana dikembalikan',   done: false },
    ],
  },
  {
    id: 'RFD-002',
    bookingCode: 'TRV-20240201-009',
    productName: 'Villa Seminyak Deluxe 2 Malam',
    amount: 3_800_000,
    requestDate: '01 Feb 2024',
    estimatedDate: '08 Feb 2024',
    status: 'completed',
    reason: 'Perubahan jadwal mendadak',
    bank: 'Mandiri',
    accountNumber: '••••7734',
    timeline: [
      { date: '01 Feb 2024', label: 'Permintaan diterima', done: true },
      { date: '02 Feb 2024', label: 'Verifikasi booking',  done: true },
      { date: '04 Feb 2024', label: 'Disetujui admin',     done: true },
      { date: '08 Feb 2024', label: 'Dana dikembalikan',   done: true },
    ],
  },
  {
    id: 'RFD-003',
    bookingCode: 'TRV-20240110-042',
    productName: 'Sewa Mobil Avanza 3 Hari',
    amount: 900_000,
    requestDate: '10 Jan 2024',
    estimatedDate: '-',
    status: 'rejected',
    reason: 'Pembatalan < 24 jam sebelum keberangkatan',
    bank: 'BNI',
    accountNumber: '••••0012',
    timeline: [
      { date: '10 Jan 2024', label: 'Permintaan diterima', done: true },
      { date: '11 Jan 2024', label: 'Verifikasi booking',  done: true },
      { date: '11 Jan 2024', label: 'Ditolak — kebijakan pembatalan', done: true },
    ],
  },
];

const STATUS_CONFIG: Record<RefundStatus, { label: string; icon: React.ReactNode; badge: string; dot: string }> = {
  processing: { label: 'Diproses',    icon: <Clock className="w-4 h-4" />,        badge: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-400' },
  approved:   { label: 'Disetujui',   icon: <CheckCircle2 className="w-4 h-4" />, badge: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-400' },
  completed:  { label: 'Selesai',     icon: <CheckCircle2 className="w-4 h-4" />, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  rejected:   { label: 'Ditolak',     icon: <XCircle className="w-4 h-4" />,      badge: 'bg-red-50 text-red-600 border-red-200',        dot: 'bg-red-400' },
};

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const MyRefunds: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_REFUNDS[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | RefundStatus>('all');

  const filtered = MOCK_REFUNDS.filter(r => {
    const matchSearch = r.bookingCode.toLowerCase().includes(search.toLowerCase()) || r.productName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const selected = MOCK_REFUNDS.find(r => r.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/my-account" className="hover:text-primary-600 transition-colors">Akun Saya</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">Refunds</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
          <p className="text-sm text-gray-500 mt-1">Lacak status pengembalian dana Anda</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Refund', value: fmt(MOCK_REFUNDS.reduce((a, r) => r.status === 'completed' ? a + r.amount : a, 0)), color: 'text-emerald-600' },
            { label: 'Diproses',     value: String(MOCK_REFUNDS.filter(r => r.status === 'processing').length) + ' permintaan', color: 'text-amber-600' },
            { label: 'Ditolak',      value: String(MOCK_REFUNDS.filter(r => r.status === 'rejected').length) + ' permintaan',   color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {/* Search & filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari booking..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="relative">
                <select value={filter} onChange={e => setFilter(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="all">Semua</option>
                  <option value="processing">Diproses</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <RefreshCcw className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Tidak ada refund ditemukan</p>
              </div>
            ) : filtered.map(refund => {
              const cfg = STATUS_CONFIG[refund.status];
              return (
                <button key={refund.id} onClick={() => setSelectedId(refund.id)}
                  className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 transition-all duration-200 hover:shadow-md ${selectedId === refund.id ? 'border-primary-400 ring-2 ring-primary-100' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-mono text-gray-400">{refund.bookingCode}</p>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate mb-1">{refund.productName}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">{refund.requestDate}</p>
                    <p className="text-sm font-extrabold text-primary-600">{fmt(refund.amount)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {!selected ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center h-full flex flex-col items-center justify-center">
                <RefreshCcw className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">Pilih refund untuk melihat detail</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-mono text-gray-400 mb-1">{selected.bookingCode}</p>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">{selected.productName}</h3>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${STATUS_CONFIG[selected.status].badge}`}>
                    {STATUS_CONFIG[selected.status].icon}
                    {STATUS_CONFIG[selected.status].label}
                  </span>
                </div>

                {/* Amount */}
                <div className="bg-gradient-to-br from-primary-600 to-blue-700 rounded-2xl p-5 text-white">
                  <p className="text-xs opacity-70 mb-1">Jumlah Refund</p>
                  <p className="text-3xl font-extrabold">{fmt(selected.amount)}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs opacity-80">
                    <Banknote className="w-4 h-4" />
                    <span>Ke rekening {selected.bank} {selected.accountNumber}</span>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Tanggal Permintaan', value: selected.requestDate },
                    { label: 'Estimasi Cair',       value: selected.estimatedDate },
                    { label: 'Alasan',              value: selected.reason },
                    { label: 'Ref. ID',             value: selected.id },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-sm font-bold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Riwayat Proses</p>
                  <div className="relative pl-5">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                    <div className="space-y-5">
                      {selected.timeline.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 relative">
                          <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${step.done ? (selected.status === 'rejected' && i === selected.timeline.length - 1 ? 'bg-red-100 border-red-400' : 'bg-emerald-100 border-emerald-400') : 'bg-white border-gray-300'}`}>
                            {step.done && <div className={`w-2 h-2 rounded-full ${selected.status === 'rejected' && i === selected.timeline.length - 1 ? 'bg-red-400' : 'bg-emerald-400'}`} />}
                          </div>
                          <div className="flex-1 pb-1">
                            <p className={`text-sm font-bold ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selected.status === 'rejected' && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700 mb-0.5">Refund Ditolak</p>
                      <p className="text-xs text-red-500">Refund tidak dapat diproses karena tidak memenuhi kebijakan pembatalan. Hubungi customer service untuk bantuan lebih lanjut.</p>
                    </div>
                  </div>
                )}

                <button className="flex items-center gap-2 w-full justify-center py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  <ArrowUpRight className="w-4 h-4" /> Lihat Detail Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRefunds;

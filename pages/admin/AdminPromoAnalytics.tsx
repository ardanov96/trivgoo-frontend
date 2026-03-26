// pages/admin/AdminPromoAnalytics.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, TrendingUp, Target, DollarSign,
  Loader2, RefreshCw, ArrowLeft, Eye, Ticket, Megaphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { promoService, type PromoAnalyticsSummary, type PromoAnalyticsDaily } from '../../services/promoService';

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

const AdminPromoAnalytics: React.FC = () => {
  const { langPath } = useLangNavigate();
  const [summary, setSummary] = useState<PromoAnalyticsSummary[]>([]);
  const [daily, setDaily] = useState<PromoAnalyticsDaily[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceType, setSourceType] = useState<'voucher' | 'campaign'>('campaign');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 29);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await promoService.getAnalyticsSummary({ source_type: sourceType, date_from: dateFrom, date_to: dateTo });
      setSummary(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].source_id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDaily = async (id: number) => {
    try {
      const data = await promoService.getAnalyticsDaily({ source_type: sourceType, source_id: id, date_from: dateFrom, date_to: dateTo });
      setDaily(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadSummary(); }, [sourceType, dateFrom, dateTo]);
  useEffect(() => { if (selectedId) loadDaily(selectedId); }, [selectedId]);

  const totalDiscount = summary.reduce((s, r) => s + r.total_discount_given, 0);
  const totalRevenue = summary.reduce((s, r) => s + r.total_revenue, 0);
  const totalSuccess = summary.reduce((s, r) => s + r.total_success, 0);
  const avgConversion = summary.length > 0
    ? summary.reduce((s, r) => s + r.conversion_rate, 0) / summary.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={langPath('/admin/promo/campaigns')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Campaigns
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">Promo Analytics</h1>
              <p className="text-gray-500 text-sm mt-1">Performa voucher & campaign berdasarkan data</p>
            </div>
            <button onClick={loadSummary} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            {(['campaign', 'voucher'] as const).map(t => (
              <button key={t} onClick={() => { setSourceType(t); setSelectedId(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all
                  ${sourceType === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                {t === 'campaign' ? <Megaphone className="w-3.5 h-3.5" /> : <Ticket className="w-3.5 h-3.5" />}
                {t === 'campaign' ? 'Campaign' : 'Voucher'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500 font-semibold">Periode:</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-primary-500 transition-all" />
            <span className="text-xs text-gray-400">s/d</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-primary-500 transition-all" />
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Target, label: 'Total Digunakan', value: totalSuccess.toLocaleString('id-ID'), sub: 'kali', color: 'bg-blue-50 text-blue-600' },
            { icon: TrendingUp, label: 'Conversion Rate', value: `${avgConversion.toFixed(1)}%`, sub: 'rata-rata', color: 'bg-green-50 text-green-600' },
            { icon: DollarSign, label: 'Total Diskon Diberikan', value: formatRp(totalDiscount), sub: 'nilai diskon', color: 'bg-red-50 text-red-600' },
            { icon: BarChart2, label: 'Total Revenue', value: formatRp(totalRevenue), sub: 'dari promo', color: 'bg-primary-50 text-primary-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
              <p className="text-[10px] text-gray-400">{s.sub}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Summary List */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Performa per {sourceType === 'campaign' ? 'Campaign' : 'Voucher'}</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></div>
            ) : summary.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {summary.map(s => (
                  <button
                    key={s.source_id}
                    onClick={() => setSelectedId(s.source_id)}
                    className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${selectedId === s.source_id ? 'bg-gray-50 border-l-2 border-gray-900' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{s.source_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.total_success} digunakan · {s.conversion_rate.toFixed(1)}% konversi</p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, s.conversion_rate)}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold shrink-0">{formatRp(s.total_discount_given)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Daily Chart */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 text-sm mb-6">
              {selectedId ? `Tren Harian — ${summary.find(s => s.source_id === selectedId)?.source_name ?? ''}` : 'Pilih sumber untuk melihat tren'}
            </h3>
            {daily.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-300">
                <div className="text-center">
                  <BarChart2 className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm">Pilih campaign/voucher untuk melihat grafik</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Usage chart */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Penggunaan Harian</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: any) => [v, '']} labelFormatter={l => `Tgl: ${l}`} />
                      <Bar dataKey="success_count" fill="#111827" name="Berhasil" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fail_count" fill="#f3f4f6" name="Gagal" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Revenue chart */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Diskon vs Revenue (Rp)</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}rb`} />
                      <Tooltip formatter={(v: any) => [formatRp(v), '']} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="total_revenue" stroke="#111827" strokeWidth={2} dot={false} name="Revenue" />
                      <Line type="monotone" dataKey="total_discount_given" stroke="#ef4444" strokeWidth={2} dot={false} name="Diskon" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Summary Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Tabel Ringkasan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Nama', 'Impresi', 'Percobaan', 'Berhasil', 'Gagal', 'Konversi', 'Total Diskon', 'Revenue'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.map((s, idx) => (
                  <tr key={s.source_id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{s.source_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.total_impressions.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.total_attempts.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{s.total_success.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-sm text-red-500">{s.total_fail.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-sm font-bold text-primary-600">{s.conversion_rate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatRp(s.total_discount_given)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatRp(s.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPromoAnalytics;

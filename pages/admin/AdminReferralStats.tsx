// pages/admin/AdminReferralStats.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Trophy, TrendingUp, Gift, Search,
  RefreshCw, Loader2, Medal, Copy, Check,
} from 'lucide-react';
import { promoService, type ReferralStat } from '../../services/promoService';

const AdminReferralStats: React.FC = () => {
  const [stats, setStats] = useState<ReferralStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promoService.getReferralStats({ q: search, page, limit: 20 });
      setStats(res.stats);
      setMeta(res.meta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalUses = stats.reduce((s, r) => s + r.total_uses, 0);
  const totalPoints = stats.reduce((s, r) => s + r.total_points_given, 0);
  const topReferrer = stats[0];

  // Medal colors
  const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const rankBg = ['bg-yellow-50 border-yellow-200', 'bg-gray-50 border-gray-200', 'bg-amber-50 border-amber-200'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Referral Program Stats</h1>
            <p className="text-gray-500 text-sm mt-1">Leaderboard & statistik program referral Trivgoo</p>
          </div>
          <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all self-start">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </motion.div>

        {/* KPI */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Referrer', value: stats.length, color: 'bg-blue-50 text-blue-600' },
            { icon: TrendingUp, label: 'Total Referral', value: totalUses.toLocaleString('id-ID'), color: 'bg-green-50 text-green-600' },
            { icon: Gift, label: 'Total Points Diberikan', value: totalPoints.toLocaleString('id-ID'), color: 'bg-purple-50 text-purple-600' },
            { icon: Trophy, label: 'Top Referrer', value: topReferrer?.user_name ?? '—', color: 'bg-yellow-50 text-yellow-600', small: true },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className={`font-bold text-gray-900 ${s.small ? 'text-base truncate' : 'text-2xl'}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Top 3 Podium */}
        {stats.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">🏆 Top 3 Referrer</h2>
            <div className="grid grid-cols-3 gap-4">
              {stats.slice(0, 3).map((s, idx) => (
                <motion.div
                  key={s.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08 }}
                  className={`bg-white rounded-2xl border-2 p-5 text-center ${rankBg[idx] ?? 'bg-white border-gray-100'}`}
                >
                  <Medal className={`w-8 h-8 mx-auto mb-3 ${medalColors[idx]}`} />
                  <p className="font-bold text-gray-900 truncate">{s.user_name}</p>
                  <p className="text-xs text-gray-400 truncate mb-3">{s.user_email}</p>
                  <div className="bg-white/80 rounded-xl px-3 py-2">
                    <p className="text-2xl font-bold text-gray-900">{s.total_uses}</p>
                    <p className="text-xs text-gray-500">referral</p>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <code className="text-xs font-mono font-bold text-primary-600">{s.referral_code}</code>
                    <button onClick={() => handleCopy(s.referral_code)} className="text-gray-400 hover:text-gray-700 transition-colors">
                      {copiedCode === s.referral_code ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau email referrer..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 bg-gray-50 focus:bg-white transition-all" />
          </div>
        </motion.div>

        {/* Full Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" /></div>
          ) : stats.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium">Belum ada data referral</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['#', 'User', 'Kode Referral', 'Total Referral', 'Sudah Diberi Reward', 'Total Points'].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s, idx) => (
                    <motion.tr key={s.user_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                          ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-gray-800">{s.user_name}</p>
                        <p className="text-xs text-gray-400">{s.user_email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg tracking-widest">
                            {s.referral_code}
                          </code>
                          <button onClick={() => handleCopy(s.referral_code)} className="text-gray-400 hover:text-gray-700 transition-colors">
                            {copiedCode === s.referral_code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">{s.total_uses}</span>
                          {/* mini bar */}
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (s.total_uses / (stats[0]?.total_uses || 1)) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-700">{s.total_rewarded.toLocaleString('id-ID')}×</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-purple-600">{s.total_points_given.toLocaleString('id-ID')} pts</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">Halaman {meta.page} dari {meta.total_pages}</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold disabled:opacity-40 hover:bg-gray-50 transition-all">
                  ← Sebelumnya
                </button>
                <button disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold disabled:opacity-40 hover:bg-gray-50 transition-all">
                  Berikutnya →
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminReferralStats;

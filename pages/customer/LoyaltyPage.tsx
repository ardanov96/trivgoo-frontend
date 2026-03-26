import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, TrendingUp, Gift, History, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw,
  Sparkles, Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { loyaltyService, type PointBalance, type PointTransaction, type UserMembership } from '../../services/loyaltyService';
import MembershipCard from '../../components/MembershipCard';
import { useAuth } from '../../AuthContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; color: string; sign: '+' | '-' }> = {
  earn_purchase:    { label: 'Pembelian',       color: 'text-green-600', sign: '+' },
  earn_referral:    { label: 'Referral',         color: 'text-blue-600',  sign: '+' },
  earn_review:      { label: 'Ulasan Produk',    color: 'text-purple-600',sign: '+' },
  earn_birthday:    { label: 'Bonus Ulang Tahun',color: 'text-pink-600',  sign: '+' },
  earn_campaign:    { label: 'Campaign Bonus',   color: 'text-amber-600', sign: '+' },
  spend_redemption: { label: 'Redeem Voucher',   color: 'text-orange-600',sign: '-' },
  spend_checkout:   { label: 'Potong Checkout',  color: 'text-red-500',   sign: '-' },
  expired:          { label: 'Point Hangus',     color: 'text-gray-400',  sign: '-' },
  adjustment:       { label: 'Koreksi Admin',    color: 'text-gray-500',  sign: '+' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Component ─────────────────────────────────────────────────────────────────

const LoyaltyPage: React.FC = () => {
  const { langPath } = useLangNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [txMeta, setTxMeta] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'earn' | 'spend'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bal, mem, txRes] = await Promise.all([
        loyaltyService.getBalance(),
        loyaltyService.getMembership(),
        loyaltyService.getTransactions({ page: txPage, limit: 10 }),
      ]);
      setBalance(bal);
      setMembership(mem);
      setTransactions(txRes.transactions);
      setTxMeta(txRes.meta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [txPage]);

  useEffect(() => { load(); }, [load]);

  const filteredTx = transactions.filter(tx => {
    if (activeTab === 'earn') return tx.type.startsWith('earn');
    if (activeTab === 'spend') return tx.type.startsWith('spend') || tx.type === 'expired';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">Loyalty & Rewards</h1>
              <p className="text-gray-500 text-sm mt-3">Kumpulkan point, naik tier, dan nikmati keuntungan lebih besar</p>
            </div>
            <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>

        {/* ── Point Balance Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-7 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mb-1">Saldo Point</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold font-mono">{(balance?.balance ?? 0).toLocaleString('id-ID')}</span>
                  <span className="text-white/60 text-sm mb-2 font-semibold">pts</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Coins className="w-7 h-7 text-yellow-400" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Didapat', value: balance?.lifetime_earned ?? 0, color: 'text-green-400' },
                { label: 'Total Dipakai', value: balance?.lifetime_spent ?? 0, color: 'text-orange-400' },
                { label: 'Hangus', value: balance?.lifetime_expired ?? 0, color: 'text-red-400' },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-2xl p-3 border border-white/10">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`font-bold text-lg font-mono ${s.color}`}>{s.value.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3 mt-5">
              <Link
                to={langPath('/loyalty/redeem')}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-900 rounded-xl py-3 font-bold text-sm hover:bg-gray-100 transition-all active:scale-95"
              >
                <Gift className="w-4 h-4" />
                Tukar Point
              </Link>
              <Link
                to={langPath('/loyalty/history')}
                className="flex-1 flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white rounded-xl py-3 font-bold text-sm hover:bg-white/20 transition-all active:scale-95"
              >
                <History className="w-4 h-4" />
                Riwayat
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Membership Card ── */}
        {membership && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Membership Kamu</h2>
              <Link to={langPath('/loyalty/membership')} className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:underline">
                Detail <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <MembershipCard membership={membership} userName={user?.name} />
          </motion.div>
        )}

        {/* ── Quick Stats ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{membership?.tier.discount_percent ?? 0}%</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Diskon otomatis tier kamu</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{membership?.tier.point_multiplier ?? 1}×</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Multiplier point per transaksi</p>
            </div>
          </div>
        </motion.div>

        {/* ── Recent Transactions ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Riwayat Point</h2>
            <Link to={langPath('/loyalty/history')} className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:underline">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Tab filter */}
          <div className="flex gap-2 mb-4">
            {(['all', 'earn', 'spend'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all
                  ${activeTab === tab ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
              >
                {tab === 'all' ? 'Semua' : tab === 'earn' ? '+ Masuk' : '− Keluar'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredTx.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-medium">Belum ada transaksi point</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredTx.slice(0, 8).map((tx, i) => {
                  const meta = TYPE_META[tx.type] ?? { label: tx.type, color: 'text-gray-600', sign: '+' };
                  const isPositive = meta.sign === '+';
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                        {isPositive
                          ? <ArrowUpRight className={`w-5 h-5 ${meta.color}`} />
                          : <ArrowDownLeft className={`w-5 h-5 ${meta.color}`} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{meta.label}</p>
                        {tx.note && <p className="text-xs text-gray-400 truncate">{tx.note}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-bold text-base ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                          {meta.sign}{Math.abs(tx.points).toLocaleString('id-ID')} pts
                        </p>
                        <p className="text-xs text-gray-400">{tx.balance_after.toLocaleString('id-ID')} saldo</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoyaltyPage;

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Coins, TrendingUp, Gift, History, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw, Sparkles, Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../src/hooks/useLangNavigate';
import { loyaltyService, type PointBalance, type PointTransaction, type UserMembership } from '../../services/loyaltyService';
import MembershipCard from '../../components/MembershipCard';
import { useAuth } from '../../AuthContext';

// sign is data, not UI text — kept here; label is resolved via t() at render time
const TYPE_SIGN: Record<string, '+' | '-'> = {
  earn_purchase:    '+',
  earn_referral:    '+',
  earn_review:      '+',
  earn_birthday:    '+',
  earn_campaign:    '+',
  spend_redemption: '-',
  spend_checkout:   '-',
  expired:          '-',
  adjustment:       '+',
};

const TYPE_COLOR: Record<string, string> = {
  earn_purchase:    'text-green-600',
  earn_referral:    'text-blue-600',
  earn_review:      'text-purple-600',
  earn_birthday:    'text-pink-600',
  earn_campaign:    'text-amber-600',
  spend_redemption: 'text-orange-600',
  spend_checkout:   'text-red-500',
  expired:          'text-gray-400',
  adjustment:       'text-gray-500',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

const LoyaltyPage: React.FC = () => {
  const { t } = useTranslation();
  const { langPath } = useLangNavigate();
  const { user } = useAuth();

  const [balance, setBalance]           = useState<PointBalance | null>(null);
  const [membership, setMembership]     = useState<UserMembership | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [txPage, setTxPage]             = useState(1);
  const [txMeta, setTxMeta]             = useState<any>(null);
  const [activeTab, setActiveTab]       = useState<'all' | 'earn' | 'spend'>('all');

  // Resolved inside component so t() is in scope
  const TYPE_LABEL: Record<string, string> = {
    earn_purchase:    t('loyalty_page.tx_earn_purchase'),
    earn_referral:    t('loyalty_page.tx_earn_referral'),
    earn_review:      t('loyalty_page.tx_earn_review'),
    earn_birthday:    t('loyalty_page.tx_earn_birthday'),
    earn_campaign:    t('loyalty_page.tx_earn_campaign'),
    spend_redemption: t('loyalty_page.tx_spend_redemption'),
    spend_checkout:   t('loyalty_page.tx_spend_checkout'),
    expired:          t('loyalty_page.tx_expired'),
    adjustment:       t('loyalty_page.tx_adjustment'),
  };

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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [txPage]);

  useEffect(() => { load(); }, [load]);

  const filteredTx = transactions.filter(tx => {
    if (activeTab === 'earn')  return tx.type.startsWith('earn');
    if (activeTab === 'spend') return tx.type.startsWith('spend') || tx.type === 'expired';
    return true;
  });

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                {t('loyalty_page.page_title')}
              </h1>
              <p className="text-gray-500 text-sm mt-3">
                {t('loyalty_page.page_subtitle')}
              </p>
            </div>
            <button
              onClick={load}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all"
              aria-label={t('loyalty_page.refresh')}
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>

        {/* Point Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-7 text-white relative overflow-hidden shadow-2xl"
        >
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mb-1">
                  {t('loyalty_page.your_points')}
                </p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold font-mono">
                    {(balance?.balance ?? 0).toLocaleString('en-US')}
                  </span>
                  <span className="text-white/60 text-sm mb-2 font-semibold">pts</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Coins className="w-7 h-7 text-yellow-400" />
              </div>
            </div>

            {/* Lifetime stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t('loyalty_page.lifetime_earned'),  value: balance?.lifetime_earned  ?? 0, color: 'text-green-400'  },
                { label: t('loyalty_page.lifetime_spent'),   value: balance?.lifetime_spent   ?? 0, color: 'text-orange-400' },
                { label: t('loyalty_page.lifetime_expired'), value: balance?.lifetime_expired ?? 0, color: 'text-red-400'    },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-2xl p-3 border border-white/10">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`font-bold text-lg font-mono ${s.color}`}>{s.value.toLocaleString('en-US')}</p>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 mt-5">
              <Link
                to={langPath('/loyalty/redeem')}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-900 rounded-xl py-3 font-bold text-sm hover:bg-gray-100 transition-all active:scale-95"
              >
                <Gift className="w-4 h-4" /> {t('loyalty_page.redeem_button')}
              </Link>
              <Link
                to={langPath('/loyalty/history')}
                className="flex-1 flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white rounded-xl py-3 font-bold text-sm hover:bg-white/20 transition-all active:scale-95"
              >
                <History className="w-4 h-4" /> {t('loyalty_page.history_button')}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Membership Card */}
        {membership && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('loyalty_page.membership_section')}</h2>
              <Link
                to={langPath('/loyalty/membership')}
                className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:underline"
              >
                {t('common.view')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <MembershipCard membership={membership} userName={user?.name} />
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{membership?.tier.discount_percent ?? 0}%</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{t('loyalty_page.stat_discount')}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{membership?.tier.point_multiplier ?? 1}×</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{t('loyalty_page.stat_multiplier')}</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t('loyalty_page.history_section')}</h2>
            <Link
              to={langPath('/loyalty/history')}
              className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:underline"
            >
              {t('common.see_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Tab filter */}
          <div className="flex gap-2 mb-4">
            {(['all', 'earn', 'spend'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {tab === 'all'   ? t('loyalty_page.tab_all')
                : tab === 'earn' ? t('loyalty_page.tab_earn')
                :                  t('loyalty_page.tab_spend')}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredTx.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-medium">{t('loyalty_page.no_transactions')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredTx.slice(0, 8).map((tx, i) => {
                  const sign      = TYPE_SIGN[tx.type]  ?? '+';
                  const color     = TYPE_COLOR[tx.type] ?? 'text-gray-600';
                  const label     = TYPE_LABEL[tx.type] ?? tx.type;
                  const isPositive = sign === '+';

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                        {isPositive
                          ? <ArrowUpRight className={`w-5 h-5 ${color}`} />
                          : <ArrowDownLeft className={`w-5 h-5 ${color}`} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{label}</p>
                        {tx.note && <p className="text-xs text-gray-400 truncate">{tx.note}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-bold text-base ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                          {sign}{Math.abs(tx.points).toLocaleString('en-US')} pts
                        </p>
                        <p className="text-xs text-gray-400">
                          {tx.balance_after.toLocaleString('en-US')} {t('loyalty_page.balance_label')}
                        </p>
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

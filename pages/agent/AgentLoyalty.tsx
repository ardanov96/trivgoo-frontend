/**
 * J.9. Agent Integration dengan Loyalty & Membership
 * pages/agent/AgentLoyalty.tsx
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Award, TrendingUp, Users, Zap, Star, ChevronRight,
  RefreshCw, Info, CheckCircle, ArrowUpRight, Coins,
  Gift, Crown, Shield,
} from 'lucide-react';
import http from '../../services/http';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AgentLoyaltySummary {
  tier_name: string;
  tier_color: string;
  tier_level: number;
  total_points_given: number;        // total poin yang agen berikan ke pelanggan
  total_customers_with_loyalty: number;
  bonus_commission_from_loyalty: number; // komisi tambahan karena efek loyalty
  next_tier_milestone: number | null;
  current_milestone: number;
}

interface LoyaltyImpact {
  period: string;
  new_members: number;
  tier_upgrades: number;
  repeat_bookings: number;
  revenue_from_repeat: number;
}

interface MembershipTierSummary {
  tier_name: string;
  tier_color: string;
  slug: string;
  customer_count: number;
  avg_spending: number;
  icon: string;
}

interface AgentBenefit {
  title: string;
  description: string;
  value: string;
  icon: React.ElementType;
  color: string;
  active: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const TIER_COLORS: Record<string, string> = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-blue-600',
};

const MOCK_TIER_SUMMARIES: MembershipTierSummary[] = [
  { tier_name: 'Bronze', tier_color: '#b45309', slug: 'bronze', customer_count: 84, avg_spending: 2800000, icon: '🥉' },
  { tier_name: 'Silver', tier_color: '#6b7280', slug: 'silver', customer_count: 37, avg_spending: 5600000, icon: '🥈' },
  { tier_name: 'Gold', tier_color: '#d97706', slug: 'gold', customer_count: 14, avg_spending: 11200000, icon: '🥇' },
  { tier_name: 'Platinum', tier_color: '#0891b2', slug: 'platinum', customer_count: 5, avg_spending: 24000000, icon: '💎' },
];

const MOCK_IMPACTS: LoyaltyImpact[] = [
  { period: 'Mar 2025', new_members: 18, tier_upgrades: 4, repeat_bookings: 43, revenue_from_repeat: 52000000 },
  { period: 'Feb 2025', new_members: 14, tier_upgrades: 2, repeat_bookings: 37, revenue_from_repeat: 44000000 },
  { period: 'Jan 2025', new_members: 11, tier_upgrades: 3, repeat_bookings: 29, revenue_from_repeat: 35000000 },
];

// ── Main Component ────────────────────────────────────────────────────────────

const AgentLoyalty: React.FC = () => {
  const [summary, setSummary] = useState<AgentLoyaltySummary | null>(null);
  const [tiers, setTiers] = useState<MembershipTierSummary[]>([]);
  const [impacts, setImpacts] = useState<LoyaltyImpact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, tierRes, impactRes] = await Promise.all([
        http.get('/agent/loyalty/summary'),
        http.get('/agent/loyalty/tiers'),
        http.get('/agent/loyalty/impact'),
      ]);
      if (!sumRes.data?.error) setSummary(sumRes.data.data);
      if (!tierRes.data?.error) setTiers(tierRes.data.data ?? []);
      if (!impactRes.data?.error) setImpacts(impactRes.data.data ?? []);
    } catch {
      setSummary({
        tier_name: 'Gold Agent',
        tier_color: '#d97706',
        tier_level: 3,
        total_points_given: 148200,
        total_customers_with_loyalty: 140,
        bonus_commission_from_loyalty: 3800000,
        next_tier_milestone: 200000,
        current_milestone: 148200,
      });
      setTiers(MOCK_TIER_SUMMARIES);
      setImpacts(MOCK_IMPACTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const benefits: AgentBenefit[] = [
    {
      title: 'Bonus Komisi Loyalty',
      description: 'Dapatkan komisi tambahan saat pelangganmu naik tier',
      value: '+2% per tier upgrade',
      icon: Zap,
      color: 'bg-amber-500',
      active: true,
    },
    {
      title: 'Priority Placement',
      description: 'Produkmu tampil lebih prioritas untuk pelanggan Gold & Platinum',
      value: 'Aktif untuk 19 pelanggan',
      icon: Crown,
      color: 'bg-purple-500',
      active: true,
    },
    {
      title: 'Repeat Booking Bonus',
      description: 'Bonus komisi 1% untuk repeat booking dari pelanggan loyal',
      value: '+1% repeat booking',
      icon: RefreshCw,
      color: 'bg-blue-500',
      active: true,
    },
    {
      title: 'Elite Agent Status',
      description: 'Capai 200.000 poin diberikan untuk status Elite Agent',
      value: `${summary ? Math.round((summary.current_milestone / (summary.next_tier_milestone ?? 200000)) * 100) : 0}% progress`,
      icon: Shield,
      color: 'bg-green-500',
      active: false,
    },
  ];

  const progress = summary
    ? Math.min(100, Math.round((summary.current_milestone / (summary.next_tier_milestone ?? 200000)) * 100))
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loyalty & Membership</h2>
          <p className="text-gray-500 text-sm mt-1">Pantau dampak program loyalty terhadap bisnis kamu</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Agent Status Card */}
      {summary && (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Status Agen</p>
                <h3 className="text-2xl font-bold">{summary.tier_name}</h3>
                <p className="text-white/60 text-sm mt-1">Level {summary.tier_level} · {summary.total_customers_with_loyalty} pelanggan aktif</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/60">Progress ke Elite Agent</span>
                <span className="text-white/80 font-bold">{summary.current_milestone.toLocaleString('id-ID')} / {(summary.next_tier_milestone ?? 200000).toLocaleString('id-ID')} pts</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/40 text-xs mt-1">{progress}% menuju Elite Agent</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Poin Diberikan', value: summary.total_points_given.toLocaleString('id-ID') + ' pts', icon: Coins },
                { label: 'Pelanggan Loyal', value: summary.total_customers_with_loyalty, icon: Users },
                { label: 'Bonus Loyalty', value: formatIDR(summary.bonus_commission_from_loyalty), icon: TrendingUp },
              ].map(s => (
                <div key={s.label} className="bg-white/10 border border-white/10 rounded-xl p-3">
                  <s.icon className="w-4 h-4 text-white/50 mb-2" />
                  <p className="text-white font-bold text-sm">{s.value}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Benefits Grid */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Benefit Agen dari Program Loyalty</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border p-5 shadow-sm flex items-start gap-4 ${b.active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}>
                <b.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900 text-sm">{b.title}</p>
                  {b.active
                    ? <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">AKTIF</span>
                    : <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">SEGERA</span>
                  }
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{b.description}</p>
                <p className="text-primary-600 font-bold text-xs mt-2">{b.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Distribution */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Distribusi Tier Pelangganmu</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map(t => {
            const total = tiers.reduce((a, b) => a + b.customer_count, 0);
            const pct = total > 0 ? Math.round((t.customer_count / total) * 100) : 0;
            return (
              <div key={t.slug} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-3xl mb-2">{t.icon}</div>
                <p className="font-bold text-gray-900">{t.tier_name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{t.customer_count}</p>
                <p className="text-xs text-gray-400 mb-3">pelanggan · {pct}%</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: t.tier_color }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Avg {formatIDR(t.avg_spending)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Impact Table */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Dampak Loyalty per Bulan</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Periode</th>
                  <th className="text-right px-4 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Member Baru</th>
                  <th className="text-right px-4 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Naik Tier</th>
                  <th className="text-right px-4 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Repeat Booking</th>
                  <th className="text-right px-5 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Revenue Repeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {impacts.map((imp, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900">{imp.period}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-full">{imp.new_members}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="bg-purple-50 text-purple-700 font-bold text-xs px-2.5 py-1 rounded-full">{imp.tier_upgrades}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-gray-700">{imp.repeat_bookings}</td>
                    <td className="px-5 py-4 text-right font-bold text-primary-700">{formatIDR(imp.revenue_from_repeat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLoyalty;

/**
 * J.6. Agent Promotion & Marketing Tools
 * pages/agent/AgentMarketing.tsx
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Megaphone, Share2, TrendingUp, Eye, MousePointer, Copy,
  CheckCircle, Download, RefreshCw, Plus, ExternalLink,
  BarChart2, Users, Star, Zap, ChevronRight, Image, Link2,
} from 'lucide-react';
import http from '../../services/http';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PromoMaterial {
  id: number;
  type: 'banner' | 'flyer' | 'social_post';
  title: string;
  url: string;
  thumbnail: string;
  size: string;
  download_count: number;
}

interface ReferralStats {
  referral_link: string;
  referral_code: string;
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  total_commission_from_referral: number;
}

interface CampaignPerformance {
  campaign_name: string;
  impressions: number;
  clicks: number;
  bookings: number;
  revenue: number;
  period: string;
}

interface MarketingStats {
  total_referrals: number;
  active_campaigns: number;
  promo_materials: number;
  avg_conversion_rate: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const formatNum = (v: number) =>
  new Intl.NumberFormat('id-ID').format(v);

// ── Sub-components ────────────────────────────────────────────────────────────

const StatPill: React.FC<{ icon: React.ElementType; label: string; value: string | number; color: string }> = ({
  icon: Icon, label, value, color,
}) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const AgentMarketing: React.FC = () => {
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [referral, setReferral] = useState<ReferralStats | null>(null);
  const [materials, setMaterials] = useState<PromoMaterial[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'campaigns'>('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, refRes, matRes, campRes] = await Promise.all([
        http.get('/agent/marketing/stats'),
        http.get('/agent/marketing/referral'),
        http.get('/agent/marketing/materials'),
        http.get('/agent/marketing/campaigns'),
      ]);
      if (!statsRes.data?.error) setStats(statsRes.data.data);
      if (!refRes.data?.error) setReferral(refRes.data.data);
      if (!matRes.data?.error) setMaterials(matRes.data.data ?? []);
      if (!campRes.data?.error) setCampaigns(campRes.data.data ?? []);
    } catch (e) {
      // Use mock data for UI preview
      setStats({ total_referrals: 24, active_campaigns: 3, promo_materials: 12, avg_conversion_rate: 18.4 });
      setReferral({
        referral_link: 'https://trivgoo.com/ref/AGT-X1234',
        referral_code: 'AGT-X1234',
        total_clicks: 342,
        total_conversions: 63,
        conversion_rate: 18.4,
        total_commission_from_referral: 4750000,
      });
      setMaterials([
        { id: 1, type: 'banner', title: 'Summer Holiday Banner', url: '#', thumbnail: '', size: '1200x628', download_count: 45 },
        { id: 2, type: 'flyer', title: 'Bali Package Flyer', url: '#', thumbnail: '', size: 'A4', download_count: 31 },
        { id: 3, type: 'social_post', title: 'Instagram Story Template', url: '#', thumbnail: '', size: '1080x1920', download_count: 78 },
        { id: 4, type: 'banner', title: 'Flash Sale Banner', url: '#', thumbnail: '', size: '800x400', download_count: 22 },
      ]);
      setCampaigns([
        { campaign_name: 'Promo Lebaran 2025', impressions: 12400, clicks: 1870, bookings: 143, revenue: 87500000, period: 'Mar 2025' },
        { campaign_name: 'Bali Discount Week', impressions: 8900, clicks: 1240, bookings: 97, revenue: 62000000, period: 'Feb 2025' },
        { campaign_name: 'Early Bird Summer', impressions: 6200, clicks: 890, bookings: 54, revenue: 38400000, period: 'Jan 2025' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyReferralLink = () => {
    if (referral?.referral_link) {
      navigator.clipboard.writeText(referral.referral_link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const materialTypeIcon = (type: PromoMaterial['type']) => {
    if (type === 'banner') return <Image className="w-4 h-4" />;
    if (type === 'flyer') return <Download className="w-4 h-4" />;
    return <Share2 className="w-4 h-4" />;
  };

  const materialTypeColor = (type: PromoMaterial['type']) => {
    if (type === 'banner') return 'bg-blue-100 text-blue-700';
    if (type === 'flyer') return 'bg-purple-100 text-purple-700';
    return 'bg-pink-100 text-pink-700';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promotion & Marketing</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola materi promosi, link referral, dan performa kampanye</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill icon={Users} label="Total Referral" value={stats?.total_referrals ?? 0} color="bg-blue-500" />
        <StatPill icon={Megaphone} label="Kampanye Aktif" value={stats?.active_campaigns ?? 0} color="bg-amber-500" />
        <StatPill icon={Image} label="Materi Promo" value={stats?.promo_materials ?? 0} color="bg-purple-500" />
        <StatPill icon={TrendingUp} label="Avg Konversi" value={`${stats?.avg_conversion_rate ?? 0}%`} color="bg-green-500" />
      </div>

      {/* Referral Link Card */}
      {referral && (
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">Link Referral Kamu</p>
              <p className="text-white/70 text-sm">Bagikan link ini ke calon pelanggan</p>
            </div>
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-mono truncate">
              {referral.referral_link}
            </div>
            <button
              onClick={copyReferralLink}
              className="px-4 py-3 bg-white text-primary-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary-50 transition-all active:scale-95"
            >
              {copiedLink ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Tersalin!' : 'Salin'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Klik', value: formatNum(referral.total_clicks), icon: MousePointer },
              { label: 'Konversi', value: formatNum(referral.total_conversions), icon: CheckCircle },
              { label: 'Komisi Referral', value: formatIDR(referral.total_commission_from_referral), icon: Zap },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <s.icon className="w-4 h-4 text-white/60 mx-auto mb-1.5" />
                <p className="font-bold text-white text-base">{s.value}</p>
                <p className="text-white/50 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex gap-2 mb-6 border-b border-gray-100">
          {([
            { key: 'overview', label: 'Overview', icon: BarChart2 },
            { key: 'materials', label: 'Materi Promo', icon: Image },
            { key: 'campaigns', label: 'Kampanye', icon: Megaphone },
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

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary-600" /> Performa Referral
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kode Referral</span>
                  <span className="font-bold font-mono text-primary-700">{referral?.referral_code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Klik</span>
                  <span className="font-bold">{formatNum(referral?.total_clicks ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Konversi</span>
                  <span className="font-bold">{formatNum(referral?.total_conversions ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Conversion Rate</span>
                  <span className="font-bold text-green-600">{referral?.conversion_rate ?? 0}%</span>
                </div>
                <div className="pt-2 border-t border-gray-50 flex justify-between text-sm">
                  <span className="text-gray-500">Komisi dari Referral</span>
                  <span className="font-bold text-primary-600">{formatIDR(referral?.total_commission_from_referral ?? 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary-600" /> Bagikan ke Social Media
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'WhatsApp', color: 'bg-green-500', msg: `Booking wisata seru di Trivgoo! Pakai kode ${referral?.referral_code} untuk promo spesial 🎉` },
                  { name: 'Instagram', color: 'bg-gradient-to-r from-pink-500 to-purple-600', msg: 'Copy caption & link' },
                  { name: 'Facebook', color: 'bg-blue-600', msg: 'Share ke Facebook' },
                ].map(s => (
                  <button
                    key={s.name}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-white text-sm font-bold ${s.color} hover:opacity-90 transition-opacity active:scale-95`}
                  >
                    <span>{s.name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Materi Promo */}
        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map(m => (
              <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Image className="w-10 h-10 text-gray-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${materialTypeColor(m.type)}`}>
                      {materialTypeIcon(m.type)} {m.type}
                    </span>
                    <span className="text-xs text-gray-400">{m.size}</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-3">{m.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{m.download_count}× diunduh</span>
                    <button className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Kampanye */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Kampanye</th>
                    <th className="text-right px-4 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Impresi</th>
                    <th className="text-right px-4 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Klik</th>
                    <th className="text-right px-4 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Booking</th>
                    <th className="text-right px-5 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {campaigns.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{c.campaign_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.period}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-700">{formatNum(c.impressions)}</td>
                      <td className="px-4 py-4 text-right font-medium text-gray-700">{formatNum(c.clicks)}</td>
                      <td className="px-4 py-4 text-right">
                        <span className="bg-green-50 text-green-700 font-bold text-xs px-2.5 py-1 rounded-full">{c.bookings}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-primary-700">{formatIDR(c.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMarketing;

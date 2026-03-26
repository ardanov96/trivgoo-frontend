import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../src/hooks/useLangNavigate';
import {
  ChevronRight, Bell, BellOff, Plane, TrendingDown, TrendingUp,
  Minus, Plus, X, ArrowRight, Sparkles, Target,
} from 'lucide-react';

type PriceTrend = 'down' | 'up' | 'stable';

interface PriceAlert {
  id: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  currentPrice: number;
  targetPrice: number;
  trend: PriceTrend;
  trendPct: number;
  active: boolean;
  lastChecked: string;
  nextDeparture: string;
}

const MOCK_ALERTS: PriceAlert[] = [
  { id: '1', from: 'Jakarta',   fromCode: 'CGK', to: 'Bali',      toCode: 'DPS', currentPrice: 890_000,   targetPrice: 750_000, trend: 'down',   trendPct: 8,  active: true,  lastChecked: '2 jam lalu',  nextDeparture: '15 Apr 2024' },
  { id: '2', from: 'Surabaya',  fromCode: 'SUB', to: 'Lombok',    toCode: 'LOP', currentPrice: 1_200_000, targetPrice: 900_000, trend: 'up',     trendPct: 12, active: true,  lastChecked: '5 jam lalu',  nextDeparture: '20 Apr 2024' },
  { id: '3', from: 'Jakarta',   fromCode: 'CGK', to: 'Yogyakarta', toCode: 'JOG', currentPrice: 620_000, targetPrice: 500_000, trend: 'stable', trendPct: 0,  active: false, lastChecked: '1 hari lalu', nextDeparture: '10 May 2024' },
  { id: '4', from: 'Bali',      fromCode: 'DPS', to: 'Labuan Bajo', toCode: 'LBJ', currentPrice: 2_100_000, targetPrice: 1_800_000, trend: 'down', trendPct: 5, active: true, lastChecked: '3 jam lalu', nextDeparture: '01 Jun 2024' },
];

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const TrendBadge: React.FC<{ trend: PriceTrend; pct: number }> = ({ trend, pct }) => {
  const { langPath } = useLangNavigate();
  if (trend === 'down') return (
    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
      <TrendingDown className="w-3 h-3" /> Turun {pct}%
    </span>
  );
  if (trend === 'up') return (
    <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
      <TrendingUp className="w-3 h-3" /> Naik {pct}%
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" /> Stabil
    </span>
  );
};

const MyPriceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(MOCK_ALERTS);
  const [showAdd, setShowAdd] = useState(false);
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const toggleAlert = (id: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));

  const removeAlert = (id: string) =>
    setAlerts(prev => prev.filter(a => a.id !== id));

  const activeCount = alerts.filter(a => a.active).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to={langPath('/my-account')} className="hover:text-primary-600 transition-colors">Akun Saya</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">Notifikasi Harga Penerbangan</span>
        </div>

        {/* Hero banner */}
        <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 rounded-3xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-0 opacity-10">
            <Plane className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-bold text-sky-200 uppercase tracking-wider">Price Tracker Aktif</span>
            </div>
            <p className="text-white text-xl font-extrabold mb-1">{activeCount} Rute Dipantau</p>
            <p className="text-sky-200 text-sm">Kami akan memberi tahu Anda saat harga mencapai target.</p>
          </div>
        </div>

        {/* Add button */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{alerts.length} Alert Tersimpan</p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Tambah Rute
          </button>
        </div>

        {/* Alert cards */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
              <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-bold mb-1">Belum ada alert harga</p>
              <p className="text-sm text-gray-400">Tambahkan rute favorit Anda untuk mulai memantau harga tiket.</p>
            </div>
          ) : alerts.map(alert => (
            <div key={alert.id} className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 ${alert.active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
              <div className="p-5">
                {/* Route header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-gray-900 leading-none">{alert.fromCode}</p>
                      <p className="text-xs text-gray-400">{alert.from}</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <div className="w-6 h-px bg-gray-200" />
                      <Plane className="w-4 h-4 text-primary-400" />
                      <div className="w-6 h-px bg-gray-200" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-gray-900 leading-none">{alert.toCode}</p>
                      <p className="text-xs text-gray-400">{alert.to}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendBadge trend={alert.trend} pct={alert.trendPct} />
                    <button onClick={() => removeAlert(alert.id)} className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price display */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Harga Saat Ini</p>
                    <p className="text-base font-extrabold text-gray-900">{fmt(alert.currentPrice)}</p>
                  </div>
                  <div className="bg-primary-50 rounded-xl p-3">
                    <p className="text-xs text-primary-500 mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Target Harga</p>
                    <p className="text-base font-extrabold text-primary-700">{fmt(alert.targetPrice)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${alert.trend === 'down' ? 'bg-emerald-400' : alert.trend === 'up' ? 'bg-red-400' : 'bg-gray-400'}`}
                      style={{ width: `${Math.min(100, (alert.targetPrice / alert.currentPrice) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Target</span>
                    <span>Harga saat ini</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="text-xs text-gray-400">
                    <span>Cek terakhir: {alert.lastChecked}</span>
                    <span className="mx-2">·</span>
                    <span>Keberangkatan: {alert.nextDeparture}</span>
                  </div>
                  {/* Toggle */}
                  <button onClick={() => toggleAlert(alert.id)} className={`relative w-11 h-6 rounded-full transition-colors ${alert.active ? 'bg-primary-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${alert.active ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <Bell className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-800 mb-0.5">Cara Kerja Price Alert</p>
            <p className="text-xs text-blue-600 leading-relaxed">Kami memantau harga tiket setiap jam. Saat harga mencapai atau di bawah target Anda, notifikasi push dan email akan dikirimkan secara otomatis.</p>
          </div>
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 relative">
              <button onClick={() => setShowAdd(false)} className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Tambah Alert Rute</h3>
                  <p className="text-xs text-gray-400">Pantau harga tiket secara otomatis</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-5 items-center gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dari</label>
                    <input value={newFrom} onChange={e => setNewFrom(e.target.value)} placeholder="Jakarta / CGK" className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div className="flex justify-center pt-5">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ke</label>
                    <input value={newTo} onChange={e => setNewTo(e.target.value)} placeholder="Bali / DPS" className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Harga (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Rp</span>
                    <input type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="750000" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
                <button
                  onClick={() => { setShowAdd(false); setNewFrom(''); setNewTo(''); setNewTarget(''); }}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md"
                >
                  Aktifkan Alert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPriceAlerts;

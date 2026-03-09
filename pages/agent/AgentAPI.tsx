/**
 * J.10. Agent API & Integration
 * pages/agent/AgentAPI.tsx
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Code2, Key, Copy, CheckCircle, RefreshCw, Eye, EyeOff,
  Zap, AlertTriangle, ToggleLeft, ToggleRight, Plus,
  Webhook, Activity, Shield, BookOpen, ExternalLink,
} from 'lucide-react';
import http from '../../services/http';

// ── Types ─────────────────────────────────────────────────────────────────────

interface APIKey {
  id: number;
  label: string;
  key_preview: string;  // masked, e.g. "sk-ag-****-ABCD"
  key_full?: string;    // only shown once on creation
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
  permissions: string[];
}

interface WebhookConfig {
  id: number;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  success_count: number;
  fail_count: number;
}

interface APIUsage {
  period: string;
  requests: number;
  errors: number;
  quota: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

const ConfirmModal: React.FC<{ title: string; message: string; onConfirm: () => void; onCancel: () => void }> = ({
  title, message, onConfirm, onCancel,
}) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">
          Konfirmasi
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const AgentAPI: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [usage, setUsage] = useState<APIUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showKeyId, setShowKeyId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks' | 'docs'>('keys');
  const [confirmRevoke, setConfirmRevoke] = useState<number | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showAddWebhook, setShowAddWebhook] = useState(false);

  const AVAILABLE_EVENTS = [
    'booking.created', 'booking.confirmed', 'booking.cancelled',
    'payment.received', 'commission.paid', 'review.created',
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [keysRes, whRes, usageRes] = await Promise.all([
        http.get('/agent/api/keys'),
        http.get('/agent/api/webhooks'),
        http.get('/agent/api/usage'),
      ]);
      if (!keysRes.data?.error) setApiKeys(keysRes.data.data ?? []);
      if (!whRes.data?.error) setWebhooks(whRes.data.data ?? []);
      if (!usageRes.data?.error) setUsage(usageRes.data.data ?? []);
    } catch {
      setApiKeys([
        { id: 1, label: 'Production Key', key_preview: 'sk-ag-****-A3F9', created_at: '2025-01-15T00:00:00Z', last_used_at: '2025-03-09T08:30:00Z', is_active: true, permissions: ['read', 'write'] },
        { id: 2, label: 'Webhook Verification', key_preview: 'sk-ag-****-7B2D', created_at: '2025-02-01T00:00:00Z', last_used_at: null, is_active: false, permissions: ['read'] },
      ]);
      setWebhooks([
        { id: 1, url: 'https://myapp.com/hooks/trivgoo', events: ['booking.created', 'payment.received'], is_active: true, last_triggered_at: '2025-03-09T07:00:00Z', success_count: 248, fail_count: 3 },
      ]);
      setUsage([
        { period: 'Mar 2025', requests: 1248, errors: 12, quota: 10000 },
        { period: 'Feb 2025', requests: 986, errors: 5, quota: 10000 },
        { period: 'Jan 2025', requests: 742, errors: 8, quota: 10000 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyKey = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const revokeKey = async (id: number) => {
    try {
      await http.delete(`/agent/api/keys/${id}`);
      setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch {
      setApiKeys(prev => prev.filter(k => k.id !== id));
    }
    setConfirmRevoke(null);
  };

  const generateKey = async () => {
    try {
      const res = await http.post('/agent/api/keys', { label: 'New Key' });
      if (!res.data?.error) setApiKeys(prev => [...prev, res.data.data]);
    } catch {
      const mockKey: APIKey = {
        id: Date.now(),
        label: 'New Key',
        key_preview: 'sk-ag-****-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        created_at: new Date().toISOString(),
        last_used_at: null,
        is_active: true,
        permissions: ['read'],
      };
      setApiKeys(prev => [...prev, mockKey]);
    }
  };

  const addWebhook = async () => {
    if (!webhookUrl) return;
    try {
      const res = await http.post('/agent/api/webhooks', { url: webhookUrl, events: selectedEvents });
      if (!res.data?.error) setWebhooks(prev => [...prev, res.data.data]);
    } catch {
      const mockWh: WebhookConfig = {
        id: Date.now(),
        url: webhookUrl,
        events: selectedEvents,
        is_active: true,
        last_triggered_at: null,
        success_count: 0,
        fail_count: 0,
      };
      setWebhooks(prev => [...prev, mockWh]);
    }
    setWebhookUrl('');
    setSelectedEvents([]);
    setShowAddWebhook(false);
  };

  const CODE_EXAMPLE = `// Contoh: Get Booking List
const response = await fetch(
  'https://api.trivgoo.com/v1/agent/bookings',
  {
    headers: {
      'Authorization': 'Bearer sk-ag-****-A3F9',
      'Content-Type': 'application/json',
    },
  }
);
const data = await response.json();`;

  return (
    <div className="space-y-8">
      {confirmRevoke && (
        <ConfirmModal
          title="Cabut API Key?"
          message="API key ini akan non-aktif permanen dan semua integrasi yang menggunakannya akan berhenti bekerja."
          onConfirm={() => revokeKey(confirmRevoke)}
          onCancel={() => setConfirmRevoke(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API & Integrasi</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola API key, webhook, dan integrasikan sistem eksternal</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {usage.slice(0, 1).map(u => (
          <React.Fragment key={u.period}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Request Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900">{u.requests.toLocaleString('id-ID')}</p>
                <div className="h-1 bg-gray-100 rounded-full mt-2 w-24">
                  <div className="h-1 bg-blue-500 rounded-full" style={{ width: `${Math.round((u.requests / u.quota) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">dari {u.quota.toLocaleString('id-ID')} quota</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{u.errors}</p>
                <p className="text-xs text-gray-400 mt-1">{((u.errors / u.requests) * 100).toFixed(2)}% dari total</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">API Keys Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{apiKeys.filter(k => k.is_active).length}</p>
                <p className="text-xs text-gray-400 mt-1">{apiKeys.length} total keys</p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 mb-0">
        {([
          { key: 'keys', label: 'API Keys', icon: Key },
          { key: 'webhooks', label: 'Webhooks', icon: Webhook },
          { key: 'docs', label: 'Dokumentasi', icon: BookOpen },
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

      {/* Tab: API Keys */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={generateKey}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" /> Generate API Key
            </button>
          </div>

          {apiKeys.map(k => (
            <div key={k.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-gray-900">{k.label}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${k.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {k.is_active ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-mono text-gray-700">
                      {showKeyId === k.id && k.key_full ? k.key_full : k.key_preview}
                    </code>
                    {k.key_full && (
                      <button onClick={() => setShowKeyId(showKeyId === k.id ? null : k.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {showKeyId === k.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                    <button onClick={() => copyKey(k.id, k.key_full ?? k.key_preview)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {copiedId === k.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Dibuat: {formatDate(k.created_at)}</span>
                    <span>Terakhir dipakai: {formatDate(k.last_used_at)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {k.permissions.map(p => (
                      <span key={p} className="bg-primary-50 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setConfirmRevoke(k.id)}
                  className="ml-4 text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 border border-red-100 rounded-lg hover:bg-red-50"
                >
                  Cabut
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddWebhook(!showAddWebhook)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tambah Webhook
            </button>
          </div>

          {showAddWebhook && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-gray-900">Konfigurasi Webhook Baru</h4>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">URL Endpoint</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://myapp.com/webhook"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Events</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_EVENTS.map(ev => (
                    <button
                      key={ev}
                      onClick={() => setSelectedEvents(prev =>
                        prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
                      )}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                        selectedEvents.includes(ev)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {ev}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddWebhook(false)} className="px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
                <button onClick={addWebhook} className="px-4 py-2 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700">Simpan</button>
              </div>
            </div>
          )}

          {webhooks.map(wh => (
            <div key={wh.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="text-sm font-mono text-gray-800 font-bold">{wh.url}</code>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${wh.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {wh.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {wh.events.map(e => (
                      <span key={e} className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="text-green-600 font-bold">✓ {wh.success_count}</span>
                    <span className="text-red-500 font-bold">✗ {wh.fail_count}</span>
                    <span>Terakhir: {formatDate(wh.last_triggered_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Docs */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary-600" /> Contoh Penggunaan API
            </h3>
            <p className="text-gray-500 text-sm mb-4">Autentikasi menggunakan Bearer Token di header Authorization</p>
            <pre className="bg-gray-900 text-green-400 rounded-xl p-5 text-xs font-mono overflow-x-auto leading-relaxed">
              {CODE_EXAMPLE}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'REST API Reference', desc: 'Dokumentasi lengkap semua endpoint', href: '#' },
              { title: 'Webhook Guide', desc: 'Cara setup dan verifikasi webhook', href: '#' },
              { title: 'SDK & Libraries', desc: 'JavaScript, PHP, Python SDK', href: '#' },
              { title: 'Changelog', desc: 'Update terbaru API Trivgoo', href: '#' },
            ].map(d => (
              <a
                key={d.title}
                href={d.href}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between group hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{d.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{d.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentAPI;

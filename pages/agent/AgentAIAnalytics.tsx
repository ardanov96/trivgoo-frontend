// AgentAIAnalytics.tsx
// Taruh di: pages/agent/AgentAIAnalytics.tsx (atau import di AgentDashboard)
// Backend endpoint perlu ditambahkan — lihat komentar di bawah

import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Eye, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import http from '../../services/http';

interface ImpressionRow {
  product_name:    string;
  image:           string;
  total_impressions: number;
  unique_users:    number;
  active_days:     number;
  last_seen:       string;
}

const AgentAIAnalytics: React.FC = () => {
  const [data, setData]       = useState<ImpressionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    http.get('/agent/ai-impressions')
      .then(res => {
        if (!res.data?.error) {
          setData(res.data.data ?? []);
          setTotal((res.data.data ?? []).reduce((s: number, r: ImpressionRow) => s + r.total_impressions, 0));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI Planner Analytics</h3>
          <p className="text-xs text-gray-500">Seberapa sering produkmu muncul di AI Trip Planner</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wide">Total Impresi</span>
          </div>
          <p className="text-2xl font-bold text-primary-700 tabular-nums">
            {loading ? '...' : total.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-primary-400 mt-0.5">kali muncul di rekomendasi AI</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">Produk Aktif</span>
          </div>
          <p className="text-2xl font-bold text-orange-700 tabular-nums">
            {loading ? '...' : data.length}
          </p>
          <p className="text-[10px] text-orange-400 mt-0.5">produk pernah direkomendasikan</p>
        </div>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-500">Belum ada impresi</p>
          <p className="text-xs text-gray-400 mt-1">Produkmu akan muncul di sini saat direkomendasikan AI</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((row, i) => (
            <motion.div
              key={row.product_name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 hover:border-gray-200 transition-colors"
            >
              {/* Rank */}
              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-gray-500">{i + 1}</span>
              </div>

              {/* Thumbnail */}
              {row.image && (
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={row.image} alt={row.product_name} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 line-clamp-1">{row.product_name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {row.unique_users} user unik · {row.active_days} hari aktif
                </p>
              </div>

              {/* Impression count */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <TrendingUp className="w-3 h-3 text-primary-500" />
                <span className="text-sm font-bold text-primary-700 tabular-nums">
                  {row.total_impressions.toLocaleString('id-ID')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Tips: Lengkapi deskripsi dan foto produk agar lebih sering muncul di rekomendasi AI
      </p>
    </div>
  );
};

export default AgentAIAnalytics;

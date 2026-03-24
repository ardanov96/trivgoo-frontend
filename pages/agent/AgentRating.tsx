/**
 * J.12. Agent Rating & Quality Control
 * pages/agent/AgentRating.tsx
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Star, TrendingUp, TrendingDown, MessageSquare, ThumbsUp,
  ThumbsDown, Flag, RefreshCw, Filter, ChevronRight,
  AlertCircle, CheckCircle, Award, BarChart2, Eye,
} from 'lucide-react';
import http from '../../services/http';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RatingSummary {
  overall_rating: number;
  total_reviews: number;
  response_rate: number;
  response_time_hours: number;
  rating_distribution: { stars: number; count: number }[];
  trend: 'up' | 'down' | 'stable';
  trend_value: number;
}

interface Review {
  id: number;
  customer_name: string;
  customer_avatar: string | null;
  rating: number;
  comment: string;
  product_name: string;
  booking_date: string;
  created_at: string;
  agent_reply: string | null;
  is_flagged: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface QualityMetric {
  label: string;
  score: number;
  max: number;
  color: string;
  description: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SENTIMENT_CONFIG = {
  positive: { label: 'Positif', color: 'bg-green-100 text-green-700' },
  neutral: { label: 'Netral', color: 'bg-gray-100 text-gray-600' },
  negative: { label: 'Negatif', color: 'bg-red-100 text-red-600' },
};



// ── StarDisplay ───────────────────────────────────────────────────────────────

const StarDisplay: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${sz} ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
};

// ── Reply Modal ───────────────────────────────────────────────────────────────

const ReplyModal: React.FC<{
  review: Review;
  onClose: () => void;
  onSubmit: (reviewId: number, reply: string) => void;
}> = ({ review, onClose, onSubmit }) => {
  const [reply, setReply] = useState(review.agent_reply ?? '');
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-4">Balas Ulasan</h3>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <StarDisplay rating={review.rating} size="sm" />
            <span className="text-xs text-gray-500">{review.customer_name}</span>
          </div>
          <p className="text-gray-700 text-sm italic">"{review.comment}"</p>
        </div>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          rows={4}
          placeholder="Tulis balasan yang ramah dan profesional..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
          <button
            onClick={() => onSubmit(review.id, reply)}
            disabled={!reply.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            Kirim Balasan
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const AgentRating: React.FC = () => {
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [replyingTo, setReplyingTo] = useState<Review | null>(null);
  const [showOnlyUnreplied, setShowOnlyUnreplied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, revRes] = await Promise.all([
        http.get('/agent/rating/summary'),
        http.get('/agent/rating/reviews'),
      ]);
      if (!sumRes.data?.error && sumRes.data?.data) setSummary(sumRes.data.data);
      if (!revRes.data?.error && revRes.data?.data) setReviews(revRes.data.data);
    } catch (err) {
      console.error('Failed to load agent ratings API', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submitReply = async (reviewId: number, reply: string) => {
    try {
      await http.post(`/agent/rating/reviews/${reviewId}/reply`, { reply });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, agent_reply: reply } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membalas ulasan');
    } finally {
      setReplyingTo(null);
    }
  };

  const flagReview = async (reviewId: number) => {
    try {
      await http.post(`/agent/rating/reviews/${reviewId}/flag`);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_flagged: true } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal melaporkan ulasan');
    }
  };

  const qualityMetrics: QualityMetric[] = [
    { label: 'Rating Keseluruhan', score: summary?.overall_rating ?? 0, max: 5, color: '#f59e0b', description: 'Rata-rata semua ulasan' },
    { label: 'Response Rate', score: summary?.response_rate ?? 0, max: 100, color: '#10b981', description: 'Persentase ulasan dibalas' },
    { label: 'Kepuasan Produk', score: 4.1, max: 5, color: '#6366f1', description: 'Rating khusus kualitas produk' },
    { label: 'Komunikasi', score: 4.6, max: 5, color: '#0ea5e9', description: 'Rating respon & komunikasi' },
  ];

  const filteredReviews = reviews.filter(r => {
    if (filterSentiment !== 'all' && r.sentiment !== filterSentiment) return false;
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (showOnlyUnreplied && r.agent_reply) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {replyingTo && <ReplyModal review={replyingTo} onClose={() => setReplyingTo(null)} onSubmit={submitReply} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rating & Quality Control</h2>
          <p className="text-gray-500 text-sm mt-1">Monitor performa, balas ulasan, dan jaga kualitas layanan</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Rating Overview Card */}
      {summary && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Big Rating */}
            <div className="flex flex-col items-center justify-center text-center border-r border-gray-100 pr-6">
              <p className="text-6xl font-bold text-gray-900">{summary.overall_rating.toFixed(1)}</p>
              <StarDisplay rating={Math.round(summary.overall_rating)} size="lg" />
              <p className="text-gray-400 text-sm mt-2">{summary.total_reviews} ulasan</p>
              <div className={`flex items-center gap-1 mt-2 text-sm font-bold ${summary.trend === 'up' ? 'text-green-600' : summary.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                {summary.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : summary.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                {summary.trend !== 'stable' && `${summary.trend === 'up' ? '+' : '-'}${summary.trend_value} bulan ini`}
              </div>
            </div>

            {/* Distribution */}
            <div className="space-y-2">
              {summary.rating_distribution.slice().reverse().map(d => {
                const pct = summary.total_reviews > 0 ? Math.round((d.count / summary.total_reviews) * 100) : 0;
                return (
                  <div key={d.stars} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-3 text-right">{d.stars}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-400 w-8 text-right text-xs">{d.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 pl-4 border-l border-gray-100">
              {[
                { label: 'Response Rate', value: `${summary.response_rate}%`, icon: MessageSquare, color: 'text-green-600 bg-green-50' },
                { label: 'Avg Response', value: `${summary.response_time_hours}j`, icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
                { label: 'Positif', value: `${reviews.filter(r => r.sentiment === 'positive').length}`, icon: ThumbsUp, color: 'text-green-600 bg-green-50' },
                { label: 'Negatif', value: `${reviews.filter(r => r.sentiment === 'negative').length}`, icon: ThumbsDown, color: 'text-red-600 bg-red-50' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-3 ${s.color.split(' ')[1]}`}>
                  <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]} mb-1`} />
                  <p className="font-bold text-gray-900 text-lg">{s.value}</p>
                  <p className="text-gray-500 text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quality Metrics */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Metrik Kualitas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {qualityMetrics.map(m => (
            <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 font-semibold mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {m.max === 5 ? m.score.toFixed(1) : `${m.score}%`}
                <span className="text-gray-300 text-sm font-normal">/{m.max === 5 ? '5' : '100'}</span>
              </p>
              <div className="h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(m.score / m.max) * 100}%`, backgroundColor: m.color }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Semua Ulasan</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnlyUnreplied(!showOnlyUnreplied)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                showOnlyUnreplied ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              Belum Dibalas
            </button>
            <select
              value={filterRating}
              onChange={e => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 focus:outline-none"
            >
              <option value="all">Semua Bintang</option>
              {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} ★</option>)}
            </select>
            <select
              value={filterSentiment}
              onChange={e => setFilterSentiment(e.target.value as any)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 focus:outline-none"
            >
              <option value="all">Semua Sentimen</option>
              <option value="positive">Positif</option>
              <option value="neutral">Netral</option>
              <option value="negative">Negatif</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium text-sm">Tidak ada ulasan yang cocok</p>
            </div>
          ) : (
            filteredReviews.map(r => {
              const sent = SENTIMENT_CONFIG[r.sentiment];
              return (
                <div
                  key={r.id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 ${r.sentiment === 'negative' ? 'border-red-100' : 'border-gray-100'}`}
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                        {r.customer_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{r.customer_name}</p>
                        <p className="text-xs text-gray-400">{r.product_name} · {formatDate(r.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sent.color}`}>{sent.label}</span>
                      <StarDisplay rating={r.rating} size="sm" />
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{r.comment}</p>

                  {/* Agent Reply */}
                  {r.agent_reply && (
                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-3">
                      <p className="text-xs font-bold text-primary-700 mb-1.5">Balasan Agen:</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{r.agent_reply}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                    {!r.agent_reply ? (
                      <button
                        onClick={() => setReplyingTo(r)}
                        className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors px-3 py-1.5 bg-primary-50 rounded-lg"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Balas Ulasan
                      </button>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(r)}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Edit Balasan
                      </button>
                    )}
                    {!r.is_flagged ? (
                      <button
                        onClick={() => flagReview(r.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors ml-auto"
                      >
                        <Flag className="w-3.5 h-3.5" /> Laporkan
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 ml-auto">
                        <Flag className="w-3.5 h-3.5 fill-red-400" /> Dilaporkan
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentRating;

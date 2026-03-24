// pages/agent/products/MyProducts.tsx
import {
  Image as ImageIcon, Plus, Zap, Tag, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight, Search, SlidersHorizontal,
} from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth }                          from '../../../AuthContext';
import { useToast }                         from '../../../components/ToastContext';
import { agentProductService }              from '../../../services/agentProductService';
import { promoService, type PromoCampaign } from '../../../services/promoService';
import http                                 from '../../../services/http';
import { AgentProduct }                     from '../../../types';

import CampaignsStrip  from '../components/CampaignStrip';
import FlashSaleModal  from '../components/FlashSaleModal';
import ProductCard     from '../components/ProductCard';
import { getAddLabel } from '../utils/labels';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CampaignSubmission {
  join_id:            number;
  campaign_id:        number;
  campaign_name:      string;
  campaign_starts_at: string;
  campaign_ends_at:   string;
  campaign_is_active: number;
  product_id:         number;
  product_name:       string;
  product_price:      number;
  product_currency:   string;
  product_image:      string | null;
  discount_pct:       number | null;
  sale_price:         number | null;
  join_status:        'pending' | 'active' | 'rejected' | 'inactive';
  joined_at:          string;
}

interface FlashSubmission {
  id:               number;
  product_id:       number;
  product_name:     string;
  product_price:    number;
  product_currency: string;
  product_image:    string | null;
  discount_pct:     number;
  sale_price:       number | null;
  status:           'pending' | 'approved' | 'rejected';
  created_at:       string;
  updated_at:       string;
}

interface SubRow {
  key:        string;
  type:       'campaign' | 'flash';
  status:     string;
  image:      string | null;
  product:    string;
  label:      string;
  discount:   string | null;
  currency:   string;
  sale_price: number | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SUB_PAGE_SIZE  = 5;
const PROD_PAGE_SIZE = 8;

// ── Filter options ────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '',         label: 'Semua Status' },
  { value: 'active',   label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
];

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Terbaru' },
  { value: 'oldest',      label: 'Terlama' },
  { value: 'price_asc',   label: 'Harga: Rendah → Tinggi' },
  { value: 'price_desc',  label: 'Harga: Tinggi → Rendah' },
  { value: 'name_asc',    label: 'Nama: A → Z' },
  { value: 'name_desc',   label: 'Nama: Z → A' },
  { value: 'rating_desc', label: 'Rating Tertinggi' },
];

// ── Status meta ───────────────────────────────────────────────────────────────

const STATUS_META: Record<string, {
  label: string; icon: React.ElementType;
  bg: string; border: string; color: string;
}> = {
  pending:  { label: 'Menunggu Review', icon: Clock,       bg: '#FAEEDA', border: '#EF9F27', color: '#633806' },
  active:   { label: 'Disetujui',       icon: CheckCircle, bg: '#EAF3DE', border: '#97C459', color: '#27500A' },
  approved: { label: 'Disetujui',       icon: CheckCircle, bg: '#EAF3DE', border: '#97C459', color: '#27500A' },
  rejected: { label: 'Ditolak',         icon: XCircle,     bg: '#FCEBEB', border: '#F09595', color: '#791F1F' },
  inactive: { label: 'Nonaktif',        icon: Clock,       bg: '#F1EFE8', border: '#B4B2A9', color: '#444441' },
};

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0"
      style={{ background: meta.bg, color: meta.color, border: `0.5px solid ${meta.border}` }}
    >
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

// ── Submission Panel ──────────────────────────────────────────────────────────

interface SubmissionPanelProps {
  campaignSubs: CampaignSubmission[];
  flashSubs:    FlashSubmission[];
  onDismiss:    () => void;
}

const SubmissionPanel: React.FC<SubmissionPanelProps> = ({ campaignSubs, flashSubs, onDismiss }) => {
  const [expanded, setExpanded] = useState(true);
  const [subPage,  setSubPage]  = useState(1);

  const STATUS_ORDER: Record<string, number> = {
    pending: 0, rejected: 1, active: 2, approved: 2, inactive: 3,
  };

  const allRows: SubRow[] = useMemo(() => {
    const campaignRows: SubRow[] = campaignSubs.map(s => ({
      key: `c-${s.join_id}`, type: 'campaign', status: s.join_status,
      image: s.product_image, product: s.product_name, label: s.campaign_name,
      discount: s.discount_pct != null ? `-${s.discount_pct}%` : null,
      currency: s.product_currency, sale_price: s.sale_price,
    }));
    const flashRows: SubRow[] = flashSubs.map(s => ({
      key: `f-${s.id}`, type: 'flash', status: s.status,
      image: s.product_image, product: s.product_name, label: 'Flash Sale',
      discount: `-${s.discount_pct}%`, currency: s.product_currency, sale_price: s.sale_price,
    }));
    return [...campaignRows, ...flashRows].sort(
      (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
    );
  }, [campaignSubs, flashSubs]);

  const totalPages    = Math.ceil(allRows.length / SUB_PAGE_SIZE);
  const pageRows      = allRows.slice((subPage - 1) * SUB_PAGE_SIZE, subPage * SUB_PAGE_SIZE);
  const pendingCount  = allRows.filter(r => r.status === 'pending').length;
  const rejectedCount = allRows.filter(r => r.status === 'rejected').length;

  useEffect(() => { setSubPage(1); }, [allRows.length]);
  if (allRows.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
      style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
        style={{ borderBottom: expanded ? '0.5px solid #ECEAE6' : 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-sm font-bold text-gray-800">Status Pengajuan Promo</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">{allRows.length} pengajuan</span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#FAEEDA', color: '#633806', border: '0.5px solid #EF9F27' }}>
                {pendingCount} pending
              </span>
            )}
            {rejectedCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#FCEBEB', color: '#791F1F', border: '0.5px solid #F09595' }}>
                {rejectedCount} ditolak
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); onDismiss(); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            title="Tutup panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {expanded
            ? <ChevronUp   className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="divide-y divide-gray-50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={subPage} initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {pageRows.map(row => (
                    <div key={row.key} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={row.type === 'campaign'
                          ? { background: '#EEEDFE', border: '0.5px solid #AFA9EC' }
                          : { background: '#FAEEDA', border: '0.5px solid #EF9F27' }}>
                        {row.type === 'campaign'
                          ? <Tag className="w-3.5 h-3.5" style={{ color: '#534AB7' }} />
                          : <Zap className="w-3.5 h-3.5" style={{ color: '#854F0B' }} />}
                      </div>
                      {row.image ? (
                        <img src={row.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate leading-tight">{row.product}</p>
                        <p className="text-xs truncate mt-0.5"
                          style={{ color: row.type === 'campaign' ? '#534AB7' : '#854F0B' }}>
                          {row.label}
                          {row.discount && <span className="ml-1.5 font-bold">{row.discount}</span>}
                          {row.sale_price != null && (
                            <span className="ml-1 text-gray-400 font-normal">
                              → {row.currency} {row.sale_price.toLocaleString('id-ID')}
                            </span>
                          )}
                        </p>
                      </div>
                      <StatusPill status={row.status} />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-2.5"
                style={{ borderTop: '0.5px solid #ECEAE6', background: '#FAFAF9' }}>
                <span className="text-xs text-gray-400">
                  Hal <span className="font-bold text-gray-600">{subPage}</span>
                  {' '}/ <span className="font-bold text-gray-600">{totalPages}</span>
                  <span className="ml-1.5 text-gray-300">·</span>
                  <span className="ml-1.5">{allRows.length} total</span>
                </span>
                <div className="flex items-center gap-1">
                  <button disabled={subPage <= 1} onClick={() => setSubPage(p => Math.max(1, p - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setSubPage(p)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors"
                      style={p === subPage
                        ? { background: '#1a1a1a', color: '#fff', border: '0.5px solid #1a1a1a' }
                        : { background: 'transparent', color: '#888780', border: '0.5px solid #D3D1C7' }}>
                      {p}
                    </button>
                  ))}
                  <button disabled={subPage >= totalPages} onClick={() => setSubPage(p => Math.min(totalPages, p + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Search & Filter Bar ───────────────────────────────────────────────────────

interface FilterBarProps {
  search:       string;
  setSearch:    (v: string) => void;
  statusFilter: string;
  setStatus:    (v: string) => void;
  sortBy:       string;
  setSort:      (v: string) => void;
  total:        number;
  filtered:     number;
  onReset:      () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  search, setSearch, statusFilter, setStatus, sortBy, setSort,
  total, filtered, onReset,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilter = statusFilter !== '' || sortBy !== 'newest';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>

      {/* Search row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama produk atau lokasi..."
            className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(f => !f)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-colors border"
          style={hasActiveFilter
            ? { background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #AFA9EC' }
            : { background: '#F8F8F6', color: '#5F5E5A', border: '0.5px solid #D3D1C7' }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
          {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-1 border-t border-gray-50">
              <div className="grid grid-cols-2 gap-2.5">

                {/* Status aktif */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Urutkan */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Urutkan
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSort(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active filter chips */}
              {hasActiveFilter && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {statusFilter && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: '#F1EFE8', color: '#444441', border: '0.5px solid #B4B2A9' }}>
                      {STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}
                      <button onClick={() => setStatus('')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {sortBy !== 'newest' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: '#F1EFE8', color: '#444441', border: '0.5px solid #B4B2A9' }}>
                      {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                      <button onClick={() => setSort('newest')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  <button onClick={onReset}
                    className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors ml-1">
                    Reset semua
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result count */}
      <div className="px-4 py-2 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Menampilkan <span className="font-bold text-gray-600">{filtered}</span> dari{' '}
          <span className="font-bold text-gray-600">{total}</span> produk
        </span>
        {filtered !== total && (
          <span className="text-[10px] text-purple-500 font-bold">Filter aktif</span>
        )}
      </div>
    </div>
  );
};

// ── Product Pagination ────────────────────────────────────────────────────────

interface ProdPaginationProps {
  page:       number;
  totalPages: number;
  onPrev:     () => void;
  onNext:     () => void;
  onGo:       (p: number) => void;
}

const ProdPagination: React.FC<ProdPaginationProps> = ({
  page, totalPages, onPrev, onNext, onGo,
}) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3)               return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)  return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <span className="text-xs text-gray-400">
        Hal <span className="font-bold text-gray-700">{page}</span>{' '}
        / <span className="font-bold text-gray-700">{totalPages}</span>
      </span>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages().map(p => (
          <button key={p} onClick={() => onGo(p)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-colors"
            style={p === page
              ? { background: '#1a1a1a', color: '#fff', border: '0.5px solid #1a1a1a' }
              : { background: 'transparent', color: '#888780', border: '0.5px solid #D3D1C7' }}>
            {p}
          </button>
        ))}
        <button disabled={page >= totalPages} onClick={onNext}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const MyProducts: React.FC = () => {
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [products,  setProducts]  = useState<AgentProduct[]>([]);
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Submission state ─────────────────────────────────────────────────────
  const [campaignSubs,  setCampaignSubs]  = useState<CampaignSubmission[]>([]);
  const [flashSubs,     setFlashSubs]     = useState<FlashSubmission[]>([]);
  const [showSubPanel,  setShowSubPanel]  = useState(true);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);

  // ── Search & filter state ────────────────────────────────────────────────
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy,       setSortBy]       = useState('newest');
  const [prodPage,     setProdPage]     = useState(1);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [showModal,          setShowModal]          = useState(false);
  const [selectedProduct,    setSelectedProduct]    = useState<AgentProduct | null>(null);
  const [selectedCampaign,   setSelectedCampaign]   = useState<PromoCampaign | null>(null);
  const [isJoiningCampaign,  setIsJoiningCampaign]  = useState(false);
  const [productToJoinId,    setProductToJoinId]    = useState<number | ''>('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [isSubmitting,       setIsSubmitting]       = useState(false);

  // ── Filter + sort + paginate ──────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search: nama atau lokasi
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.location ?? '').toLowerCase().includes(q)
      );
    }

    // Status aktif
    if (statusFilter === 'active')   result = result.filter(p => p.is_active);
    if (statusFilter === 'inactive') result = result.filter(p => !p.is_active);

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_asc':   return a.price - b.price;
        case 'price_desc':  return b.price - a.price;
        case 'name_asc':    return a.name.localeCompare(b.name);
        case 'name_desc':   return b.name.localeCompare(a.name);
        case 'rating_desc': return (b.rating ?? 0) - (a.rating ?? 0);
        default:            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [products, search, statusFilter, sortBy]);

  // Reset page ke 1 setiap kali filter berubah
  useEffect(() => { setProdPage(1); }, [search, statusFilter, sortBy]);

  const totalProdPages = Math.ceil(filteredProducts.length / PROD_PAGE_SIZE);
  const pagedProducts  = filteredProducts.slice(
    (prodPage - 1) * PROD_PAGE_SIZE,
    prodPage * PROD_PAGE_SIZE
  );

  const handleResetFilters = () => {
    setSearch(''); setStatusFilter(''); setSortBy('newest'); setProdPage(1);
  };

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) { loadData(); loadSubmissions(); }
  }, [user?.id]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [prodData, campaignData] = await Promise.all([
        agentProductService.getMyProducts(),
        promoService.getActiveCampaigns().catch(() => [] as PromoCampaign[]),
      ]);
      setProducts(prodData);
      setCampaigns(campaignData);
    } catch (e: any) {
      showToast(e?.message || 'Failed to load products', 'error');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    setIsLoadingSubs(true);
    try {
      const res = await fetch('/api/v1/promo-campaigns/my-submissions', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const data = body?.data ?? body ?? {};
      setCampaignSubs(data?.campaign_submissions?.data ?? []);
      setFlashSubs(data?.flash_submissions ?? []);
      setShowSubPanel(true);
    } catch (e) {
      console.error('[loadSubmissions]', e);
    } finally {
      setIsLoadingSubs(false);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleToggleStatus = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newStatus = !product.is_active;
    setProducts(cur => cur.map(p => p.id === id ? { ...p, is_active: newStatus } : p));
    try {
      await agentProductService.updateProductStatus(id, newStatus);
      showToast(`Product ${newStatus ? 'enabled' : 'disabled'}`, 'success');
    } catch (e: any) {
      showToast(e?.message || 'Failed to update status', 'error');
      setProducts(cur => cur.map(p => p.id === id ? { ...p, is_active: !newStatus } : p));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    const prev = products;
    setProducts(cur => cur.filter(p => p.id !== id));
    try {
      await agentProductService.deleteProduct(id);
      showToast('Product deleted', 'success');
      await loadData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete product', 'error');
      setProducts(prev);
    }
  };

  const openFlashSaleModal = (product: AgentProduct, campaign?: PromoCampaign) => {
    setSelectedProduct(product);
    setSelectedCampaign(campaign ?? null);
    setIsJoiningCampaign(false);
    setProductToJoinId('');
    setDiscountPercentage(
      campaign?.discount_type === 'percent' ? String(campaign.discount_value) : '10'
    );
    setShowModal(true);
  };

  const openCampaignJoinModal = (campaign: PromoCampaign) => {
    setSelectedCampaign(campaign);
    setSelectedProduct(null);
    setIsJoiningCampaign(true);
    setProductToJoinId('');
    setDiscountPercentage(
      campaign.discount_type === 'percent' ? String(campaign.discount_value) : ''
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false); setSelectedProduct(null); setSelectedCampaign(null);
    setIsJoiningCampaign(false); setDiscountPercentage(''); setProductToJoinId('');
  };

  const submitFlashSale = async () => {
    const targetProduct = isJoiningCampaign
      ? products.find(p => p.id === Number(productToJoinId))
      : selectedProduct;
    if (!targetProduct) { showToast('Pilih produk terlebih dahulu', 'error'); return; }

    const pct = Number(discountPercentage);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
      showToast('Invalid discount percentage (1–99%)', 'error'); return;
    }

    const minDiscount = selectedCampaign?.discount_type === 'percent'
      ? selectedCampaign.discount_value : 0;
    if (minDiscount > 0 && pct < minDiscount) {
      showToast(`Campaign requires minimum ${minDiscount}% discount`, 'error'); return;
    }

    setIsSubmitting(true);
    try {
      const salePrice = Math.round(Number(targetProduct.price) * (1 - pct / 100));
      if (selectedCampaign) {
        await http.post(`/promo-campaigns/${selectedCampaign.id}/join`, {
          product_id: targetProduct.id, discount_pct: pct, sale_price: salePrice,
        });
      } else {
        await http.post('/promo-campaigns/flash-sale', {
          product_id: targetProduct.id, discount_pct: pct, sale_price: salePrice,
        });
      }
      showToast('Request submitted successfully!', 'success');
      closeModal();
      await Promise.all([loadData(), loadSubmissions()]);
    } catch (e: any) {
      showToast(e?.response?.data?.message || e?.message || 'Failed to submit', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">

      {/* ── 1. Submission Status Panel ── */}
      {isLoadingSubs ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-4 bg-gray-100 rounded w-44" />
            <div className="h-4 bg-gray-100 rounded w-16" />
          </div>
        </div>
      ) : (
        <AnimatePresence>
          {showSubPanel && (
            <SubmissionPanel
              campaignSubs={campaignSubs}
              flashSubs={flashSubs}
              onDismiss={() => setShowSubPanel(false)}
            />
          )}
        </AnimatePresence>
      )}

      {/* ── 2. Campaign Strip ── */}
      {campaigns.length > 0 && (
        <CampaignsStrip campaigns={campaigns} onJoinCampaign={openCampaignJoinModal} />
      )}

      {/* ── 3. Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
          <p className="text-gray-500 text-sm">Manage availability, pricing, and details.</p>
        </div>
        <Link
          to="/agent/products/new"
          className="flex items-center px-5 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          {getAddLabel(user?.specialization)}
        </Link>
      </div>

      {/* ── 4. Search & Filter Bar ── */}
      {!isLoading && products.length > 0 && (
        <FilterBar
          search={search}           setSearch={setSearch}
          statusFilter={statusFilter} setStatus={setStatusFilter}
          sortBy={sortBy}           setSort={setSortBy}
          total={products.length}   filtered={filteredProducts.length}
          onReset={handleResetFilters}
        />
      )}

      {/* ── 5. Product list ── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Empty Listing</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You haven't listed any services yet. Start adding your first product to reach thousands of travelers.
          </p>
          <Link to="/agent/products/new"
            className="text-primary-600 font-bold hover:underline flex items-center justify-center">
            <Plus className="w-4 h-4 mr-1" /> {getAddLabel(user?.specialization)}
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-bold mb-1">Tidak ada produk yang cocok</p>
          <p className="text-gray-400 text-sm mb-4">Coba ubah kata kunci atau filter yang aktif.</p>
          <button onClick={handleResetFilters}
            className="text-sm font-bold text-primary-600 hover:underline">
            Reset semua filter
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${prodPage}-${search}-${statusFilter}-${sortBy}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {pagedProducts.map(product => {
                const prodCampaignSubs = campaignSubs.filter(s => s.product_id === product.id);
                const prodFlashSubs    = flashSubs.filter(s => s.product_id === product.id);
                return (
                  <div key={product.id}>
                    <ProductCard
                      product={product}
                      onToggleStatus={() => handleToggleStatus(product.id)}
                      onDelete={() => handleDelete(product.id)}
                      onJoinFlashSale={() => openFlashSaleModal(product)}
                      onNavigateEdit={() => navigate(`/agent/products/edit/${product.id}`)}
                    />
                    {(prodCampaignSubs.length > 0 || prodFlashSubs.length > 0) && (
                      <div className="mt-1.5 ml-2 flex items-center gap-2 flex-wrap">
                        {prodCampaignSubs.map(sub => {
                          const meta = STATUS_META[sub.join_status] ?? STATUS_META.pending;
                          return (
                            <span key={sub.join_id}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: meta.bg, color: meta.color, border: `0.5px solid ${meta.border}` }}>
                              <Tag className="w-3 h-3" />
                              {sub.campaign_name}
                              <span className="opacity-50 font-normal">·</span>
                              {meta.label}
                            </span>
                          );
                        })}
                        {prodFlashSubs.map(sub => {
                          const meta = STATUS_META[sub.status] ?? STATUS_META.pending;
                          return (
                            <span key={sub.id}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: meta.bg, color: meta.color, border: `0.5px solid ${meta.border}` }}>
                              <Zap className="w-3 h-3" />
                              Flash Sale -{sub.discount_pct}%
                              <span className="opacity-50 font-normal">·</span>
                              {meta.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <ProdPagination
            page={prodPage}           totalPages={totalProdPages}
            onPrev={() => setProdPage(p => Math.max(1, p - 1))}
            onNext={() => setProdPage(p => Math.min(totalProdPages, p + 1))}
            onGo={p => setProdPage(p)}
          />
        </>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <FlashSaleModal
          open={showModal}              onClose={closeModal}
          campaigns={campaigns}         selectedCampaign={selectedCampaign}
          selectedProduct={selectedProduct}
          eligibleProducts={isJoiningCampaign ? products : null}
          isJoiningCampaign={isJoiningCampaign}
          productToJoinId={productToJoinId}     setProductToJoinId={setProductToJoinId}
          discountPercentage={discountPercentage} setDiscountPercentage={setDiscountPercentage}
          onSubmit={submitFlashSale}    isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default MyProducts;

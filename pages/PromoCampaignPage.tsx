// pages/PromoCampaignPage.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Tag, Calendar, Percent, ShoppingBag, MapPin } from 'lucide-react';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { getCampaignById, getCampaignJoinedProducts, resolveBannerUrl, type PromoCampaign } from '../services/promoService';
import { encodeId } from '../utils/hashids';
import { generateSlug } from '../utils/slugify';
import SEO from '../components/SEO';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CampaignProduct {
  join_id:          number;
  product_id:       number;
  product_name:     string;
  product_price:    number;
  product_currency: string;
  product_image:    string | null;
  product_location: string | null;
  discount_pct:     number | null;
  sale_price:       number | null;
  join_status:      string;
  agent_name:       string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="bg-gray-200 aspect-[4/3]" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mt-3" />
    </div>
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const GRADIENT_FALLBACKS = [
  'from-primary-600 via-primary-700 to-rose-800',
  'from-blue-700 via-indigo-700 to-purple-800',
  'from-emerald-600 via-teal-700 to-cyan-800',
  'from-amber-600 via-orange-700 to-red-800',
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatDiscount(c: PromoCampaign) {
  if (c.discount_type === 'percent') return `${c.discount_value}% OFF`;
  return `Rp ${Number(c.discount_value).toLocaleString('id-ID')} OFF`;
}

// ── Inject shimmer keyframes ──────────────────────────────────────────────────

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('promo-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'promo-page-styles';
  style.textContent = `
    @keyframes shimmerSweep {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.6; }
      50%       { opacity: 1; }
    }
    .discount-shimmer {
      background: linear-gradient(
        90deg,
        #FFE066 0%,
        #FFF5B0 40%,
        #FFE066 60%,
        #FFB800 100%
      );
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmerSweep 3s linear infinite;
    }
    .badge-pulse {
      animation: pulseGlow 2.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// ── Product Card ──────────────────────────────────────────────────────────────

const ProductCard: React.FC<{ p: CampaignProduct; idx: number }> = ({ p, idx }) => {
  const to = `/product/${encodeId(p.product_id)}/${generateSlug(p.product_name)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Link
        to={to}
        className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {p.product_image ? (
            <img
              src={p.product_image}
              alt={p.product_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
          )}

          {p.discount_pct != null && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
              -{p.discount_pct}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug mb-1">
            {p.product_name}
          </h3>
          {p.product_location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 shrink-0" />
              {p.product_location}
            </p>
          )}
          <div className="mt-auto">
            {p.sale_price != null ? (
              <>
                <p className="text-xs text-gray-400 line-through">
                  {p.product_currency} {p.product_price.toLocaleString('id-ID')}
                </p>
                <p className="text-base font-extrabold text-primary-600">
                  {p.product_currency} {p.sale_price.toLocaleString('id-ID')}
                </p>
              </>
            ) : (
              <p className="text-base font-extrabold text-gray-900">
                {p.product_currency} {p.product_price.toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const PromoCampaignPage: React.FC = () => {
  const { langNavigate } = useLangNavigate();
  const { t } = useTranslation();
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign]                   = useState<PromoCampaign | null>(null);
  const [products, setProducts]                   = useState<CampaignProduct[]>([]);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [bannerLoaded, setBannerLoaded]           = useState(false);
  const [page, setPage]                           = useState(1);
  const [totalPages, setTotalPages]               = useState(1);
  const [total, setTotal]                         = useState(0);
  const LIMIT = 12;

  useEffect(() => { injectStyles(); }, []);

  // Fetch campaign detail
  useEffect(() => {
    if (!id) return;
    setIsLoadingCampaign(true);
    setBannerLoaded(false);
    getCampaignById(Number(id))
      .then((c) => setCampaign(c))
      .catch(() => langNavigate('/explore', { replace: true }))
      .finally(() => setIsLoadingCampaign(false));
  }, [id, navigate]);

  // Fetch joined products
  useEffect(() => {
    if (!id) return;
    setIsLoadingProducts(true);
    getCampaignJoinedProducts(Number(id), page, LIMIT)
      .then(({ products, meta }) => {
        setProducts(products);
        setTotalPages(meta.total_pages);
        setTotal(meta.total);
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoadingProducts(false));
  }, [id, page]);

  const hasBanner = !!campaign?.banner_image;
  const fallback  = GRADIENT_FALLBACKS[(Number(id) || 0) % GRADIENT_FALLBACKS.length];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={campaign ? `${campaign.name} – Trivgoo` : 'Promo Campaign – Trivgoo'}
        description={campaign?.description || t('promo.seo_desc', 'Discover selected products in this exclusive promo campaign.')}
      />

      {/* ══ Hero banner ══════════════════════════════════════════════════════ */}
      {/*
        Strategi: wrapper div pakai background hitam.
        Gambar pakai width:100%, height:auto → TIDAK PERNAH terpotong di sisi manapun.
        Overlay info di-absolute di atas gambar, pointer-events:none.
        Karena height mengikuti gambar secara alami, tidak ada maxHeight yg memotong.
      */}
      <div
        className="relative w-full"
        style={{ background: '#0d0d0d' }}
      >
        {/* ── Skeleton saat loading ── */}
        {isLoadingCampaign && (
          <div
            className="w-full animate-pulse"
            style={{ height: 320, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}
          />
        )}

        {/* ── Gambar banner — width:100% height:auto = tidak pernah terpotong ── */}
        {!isLoadingCampaign && hasBanner && (
          <motion.img
            src={resolveBannerUrl(campaign!.banner_image!)}
            alt={campaign!.name}
            onLoad={() => setBannerLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: bannerLoaded ? 1 : 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              display:   'block',
              width:     '100%',
              height:    'auto',       // ← kunci: tinggi ikut proporsi gambar asli
              objectFit: 'unset',      // tidak diperlukan karena height:auto
            }}
          />
        )}

        {/* ── Fallback gradient jika tidak ada banner ── */}
        {!isLoadingCampaign && !hasBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`w-full bg-gradient-to-br ${fallback}`}
            style={{ height: 320 }}
          />
        )}

        {/* ── Back button ── */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-1.5 text-white px-3 py-2 rounded-full text-xs font-bold z-10 transition-colors"
          style={{
            background:    'rgba(0,0,0,0.45)',
            backdropFilter:'blur(6px)',
            border:        '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </motion.button>

        {/* ── Campaign info overlay — pinned to bottom of banner ── */}
        <AnimatePresence>
          {campaign && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex flex-col justify-end pb-6 px-6 md:px-10 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.05) 80%, transparent 100%)',
                zIndex: 2,
              }}
            >
              {/* Type badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.35 }}
                className="badge-pulse inline-flex items-center gap-1.5 w-fit mb-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest"
                style={{
                  background:    'rgba(255,200,0,0.15)',
                  border:        '1px solid rgba(255,200,0,0.6)',
                  color:         '#FFE066',
                  backdropFilter:'blur(4px)',
                }}
              >
                <Tag className="w-3 h-3" />
                {campaign.type?.replace('_', ' ') ?? 'Promo'}
              </motion.div>

              {/* Discount — shimmer hero number */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.45, ease: 'easeOut' }}
                className="flex items-baseline gap-3 mb-1 flex-wrap"
              >
                <span
                  className="discount-shimmer font-black tracking-tight leading-none"
                  style={{ fontSize: 'clamp(2rem, 7vw, 3.8rem)' }}
                >
                  {formatDiscount(campaign)}
                </span>
                <span
                  className="text-white/60 text-sm font-semibold tracking-widest uppercase"
                  style={{ letterSpacing: '0.12em' }}
                >
                </span>
              </motion.div>

              {/* Campaign name */}
              <motion.h1
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.42, duration: 0.4 }}
                className="text-white font-bold line-clamp-1 mb-2.5"
                style={{
                  fontSize:   'clamp(1rem, 3vw, 1.5rem)',
                  textShadow: '0 1px 10px rgba(0,0,0,0.95)',
                }}
              >
                {campaign.name}
              </motion.h1>

              
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* ══ /Hero banner ══════════════════════════════════════════════════════ */}

      {/* ══ Content ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Campaign Info Section ── */}
{campaign && (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    className="mb-10 rounded-2xl border border-gray-100 bg-white overflow-hidden"
    style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}
  >
    {/* Top accent bar */}
    <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, #FFB800, #FF6B00, #e55)' }} />

    <div className="p-6 md:p-8">

      {/* Description */}
      {campaign.description && (
        <p className="text-gray-600 text-sm leading-relaxed mb-5 max-w-2xl">
          {campaign.description}
        </p>
      )}

      {/* Stat chips + pills — semua horizontal dalam satu baris wrap */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Diskon */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#FAEEDA', color: '#633806', border: '0.5px solid #EF9F27' }}
        >
          <Percent className="w-3 h-3" />
          {formatDiscount(campaign)}
        </span>

        {/* Min. transaksi */}
        {campaign.min_transaction > 0 && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#F1EFE8', color: '#444441', border: '0.5px solid #B4B2A9' }}
          >
            {t('promo.min_transaction', 'Min.')} Rp {Number(campaign.min_transaction).toLocaleString('id-ID')}
          </span>
        )}

        {/* Member tier */}
        {campaign.min_tier_name && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #AFA9EC' }}
          >
            {t('promo.member', 'Member')} {campaign.min_tier_name}
          </span>
        )}

        {/* Separator dot */}
        <span className="text-gray-200 text-lg select-none hidden sm:inline">·</span>

        {/* Periode */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#F8F8F6', color: '#5F5E5A', border: '0.5px solid #D3D1C7' }}
        >
          <Calendar className="w-3 h-3 shrink-0" />
          {formatDate(campaign.starts_at)} – {formatDate(campaign.ends_at)}
        </span>

        {/* Tipe */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold capitalize"
          style={{ background: '#F8F8F6', color: '#5F5E5A', border: '0.5px solid #D3D1C7' }}
        >
          <Tag className="w-3 h-3 shrink-0" />
          {campaign.type?.replace('_', ' ') ?? '-'}
        </span>

        {/* Maks. diskon */}
        {campaign.max_discount != null && campaign.max_discount > 0 && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#FFF8EC', color: '#633806', border: '0.5px solid #FAC775' }}
          >
            {t('promo.max_discount_label', 'Max.')} Rp {Number(campaign.max_discount).toLocaleString('id-ID')}
          </span>
        )}

      </div>
    </div>
  </motion.div>
)}


        {/* Products heading */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {t('promo.products_in_campaign', 'Products in Campaign')}
            {total > 0 && (
              <span className="ml-2 text-sm text-gray-400 font-normal">({total} {t('promo.products_count', 'products')})</span>
            )}
          </h2>
        </div>

        {/* Product grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">{t('promo.no_products', 'No products in this campaign yet.')}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((p, i) => (
              <ProductCard key={p.join_id} p={p} idx={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              disabled={page <= 1 || isLoadingProducts}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-white transition-colors"
            >
              ← {t('common.previous', 'Prev')}
            </button>
            <span className="text-sm text-gray-500">
              {t('promo.page', 'Page')} <span className="font-bold text-gray-800">{page}</span> / {totalPages}
            </span>
            <button
              disabled={page >= totalPages || isLoadingProducts}
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-white transition-colors"
            >
              {t('common.next', 'Next')} →
            </button>
          </div>
        )}
      </div>
      {/* ══ /Content ══════════════════════════════════════════════════════════ */}

    </div>
  );
};

export default PromoCampaignPage;

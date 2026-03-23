// pages/PromoCampaignPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Tag, Calendar, Percent, ShoppingBag, MapPin } from 'lucide-react';
import { promoService, resolveBannerUrl, type PromoCampaign } from '../services/promoService';
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

// ── Product Card ──────────────────────────────────────────────────────────────

const ProductCard: React.FC<{ p: CampaignProduct; idx: number }> = ({ p, idx }) => {
  const to = `/product/${encodeId(p.product_id)}/${generateSlug(p.product_name)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link to={to} className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
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

          {/* Discount badge */}
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

          {/* Price */}
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign]     = useState<PromoCampaign | null>(null);
  const [products, setProducts]     = useState<CampaignProduct[]>([]);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const LIMIT = 12;

  // Fetch campaign detail
  useEffect(() => {
    if (!id) return;
    setIsLoadingCampaign(true);
    promoService.getCampaignById(Number(id))
      .then((c) => setCampaign(c))
      .catch(() => navigate('/explore', { replace: true }))
      .finally(() => setIsLoadingCampaign(false));
  }, [id, navigate]);

  // Fetch joined products
  useEffect(() => {
    if (!id) return;
    setIsLoadingProducts(true);
    promoService.getCampaignJoinedProducts(Number(id), page, LIMIT)
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
        description={campaign?.description || 'Temukan produk-produk pilihan dalam promo campaign eksklusif ini.'}
      />

      {/* ── Hero banner ── */}
      <div className="relative w-full" style={{ aspectRatio: '1010 / 298', maxHeight: 340 }}>
        {isLoadingCampaign ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : hasBanner ? (
          <img
            src={resolveBannerUrl(campaign!.banner_image!)}
            alt={campaign!.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${fallback}`} />
        )}

        {/* Dark overlay left-to-right */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.50) 35%, rgba(0,0,0,0.10) 65%, transparent 85%)' }}
        />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-bold hover:bg-black/60 transition-colors z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>

        {/* Campaign info on banner */}
        {campaign && (
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 z-[2] pointer-events-none">
            {/* Type badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-3">
              <Tag className="w-3 h-3" />
              {campaign.type?.replace('_', ' ') ?? 'Promo'}
            </div>

            {/* Discount */}
            <div
              className="text-white text-3xl md:text-5xl font-black tracking-tight mb-1"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
            >
              {formatDiscount(campaign)}
            </div>

            {/* Name */}
            <h1
              className="text-white text-lg md:text-2xl font-bold line-clamp-1 mb-1"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
            >
              {campaign.name}
            </h1>

            {/* Period */}
            <p
              className="text-white/80 text-xs flex items-center gap-1.5"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
            >
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(campaign.starts_at)} – {formatDate(campaign.ends_at)}
            </p>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Campaign description + meta */}
        {campaign && (
          <div className="mb-8">
            {campaign.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-3 max-w-2xl">
                {campaign.description}
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {campaign.min_transaction > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                  Min. transaksi: Rp {Number(campaign.min_transaction).toLocaleString('id-ID')}
                </span>
              )}
              {campaign.min_tier_name && (
                <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold">
                  Member {campaign.min_tier_name}
                </span>
              )}
              <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {formatDiscount(campaign)}
              </span>
            </div>
          </div>
        )}

        {/* Products heading */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Produk dalam Campaign
            {total > 0 && <span className="ml-2 text-sm text-gray-400 font-normal">({total} produk)</span>}
          </h2>
        </div>

        {/* Product grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Belum ada produk dalam campaign ini.</p>
          </div>
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
              ← Prev
            </button>
            <span className="text-sm text-gray-500">
              Hal <span className="font-bold text-gray-800">{page}</span> / {totalPages}
            </span>
            <button
              disabled={page >= totalPages || isLoadingProducts}
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-white transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCampaignPage;

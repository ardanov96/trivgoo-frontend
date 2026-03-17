// src/components/agent/components/FlashSaleModal.tsx
import React, { useMemo } from 'react';
import {
  X, Zap, Tag, Users, Calendar, Percent, DollarSign,
  AlertCircle, CheckCircle2, ChevronRight, Package,
} from 'lucide-react';
import { PromoCampaign, resolveBannerUrl } from '../../../services/promoService';
import { AgentProduct } from '../../../types';

interface Props {
  open:                boolean;
  onClose:             () => void;
  campaigns:           PromoCampaign[];
  selectedCampaign:    PromoCampaign | null;
  selectedProduct:     AgentProduct | null;
  eligibleProducts:    AgentProduct[] | null;   // null = belum filter, semua product milik agent
  isJoiningCampaign:   boolean;
  productToJoinId:     number | '';
  setProductToJoinId:  (id: number | '') => void;
  discountPercentage:  string;
  setDiscountPercentage: (v: string) => void;
  onSubmit:            () => Promise<void>;
  isSubmitting?:       boolean;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const FlashSaleModal: React.FC<Props> = ({
  open,
  onClose,
  campaigns,
  selectedCampaign,
  selectedProduct,
  eligibleProducts,
  isJoiningCampaign,
  productToJoinId,
  setProductToJoinId,
  discountPercentage,
  setDiscountPercentage,
  onSubmit,
  isSubmitting = false,
}) => {
  if (!open) return null;

  const campaign = selectedCampaign;

  // Kalkulasi preview harga setelah diskon
  const targetProduct = useMemo(() => {
    if (!isJoiningCampaign) return selectedProduct;
    if (!eligibleProducts || !productToJoinId) return null;
    return eligibleProducts.find(p => p.id === Number(productToJoinId)) || null;
  }, [isJoiningCampaign, selectedProduct, eligibleProducts, productToJoinId]);

  const pct = Number(discountPercentage);
  const basePrice = targetProduct ? Number(targetProduct.price) : 0;
  const salePrice = basePrice > 0 && pct > 0 && pct < 100
    ? Math.round(basePrice * (1 - pct / 100))
    : null;

  const minDiscount = campaign?.discount_type === 'percent' ? campaign.discount_value : 0;
  const belowMin = minDiscount > 0 && pct < minDiscount && pct > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 pt-6 pb-8">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {campaign ? 'Daftarkan ke Campaign' : 'Buat Flash Sale'}
              </h2>
              {campaign && <p className="text-indigo-200 text-xs">{campaign.name}</p>}
            </div>
          </div>
        </div>

        {/* Campaign Info Banner */}
        {campaign && (
          <div className="mx-6 -mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-4">
            <div className="flex gap-3">
              {resolveBannerUrl(campaign.banner_image) && (
                <img
                  src={resolveBannerUrl(campaign.banner_image)}
                  alt={campaign.name}
                  className="w-16 h-12 object-cover rounded-xl shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{campaign.name}</p>
                {campaign.description && (
                  <p className="text-xs text-gray-400 truncate">{campaign.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(campaign.starts_at)} – {formatDate(campaign.ends_at)}
                  </span>
                  <span className="text-[11px] font-bold text-primary-600 flex items-center gap-1">
                    {campaign.discount_type === 'percent'
                      ? <><Percent className="w-3 h-3" /> Diskon {campaign.discount_value}%</>
                      : <><DollarSign className="w-3 h-3" /> Diskon Rp {Number(campaign.discount_value).toLocaleString('id-ID')}</>
                    }
                  </span>
                  {campaign.min_transaction > 0 && (
                    <span className="text-[11px] text-gray-400">
                      Min. Rp {Number(campaign.min_transaction).toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">

          {/* Pilih produk (jika joining campaign tanpa product dipilih) */}
          {isJoiningCampaign && eligibleProducts && eligibleProducts.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Pilih Produk
              </label>
              <select
                value={productToJoinId}
                onChange={e => setProductToJoinId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">-- Pilih produk --</option>
                {eligibleProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Rp {Number(p.price).toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Produk terpilih preview */}
          {targetProduct && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
              {(targetProduct.image_url || (targetProduct as any).image) && (
                <img
                  src={targetProduct.image_url || (targetProduct as any).image}
                  alt={targetProduct.name}
                  className="w-12 h-10 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{targetProduct.name}</p>
                <p className="text-xs text-gray-400">{targetProduct.currency} {Number(targetProduct.price).toLocaleString('id-ID')}</p>
              </div>
            </div>
          )}

          {/* Input diskon */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Persentase Diskon (%)
              {minDiscount > 0 && (
                <span className="text-[11px] font-normal text-gray-400 normal-case">
                  — min. {minDiscount}%
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="number"
                min={minDiscount || 1}
                max={99}
                value={discountPercentage}
                onChange={e => setDiscountPercentage(e.target.value)}
                placeholder={`Min. ${minDiscount || 1}%`}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 transition-all ${
                  belowMin
                    ? 'border-red-400 focus:ring-red-500/20 bg-red-50'
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-gray-50'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
            </div>
            {belowMin && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Campaign ini memerlukan minimal {minDiscount}% diskon
              </p>
            )}
          </div>

          {/* Preview harga */}
          {salePrice !== null && targetProduct && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Preview Harga</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 line-through">
                    Rp {basePrice.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xl font-extrabold text-indigo-700">
                    Rp {salePrice.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-red-500 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl">
                  -{pct}%
                </div>
              </div>
              <p className="text-xs text-indigo-500 mt-2">
                Customer hemat Rp {(basePrice - salePrice).toLocaleString('id-ID')}
              </p>
            </div>
          )}

          {/* Min transaction warning */}
          {campaign?.min_transaction > 0 && salePrice !== null && salePrice < campaign.min_transaction && (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Harga setelah diskon (Rp {salePrice.toLocaleString('id-ID')}) lebih rendah dari minimum transaksi campaign (Rp {Number(campaign.min_transaction).toLocaleString('id-ID')})</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={
                isSubmitting ||
                !discountPercentage ||
                belowMin ||
                (isJoiningCampaign && !productToJoinId)
              }
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Daftar ke Campaign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleModal;

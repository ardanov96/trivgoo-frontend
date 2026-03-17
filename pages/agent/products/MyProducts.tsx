// pages/agent/products/MyProducts.tsx
import { Image as ImageIcon, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../AuthContext';
import { useToast } from '../../../components/ToastContext';

import { agentProductService } from '../../../services/agentProductService';
import { promoService, type PromoCampaign } from '../../../services/promoService';
import http from '../../../services/http';

import { AgentProduct } from '../../../types';

import CampaignsStrip from '../components/CampaignStrip';
import FlashSaleModal from '../components/FlashSaleModal';
import ProductCard from '../components/ProductCard';
import { getAddLabel } from '../utils/labels';

// ─────────────────────────────────────────────────────────────────────────────

const MyProducts: React.FC = () => {
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [products,   setProducts]   = useState<AgentProduct[]>([]);
  const [campaigns,  setCampaigns]  = useState<PromoCampaign[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [showModal,          setShowModal]          = useState(false);
  const [selectedProduct,    setSelectedProduct]    = useState<AgentProduct | null>(null);
  const [selectedCampaign,   setSelectedCampaign]   = useState<PromoCampaign | null>(null);
  const [isJoiningCampaign,  setIsJoiningCampaign]  = useState(false);
  const [productToJoinId,    setProductToJoinId]    = useState<number | ''>('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [isSubmitting,       setIsSubmitting]       = useState(false);

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) loadData();
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
      console.error(e);
      showToast(e?.message || 'Failed to load products', 'error');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Toggle aktif/nonaktif ────────────────────────────────────────────────
  const handleToggleStatus = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newStatus = !product.is_active;
    setProducts(cur => cur.map(p => p.id === id ? { ...p, is_active: newStatus } : p));
    try {
      await agentProductService.updateProductStatus(id, newStatus);
      showToast(`Product ${newStatus ? 'enabled' : 'disabled'}`, 'success');
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to update status', 'error');
      setProducts(cur => cur.map(p => p.id === id ? { ...p, is_active: !newStatus } : p));
    }
  };

  // ── Hapus produk ─────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    const prev = products;
    setProducts(cur => cur.filter(p => p.id !== id));
    try {
      await agentProductService.deleteProduct(id);
      showToast('Product deleted', 'success');
      await loadData();
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to delete product', 'error');
      setProducts(prev);
    }
  };

  // ── Buka modal dari ProductCard ──────────────────────────────────────────
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

  // ── Buka modal dari CampaignsStrip ───────────────────────────────────────
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
    setShowModal(false);
    setSelectedProduct(null);
    setSelectedCampaign(null);
    setIsJoiningCampaign(false);
    setDiscountPercentage('');
    setProductToJoinId('');
  };

  // ── Submit join campaign ─────────────────────────────────────────────────
  const submitFlashSale = async () => {
    const targetProduct = isJoiningCampaign
      ? products.find(p => p.id === Number(productToJoinId))
      : selectedProduct;

    if (!targetProduct) {
      showToast('Pilih produk terlebih dahulu', 'error');
      return;
    }

    const pct = Number(discountPercentage);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
      showToast('Invalid discount percentage (1–99%)', 'error');
      return;
    }

    const minDiscount = selectedCampaign?.discount_type === 'percent'
      ? selectedCampaign.discount_value
      : 0;

    if (minDiscount > 0 && pct < minDiscount) {
      showToast(`Campaign requires minimum ${minDiscount}% discount`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const salePrice = Math.round(Number(targetProduct.price) * (1 - pct / 100));

      if (selectedCampaign) {
        await http.post(`/promo-campaigns/${selectedCampaign.id}/join`, {
          product_id:   targetProduct.id,
          discount_pct: pct,
          sale_price:   salePrice,
        });
      } else {
        await http.post('/promo-campaigns/flash-sale', {
          product_id:   targetProduct.id,
          discount_pct: pct,
          sale_price:   salePrice,
        });
      }

      showToast('Request submitted successfully!', 'success');
      closeModal();
      await loadData();
    } catch (e: any) {
      console.error(e);
      showToast(e?.response?.data?.message || e?.message || 'Failed to submit', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">

      {/* Campaign Strip */}
      {campaigns.length > 0 && (
        <CampaignsStrip campaigns={campaigns} onJoinCampaign={openCampaignJoinModal} />
      )}

      {/* Header */}
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

      {/* Body */}
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
          <Link
            to="/agent/products/new"
            className="text-primary-600 font-bold hover:underline flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1" /> {getAddLabel(user?.specialization)}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleStatus={() => handleToggleStatus(product.id)}
              onDelete={() => handleDelete(product.id)}
              onJoinFlashSale={() => openFlashSaleModal(product)}
              onNavigateEdit={() => navigate(`/agent/products/edit/${product.id}`)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <FlashSaleModal
          open={showModal}
          onClose={closeModal}
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          selectedProduct={selectedProduct}
          eligibleProducts={isJoiningCampaign ? products : null}
          isJoiningCampaign={isJoiningCampaign}
          productToJoinId={productToJoinId}
          setProductToJoinId={setProductToJoinId}
          discountPercentage={discountPercentage}
          setDiscountPercentage={setDiscountPercentage}
          onSubmit={submitFlashSale}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default MyProducts;

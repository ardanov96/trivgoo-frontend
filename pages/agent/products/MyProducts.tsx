import { Image as ImageIcon, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../AuthContext';
import { useToast } from '../../../components/ToastContext';

// ✅ pakai API service
import { agentProductService } from '../../../services/agentProductService';

// campaign masih mock (sementara)
import { mockService } from '../../../services/mockService';

import { AgentProduct, FlashSaleCampaign, Product } from '../../../types';

import CampaignsStrip from '../components/CampaignStrip';
import FlashSaleModal from '../components/FlashSaleModal';
import ProductCard from '../components/ProductCard';
import { getAddLabel } from '../utils/labels';

const AgentProducts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState<AgentProduct[]>([]);
  const [campaigns, setCampaigns] = useState<FlashSaleCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // modal state
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<FlashSaleCampaign | null>(null);
  const [isJoiningCampaign, setIsJoiningCampaign] = useState(false);

  // modal fields
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [productToJoinId, setProductToJoinId] = useState<number | ''>('');

  // const eligibleProducts = useMemo(() => products.filter((p) => !p.flashSale), [products]);

  useEffect(() => {
    if (user) loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const [prodData, campaignData] = await Promise.all([
        agentProductService.getMyProducts(),
        mockService.getCampaigns(),
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

  const handleToggleStatus = async (id: number) => {
    await mockService.toggleProductStatus(id);
    await loadData();
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm('Are you sure you want to delete this product? This action cannot be undone.')
    )
      return;

    await mockService.deleteProduct(id);
    await loadData();
  };

  const openFlashSaleModal = (product: Product, campaign?: FlashSaleCampaign) => {
    setSelectedProduct(product);

    if (campaign) {
      setSelectedCampaign(campaign);
      setIsJoiningCampaign(true);
    } else {
      setSelectedCampaign(null);
      setIsJoiningCampaign(false);
    }

    setProductToJoinId('');
    setDiscountPercentage('10');
    setShowFlashSaleModal(true);
  };

  const openCampaignJoinModal = (campaign: FlashSaleCampaign) => {
    setSelectedCampaign(campaign);
    setIsJoiningCampaign(true);

    setSelectedProduct(null);
    setProductToJoinId('');
    setDiscountPercentage('');
    setShowFlashSaleModal(true);
  };

  const closeModal = () => {
    setShowFlashSaleModal(false);
    setSelectedProduct(null);
    setSelectedCampaign(null);
    setIsJoiningCampaign(false);
    setDiscountPercentage('');
    setProductToJoinId('');
  };

  const submitFlashSale = async () => {
    const targetProduct = isJoiningCampaign
      ? products.find((p) => p.id === Number(productToJoinId))
      : selectedProduct;

    if (!targetProduct) return;

    const percentage = Number(discountPercentage);
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage >= 100) {
      showToast('Invalid discount percentage', 'error');
      return;
    }

    if (selectedCampaign && percentage < selectedCampaign.minDiscount) {
      showToast(`Campaign requires minimum ${selectedCampaign.minDiscount}% discount.`, 'error');
      return;
    }

    const calculatedSalePrice = Math.round(targetProduct.price * (1 - percentage / 100));

    await mockService.requestFlashSale(targetProduct.id, calculatedSalePrice, selectedCampaign?.id);

    showToast('Request submitted successfully!', 'success');
    closeModal();
    await loadData();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Active Campaigns */}
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
          {[1, 2, 3].map((i) => (
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
            You haven&apos;t listed any services yet. Start adding your first product to reach
            thousands of travelers.
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
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleStatus={() => handleToggleStatus(product.id)}
              onDelete={() => handleDelete(product.id)}
              onJoinFlashSale={() => openFlashSaleModal(null)}
              onNavigateEdit={() => navigate(`/agent/products/edit/${product.id}`)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showFlashSaleModal && (
        <FlashSaleModal
          open={showFlashSaleModal}
          onClose={closeModal}
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          selectedProduct={selectedProduct}
          eligibleProducts={null}
          isJoiningCampaign={isJoiningCampaign}
          productToJoinId={productToJoinId}
          setProductToJoinId={setProductToJoinId}
          discountPercentage={discountPercentage}
          setDiscountPercentage={setDiscountPercentage}
          onSubmit={submitFlashSale}
        />
      )}
    </div>
  );
};

export default AgentProducts;

import { Calendar, CheckCircle, Eye, Package, Plus, Search, Tag, XCircle, Zap } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/ToastContext';
import { adminService } from '../../services/adminService';
import { AgentProduct, FlashSaleCampaign } from '../../types';

// import { mockService } from "../../services/mockService"; // ✅ tetap boleh, tapi kalau belum dipakai biarin comment aja

const AdminProducts: React.FC = () => {
  const { showToast } = useToast();

  // ✅ sesuai API response
  const [products, setProducts] = useState<AgentProduct[]>([]);
  const [campaigns, setCampaigns] = useState<FlashSaleCampaign[]>([]);

  const [activeTab, setActiveTab] = useState<'all' | 'flash_sale' | 'campaigns'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // optional: filter owner_id
  const [ownerId] = useState<number | undefined>(undefined);

  // Campaign Form State
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    minDiscount: 10,
    adminFeePercentage: 5,
    image: '',
  });

  const fetchData = async () => {
    setIsLoading(true);

    // const [prodData, campaignData] = await Promise.all([
    //   mockService.getProducts(),
    //   mockService.getCampaigns(),
    // ]);
    // setProducts(prodData);
    // setCampaigns(campaignData);

    try {
      // ✅ API: /admin/agents/products?owner_id&q&page&limit
      const res = await adminService.listAgentProducts({
        owner_id: ownerId,
        q: searchQuery,
        page,
        limit,
      });

      setProducts(res.data?.data || []);
      setTotalPages(res.data?.meta?.total_pages ?? 1);

      // campaign masih mock (belum ada endpoint)
      // const campaignData = await mockService.getCampaigns();
      // setCampaigns(campaignData);
    } catch (e: any) {
      showToast(e?.message || 'Failed to load products', 'error');
      setProducts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  // debounce search biar ga spam request
  useEffect(() => {
    if (activeTab === 'campaigns') return;

    const t = setTimeout(() => {
      setPage(1);
      // fetchData akan pakai page state terbaru,
      // jadi kita panggil setelah setPage(1) dengan sedikit delay:
      // paling aman: panggil langsung API untuk page=1
      (async () => {
        setIsLoading(true);
        try {
          const res = await adminService.listAgentProducts({
            owner_id: ownerId,
            q: searchQuery,
            page: 1,
            limit,
          });
          setProducts(res.data?.data || []);
          setTotalPages(res.data?.meta?.total_pages ?? 1);
        } catch (e: any) {
          showToast(e?.message || 'Failed to load products', 'error');
          setProducts([]);
          setTotalPages(1);
        } finally {
          setIsLoading(false);
        }
      })();
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeTab]);

  const handleFlashSaleAction = async (id: number, action: 'approve' | 'reject') => {
    // if (action === 'approve') {
    //   // Default to 24 hours from now for demo if not linked to campaign,
    //   // else use campaign end date
    //   const product = products.find((p) => p.id === id);
    //   let endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    //   if (product?.flashSale?.campaignId) {
    //     const campaign = campaigns.find((c) => c.id === product.flashSale?.campaignId);
    //     if (campaign) endTime = campaign.endDate + 'T23:59:59';
    //   }
    //   await mockService.approveFlashSale(id, endTime);
    //   showToast('Flash sale approved successfully!');
    // } else {
    //   //   await mockService.rejectFlashSale(id);
    //   showToast('Flash sale rejected.', 'info');
    // }
    // fetchData();

    showToast(
      `Flash sale ${action} not implemented yet for product #${id}`,
      action === 'approve' ? 'success' : 'info',
    );
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    // await mockService.addCampaign({
    //   ...newCampaign,
    //   isActive: true,
    //   image:
    //     newCampaign.image ||
    //     'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80',
    // });
    // showToast('Campaign created successfully!', 'success');
    // setShowCampaignModal(false);
    // setNewCampaign({
    //   name: '',
    //   description: '',
    //   startDate: '',
    //   endDate: '',
    //   minDiscount: 10,
    //   adminFeePercentage: 5,
    //   image: '',
    // });

    showToast('Campaign creation not implemented yet', 'info');
    setShowCampaignModal(false);

    fetchData();
  };

  const filteredProducts = useMemo(() => {
    // const matchesSearch =
    //   p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //   (p.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    // if (activeTab === 'flash_sale') {
    //   return matchesSearch && p.flashSale && p.flashSale.status === 'pending';
    // }
    // return matchesSearch;

    // ✅ API belum ada flashSale, jadi kalau flash_sale tab -> kosong
    if (activeTab === 'flash_sale') return [];
    return products;
  }, [products, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product & Campaigns</h2>
          <p className="text-gray-500 text-sm">
            Manage listings, approve promos, and organize events.
          </p>
        </div>

        {activeTab === 'campaigns' ? (
          <button
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg font-bold shadow-md hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Campaign
          </button>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 pt-6">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Package className="w-4 h-4 mr-2" />
              All Listings
            </button>

            <button
              onClick={() => setActiveTab('flash_sale')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center whitespace-nowrap ${
                activeTab === 'flash_sale'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              Flash Sale Requests
              {/*
              {products.filter((p) => p.flashSale?.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {products.filter((p) => p.flashSale?.status === 'pending').length}
                </span>
              )}
              */}
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center whitespace-nowrap ${
                activeTab === 'campaigns'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Tag className="w-4 h-4 mr-2" />
              Campaigns
            </button>
          </div>
        </div>

        {activeTab === 'campaigns' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col group"
              >
                <div className="h-40 relative overflow-hidden">
                  <img
                    src={campaign.image}
                    alt={campaign.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                      campaign.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}
                  >
                    {campaign.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{campaign.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{campaign.description}</p>

                  <div className="flex items-center gap-4 text-xs font-medium text-gray-600 mb-4">
                    <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                      <Calendar className="w-3 h-3 mr-1" /> {campaign.startDate} -{' '}
                      {campaign.endDate}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Incentives</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-bold">
                          -{campaign.minDiscount}% Price
                        </span>
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold">
                          {campaign.adminFeePercentage}% Fee
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {campaigns.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No campaigns found. Create one to engage agents!
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  {activeTab === 'flash_sale' && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Promo Offer
                    </th>
                  )}
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={activeTab === 'flash_sale' ? 6 : 5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === 'flash_sale' ? 6 : 5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={product.image_url || product.image}
                            className="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-100"
                            alt=""
                          />
                          <div>
                            <div className="text-sm font-bold text-gray-900 line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">ID: #{product.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.owner?.name || 'Unknown'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                          {(product.details?.type || '-').toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {product.currency} {product.price}
                      </td>

                      {activeTab === 'flash_sale' && (
                        <td className="px-6 py-4 text-gray-400 text-sm">-</td>
                      )}

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>

                          {activeTab === 'flash_sale' && (
                            <>
                              <button
                                onClick={() => handleFlashSaleAction(product.id, 'approve')}
                                className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                title="Approve Promo"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleFlashSaleAction(product.id, 'reject')}
                                className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Page <span className="font-bold text-gray-700">{page}</span> /{' '}
                <span className="font-bold text-gray-700">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Creation Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New Campaign</h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-xl"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Christmas Sale"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-xl h-24 resize-none"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  placeholder="Describe the event..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border rounded-xl"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border rounded-xl"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Min. Discount (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border rounded-xl"
                    value={newCampaign.minDiscount}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, minDiscount: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Agent Fee (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border rounded-xl"
                    value={newCampaign.adminFeePercentage}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        adminFeePercentage: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Normal fee is 11%. Lower this to incentivize agents.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors mt-2"
              >
                Launch Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

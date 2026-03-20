// pages/admin/Products.tsx
import {
  Calendar,
  CheckCircle,
  Eye,
  Package,
  Plus,
  Search,
  Tag,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { encodeId } from "../../utils/hashids";
import { generateSlug } from "../../utils/slugify";
import { useToast } from "../../components/ToastContext";
import {
  adminService,
  Campaign,
  CampaignStatus,
  FlashSaleRequest,
} from "../../services/adminService";
import { AgentProduct } from "../../types";

const AdminProducts: React.FC = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState<AgentProduct[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [flashRequests, setFlashRequests] = useState<FlashSaleRequest[]>([]);

  const [activeTab, setActiveTab] = useState<"all" | "flash_sale" | "campaigns">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);

  const [flashPage, setFlashPage] = useState(1);
  const [flashTotalPages, setFlashTotalPages] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);

  const [ownerId] = useState<number | undefined>(undefined);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    minDiscount: 10,
    agentFeePercentage: 5,
    status: "ACTIVE" as CampaignStatus,
  });

  // ── Fetch functions ──────────────────────────────────────────────────────

  const fetchProducts = async (opts?: { pageOverride?: number; qOverride?: string }) => {
    setIsLoading(true);
    try {
      const res = await adminService.listAgentProducts({
        owner_id: ownerId,
        q: opts?.qOverride ?? searchQuery,
        page: opts?.pageOverride ?? page,
        limit,
      });
      setProducts(res.data?.data || []);
      setTotalPages(res.data?.meta?.total_pages ?? 1);
    } catch (e: any) {
      showToast(e?.message || "Failed to load products", "error");
      setProducts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async (opts?: { pageOverride?: number; qOverride?: string }) => {
    setIsLoading(true);
    try {
      const res = await adminService.listCampaigns({
        q: opts?.qOverride ?? searchQuery,
        page: opts?.pageOverride ?? campaignPage,
        limit,
      });
      setCampaigns(res.data?.data || []);
      setCampaignTotalPages(res.data?.meta?.total_pages ?? 1);
    } catch (e: any) {
      showToast(e?.message || "Failed to load campaigns", "error");
      setCampaigns([]);
      setCampaignTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlashRequests = async (opts?: { pageOverride?: number }) => {
    setIsLoading(true);
    try {
      const res = await adminService.listFlashSaleRequests({
        status: "pending",
        page: opts?.pageOverride ?? flashPage,
        limit,
      });
      setFlashRequests(res.data?.data || []);
      setFlashTotalPages(res.data?.meta?.total_pages ?? 1);
      setPendingCount(res.data?.meta?.total ?? 0);
    } catch (e: any) {
      showToast(e?.message || "Failed to load flash sale requests", "error");
      setFlashRequests([]);
      setFlashTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await adminService.listFlashSaleRequests({ status: "pending", limit: 1 });
      setPendingCount(res.data?.meta?.total ?? 0);
    } catch {
      // silent fail
    }
  };

  const fetchData = async () => {
    if (activeTab === "campaigns") return fetchCampaigns();
    if (activeTab === "flash_sale") return fetchFlashRequests();
    return fetchProducts();
  };

  useEffect(() => {
    fetchData();
    fetchPendingCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, campaignPage, flashPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (activeTab === "campaigns") {
        setCampaignPage(1);
        fetchCampaigns({ pageOverride: 1, qOverride: searchQuery });
      } else if (activeTab === "flash_sale") {
        setFlashPage(1);
        fetchFlashRequests({ pageOverride: 1 });
      } else {
        setPage(1);
        fetchProducts({ pageOverride: 1, qOverride: searchQuery });
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeTab]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleFlashSaleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await adminService.updateFlashSaleRequest(id, action);
      showToast(
        `Flash sale request ${action === "approve" ? "approved" : "rejected"}`,
        "success"
      );
      await fetchFlashRequests();
      await fetchPendingCount();
    } catch (e: any) {
      showToast(e?.message || "Failed to process request", "error");
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCampaign({
        name: newCampaign.name.trim(),
        description: newCampaign.description?.trim() || null,
        start_date: newCampaign.startDate,
        end_date: newCampaign.endDate,
        min_discount_percent: Number(newCampaign.minDiscount || 0),
        agent_fee_percent: Number(newCampaign.agentFeePercentage || 0),
        status: newCampaign.status || "DRAFT",
      });
      showToast("Campaign created successfully!", "success");
      setShowCampaignModal(false);
      setNewCampaign({ name: "", description: "", startDate: "", endDate: "", minDiscount: 10, agentFeePercentage: 5, status: "ACTIVE" });
      setActiveTab("campaigns");
      setCampaignPage(1);
      await fetchCampaigns({ pageOverride: 1, qOverride: searchQuery });
    } catch (e: any) {
      showToast(e?.message || "Failed to create campaign", "error");
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeTab === "flash_sale") return [];
    return products;
  }, [products, activeTab]);

  const statusBadge = (status?: CampaignStatus) => {
    const s = (status || "DRAFT").toUpperCase() as CampaignStatus;
    if (s === "ACTIVE") return "bg-green-500 text-white";
    if (s === "ENDED") return "bg-gray-500 text-white";
    if (s === "CANCELLED") return "bg-red-500 text-white";
    return "bg-yellow-500 text-white";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product & Campaigns</h2>
          <p className="text-gray-500 text-sm">Manage listings, approve promos, and organize events.</p>
        </div>
        {activeTab === "campaigns" ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search campaigns..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button onClick={() => setShowCampaignModal(true)} className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg font-bold shadow-md hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Create Campaign
            </button>
          </div>
        ) : activeTab === "all" ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 pt-6">
          <div className="flex space-x-8 overflow-x-auto">
            <button onClick={() => setActiveTab("all")} className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === "all" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              <Package className="w-4 h-4 mr-2" /> All Listings
            </button>
            <button onClick={() => setActiveTab("flash_sale")} className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === "flash_sale" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              <Zap className="w-4 h-4 mr-2" />
              Flash Sale Requests
              {pendingCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
            <button onClick={() => setActiveTab("campaigns")} className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === "campaigns" ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              <Tag className="w-4 h-4 mr-2" /> Campaigns
            </button>
          </div>
        </div>

        {/* ── Campaigns tab ── */}
        {activeTab === "campaigns" ? (
          <>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-gray-500">Loading...</div>
              ) : (
                campaigns.map((c) => (
                  <div key={c.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mt-1">{c.description || "-"}</p>
                      </div>
                      <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${statusBadge(c.status)}`}>{c.status}</div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-4">
                        <div className="flex items-center bg-gray-50 px-2 py-1 rounded"><Calendar className="w-3 h-3 mr-1" />{c.start_date} - {c.end_date}</div>
                        <div className="flex items-center bg-gray-50 px-2 py-1 rounded"><span className="text-gray-500">Products:</span><span className="ml-1 font-bold text-gray-700">{c.product_count ?? 0}</span></div>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100 text-sm">
                        <p className="text-gray-400 text-xs uppercase font-bold">Incentives</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-bold">-{Number(c.min_discount_percent || 0)}% Price</span>
                          <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold">{Number(c.agent_fee_percent || 0)}% Fee</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {!isLoading && campaigns.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">No campaigns found. Create one to engage agents!</div>
              )}
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">Page <span className="font-bold text-gray-700">{campaignPage}</span> / <span className="font-bold text-gray-700">{campaignTotalPages}</span></div>
              <div className="flex gap-2">
                <button disabled={campaignPage <= 1 || isLoading} onClick={() => setCampaignPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Prev</button>
                <button disabled={campaignPage >= campaignTotalPages || isLoading} onClick={() => setCampaignPage((p) => p + 1)} className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Next</button>
              </div>
            </div>
          </>

        ) : activeTab === "flash_sale" ? (
          /* ── Flash Sale Requests tab ── */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Original Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Promo Offer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Requested At</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                ) : flashRequests.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No pending flash sale requests.</td></tr>
                ) : (
                  flashRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {req.product_image ? (
                            <img
                              src={req.product_image}
                              className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                              alt=""
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-bold text-gray-900 line-clamp-1 max-w-[180px]">{req.product_name}</div>
                            <div className="text-xs text-gray-400">ID: #{req.product_id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Agent */}
                      <td className="px-6 py-4 text-sm text-gray-600">{req.agent_name}</td>

                      {/* Original price */}
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {req.product_currency} {Number(req.product_price).toLocaleString()}
                      </td>

                      {/* Promo offer */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg w-fit">
                            -{req.discount_pct}%
                          </span>
                          {req.sale_price && (
                            <span className="text-xs text-gray-500">
                              → {req.product_currency} {Number(req.sale_price).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Requested at */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(req.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {/* View product — buka di tab baru */}
                          <Link
                            to={`/product/${encodeId(req.product_id)}/${generateSlug(req.product_name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View Product"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>

                          {/* Approve */}
                          <button
                            onClick={() => handleFlashSaleAction(req.id, "approve")}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>

                          {/* Reject */}
                          <button
                            onClick={() => handleFlashSaleAction(req.id, "reject")}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">Page <span className="font-bold text-gray-700">{flashPage}</span> / <span className="font-bold text-gray-700">{flashTotalPages}</span></div>
              <div className="flex gap-2">
                <button disabled={flashPage <= 1 || isLoading} onClick={() => setFlashPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Prev</button>
                <button disabled={flashPage >= flashTotalPages || isLoading} onClick={() => setFlashPage((p) => p + 1)} className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>

        ) : (
          /* ── All Products tab ── */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No products found.</td></tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={(product as any).image_url || (product as any).image} className="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-100" alt="" />
                          <div>
                            <div className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</div>
                            <div className="text-xs text-gray-500">ID: #{product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{(product as any).owner?.name || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{(((product as any).details?.type || "-") as string).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{(product as any).currency} {(product as any).price}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/product/${encodeId(product.id)}/${generateSlug(product.name)}`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors inline-block" title="View">
                          <Eye className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">Page <span className="font-bold text-gray-700">{page}</span> / <span className="font-bold text-gray-700">{totalPages}</span></div>
              <div className="flex gap-2">
                <button disabled={page <= 1 || isLoading} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Prev</button>
                <button disabled={page >= totalPages || isLoading} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Next</button>
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
              <button onClick={() => setShowCampaignModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Campaign Name</label>
                <input type="text" required className="w-full px-4 py-2 border rounded-xl" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea className="w-full px-4 py-2 border rounded-xl h-24 resize-none" value={newCampaign.description} onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                  <input type="date" required className="w-full px-4 py-2 border rounded-xl" value={newCampaign.startDate} onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                  <input type="date" required className="w-full px-4 py-2 border rounded-xl" value={newCampaign.endDate} onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Min. Discount (%)</label>
                  <input type="number" min="0" max="100" required className="w-full px-4 py-2 border rounded-xl" value={newCampaign.minDiscount} onChange={(e) => setNewCampaign({ ...newCampaign, minDiscount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Agent Fee (%)</label>
                  <input type="number" min="0" max="100" required className="w-full px-4 py-2 border rounded-xl" value={newCampaign.agentFeePercentage} onChange={(e) => setNewCampaign({ ...newCampaign, agentFeePercentage: Number(e.target.value) })} />
                  <p className="text-[10px] text-gray-500 mt-1">Normal fee is 11%. Lower this to incentivize agents.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select className="w-full px-4 py-2 border rounded-xl" value={newCampaign.status} onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value as CampaignStatus })}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ENDED">ENDED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors mt-2">Launch Campaign</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

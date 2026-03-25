// pages/admin/Products.tsx
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  Package,
  Package2,
  Search,
  Tag,
  XCircle,
  Zap,
  Percent,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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

// ── Types ────────────────────────────────────────────────────────────────────

interface JoinedProduct {
  join_id:          number;
  campaign_id:      number;
  product_id:       number;
  product_name:     string;
  product_price:    number;
  product_currency: string;
  product_image:    string | null;
  product_location: string | null;
  discount_pct:     number | null;
  sale_price:       number | null;
  join_status:      "pending" | "active" | "inactive" | "rejected";
  joined_at:        string;
  agent_id:         number;
  agent_name:       string;
}

interface CampaignWithProducts extends Campaign {
  joined_products?:     JoinedProduct[];
  is_expanded?:         boolean;
  is_loading_products?: boolean;
  join_page?:           number;
  join_total_pages?:    number;
  join_total?:          number;
  pending_count?:       number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sanitize image URL: jika URL mengandung localhost (terjadi saat data
 * disimpan dari environment lokal), ambil pathname-nya saja agar gambar
 * tetap bisa ditampilkan di production.
 *
 * Contoh:
 *   "http://localhost:3001/car-rental/InnovaReborn.png"
 *   → "/car-rental/InnovaReborn.png"
 */
const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.includes("localhost")) {
    try {
      const parsed = new URL(url);
      return parsed.pathname; // "/car-rental/InnovaReborn.png"
    } catch {
      return url;
    }
  }
  return url;
};

// ── Confirm Dialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open:       boolean;
  action:     "approve" | "reject";
  type:       "campaign" | "flash";
  productName: string;
  context:    string;   // campaign name or "Flash Sale"
  image:      string | null;
  onConfirm:  () => void;
  onCancel:   () => void;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, action, type, productName, context, image, onConfirm, onCancel, isLoading,
}) => {
  const isApprove = action === "approve";

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div
              className="h-1 w-full"
              style={{
                background: isApprove
                  ? "linear-gradient(to right, #22c55e, #16a34a)"
                  : "linear-gradient(to right, #ef4444, #dc2626)",
              }}
            />

            <div className="p-6">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: isApprove ? "#EAF3DE" : "#FCEBEB",
                  border: `1px solid ${isApprove ? "#97C459" : "#F09595"}`,
                }}
              >
                {isApprove
                  ? <CheckCircle className="w-6 h-6" style={{ color: "#27500A" }} />
                  : <XCircle    className="w-6 h-6" style={{ color: "#791F1F" }} />
                }
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {isApprove ? "Setujui pengajuan ini?" : "Tolak pengajuan ini?"}
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                {type === "campaign" ? "Campaign submission" : "Flash sale request"}
              </p>

              {/* Product preview */}
              <div
                className="flex items-center gap-3 rounded-xl p-3 mb-5"
                style={{ background: "#FAFAF9", border: "0.5px solid #ECEAE6" }}
              >
                {image ? (
                  <img
                    src={resolveImageUrl(image)}
                    alt=""
                    className="w-11 h-11 rounded-lg object-cover shrink-0 bg-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-gray-100 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{productName}</p>
                  <p className="text-xs truncate" style={{ color: type === "campaign" ? "#534AB7" : "#854F0B" }}>
                    {type === "campaign"
                      ? <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" />{context}</span>
                      : <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3" />{context}</span>
                    }
                  </p>
                </div>
              </div>

              {/* Warning text for reject */}
              {!isApprove && (
                <div
                  className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-5 text-xs"
                  style={{ background: "#FFF8EC", border: "0.5px solid #FAC775", color: "#633806" }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#BA7517" }} />
                  Produk tidak akan tampil di campaign / flash sale. Agent bisa mengajukan ulang.
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{
                    background: isApprove ? "#16a34a" : "#dc2626",
                  }}
                >
                  {isLoading && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  {isApprove ? "Ya, Setujui" : "Ya, Tolak"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ── Konstanta ─────────────────────────────────────────────────────────────────

const JOIN_LIMIT = 8;

// ── Fetch helpers ─────────────────────────────────────────────────────────────

interface FetchJoinedResult {
  products:    JoinedProduct[];
  total:       number;
  total_pages: number;
  page:        number;
}

async function fetchJoinedProducts(
  campaignId: number,
  page = 1,
  limit = JOIN_LIMIT
): Promise<FetchJoinedResult> {
  const res = await fetch(
    `/api/v1/promo-campaigns/${campaignId}/joined-products?page=${page}&limit=${limit}`,
    { credentials: "include" }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
  const body = await res.json();
  const data = body?.data ?? body ?? {};
  return {
    products:    data?.products    ?? [],
    total:       data?.meta?.total       ?? data?.total       ?? 0,
    total_pages: data?.meta?.total_pages ?? data?.total_pages ?? 1,
    page:        data?.meta?.page        ?? data?.page        ?? page,
  };
}

async function reviewJoinedProduct(
  campaignId: number,
  joinId: number,
  action: "approve" | "reject"
): Promise<void> {
  const res = await fetch(
    `/api/v1/promo-campaigns/${campaignId}/joined-products/${joinId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

const campaignStatusBadge = (status?: CampaignStatus) => {
  const s = (status || "DRAFT").toUpperCase() as CampaignStatus;
  if (s === "ACTIVE")    return "bg-green-500 text-white";
  if (s === "ENDED")     return "bg-gray-500 text-white";
  if (s === "CANCELLED") return "bg-red-500 text-white";
  return "bg-yellow-500 text-white";
};

const joinStatusBadge = (status: string) => {
  if (status === "active")   return "bg-green-100 text-green-700";
  if (status === "rejected") return "bg-red-100 text-red-600";
  if (status === "inactive") return "bg-gray-100 text-gray-500";
  return "bg-amber-100 text-amber-700";
};

const joinStatusLabel = (status: string) => {
  if (status === "active")   return "Aktif";
  if (status === "rejected") return "Ditolak";
  if (status === "inactive") return "Nonaktif";
  return "Menunggu Review";
};

// ── Pending dialog state type ─────────────────────────────────────────────────

interface PendingAction {
  kind:        "campaign" | "flash";
  action:      "approve" | "reject";
  productName: string;
  context:     string;
  image:       string | null;
  // campaign-specific
  campaignId?: number;
  joinId?:     number;
  // flash-specific
  flashId?:   number;
}

// ── Component ─────────────────────────────────────────────────────────────────

const AdminProducts: React.FC = () => {
  const { showToast } = useToast();

  const [products,      setProducts]      = useState<AgentProduct[]>([]);
  const [campaigns,     setCampaigns]     = useState<CampaignWithProducts[]>([]);
  const [flashRequests, setFlashRequests] = useState<FlashSaleRequest[]>([]);

  const [activeTab,    setActiveTab]    = useState<"all" | "flash_sale" | "campaigns">("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [isLoading,    setIsLoading]    = useState(true);

  const [page,       setPage]       = useState(1);
  const [limit]                     = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [campaignPage,       setCampaignPage]       = useState(1);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);

  const [flashPage,       setFlashPage]       = useState(1);
  const [flashTotalPages, setFlashTotalPages] = useState(1);
  const [pendingCount,    setPendingCount]    = useState(0);

  const [ownerId] = useState<number | undefined>(undefined);

  // ── Confirm dialog state ──────────────────────────────────────────────────
  const [pendingAction,   setPendingAction]   = useState<PendingAction | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchProducts = async (opts?: { pageOverride?: number; qOverride?: string }) => {
    setIsLoading(true);
    try {
      const res = await adminService.listAgentProducts({
        owner_id: ownerId,
        q:        opts?.qOverride ?? searchQuery,
        page:     opts?.pageOverride ?? page,
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
        q:     opts?.qOverride ?? searchQuery,
        page:  opts?.pageOverride ?? campaignPage,
        limit,
      });
      const payload = res.data as any;
      const data: CampaignWithProducts[] = payload?.campaigns ?? payload?.data ?? [];
      const total_pages = payload?.meta?.total_pages ?? payload?.total_pages ?? 1;

      setCampaigns(data.map((c) => ({
        ...c,
        is_expanded:         false,
        joined_products:     undefined,
        join_page:           1,
        join_total_pages:    1,
        join_total:          c.product_count ?? 0,
        pending_count:       (c as any).pending_count ?? 0,
      })));
      setCampaignTotalPages(total_pages);
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
        page:   opts?.pageOverride ?? flashPage,
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
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (activeTab === "campaigns")       fetchCampaigns();
    else if (activeTab === "flash_sale") fetchFlashRequests();
    else                                 fetchProducts();
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

  // ── Load joined products ──────────────────────────────────────────────────

  const loadJoinedProducts = async (campaignId: number, page: number) => {
    setCampaigns((prev) =>
      prev.map((c) => c.id === campaignId ? { ...c, is_loading_products: true } : c)
    );
    try {
      const result = await fetchJoinedProducts(campaignId, page, JOIN_LIMIT);
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId
            ? { ...c, joined_products: result.products, join_page: result.page, join_total_pages: result.total_pages, join_total: result.total, is_loading_products: false }
            : c
        )
      );
    } catch (e: any) {
      showToast(e?.message || "Gagal memuat produk campaign", "error");
      setCampaigns((prev) =>
        prev.map((c) => c.id === campaignId ? { ...c, joined_products: [], is_loading_products: false } : c)
      );
    }
  };

  const handleToggleCampaign = async (campaignId: number) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    if (campaign.is_expanded) {
      setCampaigns((prev) => prev.map((c) => c.id === campaignId ? { ...c, is_expanded: false } : c));
      return;
    }
    setCampaigns((prev) => prev.map((c) => c.id === campaignId ? { ...c, is_expanded: true } : c));
    if (campaign.joined_products === undefined) {
      await loadJoinedProducts(campaignId, 1);
    }
  };

  // ── Confirm dialog triggers ───────────────────────────────────────────────

  const promptReviewJoin = (
    campaignId: number,
    joinId: number,
    action: "approve" | "reject",
    p: JoinedProduct,
    campaignName: string
  ) => {
    setPendingAction({
      kind: "campaign", action,
      productName: p.product_name,
      context:     campaignName,
      image:       p.product_image,
      campaignId,
      joinId,
    });
  };

  const promptFlashAction = (
    req: FlashSaleRequest,
    action: "approve" | "reject"
  ) => {
    setPendingAction({
      kind: "flash", action,
      productName: req.product_name,
      context:     `Flash Sale -${req.discount_pct}%`,
      image:       req.product_image,
      flashId:     req.id,
    });
  };

  // ── Execute confirmed action ──────────────────────────────────────────────

  const handleConfirm = async () => {
    if (!pendingAction) return;
    setIsConfirmLoading(true);
    try {
      if (pendingAction.kind === "campaign") {
        await reviewJoinedProduct(pendingAction.campaignId!, pendingAction.joinId!, pendingAction.action);
        showToast(
          pendingAction.action === "approve" ? "Produk disetujui ke campaign" : "Produk ditolak",
          "success"
        );
        const new_status = pendingAction.action === "approve" ? "active" : "rejected";
        setCampaigns((prev) =>
          prev.map((c) => {
            if (c.id !== pendingAction.campaignId) return c;
            return {
              ...c,
              pending_count: Math.max(0, (c.pending_count ?? 0) - 1),
              joined_products: c.joined_products?.map((p) =>
                p.join_id === pendingAction.joinId ? { ...p, join_status: new_status } : p
              ),
            };
          })
        );
      } else {
        await adminService.updateFlashSaleRequest(pendingAction.flashId!, pendingAction.action);
        showToast(
          `Flash sale request ${pendingAction.action === "approve" ? "approved" : "rejected"}`,
          "success"
        );
        await fetchFlashRequests();
        await fetchPendingCount();
      }
      setPendingAction(null);
    } catch (e: any) {
      showToast(e?.message || "Gagal memproses pengajuan", "error");
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeTab === "flash_sale") return [];
    return products;
  }, [products, activeTab]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!pendingAction}
        action={pendingAction?.action ?? "approve"}
        type={pendingAction?.kind ?? "campaign"}
        productName={pendingAction?.productName ?? ""}
        context={pendingAction?.context ?? ""}
        image={pendingAction?.image ?? null}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
        isLoading={isConfirmLoading}
      />

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
              <input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link
              to="/admin/promo/campaigns"
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg font-bold shadow-md hover:bg-gray-800 transition-colors gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Manage Campaigns
            </Link>
          </div>
        ) : activeTab === "all" ? (
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
              Flash Sale Submissions
              {pendingCount > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
            </button>
            <button onClick={() => setActiveTab("campaigns")} className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === "campaigns" ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              <Tag className="w-4 h-4 mr-2" /> Campaign Submissions
            </button>
          </div>
        </div>

        {/* ── Campaigns Tab ── */}
        {activeTab === "campaigns" ? (
          <>
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="py-12 text-center text-gray-500">Loading...</div>
              ) : campaigns.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No campaigns found.{" "}
                  <Link to="/admin/promo/campaigns" className="text-primary-600 font-bold hover:underline">Create one here.</Link>
                </div>
              ) : (
                campaigns.map((c) => {
                  const pending        = c.joined_products !== undefined
                    ? c.joined_products.filter((p) => p.join_status === "pending").length
                    : (c.pending_count ?? 0);
                  const total_products = c.join_total ?? c.product_count ?? 0;

                  return (
                    <div key={c.id} className="overflow-hidden">
                      {/* Campaign header */}
                      <button
                        onClick={() => handleToggleCampaign(c.id)}
                        className="w-full text-left px-6 py-5 hover:bg-gray-50 transition-colors flex items-start gap-4"
                      >
                        <div className="mt-0.5 shrink-0 text-gray-400">
                          {c.is_expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-gray-900">{c.name}</h3>
                            {c.is_active !== undefined ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${c.is_active ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
                                {c.is_active ? "ACTIVE" : "INACTIVE"}
                              </span>
                            ) : c.status ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${campaignStatusBadge(c.status)}`}>{c.status}</span>
                            ) : null}
                            {pending > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                                {pending} pending
                              </span>
                            )}
                          </div>
                          {c.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.description}</p>}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {(c.starts_at ?? c.start_date ?? "").slice(0, 10)}
                              {" – "}
                              {(c.ends_at ?? c.end_date ?? "").slice(0, 10)}
                            </span>
                            {c.discount_value != null && (
                              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                {c.discount_type === "fixed"
                                  ? `min -Rp ${Number(c.discount_value).toLocaleString("id-ID")}`
                                  : `min -${c.discount_value}%`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <Package2 className="w-4 h-4" />
                          {total_products} produk
                        </div>
                      </button>

                      {/* Expanded: product table */}
                      {c.is_expanded && (
                        <div className="bg-gray-50 border-t border-gray-100 px-6 pb-5">
                          {c.is_loading_products ? (
                            <div className="py-6 text-center text-sm text-gray-400">Memuat produk...</div>
                          ) : !c.joined_products || c.joined_products.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-400">
                              Belum ada produk yang diajukan ke campaign ini.
                            </div>
                          ) : (
                            <>
                              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produk</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Harga Asli</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Diskon</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Harga Promo</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tgl Daftar</th>
                                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {c.joined_products.map((p) => (
                                      <tr key={p.join_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2.5">
                                            {p.product_image ? (
                                              <img
                                                src={resolveImageUrl(p.product_image)}
                                                alt=""
                                                className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                              />
                                            ) : (
                                              <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0" />
                                            )}
                                            <div>
                                              <div className="font-bold text-gray-900 line-clamp-1 max-w-[150px]">{p.product_name}</div>
                                              <div className="text-xs text-gray-400">#{p.product_id}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">{p.agent_name}</td>
                                        <td className="px-4 py-3 font-bold text-gray-800 text-xs">{p.product_currency} {p.product_price.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                          {p.discount_pct != null ? (
                                            <span className="inline-flex items-center gap-0.5 bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-lg text-xs">
                                              <Percent className="w-3 h-3" />{p.discount_pct}%
                                            </span>
                                          ) : "-"}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-indigo-600 text-xs">
                                          {p.sale_price != null ? `${p.product_currency} ${p.sale_price.toLocaleString()}` : "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${joinStatusBadge(p.join_status)}`}>
                                            {joinStatusLabel(p.join_status)}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400">
                                          {new Date(p.joined_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <div className="flex justify-end items-center gap-1">
                                            <Link
                                              to={`/product/${encodeId(p.product_id)}/${generateSlug(p.product_name)}`}
                                              target="_blank" rel="noopener noreferrer"
                                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                              title="Lihat Produk"
                                            >
                                              <Eye className="w-4 h-4" />
                                            </Link>
                                            {p.join_status === "pending" && (
                                              <>
                                                <button
                                                  onClick={() => promptReviewJoin(c.id, p.join_id, "approve", p, c.name)}
                                                  className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                  title="Setujui"
                                                >
                                                  <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => promptReviewJoin(c.id, p.join_id, "reject", p, c.name)}
                                                  className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                  title="Tolak"
                                                >
                                                  <XCircle className="w-4 h-4" />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {(c.join_total_pages ?? 1) > 1 && (
                                <div className="flex items-center justify-between mt-3 px-1">
                                  <span className="text-xs text-gray-500">
                                    Hal <span className="font-bold text-gray-700">{c.join_page}</span> / <span className="font-bold text-gray-700">{c.join_total_pages}</span>
                                    <span className="ml-2 text-gray-400">({c.join_total} produk)</span>
                                  </span>
                                  <div className="flex gap-2">
                                    <button disabled={c.join_page === 1 || c.is_loading_products} onClick={() => loadJoinedProducts(c.id, (c.join_page ?? 1) - 1)} className="px-3 py-1 text-xs font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-white transition-colors">Prev</button>
                                    <button disabled={c.join_page === c.join_total_pages || c.is_loading_products} onClick={() => loadJoinedProducts(c.id, (c.join_page ?? 1) + 1)} className="px-3 py-1 text-xs font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-white transition-colors">Next</button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Page <span className="font-bold text-gray-700">{campaignPage}</span> / <span className="font-bold text-gray-700">{campaignTotalPages}</span>
              </div>
              <div className="flex gap-2">
                <button disabled={campaignPage <= 1 || isLoading} onClick={() => setCampaignPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Prev</button>
                <button disabled={campaignPage >= campaignTotalPages || isLoading} onClick={() => setCampaignPage((p) => p + 1)} className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Next</button>
              </div>
            </div>
          </>

        ) : activeTab === "flash_sale" ? (
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {req.product_image ? (
                            <img
                              src={resolveImageUrl(req.product_image)}
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
                      <td className="px-6 py-4 text-sm text-gray-600">{req.agent_name}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{req.product_currency} {Number(req.product_price).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg w-fit">-{req.discount_pct}%</span>
                          {req.sale_price && <span className="text-xs text-gray-500">→ {req.product_currency} {Number(req.sale_price).toLocaleString()}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(req.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Link to={`/product/${encodeId(req.product_id)}/${generateSlug(req.product_name)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View Product">
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => promptFlashAction(req, "approve")}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => promptFlashAction(req, "reject")}
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
                          <img
                            src={resolveImageUrl((product as any).image_url || (product as any).image)}
                            className="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-100"
                            alt=""
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
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
    </div>
  );
};

export default AdminProducts;

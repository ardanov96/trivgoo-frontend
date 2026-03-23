// services/adminService.ts
import type {
  AgentProduct,
  ApiResponse,
  ListAgentProductsResponse,
} from "@/types";
import http from "./http";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "ENDED" | "CANCELLED";

// ── Types disesuaikan dengan response backend /promo-campaigns ────────────────

export type Campaign = {
  // Field dari backend /promo-campaigns
  id:              number;
  name:            string;
  slug?:           string;
  description:     string | null;
  banner_image?:   string | null;
  type?:           string;
  discount_type?:  string;
  discount_value?: number;
  max_discount?:   number | null;
  min_transaction?: number;
  scope?:          string;
  min_tier_id?:    number | null;
  min_tier_name?:  string | null;
  starts_at?:      string;
  ends_at?:        string;
  max_usage?:      number | null;
  used_count?:     number;
  per_user?:       number;
  is_active?:      number;
  created_by?:     number | null;
  created_at?:     string;
  updated_at?:     string;

  // Field lama — dipertahankan agar komponen lain tidak break
  start_date?:           string;
  end_date?:             string;
  min_discount_percent?: number;
  agent_fee_percent?:    number;
  status?:               CampaignStatus;
  product_count?:        number;
};

export type CampaignDetail = Campaign & {
  scope_items?: Array<{ scope_type: string; scope_id: number }>;
  products?: Array<{
    id:          number;
    owner_id:    number;
    category_id: number;
    name:        string;
    location:    string;
    price:       number;
    currency:    string;
    image:       string | null;
    image_url:   string | null;
    owner:       { id: number; name: string; email: string };
    override?: {
      discount_percent:  number | null;
      agent_fee_percent: number | null;
    };
    attached_at?: string;
  }>;
};

export type CampaignListPayload = {
  meta: {
    page:        number;
    limit:       number;
    total:       number;
    total_pages: number;
  };
  data: Campaign[];
};

export type CreateCampaignPayload = {
  name:                 string;
  description?:         string | null;
  start_date:           string;
  end_date:             string;
  min_discount_percent: number;
  agent_fee_percent:    number;
  status?:              CampaignStatus;
  product_ids?:         Array<number | string>;
};

export type CreateCampaignResponse = ApiResponse<{
  campaign_id: number;
  attached:    number;
  campaign:    CampaignDetail | null;
}>;

export type AttachCampaignProductsPayload = {
  product_ids: Array<number | string>;
};

export type AttachCampaignProductsResponse = ApiResponse<{
  campaign_id: number;
  requested:   number;
  inserted:    number;
}>;

export type FlashSaleRequest = {
  id:               number;
  product_id:       number;
  agent_id:         number;
  discount_pct:     number;
  sale_price:       number | null;
  status:           "pending" | "approved" | "rejected";
  campaign_id:      number | null;
  admin_note:       string | null;
  created_at:       string;
  updated_at:       string;
  product_name:     string;
  product_price:    number;
  product_currency: string;
  product_image:    string | null;
  agent_name:       string;
};

export type FlashSaleRequestListPayload = {
  meta: {
    page:        number;
    limit:       number;
    total:       number;
    total_pages: number;
  };
  data: FlashSaleRequest[];
};

// ─────────────────────────────────────────────────────────────────────────────

function assertPositiveId(idLike: number | string, label = "id"): number {
  const id = Number(idLike);
  if (!Number.isFinite(id) || id <= 0) throw new Error(`Invalid ${label}`);
  return id;
}

export const adminService = {
  // ── Users ───────────────────────────────────────────────────────────────────

  async getAllAgents() {
    const res = await http.get("/admin/users/agents");
    return res.data || [];
  },

  async getAllCustomers() {
    const res = await http.get("/admin/users/customers");
    return res.data || [];
  },

  async updateAgentVerification(userId: number, action: "APPROVE" | "REJECT") {
    await http.post(`/admin/agents/${userId}/verification`, { action });
  },

  // ── Agent Products ──────────────────────────────────────────────────────────

  async listAgentProducts(params?: {
    owner_id?: number | string;
    q?:        string;
    page?:     number;
    limit?:    number;
  }): Promise<ListAgentProductsResponse> {
    const res = await http.get<ListAgentProductsResponse>(
      "/admin/agents/products",
      {
        params: {
          owner_id: params?.owner_id ?? undefined,
          q:        (params?.q ?? "").trim() || undefined,
          page:     params?.page ?? 1,
          limit:    params?.limit ?? 10,
        },
      }
    );
    return res.data;
  },

  async getAgentProductDetail(
    productId: number | string
  ): Promise<ApiResponse<AgentProduct>> {
    const id = assertPositiveId(productId, "productId");
    const res = await http.get<ApiResponse<AgentProduct>>(
      `/admin/agents/products/${id}`
    );
    return res.data;
  },

  // ── Campaigns — semua pakai /promo-campaigns ────────────────────────────────

  /**
   * GET /api/v1/promo-campaigns
   * Backend returns: { data: { campaigns: [...], total, page, limit, total_pages } }
   * Dinormalisasi ke CampaignListPayload agar kompatibel dengan AdminProducts.tsx
   */
  async listCampaigns(params?: {
    q?:      string;
    status?: CampaignStatus;
    page?:   number;
    limit?:  number;
  }): Promise<ApiResponse<CampaignListPayload>> {
    const res = await http.get("/promo-campaigns", {
      params: {
        q:     (params?.q ?? "").trim() || undefined,
        page:  params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });

    // Backend: res.data = { error, message, data: { campaigns, total, page, limit, total_pages } }
    const payload     = res.data?.data ?? res.data ?? {};
    const campaigns   = (payload.campaigns ?? []) as Campaign[];
    const total       = Number(payload.total       ?? 0);
    const page        = Number(payload.page        ?? params?.page  ?? 1);
    const limit       = Number(payload.limit       ?? params?.limit ?? 10);
    const total_pages = Number(payload.total_pages ?? (Math.ceil(total / limit) || 1));

    return {
      ...res.data,
      data: {
        data: campaigns,
        meta: { page, limit, total, total_pages },
      },
    } as ApiResponse<CampaignListPayload>;
  },

  /**
   * POST /api/v1/promo-campaigns
   * Map field frontend (start_date, end_date, min_discount_percent)
   * ke field backend  (starts_at,  ends_at,  discount_value)
   */
  async createCampaign(
    payload: CreateCampaignPayload
  ): Promise<CreateCampaignResponse> {
    const res = await http.post<CreateCampaignResponse>("/promo-campaigns", {
      name:            String(payload.name).trim(),
      description:     payload.description ?? null,
      starts_at:       payload.start_date,
      ends_at:         payload.end_date,
      type:            "seasonal",
      discount_type:   "percent",
      discount_value:  Number(payload.min_discount_percent ?? 0),
      min_transaction: 0,
      scope:           "all",
      is_active:       payload.status === "ACTIVE" ? 1 : 0,
    });
    return res.data;
  },

  /**
   * GET /api/v1/promo-campaigns/:id
   */
  async getCampaignDetail(
    campaignId: number | string
  ): Promise<ApiResponse<CampaignDetail>> {
    const id  = assertPositiveId(campaignId, "campaignId");
    const res = await http.get<ApiResponse<CampaignDetail>>(
      `/promo-campaigns/${id}`
    );
    return res.data;
  },

  /**
   * POST /api/v1/promo-campaigns/:id/join
   */
  async attachCampaignProducts(
    campaignId: number | string,
    payload:    AttachCampaignProductsPayload
  ): Promise<AttachCampaignProductsResponse> {
    const id = assertPositiveId(campaignId, "campaignId");
    if (
      !payload ||
      !Array.isArray(payload.product_ids) ||
      payload.product_ids.length === 0
    ) {
      throw new Error("product_ids must be a non-empty array");
    }
    const res = await http.post<AttachCampaignProductsResponse>(
      `/promo-campaigns/${id}/join`,
      { product_ids: payload.product_ids }
    );
    return res.data;
  },

  // ── Flash Sale ──────────────────────────────────────────────────────────────

  async listFlashSaleRequests(params?: {
    status?: "pending" | "approved" | "rejected";
    page?:   number;
    limit?:  number;
  }): Promise<ApiResponse<FlashSaleRequestListPayload>> {
    const res = await http.get<ApiResponse<FlashSaleRequestListPayload>>(
      "/promo-campaigns/flash-sale-requests",
      {
        params: {
          status: params?.status ?? "pending",
          page:   params?.page   ?? 1,
          limit:  params?.limit  ?? 20,
        },
      }
    );
    return res.data;
  },

  async updateFlashSaleRequest(
    id:     number,
    action: "approve" | "reject"
  ): Promise<ApiResponse<{ id: number; status: string }>> {
    const res = await http.patch<ApiResponse<{ id: number; status: string }>>(
      `/promo-campaigns/flash-sale-requests/${id}`,
      { action }
    );
    return res.data;
  },
};

export default adminService;
// services/adminService.ts
import type {
  AgentProduct,
  ApiResponse,
  ListAgentProductsResponse,
} from "@/types";
import http from "./http";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "ENDED" | "CANCELLED";

export type Campaign = {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  min_discount_percent: number;
  agent_fee_percent: number;
  status: CampaignStatus;

  product_count?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
};

export type CampaignDetail = Campaign & {
  products?: Array<{
    id: number;
    owner_id: number;
    category_id: number;
    name: string;
    location: string;
    price: number;
    currency: string;
    image: string | null;
    image_url: string | null;
    owner: { id: number; name: string; email: string };
    override?: {
      discount_percent: number | null;
      agent_fee_percent: number | null;
    };
    attached_at?: string;
  }>;
};

export type CampaignListPayload = {
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  data: Campaign[];
};

export type CreateCampaignPayload = {
  name: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  min_discount_percent: number;
  agent_fee_percent: number;
  status?: CampaignStatus;
  product_ids?: Array<number | string>;
};

export type CreateCampaignResponse = ApiResponse<{
  campaign_id: number;
  attached: number;
  campaign: CampaignDetail | null;
}>;

export type AttachCampaignProductsPayload = {
  product_ids: Array<number | string>;
};

export type AttachCampaignProductsResponse = ApiResponse<{
  campaign_id: number;
  requested: number;
  inserted: number;
}>;

export type FlashSaleRequest = {
  id: number;
  product_id: number;
  agent_id: number;
  discount_pct: number;
  sale_price: number | null;
  status: "pending" | "approved" | "rejected";
  campaign_id: number | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  // joined fields dari query
  product_name: string;
  product_price: number;
  product_currency: string;
  product_image: string | null;
  agent_name: string;
};

export type FlashSaleRequestListPayload = {
  meta: {
    page: number;
    limit: number;
    total: number;
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

  async listAgentProducts(params?: {
    owner_id?: number | string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<ListAgentProductsResponse> {
    const res = await http.get<ListAgentProductsResponse>(
      "/admin/agents/products",
      {
        params: {
          owner_id: params?.owner_id ?? undefined,
          q: (params?.q ?? "").trim() || undefined,
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
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

  /** ✅ campaigns */

  async createCampaign(
    payload: CreateCampaignPayload
  ): Promise<CreateCampaignResponse> {
    const res = await http.post<CreateCampaignResponse>("/admin/campaigns", {
      name: String(payload.name).trim(),
      description: payload.description ?? null,
      start_date: payload.start_date,
      end_date: payload.end_date,
      min_discount_percent: Number(payload.min_discount_percent ?? 0),
      agent_fee_percent: Number(payload.agent_fee_percent ?? 0),
      status: payload.status ?? undefined,
      product_ids: Array.isArray(payload.product_ids)
        ? payload.product_ids
        : undefined,
    });

    return res.data;
  },

  async listCampaigns(params?: {
    q?: string;
    status?: CampaignStatus;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<CampaignListPayload>> {
    const res = await http.get<ApiResponse<CampaignListPayload>>(
      "/admin/campaigns",
      {
        params: {
          q: (params?.q ?? "").trim() || undefined,
          status: params?.status ?? undefined,
          date: (params?.date ?? "").trim() || undefined,
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }
    );

    return res.data;
  },

  async getCampaignDetail(
    campaignId: number | string
  ): Promise<ApiResponse<CampaignDetail>> {
    const id = assertPositiveId(campaignId, "campaignId");
    const res = await http.get<ApiResponse<CampaignDetail>>(
      `/admin/campaigns/${id}`
    );
    return res.data;
  },

  async attachCampaignProducts(
    campaignId: number | string,
    payload: AttachCampaignProductsPayload
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
      `/admin/campaigns/${id}/products`,
      { product_ids: payload.product_ids }
    );

    return res.data;
  },

  async listFlashSaleRequests(params?: {
    status?: "pending" | "approved" | "rejected";
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<FlashSaleRequestListPayload>> {
    const res = await http.get<ApiResponse<FlashSaleRequestListPayload>>(
      "/promo-campaigns/flash-sale-requests",
      {
        params: {
          status: params?.status ?? "pending",
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      }
    );
    return res.data;
  },

  async updateFlashSaleRequest(
    id: number,
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
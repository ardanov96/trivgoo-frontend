// src/services/promoService.ts
// Menggunakan VITE_API_BASE_URL = http://localhost:4001 (sesuai .env.development)
// Auth: cookie-based session (credentials: 'include') — sesuai dengan setup backend

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001';
const API  = `${BASE}/api/v1/promo-campaigns`;
const LOYALTY_API = `${BASE}/api/v1/loyalty`;

// ── Types ──────────────────────────────────────────────────────────────────────

export type CampaignType =
  | 'flash_sale'
  | 'seasonal'
  | 'member_only'
  | 'referral_bonus'
  | 'bundle';

export type DiscountType = 'percent' | 'fixed';
export type CampaignScope = 'all' | 'category' | 'product';

export interface PromoCampaign {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  banner_image: string | null;
  type: CampaignType;
  discount_type: DiscountType;
  discount_value: number;
  max_discount: number | null;
  min_transaction: number;
  scope: CampaignScope;
  min_tier_id: number | null;
  min_tier_name?: string | null;
  starts_at: string;
  ends_at: string;
  max_usage: number | null;
  used_count: number;
  per_user: number;
  is_active: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface PromoCampaignPayload {
  name: string;
  description: string | null;
  type: CampaignType;
  discount_type: DiscountType;
  discount_value: number;
  max_discount: number | null;
  min_transaction: number;
  scope: CampaignScope;
  scope_ids: number[];
  min_tier_id: number | null;
  starts_at: string;
  ends_at: string;
  max_usage: number | null;
  per_user: number;
  is_active: number;
  banner_image?: string | null;
}

export interface ListCampaignsResponse {
  campaigns: PromoCampaign[];
  total: number;
  page: number;
  limit: number;
}

export interface MembershipTier {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  min_spending: number;
  min_points: number;
  discount_percent: number;
  point_multiplier: number;
  max_discount_per_order?: number | null;
  level: number;
  is_active: number;
}

export interface ReferralStat {
  user_id: number;
  user_name: string;
  user_email: string;
  referral_code: string;
  total_uses: number;
  total_rewarded: number;
  total_points_given: number;
}

// ── Analytics Types ────────────────────────────────────────────────────────────

/**
 * Ringkasan performa per campaign/voucher
 * Dipakai di: AdminPromoAnalytics — summary list & KPI cards & tabel
 */
export interface PromoAnalyticsSummary {
  source_id: number;
  source_name: string;
  total_impressions: number;
  total_attempts: number;
  total_success: number;
  total_fail: number;
  conversion_rate: number;       // dalam persen, contoh: 72.5
  total_discount_given: number;  // dalam Rupiah
  total_revenue: number;         // dalam Rupiah
}

/**
 * Data harian untuk grafik tren
 * Dipakai di: AdminPromoAnalytics — BarChart & LineChart
 */
export interface PromoAnalyticsDaily {
  date: string;                  // format: 'YYYY-MM-DD'
  success_count: number;
  fail_count: number;
  total_discount_given: number;  // dalam Rupiah
  total_revenue: number;         // dalam Rupiah
}

// ── Analytics Query Params ─────────────────────────────────────────────────────

export interface AnalyticsSummaryParams {
  source_type: 'voucher' | 'campaign';
  date_from?: string;  // 'YYYY-MM-DD'
  date_to?: string;    // 'YYYY-MM-DD'
}

export interface AnalyticsDailyParams {
  source_type: 'voucher' | 'campaign';
  source_id: number;
  date_from?: string;  // 'YYYY-MM-DD'
  date_to?: string;    // 'YYYY-MM-DD'
}

// ── Core fetch wrapper (mirror pola di project ini) ───────────────────────────

interface BackendResponse<T = unknown> {
  error: boolean;
  message: string;
  data?: T;
}

async function api_fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',           // kirim session cookie (sesuai backend)
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const body: BackendResponse<T> = await res.json();

  if (!res.ok || body.error) {
    const err: any = new Error(body.message || 'Request failed');
    err.response = { data: body, status: res.status };
    throw err;
  }

  return body.data as T;
}

// ── Service ────────────────────────────────────────────────────────────────────

export const promoService = {

  // ── PUBLIC ──────────────────────────────────────────────────────────────────

  /**
   * Kampanye yang sedang aktif — dipakai di homepage
   * GET /api/v1/promo-campaigns/active
   */
  getActiveCampaigns: (): Promise<PromoCampaign[]> =>
    api_fetch<{ campaigns: PromoCampaign[] }>('/active').then((d) => d.campaigns),

  /**
   * Detail satu campaign
   * GET /api/v1/promo-campaigns/:id
   */
  getCampaign: (id: number): Promise<PromoCampaign> =>
    api_fetch<{ campaign: PromoCampaign }>(`/${id}`).then((d) => d.campaign),

  /**
   * Produk yang masuk scope campaign
   * GET /api/v1/promo-campaigns/:id/products
   */
  getCampaignProducts: (id: number): Promise<unknown[]> =>
    api_fetch<{ products: unknown[] }>(`/${id}/products`).then((d) => d.products),

  // ── ADMIN ────────────────────────────────────────────────────────────────────

  /**
   * List semua campaign (admin)
   * GET /api/v1/promo-campaigns
   */
  listCampaigns: (params: {
    q?: string;
    type?: CampaignType;
    active_only?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<ListCampaignsResponse> => {
    const qs = new URLSearchParams();
    if (params.q)           qs.set('q', params.q);
    if (params.type)        qs.set('type', params.type);
    if (params.active_only) qs.set('active_only', '1');
    if (params.page)        qs.set('page', String(params.page));
    if (params.limit)       qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return api_fetch<ListCampaignsResponse>(`/${query}`);
  },

  /**
   * POST /api/v1/promo-campaigns
   */
  createCampaign: (payload: PromoCampaignPayload): Promise<PromoCampaign> =>
    api_fetch<{ campaign: PromoCampaign }>('/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((d) => d.campaign),

  /**
   * PUT /api/v1/promo-campaigns/:id
   */
  updateCampaign: (id: number, payload: Partial<PromoCampaignPayload>): Promise<PromoCampaign> =>
    api_fetch<{ campaign: PromoCampaign }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }).then((d) => d.campaign),

  /**
   * DELETE /api/v1/promo-campaigns/:id
   */
  deleteCampaign: (id: number): Promise<void> =>
    api_fetch<void>(`/${id}`, { method: 'DELETE' }),

  /**
   * PATCH /api/v1/promo-campaigns/:id/toggle
   */
  toggleCampaign: (id: number): Promise<PromoCampaign> =>
    api_fetch<{ campaign: PromoCampaign }>(`/${id}/toggle`, { method: 'PATCH' })
      .then((d) => d.campaign),

  // ── ADMIN ANALYTICS ──────────────────────────────────────────────────────────

  getAnalyticsSummary: (params: AnalyticsSummaryParams): Promise<PromoAnalyticsSummary[]> => {
    const qs = new URLSearchParams();
    qs.set('source_type', params.source_type);
    if (params.date_from) qs.set('date_from', params.date_from);
    if (params.date_to)   qs.set('date_to',   params.date_to);
    return api_fetch<PromoAnalyticsSummary[]>(`/analytics/summary?${qs.toString()}`);
  },

  getAnalyticsDaily: (params: AnalyticsDailyParams): Promise<PromoAnalyticsDaily[]> => {
    const qs = new URLSearchParams();
    qs.set('source_type', params.source_type);
    qs.set('source_id',   String(params.source_id));
    if (params.date_from) qs.set('date_from', params.date_from);
    if (params.date_to)   qs.set('date_to',   params.date_to);
    return api_fetch<PromoAnalyticsDaily[]>(`/analytics/daily?${qs.toString()}`);
  },

  listTiers: (): Promise<MembershipTier[]> =>
  fetch(`${LOYALTY_API}/tiers`, { credentials: 'include' })
    .then(r => r.json()).then(b => b.data as MembershipTier[]),

  createTier: (payload: Partial<MembershipTier>): Promise<MembershipTier> =>
    fetch(`${LOYALTY_API}/admin/tiers`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json()).then(b => b.data as MembershipTier),

  updateTier: (id: number, payload: Partial<MembershipTier>): Promise<MembershipTier> =>
    fetch(`${LOYALTY_API}/admin/tiers/${id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json()).then(b => b.data as MembershipTier),

  deleteTier: (id: number): Promise<void> =>
    fetch(`${LOYALTY_API}/admin/tiers/${id}`, {
      method: 'DELETE', credentials: 'include',
    }).then(r => r.json()),

  getReferralStats: (params: { q?: string; page?: number; limit?: number } = {}): Promise<any> => {
    const qs = new URLSearchParams();
    if (params.q)     qs.set('q',     params.q);
    if (params.page)  qs.set('page',  String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return fetch(`${LOYALTY_API}/admin/referral-stats${query}`, { credentials: 'include' })
      .then(r => r.json()).then(b => b.data);
  },

};
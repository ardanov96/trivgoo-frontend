import http from './http';

// ── Types ────────────────────────────────────────────────────────────────────

export type CampaignType = 'flash_sale' | 'seasonal' | 'member_only' | 'referral_bonus' | 'bundle';
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
  starts_at: string;
  ends_at: string;
  max_usage: number | null;
  used_count: number;
  per_user: number;
  is_active: number;
  created_at: string;
  // joined
  min_tier?: { id: number; name: string; color: string } | null;
  product_count?: number;
}

export interface PromoCampaignPayload {
  name: string;
  description?: string | null;
  type: CampaignType;
  discount_type: DiscountType;
  discount_value: number;
  max_discount?: number | null;
  min_transaction?: number;
  scope: CampaignScope;
  scope_ids?: number[];
  min_tier_id?: number | null;
  starts_at: string;
  ends_at: string;
  max_usage?: number | null;
  per_user?: number;
  is_active?: number;
}

export interface PromoAnalyticsSummary {
  source_type: 'voucher' | 'campaign';
  source_id: number;
  source_name: string;
  total_impressions: number;
  total_attempts: number;
  total_success: number;
  total_fail: number;
  total_discount_given: number;
  total_revenue: number;
  conversion_rate: number; // success / attempts * 100
}

export interface PromoAnalyticsDaily {
  date: string;
  impressions: number;
  attempts: number;
  success_count: number;
  fail_count: number;
  total_discount_given: number;
  total_revenue: number;
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

// ── Service ──────────────────────────────────────────────────────────────────

export const promoService = {
  // ── Campaigns ──
  async listCampaigns(params?: {
    q?: string;
    type?: CampaignType;
    is_active?: number;
    page?: number;
    limit?: number;
  }): Promise<{ campaigns: PromoCampaign[]; meta: any }> {
    const res = await http.get('/admin/promo/campaigns', { params });
    return res.data?.data;
  },

  async getCampaign(id: number): Promise<PromoCampaign> {
    const res = await http.get(`/admin/promo/campaigns/${id}`);
    return res.data?.data;
  },

  async createCampaign(payload: PromoCampaignPayload): Promise<PromoCampaign> {
    const res = await http.post('/admin/promo/campaigns', payload);
    return res.data?.data;
  },

  async updateCampaign(id: number, payload: Partial<PromoCampaignPayload>): Promise<PromoCampaign> {
    const res = await http.patch(`/admin/promo/campaigns/${id}`, payload);
    return res.data?.data;
  },

  async deleteCampaign(id: number): Promise<void> {
    await http.delete(`/admin/promo/campaigns/${id}`);
  },

  // ── Analytics ──
  async getAnalyticsSummary(params?: {
    source_type?: 'voucher' | 'campaign';
    date_from?: string;
    date_to?: string;
  }): Promise<PromoAnalyticsSummary[]> {
    const res = await http.get('/admin/promo/analytics/summary', { params });
    return res.data?.data;
  },

  async getAnalyticsDaily(params: {
    source_type: 'voucher' | 'campaign';
    source_id: number;
    date_from?: string;
    date_to?: string;
  }): Promise<PromoAnalyticsDaily[]> {
    const res = await http.get('/admin/promo/analytics/daily', { params });
    return res.data?.data;
  },

  // ── Membership Tiers (admin) ──
  async listTiers(): Promise<import('./loyaltyService').MembershipTier[]> {
    const res = await http.get('/admin/membership/tiers');
    return res.data?.data;
  },

  async createTier(payload: Partial<import('./loyaltyService').MembershipTier>): Promise<import('./loyaltyService').MembershipTier> {
    const res = await http.post('/admin/membership/tiers', payload);
    return res.data?.data;
  },

  async updateTier(id: number, payload: Partial<import('./loyaltyService').MembershipTier>): Promise<import('./loyaltyService').MembershipTier> {
    const res = await http.patch(`/admin/membership/tiers/${id}`, payload);
    return res.data?.data;
  },

  async deleteTier(id: number): Promise<void> {
    await http.delete(`/admin/membership/tiers/${id}`);
  },

  // ── Referral Stats (admin) ──
  async getReferralStats(params?: {
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<{ stats: ReferralStat[]; meta: any }> {
    const res = await http.get('/admin/referral/stats', { params });
    return res.data?.data;
  },
};
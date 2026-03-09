import http from './http';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PointBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  lifetime_expired: number;
}

export interface PointTransaction {
  id: number;
  type:
    | 'earn_purchase'
    | 'earn_referral'
    | 'earn_review'
    | 'earn_birthday'
    | 'earn_campaign'
    | 'spend_redemption'
    | 'spend_checkout'
    | 'expired'
    | 'adjustment';
  points: number;
  balance_after: number;
  ref_type: string | null;
  ref_id: number | null;
  note: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface MembershipTier {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  min_spending: number;
  min_points: number;
  discount_percent: number;
  point_multiplier: number;
  max_discount_per_order: number | null;
  level: number;
  is_active: number;
}

export interface UserMembership {
  tier: MembershipTier;
  total_spending: number;
  total_points_earned: number;
  tier_achieved_at: string;
  tier_expires_at: string | null;
  next_tier: MembershipTier | null;
  progress_percent: number; // 0–100 menuju next tier
  spending_to_next: number;
}

export interface PointRedemption {
  id: number;
  points_spent: number;
  redemption_type: 'voucher' | 'checkout';
  voucher_id: number | null;
  voucher_value: number | null;
  voucher_code: string | null;
  order_id: number | null;
  discount_amount: number | null;
  status: 'pending' | 'used' | 'cancelled' | 'expired';
  expires_at: string | null;
  created_at: string;
}

export interface ReferralCode {
  code: string;
  referrer_points: number;
  referee_points: number;
  referee_discount: number | null;
  total_uses: number;
  max_uses: number | null;
  is_active: number;
}

export interface RedeemPayload {
  redemption_type: 'voucher' | 'checkout';
  points: number;
  order_id?: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

export const loyaltyService = {
  // Point balance
  async getBalance(): Promise<PointBalance> {
    const res = await http.get('/loyalty/balance');
    return res.data?.data;
  },

  // Point transaction history
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ transactions: PointTransaction[]; meta: any }> {
    const res = await http.get('/loyalty/transactions', { params });
    return res.data?.data;
  },

  // Membership info
  async getMembership(): Promise<UserMembership> {
    const res = await http.get('/loyalty/membership');
    return res.data?.data;
  },

  // All tiers (public — untuk tampilkan progress)
  async getAllTiers(): Promise<MembershipTier[]> {
    const res = await http.get('/loyalty/tiers');
    return res.data?.data;
  },

  // Redeem point → voucher atau checkout
  async redeem(payload: RedeemPayload): Promise<PointRedemption> {
    const res = await http.post('/loyalty/redeem', payload);
    return res.data?.data;
  },

  // Redemption history
  async getRedemptions(): Promise<PointRedemption[]> {
    const res = await http.get('/loyalty/redemptions');
    return res.data?.data;
  },

  // Referral code milik user
  async getMyReferralCode(): Promise<ReferralCode> {
    const res = await http.get('/loyalty/referral');
    return res.data?.data;
  },

  // Generate referral code (jika belum punya)
  async generateReferralCode(): Promise<ReferralCode> {
    const res = await http.post('/loyalty/referral/generate');
    return res.data?.data;
  },
};
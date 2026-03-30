// src/services/voucherService.ts
// Menggunakan `http` axios instance yang sudah ada (baseURL = /api/v1)
import http from './http';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Voucher {
  id: number;
  code: string;
  description: string | null;
  type: 'percent' | 'fixed';
  value: number;
  max_discount: number | null;
  min_transaction: number;
  scope: 'all' | 'category' | 'product';
  scope_ids: number[] | null;
  max_usage: number | null;
  used_count: number;
  per_user: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: number;
  scope_owner?: 'admin' | 'agent';
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
}

export interface VoucherListResponse {
  vouchers: Voucher[];
  total: number;
  page: number;
  limit: number;
}

export interface VoucherValidateResult {
  voucher: Voucher;
  discount: number;
  final_amount: number;
}

export interface CreateVoucherPayload {
  code: string;
  description?: string | null;
  type: 'percent' | 'fixed';
  value: number;
  max_discount?: number | null;
  min_transaction?: number;
  scope?: 'all' | 'category' | 'product';
  scope_ids?: number[] | null;
  max_usage?: number | null;
  per_user?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: number;
}

export interface AgentVoucherStats {
  total: number;
  active: number;
  inactive: number;
  total_usage: number;
}

// ── Admin Voucher Service ──────────────────────────────────────────────────────

export const voucherService = {

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  /** GET /vouchers  — list semua (admin) */
  list: (params: {
    q?: string;
    type?: string;
    is_active?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.q          != null) qs.set('q',         params.q);
    if (params.type       != null) qs.set('type',      params.type);
    if (params.is_active  != null) qs.set('is_active', String(params.is_active));
    if (params.page       != null) qs.set('page',      String(params.page));
    if (params.limit      != null) qs.set('limit',     String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return http.get<{ data: VoucherListResponse }>(`/vouchers${query}`)
      .then(res => res.data.data);
  },

  /** GET /vouchers/:id */
  getById: (id: number) =>
    http.get<{ data: Voucher }>(`/vouchers/${id}`)
      .then(res => res.data.data),

  /** POST /vouchers */
  create: (payload: CreateVoucherPayload) =>
    http.post<{ data: Voucher }>('/vouchers', payload)
      .then(res => res.data.data),

  /** PATCH /vouchers/:id */
  update: (id: number, payload: Partial<CreateVoucherPayload>) =>
    http.patch<{ data: Voucher }>(`/vouchers/${id}`, payload)
      .then(res => res.data.data),

  /** PATCH /vouchers/:id/toggle */
  toggle: (id: number) =>
    http.patch<{ data: Voucher }>(`/vouchers/${id}/toggle`)
      .then(res => res.data.data),

  /** DELETE /vouchers/:id */
  delete: (id: number) =>
    http.delete(`/vouchers/${id}`),

  // ── CUSTOMER / PUBLIC ──────────────────────────────────────────────────────

  /** GET /vouchers/active  — daftar voucher aktif (public/admin) */
  getActive: () =>
    http.get<{ data: Voucher[] }>('/vouchers/active')
      .then(res => res.data.data),

  /** GET /vouchers/validate?code=XX&amount=YY */
  validate: (code: string, amount: number) =>
    http.get<{ data: VoucherValidateResult }>(`/vouchers/validate?code=${code}&amount=${amount}`)
      .then(res => res.data.data),

  /** GET /vouchers/my  — riwayat pemakaian voucher user login */
  getMyUsages: (params: { page?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.page)  qs.set('page',  String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return http.get(`/vouchers/my${query}`).then(res => res.data.data);
  },
};

// ── Agent Voucher Service ──────────────────────────────────────────────────────
// Endpoint: /api/v1/agent/vouchers

export const agentVoucherService = {

  /** GET /agent/vouchers — list semua voucher milik agent login */
  list: (params: {
    q?: string;
    type?: string;
    is_active?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.q          != null) qs.set('q',         params.q);
    if (params.type       != null) qs.set('type',      params.type);
    if (params.is_active  != null) qs.set('is_active', String(params.is_active));
    if (params.page       != null) qs.set('page',      String(params.page));
    if (params.limit      != null) qs.set('limit',     String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return http.get<{ data: VoucherListResponse }>(`/agent/vouchers${query}`)
      .then(res => res.data.data);
  },

  /** GET /agent/vouchers/stats */
  getStats: () =>
    http.get<{ data: AgentVoucherStats }>('/agent/vouchers/stats')
      .then(res => res.data.data),

  /** GET /agent/vouchers/active — voucher aktif milik agent (untuk VoucherSelector) */
  getActive: () =>
    http.get<{ data: Voucher[] }>('/agent/vouchers/active')
      .then(res => res.data.data),

  /** GET /agent/vouchers/:id */
  getById: (id: number) =>
    http.get<{ data: Voucher }>(`/agent/vouchers/${id}`)
      .then(res => res.data.data),

  /** POST /agent/vouchers */
  create: (payload: CreateVoucherPayload) =>
    http.post<{ data: Voucher }>('/agent/vouchers', payload)
      .then(res => res.data.data),

  /** PATCH /agent/vouchers/:id */
  update: (id: number, payload: Partial<CreateVoucherPayload>) =>
    http.patch<{ data: Voucher }>(`/agent/vouchers/${id}`, payload)
      .then(res => res.data.data),

  /** PATCH /agent/vouchers/:id/toggle */
  toggle: (id: number) =>
    http.patch<{ data: Voucher }>(`/agent/vouchers/${id}/toggle`)
      .then(res => res.data.data),

  /** DELETE /agent/vouchers/:id */
  delete: (id: number) =>
    http.delete(`/agent/vouchers/${id}`),
};

export default voucherService;
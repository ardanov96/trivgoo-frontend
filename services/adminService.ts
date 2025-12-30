import { AgentProduct, ApiResponse, ListAgentProductsResponse } from '@/types';
import http from './http';

export const adminService = {
  async getAllAgents() {
    const res = await http.get('/admin/users/agents');
    return res.data || [];
  },

  async getAllCustomers() {
    const res = await http.get('/admin/users/customers');
    return res.data || [];
  },

  async updateAgentVerification(userId: number, action: 'APPROVE' | 'REJECT') {
    await http.post(`/admin/agents/${userId}/verification`, { action });
  },

  async listAgentProducts(params?: {
    owner_id?: number | string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<ListAgentProductsResponse> {
    const res = await http.get<ListAgentProductsResponse>('/admin/agents/products', {
      params: {
        owner_id: params?.owner_id ?? undefined,
        q: (params?.q ?? '').trim() || undefined,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });

    return res.data;
  },

  async getAgentProductDetail(productId: number | string): Promise<ApiResponse<AgentProduct>> {
    const id = Number(productId);
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('Invalid productId');
    }

    const res = await http.get<ApiResponse<AgentProduct>>(`/admin/agents/products/${id}`);
    return res.data;
  },
};

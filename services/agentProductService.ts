import type { AgentProduct, AgentProductPayload, ApiEnvelope, VoucherItem } from "../types";
import http, { unwrap } from "./http";

type ProductEnvelope<T> = ApiEnvelope<T>;

function normalizeProduct(data: AgentProduct): AgentProduct {
  const finalImage = data.image_url || data.image || '';
  return {
    id: data.id,
    owner_id: data.owner_id,
    category_id: data.category_id,
    name: data.name,
    description: data.description,
    price: Number((data as any).price || 0),
    currency: (data as any).currency || "",
    location: (data as any).location || "",
    image_url: finalImage,
    image: finalImage,
    images: data.images,
    owner: data.owner,
    features: Array.isArray((data as any).features) ? (data as any).features : [],
    details: (data as any).details ?? undefined,
    daily_capacity: (data as any).daily_capacity ?? 10,
    lat: parseFloat(String((data as any).lat || 0)),
    lng: parseFloat(String((data as any).lng || 0)),
    blocked_dates: Array.isArray((data as any).blocked_dates) ? (data as any).blocked_dates : [],
    vouchers: Array.isArray((data as any).vouchers)
      ? (data as any).vouchers as VoucherItem[]
      : [],
    rating: (data as any).rating ? Number((data as any).rating) : 0,
    is_active: !!(data as any).is_active,
    created_at: (data as any).created_at,
    updated_at: (data as any).updated_at,
    car_id: (data as any).car_id ? Number(data.car_id) : undefined,
  };
}

async function mapOne<T>(req: Promise<{ data: ProductEnvelope<T> }>): Promise<T> {
  const res = await req;
  return unwrap(res.data);
}

function extractUploadedUrls(payload: any): string[] {
  const pick = (arr: any[]): string[] => {
    if (!Array.isArray(arr)) return [];
    if (arr.length === 0) return [];
    if (typeof arr[0] === "string") return arr.filter(Boolean);
    if (typeof arr[0] === "object") {
      return arr.map((x) => x?.url || x?.image_url || x?.image || x?.path).filter(Boolean);
    }
    return [];
  };
  if (Array.isArray(payload)) return pick(payload);
  if (payload?.images) return pick(payload.images);
  if (payload?.data && Array.isArray(payload.data)) return pick(payload.data);
  return [];
}

export const agentProductService = {
  async getAllProducts(): Promise<AgentProduct[]> {
    const rows = await mapOne(http.get<ProductEnvelope<AgentProduct[]>>("/products"));
    return rows.map(normalizeProduct);
  },

  async getCategories(): Promise<any[]> {
    const rows = await mapOne(http.get<ProductEnvelope<any[]>>("/categories"));
    return rows;
  },

  // voucher_ids di-strip otomatis agar tidak menyebabkan error 400 di backend.
  // Voucher disimpan terpisah via setProductVouchers setelah product tersimpan.
  async createProduct(payload: AgentProductPayload): Promise<AgentProduct> {
    const { voucher_ids, ...cleanPayload } = payload as any;
    const raw = await mapOne(
      http.post<ProductEnvelope<AgentProduct>>("/agent/products", cleanPayload)
    );
    return normalizeProduct(raw);
  },

  async updateProduct(id: number, payload: AgentProductPayload): Promise<AgentProduct> {
    const { voucher_ids, ...cleanPayload } = payload as any;
    const raw = await mapOne(
      http.put<ProductEnvelope<AgentProduct>>(`/agent/products/${id}`, cleanPayload)
    );
    return normalizeProduct(raw);
  },

  async deleteProduct(id: number): Promise<void> {
    await mapOne(http.delete<ProductEnvelope<any>>(`/agent/products/${id}/delete`));
  },

  async updateProductStatus(id: number, is_active: boolean): Promise<AgentProduct> {
    const raw = await mapOne(
      http.put<ProductEnvelope<AgentProduct>>(`/agent/products/${id}/status`, { is_active })
    );
    return normalizeProduct(raw);
  },

  async getProductById(id: number): Promise<AgentProduct> {
    const raw = await mapOne(http.get<ProductEnvelope<AgentProduct>>(`/products/${id}`));
    return normalizeProduct(raw);
  },

  async getMyProduct(id: number): Promise<AgentProduct> {
    const raw = await mapOne(http.get<ProductEnvelope<AgentProduct>>(`/agent/products/${id}`));
    return normalizeProduct(raw);
  },

  async getMyProducts(): Promise<AgentProduct[]> {
    const rows = await mapOne(http.get<ProductEnvelope<AgentProduct[]>>("/agent/products"));
    return rows.map(normalizeProduct);
  },

  async uploadProductImages(productId: number, files: File[]): Promise<string[]> {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f, f.name));
    const uploaded = await mapOne(
      http.post<ProductEnvelope<any>>(`/agent/products/${productId}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
    return extractUploadedUrls(uploaded);
  },

  // ── Voucher methods ──────────────────────────────────────────────────────

  async getProductVouchers(productId: number): Promise<VoucherItem[]> {
    try {
      const rows = await mapOne(
        http.get<ProductEnvelope<VoucherItem[]>>(`/agent/products/${productId}/vouchers`)
      );
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      console.warn("[agentProductService] getProductVouchers error:", err);
      return [];
    }
  },

  async setProductVouchers(productId: number, voucher_ids: number[]): Promise<VoucherItem[]> {
    const rows = await mapOne(
      http.put<ProductEnvelope<VoucherItem[]>>(
        `/agent/products/${productId}/vouchers`,
        { voucher_ids }
      )
    );
    return Array.isArray(rows) ? rows : [];
  },
};
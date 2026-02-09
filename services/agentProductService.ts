import type { AgentProduct, AgentProductPayload, ApiEnvelope } from "../types";
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
    features: Array.isArray((data as any).features)
      ? (data as any).features
      : [],
    details: (data as any).details ?? undefined,
    daily_capacity: (data as any).daily_capacity ?? 10,
    lat: (data as any).lat,
    lng: (data as any).lng,
    blocked_dates: Array.isArray((data as any).blocked_dates)
      ? (data as any).blocked_dates
      : [],
    rating: (data as any).rating ? Number((data as any).rating) : 0,
    is_active: !!(data as any).is_active,
    created_at: (data as any).created_at,
    updated_at: (data as any).updated_at,
  };
}

async function mapOne<T>(
  req: Promise<{ data: ProductEnvelope<T> }>
): Promise<T> {
  const res = await req;
  return unwrap(res.data);
}

function extractUploadedUrls(payload: any): string[] {
  const pick = (arr: any[]): string[] => {
    if (!Array.isArray(arr)) return [];
    if (arr.length === 0) return [];
    if (typeof arr[0] === "string") return arr.filter(Boolean);
    if (typeof arr[0] === "object") {
      return arr
        .map((x) => x?.url || x?.image_url || x?.image || x?.path)
        .filter(Boolean);
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
    const rows = await mapOne(
      http.get<ProductEnvelope<AgentProduct[]>>("/products") // Tanpa prefix /agent
    );
    return rows.map(normalizeProduct);
  },

  async getCategories(): Promise<any[]> {
    const rows = await mapOne(
      http.get<ProductEnvelope<any[]>>("/categories")
    );
    return rows;
  },

  async createProduct(payload: AgentProductPayload): Promise<AgentProduct> {
    const raw = await mapOne(
      http.post<ProductEnvelope<AgentProduct>>("/agent/products", payload)
    );
    return normalizeProduct(raw);
  },

  async updateProduct(
    id: number,
    payload: AgentProductPayload
  ): Promise<AgentProduct> {
    const raw = await mapOne(
      http.put<ProductEnvelope<AgentProduct>>(`/agent/products/${id}`, payload)
    );
    return normalizeProduct(raw);
  },

  async deleteProduct(id: number): Promise<void> {
    await mapOne(
      http.delete<ProductEnvelope<any>>(`/agent/products/${id}/delete`)
    );
  },

async getProductById(id: number): Promise<AgentProduct> {
  // Coba hapus prefix /v1 jika baseURL axios kamu sudah /api/v1
  // Atau tambahkan jika baseURL-nya hanya /api
  const raw = await mapOne(
    http.get<ProductEnvelope<AgentProduct>>(`/products/${id}`) 
  );
  return normalizeProduct(raw);
},

  async getMyProduct(id: number): Promise<AgentProduct> {
    const raw = await mapOne(
      http.get<ProductEnvelope<AgentProduct>>(`/agent/products/${id}`)
    );
    return normalizeProduct(raw);
  },

  async getMyProducts(): Promise<AgentProduct[]> {
    const rows = await mapOne(
      http.get<ProductEnvelope<AgentProduct[]>>("/agent/products")
    );
    return rows.map(normalizeProduct);
  },

  async uploadProductImages(
    productId: number,
    files: File[]
  ): Promise<string[]> {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f, f.name));

    const uploaded = await mapOne(
      http.post<ProductEnvelope<any>>(
        `/agent/products/${productId}/images`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
    );

    return extractUploadedUrls(uploaded);
  },
};

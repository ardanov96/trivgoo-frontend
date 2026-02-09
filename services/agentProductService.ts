import type { AgentProduct, AgentProductPayload, ApiEnvelope, Category } from "../types";
import http, { unwrap } from "./http";

type ProductEnvelope<T> = ApiEnvelope<T>;

function normalizeCategory(data: any): Category {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

function normalizeProduct(data: AgentProduct): AgentProduct {
  // Backend bisa mengirim image_url, image, atau images array
  const finalImage = data.image_url || data.image || '';
  
  // Jika ada images array, ambil yang pertama sebagai fallback
  let imageUrl = finalImage;
  if (!imageUrl && data.images && Array.isArray(data.images) && data.images.length > 0) {
    // images bisa berupa array of strings atau array of objects
    const firstImage = data.images[0];
    imageUrl = typeof firstImage === 'string' ? firstImage : (firstImage?.url || firstImage?.image_url || '');
  }
  
  return {
    id: data.id,
    owner_id: data.owner_id,
    category_id: data.category_id,
    name: data.name,
    description: data.description,
    price: Number((data as any).price || 0),
    currency: (data as any).currency || "USD",
    location: (data as any).location || "",
    lat: (data as any).lat ? Number((data as any).lat) : undefined,
    lng: (data as any).lng ? Number((data as any).lng) : undefined,
    image_url: imageUrl,
    image: imageUrl,
    images: Array.isArray(data.images) 
      ? data.images.map(img => {
          if (typeof img === 'string') return img;
          if (typeof img === 'object' && img !== null) {
            return img.url || img.image_url || '';
          }
          return '';
        }).filter(Boolean)
      : [],
    owner: data.owner || undefined,
    features: Array.isArray((data as any).features)
      ? (data as any).features
      : [],
    details: (data as any).details ?? undefined,
    daily_capacity: (data as any).daily_capacity ?? 10,
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
      http.get<ProductEnvelope<AgentProduct[]>>("/products")
    );
    return rows.map(normalizeProduct);
  },

  async getCategories(): Promise<Category[]> {
    const rows = await mapOne(
      http.get<ProductEnvelope<any[]>>("/categories")
    );
    return rows.map(normalizeCategory);
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
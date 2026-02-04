import { Product } from '@/types';

/**
 * Shape response dari BE (snake_case)
 * contoh:
 * {
 *   id, owner_id, category_id, daily_capacity, is_active, created_at, image
 * }
 */
export type ApiAgentProductRow = {
  id: number;
  owner_id: number;
  category_id: number;
  name: string;
  description: string;
  price: number | string;
  currency: string;
  location: string;
  image?: string; 
  image_url?: string; 
  daily_capacity?: number;
  rating?: number | string;
  is_active?: boolean | 0 | 1;
  created_at?: string;

 
  images?: string[];
  features?: string[];
  details?: any;
  blocked_dates?: string[];
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';

export function mapApiAgentProductToProduct(row: ApiAgentProductRow): Product {
  return {
    // ---- core fields (Gunakan snake_case sesuai interface Product)
    id: row.id,
    owner_id: row.owner_id,
    category_id: row.category_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    location: row.location,
    image: row.image || row.image_url || DEFAULT_IMAGE,

    // ---- images
    images: Array.isArray(row.images) 
      ? row.images.map((url, index) => ({ id: index, url })) 
      : [],

    // ---- optional business data
    features: Array.isArray(row.features) ? row.features : [],
    details: row.details ?? null,
    daily_capacity: typeof row.daily_capacity === 'number' ? row.daily_capacity : 10,
    
    // blocked_dates tersetor ke objek Product
    blocked_dates: Array.isArray(row.blocked_dates) ? row.blocked_dates : [],

    // ---- meta
    rating: row.rating ? Number(row.rating) : 0,
    is_active: !!row.is_active,
    created_at: row.created_at,

    // ---- campaign & reviews
    flashSale: undefined,
    reviews: [],
  } as Product;
}
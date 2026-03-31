export enum UserRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  CUSTOMER = "CUSTOMER",
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
}

export enum PayoutStatus {
  PENDING = "pending",
  PROCESSED = "processed",
  REJECTED = "rejected",
}

export enum VerificationStatus {
  UNVERIFIED = "UNVERIFIED",
  WAITING_DOCUMENT = "WAITING_DOCUMENT",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum AgentType {
  INDIVIDUAL = "INDIVIDUAL",
  CORPORATE = "CORPORATE",
}

export enum AgentSpecialization {
  TOUR = "TOUR",
  STAY = "STAY",
  TRANSPORT = "TRANSPORT",
}

export enum TourCategory {
  NATURE = "Nature",
  ADVENTURE = "Adventure",
  SPIRITUAL = "Spiritual",
  CULTURAL = "Cultural",
  CULINARY = "Culinary",
  FAMILY = "Family",
  HONEYMOON = "Honeymoon",
  SOLO_TRAVEL = "Solo Travel",
  HEALING = "Healing",
  WORKATION = "Workation",
  ECO_TOURISM = "Eco Tourism",
}

export enum StayCategory {
  HOTEL = "Hotel",
  VILLA = "Villa",
  HOMESTAY = "Homestay",
  RESORT = "Resort",
}

export enum TransportCategory {
  CAR_RENTAL = "Car Rental",
  AIRPORT_TRANSFER = "Airport Transfer",
  MOTORBIKE = "Motorbike",
}

export type ApiEnvelope<T> = {
  status: number;
  error: boolean;
  message: string;
  data: T;
};

export type AuthUser = {
  id: number;
  name: string;
  avatar: string;
  email: string;
  role: UserRole;
  specialization?: AgentSpecialization | null;
  verification_status?: VerificationStatus;
  tanggal_lahir?: string | null;
  jenis_kelamin?: string | null;
  tempat_tinggal?: string | null;
  phone_number?: string | null;
  pending_email?: string | null;
};

export type UploadedMediaItem = {
  path: string;
  url: string;
  file_name?: string;
  stored_name?: string;
  mime?: string;
  size?: number;
};

export type UploadMediaResponse = {
  url?: string;
  filename?: string;
  urls?: string[];
  filenames?: string[];
  items?: UploadedMediaItem[];
};

export type TripType = 'Open Trip' | 'Private Trip' | 'Group Trip';

// ─── Group Trip Pricing Tier ────────────────────────────────────────────────
export interface GroupPricingTier {
  label: string;       // e.g. "Group of 6-10"
  minPax: number;      // min peserta di tier ini
  maxPax: number;      // max peserta (99 = unlimited)
  discountPct: number; // diskon % dari base price
}

// ─── Child Pricing ───────────────────────────────────────────────────────────
export interface ChildPricing {
  enabled: boolean;
  infant: number;   // diskon % untuk bayi 0-1 tahun (misal 100 = gratis)
  child: number;    // diskon % untuk anak 2-11 tahun
  teen: number;     // diskon % untuk remaja 12-17 tahun
}

export interface TourDetails {
  type: "tour";
  tourCategory: TourCategory;
  duration: string;
  tripType?: "Open Trip" | "Private Trip" | "Group Trip";
  minPax?: number;
  // Group Trip pricing tiers (otomatis dari base price + diskon %)
  groupPricingTiers?: GroupPricingTier[];
  // Child pricing (opsional, bisa diaktifkan semua trip type)
  childPricing?: ChildPricing;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
}

export interface StayDetails {
  type: "stay";
  stayCategory: StayCategory;
  checkIn: string;
  checkOut: string;
  rooms: number;
  bathrooms: number;
  beds: number;
  roomSize?: number;
  amenities: { category: string; items: string[] }[];
  rules: string[];
  breakfastIncluded: boolean;
}

export interface CarDetails {
  type: "car";
  transportCategory: TransportCategory;
  transmission: "Automatic" | "Manual" | "Matic" | "Manual";
  seats: number;
  luggage?: number;
  fuelPolicy?: string;
  year?: number;
  driverLanguages?: string[];
  requirements: string[];
  driver?: boolean;
  location?: string;
  priceUnit?: "hari" | "jam" | "bulan";
  fuelType?: "bensin" | "diesel" | "listrik" | "hybrid";
  hasAC?: boolean;
  mileage?: number;
  insurance?: boolean;
  color?: string;

  // link back to selected vehicle from cars table
  car_id?: number;
}

export type ProductDetails = TourDetails | StayDetails | CarDetails;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "AGENT" | "ADMIN";
  specialization?: string;
  phone_number?: string;
}

export interface FlashSaleCampaign {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  minDiscount: number;
  adminFeePercentage: number;
  image: string;
  isActive: boolean;
}

export interface FlashSaleDetails {
  salePrice: number;
  originalPrice: number;
  discountPercentage: number;
  status: "pending" | "approved" | "rejected" | "ended";
  endTime?: string;
  requestDate: string;
  campaignId?: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string[];
  accommodation?: string;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export type LoginResult = {
  success: boolean;
  user?: AuthUser;
  message?: string;
  is_unverified?: boolean;
};

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  profile_photo?: string | null;
  avatar?: string;
  balance?: number;
  verification_status?: VerificationStatus;
  agentType?: AgentType | null;
  specialization?: AgentSpecialization | null;
  tanggal_lahir?: string | null;
  jenis_kelamin?: string | null;
  tempat_tinggal?: string | null;
  phone_number?: string | null;
  documents?: {
    idCard?: string;
    taxId?: string;
    companyDeed?: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
}

// ✅ Single definition — gabungan dari dua definisi yang duplikat sebelumnya
export interface ProductImage {
  id: number;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface AgentProductImage {
  id: number;
  url: string;
  created_at: string;
  sort_order: number;
}

export interface Product {
  id: number;
  owner_id: number;
  owner_name?: string;
  category_id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  image: string;
  images: ProductImage[];
  image_url?: string;
  rating: number;
  is_active: boolean;
  created_at?: string;
  features: string[];
  details?: ProductDetails;
  daily_capacity?: number;
  blocked_dates?: string[];
  flashSale?: FlashSaleDetails;
  reviews?: Review[];
}

export interface Booking {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  userName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  status: BookingStatus;
  productImage?: string;
  paymentUrl?: string;        // ← tambah
  paymentStatus?: string;     // ← tambah
  paymentExpiredAt?: string;  // ← tambah
  externalId?: string;
  contactDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface PayoutRequest {
  id: number;
  userId: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  status: PayoutStatus;
  date: string;
}

export type VerificationStatusUser =
  | "UNVERIFIED"
  | "WAITING_DOCUMENT"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";
export type AgentVerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AgentVerification {
  id: number;
  user_id: number;
  agent_type: AgentType;
  id_card_number: string;
  tax_id: string;
  company_name: string | null;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  specialization: AgentSpecialization;
  id_document_url: string | null;
  sk_document_url: string | null;
  status: AgentVerificationStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MyAgentVerification extends AgentVerification {
  verification_status?: VerificationStatusUser;
}

export interface AgentListItem {
  id: number;
  name: string;
  email: string;
  role: "AGENT";
  avatar: string | null;
  verification_status: VerificationStatusUser;
  specialization: AgentSpecialization | null;
  verification: AgentVerification | null;
}

export interface ProductItineraryItem {
  day: number;
  meals: string[];
  title: string;
  description: string;
  accommodation: string;
}

export interface Paginated<TItem> {
  meta: PaginationMeta;
  data: TItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface OwnerSummary {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

export interface ItineraryItem {
  day: number;
  meals: string[];
  title: string;
  description: string;
  accommodation: string;
}

export interface AdminProductDetails {
  type: string;
  duration: string;
  tripType?: "Open Trip" | "Private Trip" | "Group Trip";
  minPax?: number;
  groupSize: string;
  itinerary: ItineraryItem[];
  difficulty: string;
  exclusions: string[];
  inclusions: string[];
  meetingPoint: string;
  tourCategory: string;
  ageRestriction: string;
}

export interface VoucherItem {
  id: number;
  code: string;
  description: string | null;
  type: 'percent' | 'fixed';
  value: number;
  max_discount: number | null;
  min_transaction: number;
  scope: string;
  max_usage: number | null;
  used_count: number;
  per_user: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: number;
  created_at?: string;
}

// ✅ FIX: hapus duplikat AgentProduct — digabung jadi satu interface lengkap
export interface AgentProduct {
  id: number;
  owner_id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  location: string;

  image: string;      // resolved full URL
  image_url: string;  // alias dari image, untuk kompatibilitas

  images: AgentProductImage[];

  features: string[];
  details: ProductDetails;

  daily_capacity: number;
  lat?: number;
  lng?: number;
  rating: number;
  is_active: boolean;

  created_at: string;
  updated_at?: string;

  owner?: OwnerSummary;
  blocked_dates?: string[];

  // when transport products are linked to a specific vehicle
  car_id?: number;

  seo_title?: string;
  seo_description?: string;
  seo_slug?: string;
  seo_keyword?: string;
  seo_canonical?: string;
  seo_og_image?: string;

  vouchers?: VoucherItem[];
}

export type ListAgentProductsResponse = ApiResponse<Paginated<AgentProduct>>;

export type CustomerListItem = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER";
  avatar: string | null;
};

export interface AgentProductPayload {
  category_id: number;
  name: string;
  description: string;
  price: number;
  lat: number;
  lng: number;
  currency: string;
  location: string;
  image_url: string;
  images: string[];
  features: string[];
  details?: ProductDetails;
  daily_capacity?: number;
  blocked_dates?: string[];
  
  seo_title?: string | null;
  seo_description?: string | null;
  seo_slug?: string | null;
  seo_keyword?: string | null;
  seo_canonical?: string | null;
  seo_og_image?: string | null;
}

export interface ApiResponse<T> {
  status: number;
  error: boolean;
  message: string;
  data: T;
}

export type AgentListResponse = ApiResponse<AgentListItem[]>;

export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  REJECTED = 'rejected',
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum AgentType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
}

export enum AgentSpecialization {
  TOUR = 'TOUR',
  STAY = 'STAY',
  TRANSPORT = 'TRANSPORT',
}

export enum TourCategory {
  NATURE = 'Nature',
  ADVENTURE = 'Adventure',
  SPIRITUAL = 'Spiritual',
  CULTURAL = 'Cultural',
  CULINARY = 'Culinary',
}

export enum StayCategory {
  HOTEL = 'Hotel',
  VILLA = 'Villa',
  HOMESTAY = 'Homestay',
  RESORT = 'Resort',
}

export enum TransportCategory {
  CAR_RENTAL = 'Car Rental',
  AIRPORT_TRANSFER = 'Airport Transfer',
  MOTORBIKE = 'Motorbike',
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
  path: string;
  url: string;
  items: UploadedMediaItem[];
};

export interface TourDetails {
  type: 'tour';
  tourCategory: TourCategory; // Added
  duration: string;
  groupSize: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard'; // Added
  ageRestriction?: string; // Added
  meetingPoint: string; // Added
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
}

export interface StayDetails {
  type: 'stay';
  stayCategory: StayCategory; // Added
  checkIn: string;
  checkOut: string;
  rooms: number;
  bathrooms: number;
  beds: number; // Added
  roomSize?: number; // sqm
  amenities: { category: string; items: string[] }[];
  rules: string[];
  breakfastIncluded: boolean; // Added
}

export interface CarDetails {
  type: 'car';
  transportCategory: TransportCategory; // Added
  transmission: 'Automatic' | 'Manual';
  seats: number;
  luggage: number;
  fuelPolicy: string;
  year?: number; // Added
  driverLanguages?: string[]; // Added
  requirements: string[];
  driver?: boolean;
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
  role?: 'CUSTOMER' | 'AGENT' | 'ADMIN';
  specialization?: string;
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
  status: 'pending' | 'approved' | 'rejected' | 'ended';
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
  avatar?: string;
  balance?: number;

  verification_status?: VerificationStatus;
  agentType?: AgentType | null;
  specialization?: AgentSpecialization | null;
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

export interface ProductImage {
  id: number;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: number;

  // owner
  owner_id: number;
  owner_name?: string;

  // category
  category_id: number;

  // basic info
  name: string;
  description: string;
  price: number;
  currency: string;
  location: string;

  // images
  image: string; // cover (images[0] || fallback)
  images: ProductImage[]; // relasi product_images

  // meta
  rating: number;
  is_active: boolean;
  created_at?: string;

  // optional business data
  features: string[];
  details?: ProductDetails;

  daily_capacity?: number;
  blocked_dates?: string[];

  // campaign
  flashSale?: FlashSaleDetails;

  // optional
  reviews?: Review[];
}

export interface Booking {
  id: number;
  userId: number;
  userName?: string;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  date: string;
  createdAt: string;
  contactDetails?: {
    name: string;
    email: string;
    phone: string;
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

export type VerificationStatusUser = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AgentVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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

  status: AgentVerificationStatus;

  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;

  created_at: string;
  updated_at: string;
}

export interface AgentListItem {
  id: number;
  name: string;
  email: string;
  role: 'AGENT';
  avatar: string | null;
  verification_status: VerificationStatusUser;
  specialization: AgentSpecialization | null;
  verification: AgentVerification | null;
}

export interface AgentProductImage {
  id: number;
  url: string;
  created_at: string;
  sort_order: number;
}

export interface ProductItineraryItem {
  day: number;
  meals: string[];
  title: string;
  description: string;
  accommodation: string;
}

// ADMIN AGENT PRODUCT

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

export interface ProductImage {
  id: number;
  url: string;
  created_at: string;
  sort_order: number;
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
  groupSize: string;
  itinerary: ItineraryItem[];
  difficulty: string;
  exclusions: string[];
  inclusions: string[];
  meetingPoint: string;
  tourCategory: string;
  ageRestriction: string;
}

export interface AgentProduct {
  id: number;
  owner_id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  location: string;

  image: string;
  image_url: string;

  images: ProductImage[];

  features: string[];
  details: ProductDetails;

  daily_capacity: number;
  rating: number;
  is_active: boolean;

  created_at: string;
  updated_at: string;

  owner: OwnerSummary;
}

export type ListAgentProductsResponse = ApiResponse<Paginated<AgentProduct>>;

export interface AgentProduct {
  id: number;
  owner_id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  location: string;

  image: string;
  images: AgentProductImage[];

  features: string[];
  details: ProductDetails;
  daily_capacity: number;
  rating: number;
  is_active: boolean;
  created_at: string;

  blocked_dates?: string[];
}

export type CustomerListItem = {
  id: number;
  name: string;
  email: string;
  role: 'CUSTOMER';
  avatar: string | null;
};

// PAYLOAD

export interface AgentProductPayload {
  category_id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  image_url: string;
  images: string[];
  features: string[];
  details?: ProductDetails;
  daily_capacity?: number;
  blocked_dates?: string[];
}

// RESPONSE

export interface ApiResponse<T> {
  status: number;
  error: boolean;
  message: string;
  data: T;
}

export type AgentListResponse = ApiResponse<AgentListItem[]>;

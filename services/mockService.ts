import {
  AgentSpecialization,
  AgentType,
  Booking,
  BookingStatus,
  Category,
  FlashSaleCampaign,
  PayoutRequest,
  PayoutStatus,
  Product,
  Review,
  StayCategory,
  TourCategory,
  TransportCategory,
  User,
  UserRole,
  VerificationStatus,
} from '../types';

// Helper to generate future dates for demo
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Initial Mock Data
const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Tours',
    slug: 'tours',
    description: 'Guided adventures',
    image: 'https://picsum.photos/seed/cat1/400/300',
  },
  {
    id: 2,
    name: 'Villas & Hotels',
    slug: 'stays',
    description: 'Luxury stays',
    image: 'https://picsum.photos/seed/cat2/400/300',
  },
  {
    id: 3,
    name: 'Activities',
    slug: 'activities',
    description: 'Fun daily activities',
    image: 'https://picsum.photos/seed/cat3/400/300',
  },
  {
    id: 4,
    name: 'Transportation',
    slug: 'transport',
    description: 'Rent a vehicle',
    image: 'https://picsum.photos/seed/cat4/400/300',
  },
];

// Mock Campaigns
let CAMPAIGNS: FlashSaleCampaign[] = [
  {
    id: 1,
    name: 'End of Year Sale',
    description:
      'Join the biggest sale of the year! Offer huge discounts and enjoy reduced platform fees.',
    startDate: '2023-12-25',
    endDate: '2024-01-01',
    minDiscount: 20,
    adminFeePercentage: 5,
    image:
      'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    id: 2,
    name: 'Summer Vibes',
    description: 'Get ready for the summer holiday wave.',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    minDiscount: 15,
    adminFeePercentage: 8,
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
];

let PRODUCTS: Product[] = [
  {
    id: 101,
    owner_id: 2,
    owner_name: 'Agent Smith',
    category_id: 1,
    name: 'Ultimate Bali Tour',
    location: 'Bali, Indonesia',
    price: 150,
    currency: 'USD',
    rating: 4.8,
    description:
      'Experience the magic of Bali with our comprehensive 3-day tour. From the cultural heart of Ubud to the stunning beaches of Nusa Dua.',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
      { url: 'https://images.unsplash.com/photo-1552120476-945690e87d3a?auto=format&fit=crop&w=1200&q=80' },
    ],
    features: ['Transport', 'Lunch', 'Guide', 'Entrance Fees'],
    daily_capacity: 20,
    is_active: true,
    blocked_dates: [getFutureDate(2), getFutureDate(5)],
    details: {
      type: 'tour',
      tourCategory: TourCategory.CULTURAL,
      duration: '3 Days / 2 Nights',
      groupSize: 'Max 10 People',
      difficulty: 'Easy',
      meetingPoint: 'Hotel Pickup',
      inclusions: ['Private AC Vehicle', 'English Speaking Guide'],
      exclusions: ['Personal Expenses', 'Tipping'],
      itinerary: [
        {
          day: 1,
          title: 'Cultural Heart of Ubud',
          description: 'Visit the Sacred Monkey Forest Sanctuary.',
          meals: ['Lunch at Bebek Bengil'],
        },
      ],
    },
    reviews: [],
    flashSale: {
      salePrice: 120,
      originalPrice: 150,
      discountPercentage: 20,
      status: 'approved',
      endTime: '2024-12-31T23:59:59',
      requestDate: '2023-11-01',
      campaignId: 1,
    },
  },
  {
    id: 102,
    owner_id: 2,
    owner_name: 'Agent Smith',
    category_id: 2,
    name: 'Sunset Private Villa',
    location: 'Santorini, Greece',
    price: 450,
    currency: 'USD',
    rating: 4.9,
    description:
      'A luxurious private villa offering breathtaking sunset views over the Aegean Sea.',
    image:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80' },
    ],
    features: ['Private Pool', 'Ocean View', 'Breakfast', 'Wifi'],
    daily_capacity: 1,
    is_active: true,
    blocked_dates: [getFutureDate(1), getFutureDate(3)],
    details: {
      type: 'stay',
      stayCategory: StayCategory.VILLA,
      checkIn: '15:00',
      checkOut: '11:00',
      rooms: 3,
      bathrooms: 3,
      beds: 3,
      breakfastIncluded: true,
      amenities: [{ category: 'General', items: ['Air conditioning', 'Wifi'] }],
      rules: ['No smoking'],
    },
    reviews: [],
    flashSale: {
      salePrice: 380,
      originalPrice: 450,
      discountPercentage: 15,
      status: 'pending',
      requestDate: '2023-11-10',
    },
  },
  {
    id: 105,
    owner_id: 2,
    owner_name: 'Agent Smith',
    category_id: 4,
    name: 'Toyota Avanza Rental',
    location: 'Bali, Indonesia',
    price: 35,
    currency: 'USD',
    rating: 4.6,
    description: 'Reliable and spacious MPV perfect for family trips around Bali.',
    image:
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80' },
    ],
    features: ['7 Seater', 'Automatic', 'AC', 'Bluetooth'],
    daily_capacity: 5,
    is_active: true,
    details: {
      type: 'car',
      transportCategory: TransportCategory.CAR_RENTAL,
      transmission: 'Automatic',
      seats: 7,
      luggage: 2,
      fuelPolicy: 'Full to Full',
      year: 2022,
      requirements: ['Valid Driving License'],
      driver: false,
    },
    reviews: [],
  },
];

const USERS: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@trivgoo.com',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/seed/u1/100/100',
  },
  {
    id: 2,
    name: 'Agent Smith',
    email: 'agent@trivgoo.com',
    role: UserRole.AGENT,
    balance: 1250.0,
    avatar: 'https://picsum.photos/seed/u2/100/100',
    verification_status: VerificationStatus.VERIFIED,
    specialization: AgentSpecialization.TOUR,
    agentType: AgentType.INDIVIDUAL,
  },
  {
    id: 4,
    name: 'New Agent',
    email: 'newagent@trivgoo.com',
    role: UserRole.AGENT,
    balance: 0,
    avatar: 'https://picsum.photos/seed/u4/100/100',
    verification_status: VerificationStatus.UNVERIFIED,
  },
  {
    id: 3,
    name: 'John Doe',
    email: 'user@gmail.com',
    role: UserRole.CUSTOMER,
    avatar: 'https://picsum.photos/seed/u3/100/100',
  },
];

const BOOKINGS: Booking[] = [
  {
    id: 5001,
    userId: 3,
    userName: 'John Doe',
    productId: 101,
    productName: 'Ultimate Bali Tour',
    productImage:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    quantity: 2,
    totalPrice: 300,
    status: BookingStatus.CONFIRMED,
    date: '2023-11-15',
    contactDetails: { name: 'John Doe', email: 'user@gmail.com', phone: '08123456789' },
  },
];

const PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 1,
    userId: 2,
    amount: 500,
    bankName: 'BCA',
    accountNumber: 'cth: 4534567890',
    status: PayoutStatus.PROCESSED,
    date: '2023-10-25',
  },
];

// Service Class
class MockService {
  getProducts(): Promise<Product[]> {
    return new Promise((resolve) => setTimeout(() => resolve(PRODUCTS), 500));
  }

  getProductById(id: number): Promise<Product | undefined> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(PRODUCTS.find((p) => p.id === id)), 300),
    );
  }

  getRelatedProducts(categoryId: number, currentProductId: number): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const related = PRODUCTS.filter(
          (p) => p.category_id === categoryId && p.id !== currentProductId,
        ).slice(0, 3);
        resolve(related);
      }, 400);
    });
  }

  getCategories(): Promise<Category[]> {
    return new Promise((resolve) => setTimeout(() => resolve(CATEGORIES), 300));
  }

  getUserBookings(userId: number): Promise<Booking[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(BOOKINGS.filter((b) => b.userId === userId)), 500),
    );
  }

  getAllBookings(): Promise<Booking[]> {
    return new Promise((resolve) => {
      const enrichedBookings = BOOKINGS.map((booking) => {
        const user = USERS.find((u) => u.id === booking.userId);
        return {
          ...booking,
          userName: user ? user.name : 'Unknown User',
        };
      });
      setTimeout(() => resolve(enrichedBookings), 500);
    });
  }

  updateBookingStatus(id: number, status: BookingStatus): Promise<boolean> {
    return new Promise((resolve) => {
      const booking = BOOKINGS.find((b) => b.id === id);
      if (booking) {
        if (status === BookingStatus.CONFIRMED && booking.status !== BookingStatus.CONFIRMED) {
          const product = PRODUCTS.find((p) => p.id === booking.productId);
          let commissionRate = 0.11;

          if (
            product &&
            product.flashSale &&
            product.flashSale.status === 'approved' &&
            product.flashSale.campaignId
          ) {
            const campaign = CAMPAIGNS.find((c) => c.id === product.flashSale?.campaignId);
            if (campaign) {
              commissionRate = campaign.adminFeePercentage / 100;
            }
          }

          const platformFee = booking.totalPrice * commissionRate;
          const agentEarnings = booking.totalPrice - platformFee;

          if (product) {
            const agent = USERS.find((u) => u.id === product.owner_id);
            if (agent) {
              agent.balance = (agent.balance || 0) + agentEarnings;
            }
          }
        }

        booking.status = status;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  completeBooking(id: number): Promise<boolean> {
    return this.updateBookingStatus(id, BookingStatus.COMPLETED);
  }

  addReview(productId: number, review: Omit<Review, 'id' | 'date'>): Promise<boolean> {
    return new Promise((resolve) => {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (product) {
        const newReview: Review = {
          ...review,
          id: Math.floor(Math.random() * 10000),
          date: new Date().toISOString().split('T')[0],
        };
        if (!product.reviews) product.reviews = [];
        product.reviews.push(newReview);

        const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
        product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));

        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  login(email: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = USERS.find((u) => u.email === email);
        resolve(user || null);
      }, 800);
    });
  }

  register(userData: {
    name: string;
    email: string;
    role: UserRole;
    specialization?: AgentSpecialization;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingUser = USERS.find((u) => u.email === userData.email);
        if (existingUser) {
          resolve(false);
          return;
        }

        const newUser: User = {
          id: Math.floor(Math.random() * 10000),
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userData.name,
          )}&background=random`,
          balance: 0,
          verification_status:
            userData.role === UserRole.AGENT ? VerificationStatus.UNVERIFIED : undefined,
          specialization: userData.specialization,
        };

        USERS.push(newUser);
        resolve(true);
      }, 800);
    });
  }

  createBooking(booking: Omit<Booking, 'id' | 'status'>): Promise<Booking> {
    return new Promise((resolve) => {
      const product = PRODUCTS.find((p) => p.id === booking.productId);
      if (product && product.daily_capacity) {
        const bookingsOnDate = BOOKINGS.filter(
          (b) =>
            b.productId === booking.productId &&
            b.date === booking.date &&
            b.status !== BookingStatus.CANCELLED,
        );

        const currentTotalQuantity = bookingsOnDate.reduce((sum, b) => sum + b.quantity, 0);
        const newTotal = currentTotalQuantity + booking.quantity;

        if (newTotal >= product.daily_capacity) {
          if (!product.blocked_dates) product.blocked_dates = [];
          if (!product.blocked_dates.includes(booking.date)) {
            product.blocked_dates.push(booking.date);
            console.log(
              `Date ${booking.date} blocked for product ${product.name} (Capacity reached)`,
            );
          }
        }
      }

      const newBooking: Booking = {
        ...booking,
        id: Math.floor(Math.random() * 10000),
        status: BookingStatus.PENDING,
      };
      BOOKINGS.push(newBooking);
      setTimeout(() => resolve(newBooking), 1000);
    });
  }

  getAgentProducts(agentId: number): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(PRODUCTS.filter((p) => p.owner_id === agentId));
      }, 500);
    });
  }

  getAgentBookings(agentId: number): Promise<Booking[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const agentProductIds = PRODUCTS.filter((p) => p.owner_id === agentId).map((p) => p.id);
        const agentBookings = BOOKINGS.filter((b) => agentProductIds.includes(b.productId));

        const enriched = agentBookings.map((b) => {
          const u = USERS.find((user) => user.id === b.userId);
          return { ...b, userName: u ? u.name : 'Unknown', userEmail: u ? u.email : '' };
        });

        resolve(enriched);
      }, 500);
    });
  }

  addProduct(product: Omit<Product, 'id' | 'rating' | 'reviews'>): Promise<boolean> {
    return new Promise((resolve) => {
      const user = USERS.find((u) => u.id === product.owner_id);
      const newProduct: Product = {
        ...product,
        id: Math.floor(Math.random() * 10000),
        owner_name: user?.name,
        rating: 0,
        reviews: [],
        is_active: true,
        daily_capacity: product.daily_capacity || 10,
        blocked_dates: product.blocked_dates || [],
      };
      PRODUCTS.push(newProduct);
      setTimeout(() => resolve(true), 1000);
    });
  }

  updateProduct(id: number, productData: Partial<Product>): Promise<boolean> {
    return new Promise((resolve) => {
      const index = PRODUCTS.findIndex((p) => p.id === id);
      if (index !== -1) {
        PRODUCTS[index] = { ...PRODUCTS[index], ...productData };
        setTimeout(() => resolve(true), 800);
      } else {
        resolve(false);
      }
    });
  }

  deleteProduct(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      const initialLength = PRODUCTS.length;
      PRODUCTS = PRODUCTS.filter((p) => p.id !== id);
      setTimeout(() => resolve(PRODUCTS.length < initialLength), 800);
    });
  }

  toggleProductStatus(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (product) {
        product.is_active = !product.is_active;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  // FLASH SALE & CAMPAIGN METHODS

  getCampaigns(): Promise<FlashSaleCampaign[]> {
    return new Promise((resolve) => setTimeout(() => resolve(CAMPAIGNS), 400));
  }

  addCampaign(campaign: Omit<FlashSaleCampaign, 'id'>): Promise<boolean> {
    return new Promise((resolve) => {
      const newCampaign: FlashSaleCampaign = {
        ...campaign,
        id: Math.floor(Math.random() * 10000),
      };
      CAMPAIGNS.unshift(newCampaign);
      setTimeout(() => resolve(true), 800);
    });
  }

  requestFlashSale(productId: number, salePrice: number, campaignId?: number): Promise<boolean> {
    return new Promise((resolve) => {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (product) {
        const originalPrice = product.price;
        const discountPercentage = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

        product.flashSale = {
          originalPrice,
          salePrice,
          discountPercentage,
          status: 'pending',
          requestDate: new Date().toISOString().split('T')[0],
          campaignId,
        };
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  approveFlashSale(productId: number, endTime: string): Promise<boolean> {
    return new Promise((resolve) => {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (product && product.flashSale) {
        product.flashSale.status = 'approved';
        product.flashSale.endTime = endTime;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  rejectFlashSale(productId: number): Promise<boolean> {
    return new Promise((resolve) => {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (product && product.flashSale) {
        product.flashSale.status = 'rejected';
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  // AGENT COMMISSION & PAYOUT METHODS
  getAgentPayouts(agentId: number): Promise<PayoutRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(PAYOUT_REQUESTS.filter((p) => p.userId === agentId));
      }, 500);
    });
  }

  requestPayout(
    agentId: number,
    amount: number,
    bankDetails: { name: string; number: string },
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const agent = USERS.find((u) => u.id === agentId);
      if (!agent) {
        resolve({ success: false, message: 'Agent not found' });
        return;
      }
      if ((agent.balance || 0) < amount) {
        resolve({ success: false, message: 'Insufficient balance' });
        return;
      }

      agent.balance = (agent.balance || 0) - amount;

      const newRequest: PayoutRequest = {
        id: Math.floor(Math.random() * 10000),
        userId: agentId,
        amount: amount,
        bankName: bankDetails.name,
        accountNumber: bankDetails.number,
        status: PayoutStatus.PENDING,
        date: new Date().toISOString().split('T')[0],
      };
      PAYOUT_REQUESTS.unshift(newRequest);

      setTimeout(() => resolve({ success: true, message: 'Payout requested successfully' }), 1000);
    });
  }

  // ADMIN PAYOUT METHODS
  getAllPayouts(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const enriched = PAYOUT_REQUESTS.map((req) => {
          const agent = USERS.find((u) => u.id === req.userId);
          return {
            ...req,
            agentName: agent ? agent.name : 'Unknown Agent',
            agentEmail: agent ? agent.email : '',
          };
        });
        resolve(enriched);
      }, 500);
    });
  }

  processPayout(
    id: number,
    status: PayoutStatus.PROCESSED | PayoutStatus.REJECTED,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const request = PAYOUT_REQUESTS.find((p) => p.id === id);
      if (request) {
        if (status === PayoutStatus.REJECTED && request.status === PayoutStatus.PENDING) {
          const agent = USERS.find((u) => u.id === request.userId);
          if (agent) {
            agent.balance = (agent.balance || 0) + request.amount;
          }
        }
        request.status = status;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  // ADMIN USER MANAGEMENT & VERIFICATION
  getAllAgents(): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(USERS.filter((u) => u.role === UserRole.AGENT)), 500);
    });
  }

  getAllCustomers(): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(USERS.filter((u) => u.role === UserRole.CUSTOMER)), 500);
    });
  }

  verifyAgent(userId: number, data: any): Promise<boolean> {
    return new Promise((resolve) => {
      const user = USERS.find((u) => u.id === userId);
      if (user && user.role === UserRole.AGENT) {
        user.verification_status = VerificationStatus.PENDING;
        user.agentType = data.type;
        user.documents = { idCard: 'uploaded', taxId: data.taxId };
        user.bankDetails = {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountHolder: data.accountHolder,
        };
        user.specialization = data.specialization;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  approveAgent(userId: number): Promise<boolean> {
    return new Promise((resolve) => {
      const user = USERS.find((u) => u.id === userId);
      if (user) {
        user.verification_status = VerificationStatus.VERIFIED;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  rejectAgent(userId: number): Promise<boolean> {
    return new Promise((resolve) => {
      const user = USERS.find((u) => u.id === userId);
      if (user) {
        user.verification_status = VerificationStatus.REJECTED;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
}

export const mockService = new MockService();

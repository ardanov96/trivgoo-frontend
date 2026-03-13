
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import http from '../../services/http';
import { loyaltyService } from '../../services/loyaltyService';
import { Booking, BookingStatus } from '../../types';
import { Calendar, Edit2, Package, History, ChevronRight, TrendingUp, Award, Wallet, Camera, Shield, QrCode, MessageSquare, MessageCircle, Star, X, CreditCard, Gift, Coins } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useCart } from '../../components/CartContext';
import { getImageUrl, FALLBACK_IMAGE } from '../../utils/imageUtils';

const getStatusColor = (status: BookingStatus | string) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
    case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
    case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
    default: return 'bg-gray-100 text-gray-600';
  }
};

interface MobileBookingCardProps {
  booking: Booking;
  onPay: (b: Booking) => void;
  onContact: (b: Booking) => void;
  onTicket: (b: Booking) => void;
  onReview: (b: Booking) => void;
}

const MobileBookingCard: React.FC<MobileBookingCardProps> = ({ booking, onPay, onContact, onTicket, onReview }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4 active:scale-[0.98] transition-transform">
    <div className="flex gap-4">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <img 
          src={getImageUrl(booking.productImage)} 
          className="w-full h-full object-cover" 
          alt="Product"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">#{booking.id}</span>
        </div>
        <h4 className="font-bold text-gray-900 truncate leading-tight mb-1">{booking.productName}</h4>
        <div className="text-xs text-gray-500 flex items-center mb-3">
          <Calendar className="w-3 h-3 mr-1" /> {booking.date}
        </div>
        <div className="flex justify-between items-end">
          <span className="font-bold text-primary-700">USD {booking.totalPrice}</span>
          <div className="flex gap-2">
            {booking.status === BookingStatus.PENDING && (
              <button onClick={() => onPay(booking)} className="p-1.5 bg-primary-600 rounded-lg text-white hover:bg-primary-700 shadow-sm" title="Pay Now">
                <CreditCard className="w-4 h-4" />
              </button>
            )}
            {(booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING) && (
              <button onClick={() => onContact(booking)} className="p-1.5 bg-green-50 rounded-lg text-green-600 hover:text-green-700" title="Contact Agent">
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
            {booking.status === BookingStatus.CONFIRMED && (
              <button onClick={() => onTicket(booking)} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900" title="View Ticket">
                <QrCode className="w-4 h-4" />
              </button>
            )}
            {booking.status === BookingStatus.COMPLETED && (
              <button onClick={() => onReview(booking)} className="p-1.5 bg-yellow-50 rounded-lg text-yellow-600 hover:text-yellow-700" title="Write Review">
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
            <Link to={`/product/${booking.productId}`} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CustomerBookings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // User Profile
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [membershipTier, setMembershipTier] = useState<{ name: string; color: string | null } | null>(null);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Buat preview sementara
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', profileName);
      formData.append('email', profileEmail);
      if (selectedFile) {
        formData.append('profile_photo', selectedFile);
      }

      // 1. Kirim ke API melalui authService
      const updatedUser = await authService.updateProfile(formData);

      // 2. Update Global State agar foto di Navbar & Home berubah otomatis
      updateUser({
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.profile_photo // Sesuaikan key dari backend
      });

      setIsEditingProfile(false);
      setPreviewUrl(null);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
  if (user) {
    loadBookings();
    setProfileName(user.name);
    setProfileEmail(user.email);
    // Fetch loyalty data
    loyaltyService.getMembership()
      .then(mem => setMembershipTier({ name: mem.tier.name, color: mem.tier.color }))
      .catch(() => {}); // silent — jika user belum punya membership
    loyaltyService.getBalance()
      .then(bal => setPointBalance(bal.balance))
      .catch(() => {});
  }
}, [user]);

  // Handle Midtrans Redirect Flow (Simulator)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('transaction_status');
    // If returning from a successful Midtrans redirect, clear the cart
    if (status === 'settlement' || status === 'capture') {
      clearCart();
      // Optional: remove query params from URL so it doesn't run again on refresh
      navigate('/my-bookings', { replace: true });
    }
  }, [location.search, clearCart, navigate]);

  const loadBookings = async () => {
    if (!user) {
      console.log('[MyBookings] No user, skipping loadBookings');
      return;
    }
    console.log('[MyBookings] Loading bookings for user:', user.id, user.name);
    try {
      const res = await http.get('/bookings/my');
      console.log('[MyBookings] API response:', res.status, res.data);
      const data = res.data?.data || [];
      console.log('[MyBookings] Bookings count:', data.length);
      // Normalize status from DB (UPPERCASE) to frontend enum (lowercase)
      const normalized = data.map((b: any) => ({
        ...b,
        status: (b.status || '').toLowerCase() as BookingStatus,
      }));
      setBookings(normalized);
    } catch (err: any) {
      console.error('[MyBookings] Failed to load bookings:', err.response?.status, err.response?.data || err.message);
      setBookings([]);
    }
  };

  const activeBookings = bookings.filter(b => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED);
  const pastBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED);

  // Stats Calculation
  const completedTrips = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;
  const totalSpent = bookings
    .filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const openTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowTicketModal(true);
  };

  const openReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleSimulateComplete = async (id: number) => {
    try {
      await http.patch(`/bookings/${id}/status`, { status: 'COMPLETED' });
      loadBookings();
    } catch (err) {
      console.error('Failed to complete booking:', err);
    }
  };

  const submitReview = async () => {
    if (!selectedBooking || !user) return;
    setIsSubmittingReview(true);
    try {
      // TODO: Replace with real API when review endpoint is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Thank you for your review!');
    } catch (err) {
      alert('Failed to submit review');
    }
    setIsSubmittingReview(false);
    setShowReviewModal(false);
  };

  const handleContactAgent = (booking: Booking) => {
    // In a real app, you would fetch the agent's phone number associated with the product.
    // For simulation, we use a placeholder number.
    const agentPhone = '6281234567890';
    const message = `Hello, I have a booking for ${booking.productName} on ${booking.date}. Booking ID: #${booking.id}. My name is ${user?.name}.`;
    const url = `https://wa.me/${agentPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePayNow = async (booking: Booking) => {
    try {
      const res = await http.get(`/products/${booking.productId}`);
      const product = res.data?.data;
      if (product) {
        navigate('/payment', {
          state: {
            product,
            quantity: booking.quantity,
            totalPrice: booking.totalPrice,
            date: booking.date,
            currency: product.currency,
            contactDetails: booking.contactDetails,
            bookingId: booking.id
          }
        });
      } else {
        alert('Product details not found.');
      }
    } catch (err) {
      alert('Failed to load product details.');
    }
  };

  // Desktop Table Component
  const BookingTable = ({ data }: { data: Booking[] }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Booking ID</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
              <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-bold mb-1">No bookings found</h3>
                    <p className="text-gray-500 text-sm mb-4">You haven't made any bookings in this category yet.</p>
                    {activeTab === 'active' && (
                      <Link to="/explore" className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">
                        Find Adventure
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500 font-mono">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <img 
                          className="h-full w-full object-cover" 
                          src={getImageUrl(booking.productImage)} 
                          alt=""
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 line-clamp-1">{booking.productName}</div>
                        <div className="text-xs text-gray-400">{booking.quantity} Guest(s)</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-gray-300" />
                      {booking.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    USD {booking.totalPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {booking.status === BookingStatus.PENDING && (
                        <button onClick={() => handlePayNow(booking)} className="flex items-center text-white bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded-lg transition-colors text-xs font-bold shadow-sm">
                          <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay Now
                        </button>
                      )}

                      {(booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING) && (
                        <button onClick={() => handleContactAgent(booking)} className="flex items-center text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors text-xs font-bold">
                          <MessageCircle className="w-3.5 h-3.5 mr-1" /> Contact
                        </button>
                      )}

                      {booking.status === BookingStatus.CONFIRMED && (
                        <>
                          <button onClick={() => openTicket(booking)} className="flex items-center text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-lg transition-colors text-xs font-bold">
                            <QrCode className="w-3.5 h-3.5 mr-1" /> Ticket
                          </button>
                          {/* Demo Only: Button to simulate completing a trip */}
                          <button onClick={() => handleSimulateComplete(booking.id)} className="flex items-center text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg text-[10px]">
                            Simulate Complete
                          </button>
                        </>
                      )}

                      {booking.status === BookingStatus.COMPLETED && (
                        <button onClick={() => openReview(booking)} className="flex items-center text-yellow-600 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-lg transition-colors text-xs font-bold">
                          <Star className="w-3.5 h-3.5 mr-1" /> Review
                        </button>
                      )}

                      <Link to={`/product/${booking.productId}`} className="flex items-center text-gray-400 hover:text-gray-600 px-2 py-1">
                        <span className="sr-only">Details</span> <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar / Profile Card */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 md:p-8 sticky top-28">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden mb-5 relative group">
                  <img
                    src={previewUrl || user?.avatar || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {isEditingProfile && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-all"
                    >
                      <Camera className="text-white w-6 h-6" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  )}
                </div>
                {isEditingProfile ? (
                  <div className="w-full space-y-3 animate-in fade-in slide-in-from-top-2">
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                      placeholder="Name"
                    />
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                      placeholder="Email"
                    />
                    <div className="flex gap-2 justify-center pt-2">
                      <button onClick={() => { setIsEditingProfile(false); setPreviewUrl(null); }} className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-600 transition-colors">Cancel</button>
                      <button disabled={isSaving} onClick={handleSaveProfile} className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold transition-colors disabled:opacity-50">Save</button>

                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                    <p className="text-gray-400 text-sm font-medium mb-4">{user?.email}</p>
                    <div className="flex flex-col items-center gap-2">
                    {membershipTier && (
                      <span
                        className="px-3 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center"
                        style={{ backgroundColor: membershipTier.color ?? '#cd7f32' }}
                      >
                        <Award className="w-3 h-3 mr-1" /> {membershipTier.name}
                      </span>
                    )}
                    {pointBalance > 0 && (
                      <span className="px-3 py-1 bg-gray-900 text-yellow-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <Coins className="w-3 h-3" /> {pointBalance.toLocaleString('id-ID')} pts
                      </span>
                    )}
                  </div>
                    <button onClick={() => setIsEditingProfile(true)} className="mt-6 flex items-center text-gray-400 text-xs font-bold hover:text-primary-600 transition-colors uppercase tracking-wide">
                      <Edit2 className="w-3 h-3 mr-1.5" /> Edit Profile
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-2 pt-6 border-t border-gray-50">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all text-sm ${activeTab === 'active' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
                >
                  <Package className={`w-5 h-5 mr-3 ${activeTab === 'active' ? 'text-primary-600' : 'text-gray-400'}`} />
                  Active Bookings
                  {activeBookings.length > 0 && (
                    <span className="ml-auto bg-white shadow-sm text-primary-700 py-0.5 px-2 rounded-md text-xs font-bold">
                      {activeBookings.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all text-sm ${activeTab === 'history' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
                >
                  <History className={`w-5 h-5 mr-3 ${activeTab === 'history' ? 'text-primary-600' : 'text-gray-400'}`} />
                  Trip History
                </button>
                <Link
                  to="/loyalty"
                  className="w-full flex items-center px-4 py-3.5 rounded-2xl transition-all text-sm text-gray-500 hover:bg-gray-50 font-medium"
                >
                  <Gift className="w-5 h-5 mr-3 text-gray-400" />
                  Loyalty & Points
                  {pointBalance > 0 && (
                    <span className="ml-auto bg-yellow-50 text-yellow-700 py-0.5 px-2 rounded-md text-xs font-bold">
                      {pointBalance.toLocaleString('id-ID')} pts
                    </span>
                  )}
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <div className="bg-primary-600 rounded-2xl p-5 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  <Shield className="w-6 h-6 mb-3 text-primary-200" />
                  <h4 className="font-bold text-sm mb-1">Travel Insurance</h4>
                  <p className="text-xs text-primary-100 mb-3">Protect your upcoming trips.</p>
                  <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            {/* Stats Header - Mobile friendly grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
              <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Package className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{activeBookings.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Completed</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{completedTrips}</p>
                </div>
              </div>
              <div className="col-span-2 md:col-span-1 bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Spent</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">${totalSpent}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                {activeTab === 'active' ? 'Upcoming Adventures' : 'Past Journeys'}
              </h1>

              {/* Mobile/Quick Tab Toggle */}
              <div className="bg-gray-100 p-1 rounded-xl inline-flex self-start md:self-auto">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  History
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Mobile View - Cards */}
              <div className="md:hidden space-y-4">
                {(activeTab === 'active' ? activeBookings : pastBookings).length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-gray-400 text-sm">No bookings found.</p>
                  </div>
                ) : (
                  (activeTab === 'active' ? activeBookings : pastBookings).map(booking => (
                    <MobileBookingCard
                      key={booking.id}
                      booking={booking}
                      onPay={handlePayNow}
                      onContact={handleContactAgent}
                      onTicket={openTicket}
                      onReview={openReview}
                    />
                  ))
                )}
              </div>

              {/* Desktop View - Table */}
              <BookingTable data={activeTab === 'active' ? activeBookings : pastBookings} />
            </div>
          </div>
        </div>
      </div>

      {/* E-Ticket Modal */}
      {showTicketModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative">
            <button onClick={() => setShowTicketModal(false)} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200 z-10">
              <X className="w-5 h-5" />
            </button>
            <div className="bg-primary-600 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
              <h3 className="text-xl font-bold font-serif relative z-10">E-Ticket</h3>
              <p className="text-primary-100 text-sm relative z-10">Show this at check-in</p>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-1">{selectedBooking.productName}</h4>
                <p className="text-sm text-gray-500">{selectedBooking.date} • {selectedBooking.quantity} Guest(s)</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 text-center">
                <div className="bg-white p-4 rounded-xl inline-block shadow-sm mb-3">
                  <QrCode className="w-32 h-32 text-gray-900" />
                </div>
                <p className="text-xs font-mono text-gray-400 font-bold uppercase tracking-widest">
                  #{selectedBooking.id}-{Math.floor(Math.random() * 1000)}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                  <span className="text-gray-500">Name</span>
                  <span className="font-bold text-gray-900">{selectedBooking.contactDetails?.name || user?.name}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                  <span className="text-gray-500">Booking Status</span>
                  <span className="font-bold text-green-600 uppercase text-xs px-2 py-0.5 bg-green-50 rounded-full">{selectedBooking.status}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 font-medium">
              Trivgoo Travel Platform
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Write a Review</h3>
            <p className="text-gray-500 text-sm mb-6">How was your experience with <strong>{selectedBooking.productName}</strong>?</p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                </button>
              ))}
            </div>

            <textarea
              className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all h-32 resize-none mb-6"
              placeholder="Tell us about your trip..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            ></textarea>

            <button
              onClick={submitReview}
              disabled={isSubmittingReview}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-600 transition-colors disabled:opacity-70"
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;

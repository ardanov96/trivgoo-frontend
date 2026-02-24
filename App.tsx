import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './components/ToastContext';
import { WishlistProvider } from './components/WishlistContext';
import { UserRole } from './types';
import { CartProvider } from './components/CartContext';

// Layouts
import DashboardLayout from './components/DashboardLayout';
import PublicLayout from './components/PublicLayout';


// Public Pages
import AITripPlanner from './pages/AITripPlanner';
import Explore from './pages/Explore';
import TermAndService from './pages/TermAndService';
import Home from './pages/Home';
import Login from './pages/Login';
import Payment from './pages/Payment';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';

// Protected Pages
import AdminBookings from './pages/admin/Bookings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPayouts from './pages/admin/Payouts';
import AdminProducts from './pages/admin/Products';
import AdminSettings from './pages/admin/Settings';
import PaymentSetting from './pages/admin/PaymentSetting';
import AdminUsers from './pages/admin/Users';
import AgentAddProduct from './pages/agent/AddProduct';
import AgentCommissions from './pages/agent/Commissions';
import AgentCustomerBookings from './pages/agent/CustomerBookings';
import AgentDashboard from './pages/agent/Dashboard';
import AgentProducts from './pages/agent/products/MyProducts';
import AgentVerification from './pages/agent/Verification';
import CustomerBookings from './pages/customer/Bookings';
import Register from './pages/Register';
import RegisterAgent from './pages/RegisterAgent';
import PrivacyPolicy from './pages/PrivacyPolicy';
import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import Career from './pages/Career';
import PressAndMedia from './pages/PressAndMedia';
import TravelBlog from './pages/TravelBlog';
import ProfileSetting from './pages/agent/ProfileSetting';
import CheckoutSummary from './pages/CheckoutSummary';
import BookingSuccess from './pages/BookingSucess';
import BookingFailed from './pages/BookingFailed';
import BookingPending from './pages/BookingPending';

// Route Guards
interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />; 
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout-summary" element={<CheckoutSummary />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/booking-pending" element={<BookingPending />} />
        <Route path="/booking-failed" element={<BookingFailed />} />
        <Route path="/ai-planner" element={<AITripPlanner />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/agent" element={<PublicOnlyRoute><RegisterAgent /></PublicOnlyRoute>} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/career" element={<Career />} />
        <Route path="/press-and-media" element={<PressAndMedia />} />
        <Route path="/travel-blog" element={<TravelBlog />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/terms-and-service" element={<TermAndService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Customer Protected Route - Nested in Public Layout for consistency */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <CustomerBookings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Dashboard Routes (Admin & Agent) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <DashboardLayout role={UserRole.ADMIN} />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="payouts" element={<AdminPayouts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="payment-settings" element={<PaymentSetting />} />
      </Route>

      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={[UserRole.AGENT]}>
            <DashboardLayout role={UserRole.AGENT} />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgentDashboard />} />
        <Route path="products" element={<AgentProducts />} />
        <Route path="products/new" element={<AgentAddProduct />} />
        <Route path="products/edit/:id" element={<AgentAddProduct />} />
        <Route path="customers" element={<AgentCustomerBookings />} />
        <Route path="commissions" element={<AgentCommissions />} />
        <Route path="verification" element={<AgentVerification />} />
        <Route path="profile/settings" element={<ProfileSetting />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
              <BrowserRouter>
                <ScrollToTop />
                <AppRoutes />
              </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;

import React, { useEffect } from 'react';
import {
  BrowserRouter, Navigate, Outlet, Route, Routes,
  useLocation, useNavigate, useParams
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './components/ToastContext';
import { WishlistProvider } from './components/WishlistContext';
import { UserRole } from './types';
import { CartProvider } from './components/CartContext';
import ChatbotWidget from './components/ChatbotWidget';
import { useTranslation } from 'react-i18next';

// ── Infrastructure ─────────────────────────────────────────────────────────
import { ErrorBoundary }   from './components/ErrorBoundary';
import { useOnlineStatus } from './hooks/useOnlineStatus';

// ── Layouts ────────────────────────────────────────────────────────────────
import DashboardLayout from './components/DashboardLayout';
import PublicLayout    from './components/PublicLayout';

// ── Error / status pages ───────────────────────────────────────────────────
import NotFound       from './pages/NotFound';
import Forbidden403   from './pages/Forbidden403';
import ServerError500 from './pages/ServerError500';
import OfflinePage    from './pages/OfflinePage';
import LegacyRedirect from './components/LegacyRedirect';

// ── i18n ───────────────────────────────────────────────────────────────────
import './src/i18n';
import { SUPPORTED_LANGS } from './src/i18n';

// ── Public Pages ───────────────────────────────────────────────────────────
import AITripPlanner     from './pages/AITripPlanner';
import Explore           from './pages/Explore';
import TermAndService    from './pages/TermAndService';
import Home              from './pages/Home';
import Login             from './pages/Login';
import Payment           from './pages/Payment';
import ProductDetail     from './pages/ProductDetail';
import Wishlist          from './pages/Wishlist';
import TrivPay           from './pages/TrivPay';
import VerifyEmail       from './pages/VerifyEmail';
import PaymentResult     from './pages/PaymentResult';
import PromoCampaignPage from './pages/PromoCampaignPage';

// ── Admin Pages ────────────────────────────────────────────────────────────
import AdminBookings        from './pages/admin/Bookings';
import AdminDashboard       from './pages/admin/Dashboard';
import AdminPayouts         from './pages/admin/Payouts';
import AdminProducts        from './pages/admin/Products';
import AdminSettings        from './pages/admin/Settings';
import PaymentSetting       from './pages/admin/PaymentSetting';
import AdminUsers           from './pages/admin/Users';
import AdminVouchers        from './pages/admin/AdminVouchers';
import AdminPromoCampaigns  from './pages/admin/AdminPromoCampaigns';
import AdminPromoAnalytics  from './pages/admin/AdminPromoAnalytics';
import AdminMembershipTiers from './pages/admin/AdminMembershipTiers';
import AdminReferralStats   from './pages/admin/AdminReferralStats';

// ── Agent Pages ────────────────────────────────────────────────────────────
import AgentAddProduct         from './pages/agent/AddProduct';
import AgentCommissions        from './pages/agent/Commissions';
import AgentCustomerBookings   from './pages/agent/CustomerBookings';
import AgentCustomerManagement from './pages/agent/CustomerManagement';
import AgentDashboard          from './pages/agent/Dashboard';
import AgentProducts           from './pages/agent/products/MyProducts';
import AgentVerification       from './pages/agent/Verification';
import ProfileSetting          from './pages/agent/ProfileSetting';
import AgentMarketing          from './pages/agent/AgentMarketing';
import AgentLoyalty            from './pages/agent/AgentLoyalty';
import AgentAPI                from './pages/agent/AgentAPI';
import AgentSupport            from './pages/agent/AgentSupport';
import AgentRating             from './pages/agent/AgentRating';
import AgentVouchers           from './pages/agent/AgentVouchers'; // ← tambah

// ── Customer Pages ─────────────────────────────────────────────────────────
import CustomerBookings        from './pages/customer/Bookings';
import CustomerBookingDetail   from './pages/customer/BookingDetail';
import CustomerProfileSettings from './pages/customer/ProfileSettings';
import LoyaltyPage             from './pages/customer/LoyaltyPage';
import RedeemPointPage         from './pages/customer/RedeemPointPage';
import MembershipPage          from './pages/customer/MembershipPage';
import MyCards                 from './pages/customer/MyCards';
import MyRefunds               from './pages/customer/MyRefunds';
import MyPriceAlerts           from './pages/customer/MyPriceAlerts';
import MyPassengers            from './pages/customer/MyPassengers';
import MyNotifications         from './pages/customer/MyNotifications';

// ── Misc Pages ─────────────────────────────────────────────────────────────
import Register        from './pages/Register';
import RegisterAgent   from './pages/RegisterAgent';
import PrivacyPolicy   from './pages/PrivacyPolicy';
import HelpCenter      from './pages/HelpCenter';
import ContactUs       from './pages/ContactUs';
import AboutUs         from './pages/AboutUs';
import Career          from './pages/Career';
import PressAndMedia   from './pages/PressAndMedia';
import TravelBlog      from './pages/TravelBlog';
import CheckoutSummary from './pages/CheckoutSummary';
import BookingSuccess  from './pages/BookingSucess';
import BookingFailed   from './pages/BookingFailed';
import BookingPending  from './pages/BookingPending';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';
import Sitemap         from './pages/SiteMap';

// ── Push Notifications ─────────────────────────────────────────────────────
import { usePushNotifications } from './hooks/usePushNotifications';

// ─────────────────────────────────────────────────────────────────────────────
// Route Guards
// ─────────────────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children:     React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location  = useLocation();
  const { lang }  = useParams<{ lang: string }>();
  const currentLang = lang ?? 'id';

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    return <Navigate
      to={`/${currentLang}/login`}
      replace
      state={{ from: location.pathname + location.search }}
    />;
  }

  if (!allowedRoles.includes(user.role)) return <Forbidden403 />;
  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const { lang } = useParams<{ lang: string }>();
  if (isLoading) return null;
  if (user) return <Navigate to={`/${lang ?? 'id'}`} replace />;
  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const ReferralCatcher = () => {
  const { search } = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(search);
    const ref = params.get('ref');
    if (ref && !localStorage.getItem('trivgoo_ref_code')) {
      localStorage.setItem('trivgoo_ref_code', ref.toUpperCase());
    }
  }, [search]);
  return null;
};

const AppGates: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();
  if (!isOnline) return <OfflinePage />;
  return <>{children}</>;
};

const LangBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang }  = useParams<{ lang: string }>();
  const { i18n }  = useTranslation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGS.includes(lang as any)) {
      i18n.changeLanguage(lang);
      document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('trivgoo_lang');
    if (saved && SUPPORTED_LANGS.includes(saved as any)) {
      navigate(`/${saved}`, { replace: true });
      return;
    }

    fetch('/api/v1/locale/detect')
      .then(r => r.json())
      .then(d => navigate(`/${d.lang ?? 'id'}`, { replace: true }))
      .catch(() => navigate('/id', { replace: true }));
  }, []);

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// AppRoutes
// ─────────────────────────────────────────────────────────────────────────────

const AppRoutes: React.FC = () => (
  <Routes>
    {/* ── Root redirect → geo-detect atau saved lang ── */}
    <Route path="/" element={<RootRedirect />} />
    <Route path="/payment/result" element={<PaymentResult />} />

    {/* ── Legacy fallback: lang-less paths → auto-detect & redirect ── */}
    <Route path="/verify-email"    element={<LegacyRedirect />} />
    <Route path="/reset-password"  element={<LegacyRedirect />} />
    <Route path="/login"           element={<LegacyRedirect />} />
    <Route path="/register"        element={<LegacyRedirect />} />
    <Route path="/forgot-password" element={<LegacyRedirect />} />
    <Route path="/my-bookings"     element={<LegacyRedirect />} />
    <Route path="/my-bookings/:id" element={<LegacyRedirect />} />
    <Route path="/agent/bookings"  element={<LegacyRedirect />} />

    {/* ── Semua route dibungkus /:lang ── */}
    <Route path="/:lang" element={<LangBootstrap><Outlet /></LangBootstrap>}>

      {/* ── Public ── */}
      <Route element={<PublicLayout />}>
        <Route index                       element={<Home />} />
        <Route path="explore"              element={<Explore />} />
        <Route path="product/:id"          element={<ProductDetail />} />
        <Route path="product/:id/:slug"    element={<ProductDetail />} />
        <Route path="checkout-summary"     element={<CheckoutSummary />} />
        <Route path="booking-success"      element={<BookingSuccess />} />
        <Route path="booking-pending"      element={<BookingPending />} />
        <Route path="booking-failed"       element={<BookingFailed />} />
        <Route path="ai-planner"           element={<AITripPlanner />} />
        <Route path="login"                element={<Login />} />
        <Route path="register"             element={<Register />} />
        <Route path="trivpay"              element={<TrivPay />} />
        <Route path="verify-email"         element={<VerifyEmail />} />
        <Route path="payment/result"       element={<PaymentResult />} />
        <Route path="wishlist"             element={<Wishlist />} />
        <Route path="promo/campaign/:id"   element={<PromoCampaignPage />} />
        <Route path="about-us"             element={<AboutUs />} />
        <Route path="career"               element={<Career />} />
        <Route path="press-and-media"      element={<PressAndMedia />} />
        <Route path="travel-blog"          element={<TravelBlog />} />
        <Route path="help-center"          element={<HelpCenter />} />
        <Route path="terms-and-service"    element={<TermAndService />} />
        <Route path="privacy-policy"       element={<PrivacyPolicy />} />
        <Route path="contact-us"           element={<ContactUs />} />
        <Route path="sitemap"              element={<Sitemap />} />

        <Route path="register/agent"  element={<PublicOnlyRoute><RegisterAgent /></PublicOnlyRoute>} />
        <Route path="forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="reset-password"  element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

        {/* Customer protected */}
        <Route path="payment"            element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><Payment /></ProtectedRoute>} />
        <Route path="my-bookings"        element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><CustomerBookings /></ProtectedRoute>} />
        <Route path="my-bookings/:id"    element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><CustomerBookingDetail /></ProtectedRoute>} />
        <Route path="my-account"         element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><CustomerProfileSettings /></ProtectedRoute>} />
        <Route path="loyalty"            element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><LoyaltyPage /></ProtectedRoute>} />
        <Route path="loyalty/redeem"     element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><RedeemPointPage /></ProtectedRoute>} />
        <Route path="loyalty/membership" element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><MembershipPage /></ProtectedRoute>} />
        <Route path="my-cards"           element={<MyCards />} />
        <Route path="my-refunds"         element={<MyRefunds />} />
        <Route path="my-price-alerts"    element={<MyPriceAlerts />} />
        <Route path="my-passengers"      element={<MyPassengers />} />
        <Route path="my-notifications"   element={<MyNotifications />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ── Admin ── */}
      <Route path="admin" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><DashboardLayout role={UserRole.ADMIN} /></ProtectedRoute>}>
        <Route index                    element={<AdminDashboard />} />
        <Route path="bookings"          element={<AdminBookings />} />
        <Route path="products"          element={<AdminProducts />} />
        <Route path="payouts"           element={<AdminPayouts />} />
        <Route path="users"             element={<AdminUsers />} />
        <Route path="settings"          element={<AdminSettings />} />
        <Route path="payment-settings"  element={<PaymentSetting />} />
        <Route path="vouchers"          element={<AdminVouchers />} />
        <Route path="promo/campaigns"   element={<AdminPromoCampaigns />} />
        <Route path="promo/analytics"   element={<AdminPromoAnalytics />} />
        <Route path="membership/tiers"  element={<AdminMembershipTiers />} />
        <Route path="referral/stats"    element={<AdminReferralStats />} />
      </Route>

      {/* ── Agent ── */}
      <Route path="agent" element={<ProtectedRoute allowedRoles={[UserRole.AGENT]}><DashboardLayout role={UserRole.AGENT} /></ProtectedRoute>}>
        <Route index                      element={<AgentDashboard />} />
        <Route path="products"            element={<AgentProducts />} />
        <Route path="products/new"        element={<AgentAddProduct />} />
        <Route path="products/edit/:id"   element={<AgentAddProduct />} />
        <Route path="bookings"            element={<AgentCustomerBookings />} />
        <Route path="customers"           element={<AgentCustomerManagement />} />
        <Route path="commissions"         element={<AgentCommissions />} />
        <Route path="verification"        element={<AgentVerification />} />
        <Route path="profile/settings"    element={<ProfileSetting />} />
        <Route path="marketing"           element={<AgentMarketing />} />
        <Route path="vouchers"            element={<AgentVouchers />} /> {/* ← tambah */}
        <Route path="loyalty"             element={<AgentLoyalty />} />
        <Route path="api"                 element={<AgentAPI />} />
        <Route path="support"             element={<AgentSupport />} />
        <Route path="rating"              element={<AgentRating />} />
      </Route>

    </Route>
  </Routes>
);

// ─────────────────────────────────────────────────────────────────────────────
// Push Notifications
// ─────────────────────────────────────────────────────────────────────────────

const PushNotificationSync = () => {
  usePushNotifications();
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────────────────────────────────────

const App: React.FC = () => (
  <HelmetProvider>
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <ScrollToTop />
              <ReferralCatcher />
              <PushNotificationSync />
              <AppGates>
                <ErrorBoundary>
                  <AppRoutes />
                  <ChatbotWidget />
                </ErrorBoundary>
              </AppGates>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  </HelmetProvider>
);

export default App;

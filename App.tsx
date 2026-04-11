import React, { useEffect, lazy, Suspense } from 'react';
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
import { authService } from './services/authService';

import { ErrorBoundary }   from './components/ErrorBoundary';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import DashboardLayout from './components/DashboardLayout';
import PublicLayout    from './components/PublicLayout';

import NotFound       from './pages/NotFound';
import Forbidden403   from './pages/Forbidden403';
import ServerError500 from './pages/ServerError500';
import OfflinePage    from './pages/OfflinePage';
import LegacyRedirect from './components/LegacyRedirect';

import './src/i18n';
import { SUPPORTED_LANGS, changeLanguage } from './src/i18n';
import { ROUTE_SLUGS, SLUG_TO_CANONICAL } from './src/i18n/slugs';
import type { SupportedLang } from './src/i18n';

import { CookieConsent } from './components/CookieConsent';

import { usePushNotifications } from './hooks/usePushNotifications';

// ─────────────────────────────────────────────────────────────────────────────
// Lazy imports — setiap halaman jadi chunk terpisah
// Browser hanya download halaman yang dikunjungi
// ─────────────────────────────────────────────────────────────────────────────

// Public pages
const Home              = lazy(() => import('./pages/Home'));
const Explore           = lazy(() => import('./pages/Explore'));
const ProductDetail     = lazy(() => import('./pages/ProductDetail'));
const AITripPlanner     = lazy(() => import('./pages/AITripPlanner'));
const Login             = lazy(() => import('./pages/Login'));
const Register          = lazy(() => import('./pages/Register'));
const RegisterAgent     = lazy(() => import('./pages/RegisterAgent'));
const ForgotPassword    = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword     = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail       = lazy(() => import('./pages/VerifyEmail'));
const Payment           = lazy(() => import('./pages/Payment'));
const CheckoutSummary   = lazy(() => import('./pages/CheckoutSummary'));
const BookingSuccess    = lazy(() => import('./pages/BookingSucess'));
const BookingFailed     = lazy(() => import('./pages/BookingFailed'));
const BookingPending    = lazy(() => import('./pages/BookingPending'));
const PaymentResult     = lazy(() => import('./pages/PaymentResult'));
const TrivPay           = lazy(() => import('./pages/TrivPay'));
const Wishlist          = lazy(() => import('./pages/Wishlist'));
const PromoCampaignPage = lazy(() => import('./pages/PromoCampaignPage'));
const TermAndService    = lazy(() => import('./pages/TermAndService'));
const PrivacyPolicy     = lazy(() => import('./pages/PrivacyPolicy'));
const AboutUs           = lazy(() => import('./pages/AboutUs'));
const Career            = lazy(() => import('./pages/Career'));
const PressAndMedia     = lazy(() => import('./pages/PressAndMedia'));
const TravelBlog        = lazy(() => import('./pages/TravelBlog'));
const HelpCenter        = lazy(() => import('./pages/HelpCenter'));
const ContactUs         = lazy(() => import('./pages/ContactUs'));
const Cart              = lazy(() => import('./pages/Cart'));

// Customer pages
const CustomerBookings        = lazy(() => import('./pages/customer/Bookings'));
const CustomerBookingDetail   = lazy(() => import('./pages/customer/BookingDetail'));
const CustomerProfileSettings = lazy(() => import('./pages/customer/ProfileSettings'));
const LoyaltyPage             = lazy(() => import('./pages/customer/LoyaltyPage'));
const RedeemPointPage         = lazy(() => import('./pages/customer/RedeemPointPage'));
const MembershipPage          = lazy(() => import('./pages/customer/MembershipPage'));
const MyCards                 = lazy(() => import('./pages/customer/MyCards'));
const MyRefunds               = lazy(() => import('./pages/customer/MyRefunds'));
const MyPriceAlerts           = lazy(() => import('./pages/customer/MyPriceAlerts'));
const MyPassengers            = lazy(() => import('./pages/customer/MyPassengers'));
const MyNotifications         = lazy(() => import('./pages/customer/MyNotifications'));
const SavedItineraries        = lazy(() => import('./pages/customer/SavedItineraries'));
const SharedItinerary         = lazy(() => import('./pages/SharedItinerary'));

// Admin pages
const AdminDashboard       = lazy(() => import('./pages/admin/Dashboard'));
const AdminBookings        = lazy(() => import('./pages/admin/Bookings'));
const AdminProducts        = lazy(() => import('./pages/admin/Products'));
const AdminPayouts         = lazy(() => import('./pages/admin/Payouts'));
const AdminUsers           = lazy(() => import('./pages/admin/Users'));
const AdminSettings        = lazy(() => import('./pages/admin/Settings'));
const PaymentSetting       = lazy(() => import('./pages/admin/PaymentSetting'));
const AdminVouchers        = lazy(() => import('./pages/admin/AdminVouchers'));
const AdminPromoCampaigns  = lazy(() => import('./pages/admin/AdminPromoCampaigns'));
const AdminPromoAnalytics  = lazy(() => import('./pages/admin/AdminPromoAnalytics'));
const AdminMembershipTiers = lazy(() => import('./pages/admin/AdminMembershipTiers'));
const AdminReferralStats   = lazy(() => import('./pages/admin/AdminReferralStats'));

// Agent pages
const AgentDashboard           = lazy(() => import('./pages/agent/Dashboard'));
const AgentAddProduct          = lazy(() => import('./pages/agent/AddProduct'));
const AgentCommissions         = lazy(() => import('./pages/agent/Commissions'));
const AgentCustomerBookings    = lazy(() => import('./pages/agent/CustomerBookings'));
const AgentCustomerManagement  = lazy(() => import('./pages/agent/CustomerManagement'));
const AgentProducts            = lazy(() => import('./pages/agent/products/MyProducts'));
const AgentVerification        = lazy(() => import('./pages/agent/Verification'));
const ProfileSetting           = lazy(() => import('./pages/agent/ProfileSetting'));
const AgentMarketing           = lazy(() => import('./pages/agent/AgentMarketing'));
const AgentLoyalty             = lazy(() => import('./pages/agent/AgentLoyalty'));
const AgentAPI                 = lazy(() => import('./pages/agent/AgentAPI'));
const AgentSupport             = lazy(() => import('./pages/agent/AgentSupport'));
const AgentRating              = lazy(() => import('./pages/agent/AgentRating'));
const AgentVouchers            = lazy(() => import('./pages/agent/AgentVouchers'));

// ─────────────────────────────────────────────────────────────────────────────
// Loading fallback — spinner ringan, tidak load library apapun
// ─────────────────────────────────────────────────────────────────────────────

const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Generate all localized category slugs for routing
// ─────────────────────────────────────────────────────────────────────────────

const ALL_CATEGORY_SLUGS = [
  ...new Set(
    Object.values(ROUTE_SLUGS).flatMap(slugMap =>
      Object.values(slugMap)
    )
  )
].filter(s => s !== 'explore');

// ─────────────────────────────────────────────────────────────────────────────
// Route Guards
// ─────────────────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children:     React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang ?? 'id';

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <Navigate
      to={`/${currentLang}/login`}
      replace
      state={{ from: location.pathname + location.search }}
    />
  );

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
      const code = ref.toUpperCase();
      localStorage.setItem('trivgoo_ref_code', code);
      authService.trackReferralClick(code).catch(() => {});
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
  const { lang } = useParams<{ lang: string }>();

  useEffect(() => {
    if (lang && SUPPORTED_LANGS.includes(lang as SupportedLang)) {
      // Gunakan changeLanguage dari i18n — lazy load otomatis
      changeLanguage(lang as SupportedLang);
    }
  }, [lang]);

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('trivgoo_lang');
    if (saved && SUPPORTED_LANGS.includes(saved as SupportedLang)) {
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
// AppRoutes — dibungkus Suspense untuk lazy loading
// ─────────────────────────────────────────────────────────────────────────────

const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/payment/result" element={<PaymentResult />} />

      {/* Legacy redirects */}
      <Route path="/verify-email"    element={<LegacyRedirect />} />
      <Route path="/reset-password"  element={<LegacyRedirect />} />
      <Route path="/login"           element={<LegacyRedirect />} />
      <Route path="/register"        element={<LegacyRedirect />} />
      <Route path="/forgot-password" element={<LegacyRedirect />} />
      <Route path="/my-bookings"     element={<LegacyRedirect />} />
      <Route path="/my-bookings/:id" element={<LegacyRedirect />} />
      <Route path="/agent/bookings"  element={<LegacyRedirect />} />

      {/* All lang-prefixed routes */}
      <Route path="/:lang" element={<LangBootstrap><Outlet /></LangBootstrap>}>

        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />

          <Route path="explore" element={<Explore />} />
          {ALL_CATEGORY_SLUGS.map(slug => (
            <Route key={slug} path={`explore/${slug}`} element={<Explore />} />
          ))}
          <Route path="explore/:categorySlug" element={<Explore />} />

          <Route path="product/:id"          element={<ProductDetail />} />
          <Route path="product/:id/:slug"    element={<ProductDetail />} />
          <Route path="checkout-summary"     element={<CheckoutSummary />} />
          <Route path="booking-success"      element={<BookingSuccess />} />
          <Route path="booking-pending"      element={<BookingPending />} />
          <Route path="booking-failed"       element={<BookingFailed />} />
          <Route path="ai-planner"           element={<AITripPlanner />} />
          <Route path="itinerary/share/:token" element={<SharedItinerary />} />
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
          <Route path="cart"                 element={<Cart />} />

          <Route path="register/agent"  element={<PublicOnlyRoute><RegisterAgent /></PublicOnlyRoute>} />
          <Route path="forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="reset-password"  element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

          <Route path="payment"            element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><Payment /></ProtectedRoute>} />
          <Route path="my-bookings"        element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><CustomerBookings /></ProtectedRoute>} />
          <Route path="my-bookings/:id"    element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><CustomerBookingDetail /></ProtectedRoute>} />
          <Route path="my-itineraries"     element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><SavedItineraries /></ProtectedRoute>} />
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

        {/* Admin */}
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

        {/* Agent */}
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
          <Route path="vouchers"            element={<AgentVouchers />} />
          <Route path="loyalty"             element={<AgentLoyalty />} />
          <Route path="api"                 element={<AgentAPI />} />
          <Route path="support"             element={<AgentSupport />} />
          <Route path="rating"              element={<AgentRating />} />
        </Route>

      </Route>
    </Routes>
  </Suspense>
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
                  <CookieConsent googleAnalyticsId="G-TY8LCPZFSB" />
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

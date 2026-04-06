import {
  BarChart2, Code2, CreditCard, DollarSign, LayoutDashboard,
  LifeBuoy, LogOut, Megaphone, Menu, Package, PlusCircle,
  Settings, ShieldCheck, ShoppingBag, Star, Tag, UserCheck,
  Users, X, Wallet2, Gift, Award, Share2, LineChart,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authService } from '../services/authService';
import { UserRole, VerificationStatus } from '../types';
import UserAvatar from './UserAvatar';
import { useLangNavigate } from '../src/hooks/useLangNavigate';

interface DashboardLayoutProps {
  role: UserRole;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { langPath, langNavigate } = useLangNavigate();
  const didFetchMeRef = useRef(false);

  const handleLogout = () => {
    logout();
    langNavigate('/login');
  };

  // isActive: bandingkan pathname saat ini dengan langPath dari canonical path
  const isActive = (canonicalPath: string) =>
    location.pathname === langPath(canonicalPath);

  // NavItem menerima canonical path (e.g. '/agent/dashboard')
  // langPath di dalam hook sudah handle prefixing + skip slug translation untuk /agent & /admin
  const NavItem = ({
    to, icon: Icon, label,
  }: { to: string; icon: any; label: string }) => {
    const fullPath = langPath(to);
    const active = location.pathname === fullPath;
    return (
      <Link
        to={fullPath}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
          active
            ? 'bg-primary-50 text-primary-700 font-bold'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
        {label}
      </Link>
    );
  };

  const NavSectionLabel = ({ label }: { label: string }) => (
    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-1">
      {label}
    </div>
  );

  useEffect(() => {
    if (didFetchMeRef.current) return;
    didFetchMeRef.current = true;
    (async () => {
      try {
        const me = await authService.me();
        updateUser({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          avatar: me.avatar,
          specialization: me.specialization ?? null,
          verification_status: me.verification_status,
        });
      } catch (err: any) {
        if (err?.response?.status === 401) logout();
      }
    })();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <Link to={langPath('/')} className="flex items-center">
            <img src="/inline_trp.png" alt="Trivgoo Logo" className="h-10 w-auto" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-500 p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

          {/* ── ADMIN ── */}
          {role === UserRole.ADMIN && (
            <>
              <NavSectionLabel label="Overview" />
              <NavItem to="/admin"                   icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/admin/bookings"          icon={BarChart2}       label="Bookings" />

              <NavSectionLabel label="Catalog" />
              <NavItem to="/admin/products"          icon={Package}         label="Products" />
              <NavItem to="/admin/users"             icon={Users}           label="Users & Verification" />
              <NavItem to="/admin/payouts"           icon={CreditCard}      label="Payout Requests" />

              <NavSectionLabel label="Promo & Voucher" />
              <NavItem to="/admin/vouchers"          icon={Gift}            label="Vouchers" />
              <NavItem to="/admin/promo/campaigns"   icon={Megaphone}       label="Promo Campaign" />
              <NavItem to="/admin/promo/analytics"   icon={LineChart}       label="Promo Analytics" />

              <NavSectionLabel label="Loyalty" />
              <NavItem to="/admin/membership/tiers"  icon={Award}           label="Membership Tiers" />
              <NavItem to="/admin/referral/stats"    icon={Share2}          label="Referral Stats" />

              <NavSectionLabel label="Config" />
              <NavItem to="/admin/settings"          icon={Settings}        label="Settings" />
              <NavItem to="/admin/payment-settings"  icon={Wallet2}         label="Payment Settings" />
            </>
          )}

          {/* ── AGENT ── */}
          {role === UserRole.AGENT && (
            <>
              <NavSectionLabel label="Overview" />
              <NavItem to="/agent"                   icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/agent/commissions"       icon={DollarSign}      label="Commissions" />
              <NavItem to="/agent/bookings"          icon={UserCheck}       label="Customer Bookings" />
              <NavItem to="/agent/customers"         icon={Users}           label="Customer Management" />

              <NavSectionLabel label="Management" />
              {user?.verification_status !== VerificationStatus.VERIFIED && (
                <NavItem to="/agent/verification"    icon={ShieldCheck}     label="Verify Account" />
              )}
              <NavItem to="/agent/products"          icon={ShoppingBag}     label="My Products" />
              <NavItem to="/agent/products/new"      icon={PlusCircle}      label="Add Product" />
              <NavItem to="/agent/profile/settings"  icon={Settings}        label="Profile Settings" />

              <NavSectionLabel label="Grow & Quality" />
              <NavItem to="/agent/marketing"         icon={Megaphone}       label="Marketing Tools" />
              <NavItem to="/agent/vouchers"          icon={Tag}             label="My Vouchers" />
              <NavItem to="/agent/loyalty"           icon={Award}           label="Loyalty & Member" />
              <NavItem to="/agent/rating"            icon={Star}            label="Rating & Review" />

              <NavSectionLabel label="Developer" />
              <NavItem to="/agent/api"               icon={Code2}           label="API & Integrasi" />

              <NavSectionLabel label="Bantuan" />
              <NavItem to="/agent/support"           icon={LifeBuoy}        label="Support & Training" />
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center mb-4 px-2">
            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
              <UserAvatar user={user} className="w-8 h-8" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </span>
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 text-sm font-bold rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors active:scale-95"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-4 text-gray-500 lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-gray-800 truncate">
              {role === UserRole.ADMIN ? 'Admin Portal' : 'Agent Portal'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to={langPath('/')} className="text-xs lg:text-sm text-primary-600 hover:underline">
              View Live Site
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
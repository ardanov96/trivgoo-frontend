import {
  BarChart2,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authService } from '../services/authService';
import { UserRole, VerificationStatus } from '../types';

interface DashboardLayoutProps {
  role: UserRole;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const didFetchMeRef = useRef(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: any) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        isActive(to)
          ? 'bg-primary-50 text-primary-700 font-bold'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive(to) ? 'text-primary-600' : 'text-gray-400'}`} />
      {label}
    </Link>
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
        const status = err?.response?.status;
        if (status === 401) logout();
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
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <Link to="/" className="text-2xl font-serif font-bold text-gray-900">
            trivgoo<span className="text-primary-500">.</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-500 p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {role === UserRole.ADMIN && (
            <>
              <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/admin/bookings" icon={BarChart2} label="Bookings" />
              <NavItem to="/admin/products" icon={Package} label="Products" />
              <NavItem to="/admin/users" icon={Users} label="Users & Verification" />
              <NavItem to="/admin/payouts" icon={CreditCard} label="Payout Requests" />
              <NavItem to="/admin/settings" icon={Settings} label="Settings" />
            </>
          )}

          {role === UserRole.AGENT && (
            <>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Overview
              </div>
              <NavItem to="/agent" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/agent/commissions" icon={DollarSign} label="Commissions" />
              <NavItem to="/agent/customers" icon={UserCheck} label="Customer List" />

              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-6">
                Management
              </div>
              {user?.verification_status !== VerificationStatus.VERIFIED && (
                <NavItem to="/agent/verification" icon={ShieldCheck} label="Verify Account" />
              )}

              <NavItem to="/agent/products" icon={ShoppingBag} label="My Products" />
              <NavItem to="/agent/products/new" icon={PlusCircle} label="Add Product" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3 flex-shrink-0">
              <img
                src={user.avatar || '/avatar.png'}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
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
            <Link to="/" className="text-xs lg:text-sm text-primary-600 hover:underline">
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

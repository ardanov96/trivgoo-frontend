import {
  ArrowRight, CheckCircle, Circle, Clock, DollarSign,
  Info, Lock, Package, TrendingDown, TrendingUp, Users,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../AuthContext';
import { authService } from '../../services/authService';
import { VerificationStatus } from '../../types';
import http from '../../services/http';
import { useLangNavigate } from '../../src/hooks/useLangNavigate';
import AgentAIAnalytics from './AgentAIAnalytics';
import AgentKnowledgeBase from './AgentKnowledgeBase';

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500 mb-1 truncate">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color} ml-3 shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

interface DashboardStats {
  total_commission:    number;
  bookings_this_month: number;
  active_customers:    number;
  total_products:      number;
  gross_revenue:       number;
  total_platform_fee:  number;
  earnings_this_month: number;
  total_bookings:      number;
  pending_bookings:    number;
  confirmed_bookings:  number;
  cancelled_bookings:  number;
  commission_rate:     number;
}

interface WeeklySales {
  name:         string;
  sales:        number;
  total_orders?: number;
}

const AgentDashboard: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // ✅ Gunakan useLangNavigate — tidak perlu useParams lang lagi
  const { langPath } = useLangNavigate();

  const [stats,       setStats]       = useState<DashboardStats | null>(null);
  const [weeklySales, setWeeklySales] = useState<WeeklySales[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);

  const lastFetchedLocationKeyRef = useRef<string | null>(null);

  // Sync user dari server setiap kali location.key berubah
  useEffect(() => {
    if (lastFetchedLocationKeyRef.current === location.key) return;
    lastFetchedLocationKeyRef.current = location.key;

    let cancelled = false;
    (async () => {
      try {
        const me = await authService.me();
        if (cancelled) return;
        updateUser({
          id:                  me.id,
          name:                me.name,
          email:               me.email,
          role:                me.role,
          avatar:              me.avatar,
          specialization:      me.specialization ?? null,
          verification_status: me.verification_status,
        });
      } catch (err: any) {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          logout();
          // ✅ langPath sudah handle lang prefix — tidak ada double prefix
          navigate(langPath('/login'), { replace: true });
        }
      }
    })();

    return () => { cancelled = true; };
  }, [location.key, updateUser, logout, navigate, langPath]);

  // Fetch dashboard stats
  useEffect(() => {
    if (user?.verification_status !== VerificationStatus.VERIFIED) {
      setIsLoading(false);
      return;
    }
    (async () => {
      setIsLoading(true);
      try {
        const [statsRes, salesRes] = await Promise.all([
          http.get('/agent/dashboard/stats'),
          http.get('/agent/dashboard/weekly-sales'),
        ]);
        if (!statsRes.data?.error)  setStats(statsRes.data.data);
        if (!salesRes.data?.error)  setWeeklySales(salesRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.verification_status]);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount);

  const isVerified   = user?.verification_status === VerificationStatus.VERIFIED;
  const isPending    = user?.verification_status === VerificationStatus.PENDING;
  const isWaitingDoc = user?.verification_status === VerificationStatus.WAITING_DOCUMENT;

  const steps = [
    {
      title:       'Create Account',
      description: 'Sign up as an agent',
      status:      'completed' as const,
      icon:        CheckCircle,
    },
    {
      title:       'Verify Business',
      description: isWaitingDoc ? 'Submit ID & Bank details' : 'Documents under review',
      status:      isWaitingDoc
        ? 'current'
        : isPending
          ? 'pending'
          : isVerified ? 'completed' : 'locked',
      actionLabel: isPending ? 'Under Review' : 'Verify Now',
      // ✅ langPath('/agent/verification') → '/en/agent/verification' — no double prefix
      actionLink:  langPath('/agent/verification'),
      icon:        (isVerified ? CheckCircle : isPending ? Clock : Circle) as React.ElementType,
    },
    {
      title:       'Add First Product',
      description: 'List your first service',
      status:      isVerified ? 'current' : 'locked',
      actionLabel: 'Add Product',
      // ✅ same here
      actionLink:  langPath('/agent/products/new'),
      icon:        (isVerified ? Circle : Lock) as React.ElementType,
    },
  ];

  const commissionRate = stats?.commission_rate ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name ?? '...'}</h2>
        <p className="text-gray-500">Here is your sales performance overview.</p>
      </div>

      {/* Onboarding steps */}
      {!isVerified && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary-600 px-6 py-4">
            <h3 className="text-white font-bold text-lg">🚀 Let's get you set up!</h3>
            <p className="text-primary-100 text-sm">Complete these steps to start earning.</p>
          </div>
          <div className="p-6">
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 hidden md:block transform -translate-y-1/2" />
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex flex-row md:flex-col items-center gap-4 md:gap-0 md:text-center w-full md:w-1/3 bg-white md:bg-transparent p-2 md:p-0 rounded-lg ${
                    step.status === 'locked' ? 'opacity-50' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 z-10
                    ${step.status === 'completed' ? 'bg-green-500 text-white'
                      : step.status === 'pending'   ? 'bg-amber-500 text-white'
                      : step.status === 'current'   ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-400'}`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 md:mt-3">
                    <h4 className={`text-sm font-bold ${step.status === 'current' ? 'text-primary-700' : 'text-gray-900'}`}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">{step.description}</p>
                    {step.status !== 'completed' && step.status !== 'locked' && step.actionLabel && (
                      <button
                        onClick={() => navigate(step.actionLink || '#')}
                        disabled={step.status === 'pending'}
                        className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors inline-flex items-center
                          ${step.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 cursor-default'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'}`}
                      >
                        {step.actionLabel}
                        {step.status !== 'pending' && <ArrowRight className="w-3 h-3 ml-1" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Platform fee banner */}
      {isVerified && !isLoading && stats && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-amber-700">
            Platform fee sebesar <span className="font-bold">{commissionRate}%</span> dipotong dari setiap transaksi berhasil.
            Semua angka di bawah sudah menampilkan <span className="font-bold">net earnings</span> setelah pemotongan.
          </span>
        </div>
      )}

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${!isVerified ? 'filter blur-[2px] opacity-70 pointer-events-none select-none' : ''}`}>
          <StatCard title="Net Earnings (Total)"   value={formatIDR(stats?.total_commission || 0)}    icon={DollarSign}  color="bg-green-500"  subtitle={commissionRate > 0 ? `Setelah fee ${commissionRate}%` : undefined} />
          <StatCard title="Bookings This Month"    value={stats?.bookings_this_month || 0}            icon={TrendingUp}  color="bg-blue-500"   subtitle={stats?.earnings_this_month ? `${formatIDR(stats.earnings_this_month)} bulan ini` : undefined} />
          <StatCard title="Active Customers"       value={stats?.active_customers || 0}              icon={Users}       color="bg-indigo-500" />
          <StatCard title="Total Products"         value={stats?.total_products || 0}                icon={Package}     color="bg-purple-500" />
        </div>
      )}

      {/* Earnings breakdown */}
      {isVerified && !isLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Gross Revenue</p>
            <p className="text-xl font-bold text-gray-800">{formatIDR(stats.gross_revenue)}</p>
            <p className="text-xs text-gray-400 mt-1">Total sebelum dipotong fee</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-100 shadow-sm p-5">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Platform Fee ({commissionRate}%)
            </p>
            <p className="text-xl font-bold text-red-600">- {formatIDR(stats.total_platform_fee)}</p>
            <p className="text-xs text-red-400 mt-1">Dipotong oleh platform</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-100 shadow-sm p-5">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Net Earnings
            </p>
            <p className="text-xl font-bold text-green-700">{formatIDR(stats.total_commission)}</p>
            <p className="text-xs text-green-500 mt-1">Yang masuk ke kantong kamu</p>
          </div>
        </div>
      )}

      {/* Weekly Sales Chart */}
      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${!isVerified ? 'filter blur-[2px] opacity-70 pointer-events-none select-none' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Weekly Net Earnings</h3>
          {isVerified && !isLoading && commissionRate > 0 && (
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              Setelah fee {commissionRate}%
            </span>
          )}
        </div>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => formatIDR(val)} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    formatIDR(value),
                    name === 'sales' ? 'Net Earnings' : name,
                  ]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      

      {/* AI Planner Analytics — hanya tampil jika verified */}
      {isVerified && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <AgentAIAnalytics />
        </div>
      )}

      {isVerified && (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <AgentKnowledgeBase />
        </div>
      )}

      </div>
    </div>
  );
};

export default AgentDashboard;
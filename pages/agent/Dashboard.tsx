import {
  ArrowRight,
  CheckCircle,
  Circle,
  Clock,
  DollarSign,
  Lock,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../AuthContext';
import { authService } from '../../services/authService';
import { VerificationStatus } from '../../types';

const data = [
  { name: 'Mon', sales: 400 },
  { name: 'Tue', sales: 300 },
  { name: 'Wed', sales: 200 },
  { name: 'Thu', sales: 278 },
  { name: 'Fri', sales: 189 },
  { name: 'Sat', sales: 239 },
  { name: 'Sun', sales: 349 },
];

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  color: string; // tailwind class
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const AgentDashboard: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ biar ga double-call di React 18 Strict Mode + bisa refresh tiap navigasi
  const lastFetchedLocationKeyRef = useRef<string | null>(null);

  // ✅ AUTO REFRESH USER dari session (Redis) saat page mount / navigasi berubah
  useEffect(() => {
    if (lastFetchedLocationKeyRef.current === location.key) return;
    lastFetchedLocationKeyRef.current = location.key;

    let cancelled = false;

    (async () => {
      try {
        const me = await authService.me();
        if (cancelled) return;

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
        if (cancelled) return;

        const status = err?.response?.status;
        if (status === 401) {
          logout();
          navigate('/login', { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.key, updateUser, logout, navigate]);

  const isVerified = user?.verification_status === VerificationStatus.VERIFIED;
  const isPending = user?.verification_status === VerificationStatus.PENDING;

  const steps = [
    {
      title: 'Create Account',
      description: 'Sign up as an agent',
      status: 'completed' as const,
      icon: CheckCircle,
    },
    {
      title: 'Verify Business',
      description: 'Submit ID & Bank details',
      status: '',
      actionLabel: isPending ? 'Under Review' : 'Verify Now',
      actionLink: '/agent/verification',
      icon: (isVerified ? CheckCircle : isPending ? Clock : Circle) as React.ElementType,
    },
    {
      title: 'Add First Product',
      description: 'List your first service',
      status: '',
      actionLabel: 'Add Product',
      actionLink: '/agent/products/new',
      icon: (isVerified ? Circle : Lock) as React.ElementType,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name ?? '...'}</h2>
        <p className="text-gray-500">Here is your sales performance overview.</p>
      </div>

      {/* Onboarding Progress Card */}
      {!isVerified && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary-600 px-6 py-4">
            <h3 className="text-white font-bold text-lg flex items-center">
              🚀 Let's get you set up!
            </h3>
            <p className="text-primary-100 text-sm">Complete these steps to start earning.</p>
          </div>

          <div className="p-6">
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
              {/* Connector Line (Desktop) */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 hidden md:block transform -translate-y-1/2" />

              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex flex-row md:flex-col items-center gap-4 md:gap-0 md:text-center w-full md:w-1/3 bg-white md:bg-transparent p-2 md:p-0 rounded-lg ${
                    step.status === 'locked' ? 'opacity-50' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 z-10
                      ${
                        step.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : step.status === 'pending'
                          ? 'bg-amber-500 text-white'
                          : step.status === 'current'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 md:mt-3">
                    <h4
                      className={`text-sm font-bold ${
                        step.status === 'current' ? 'text-primary-700' : 'text-gray-900'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">{step.description}</p>

                    {step.status !== 'completed' &&
                      step.status !== 'locked' &&
                      step.actionLabel && (
                        <button
                          onClick={() => navigate(step.actionLink || '#')}
                          disabled={step.status === 'pending'}
                          className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors inline-flex items-center
                          ${
                            step.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 cursor-default'
                              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                          }`}
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

      {/* Stats Grid - Blurred if unverified to tease features */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
          !isVerified ? 'filter blur-[2px] opacity-70 pointer-events-none select-none' : ''
        }`}
      >
        <StatCard title="Total Commission" value={`${0}`} icon={DollarSign} color="bg-green-500" />
        <StatCard title="Bookings This Month" value="24" icon={TrendingUp} color="bg-blue-500" />
        <StatCard title="Active Customers" value="156" icon={Users} color="bg-indigo-500" />
      </div>

      <div
        className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${
          !isVerified ? 'filter blur-[2px] opacity-70 pointer-events-none select-none' : ''
        }`}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Sales Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;

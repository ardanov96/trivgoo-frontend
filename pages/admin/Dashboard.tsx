import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  PackageCheck,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Booking, BookingStatus } from '../../types';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterRange, setFilterRange] = useState<'all' | '7days' | 'month' | 'year'>('all');

  // Fetch data saat component mount dan saat filterRange berubah
  useEffect(() => {
    fetchDashboardData();
  }, [filterRange]); // Dependency: filterRange

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setSummary(null);

    try {
      // Fetch bookings untuk chart dan table
      // Fetch summary dengan parameter range
      const [bookingsResponse, summaryResponse] = await Promise.all([
        axios.get('/api/v1/admin/bookings', { withCredentials: true }),
        axios.get(`/api/v1/admin/dashboard/summary?range=${filterRange}`, { withCredentials: true })
      ]);

      // Set bookings
      if (!bookingsResponse.data?.error && Array.isArray(bookingsResponse.data.data)) {
        const allBookings = bookingsResponse.data.data;
        setBookings(allBookings);
        
        // Generate chart data berdasarkan range
        generateChartData(allBookings, filterRange);
      }

      // Set summary (sudah terfilter dari backend)
      if (!summaryResponse.data?.error) {
        setSummary(summaryResponse.data.data);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const generateChartData = (allBookings: Booking[], range: 'all' | '7days' | 'month' | 'year') => {
  const chartDataArray = [];
  const today = new Date();
  
  // Ambil hanya yang COMPLETED
  const completedBookings = allBookings.filter(b => 
    String(b.status).toUpperCase() === 'COMPLETED'
  );

  console.log("Total Bookings Completed:", completedBookings.length);

  if (range === 'year') {
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = targetDate.toLocaleString('en-US', { month: 'short' });
      const m = targetDate.getMonth();
      const y = targetDate.getFullYear();

      const monthlyRevenue = completedBookings
        .filter(b => {
          const d = new Date(b.date);
          return d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

      chartDataArray.push({ name: monthLabel, revenue: monthlyRevenue });
    }
  } else {
    const daysToLookBack = range === '7days' ? 6 : 29;

    for (let i = daysToLookBack; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      
      // Format manual YYYY-MM-DD agar sinkron dengan format SQL DATE_FORMAT
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayLabel = (range === '7days') 
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

      const dayRevenue = completedBookings
        .filter(b => {
          // Normalisasi format tanggal booking jika ada jamnya
          const bDateOnly = b.date.includes('T') ? b.date.split('T')[0] : b.date;
          return bDateOnly === dateStr;
        })
        .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

      chartDataArray.push({ name: dayLabel, revenue: dayRevenue });
    }
  }

  console.log("Final Chart Data:", chartDataArray);
  setChartData(chartDataArray);
};

  // Get status badge config
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return {
          color: 'bg-gradient-to-br from-green-50 to-emerald-100 text-green-700 ring-1 ring-green-600/30',
          icon: <CheckCircle2 className="w-3 h-3 mr-1" />
        };
      case BookingStatus.PENDING:
        return {
          color: 'bg-gradient-to-br from-yellow-50 to-amber-100 text-yellow-700 ring-1 ring-yellow-600/30',
          icon: <Clock className="w-3 h-3 mr-1" />
        };
      case BookingStatus.CANCELLED:
        return {
          color: 'bg-gradient-to-br from-red-50 to-rose-100 text-red-700 ring-1 ring-red-600/30',
          icon: <XCircle className="w-3 h-3 mr-1" />
        };
      case BookingStatus.COMPLETED:
        return {
          color: 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 ring-1 ring-blue-600/30',
          icon: <PackageCheck className="w-3 h-3 mr-1" />
        };
      default:
        return {
          color: 'bg-gradient-to-br from-gray-50 to-slate-100 text-gray-700 ring-1 ring-gray-600/30',
          icon: null
        };
    }
  };

  // Stats Card Component
  const StatsCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-lg ${bgClass} ${colorClass} flex items-center`}
          >
            <TrendingUp className="w-3 h-3 mr-1" /> {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-2">{subtext}</p>
      </div>
    </div>
  );

  // Get recent activities from bookings
  const getRecentActivities = () => {
    return bookings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
      .map(booking => ({
        id: booking.id,
        title: `Booking ${booking.status}`,
        description: `${booking.userName} - ${booking.productName}`,
        time: getTimeAgo(booking.date),
        status: booking.status
      }));
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getActivityColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-500 ring-green-50';
      case BookingStatus.PENDING:
        return 'bg-yellow-500 ring-yellow-50';
      case BookingStatus.CANCELLED:
        return 'bg-red-500 ring-red-50';
      case BookingStatus.COMPLETED:
        return 'bg-blue-500 ring-blue-50';
      default:
        return 'bg-gray-500 ring-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Gunakan summary dari backend (sudah terfilter)
  const currentSummary = summary || {
    total_revenue: 0,
    total_bookings: 0,
    completed_bookings: 0,
    pending_bookings: 0,
    cancelled_bookings: 0,
    active_agents: 0,
    active_customers: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
          <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setFilterRange('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterRange === 'all' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
          <button 
            onClick={() => setFilterRange('7days')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterRange === '7days' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setFilterRange('month')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterRange === 'month' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Last Month
          </button>
          <button 
            onClick={() => setFilterRange('year')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterRange === 'year' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Last Year
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatIDR(Number(currentSummary.total_revenue) || 0)}
          subtext={`From ${currentSummary.completed_bookings || 0} completed bookings`}
          icon={DollarSign}
          colorClass="text-green-600"
          bgClass="bg-green-50"
        />
        <StatsCard
          title="Total Bookings"
          value={currentSummary.total_bookings || 0}
          subtext={`${currentSummary.pending_bookings || 0} pending, ${currentSummary.cancelled_bookings || 0} cancelled`}
          icon={ShoppingCart}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatsCard
          title="Active Agents"
          value={currentSummary.active_agents || 0}
          subtext="Verified agents with bookings"
          icon={UserCheck}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
        <StatsCard
          title="Active Customers"
          value={currentSummary.active_customers || 0}
          subtext="Customers with bookings"
          icon={Users}
          colorClass="text-orange-600"
          bgClass="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Revenue Trends</h3>
              <p className="text-xs text-gray-500 mt-1">Completed bookings only</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(val) => `Rp${(val / 1000000).toFixed(1)}jt`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ stroke: '#0d9488', strokeWidth: 1 }}
                  formatter={(value: any) => [formatIDR(Number(value)), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0d9488"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary-600" /> Recent Activity
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            {getRecentActivities().map((activity, i) => (
              <div key={activity.id} className="flex gap-4 items-start group">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.status)} mb-1 ring-4 group-hover:ring-primary-100 transition-all`}></div>
                  {i < getRecentActivities().length - 1 && (
                    <div className="w-0.5 h-full bg-gray-100"></div>
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-bold text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-500 mb-1">{activity.description}</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
            View All Activity
          </button>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Bookings</h3>
          <button className="text-primary-600 text-xs font-bold hover:underline flex items-center">
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.slice(0, 5).map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono">#{booking.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{booking.userName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {booking.productName || 'N/A'}
                      <div className="text-xs text-gray-400">Qty: {booking.quantity}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{booking.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {formatIDR(booking.totalPrice || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

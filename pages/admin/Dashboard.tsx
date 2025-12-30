import {
  Activity,
  ArrowRight,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  Users,
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
import { Booking } from '../../types';

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // mockService.getAllBookings().then((data) => {
    //   setBookings(data);
    // Prepare mock chart data
    //   const mockChart = [
    //     { name: 'Mon', revenue: 1200 },
    //     { name: 'Tue', revenue: 1900 },
    //     { name: 'Wed', revenue: 1500 },
    //     { name: 'Thu', revenue: 2400 },
    //     { name: 'Fri', revenue: 3200 },
    //     { name: 'Sat', revenue: 4500 },
    //     { name: 'Sun', revenue: data.reduce((acc, curr) => acc + curr.totalPrice, 0) || 5000 },
    //   ];
    //   setChartData(mockChart);
    // });
    // mockService.getAllAgents().then((agents) => setTotalAgents(agents.length));
    // mockService.getAllCustomers().then((customers) => setTotalCustomers(customers.length));
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Stats Card Component
  const StatsCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-lg ${bgClass} ${colorClass} flex items-center`}
        >
          <TrendingUp className="w-3 h-3 mr-1" /> +12%
        </span>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-2">{subtext}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
          <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold shadow-md">
            Last 7 Days
          </button>
          <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-xs font-bold">
            Last Month
          </button>
          <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-xs font-bold">
            Last Year
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          subtext="Total processed payments"
          icon={DollarSign}
          colorClass="text-green-600"
          bgClass="bg-green-50"
        />
        <StatsCard
          title="Total Bookings"
          value={bookings.length}
          subtext="Across all categories"
          icon={ShoppingCart}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatsCard
          title="Active Agents"
          value={totalAgents}
          subtext="Verified partners"
          icon={UserCheck}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
        <StatsCard
          title="Customers"
          value={totalCustomers}
          subtext="Registered users"
          icon={Users}
          colorClass="text-orange-600"
          bgClass="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Revenue Trends</h3>
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
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ stroke: '#0d9488', strokeWidth: 1 }}
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
            {/* Mock Activities */}
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mb-1 ring-4 ring-primary-50 group-hover:ring-primary-100 transition-all"></div>
                  <div className="w-0.5 h-full bg-gray-100 group-last:hidden"></div>
                </div>
                <div className="pb-2">
                  <p className="text-sm font-bold text-gray-800">New Booking Confirmed</p>
                  <p className="text-xs text-gray-500 mb-1">User John Doe booked "Bali Tour"</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    2 mins ago
                  </span>
                </div>
              </div>
            ))}
            <div className="flex gap-4 items-start group">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-orange-500 mb-1 ring-4 ring-orange-50"></div>
                <div className="w-0.5 h-full bg-gray-100 group-last:hidden"></div>
              </div>
              <div className="pb-2">
                <p className="text-sm font-bold text-gray-800">New Agent Registration</p>
                <p className="text-xs text-gray-500 mb-1">PT Travel Indo just signed up.</p>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  1 hour ago
                </span>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
            View All Activity
          </button>
        </div>
      </div>

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
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 font-mono">#{booking.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-700">{booking.productName}</td>
                  <td className="px-6 py-4 text-gray-500">{booking.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border
                      ${
                        booking.status === 'confirmed'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    ${booking.totalPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

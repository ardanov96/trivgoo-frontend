import { CheckCircle, Clock, DollarSign, Download, TrendingUp, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { mockService } from '../../services/mockService';
import { Booking, BookingStatus, PayoutRequest, PayoutStatus } from '../../types';

const Commissions: React.FC = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Booking[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'earnings' | 'payouts'>('earnings');

  // Payout Form
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      mockService.getAgentBookings(user.id).then((data) => {
        // Filter only confirmed/completed bookings for earnings calculation
        setEarnings(
          data.filter(
            (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED,
          ),
        );
      });
      mockService.getAgentPayouts(user.id).then(setPayouts);
    }
  }, [user]);

  const totalEarnings = earnings.reduce((sum, b) => sum + b.totalPrice * 0.89, 0);
  const totalWithdrawn = payouts
    .filter((p) => p.status === PayoutStatus.PROCESSED)
    .reduce((sum, p) => sum + p.amount, 0);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amount = parseFloat(withdrawAmount);
    // if (amount <= 0 || amount > (user.balance || 0)) {
    //   alert('Invalid amount');
    //   return;
    // }

    setIsSubmitting(true);
    const result = await mockService.requestPayout(user.id, amount, {
      name: bankName,
      number: accountNumber,
    });

    setIsSubmitting(false);
    if (result.success) {
      setShowPayoutModal(false);
      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      // Refresh payouts
      mockService.getAgentPayouts(user.id).then(setPayouts);
      // Manually update local user balance for UI responsiveness (mock only)
      //   user.balance = (user.balance || 0) - amount;
      alert('Payout requested successfully!');
    } else {
      alert(result.message);
    }
  };

  const getPayoutStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case PayoutStatus.PROCESSED:
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" /> Processed
          </span>
        );
      case PayoutStatus.PENDING:
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case PayoutStatus.REJECTED:
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
          <p className="text-gray-500 text-sm">Track your earnings, fees, and payouts.</p>
        </div>
        <button
          onClick={() => setShowPayoutModal(true)}
          className="flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-colors shadow-primary-600/20"
        >
          <Download className="w-5 h-5 mr-2" />
          Withdraw Funds
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
              Available Balance
            </p>
            <h3 className="text-3xl font-bold text-gray-900">${'0.00'}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
              Lifetime Earnings
            </p>
            <h3 className="text-3xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <Download className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
              Total Withdrawn
            </p>
            <h3 className="text-3xl font-bold text-gray-900">${totalWithdrawn.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 pt-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('earnings')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'earnings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Earnings History
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'payouts'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Payout History
            </button>
          </div>
        </div>

        <div className="p-0">
          {activeTab === 'earnings' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Booking Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Platform Fee (11%)
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Net Earning
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {earnings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No confirmed bookings yet.
                      </td>
                    </tr>
                  ) : (
                    earnings.map((booking) => {
                      const fee = booking.totalPrice * 0.11;
                      const net = booking.totalPrice - fee;
                      return (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 text-sm">
                              {booking.productName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              #{booking.id} • {booking.date}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                            ${booking.totalPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-500 font-medium">
                            -${fee.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">
                            +${net.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No payout history.
                      </td>
                    </tr>
                  ) : (
                    payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">#{payout.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{payout.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="font-bold text-gray-900">{payout.bankName}</div>
                          <div className="text-xs text-gray-500">{payout.accountNumber}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          ${payout.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {getPayoutStatusBadge(payout.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Request Payout</h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-100">
              <p className="text-xs text-primary-700 font-bold uppercase tracking-wide mb-1">
                Available to Withdraw
              </p>
              <p className="text-2xl font-bold text-primary-800">$0</p>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    max={0}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. BCA, Mandiri"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors mt-4 disabled:opacity-70 flex justify-center"
              >
                {isSubmitting ? 'Processing...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commissions;

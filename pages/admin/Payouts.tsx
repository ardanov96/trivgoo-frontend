import { AlertTriangle, CheckCircle, Clock, Filter, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PayoutStatus } from '../../types';

const AdminPayouts: React.FC = () => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [filteredPayouts, setFilteredPayouts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal for confirmation
  const [confirmAction, setConfirmAction] = useState<{
    id: number;
    type: 'approve' | 'reject';
  } | null>(null);

  const loadPayouts = async () => {
    setIsLoading(true);
    // const data = await mockService.getAllPayouts();
    // setPayouts(data);
    // setFilteredPayouts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredPayouts(payouts);
    } else {
      setFilteredPayouts(payouts.filter((p) => p.status === statusFilter));
    }
  }, [statusFilter, payouts]);

  const handleAction = async () => {
    if (!confirmAction) return;

    const status =
      confirmAction.type === 'approve' ? PayoutStatus.PROCESSED : PayoutStatus.REJECTED;
    // await mockService.processPayout(confirmAction.id, status);

    setConfirmAction(null);
    loadPayouts(); // Refresh data
  };

  const getStatusBadge = (status: PayoutStatus) => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payout Requests</h2>
          <p className="text-gray-500 text-sm">Manage agent withdrawal requests.</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value={PayoutStatus.PENDING}>Pending</option>
            <option value={PayoutStatus.PROCESSED}>Processed</option>
            <option value={PayoutStatus.REJECTED}>Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading requests...</div>
        ) : filteredPayouts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payout requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Bank Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">#{payout.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{payout.agentName}</div>
                      <div className="text-xs text-gray-500">{payout.agentEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ${payout.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium">{payout.bankName}</div>
                      <div className="font-mono text-xs">{payout.accountNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payout.date}</td>
                    <td className="px-6 py-4">{getStatusBadge(payout.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === PayoutStatus.PENDING && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setConfirmAction({ id: payout.id, type: 'approve' })}
                            className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setConfirmAction({ id: payout.id, type: 'reject' })}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-full ${
                  confirmAction.type === 'approve'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {confirmAction.type === 'approve' ? 'Approve Payout?' : 'Reject Payout?'}
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              {confirmAction.type === 'approve'
                ? 'This will mark the transaction as processed. Ensure funds are transferred manually.'
                : "This will return the funds to the agent's balance."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${
                  confirmAction.type === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;

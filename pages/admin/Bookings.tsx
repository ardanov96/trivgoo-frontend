import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  MoreHorizontal,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus } from '../../types';

// Mobile Card Component
const MobileBookingCard = ({ booking, getStatusColor, requestStatusUpdate }: any) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
          #{booking.id}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{booking.productName}</h4>
          <div className="text-xs text-gray-500">{booking.userName}</div>
        </div>
      </div>
      <span
        className={`px-2 py-1 inline-flex text-[10px] uppercase font-bold rounded-full ${getStatusColor(
          booking.status,
        )}`}
      >
        {booking.status}
      </span>
    </div>

    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-3">
      <div className="flex items-center">
        <Calendar className="w-3 h-3 mr-1" /> {booking.date}
      </div>
      <div className="font-bold text-gray-900 text-sm">${booking.totalPrice}</div>
    </div>

    <div className="flex gap-2 mt-1">
      {booking.status === BookingStatus.PENDING && (
        <button
          onClick={() => requestStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
          className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold text-center active:scale-95 transition-transform"
        >
          Confirm
        </button>
      )}
      {booking.status !== BookingStatus.CANCELLED && (
        <button
          onClick={() => requestStatusUpdate(booking.id, BookingStatus.CANCELLED)}
          className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold text-center active:scale-95 transition-transform"
        >
          Cancel
        </button>
      )}
    </div>
  </div>
);

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // State for Confirmation Modal
  const [pendingAction, setPendingAction] = useState<{ id: number; status: BookingStatus } | null>(
    null,
  );

  const fetchBookings = async () => {
    setIsLoading(true);
    // const data = await mockService.getAllBookings();
    // setBookings(data);
    // setFilteredBookings(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let result = bookings;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.id.toString().includes(query) ||
          (b.userName || '').toLowerCase().includes(query) ||
          b.productName.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }

    setFilteredBookings(result);
  }, [searchQuery, statusFilter, bookings]);

  // Initiate the update request (opens modal)
  const requestStatusUpdate = (id: number, newStatus: BookingStatus) => {
    setPendingAction({ id, status: newStatus });
  };

  // Execute the update (called from modal)
  const confirmStatusUpdate = async () => {
    if (!pendingAction) return;
    const { id, status } = pendingAction;

    // const success = await mockService.updateBookingStatus(id, status);
    // if (success) {
    // Optimistic update
    //   setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: status } : b)));
    // }
    setPendingAction(null);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case BookingStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search ID, User, Product..."
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value={BookingStatus.PENDING}>Pending</option>
              <option value={BookingStatus.CONFIRMED}>Confirmed</option>
              <option value={BookingStatus.COMPLETED}>Completed</option>
              <option value={BookingStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading bookings...</div>
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No bookings found.</div>
            ) : (
              filteredBookings.map((booking) => (
                <MobileBookingCard
                  key={booking.id}
                  booking={booking}
                  getStatusColor={getStatusColor}
                  requestStatusUpdate={requestStatusUpdate}
                />
              ))
            )}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Booking ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Filter className="w-8 h-8 mb-2 opacity-50" />
                          <p>No bookings found matching your filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3 text-xs">
                              {booking.userName?.charAt(0) || 'U'}
                            </div>
                            {booking.userName || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.productName}
                          <div className="text-xs text-gray-400 mt-0.5">
                            Qty: {booking.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              booking.status,
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${booking.totalPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative group inline-block text-left">
                            <button className="text-gray-400 hover:text-primary-600 p-1 transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {/* Simple Dropdown for Actions */}
                            <div className="hidden group-hover:block absolute right-0 mt-0 w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-20">
                              <div className="py-1">
                                {booking.status === BookingStatus.PENDING && (
                                  <button
                                    onClick={() =>
                                      requestStatusUpdate(booking.id, BookingStatus.CONFIRMED)
                                    }
                                    className="flex w-full items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" /> Confirm
                                  </button>
                                )}
                                {booking.status !== BookingStatus.CANCELLED && (
                                  <button
                                    onClick={() =>
                                      requestStatusUpdate(booking.id, BookingStatus.CANCELLED)
                                    }
                                    className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" /> Cancel
                                  </button>
                                )}
                                {booking.status === BookingStatus.CONFIRMED && (
                                  <button
                                    onClick={() =>
                                      requestStatusUpdate(booking.id, BookingStatus.COMPLETED)
                                    }
                                    className="flex w-full items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                  >
                                    <Clock className="w-4 h-4 mr-2" /> Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {pendingAction && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setPendingAction(null)}
            ></div>

            {/* Modal panel */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div
                    className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                      pendingAction.status === BookingStatus.CANCELLED
                        ? 'bg-red-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <AlertTriangle
                      className={`h-6 w-6 ${
                        pendingAction.status === BookingStatus.CANCELLED
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Confirm Status Change
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to change the status of Booking{' '}
                        <strong>#{pendingAction.id}</strong> to{' '}
                        <strong className="uppercase">{pendingAction.status}</strong>?
                        {pendingAction.status === BookingStatus.CANCELLED &&
                          ' This action might trigger a refund process.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 sm:gap-0">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    pendingAction.status === BookingStatus.CANCELLED
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                  }`}
                  onClick={confirmStatusUpdate}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setPendingAction(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;

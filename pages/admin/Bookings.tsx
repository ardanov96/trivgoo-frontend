import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MoreHorizontal,
  PackageCheck,
  Search,
  X,
  XCircle,
  Eye,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus } from '../../types';
import http from '../../services/http';

const MobileBookingCard = ({ booking, getStatusConfig, requestStatusUpdate, setSelectedBooking }: any) => {
  const statusConfig = getStatusConfig(booking.status);
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="h-min px-2 py-1 min-w-10 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
            #{booking.externalId || booking.id}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{booking.productName}</h4>
            <div className="text-xs text-gray-500">{booking.userName}</div>
          </div>
        </div>
        <span className={`px-2.5 py-1 inline-flex items-center text-[10px] uppercase font-bold rounded-full ${statusConfig.color}`}>
          {statusConfig.icon}{booking.status}
        </span>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-3">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" /> 
          {booking.startTime && booking.endTime 
            ? `${booking.date}, ${new Date(booking.startTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}-${new Date(booking.endTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}` 
            : booking.date}
        </div>
        <div className="font-bold text-gray-900 text-sm">Rp {booking.totalPrice?.toLocaleString('id-ID') || 0}</div>
      </div>
      <div className="flex gap-2 mt-1">
        {booking.status === BookingStatus.PENDING && (
          <button onClick={() => requestStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
            className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold text-center active:scale-95 transition-transform">
            Confirm
          </button>
        )}
        {booking.status !== BookingStatus.CANCELLED && (
          <button onClick={() => requestStatusUpdate(booking.id, BookingStatus.CANCELLED)}
            className="flex-1 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold text-center active:scale-95 transition-transform">
            Cancel
          </button>
        )}
        <button onClick={() => setSelectedBooking(booking as any)}
          className="flex-1 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold text-center border border-gray-200 active:scale-95 transition-transform">
          Detail
        </button>
      </div>
    </div>
  );
};

interface AdminBookingDetail extends Booking {
  productLocation?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  withDriver?: number;
  vehicleType?: string;
  duration?: string;
  pickupFee?: string | number;
  dropoffFee?: string | number;
  adminFee?: string | number;
  addOnsJson?: string;
  specialRequest?: string;
  agentName?: string;
  agentCompany?: string;
  agentEmail?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentGateway?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt?: string;
  productBasePrice?: number;
}

// Helper: parse datetime string from DB (format "2026-04-05T09:00:00") 
// WITHOUT browser timezone conversion
const parseLocalDateStr = (dtStr: string | null | undefined) => {
  if (!dtStr) return null;
  // Remove trailing Z if present to prevent UTC interpretation
  const cleaned = dtStr.replace('Z', '');
  // Extract parts: "2026-04-05T09:00:00" or "2026-04-05 09:00:00"
  const match = cleaned.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  return {
    date: `${day}/${month}/${year}`,
    dateLong: new Date(Number(year), Number(month) - 1, Number(day))
      .toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: `${hour}:${minute}`,
  };
};

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pendingAction, setPendingAction] = useState<{ id: number; status: BookingStatus } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleViewDetails = async (booking: Booking) => {
    setIsDetailLoading(true);
    setSelectedBooking(booking as AdminBookingDetail);
    try {
      const response = await http.get(`/admin/bookings/${booking.id}`);
      if (response.data && !response.data.error) {
        setSelectedBooking(response.data.data as AdminBookingDetail);
      }
    } catch (error) {
      console.error('Failed to fetch booking details', error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await http.get('/admin/bookings', {
        params: {
          status: statusFilter === 'all' ? undefined : statusFilter.toUpperCase(),
          search: searchQuery || undefined,
        },
      });

      const data = response.data?.data;
      if (response.data?.error === false && Array.isArray(data)) {
        const mappedData = data.map((b: any) => ({ ...b, status: (b.status || '').toLowerCase() as BookingStatus }));
        setBookings(mappedData);
        setFilteredBookings(mappedData);
        setCurrentPage(1);
      } else {
        setBookings([]);
        setFilteredBookings([]);
        setError(response.data?.message || 'Failed to load bookings');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load bookings';
      setError(errorMessage);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  useEffect(() => {
    if (!Array.isArray(bookings)) { setFilteredBookings([]); return; }
    let result = [...bookings];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((b) =>
        b.id.toString().includes(query) ||
        (b.userName || '').toLowerCase().includes(query) ||
        (b.productName || '').toLowerCase().includes(query)
      );
    }
    setFilteredBookings(result);
    setCurrentPage(1);
  }, [searchQuery, bookings]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const goToPage = (pageNumber: number) => { setCurrentPage(pageNumber); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goToPreviousPage = () => { if (currentPage > 1) goToPage(currentPage - 1); };
  const goToNextPage = () => { if (currentPage < totalPages) goToPage(currentPage + 1); };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...'); pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1); pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1); pages.push('...');
        pages.push(currentPage - 1); pages.push(currentPage); pages.push(currentPage + 1);
        pages.push('...'); pages.push(totalPages);
      }
    }
    return pages;
  };

  const requestStatusUpdate = (id: number, newStatus: BookingStatus) => setPendingAction({ id, status: newStatus });

  const confirmStatusUpdate = async () => {
    if (!pendingAction) return;
    const { id, status } = pendingAction;
    try {
      const response = await http.patch(`/admin/bookings/${id}/status`, { status: status.toUpperCase() });
      if (response.data?.error === false) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setPendingAction(null);
    }
  };

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED: return { color: 'bg-gradient-to-br from-green-50 to-emerald-100 text-green-700 ring-1 ring-green-600/30 shadow-sm', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> };
      case BookingStatus.PENDING: return { color: 'bg-gradient-to-br from-yellow-50 to-amber-100 text-yellow-700 ring-1 ring-yellow-600/30 shadow-sm', icon: <Clock className="w-3 h-3 mr-1 animate-pulse" /> };
      case BookingStatus.CANCELLED: return { color: 'bg-gradient-to-br from-red-50 to-rose-100 text-red-700 ring-1 ring-red-600/30 shadow-sm', icon: <XCircle className="w-3 h-3 mr-1" /> };
      case BookingStatus.COMPLETED: return { color: 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 ring-1 ring-blue-600/30 shadow-sm', icon: <PackageCheck className="w-3 h-3 mr-1" /> };
      default: return { color: 'bg-gradient-to-br from-gray-50 to-slate-100 text-gray-700 ring-1 ring-gray-600/30 shadow-sm', icon: null };
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBookings.length)} of {filteredBookings.length} bookings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search ID, User, Product..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer w-full">
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
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p>Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-red-500">
          <AlertTriangle className="w-12 h-12 mb-4" />
          <p className="text-lg font-semibold mb-2">Failed to load bookings</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button onClick={fetchBookings} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Retry</button>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {currentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Filter className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-lg font-medium">No bookings found</p>
              </div>
            ) : currentItems.map((booking) => (
              <MobileBookingCard key={booking.id} booking={booking} getStatusConfig={getStatusConfig} requestStatusUpdate={requestStatusUpdate} setSelectedBooking={handleViewDetails} />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Transaction ID', 'User', 'Product', 'Date', 'Status', 'Total', 'Actions'].map((h) => (
                      <th key={h} scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Filter className="w-10 h-10 mb-3 opacity-50" />
                          <p className="text-lg font-medium">No bookings found</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.map((booking) => {
                    const statusConfig = getStatusConfig(booking.status);
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking.externalId || booking.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3 text-xs">
                              {booking.userName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {booking.userName || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.productName || 'N/A'}
                          <div className="text-xs text-gray-400 mt-0.5">Qty: {booking.quantity || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.startTime && booking.endTime 
                            ? <>{booking.date}<br/><span className="text-xs text-gray-500">{new Date(booking.startTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span></>
                            : booking.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusConfig.color}`}>
                            {statusConfig.icon}{booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Rp {booking.totalPrice?.toLocaleString('id-ID') || '0'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative group inline-block text-left">
                            <button className="text-gray-400 hover:text-primary-600 p-1 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                            <div className="hidden group-hover:block absolute right-0 mt-0 w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-20">
                              <div className="py-1">
                                {booking.status === BookingStatus.PENDING && (
                                  <button onClick={() => requestStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                                    className="flex w-full items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors">
                                    <CheckCircle className="w-4 h-4 mr-2" /> Confirm
                                  </button>
                                )}
                                {booking.status === BookingStatus.CONFIRMED && (
                                  <button onClick={() => requestStatusUpdate(booking.id, BookingStatus.COMPLETED)}
                                    className="flex w-full items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors">
                                    <Clock className="w-4 h-4 mr-2" /> Complete
                                  </button>
                                )}
                                {booking.status !== BookingStatus.CANCELLED && (
                                  <button onClick={() => requestStatusUpdate(booking.id, BookingStatus.CANCELLED)}
                                    className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors">
                                    <XCircle className="w-4 h-4 mr-2" /> Cancel
                                  </button>
                                )}
                                <div className="border-t border-gray-100 my-1"></div>
                                <button onClick={() => handleViewDetails(booking)}
                                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                  <Eye className="w-4 h-4 mr-2" /> View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredBookings.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
              <div className="flex flex-1 justify-between sm:hidden">
                <button onClick={goToPreviousPage} disabled={currentPage === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                <button onClick={goToNextPage} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredBookings.length)}</span> of <span className="font-medium">{filteredBookings.length}</span> results
                </p>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button onClick={goToPreviousPage} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {getPageNumbers().map((pageNum, idx) =>
                    pageNum === '...' ? (
                      <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>
                    ) : (
                      <button key={pageNum} onClick={() => goToPage(pageNum as number)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum ? 'z-10 bg-primary-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}>
                        {pageNum}
                      </button>
                    )
                  )}
                  <button onClick={goToNextPage} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setPendingAction(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${pendingAction.status === BookingStatus.CANCELLED ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <AlertTriangle className={`h-6 w-6 ${pendingAction.status === BookingStatus.CANCELLED ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Status Change</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Are you sure you want to change Booking <strong>#{pendingAction.id}</strong> to <strong className="uppercase">{pendingAction.status}</strong>?
                      {pendingAction.status === BookingStatus.CANCELLED && ' This action might trigger a refund process.'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button onClick={confirmStatusUpdate}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors ${pendingAction.status === BookingStatus.CANCELLED ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}>
                  Confirm
                </button>
                <button onClick={() => setPendingAction(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedBooking(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl">
              <div className="bg-white px-6 pt-5 pb-6 max-h-[85vh] overflow-y-auto w-full">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10 w-full">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-primary-600" />
                    Booking Details #{selectedBooking.externalId || selectedBooking.id}
                  </h3>
                  <div className="flex gap-2 items-center">
                    {isDetailLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>}
                    <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                  {/* LEFT COLUMN: Transaction, User & Agent Info */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="flex items-center text-sm font-bold text-gray-900 border-b pb-2 mb-3">
                        <CheckCircle className="w-4 h-4 mr-2 text-primary-600" /> Waktu Pemesanan
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Dibuat Pada</p>
                          <p className="text-sm font-bold text-gray-900">{((selectedBooking as any).createdAt) ? new Date((selectedBooking as any).createdAt).toLocaleString('id-ID') : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                          <span className={`font-bold text-sm uppercase ${(selectedBooking.status||'').toLowerCase() === 'confirmed' ? 'text-green-600' : (selectedBooking.status||'').toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-primary-600'}`}>
                            {selectedBooking.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="flex items-center text-sm font-bold text-gray-900 border-b pb-2 mb-3">
                        <CheckCircle className="w-4 h-4 mr-2 text-primary-600" /> Kontak Customer
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between"><span>Nama:</span><span className="font-medium text-gray-900 text-right">{selectedBooking.userName || '-'}</span></div>
                        <div className="flex justify-between"><span>Email:</span><span className="font-medium text-gray-900 text-right break-all max-w-[200px]">{selectedBooking.customerEmail || '-'}</span></div>
                        <div className="flex justify-between"><span>Nomor HP:</span><span className="font-medium text-gray-900 text-right">{selectedBooking.customerPhone || '-'}</span></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="flex items-center text-sm font-bold text-gray-900 border-b pb-2 mb-3">
                        <CheckCircle className="w-4 h-4 mr-2 text-primary-600" /> Informasi Agen Utama
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between"><span>Nama Agen:</span><span className="font-medium text-gray-900 text-right">{selectedBooking.agentName || '-'}</span></div>
                        <div className="flex justify-between"><span>Perusahaan:</span><span className="font-medium text-gray-900 text-right">{selectedBooking.agentCompany || '-'}</span></div>
                        <div className="flex justify-between"><span>Email:</span><span className="font-medium text-gray-900 text-right break-all max-w-[200px]">{selectedBooking.agentEmail || '-'}</span></div>
                        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200"><span>Nama Produk:</span><span className="font-bold text-primary-700 text-right max-w-[200px]">{selectedBooking.productName || '-'}</span></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* RIGHT COLUMN: Time, Logistics, and Pay Info */}
                  <div className="space-y-4">
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 shadow-sm">
                      <h4 className="flex items-center text-sm font-bold text-amber-900 border-b pb-2 mb-3 border-amber-200">
                        <Calendar className="w-4 h-4 mr-2 text-amber-600" /> Layanan Sewa & Lokasi
                      </h4>
                      {(() => {
                        const start = parseLocalDateStr(selectedBooking.startTime);
                        const end = parseLocalDateStr(selectedBooking.endTime);
                        if (start && end) return (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-amber-600 uppercase font-bold tracking-wider mb-1">Tgl Pengambilan</p>
                              <p className="text-sm font-bold text-amber-900">
                                {start.dateLong}
                                <br/><span className="text-xs text-amber-700">{start.time}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-amber-600 uppercase font-bold tracking-wider mb-1">Tgl Pengembalian</p>
                              <p className="text-sm font-bold text-amber-900">
                                {end.dateLong}
                                <br/><span className="text-xs text-amber-700">{end.time}</span>
                              </p>
                            </div>
                          </div>
                        );
                        return (
                          <div>
                            <p className="text-[10px] text-amber-600 uppercase font-bold tracking-wider mb-1">Tanggal Layanan</p>
                            <p className="text-sm font-bold text-amber-900">{selectedBooking.date}</p>
                          </div>
                        );
                      })()}
                      
                      <div className="mt-4 space-y-2 text-xs text-amber-900">
                        <div className="border-t border-amber-200/50 pt-2">
                          <span className="font-bold block text-[10px] text-amber-600 uppercase tracking-widest mb-1">Titik Jemput (Pickup):</span>
                          <span className="bg-white p-2 border border-amber-100 rounded block font-medium shadow-sm">
                            {selectedBooking.pickupLocation 
                              ? selectedBooking.pickupLocation 
                              : <span className="text-amber-800">📍 Ambil di kantor agen{selectedBooking.productLocation ? ` — ${selectedBooking.productLocation}` : ''}</span>}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold block text-[10px] text-amber-600 uppercase tracking-widest mb-1">Titik Kembali (Dropoff):</span>
                          <span className="bg-white p-2 border border-amber-100 rounded block font-medium shadow-sm">
                            {selectedBooking.dropoffLocation 
                              ? selectedBooking.dropoffLocation 
                              : <span className="text-amber-800">📍 Antar di kantor agen{selectedBooking.productLocation ? ` — ${selectedBooking.productLocation}` : ''}</span>}
                          </span>
                        </div>
                        {selectedBooking.specialRequest && (
                          <div>
                            <span className="font-bold block text-[10px] text-amber-600 uppercase tracking-widest mb-1 mt-2">Notes Konsumen:</span>
                            <span className="bg-yellow-100/50 p-2 border border-yellow-200 rounded block italic text-amber-800">{selectedBooking.specialRequest}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <h4 className="flex items-center text-sm font-bold text-blue-900 border-b pb-2 mb-3 border-blue-200">
                        <CheckCircle className="w-4 h-4 mr-2 text-blue-600" /> Tagihan Transaksi
                      </h4>
                      <div className="space-y-2 text-xs text-blue-900">
                        <div className="flex justify-between items-center"><span>Base Price / Unit:</span><span className="font-medium bg-white px-2 py-1 rounded border border-blue-100">{selectedBooking.quantity} item</span></div>
                        <div className="flex justify-between items-center"><span>Biaya Jemput (Pickup):</span><span className="font-medium text-gray-900">Rp {Number(selectedBooking.pickupFee || 0).toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between items-center"><span>Biaya Kembali (Drop):</span><span className="font-medium text-gray-900">Rp {Number(selectedBooking.dropoffFee || 0).toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between items-center pb-3 border-b border-blue-200/50"><span>Biaya Admin Sistem:</span><span className="font-medium text-gray-900">Rp {Number(selectedBooking.adminFee || 0).toLocaleString('id-ID')}</span></div>
                        
                        <div className="flex justify-between pt-2 items-center">
                          <span className="font-bold text-blue-800">Total Harga</span>
                          <span className="font-black text-blue-700 text-xl border-b-2 border-blue-300 pb-0.5">Rp {selectedBooking.totalPrice?.toLocaleString('id-ID') || 0}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-blue-100">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-700/70 uppercase tracking-wider font-bold text-[10px]">Gateway</span>
                          <span className="font-bold text-gray-800 uppercase line-clamp-1 bg-white px-2 rounded-full border border-blue-100">{selectedBooking.paymentGateway || '-'} / {selectedBooking.paymentMethod || '-'}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-blue-700/70 uppercase tracking-wider font-bold text-[10px]">Status Bayar</span>
                          <span className={`font-bold uppercase px-3 rounded-full py-0.5 text-[10px] ${selectedBooking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {selectedBooking.paymentStatus || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100 rounded-b-xl">
                <button onClick={() => setSelectedBooking(null)} className="inline-flex justify-center rounded-lg border border-gray-200 shadow-sm px-6 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  Tutup Rincian
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

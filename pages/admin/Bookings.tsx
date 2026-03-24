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
        <button onClick={() => setSelectedBooking(booking)}
          className="flex-1 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold text-center border border-gray-200 active:scale-95 transition-transform">
          Detail
        </button>
      </div>
    </div>
  );
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
              <MobileBookingCard key={booking.id} booking={booking} getStatusConfig={getStatusConfig} requestStatusUpdate={requestStatusUpdate} setSelectedBooking={setSelectedBooking} />
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
                                <button onClick={() => setSelectedBooking(booking)}
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
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-5 pb-6">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-primary-600" />
                    Booking Details
                  </h3>
                  <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Transaction Information</h4>
                      <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2 text-sm">
                        <div className="flex justify-between border-b border-gray-200 pb-1.5 break-all">
                          <span className="text-gray-600 min-w-[50px]">ID</span>
                          <span className="font-medium text-gray-900 text-right">{selectedBooking.externalId || selectedBooking.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1.5">
                          <span className="text-gray-600">Date/Time</span>
                          <span className="font-medium text-gray-900 text-right">
                            {selectedBooking.startTime && selectedBooking.endTime 
                              ? `${selectedBooking.date}, ${new Date(selectedBooking.startTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} - ${new Date(selectedBooking.endTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}`
                              : selectedBooking.date}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1.5">
                          <span className="text-gray-600">Created At</span>
                          <span className="font-medium text-gray-900 text-right">
                            {((selectedBooking as any).createdAt) ? new Date((selectedBooking as any).createdAt).toLocaleString('id-ID') : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-bold uppercase ${(selectedBooking.status||'').toLowerCase() === 'confirmed' ? 'text-green-600' : (selectedBooking.status||'').toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-primary-600'}`}>{selectedBooking.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">User details</h4>
                      <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2 text-sm">
                        <div className="flex justify-between pb-1.5 border-b border-gray-200">
                          <span className="text-gray-600">Name</span>
                          <span className="font-medium text-gray-900 text-right max-w-[200px] truncate" title={selectedBooking.userName}>{selectedBooking.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Product</span>
                          <span className="font-medium text-gray-900 text-right max-w-[200px] truncate" title={selectedBooking.productName}>{selectedBooking.productName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pricing & Quantities</h4>
                      <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2 text-sm">
                        <div className="flex justify-between border-b border-gray-200 pb-1.5">
                          <span className="text-gray-600">Quantity</span>
                          <span className="font-medium text-gray-900">{selectedBooking.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Price</span>
                          <span className="font-bold text-gray-900 text-base">Rp {selectedBooking.totalPrice?.toLocaleString('id-ID') || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Info</h4>
                      <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2 text-sm">
                        <div className="flex justify-between border-b border-gray-200 pb-1.5">
                          <span className="text-gray-600">Method</span>
                          <span className="font-medium text-gray-900 text-right line-clamp-2">
                            {((selectedBooking as any).paymentGateway ? `${(selectedBooking as any).paymentGateway} - ` : '') + ((selectedBooking as any).paymentMethod || '-')}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1.5">
                          <span className="text-gray-600">Paid At</span>
                          <span className="font-medium text-gray-900 text-right">
                            {((selectedBooking as any).paidAt) ? new Date((selectedBooking as any).paidAt).toLocaleString('id-ID') : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pay Status</span>
                          <span className={`font-bold uppercase ${selectedBooking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {selectedBooking.paymentStatus || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
                <button onClick={() => setSelectedBooking(null)} className="inline-flex justify-center rounded-lg border border-gray-200 shadow-sm px-6 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors font-bold">
                  Tutup
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

import React, { useEffect, useState, useCallback } from 'react';
import http from '../../services/http';
import { BookingStatus } from '../../types';
import { useAuth } from '../../AuthContext';
import { getImageUrl, FALLBACK_IMAGE } from '../../utils/imageUtils';
import {
  Search, MessageCircle, Calendar, User, Phone, Mail, CheckCircle, Clock,
  XCircle, Filter, ChevronLeft, ChevronRight, Eye, X, CreditCard,
  PackageCheck, AlertTriangle, ExternalLink, RefreshCw, Hash, MapPin,
  DollarSign, FileText, Loader2, Ban, Copy,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AgentBooking {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  userName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  status: string;
  externalId: string;
  paymentUrl: string | null;
  paymentStatus: string | null;
  paymentGateway: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  productImage: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  paymentExpiredAt: string | null;
  // detail-only fields
  productLocation?: string | null;
  customerAddress?: string | null;
  paymentChannel?: string | null;
  gatewayTransactionId?: string | null;
}

type StatusFilter = 'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
type PaymentFilter = 'all' | 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'CANCELLED';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusConfig = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return { color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle className="w-3 h-3 mr-1" />, label: 'Confirmed' };
    case 'PENDING':
      return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3 mr-1" />, label: 'Pending' };
    case 'CANCELLED':
      return { color: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle className="w-3 h-3 mr-1" />, label: 'Cancelled' };
    case 'COMPLETED':
      return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <PackageCheck className="w-3 h-3 mr-1" />, label: 'Completed' };
    default:
      return { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: null, label: status };
  }
};

const getPaymentStatusConfig = (status: string | null) => {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Paid' };
    case 'PENDING':
      return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending' };
    case 'EXPIRED':
      return { color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Expired' };
    case 'FAILED':
      return { color: 'bg-red-50 text-red-600 border-red-200', label: 'Failed' };
    case 'CANCELLED':
      return { color: 'bg-red-50 text-red-500 border-red-200', label: 'Cancelled' };
    case 'REFUNDED':
      return { color: 'bg-purple-50 text-purple-600 border-purple-200', label: 'Refunded' };
    default:
      return { color: 'bg-gray-100 text-gray-500 border-gray-200', label: status || '-' };
  }
};

const formatCurrency = (amount: number) =>
  `Rp ${Number(amount).toLocaleString('id-ID')}`;

// ── Confirmation Modal ────────────────────────────────────────────────────────
const ConfirmModal: React.FC<{
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ title, message, confirmLabel, confirmColor, onConfirm, onClose, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative">
      <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200">
        <X className="w-5 h-5" />
      </button>
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
      <p className="text-gray-500 text-sm text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} disabled={isLoading} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button onClick={onConfirm} disabled={isLoading} className={`flex-1 py-2.5 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${confirmColor}`}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ── Detail Modal ──────────────────────────────────────────────────────────────
const BookingDetailModal: React.FC<{
  booking: AgentBooking | null;
  onClose: () => void;
  isLoading: boolean;
  onShowToast: (msg: string) => void;
}> = ({ booking, onClose, isLoading, onShowToast }) => {
  if (!booking) return null;
  const sc = getStatusConfig(booking.status);
  const pc = getPaymentStatusConfig(booking.paymentStatus);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} disalin ke clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-gray-600 hover:bg-gray-200 z-10">
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Memuat detail booking...</p>
          </div>
        ) : (
          <>
            {/* Header Area */}
            <div className="bg-gray-50 p-6 rounded-t-2xl border-b border-gray-100 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-gray-100">
                <img src={getImageUrl(booking.productImage)} alt={booking.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border flex items-center ${sc.color}`}>
                    {sc.icon} <span className="ml-1">{sc.label}</span>
                  </span>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${pc.color}`}>
                    💳 {pc.label}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mt-1 line-clamp-2">{booking.productName}</h3>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500 font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                    {booking.externalId}
                  </span>
                  <button onClick={() => copyToClipboard(booking.externalId, 'Invoice ID')} 
                    className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Salin ID
                  </button>
                </div>
              </div>
            </div>

            {/* Body 2 Columns */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Customer & Order */}
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center text-sm font-bold text-gray-900 border-b pb-2 mb-4">
                    <User className="w-4 h-4 mr-2 text-primary-600" /> Informasi Customer
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-400 pl-6 uppercase">Nama Lengkap</span>
                      <div className="flex items-center text-sm mt-0.5">
                        <User className="w-4 h-4 mr-2 text-transparent" /> 
                        <span className="font-semibold text-gray-900">{booking.userName}</span>
                      </div>
                    </div>
                    {booking.customerEmail && (
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-400 pl-6 uppercase">Email</span>
                        <div className="flex items-center text-sm mt-0.5">
                          <Mail className="w-4 h-4 mr-2 text-transparent" />
                          <span className="text-gray-700">{booking.customerEmail}</span>
                        </div>
                      </div>
                    )}
                    {booking.customerPhone && (
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-400 pl-6 uppercase">No. WhatsApp / HP</span>
                        <div className="flex items-center text-sm mt-0.5">
                          <Phone className="w-4 h-4 mr-2 text-transparent" />
                          <span className="text-gray-700">{booking.customerPhone}</span>
                        </div>
                      </div>
                    )}
                    {booking.customerAddress && (
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-400 pl-6 uppercase">Alamat</span>
                        <div className="flex items-start text-sm mt-0.5">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-transparent flex-shrink-0" />
                          <span className="text-gray-700 leading-relaxed">{booking.customerAddress}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center text-sm font-bold text-gray-900 border-b pb-2 mb-4">
                    <Calendar className="w-4 h-4 mr-2 text-primary-600" /> Rincian Booking
                  </h4>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-amber-600/70 uppercase font-bold tracking-wider">Tanggal Layanan</p>
                      <p className="text-sm font-bold text-amber-900 mt-1">{booking.date || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-600/70 uppercase font-bold tracking-wider">Kuantitas</p>
                      <p className="text-sm font-bold text-amber-900 mt-1">{booking.quantity} Paket/Orang</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-amber-200/50">
                      <p className="text-[10px] text-amber-600/70 uppercase font-bold tracking-wider">Total Pembayaran</p>
                      <p className="text-xl font-black text-amber-600 mt-0.5">{formatCurrency(booking.totalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment & Audit */}
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center text-sm font-bold text-gray-900 border-b pb-2 mb-4">
                    <CreditCard className="w-4 h-4 mr-2 text-primary-600" /> Informasi Pembayaran
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3.5 border border-gray-100 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status Pembayaran</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded flex items-center ${pc.color}`}>{pc.label}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Payment Gateway</span>
                      <span className="font-semibold text-gray-900 uppercase">
                        {booking.paymentGateway ? booking.paymentGateway : <span className="text-gray-400 normal-case italic">Belum dipilih</span>}
                      </span>
                    </div>

                    {booking.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Metode Bayar</span>
                        <span className="font-semibold text-gray-900">{booking.paymentMethod}</span>
                      </div>
                    )}

                    {booking.paymentChannel && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Channel</span>
                        <span className="font-semibold text-gray-900">{booking.paymentChannel}</span>
                      </div>
                    )}

                    {booking.paymentUrl && (
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Link Invoice Pembayaran</span>
                          <button onClick={() => copyToClipboard(booking.paymentUrl!, 'Link Pembayaran')} 
                            className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center gap-1 bg-primary-50 px-2 py-1 rounded">
                            <Copy className="w-3 h-3" /> Salin Link
                          </button>
                        </div>
                        <a href={booking.paymentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate bg-white border p-1.5 rounded">
                          {booking.paymentUrl}
                        </a>
                      </div>
                    )}

                    {booking.paymentExpiredAt && booking.paymentStatus === 'PENDING' && (
                      <div className="flex flex-col gap-1 pt-2 border-t border-gray-200">
                        <span className="text-gray-500">Batas Waktu Pembayaran</span>
                        <span className="font-medium text-red-600 flex items-center gap-1.5 bg-red-50 p-1.5 rounded text-xs border border-red-100">
                          <Clock className="w-3.5 h-3.5" /> 
                          {new Date(booking.paymentExpiredAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                        </span>
                      </div>
                    )}

                    {booking.paidAt && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-gray-500">Waktu Lunas</span>
                        <span className="font-bold text-green-700">{new Date(booking.paidAt).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="flex items-center text-sm font-bold text-gray-900 border-b pb-2 mb-3">
                    <Clock className="w-4 h-4 mr-2 text-primary-600" /> Riwayat Sistem
                  </h4>
                  <div className="text-xs text-gray-500 space-y-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="flex justify-between"><span>Dibuat pada:</span> <span className="font-medium text-gray-700">{new Date(booking.createdAt).toLocaleString('id-ID')}</span></p>
                    {booking.updatedAt && (
                      <p className="flex justify-between"><span>Terakhir diubah:</span> <span className="font-medium text-gray-700">{new Date(booking.updatedAt).toLocaleString('id-ID')}</span></p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination: React.FC<{
  currentPage: number; totalPages: number; total: number;
  onPageChange: (p: number) => void;
}> = ({ currentPage, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
      <p className="text-xs text-gray-500">
        Total <span className="font-bold text-gray-700">{total}</span> booking
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let page: number;
          if (totalPages <= 5) {
            page = i + 1;
          } else if (currentPage <= 3) {
            page = i + 1;
          } else if (currentPage >= totalPages - 2) {
            page = totalPages - 4 + i;
          } else {
            page = currentPage - 2 + i;
          }
          return (
            <button key={page} onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                currentPage === page ? 'bg-primary-600 text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>{page}</button>
          );
        })}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Mobile Card ───────────────────────────────────────────────────────────────
const MobileBookingCard: React.FC<{
  booking: AgentBooking;
  onView: () => void;
  onConfirm: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onWhatsApp: () => void;
}> = ({ booking, onView, onConfirm, onComplete, onCancel, onWhatsApp }) => {
  const sc = getStatusConfig(booking.status);
  const pc = getPaymentStatusConfig(booking.paymentStatus);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex gap-3 mb-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img src={getImageUrl(booking.productImage)} className="w-full h-full object-cover" alt=""
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center ${sc.color}`}>
              {sc.icon}{sc.label}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">#{booking.id}</span>
          </div>
          <h4 className="font-bold text-gray-900 text-sm truncate">{booking.productName}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{booking.userName}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-3 pb-3 border-b border-gray-50">
        <div className="flex items-center text-gray-500">
          <Calendar className="w-3 h-3 mr-1" /> {booking.date}
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${pc.color}`}>
          💳 {pc.label}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="font-bold text-primary-700 text-sm">{formatCurrency(booking.totalPrice)}</span>
        <div className="flex gap-1.5">
          <button onClick={onView} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200" title="Detail">
            <Eye className="w-4 h-4" />
          </button>
          {booking.status === 'PENDING' && (
            <button onClick={onConfirm} className="p-1.5 bg-green-50 rounded-lg text-green-600 hover:bg-green-100" title="Confirm">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {booking.status === 'CONFIRMED' && (
            <button onClick={onComplete} className="p-1.5 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100" title="Complete">
              <PackageCheck className="w-4 h-4" />
            </button>
          )}
          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
            <button onClick={onCancel} className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100" title="Cancel">
              <Ban className="w-4 h-4" />
            </button>
          )}
          {booking.customerPhone && (
            <button onClick={onWhatsApp} className="p-1.5 bg-green-50 rounded-lg text-green-600 hover:bg-green-100" title="WhatsApp">
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ██ MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const CustomerBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<AgentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [detailBooking, setDetailBooking] = useState<AgentBooking | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ booking: AgentBooking; action: string; status: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // ── Fetch bookings ────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (page = 1) => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.payment_status = paymentFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await http.get('/agent/bookings', { params });
      const result = res.data?.data;

      if (res.data?.error === false && result) {
        setBookings(result.data || []);
        setTotalPages(result.meta?.total_pages || 1);
        setTotalItems(result.meta?.total || 0);
        setCurrentPage(result.meta?.page || 1);
      } else {
        setBookings([]);
        setError(res.data?.message || 'Failed to load bookings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, statusFilter, paymentFilter, searchQuery]);

  useEffect(() => {
    fetchBookings(1);
  }, [statusFilter, paymentFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchBookings(1), 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  // ── Fetch detail ─────────────────────────────────────────────────────────
  const openDetail = async (b: AgentBooking) => {
    setDetailBooking(b);
    setDetailLoading(true);
    try {
      const res = await http.get(`/agent/bookings/${b.id}`);
      if (res.data?.error === false && res.data?.data) {
        setDetailBooking(res.data.data);
      }
    } catch { /* fallback to the list-level data */ }
    setDetailLoading(false);
  };

  // ── Status update ────────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const res = await http.patch(`/agent/bookings/${confirmAction.booking.id}/status`, { status: confirmAction.status });
      if (res.data?.error === false) {
        setToast(`Booking #${confirmAction.booking.id} berhasil diubah ke ${confirmAction.status}`);
        setConfirmAction(null);
        fetchBookings(currentPage);
      } else {
        alert(res.data?.message || 'Failed');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
    setActionLoading(false);
  };

  // ── WhatsApp ─────────────────────────────────────────────────────────────
  const handleWhatsApp = (b: AgentBooking) => {
    const phone = b.customerPhone;
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const formatted = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const msg = `Halo ${b.userName}, saya dari Trivgoo mengenai booking ${b.productName} (${b.externalId}).`;
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Count stats ──────────────────────────────────────────────────────────
  const stats = {
    total: totalItems,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
  };

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-green-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-bold max-w-sm">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
            {toast}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola pesanan customer untuk produk Anda
            {totalItems > 0 && <span className="ml-1">· <span className="font-bold text-gray-700">{totalItems}</span> total booking</span>}
          </p>
        </div>
        <button onClick={() => fetchBookings(currentPage)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors self-start">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700', icon: FileText },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-700', icon: Clock },
          { label: 'Confirmed', value: stats.confirmed, color: 'bg-green-50 text-green-700', icon: CheckCircle },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-2xl ${s.color} flex items-center gap-3`}>
            <s.icon className="w-5 h-5 opacity-70" />
            <div>
              <p className="text-xs font-bold uppercase opacity-60">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari nama customer, produk, booking ID..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white appearance-none cursor-pointer">
              <option value="all">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
              className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white appearance-none cursor-pointer">
              <option value="all">Semua Payment</option>
              <option value="PENDING">Payment Pending</option>
              <option value="PAID">Paid</option>
              <option value="EXPIRED">Expired</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
          <p className="text-sm font-medium">Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-16 text-red-500">
          <AlertTriangle className="w-10 h-10 mb-4" />
          <p className="text-sm font-bold mb-1">Failed to load bookings</p>
          <p className="text-xs text-gray-500 mb-4">{error}</p>
          <button onClick={() => fetchBookings(1)} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700">Retry</button>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Belum ada booking</p>
              </div>
            ) : bookings.map(b => (
              <MobileBookingCard key={b.id} booking={b}
                onView={() => openDetail(b)}
                onConfirm={() => setConfirmAction({ booking: b, action: 'Confirm', status: 'CONFIRMED' })}
                onComplete={() => setConfirmAction({ booking: b, action: 'Complete', status: 'COMPLETED' })}
                onCancel={() => setConfirmAction({ booking: b, action: 'Cancel', status: 'CANCELLED' })}
                onWhatsApp={() => handleWhatsApp(b)}
              />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Booking</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-5 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <FileText className="w-10 h-10 text-gray-300 mb-3" />
                          <p className="font-bold text-gray-900 mb-1">Tidak ada booking</p>
                          <p className="text-gray-500 text-sm">Belum ada booking yang sesuai filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : bookings.map(b => {
                    const sc = getStatusConfig(b.status);
                    const pc = getPaymentStatusConfig(b.paymentStatus);
                    return (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={getImageUrl(b.productImage)} className="w-full h-full object-cover" alt=""
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 line-clamp-1">{b.productName}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{b.externalId || `#${b.id}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs mr-2">
                              {b.userName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{b.userName}</p>
                              {b.customerEmail && <p className="text-[10px] text-gray-400">{b.customerEmail}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />{b.date}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{b.quantity} Guest(s)</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border flex items-center w-fit ${sc.color}`}>
                            {sc.icon}{sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border w-fit block ${pc.color}`}>
                            {pc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                          {formatCurrency(b.totalPrice)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => openDetail(b)} title="Detail"
                              className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            {b.status === 'PENDING' && (
                              <button onClick={() => setConfirmAction({ booking: b, action: 'Confirm', status: 'CONFIRMED' })} title="Confirm"
                                className="p-1.5 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {b.status === 'CONFIRMED' && (
                              <button onClick={() => setConfirmAction({ booking: b, action: 'Complete', status: 'COMPLETED' })} title="Complete"
                                className="p-1.5 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors">
                                <PackageCheck className="w-4 h-4" />
                              </button>
                            )}
                            {b.customerPhone && (
                              <button onClick={() => handleWhatsApp(b)} title="WhatsApp"
                                className="p-1.5 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}
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
          <Pagination currentPage={currentPage} totalPages={totalPages} total={totalItems}
            onPageChange={(p) => fetchBookings(p)} />
        </>
      )}

      {/* Detail Modal */}
      {detailBooking && (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} isLoading={detailLoading} onShowToast={setToast} />
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          title={`${confirmAction.action} Booking?`}
          message={`Apakah Anda yakin ingin ${confirmAction.action.toLowerCase()} booking #${confirmAction.booking.id} (${confirmAction.booking.productName})?`}
          confirmLabel={confirmAction.action}
          confirmColor={
            confirmAction.status === 'CANCELLED' ? 'bg-red-600 hover:bg-red-700' :
            confirmAction.status === 'COMPLETED' ? 'bg-blue-600 hover:bg-blue-700' :
            'bg-green-600 hover:bg-green-700'
          }
          onConfirm={handleStatusUpdate}
          onClose={() => setConfirmAction(null)}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default CustomerBookings;

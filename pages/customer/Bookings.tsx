import React, { useEffect, useState, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../AuthContext';
import http from '../../services/http';
import { loyaltyService } from '../../services/loyaltyService';
import { Booking, BookingStatus } from '../../types';
import {
  Calendar, Edit2, Package, History, ChevronRight, TrendingUp, Award,
  Wallet, Camera, Shield, QrCode, MessageSquare, MessageCircle, Star, X,
  CreditCard, Gift, Coins, Clock, AlertTriangle, ExternalLink, Trash2,
  AlertCircle, ChevronLeft, Filter, Search, Download, RefreshCw, FileText,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useCart } from '../../components/CartContext';
import UserAvatar from '../../components/UserAvatar';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import { getImageUrl, FALLBACK_IMAGE } from '../../utils/imageUtils';
import { encodeId } from '../../utils/hashids';
import { generateSlug } from '../../utils/slugify';

const ITEMS_PER_PAGE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusColor = (status: BookingStatus | string) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
    case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
    case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
    default: return 'bg-gray-100 text-gray-600';
  }
};

// Cek apakah payment link sudah expired
const isPaymentExpired = (booking: Booking): boolean => {
  const expiredAt = (booking as any).paymentExpiredAt;
  if (!expiredAt) return false;
  return new Date(expiredAt).getTime() < Date.now();
};

// ── Countdown hook ────────────────────────────────────────────────────────────
const useCountdown = (expiredAt?: string) => {
  const calc = useCallback(() => {
    if (!expiredAt) return null;
    const diff = new Date(expiredAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, diff };
  }, [expiredAt]);
  const [remaining, setRemaining] = useState(calc);
  useEffect(() => {
    if (!expiredAt) return;
    const timer = setInterval(() => {
      const r = calc(); setRemaining(r);
      if (!r) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiredAt, calc]);
  return remaining;
};

// ── PaymentCountdown ──────────────────────────────────────────────────────────
const PaymentCountdown: React.FC<{ expiredAt?: string; compact?: boolean }> = ({ expiredAt, compact }) => {
  const remaining = useCountdown(expiredAt);
  if (!expiredAt) return null;
  if (!remaining) return (
    <span className={`flex items-center gap-1 text-red-500 font-bold ${compact ? 'text-[10px]' : 'text-xs'}`}>
      <AlertTriangle className="w-3 h-3" /> Expired
    </span>
  );
  const isUrgent = remaining.diff < 3 * 3600000;
  if (compact) return (
    <span className={`flex items-center gap-1 font-bold text-[10px] ${isUrgent ? 'text-red-500' : 'text-amber-600'}`}>
      <Clock className="w-3 h-3" />
      {remaining.h > 0 && `${remaining.h}j `}{String(remaining.m).padStart(2, '00')}m {String(remaining.s).padStart(2, '00')}d
    </span>
  );
  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${isUrgent ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}>
      <Clock className="w-3.5 h-3.5" />
      Bayar dalam{' '}
      {remaining.h > 0 && <span>{remaining.h}j </span>}
      <span>{String(remaining.m).padStart(2, '00')}m</span>
      <span>{String(remaining.s).padStart(2, '00')}d</span>
    </div>
  );
};

// ── ExpiredBadge — reusable badge untuk status expired ────────────────────────
const ExpiredBadge: React.FC<{ compact?: boolean }> = ({ compact }) => (
  compact
    ? <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
      <AlertTriangle className="w-3 h-3" /> Pembayaran Expired
    </span>
    : <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-gray-100 text-gray-500 border-gray-200 w-fit">
      <AlertTriangle className="w-3 h-3" /> Expired
    </span>
);

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination: React.FC<{
  currentPage: number; totalPages: number;
  onPageChange: (p: number) => void; totalItems: number; itemsPerPage: number;
}> = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
      <p className="text-xs text-gray-500">
        Menampilkan <span className="font-bold text-gray-700">{start}–{end}</span> dari{' '}
        <span className="font-bold text-gray-700">{totalItems}</span> booking
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) => p === '...'
          ? <span key={`e${i}`} className="px-2 text-gray-400 text-sm">…</span>
          : <button key={p} onClick={() => onPageChange(p as number)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === p ? 'bg-primary-600 text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>{p}</button>
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Cancel Modal ──────────────────────────────────────────────────────────────
const CancelModal: React.FC<{
  booking: Booking; onConfirm: () => void; onClose: () => void; isLoading: boolean;
}> = ({ booking, onConfirm, onClose, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
      <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50">
        <X className="w-5 h-5" />
      </button>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Batalkan Booking?</h3>
      <p className="text-gray-500 text-sm text-center mb-4">Kamu yakin ingin membatalkan booking berikut?</p>
      <div className="bg-gray-50 rounded-2xl p-4 mb-4">
        <div className="flex gap-3">
          <img src={getImageUrl(booking.productImage)} alt={booking.productName}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm line-clamp-2">{booking.productName}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.startTime && booking.endTime ? `${booking.date}, ${new Date(booking.startTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}` : booking.date}</p>
            <p className="text-sm font-bold text-primary-600 mt-1">Rp {Number(booking.totalPrice).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
        <p className="text-amber-700 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Pembatalan hanya bisa dilakukan pada booking yang belum dikonfirmasi. Kebijakan refund mengacu pada syarat & ketentuan.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} disabled={isLoading}
          className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
          Tidak, Kembali
        </button>
        <button onClick={onConfirm} disabled={isLoading}
          className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {isLoading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><Trash2 className="w-4 h-4" /> Ya, Batalkan</>}
        </button>
      </div>
    </div>
  </div>
);

// ── Mobile Booking Card ───────────────────────────────────────────────────────
const MobileBookingCard: React.FC<{
  booking: Booking;
  onPay: (b: Booking) => void; onContact: (b: Booking) => void;
  onTicket: (b: Booking) => void; onReview: (b: Booking) => void; onCancel: (b: Booking) => void;
  onReschedule: (b: Booking) => void; onInvoice: (b: Booking) => void;
}> = ({ booking, onPay, onContact, onTicket, onReview, onCancel, onReschedule, onInvoice }) => {
  const expired = isPaymentExpired(booking);
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4 active:scale-[0.98] transition-transform">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img src={getImageUrl(booking.productImage)} className="w-full h-full object-cover" alt="Product"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            {/* Jika PENDING + expired + belum PAID → tampilkan ExpiredBadge saja */}
            {booking.status === BookingStatus.PENDING && expired && booking.paymentStatus !== 'PAID' ? (
              <ExpiredBadge compact />
            ) : (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            )}
            <span className="text-[10px] text-gray-400 font-mono">{(booking as any).externalId || `#${booking.id}`}</span>
          </div>
          <h4 className="font-bold text-gray-900 truncate leading-tight mb-1">{booking.productName}</h4>
          <div className="text-xs text-gray-500 flex items-center mb-1"><Calendar className="w-3 h-3 mr-1" /> {booking.startTime && booking.endTime ? `${booking.date}, ${new Date(booking.startTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}` : booking.date}</div>

          {/* Countdown — hanya jika PENDING dan BELUM expired dan BELUM dibayar */}
          {booking.status === BookingStatus.PENDING && !expired && (booking as any).paymentExpiredAt && booking.paymentStatus !== 'PAID' && (
            <div className="mb-2">
              <PaymentCountdown expiredAt={(booking as any).paymentExpiredAt} compact />
            </div>
          )}

          <div className="flex justify-between items-end">
            <span className="font-bold text-primary-700">Rp {Number(booking.totalPrice).toLocaleString('id-ID')}</span>
            <div className="flex gap-1.5">
              {/* Tombol Bayar & Batalkan hanya muncul jika PENDING, BELUM expired, dan BELUM dibayar */}
              {booking.status === BookingStatus.PENDING && !expired && booking.paymentStatus !== 'PAID' && (
                <>
                  <button onClick={() => onPay(booking)} className="p-1.5 bg-primary-600 rounded-lg text-white hover:bg-primary-700 shadow-sm" title="Bayar"><CreditCard className="w-4 h-4" /></button>
                  <button onClick={() => onCancel(booking)} className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100" title="Batalkan"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
              {(booking.paymentStatus === 'PAID' || booking.status === BookingStatus.PENDING) && (
                <button onClick={() => onContact(booking)} className="p-1.5 bg-green-50 rounded-lg text-green-600 hover:text-green-700"><MessageCircle className="w-4 h-4" /></button>
              )}
              {booking.paymentStatus === 'PAID' && booking.status !== BookingStatus.CANCELLED && (
                <>
                  <button onClick={() => onTicket(booking)} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900" title="E-Ticket"><QrCode className="w-4 h-4" /></button>
                  {booking.status !== BookingStatus.COMPLETED && ((booking as any).rescheduleCount || 0) < 1 && (
                    <button onClick={() => onReschedule(booking)} className="p-1.5 bg-orange-50 rounded-lg text-orange-600 hover:bg-orange-100" title="Reschedule"><RefreshCw className="w-4 h-4" /></button>
                  )}
                </>
              )}
              {booking.paymentStatus === 'PAID' && (
                <button onClick={() => onInvoice(booking)} className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100" title="Download Invoice"><FileText className="w-4 h-4" /></button>
              )}
              {booking.status === BookingStatus.COMPLETED && (
                <button onClick={() => onReview(booking)} className="p-1.5 bg-yellow-50 rounded-lg text-yellow-600 hover:text-yellow-700" title="Review"><MessageSquare className="w-4 h-4" /></button>
              )}
              <Link to={`/product/${encodeId(booking.productId)}/${generateSlug(booking.productName)}`} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Desktop Booking Table ─────────────────────────────────────────────────────
interface BookingTableProps {
  data: Booking[];
  activeTab: string;
  onPay: (b: Booking) => void; onContact: (b: Booking) => void;
  onTicket: (b: Booking) => void; onReview: (b: Booking) => void;
  onCancel: (b: Booking) => void; onSimulateComplete: (id: number) => void;
  onReschedule: (b: Booking) => void; onInvoice: (b: Booking) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  data, activeTab, onPay, onContact, onTicket, onReview, onCancel, onSimulateComplete, onReschedule, onInvoice
}) => {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);
  const [showTopScroll, setShowTopScroll] = useState(false);

  useEffect(() => {
    const bot = bottomRef.current;
    const top = topRef.current;
    if (!bot || !top) return;
    const mirror = top.querySelector<HTMLDivElement>('.scroll-mirror');
    if (!mirror) return;
    const sync = () => {
      const tbl = bot.querySelector('table');
      if (tbl) {
        mirror.style.width = tbl.scrollWidth + 'px';
        setShowTopScroll(tbl.scrollWidth > bot.clientWidth);
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(bot);
    return () => ro.disconnect();
  }, [data]);

  useEffect(() => {
    const top = topRef.current;
    const bot = bottomRef.current;
    if (!top || !bot) return;
    const onTop = () => { if (syncing.current) return; syncing.current = true; bot.scrollLeft = top.scrollLeft; syncing.current = false; };
    const onBot = () => { if (syncing.current) return; syncing.current = true; top.scrollLeft = bot.scrollLeft; syncing.current = false; };
    top.addEventListener('scroll', onTop);
    bot.addEventListener('scroll', onBot);
    return () => { top.removeEventListener('scroll', onTop); bot.removeEventListener('scroll', onBot); };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hidden md:block w-full" style={{ contain: 'paint' }}>
      <div ref={topRef} className={`overflow-x-auto border-b border-gray-100 ${showTopScroll ? '' : 'hidden'}`} style={{ height: 14 }}>
        <div className="scroll-mirror" style={{ height: 1, minWidth: '100%' }} />
      </div>
      <div ref={bottomRef} className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Kode Booking</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Produk</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Total</th>
              <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-4"><Package className="w-8 h-8 text-gray-300" /></div>
                    <h3 className="text-gray-900 font-bold mb-1">Tidak ada booking</h3>
                    <p className="text-gray-500 text-sm mb-4">Belum ada booking yang sesuai filter.</p>
                    {activeTab === 'active' && (
                      <Link to="/explore" className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                        Temukan Aktivitas
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ) : data.map((booking) => {
              const expiredAt = (booking as any).paymentExpiredAt;
              const isExpiredSoon = expiredAt && (new Date(expiredAt).getTime() - Date.now()) < 3 * 3600000;
              const expired = isPaymentExpired(booking);

              return (
                <tr key={booking.id}
                  className={`hover:bg-gray-50/50 transition-colors ${expired && booking.status === BookingStatus.PENDING
                      ? 'bg-gray-50/60 opacity-75'                         // expired → redup
                      : isExpiredSoon && booking.status === BookingStatus.PENDING
                        ? 'bg-red-50/30'                                   // hampir expired → merah tipis
                        : ''
                    }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-bold text-primary-600 font-mono tracking-wide">
                      {(booking as any).externalId || `#${booking.id}`}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">#{booking.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <img className="h-full w-full object-cover" src={getImageUrl(booking.productImage)} alt=""
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 line-clamp-1">{booking.productName}</div>
                        <div className="text-xs text-gray-400">{booking.quantity} Guest(s)</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-gray-300 flex-shrink-0" />{booking.startTime && booking.endTime ? `${booking.date}, ${new Date(booking.startTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}` : booking.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {/* Jika PENDING + expired + BELUM dibayar → tampilkan HANYA ExpiredBadge, sembunyikan badge PENDING */}
                      {booking.status === BookingStatus.PENDING && expired && booking.paymentStatus !== 'PAID' ? (
                        <ExpiredBadge />
                      ) : (
                        <>
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border w-fit ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          {booking.status === BookingStatus.PENDING && expiredAt && booking.paymentStatus !== 'PAID' && (
                            <PaymentCountdown expiredAt={expiredAt} />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    Rp {Number(booking.totalPrice).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {/* Tombol Bayar & Batalkan — hanya jika PENDING, BELUM expired, dan BELUM dibayar */}
                      {booking.status === BookingStatus.PENDING && !expired && booking.paymentStatus !== 'PAID' && (
                        <>
                          <button onClick={() => onPay(booking)}
                            className="flex items-center text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold shadow-sm gap-1">
                            <CreditCard className="w-3.5 h-3.5" /> Bayar <ExternalLink className="w-3 h-3 opacity-60" />
                          </button>
                          <button onClick={() => onCancel(booking)}
                            className="flex items-center text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold gap-1">
                            <Trash2 className="w-3.5 h-3.5" /> Batalkan
                          </button>
                        </>
                      )}
                      {(booking.paymentStatus === 'PAID' || booking.status === BookingStatus.PENDING) && (
                        <button onClick={() => onContact(booking)}
                          className="flex items-center text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors text-xs font-bold">
                          <MessageCircle className="w-3.5 h-3.5 mr-1" /> Contact
                        </button>
                      )}
                      {booking.paymentStatus === 'PAID' && booking.status !== BookingStatus.CANCELLED && (
                        <>
                          <button onClick={() => onTicket(booking)}
                            className="flex items-center text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-lg transition-colors text-xs font-bold">
                            <QrCode className="w-3.5 h-3.5 mr-1" /> Ticket
                          </button>
                          {booking.status !== BookingStatus.COMPLETED && ((booking as any).rescheduleCount || 0) < 1 && (
                            <button onClick={() => onReschedule(booking)}
                              className="flex items-center text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg transition-colors text-xs font-bold">
                              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reschedule
                            </button>
                          )}
                          <button onClick={() => onSimulateComplete(booking.id)}
                            className="flex items-center text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg text-[10px]">
                            Simulate Complete
                          </button>
                        </>
                      )}
                      {booking.paymentStatus === 'PAID' && (
                        <button onClick={() => onInvoice(booking)}
                          className="flex items-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors text-xs font-bold">
                          <FileText className="w-3.5 h-3.5 mr-1" /> Invoice
                        </button>
                      )}
                      {booking.status === BookingStatus.COMPLETED && (
                        <button onClick={() => onReview(booking)}
                          className="flex items-center text-yellow-600 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-lg transition-colors text-xs font-bold">
                          <Star className="w-3.5 h-3.5 mr-1" /> Review
                        </button>
                      )}
                      <Link to={`/product/${encodeId(booking.productId)}/${generateSlug(booking.productName)}`} className="flex items-center text-gray-400 hover:text-gray-600 px-2 py-1">
                        <span className="sr-only">Details</span> <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const CustomerBookings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const [bookingToInvoice, setBookingToInvoice] = useState<Booking | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [membershipTier, setMembershipTier] = useState<{ name: string; color: string | null } | null>(null);
  const [pointBalance, setPointBalance] = useState<number>(0);

  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchText, setSearchText] = useState('');



  useEffect(() => {
    if (user) {
      loadBookings();
      loyaltyService.getMembership().then(m => setMembershipTier({ name: m.tier.name, color: m.tier.color })).catch(() => { });
      loyaltyService.getBalance().then(b => setPointBalance(b.balance)).catch(() => { });
    }
  }, [user]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('transaction_status') === 'settlement' || p.get('transaction_status') === 'capture') {
      clearCart(); navigate('/my-bookings', { replace: true });
    }
  }, [location.search, clearCart, navigate]);

  useEffect(() => {
    if (cancelSuccess) { const t = setTimeout(() => setCancelSuccess(null), 4000); return () => clearTimeout(t); }
  }, [cancelSuccess]);

  useEffect(() => {
    if (rescheduleSuccess) { const t = setTimeout(() => setRescheduleSuccess(null), 4000); return () => clearTimeout(t); }
  }, [rescheduleSuccess]);

  useEffect(() => {
    if (activeTab === 'active') setActivePage(1);
    else setHistoryPage(1);
    setDateFrom(''); setDateTo(''); setSearchText('');
  }, [activeTab]);

  const loadBookings = async () => {
    if (!user) return;
    try {
      const res = await http.get('/bookings/my');
      const data = res.data?.data || [];
      setBookings(data.map((b: any) => ({ ...b, status: (b.status || '').toLowerCase() as BookingStatus })));
    } catch (err: any) {
      console.error('[MyBookings]', err.response?.data || err.message);
      setBookings([]);
    }
  };

  const activeBookings = bookings.filter(b => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED);
  const pastBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED);
  const completedTrips = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;
  const totalSpent = bookings
    .filter(b => b.paymentStatus === 'PAID' && b.status !== BookingStatus.CANCELLED)
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const applyFilters = (list: Booking[]) => {
    let result = list;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(b =>
        b.productName.toLowerCase().includes(q) ||
        ((b as any).externalId || '').toLowerCase().includes(q) ||
        String(b.id).includes(q)
      );
    }
    if (dateFrom) result = result.filter(b => (b.date?.split(' - ')[0] || b.date || '') >= dateFrom);
    if (dateTo) result = result.filter(b => (b.date?.split(' - ')[0] || b.date || '') <= dateTo);
    return result;
  };

  const hasActiveFilter = dateFrom || dateTo || searchText.trim();
  const clearFilters = () => { setDateFrom(''); setDateTo(''); setSearchText(''); };

  const rawData = activeTab === 'active' ? activeBookings : pastBookings;
  const filteredData = applyFilters(rawData);
  const currentPage = activeTab === 'active' ? activePage : historyPage;
  const setCurrentPage = activeTab === 'active' ? setActivePage : setHistoryPage;
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const pagedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (p: number) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  useEffect(() => { setCurrentPage(1); }, [dateFrom, dateTo, searchText]);

  const openTicket = (b: Booking) => { setSelectedBooking(b); setShowTicketModal(true); };
  const openReview = (b: Booking) => { setSelectedBooking(b); setReviewRating(5); setReviewComment(''); setShowReviewModal(true); };
  const openCancelModal = (b: Booking) => { setBookingToCancel(b); setShowCancelModal(true); };
  const openRescheduleModal = (b: Booking) => { setBookingToReschedule(b); setRescheduleDate(''); setShowRescheduleModal(true); };

  // ── Download E-Ticket as PNG ─────────────────────────────────────────────────
  const handleDownloadTicket = async () => {
    if (!ticketRef.current || !selectedBooking) return;
    setIsDownloadingTicket(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `e-ticket-${(selectedBooking as any).externalId || selectedBooking.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download ticket error:', err);
      // Fallback: trigger print
      window.print();
    } finally {
      setIsDownloadingTicket(false);
    }
  };

  // ── Download Invoice as PDF ──────────────────────────────────────────────────
  const handleDownloadInvoice = async (b: Booking) => {
    setBookingToInvoice(b);
    setIsDownloadingInvoice(true);

    // Tunggu DOM update untuk merender InvoiceTemplate
    setTimeout(async () => {
      try {
        if (!invoiceRef.current) return;
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        // A4 params: format a4, orientation portrait, unit mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice-${(b as any).externalId || b.id}.pdf`);
      } catch (err) {
        console.error('Invoice download error:', err);
        alert('Gagal mendownload Invoice. Silakan coba lagi.');
      } finally {
        setIsDownloadingInvoice(false);
        setBookingToInvoice(null);
      }
    }, 500); // delay pendek untuk memastikan DOM rendered sempurna
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setIsCancelling(true);
    try {
      await http.patch(`/bookings/${bookingToCancel.id}/cancel`);
      setShowCancelModal(false); setBookingToCancel(null);
      setCancelSuccess(`Booking "${bookingToCancel.productName}" berhasil dibatalkan.`);
      await loadBookings();
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal membatalkan booking.'); }
    finally { setIsCancelling(false); }
  };

  const handleConfirmReschedule = async () => {
    if (!bookingToReschedule || !rescheduleDate) return;
    setIsRescheduling(true);
    try {
      await http.patch(`/bookings/${bookingToReschedule.id}/reschedule`, { new_date: rescheduleDate });
      setShowRescheduleModal(false); setBookingToReschedule(null);
      setRescheduleSuccess(`Booking "${bookingToReschedule.productName}" berhasil di-reschedule ke ${rescheduleDate}.`);
      await loadBookings();
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal melakukan reschedule.'); }
    finally { setIsRescheduling(false); }
  };

  const handleSimulateComplete = async (id: number) => {
    try { await http.patch(`/bookings/${id}/status`, { status: 'COMPLETED' }); loadBookings(); }
    catch (e) { console.error(e); }
  };

  const submitReview = async () => {
    if (!selectedBooking || !user) return;
    setIsSubmittingReview(true);
    try { await new Promise(r => setTimeout(r, 500)); alert('Thank you for your review!'); }
    catch { alert('Failed to submit review'); }
    setIsSubmittingReview(false); setShowReviewModal(false);
  };

  const handleContactAgent = (b: Booking) => {
    const msg = `Hello, I have a booking for ${b.productName} on ${b.date}. Booking ID: #${b.id}. My name is ${user?.name}.`;
    window.open(`https://wa.me/6282144443784?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePayNow = async (b: Booking) => {
    const url = (b as any).paymentUrl;
    if (url) { window.location.href = url; return; }
    try {
      const res = await http.post('/payment/create-payment', {
        id: `TRV-${b.id}-${Date.now()}`, amount: b.totalPrice,
        name: user?.name || b.userName, email: user?.email || '',
        product_name: b.productName, quantity: b.quantity,
        user_id: user?.id || null, product_id: b.productId || null,
      });
      const payUrl = res.data?.data?.payment_url;
      if (payUrl) { window.location.href = payUrl; }
      else { alert('Gagal mendapatkan link pembayaran.'); }
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal memproses pembayaran'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-12">

      {/* Toast */}
      {cancelSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 pointer-events-none">
          <div className="bg-green-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-bold max-w-sm">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
            {cancelSuccess}
          </div>
        </div>
      )}
      {rescheduleSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 pointer-events-none">
          <div className="bg-orange-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-bold max-w-sm">
            <RefreshCw className="w-4 h-4 flex-shrink-0" />
            {rescheduleSuccess}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 md:p-8 sticky top-28">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-xl flex items-center justify-center relative group overflow-hidden mb-5">
                  <UserAvatar
                    user={user}
                    className="w-full h-full shadow-inner"
                  />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-gray-400 text-sm font-medium mb-4">{user?.email}</p>

                <div className="flex flex-col items-center gap-2">
                  {membershipTier && (
                    <span className="px-3 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center"
                      style={{ backgroundColor: membershipTier.color ?? '#cd7f32' }}>
                      <Award className="w-3 h-3 mr-1" /> {membershipTier.name}
                    </span>
                  )}
                  {pointBalance > 0 && (
                    <span className="px-3 py-1 bg-gray-900 text-yellow-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Coins className="w-3 h-3" /> {pointBalance.toLocaleString('id-ID')} pts
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t border-gray-50">
                <button onClick={() => setActiveTab('active')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all text-sm ${activeTab === 'active' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
                  <Package className={`w-5 h-5 mr-3 ${activeTab === 'active' ? 'text-primary-600' : 'text-gray-400'}`} />
                  Active Bookings
                  {activeBookings.length > 0 && <span className="ml-auto bg-white shadow-sm text-primary-700 py-0.5 px-2 rounded-md text-xs font-bold">{activeBookings.length}</span>}
                </button>
                <button onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all text-sm ${activeTab === 'history' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
                  <History className={`w-5 h-5 mr-3 ${activeTab === 'history' ? 'text-primary-600' : 'text-gray-400'}`} />
                  Trip History
                </button>
                <Link to="/loyalty" className="w-full flex items-center px-4 py-3.5 rounded-2xl text-sm text-gray-500 hover:bg-gray-50 font-medium">
                  <Gift className="w-5 h-5 mr-3 text-gray-400" />
                  Loyalty & Points
                  {pointBalance > 0 && <span className="ml-auto bg-yellow-50 text-yellow-700 py-0.5 px-2 rounded-md text-xs font-bold">{pointBalance.toLocaleString('id-ID')} pts</span>}
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <div className="bg-primary-600 rounded-2xl p-5 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-transform duration-700" />
                  <Shield className="w-6 h-6 mb-3 text-primary-200" />
                  <h4 className="font-bold text-sm mb-1">Travel Insurance</h4>
                  <p className="text-xs text-primary-100 mb-3">Protect your upcoming trips.</p>
                  <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg">Learn More</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="w-full lg:w-3/4 min-w-0">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
              {[
                { icon: Package, color: 'blue', label: 'Active', value: activeBookings.length },
                { icon: TrendingUp, color: 'green', label: 'Completed', value: completedTrips },
              ].map((s, i) => (
                <div key={i} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 bg-${s.color}-50 rounded-xl flex items-center justify-center text-${s.color}-600`}>
                    <s.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
              <div className="col-span-2 md:col-span-1 bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Spent</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">Rp {totalSpent.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            {/* Header + tab toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                {activeTab === 'active' ? 'Upcoming Adventures' : 'Past Journeys'}
              </h1>
              <div className="bg-gray-100 p-1 rounded-xl inline-flex self-start md:self-auto">
                {(['active', 'history'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab === 'active' ? 'Active' : 'History'}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)}
                    placeholder="Cari nama produk atau kode booking..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all w-full sm:w-auto"
                    title="Dari tanggal" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all w-full sm:w-auto"
                    title="Sampai tanggal" />
                </div>
                {hasActiveFilter && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors whitespace-nowrap">
                    <X className="w-3.5 h-3.5" /> Hapus Filter
                  </button>
                )}
              </div>
              {hasActiveFilter && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Filter className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                  <p className="text-xs text-gray-500">
                    Menampilkan <span className="font-bold text-gray-700">{filteredData.length}</span> dari{' '}
                    <span className="font-bold text-gray-700">{rawData.length}</span> booking
                    {dateFrom && <span> · dari <span className="font-bold">{dateFrom}</span></span>}
                    {dateTo && <span> s/d <span className="font-bold">{dateTo}</span></span>}
                    {searchText && <span> · "{searchText}"</span>}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Mobile */}
              <div className="md:hidden space-y-4">
                {pagedData.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-gray-400 text-sm">{hasActiveFilter ? 'Tidak ada booking yang sesuai filter.' : 'Tidak ada booking.'}</p>
                    {hasActiveFilter && <button onClick={clearFilters} className="mt-3 text-xs text-primary-600 font-bold hover:underline">Hapus filter</button>}
                  </div>
                ) : pagedData.map(b => (
                  <MobileBookingCard key={b.id} booking={b}
                    onPay={handlePayNow} onContact={handleContactAgent}
                    onTicket={openTicket} onReview={openReview} onCancel={openCancelModal}
                    onReschedule={openRescheduleModal} onInvoice={handleDownloadInvoice} />
                ))}
              </div>

              {/* Desktop */}
              <BookingTable
                data={pagedData} activeTab={activeTab}
                onPay={handlePayNow} onContact={handleContactAgent}
                onTicket={openTicket} onReview={openReview}
                onCancel={openCancelModal} onSimulateComplete={handleSimulateComplete}
                onReschedule={openRescheduleModal} onInvoice={handleDownloadInvoice}
              />

              <Pagination
                currentPage={currentPage} totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredData.length} itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showCancelModal && bookingToCancel && (
        <CancelModal booking={bookingToCancel} onConfirm={handleConfirmCancel}
          onClose={() => { if (!isCancelling) { setShowCancelModal(false); setBookingToCancel(null); } }}
          isLoading={isCancelling} />
      )}

      {showTicketModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative">
            <button onClick={() => setShowTicketModal(false)} className="absolute top-4 right-4 bg-white/80 backdrop-blur p-1.5 rounded-full text-gray-600 hover:bg-gray-200 z-10 shadow-sm"><X className="w-5 h-5" /></button>

            {/* Printable ticket area */}
            <div ref={ticketRef} className="bg-white relative">
              {/* Header */}
              <div className="bg-gray-900 px-6 py-5 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
                <div className="relative z-10 w-full text-center">
                  <h3 className="text-xl font-black tracking-[0.25em] uppercase">Trivgoo</h3>
                  <p className="text-gray-400 text-[10px] tracking-widest uppercase mt-1">E-Ticket / Voucher</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-4 border-r border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Passanger</p>
                    <p className="text-base font-bold text-gray-900 leading-tight">{(selectedBooking as any).contactDetails?.name || user?.name}</p>
                  </div>
                  <div className="pl-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 text-right">Status</p>
                    <span className="font-bold text-green-600 uppercase text-[10px] px-2 py-0.5 bg-green-50 rounded-sm border border-green-200 block text-center min-w-[70px]">{selectedBooking.status}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-lg font-bold text-gray-800 leading-snug">{selectedBooking.productName}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{selectedBooking.startTime && selectedBooking.endTime ? `${selectedBooking.date}, ${new Date(selectedBooking.startTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} - ${new Date(selectedBooking.endTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}` : selectedBooking.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Guests</p>
                    <p className="text-sm font-bold text-gray-900">{selectedBooking.quantity} Person(s)</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Paid</p>
                    <p className="text-sm font-bold text-primary-600">Rp {Number(selectedBooking.totalPrice).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Booking ID</p>
                    <p className="text-xs font-mono font-bold text-gray-900 uppercase">{(selectedBooking as any).externalId || `#${selectedBooking.id}`}</p>
                  </div>
                </div>
              </div>

              {/* Perforation effect / Separator */}
              <div className="relative flex items-center">
                <div className="absolute left-[-12px] bg-black/60 w-6 h-6 rounded-full" />
                <div className="w-full border-t-[2.5px] border-dashed border-gray-200 mx-5" />
                <div className="absolute right-[-12px] bg-black/60 w-6 h-6 rounded-full" />
              </div>

              {/* QR Code Section */}
              <div className="px-6 pb-8 pt-6 flex flex-col items-center justify-center relative bg-gray-50/50">
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative z-10 transition-transform hover:scale-105 duration-300">
                  <QRCodeSVG
                    value={JSON.stringify({
                      platform: 'trivgoo',
                      bookingId: (selectedBooking as any).externalId || String(selectedBooking.id),
                      product: selectedBooking.productName,
                      date: selectedBooking.date,
                      guests: selectedBooking.quantity,
                    })}
                    size={150}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-5">Scan QR code at the entry</p>
              </div>
            </div>

            {/* Download button (outside printable area) */}
            <div className="p-5 pt-0 bg-white">
              <button
                onClick={handleDownloadTicket}
                disabled={isDownloadingTicket}
                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isDownloadingTicket ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mengunduh...</>
                ) : (
                  <><Download className="w-4 h-4" /> Download E-Ticket</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Write a Review</h3>
            <p className="text-gray-500 text-sm mb-6">How was your experience with <strong>{selectedBooking.productName}</strong>?</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setReviewRating(star)} className="p-1 transition-transform hover:scale-110 focus:outline-none">
                  <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
            <textarea className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white h-32 resize-none mb-6"
              placeholder="Tell us about your trip..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <button onClick={submitReview} disabled={isSubmittingReview}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-600 transition-colors disabled:opacity-70">
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* ── Reschedule Modal ── */}
      {showRescheduleModal && bookingToReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
            <button onClick={() => { if (!isRescheduling) { setShowRescheduleModal(false); setBookingToReschedule(null); } }} disabled={isRescheduling} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50">
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Reschedule Booking</h3>
            <p className="text-gray-500 text-sm text-center mb-5">Pilih tanggal baru untuk booking ini.</p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="flex gap-3">
                <img src={getImageUrl(bookingToReschedule.productImage)} alt={bookingToReschedule.productName}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm line-clamp-2">{bookingToReschedule.productName}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Tanggal saat ini: <span className="font-bold">{bookingToReschedule.date}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Baru</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
              <p className="text-amber-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Reschedule hanya dapat dilakukan 1 kali per booking. Pastikan tanggal baru sudah benar.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowRescheduleModal(false); setBookingToReschedule(null); }} disabled={isRescheduling}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                Batal
              </button>
              <button onClick={handleConfirmReschedule} disabled={isRescheduling || !rescheduleDate}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {isRescheduling
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><RefreshCw className="w-4 h-4" /> Reschedule</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice Template (Hidden from viewport, used for PDF generation) ── */}
      {bookingToInvoice && (
        <InvoiceTemplate ref={invoiceRef} booking={bookingToInvoice} user={user} />
      )}

      {/* Invoice Download Overlay */}
      {isDownloadingInvoice && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-lg font-bold text-gray-900">Mencetak Invoice...</p>
          <p className="text-sm text-gray-500 mt-1">Harap tunggu sebentar</p>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  Search, 
  MessageCircle, 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  ChevronRight, 
  Mail, 
  Phone, 
  X,
  RefreshCw,
  AlertTriangle,
  Award,
  Crown
} from 'lucide-react';
import http from '../../services/http';

interface CustomerData {
  userId: number | null;
  userName: string;
  customerEmail: string;
  customerPhone: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string;
  topPreference: string;
  bookingHistory: string[];
}

const formatCurrency = (amount: number) =>
  `Rp ${Number(amount).toLocaleString('id-ID')}`;

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Drawer Expansion
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  const fetchCustomers = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
      });

      const res = await http.get(`/agent/customers?${qs.toString()}`);
      
      if (res.data?.error === false && res.data?.data) {
        // Axios creates res.data, Response Helper nests data: { data, meta }
        const payload = res.data.data;
        
        setCustomers(payload.data || []);
        setCurrentPage(payload.meta?.page || 1);
        setTotalPages(payload.meta?.total_pages || 1);
        setTotalItems(payload.meta?.total || 0);
      } else {
        setError(res.data?.message || 'Gagal memuat data pelanggan');
        setCustomers([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Server error');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchCustomers(1), 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleWhatsApp = (c: CustomerData) => {
    if (!c.customerPhone || c.customerPhone === '-') {
      alert("Nomor HP pelanggan tidak tersedia.");
      return;
    }
    const cleanPhone = c.customerPhone.replace(/\D/g, '');
    const formatted = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    
    // Warm CRM Template
    const msg = `Halo Bapak/Ibu ${c.userName}, terima kasih telah mempercayakan ${c.topPreference !== '-' ? `penyewaan ${c.topPreference}` : 'layanan liburan'} Anda bersama kami di Trivgoo. Apakah ada perjalanan lain yang bisa kami bantu persiapkan?`;
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" />
            Customer Management
          </h2>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            Daftar pelanggan unik Anda. Pahami preferensi mereka dan bangun loyalitas jangka panjang.
          </p>
        </div>
        <button 
          onClick={() => fetchCustomers(currentPage)} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors shrink-0"
        >
          <RefreshCw className="w-4 h-4" /> Segarkan
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Pelanggan</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalItems}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Lifetime Revenue</p>
            <p className="text-xl font-black text-gray-900 mt-1">
              {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Loyalitas Rata-rata</p>
            <p className="text-xl font-black text-gray-900 mt-1">
              {customers.length > 0 ? (customers.reduce((sum, c) => sum + c.totalBookings, 0) / customers.length).toFixed(1) : 0} <span className="text-sm font-bold text-gray-500">Booking / org</span>
            </p>
          </div>
        </div>
      </div>

      {/* Toolbox: Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau telepon pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4 whitespace-nowrap">Profil Pelanggan</th>
                <th className="px-6 py-4 whitespace-nowrap">Preferensi Utama</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Total Booking</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Nilai Pembelanjaan</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Aksi CRM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex justify-center mb-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    </div>
                    Memuat data CRM...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <p className="text-red-500 font-medium">{error}</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-900 mb-1">Tidak Ada Pelanggan</p>
                    <p className="text-xs">Belum ada pelanggan yang menyelesaikan pemesanan pada produk Anda.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                    
                    {/* Profil Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold shrink-0">
                          {c.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-1.5">
                            {c.userName}
                            {c.totalSpent > 1000000 && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            )}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.customerEmail}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Preference Column */}
                    <td className="px-6 py-4">
                      {c.topPreference !== '-' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-xs border border-indigo-100 max-w-[150px] truncate">
                          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{c.topPreference}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Belum Terekam</span>
                      )}
                    </td>

                    {/* Count Column */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-gray-900 text-base">{c.totalBookings}</span>
                      <span className="text-gray-500 text-xs ml-1 font-medium">kali</span>
                    </td>

                    {/* LTV / Spent Column */}
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(c.totalSpent)}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3" /> Last: {new Date(c.lastBookingDate).toLocaleDateString('id-ID')}
                      </p>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleWhatsApp(c)}
                          title="Hubungi via WhatsApp"
                          className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:text-primary-600 hover:border-primary-200 transition-colors text-xs font-bold shadow-sm"
                        >
                          Riwayat <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Block */}
        {totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Sebelumnya
            </button>
            <span className="text-sm font-bold text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* ======================= EXPERT DRAWER MODAL ======================= */}
      {selectedCustomer && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Profil Klien</h3>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Riwayat & Preferensi Loyalitas</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 border border-gray-100 shadow-sm transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Profile Card */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary-500/20 mb-4 tracking-tighter relative">
                  {selectedCustomer.userName.substring(0,2).toUpperCase()}
                  {selectedCustomer.totalSpent > 1000000 && (
                     <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md">
                       <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                     </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.userName}</h2>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" /> {selectedCustomer.customerEmail}</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gray-400" /> {selectedCustomer.customerPhone}</span>
                </div>
              </div>

              {/* CRM Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Transaksi</span>
                  <p className="text-2xl font-black text-gray-900 mt-1">{selectedCustomer.totalBookings} <span className="text-sm">Kali</span></p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Omzet</span>
                  <p className="text-xl font-bold text-emerald-600 mt-2">{formatCurrency(selectedCustomer.totalSpent)}</p>
                </div>
              </div>

              {/* History List */}
              <div>
                <h4 className="flex items-center text-sm font-bold text-gray-900 border-b pb-2 mb-4">
                  <ShoppingBag className="w-4 h-4 mr-2 text-primary-600" /> 
                  Riwayat Produk yang Pernah Disewa
                </h4>
                {selectedCustomer.bookingHistory.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedCustomer.bookingHistory.map((productTitle, idx) => (
                      <li key={idx} className="flex flex-col p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-primary-100 transition-colors">
                        <div className="flex justify-between items-start">
                           <span className="text-sm font-bold text-gray-700 leading-tight pr-4">{productTitle}</span>
                           {productTitle === selectedCustomer.topPreference && (
                             <span className="text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-200 shrink-0">Favorit</span>
                           )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">Riwayat tidak dapat diuraikan.</p>
                )}
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-white">
               <button 
                 onClick={() => handleWhatsApp(selectedCustomer)}
                 className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
               >
                 <MessageCircle className="w-5 h-5" /> Tawarkan Promo via WA
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default CustomerManagement;

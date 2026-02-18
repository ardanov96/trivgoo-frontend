import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  ChevronRight,
  Search
} from 'lucide-react';

// Tipe Data untuk Booking
interface Booking {
  id: string;
  productName: string;
  date: string;
  totalAmount: number;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'EXPIRED';
  image: string;
  location: string;
}

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  // Dummy data (Nanti diganti dengan fetch dari API Backend)
  const bookings: Booking[] = [
    {
      id: "INV-20240520-001",
      productName: "Bali Tropical Tour - Nusa Penida",
      date: "2024-05-20",
      totalAmount: 1500000,
      status: 'PAID',
      location: "Klungkung, Bali",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4"
    },
    {
      id: "INV-20240520-002",
      productName: "Staycation at Bubble Hotel",
      date: "2024-05-25",
      totalAmount: 2400000,
      status: 'PENDING',
      location: "Ubud, Bali",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'FAILED': 
      case 'EXPIRED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredBookings = activeTab === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Pesanan Saya</h1>
          <p className="text-sm text-gray-500">Kelola tiket dan riwayat perjalanan Anda</p>
        </div>

        {/* Tab Filter */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm mb-6 border border-gray-100">
          {(['ALL', 'PENDING', 'PAID'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'ALL' ? 'Semua' : tab === 'PENDING' ? 'Menunggu' : 'Berhasil'}
            </button>
          ))}
        </div>

        {/* List Pesanan */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                onClick={() => navigate(`/booking-detail/${booking.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={booking.image} alt="" className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusStyle(booking.status)}`}>
                        {booking.status === 'PAID' ? 'Berhasil' : booking.status === 'PENDING' ? 'Menunggu Bayar' : 'Gagal'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{booking.id}</span>
                    </div>
                    
                    <h3 className="font-bold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                      {booking.productName}
                    </h3>
                    
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Footer Card */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="text-xs text-gray-400">Total Pembayaran</div>
                  <div className="font-bold text-blue-600">Rp {booking.totalAmount.toLocaleString()}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Belum ada pesanan ditemukan</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-4 text-blue-600 text-sm font-bold hover:underline"
              >
                Mulai cari aktivitas seru
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyBookings;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Bell, BellOff, Mail, MessageSquare,
  Smartphone, Tag, ShoppingBag, Star, Megaphone,
  Shield, Info, Check, Volume2, VolumeX,
} from 'lucide-react';

interface NotifChannel {
  push: boolean;
  email: boolean;
  sms: boolean;
}

interface NotifCategory {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  channels: NotifChannel;
  important?: boolean;
}

const MyNotifications: React.FC = () => {
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd]   = useState('07:00');

  const [categories, setCategories] = useState<NotifCategory[]>([
    {
      id: 'booking',
      icon: <ShoppingBag className="w-5 h-5" />,
      iconBg: 'bg-primary-100', iconColor: 'text-primary-600',
      title: 'Status Booking & Pesanan',
      description: 'Konfirmasi, perubahan status, dan pengingat jadwal perjalanan',
      channels: { push: true, email: true, sms: true },
      important: true,
    },
    {
      id: 'payment',
      icon: <Shield className="w-5 h-5" />,
      iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
      title: 'Pembayaran & Refund',
      description: 'Konfirmasi pembayaran, invoice, dan update status refund',
      channels: { push: true, email: true, sms: false },
      important: true,
    },
    {
      id: 'promo',
      icon: <Tag className="w-5 h-5" />,
      iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
      title: 'Promo & Penawaran Spesial',
      description: 'Flash sale, voucher eksklusif, dan diskon terbatas',
      channels: { push: true, email: false, sms: false },
    },
    {
      id: 'price',
      icon: <Megaphone className="w-5 h-5" />,
      iconBg: 'bg-sky-100', iconColor: 'text-sky-600',
      title: 'Alert Harga Penerbangan',
      description: 'Notifikasi saat harga tiket mencapai target yang Anda set',
      channels: { push: true, email: true, sms: false },
    },
    {
      id: 'review',
      icon: <Star className="w-5 h-5" />,
      iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
      title: 'Ulasan & Feedback',
      description: 'Pengingat untuk memberikan ulasan setelah perjalanan selesai',
      channels: { push: true, email: false, sms: false },
    },
    {
      id: 'news',
      icon: <Info className="w-5 h-5" />,
      iconBg: 'bg-violet-100', iconColor: 'text-violet-600',
      title: 'Berita & Tips Perjalanan',
      description: 'Konten editorial, travel tips, dan rekomendasi destinasi',
      channels: { push: false, email: true, sms: false },
    },
  ]);

  const toggleChannel = (catId: string, channel: keyof NotifChannel) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      if (c.important && channel === 'push') return c; // can't disable push for important
      return { ...c, channels: { ...c.channels, [channel]: !c.channels[channel] } };
    }));
  };

  const toggleAllChannels = (catId: string, on: boolean) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return { ...c, channels: { push: c.important ? true : on, email: on, sms: on } };
    }));
  };

  const isCategoryOn = (cat: NotifCategory) =>
    cat.channels.push || cat.channels.email || cat.channels.sms;

  const CHANNELS = [
    { key: 'push'  as const, icon: <Smartphone className="w-4 h-4" />, label: 'Push' },
    { key: 'email' as const, icon: <Mail className="w-4 h-4" />,       label: 'Email' },
    { key: 'sms'   as const, icon: <MessageSquare className="w-4 h-4" />, label: 'SMS' },
  ];

  const enabledCount = categories.filter(isCategoryOn).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/my-account" className="hover:text-primary-600 transition-colors">Akun Saya</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">Pengaturan Notifikasi</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Notifikasi</h1>
          <p className="text-sm text-gray-500 mt-1">Kontrol penuh atas notifikasi yang Anda terima</p>
        </div>

        {/* Master toggle card */}
        <div className={`rounded-3xl p-6 mb-6 transition-all duration-300 ${masterEnabled ? 'bg-gradient-to-br from-primary-600 to-blue-700' : 'bg-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${masterEnabled ? 'bg-white/20' : 'bg-gray-300'}`}>
                {masterEnabled
                  ? <Bell className="w-6 h-6 text-white" />
                  : <BellOff className="w-6 h-6 text-gray-500" />
                }
              </div>
              <div>
                <p className={`font-bold text-base ${masterEnabled ? 'text-white' : 'text-gray-600'}`}>
                  {masterEnabled ? 'Notifikasi Aktif' : 'Semua Notifikasi Nonaktif'}
                </p>
                <p className={`text-xs mt-0.5 ${masterEnabled ? 'text-blue-200' : 'text-gray-400'}`}>
                  {masterEnabled ? `${enabledCount} dari ${categories.length} kategori diaktifkan` : 'Klik untuk mengaktifkan'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setMasterEnabled(!masterEnabled)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${masterEnabled ? 'bg-white/30' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${masterEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Quiet hours */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                {quietHours ? <VolumeX className="w-4 h-4 text-slate-600" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Jam Tenang</p>
                <p className="text-xs text-gray-400">Hentikan notifikasi push di jam tertentu</p>
              </div>
            </div>
            <button
              onClick={() => setQuietHours(!quietHours)}
              className={`relative w-11 h-6 rounded-full transition-colors ${quietHours ? 'bg-primary-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${quietHours ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          {quietHours && (
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Mulai</label>
                <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="text-gray-300 font-bold mt-4">—</div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Selesai</label>
                <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kategori Notifikasi</p>
        <div className={`space-y-3 transition-opacity ${masterEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Category header */}
              <div className="flex items-start justify-between p-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0`}>
                    <span className={cat.iconColor}>{cat.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{cat.title}</p>
                      {cat.important && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">Penting</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{cat.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAllChannels(cat.id, !isCategoryOn(cat))}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-3 ${isCategoryOn(cat) ? 'bg-primary-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isCategoryOn(cat) ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Channel toggles */}
              {isCategoryOn(cat) && (
                <div className="flex border-t border-gray-50">
                  {CHANNELS.map(ch => (
                    <button
                      key={ch.key}
                      onClick={() => toggleChannel(cat.id, ch.key)}
                      disabled={cat.important && ch.key === 'push'}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold transition-colors border-r border-gray-50 last:border-0
                        ${cat.channels[ch.key]
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-400 hover:bg-gray-50'
                        }
                        ${cat.important && ch.key === 'push' ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span className="relative">
                        {ch.icon}
                        {cat.channels[ch.key] && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </span>
                      {ch.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="mt-8 flex justify-end">
          <button className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary-600/20 active:scale-95">
            Simpan Pengaturan
          </button>
        </div>

        {/* Note */}
        <div className="mt-4 flex items-start gap-2.5 bg-gray-100 rounded-2xl p-4">
          <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">Notifikasi bertanda <strong>Penting</strong> tidak dapat dinonaktifkan sepenuhnya karena berkaitan dengan keamanan dan status transaksi Anda.</p>
        </div>
      </div>
    </div>
  );
};

export default MyNotifications;

// pages/Sitemap.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import SEO from '../components/SEO';
import {
  Home, Compass, Sparkles, Heart, BookOpen,
  User, Shield, FileText, Phone, Info, Briefcase,
  Newspaper, PenSquare, HelpCircle, Map, CreditCard,
  Star, Gift, Users, Bell, ChevronRight, Lock,
} from 'lucide-react';

type AccessLevel = 'public' | 'customer' | 'agent';

interface SitemapLink {
  label:  string;
  path:   string;
  icon:   React.ElementType;
  desc?:  string;
  access: AccessLevel;
}

interface SitemapSection {
  title:  string;
  color:  string;
  iconBg: string;
  links:  SitemapLink[];
}

// ── Badge per access level ───────────────────────────────────────────────────
const AccessBadge = ({ access }: { access: AccessLevel }) => {
  if (access === 'public') return null;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0
      ${access === 'customer'
        ? 'bg-blue-50 text-blue-600 border border-blue-100'
        : 'bg-orange-50 text-orange-600 border border-orange-100'
      }`}>
      <Lock className="w-2.5 h-2.5" />
      {access === 'customer' ? 'Login' : 'Agen'}
    </span>
  );
};

const Sitemap: React.FC = () => {
  const { t } = useTranslation();
  const { langPath } = useLangNavigate();
  const { user } = useAuth();

  /**
   * Aturan akses:
   * - 'public'   → semua orang bisa akses
   * - 'customer' → harus login sebagai customer (agent TIDAK bisa akses halaman customer)
   * - 'agent'    → harus login sebagai agent
   *
   * Jika belum login → hanya public yang bisa diklik.
   */
  const canAccess = (access: AccessLevel): boolean => {
    if (access === 'public') return true;
    if (!user) return false;
    if (access === 'customer') return user.role === UserRole.CUSTOMER;
    if (access === 'agent')    return user.role === UserRole.AGENT;
    return false;
  };

  const sections: SitemapSection[] = [
    {
      title:  'Halaman Utama',
      color:  'text-primary-700',
      iconBg: 'bg-primary-50 border-primary-100',
      links: [
        { label: 'Beranda',           path: '/',           icon: Home,       desc: 'Halaman utama Trivgoo',                  access: 'public'   },
        { label: 'Explore',           path: '/explore',    icon: Compass,    desc: 'Jelajahi semua produk & paket wisata',   access: 'public'   },
        { label: 'AI Trip Planner',   path: '/ai-planner', icon: Sparkles,   desc: 'Rencanakan perjalanan dengan AI',         access: 'public'   },
        { label: 'Wishlist',          path: '/wishlist',   icon: Heart,      desc: 'Produk yang kamu simpan',                access: 'public'   },
        { label: 'TrivPay',           path: '/trivpay',    icon: CreditCard, desc: 'Layanan pembayaran Trivgoo',             access: 'public'   },
      ],
    },
    {
      title:  'Akun',
      color:  'text-blue-700',
      iconBg: 'bg-blue-50 border-blue-100',
      links: [
        { label: 'Login',               path: '/login',           icon: User,      desc: 'Masuk ke akun kamu',               access: 'public'   },
        { label: 'Daftar',              path: '/register',        icon: Users,     desc: 'Buat akun baru',                   access: 'public'   },
        { label: 'Daftar sebagai Agen', path: '/register/agent',  icon: Briefcase, desc: 'Bergabung sebagai mitra agen',     access: 'public'   },
        { label: 'Lupa Password',       path: '/forgot-password', icon: Lock,      desc: 'Reset kata sandi akun',            access: 'public'   },
      ],
    },
    {
      title:  'Pemesanan & Akun Saya',
      color:  'text-blue-700',
      iconBg: 'bg-blue-50 border-blue-100',
      links: [
        { label: 'Pesanan Saya',   path: '/my-bookings',      icon: BookOpen,   desc: 'Riwayat & status pemesanan',   access: 'customer' },
        { label: 'Akun Saya',      path: '/my-account',       icon: User,       desc: 'Pengaturan profil',            access: 'customer' },
        { label: 'Notifikasi',     path: '/my-notifications', icon: Bell,       desc: 'Pusat notifikasi',             access: 'customer' },
        { label: 'Kartu Saya',     path: '/my-cards',         icon: CreditCard, desc: 'Kelola metode pembayaran',     access: 'customer' },
        { label: 'Refund Saya',    path: '/my-refunds',       icon: BookOpen,   desc: 'Pantau proses refund',         access: 'customer' },
        { label: 'Penumpang Saya', path: '/my-passengers',    icon: Users,      desc: 'Data penumpang tersimpan',     access: 'customer' },
      ],
    },
    {
      title:  'Loyalitas & Member',
      color:  'text-amber-700',
      iconBg: 'bg-amber-50 border-amber-100',
      links: [
        { label: 'Program Loyalitas', path: '/loyalty',            icon: Star,   desc: 'Kumpulkan & tukar poin',         access: 'customer' },
        { label: 'Tukar Poin',        path: '/loyalty/redeem',     icon: Gift,   desc: 'Gunakan poin untuk diskon',      access: 'customer' },
        { label: 'Membership',        path: '/loyalty/membership', icon: Shield, desc: 'Tingkatkan level keanggotaan',   access: 'customer' },
      ],
    },
    {
      title:  'Dashboard Agen',
      color:  'text-orange-700',
      iconBg: 'bg-orange-50 border-orange-100',
      links: [
        { label: 'Dashboard Agen',   path: '/agent',                  icon: Home,       desc: 'Ringkasan performa agen',         access: 'agent' },
        { label: 'Produk Saya',      path: '/agent/products',         icon: Compass,    desc: 'Kelola listing produk',           access: 'agent' },
        { label: 'Pemesanan',        path: '/agent/bookings',         icon: BookOpen,   desc: 'Kelola pesanan dari pelanggan',   access: 'agent' },
        { label: 'Voucher',          path: '/agent/vouchers',         icon: Gift,       desc: 'Buat & kelola voucher promo',     access: 'agent' },
        { label: 'Komisi',           path: '/agent/commissions',      icon: CreditCard, desc: 'Pantau komisi & pendapatan',      access: 'agent' },
        { label: 'Profil Agen',      path: '/agent/profile/settings', icon: User,       desc: 'Pengaturan profil bisnis',        access: 'agent' },
      ],
    },
    {
      title:  'Perusahaan',
      color:  'text-green-700',
      iconBg: 'bg-green-50 border-green-100',
      links: [
        { label: 'Tentang Kami',  path: '/about-us',       icon: Info,      desc: 'Kenali Trivgoo lebih dalam',     access: 'public' },
        { label: 'Karier',        path: '/career',          icon: Briefcase, desc: 'Bergabung dengan tim kami',      access: 'public' },
        { label: 'Press & Media', path: '/press-and-media', icon: Newspaper, desc: 'Siaran pers & liputan media',    access: 'public' },
        { label: 'Travel Blog',   path: '/travel-blog',     icon: PenSquare, desc: 'Inspirasi & tips perjalanan',    access: 'public' },
      ],
    },
    {
      title:  'Dukungan & Legal',
      color:  'text-gray-700',
      iconBg: 'bg-gray-50 border-gray-200',
      links: [
        { label: 'Pusat Bantuan',       path: '/help-center',       icon: HelpCircle, desc: 'FAQ & panduan pengguna',           access: 'public' },
        { label: 'Hubungi Kami',        path: '/contact-us',        icon: Phone,      desc: 'Kirim pesan ke tim kami',          access: 'public' },
        { label: 'Syarat & Ketentuan',  path: '/terms-and-service', icon: FileText,   desc: 'Aturan penggunaan layanan',        access: 'public' },
        { label: 'Kebijakan Privasi',   path: '/privacy-policy',    icon: Shield,     desc: 'Bagaimana kami menjaga datamu',    access: 'public' },
        { label: 'Sitemap',             path: '/sitemap',            icon: Map,        desc: 'Peta seluruh halaman',             access: 'public' },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Sitemap — Trivgoo"
        description="Temukan semua halaman yang tersedia di Trivgoo. Navigasi lengkap untuk semua fitur, layanan, dan informasi."
      />

      <div className="min-h-screen bg-gray-50 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <Link to={langPath('/')} className="hover:text-primary-600 transition-colors font-medium">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-600 font-semibold">Sitemap</span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Map className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">Sitemap</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  Peta lengkap seluruh halaman yang tersedia di Trivgoo
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">Keterangan:</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-400 shrink-0" />
                Dapat diakses semua orang
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-600">
                <Lock className="w-3 h-3" />
                Perlu login sebagai Customer
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-orange-600">
                <Lock className="w-3 h-3" />
                Perlu login sebagai Agen
              </span>
            </div>
          </div>

          {/* Section grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Section header */}
                <div className="px-5 py-4 border-b border-gray-50">
                  <h2 className={`text-sm font-extrabold uppercase tracking-wider ${section.color}`}>
                    {section.title}
                  </h2>
                </div>

                {/* Links */}
                <div className="p-3 space-y-1">
                  {section.links.map((item) => {
                    const Icon       = item.icon;
                    const accessible = canAccess(item.access);

                    const content = (
                      <>
                        {/* Icon box */}
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors
                          ${accessible
                            ? `${section.iconBg} group-hover:border-primary-200 group-hover:bg-primary-50`
                            : 'bg-gray-100 border-gray-200'
                          }`}>
                          <Icon className={`w-4 h-4 transition-colors
                            ${accessible
                              ? `${section.color} group-hover:text-primary-600`
                              : 'text-gray-300'
                            }`} />
                        </div>

                        {/* Label + desc */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold transition-colors
                              ${accessible
                                ? 'text-gray-800 group-hover:text-primary-700'
                                : 'text-gray-300'
                              }`}>
                              {item.label}
                            </p>
                            <AccessBadge access={item.access} />
                          </div>
                          {item.desc && (
                            <p className={`text-[11px] truncate mt-0.5 ${accessible ? 'text-gray-400' : 'text-gray-300'}`}>
                              {item.desc}
                            </p>
                          )}
                        </div>

                        {/* Right icon */}
                        {accessible
                          ? <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 shrink-0 transition-colors" />
                          : <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        }
                      </>
                    );

                    // Render sebagai <Link> hanya jika accessible, sisanya <div> non-interaktif
                    return accessible ? (
                      <Link
                        key={item.path}
                        to={langPath(item.path)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all group"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        key={item.path}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-40 cursor-not-allowed select-none"
                        title={
                          item.access === 'customer'
                            ? 'Halaman ini memerlukan login sebagai Customer'
                            : 'Halaman ini memerlukan login sebagai Agen'
                        }
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div className="mt-10 text-center space-y-1">
            {!user && (
              <p className="text-xs text-gray-400">
                <Link to={langPath('/login')} className="text-primary-600 font-semibold hover:underline">
                  Login
                </Link>{' '}
                untuk mengakses halaman yang terkunci.
              </p>
            )}
            <p className="text-xs text-gray-400">
             Note: · Semua halaman terdaftar di atas dapat berubah sewaktu-waktu.
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sitemap;

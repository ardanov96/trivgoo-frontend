import {
  ArrowRight,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Quote,
  Users,
  Video,
  Image,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';

/* ─── Typed cubic-bezier ─── */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Shared variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 44 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: EASE, delay: i * 0.1 },
  }),
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.55, ease: EASE, delay: i * 0.1 },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Scroll-reveal hook ─── */
function useReveal(amount = 0.12) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  return { ref, inView };
}

/* ══ interfaces ══ */
interface PressRelease {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: 'Pengumuman' | 'Kemitraan' | 'Penghargaan' | 'Ekspansi';
  downloadUrl: string;
  isNew?: boolean;
}

interface MediaAsset {
  id: number;
  type: 'image' | 'video' | 'logo' | 'press-kit';
  title: string;
  description: string;
  thumbnail: string;
  downloadUrl: string;
  format: string;
  size: string;
}

interface PressCoverage {
  id: number;
  outlet: string;
  logo: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
  type: 'Artikel' | 'Wawancara' | 'Ulasan' | 'Feature';
}

const PressAndMedia: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  /* scroll-reveal refs */
  const pressRef    = useReveal();
  const coverageRef = useReveal();
  const assetsRef   = useReveal();
  const contactRef  = useReveal();
  const ctaReveal   = useReveal();

  /* ── data ── */
  const pressReleases: PressRelease[] = [
    {
      id: 1,
      title: 'Trivgoo Raih Pendanaan Seri B $15 Juta untuk Ekspansi Asia Tenggara',
      summary: 'Putaran pendanaan dipimpin Sequoia Capital untuk mempercepat pertumbuhan dan pengembangan teknologi di sektor perjalanan.',
      date: '15 Maret 2024',
      category: 'Pengumuman',
      downloadUrl: '#',
      isNew: true,
    },
    {
      id: 2,
      title: 'Kemitraan dengan Badan Pariwisata Indonesia untuk Pariwisata Berkelanjutan',
      summary: 'Kolaborasi bertujuan mempromosikan destinasi ramah lingkungan dan mendukung komunitas lokal di seluruh Nusantara.',
      date: '10 Maret 2024',
      category: 'Kemitraan',
      downloadUrl: '#',
    },
    {
      id: 3,
      title: 'Trivgoo Raih "Inovasi Perjalanan Terbaik" di Asia Tech Awards 2024',
      summary: 'Penghargaan atas teknologi perencanaan perjalanan bertenaga AI yang mempersonalisasi pengalaman wisata.',
      date: '28 Februari 2024',
      category: 'Penghargaan',
      downloadUrl: '#',
    },
    {
      id: 4,
      title: 'Ekspansi ke Pasar Vietnam dan Thailand Diumumkan',
      summary: 'Kantor baru dibuka di Hanoi dan Bangkok untuk memenuhi permintaan yang terus tumbuh di Asia Tenggara.',
      date: '15 Februari 2024',
      category: 'Ekspansi',
      downloadUrl: '#',
    },
    {
      id: 5,
      title: 'Peluncuran Inisiatif Perjalanan Bebas Karbon',
      summary: 'Program baru memungkinkan wisatawan mengimbangi jejak karbon mereka melalui proyek lingkungan yang terverifikasi.',
      date: '5 Februari 2024',
      category: 'Pengumuman',
      downloadUrl: '#',
    },
    {
      id: 6,
      title: 'Kemitraan dengan Singapore Airlines untuk Pemesanan Terpadu',
      summary: 'Kolaborasi strategis untuk menawarkan pemesanan penerbangan dan pengalaman wisata secara seamless dalam satu platform.',
      date: '22 Januari 2024',
      category: 'Kemitraan',
      downloadUrl: '#',
    },
  ];

  const mediaAssets: MediaAsset[] = [
    {
      id: 1,
      type: 'logo',
      title: 'Paket Logo Trivgoo',
      description: 'Set logo lengkap dalam berbagai format dan variasi warna',
      thumbnail: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'ZIP (SVG, PNG, EPS)',
      size: '45 MB',
    },
    {
      id: 2,
      type: 'image',
      title: 'Fotografi Brand',
      description: 'Gambar resolusi tinggi destinasi dan tim Trivgoo',
      thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'ZIP (JPG, PNG)',
      size: '2,3 GB',
    },
    {
      id: 3,
      type: 'video',
      title: 'Video Brand Story',
      description: 'Video ikhtisar perusahaan dan pernyataan misi Trivgoo',
      thumbnail: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'MP4 (4K, 1080p)',
      size: '1,8 GB',
    },
    {
      id: 4,
      type: 'press-kit',
      title: 'Press Kit Lengkap',
      description: 'Semua aset media dan informasi perusahaan dalam satu paket',
      thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'PDF + ZIP',
      size: '3,2 GB',
    },
    {
      id: 5,
      type: 'image',
      title: 'Foto Tim Eksekutif',
      description: 'Foto profesional para pemimpin dan tim inti Trivgoo',
      thumbnail: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'JPG',
      size: '850 MB',
    },
    {
      id: 6,
      type: 'video',
      title: 'Video Demo Produk',
      description: 'Panduan platform dan demonstrasi fitur unggulan',
      thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'MP4',
      size: '2,1 GB',
    },
  ];

  const pressCoverage: PressCoverage[] = [
    {
      id: 1,
      outlet: 'TechCrunch',
      logo: 'https://logo.clearbit.com/techcrunch.com',
      title: 'Bagaimana AI Mengubah Perencanaan Perjalanan di Asia Tenggara',
      excerpt: 'Pendekatan inovatif Trivgoo menggunakan machine learning untuk menciptakan itinerari yang dipersonalisasi...',
      url: '#',
      date: '18 Maret 2024',
      type: 'Feature',
    },
    {
      id: 2,
      outlet: 'Forbes',
      logo: 'https://logo.clearbit.com/forbes.com',
      title: 'Startup yang Menjadikan Perjalanan Mewah Terjangkau untuk Semua',
      excerpt: 'Wawancara dengan CEO Trivgoo tentang demokratisasi pengalaman perjalanan premium...',
      url: '#',
      date: '12 Maret 2024',
      type: 'Wawancara',
    },
    {
      id: 3,
      outlet: 'Travel + Leisure',
      logo: 'https://logo.clearbit.com/travelandleisure.com',
      title: '10 Inovasi Teknologi Perjalanan Terbaik 2024',
      excerpt: 'Perencana perjalanan AI Trivgoo berhasil masuk daftar inovasi tahunan bergengsi ini...',
      url: '#',
      date: '5 Maret 2024',
      type: 'Ulasan',
    },
    {
      id: 4,
      outlet: 'The Jakarta Post',
      logo: 'https://logo.clearbit.com/thejakartapost.com',
      title: 'Startup Indonesia Berekspansi ke Seluruh Kawasan ASEAN',
      excerpt: 'Kisah sukses lokal merambah regional dengan pendanaan baru dan berbagai kemitraan strategis...',
      url: '#',
      date: '25 Februari 2024',
      type: 'Artikel',
    },
    {
      id: 5,
      outlet: 'Bloomberg',
      logo: 'https://logo.clearbit.com/bloomberg.com',
      title: 'Investor Menaruh Harapan Besar pada Teknologi Perjalanan Asia',
      excerpt: 'Analisis putaran pendanaan terbaru termasuk Seri B Trivgoo yang menarik perhatian pasar...',
      url: '#',
      date: '20 Februari 2024',
      type: 'Feature',
    },
    {
      id: 6,
      outlet: 'CNN Travel',
      logo: 'https://logo.clearbit.com/cnn.com',
      title: 'Pariwisata Berkelanjutan Mendapat Sentuhan Teknologi Terkini',
      excerpt: 'Bagaimana teknologi membantu wisatawan membuat pilihan ramah lingkungan yang lebih bijak...',
      url: '#',
      date: '15 Februari 2024',
      type: 'Artikel',
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: 'Pertanyaan Pers',
      detail: 'press@trivgoo.com',
      link: 'mailto:press@trivgoo.com',
    },
    {
      icon: Phone,
      title: 'Hubungan Media',
      detail: '+62 21 1234 5678 ext. 2',
      link: 'tel:+622112345678',
    },
    {
      icon: Users,
      title: 'Permintaan Narasumber',
      detail: 'Ajukan permintaan wawancara media',
      link: '#contact-form',
    },
  ];

  /* animated hero items — floating newspaper/media snippets */
  const mediaSnippets = [
    { text: '📰 BREAKING NEWS',  left: '6%',  delay: '0s',   size: 12, dur: 16 },
    { text: '{ press }',          left: '16%', delay: '2.5s', size: 11, dur: 20 },
    { text: '▶ LIVE UPDATE',      left: '27%', delay: '1s',   size: 13, dur: 14 },
    { text: 'HEADLINE',         left: '40%', delay: '4s',   size: 11, dur: 18 },
    { text: 'BERITA TERKINI',     left: '54%', delay: '0.5s', size: 12, dur: 22 },
    { text: 'SIARAN PERS',        left: '65%', delay: '3s',   size: 11, dur: 15 },
    { text: '📡 on air',          left: '76%', delay: '1.5s', size: 13, dur: 17 },
    { text: 'media()',            left: '87%', delay: '2s',   size: 11, dur: 19 },
    { text: 'TERBITKAN SEKARANG',      left: '11%', delay: '5.5s', size: 10, dur: 21 },
    { text: 'EKSKLUSIF',        left: '48%', delay: '6.5s', size: 12, dur: 16 },
    { text: 'report++',           left: '33%', delay: '7s',   size: 11, dur: 18 },
    { text: '📸GALERI FOTO',       left: '72%', delay: '3.5s', size: 10, dur: 20 },
  ];

  const floatingOrbs = [
    { w: 340, h: 340, top: '8%',  left: '-6%', color: 'rgba(255,170,130,0.13)', dur: 9  },
    { w: 260, h: 260, top: '55%', left: '72%', color: 'rgba(255,255,255,0.07)', dur: 12 },
    { w: 210, h: 210, top: '25%', left: '52%', color: 'rgba(251,191,36,0.08)',  dur: 8  },
    { w: 170, h: 170, top: '72%', left: '18%', color: 'rgba(255,130,90,0.11)',  dur: 10 },
  ];

  const getCategoryColor = (category: PressRelease['category']) => {
    switch (category) {
      case 'Pengumuman': return 'bg-blue-100 text-blue-700';
      case 'Kemitraan':  return 'bg-green-100 text-green-700';
      case 'Penghargaan':return 'bg-amber-100 text-amber-700';
      case 'Ekspansi':   return 'bg-purple-100 text-purple-700';
      default:           return 'bg-gray-100 text-gray-700';
    }
  };

  const getAssetIcon = (type: MediaAsset['type']) => {
    switch (type) {
      case 'logo':      return <Image className="w-5 h-5" />;
      case 'image':     return <Image className="w-5 h-5" />;
      case 'video':     return <Video className="w-5 h-5" />;
      case 'press-kit': return <FileText className="w-5 h-5" />;
      default:          return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes floatMedia {
          0%   { transform: translateY(110px) rotate(-5deg); opacity: 0; }
          8%   { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(calc(-100vh - 80px)) rotate(3deg); opacity: 0; }
        }
        @keyframes orbPulse {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.9; transform: scale(1.07); }
        }
        @keyframes gridDrift {
          0%   { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }
        @keyframes scanH {
          0%   { transform: translateY(0);    opacity: 0.12; }
          50%  { opacity: 0.25; }
          100% { transform: translateY(100vh); opacity: 0.12; }
        }
        @keyframes glowDot {
          0%,100% { opacity: 0.3; }
          50%      { opacity: 0.7; }
        }
        .grid-drift { animation: gridDrift 4s linear infinite; }
        .scan-h     { animation: scanH 5s linear infinite; }
      `}</style>

      {/* ════════════════════════════════
          1. HERO — Animated press/media bg
      ════════════════════════════════ */}
      <div
        className="relative text-white overflow-hidden"
        style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #5a1209 0%, #8c2518 30%, #b83428 60%, #E05845 100%)' }}
      >
        {/* dot grid */}
        <div
          className="absolute inset-0 grid-drift"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,210,190,0.22) 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }}
        />

        {/* circuit grid + nodes */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {[18,35,52,70,85].map((y,i)=>(
            <line key={`h${i}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="rgba(255,220,200,0.6)" strokeWidth="0.5" strokeDasharray="12 8"/>
          ))}
          {[8,22,38,55,70,88].map((x,i)=>(
            <line key={`v${i}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="rgba(255,220,200,0.4)" strokeWidth="0.5" strokeDasharray="8 10"/>
          ))}
          {[[8,18],[22,35],[38,52],[55,70],[70,35],[88,85],[22,70],[55,18],[38,85]].map(([x,y],i)=>(
            <circle key={`c${i}`} cx={`${x}%`} cy={`${y}%`} r="3" fill="rgba(255,200,160,0.5)"
              style={{ animation:`glowDot ${3+i*0.4}s ease-in-out infinite ${i*0.35}s` }}/>
          ))}
        </svg>

        {/* glowing orbs */}
        {floatingOrbs.map((o, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none" style={{
            width: o.w, height: o.h, top: o.top, left: o.left,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            animation: `orbPulse ${o.dur}s ease-in-out infinite ${i * 1.5}s`,
          }} />
        ))}

        {/* floating media snippets — bottom to top */}
        {mediaSnippets.map((s, i) => (
          <div key={i} className="absolute pointer-events-none font-mono font-bold select-none" style={{
            bottom: 0, left: s.left, fontSize: s.size,
            color: 'rgba(255,220,200,0.55)',
            animation: `floatMedia ${s.dur}s linear infinite ${s.delay}`,
            whiteSpace: 'nowrap',
          }}>
            {s.text}
          </div>
        ))}

        {/* scan line */}
        <div className="scan-h absolute inset-x-0 pointer-events-none" style={{ height: '2px', top: 0, background: 'linear-gradient(90deg, transparent, rgba(255,200,170,0.35), transparent)' }} />
        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-36" style={{ background: 'linear-gradient(to bottom, transparent, rgba(70,10,5,0.55))' }} />

        {/* Hero Content */}
        <div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center justify-center"
          style={{ minHeight: '100vh' }}
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20"
            >
              Pers & Media
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.4, ease: EASE }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight"
            >
              Informasi Resmi untuk <br />
              <motion.span
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-300 inline-block"
              >
                Rekan Media
              </motion.span>
            </motion.h1>

          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          2. SIARAN PERS
      ════════════════════════════════ */}
      <div className="bg-gray-50 py-20 md:py-28" ref={pressRef.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate={pressRef.inView ? 'visible' : 'hidden'}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                Siaran Pers
              </h2>
            </motion.div>
            <motion.div
              className="mt-4 md:mt-0"
              variants={fadeRight}
              initial="hidden"
              animate={pressRef.inView ? 'visible' : 'hidden'}
            >
              <button className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center">
                Lihat Semua Siaran <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={stagger}
            initial="hidden"
            animate={pressRef.inView ? 'visible' : 'hidden'}
          >
            {pressReleases.map((release, idx) => (
              <motion.div
                key={release.id}
                variants={fadeUp}
                custom={idx}
                whileHover={{ y: -5, boxShadow: '0 20px 50px rgba(0,0,0,0.09)' }}
                className="bg-white rounded-3xl p-8 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(release.category)}`}>
                    {release.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{release.date}</span>
                    {release.isNew && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        BARU
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{release.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{release.summary}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <a href={release.downloadUrl} className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Unduh PDF
                  </a>
                  <button className="text-gray-500 hover:text-gray-700">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════
          3. LIPUTAN MEDIA
      ════════════════════════════════ */}
      <div className="bg-white py-20 md:py-28" ref={coverageRef.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            animate={coverageRef.inView ? 'visible' : 'hidden'}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Artikel Resmi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Artikel dan ulasan terbaru tentang Trivgoo di berbagai publikasi terkemuka.
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={stagger}
            initial="hidden"
            animate={coverageRef.inView ? 'visible' : 'hidden'}
          >
            {pressCoverage.map((coverage, idx) => (
              <motion.div
                key={coverage.id}
                variants={fadeUp}
                custom={idx}
                whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}
                className="bg-gray-50 rounded-3xl p-8 border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      <img src={coverage.logo} alt={coverage.outlet} className="w-12 h-12 object-contain" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{coverage.title}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-bold text-gray-700">{coverage.outlet}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                            {coverage.type}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 mt-2 md:mt-0">{coverage.date}</span>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">{coverage.excerpt}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <a href={coverage.url} target="_blank" rel="noopener noreferrer"
                        className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center">
                        Baca Artikel <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Quote className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════
          4. ASET MEDIA
      ════════════════════════════════ */}
      <div className="bg-gray-50 py-20 md:py-28" ref={assetsRef.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            animate={assetsRef.inView ? 'visible' : 'hidden'}
          >
            <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">
              Unduh Materi
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Aset Media
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unduh logo, foto, video, dan materi brand resmi Trivgoo untuk keperluan peliputan media Anda.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={stagger}
            initial="hidden"
            animate={assetsRef.inView ? 'visible' : 'hidden'}
          >
            {mediaAssets.map((asset, idx) => (
              <motion.div
                key={asset.id}
                variants={scaleIn}
                custom={idx}
                whileHover={{ y: -6, boxShadow: '0 24px 55px rgba(0,0,0,0.11)' }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 group cursor-default"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={asset.thumbnail} alt={asset.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                      {getAssetIcon(asset.type)}
                      <span className="ml-1 capitalize">{asset.type === 'press-kit' ? 'Press Kit' : asset.type === 'logo' ? 'Logo' : asset.type === 'image' ? 'Gambar' : 'Video'}</span>
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{asset.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{asset.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-5">
                    <span className="bg-gray-100 px-2 py-1 rounded">{asset.format}</span>
                    <span>{asset.size}</span>
                  </div>

                  <motion.button
                    onClick={() => setSelectedAsset(asset)}
                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Download className="w-4 h-4 mr-2" /> Unduh Sekarang
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════
          5. KONTAK MEDIA
      ════════════════════════════════ */}
      <div className="bg-white py-20 md:py-28" ref={contactRef.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-8 md:p-12">

            <motion.div
              className="text-center mb-12"
              variants={fadeUp}
              initial="hidden"
              animate={contactRef.inView ? 'visible' : 'hidden'}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Kontak Media
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hubungi tim hubungan media kami untuk wawancara, pernyataan resmi, atau informasi tambahan.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
              variants={stagger}
              initial="hidden"
              animate={contactRef.inView ? 'visible' : 'hidden'}
            >
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <motion.a
                    key={index}
                    href={contact.link}
                    variants={scaleIn}
                    custom={index}
                    whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.09)' }}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 transition-all duration-300 block"
                  >
                    <div className="p-3 bg-primary-50 rounded-xl inline-block mb-4 text-primary-600 group-hover:bg-primary-100 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{contact.title}</h3>
                    <p className="text-gray-600">{contact.detail}</p>
                  </motion.a>
                );
              })}
            </motion.div>

            {/* Formulir Permintaan Media */}
            <motion.div
              className="bg-white rounded-2xl p-8 border border-gray-100"
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate={contactRef.inView ? 'visible' : 'hidden'}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Formulir Permintaan Media</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap *</label>
                    <input type="text" required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama Anda" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Media / Institusi *</label>
                    <input type="text" required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama media atau organisasi Anda" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email *</label>
                    <input type="email" required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="email@contoh.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Telepon</label>
                    <input type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="cth: 081234567890" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Permintaan *</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Pilih jenis permintaan</option>
                    <option>Permintaan Wawancara</option>
                    <option>Pernyataan Pers</option>
                    <option>Kemitraan Media</option>
                    <option>Liputan Acara</option>
                    <option>Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pesan *</label>
                  <textarea rows={4} required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Jelaskan keperluan atau permintaan media Anda di sini..." />
                </div>

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Kirim Permintaan
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          6. CTA SECTION
      ════════════════════════════════ */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>

        {/* reveal wrapper */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ctaReveal.ref}>
          <motion.h2
            className="text-3xl md:text-5xl font-serif font-bold mb-6"
            variants={fadeUp}
            initial="hidden"
            animate={ctaReveal.inView ? 'visible' : 'hidden'}
          >
            Ada Pertanyaan untuk Tim Kami?
          </motion.h2>
          <motion.p
            className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto"
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate={ctaReveal.inView ? 'visible' : 'hidden'}
          >
            Tim hubungan media kami siap membantu Anda mendapatkan informasi yang dibutuhkan untuk peliputan.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={stagger}
            initial="hidden"
            animate={ctaReveal.inView ? 'visible' : 'hidden'}
          >
            <motion.div variants={scaleIn} custom={0} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <a href="mailto:press@trivgoo.com"
                className="inline-block px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl">
                Hubungi Tim Pers
              </a>
            </motion.div>
            <motion.div variants={scaleIn} custom={1} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/about-us"
                className="inline-block px-8 py-4 bg-primary-800 text-white rounded-full font-bold text-lg border border-primary-500 hover:bg-primary-900 transition-all shadow-xl">
                Tentang Trivgoo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PressAndMedia;

import type { Variants } from 'framer-motion';

// ── Easing ────────────────────────────────────────────────────────────────────
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Animation variants ────────────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 44 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: EASE, delay: i * 0.1 },
  }),
};

export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.55, ease: EASE, delay: i * 0.1 },
  }),
};

export const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Keyframe styles ───────────────────────────────────────────────────────────
export const HERO_STYLES = `
  @keyframes floatMedia {
    0%   { transform: translateY(110px) rotate(-5deg); opacity: 0; }
    8%   { opacity: 1; }
    88%  { opacity: 1; }
    100% { transform: translateY(calc(-100vh - 80px)) rotate(3deg); opacity: 0; }
  }
  @keyframes orbPulse {
    0%,100% { opacity: 0.5; transform: scale(1); }
    50%     { opacity: 0.9; transform: scale(1.07); }
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
    50%     { opacity: 0.7; }
  }
  .grid-drift { animation: gridDrift 4s linear infinite; }
  .scan-h     { animation: scanH 5s linear infinite; }
`;

// ── Hero data ─────────────────────────────────────────────────────────────────
export const MEDIA_SNIPPETS = [
  { text: '📰 BREAKING NEWS',  left: '6%',  delay: '0s',   size: 12, dur: 16 },
  { text: '{ press }',          left: '16%', delay: '2.5s', size: 11, dur: 20 },
  { text: '▶ LIVE UPDATE',      left: '27%', delay: '1s',   size: 13, dur: 14 },
  { text: 'HEADLINE',           left: '40%', delay: '4s',   size: 11, dur: 18 },
  { text: 'BERITA TERKINI',     left: '54%', delay: '0.5s', size: 12, dur: 22 },
  { text: 'SIARAN PERS',        left: '65%', delay: '3s',   size: 11, dur: 15 },
  { text: '📡 on air',          left: '76%', delay: '1.5s', size: 13, dur: 17 },
  { text: 'media()',            left: '87%', delay: '2s',   size: 11, dur: 19 },
  { text: 'TERBITKAN SEKARANG', left: '11%', delay: '5.5s', size: 10, dur: 21 },
  { text: 'EKSKLUSIF',          left: '48%', delay: '6.5s', size: 12, dur: 16 },
  { text: 'report++',           left: '33%', delay: '7s',   size: 11, dur: 18 },
  { text: '📸GALERI FOTO',      left: '72%', delay: '3.5s', size: 10, dur: 20 },
];

export const FLOATING_ORBS = [
  { w: 340, h: 340, top: '8%',  left: '-6%', color: 'rgba(255,170,130,0.13)', dur: 9  },
  { w: 260, h: 260, top: '55%', left: '72%', color: 'rgba(255,255,255,0.07)', dur: 12 },
  { w: 210, h: 210, top: '25%', left: '52%', color: 'rgba(251,191,36,0.08)',  dur: 8  },
  { w: 170, h: 170, top: '72%', left: '18%', color: 'rgba(255,130,90,0.11)',  dur: 10 },
];

export const CIRCUIT_H = [18, 35, 52, 70, 85];
export const CIRCUIT_V = [8, 22, 38, 55, 70, 88];
export const CIRCUIT_DOTS = [[8,18],[22,35],[38,52],[55,70],[70,35],[88,85],[22,70],[55,18],[38,85]];

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PressRelease {
  id:          number;
  title:       string;
  summary:     string;
  date:        string;
  category:    'Pengumuman' | 'Kemitraan' | 'Penghargaan' | 'Ekspansi';
  downloadUrl: string;
  isNew?:      boolean;
}

export interface MediaAsset {
  id:          number;
  type:        'image' | 'video' | 'logo' | 'press-kit';
  title:       string;
  description: string;
  thumbnail:   string;
  downloadUrl: string;
  format:      string;
  size:        string;
}

export interface PressCoverage {
  id:      number;
  outlet:  string;
  logo:    string;
  title:   string;
  excerpt: string;
  url:     string;
  date:    string;
  type:    'Artikel' | 'Wawancara' | 'Ulasan' | 'Feature';
}

// ── Press releases ────────────────────────────────────────────────────────────
export const PRESS_RELEASES: PressRelease[] = [
  { id:1, title:'Trivgoo Raih Pendanaan Seri B $15 Juta untuk Ekspansi Asia Tenggara',  summary:'Putaran pendanaan dipimpin Sequoia Capital untuk mempercepat pertumbuhan dan pengembangan teknologi di sektor perjalanan.',              date:'15 Maret 2024',   category:'Pengumuman', downloadUrl:'#', isNew:true },
  { id:2, title:'Kemitraan dengan Badan Pariwisata Indonesia untuk Pariwisata Berkelanjutan', summary:'Kolaborasi bertujuan mempromosikan destinasi ramah lingkungan dan mendukung komunitas lokal di seluruh Nusantara.',                  date:'10 Maret 2024',   category:'Kemitraan',  downloadUrl:'#' },
  { id:3, title:'Trivgoo Raih "Inovasi Perjalanan Terbaik" di Asia Tech Awards 2024',   summary:'Penghargaan atas teknologi perencanaan perjalanan bertenaga AI yang mempersonalisasi pengalaman wisata.',                                 date:'28 Februari 2024',category:'Penghargaan',downloadUrl:'#' },
  { id:4, title:'Ekspansi ke Pasar Vietnam dan Thailand Diumumkan',                     summary:'Kantor baru dibuka di Hanoi dan Bangkok untuk memenuhi permintaan yang terus tumbuh di Asia Tenggara.',                                   date:'15 Februari 2024',category:'Ekspansi',   downloadUrl:'#' },
  { id:5, title:'Peluncuran Inisiatif Perjalanan Bebas Karbon',                         summary:'Program baru memungkinkan wisatawan mengimbangi jejak karbon mereka melalui proyek lingkungan yang terverifikasi.',                        date:'5 Februari 2024', category:'Pengumuman', downloadUrl:'#' },
  { id:6, title:'Kemitraan dengan Singapore Airlines untuk Pemesanan Terpadu',          summary:'Kolaborasi strategis untuk menawarkan pemesanan penerbangan dan pengalaman wisata secara seamless dalam satu platform.',                   date:'22 Januari 2024', category:'Kemitraan',  downloadUrl:'#' },
];

// ── Media assets ──────────────────────────────────────────────────────────────
export const MEDIA_ASSETS: MediaAsset[] = [
  { id:1, type:'logo',      title:'Paket Logo Trivgoo',    description:'Set logo lengkap dalam berbagai format dan variasi warna',             thumbnail:'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=400&q=80', downloadUrl:'#', format:'ZIP (SVG, PNG, EPS)', size:'45 MB'   },
  { id:2, type:'image',     title:'Fotografi Brand',       description:'Gambar resolusi tinggi destinasi dan tim Trivgoo',                      thumbnail:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80', downloadUrl:'#', format:'ZIP (JPG, PNG)',      size:'2,3 GB'  },
  { id:3, type:'video',     title:'Video Brand Story',     description:'Video ikhtisar perusahaan dan pernyataan misi Trivgoo',                 thumbnail:'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=400&q=80', downloadUrl:'#', format:'MP4 (4K, 1080p)',     size:'1,8 GB'  },
  { id:4, type:'press-kit', title:'Press Kit Lengkap',     description:'Semua aset media dan informasi perusahaan dalam satu paket',           thumbnail:'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80', downloadUrl:'#', format:'PDF + ZIP',           size:'3,2 GB'  },
  { id:5, type:'image',     title:'Foto Tim Eksekutif',    description:'Foto profesional para pemimpin dan tim inti Trivgoo',                   thumbnail:'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80', downloadUrl:'#', format:'JPG',                 size:'850 MB'  },
  { id:6, type:'video',     title:'Video Demo Produk',     description:'Panduan platform dan demonstrasi fitur unggulan',                       thumbnail:'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&q=80', downloadUrl:'#', format:'MP4',                 size:'2,1 GB'  },
];

// ── Press coverage ────────────────────────────────────────────────────────────
export const PRESS_COVERAGE: PressCoverage[] = [
  { id:1, outlet:'TechCrunch',      logo:'https://logo.clearbit.com/techcrunch.com',       title:'Bagaimana AI Mengubah Perencanaan Perjalanan di Asia Tenggara',      excerpt:'Pendekatan inovatif Trivgoo menggunakan machine learning untuk menciptakan itinerari yang dipersonalisasi...', url:'#', date:'18 Maret 2024',   type:'Feature'    },
  { id:2, outlet:'Forbes',          logo:'https://logo.clearbit.com/forbes.com',            title:'Startup yang Menjadikan Perjalanan Mewah Terjangkau untuk Semua',    excerpt:'Wawancara dengan CEO Trivgoo tentang demokratisasi pengalaman perjalanan premium...',                        url:'#', date:'12 Maret 2024',   type:'Wawancara'  },
  { id:3, outlet:'Travel + Leisure',logo:'https://logo.clearbit.com/travelandleisure.com',  title:'10 Inovasi Teknologi Perjalanan Terbaik 2024',                        excerpt:'Perencana perjalanan AI Trivgoo berhasil masuk daftar inovasi tahunan bergengsi ini...',                      url:'#', date:'5 Maret 2024',    type:'Ulasan'     },
  { id:4, outlet:'The Jakarta Post',logo:'https://logo.clearbit.com/thejakartapost.com',    title:'Startup Indonesia Berekspansi ke Seluruh Kawasan ASEAN',             excerpt:'Kisah sukses lokal merambah regional dengan pendanaan baru dan berbagai kemitraan strategis...',               url:'#', date:'25 Februari 2024',type:'Artikel'    },
  { id:5, outlet:'Bloomberg',       logo:'https://logo.clearbit.com/bloomberg.com',         title:'Investor Menaruh Harapan Besar pada Teknologi Perjalanan Asia',      excerpt:'Analisis putaran pendanaan terbaru termasuk Seri B Trivgoo yang menarik perhatian pasar...',                  url:'#', date:'20 Februari 2024',type:'Feature'    },
  { id:6, outlet:'CNN Travel',      logo:'https://logo.clearbit.com/cnn.com',               title:'Pariwisata Berkelanjutan Mendapat Sentuhan Teknologi Terkini',       excerpt:'Bagaimana teknologi membantu wisatawan membuat pilihan ramah lingkungan yang lebih bijak...',                 url:'#', date:'15 Februari 2024',type:'Artikel'    },
];

// ── Contact info ──────────────────────────────────────────────────────────────
import { Mail, Phone, Users } from 'lucide-react';

export const CONTACT_INFO = [
  { icon: Mail,  title: 'Pertanyaan Pers',       detail: 'press@trivgoo.com',                      link: 'mailto:press@trivgoo.com' },
  { icon: Phone, title: 'Hubungan Media',        detail: '+62 21 1234 5678 ext. 2',                link: 'tel:+622112345678'        },
  { icon: Users, title: 'Permintaan Narasumber', detail: 'Ajukan permintaan wawancara media',       link: '#contact-form'            },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getCategoryColor = (category: PressRelease['category']): string => {
  switch (category) {
    case 'Pengumuman': return 'bg-blue-100 text-blue-700';
    case 'Kemitraan':  return 'bg-green-100 text-green-700';
    case 'Penghargaan':return 'bg-amber-100 text-amber-700';
    case 'Ekspansi':   return 'bg-purple-100 text-purple-700';
    default:           return 'bg-gray-100 text-gray-700';
  }
};

export const getAssetLabel = (type: MediaAsset['type']): string => {
  switch (type) {
    case 'press-kit': return 'Press Kit';
    case 'logo':      return 'Logo';
    case 'image':     return 'Gambar';
    case 'video':     return 'Video';
    default:          return type;
  }
};

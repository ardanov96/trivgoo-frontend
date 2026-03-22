import type { Variants } from 'framer-motion';
import { Award, Briefcase, Compass, DollarSign, Globe, GraduationCap, Heart, Home, Shield, Sparkles } from 'lucide-react';

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
  @keyframes floatCode {
    0%   { transform: translateY(110px) rotate(-6deg); opacity: 0; }
    8%   { opacity: 1; }
    88%  { opacity: 1; }
    100% { transform: translateY(calc(-100vh - 80px)) rotate(4deg); opacity: 0; }
  }
  @keyframes orbPulse {
    0%,100% { opacity: 0.5; transform: scale(1); }
    50%     { opacity: 0.9; transform: scale(1.08); }
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
    0%,100% { opacity: 0.35; }
    50%     { opacity: 0.75; }
  }
  .grid-drift { animation: gridDrift 4s linear infinite; }
  .scan-h     { animation: scanH 5s linear infinite; }
`;

// ── Hero floating text snippets ───────────────────────────────────────────────
export const CODE_SNIPPETS = [
  { text: 'KARIR',         left: '8%',  delay: '0s',   size: 13, dur: 14 },
  { text: 'BERGABUNG',     left: '18%', delay: '2s',   size: 11, dur: 18 },
  { text: 'JABATAN IMPIAN',left: '30%', delay: '0.8s', size: 14, dur: 16 },
  { text: 'DAFTAR',        left: '44%', delay: '3.5s', size: 12, dur: 20 },
  { text: 'MEMBANGUN',     left: '56%', delay: '1.2s', size: 11, dur: 15 },
  { text: 'TUMBUH',        left: '68%', delay: '4s',   size: 13, dur: 17 },
  { text: 'BERDAMPAK',     left: '78%', delay: '0.4s', size: 12, dur: 19 },
  { text: 'LAMAR',         left: '88%', delay: '2.8s', size: 11, dur: 13 },
  { text: 'PARIWISATA',    left: '12%', delay: '5s',   size: 10, dur: 22 },
  { text: 'PORTFOLIO',     left: '50%', delay: '6s',   size: 11, dur: 16 },
  { text: 'TALENTA',       left: '36%', delay: '7s',   size: 12, dur: 18 },
  { text: 'KIRIM CV',      left: '74%', delay: '3s',   size: 11, dur: 21 },
];

export const FLOATING_ORBS = [
  { w: 320, h: 320, top: '5%',  left: '-5%', color: 'rgba(255,180,140,0.12)', dur: 8  },
  { w: 280, h: 280, top: '50%', left: '70%', color: 'rgba(255,255,255,0.07)', dur: 11 },
  { w: 200, h: 200, top: '20%', left: '50%', color: 'rgba(251,191,36,0.09)',  dur: 7  },
  { w: 180, h: 180, top: '70%', left: '20%', color: 'rgba(255,140,100,0.1)',  dur: 9  },
];

export const CIRCUIT_H_LINES = [15, 30, 50, 68, 82];
export const CIRCUIT_V_LINES = [10, 25, 40, 60, 75, 90];
export const CIRCUIT_DOTS    = [[10,15],[25,30],[40,50],[60,68],[75,30],[90,82],[25,68],[60,15]];

// ── Team culture ──────────────────────────────────────────────────────────────
export const TEAM_CULTURE = [
  { icon: Compass,  title: 'Jiwa Petualang',    description: 'Kami mendorong eksplorasi dan pengalaman baru, baik dalam pekerjaan maupun perjalanan.',         color: 'text-blue-500 bg-blue-50'   },
  { icon: Heart,    title: 'Mengutamakan Manusia', description: 'Kesejahteraan dan pertumbuhan tim kami sama pentingnya dengan kesuksesan bisnis.',            color: 'text-red-500 bg-red-50'     },
  { icon: Sparkles, title: 'Mindset Inovasi',   description: 'Kami selalu mencari cara yang lebih baik untuk memecahkan masalah dan menciptakan nilai.',       color: 'text-purple-500 bg-purple-50'},
  { icon: Globe,    title: 'Wawasan Global',    description: 'Kami berpikir secara global sembari tetap berakar pada keahlian lokal.',                         color: 'text-green-500 bg-green-50' },
];

// ── Perks ─────────────────────────────────────────────────────────────────────
export const PERKS = [
  { icon: Briefcase,     title: 'Kerja Fleksibel',         description: 'Opsi hybrid, jam kerja fleksibel, dan keseimbangan hidup-kerja' },
  { icon: DollarSign,    title: 'Kompensasi Kompetitif',    description: 'Gaji sesuai pasar, bonus, dan insentif berbasis kinerja' },
  { icon: GraduationCap, title: 'Belajar & Berkembang',     description: 'Anggaran pelatihan, akses konferensi, dan pengembangan karir' },
  { icon: Home,          title: 'Manfaat Perjalanan',       description: 'Diskon perjalanan, FAM trip, dan kesempatan riset destinasi' },
  { icon: Shield,        title: 'Kesehatan & Kebugaran',    description: 'Asuransi komprehensif, dukungan kesehatan mental, dan program kebugaran' },
  { icon: Award,         title: 'Penghargaan & Apresiasi',  description: 'Feedback rutin, bonus kinerja, dan perayaan bersama tim' },
];

// ── Job filter tabs ───────────────────────────────────────────────────────────
export const JOB_FILTERS = ['Semua Posisi', 'Teknologi', 'Operasional', 'Pemasaran'];

// ── Job positions ─────────────────────────────────────────────────────────────
export interface JobPosition {
  id:           number;
  title:        string;
  department:   string;
  type:         'Penuh Waktu' | 'Paruh Waktu' | 'Kontrak' | 'Magang';
  location:     string;
  experience:   string;
  description:  string;
  requirements: string[];
  benefits:     string[];
  postedDate:   string;
  isRemote:     boolean;
}

export const JOB_POSITIONS: JobPosition[] = [
  {
    id: 1,
    title: 'Senior Travel Experience Designer',
    department: 'Produk & Pengalaman',
    type: 'Penuh Waktu',
    location: 'Denpasar, Indonesia',
    experience: '5+ tahun',
    description: 'Rancang pengalaman perjalanan luar biasa yang mengubah cara orang menjelajahi Asia Tenggara. Kamu akan bekerja bersama para ahli lokal untuk menciptakan itinerari unik yang memadukan budaya, petualangan, dan kenyamanan premium.',
    requirements: ['5+ tahun pengalaman di industri perjalanan atau desain pengalaman', 'Portofolio kuat dalam produk perjalanan atau paket wisata kurasi', 'Pengetahuan mendalam tentang destinasi Asia Tenggara', 'Kemampuan komunikasi dan presentasi yang sangat baik', 'Mampu bekerja lintas fungsi bersama tim marketing, teknologi, dan operasional'],
    benefits: ['Tunjangan perjalanan untuk riset destinasi', 'Pengaturan kerja yang fleksibel', 'Asuransi kesehatan & program kebugaran', 'Anggaran pengembangan profesional', 'Diskon paket perjalanan'],
    postedDate: '15 Januari 2026',
    isRemote: true,
  },
  {
    id: 2,
    title: 'Spesialis Pemasaran & Pertumbuhan',
    department: 'Pemasaran',
    type: 'Penuh Waktu',
    location: 'Denpasar, Indonesia',
    experience: '4+ tahun',
    description: 'Dorong akuisisi dan retensi pelanggan melalui strategi pemasaran yang inovatif. Kamu akan mengelola saluran pertumbuhan, menganalisis kinerja, dan mengoptimalkan kampanye untuk menarik wisatawan dari seluruh dunia.',
    requirements: ['4+ tahun di bidang pemasaran digital dengan fokus pertumbuhan', 'Pengalaman dengan SEO, SEM, media sosial, dan email marketing', 'Pola pikir analitis dengan pengambilan keputusan berbasis data', 'Pengalaman di brand perjalanan atau gaya hidup lebih diutamakan', 'Kemampuan copywriting dan pembuatan konten yang kuat'],
    benefits: ['Bonus berbasis performa', 'Anggaran untuk konferensi pemasaran', 'Kebebasan kreatif dan otonomi kerja', 'Pengalaman perjalanan bersama tim', 'Kantor modern di pusat kota'],
    postedDate: '28 Desember 2025',
    isRemote: false,
  },
  {
    id: 3,
    title: 'Analis Bisnis',
    department: 'Pengembangan Bisnis',
    type: 'Penuh Waktu',
    location: 'Denpasar, Indonesia',
    experience: '1+ tahun',
    description: 'Jadilah bagian dari tim inti Trivgoo! Bantu para wisatawan merencanakan liburan impian mereka, selesaikan kendala, dan ciptakan pengalaman yang berkesan melalui layanan pelanggan yang luar biasa.',
    requirements: ['1+ tahun pengalaman di layanan pelanggan atau perhotelan', 'Kemampuan komunikasi yang baik dalam Bahasa Indonesia dan Inggris', 'Keterampilan pemecahan masalah dan empati tinggi', 'Mampu bekerja dengan jam fleksibel (termasuk akhir pekan)', 'Passionate terhadap dunia perjalanan dan membantu orang lain'],
    benefits: ['Kerja dari mana saja di Indonesia', 'Kredit perjalanan untuk penggunaan pribadi', 'Program pelatihan komprehensif', 'Peluang pertumbuhan karir yang jelas', 'Dukungan kesehatan mental'],
    postedDate: '25 Desember 2025',
    isRemote: true,
  },
  {
    id: 4,
    title: 'Penulis Konten Perjalanan',
    department: 'Konten',
    type: 'Kontrak',
    location: 'Remote',
    experience: '2+ tahun',
    description: 'Ciptakan konten perjalanan yang menarik dan menginspirasi. Tulis panduan destinasi, artikel blog, dan konten media sosial yang memperkenalkan keindahan Asia Tenggara kepada dunia.',
    requirements: ['2+ tahun pengalaman menulis konten perjalanan', 'Portofolio artikel perjalanan yang telah dipublikasikan', 'Pemahaman tentang SEO dan praktik terbaiknya', 'Mampu bekerja mandiri dan memenuhi tenggat waktu', 'Kecintaan terhadap storytelling dan eksplorasi budaya'],
    benefits: ['Jadwal fleksibel dan kerja remote', 'Kesempatan perjalanan untuk keperluan riset', 'Eksposur ke audiens internasional', 'Kebebasan kreatif dan kepemilikan konten', 'Potensi konversi ke posisi penuh waktu'],
    postedDate: '20 Desember 2025',
    isRemote: true,
  },
];

import type { Variants } from 'framer-motion';
import { Globe, Shield, Star, Users, Compass, Building2, Moon } from 'lucide-react';

// ── Easing ────────────────────────────────────────────────────────────────────
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Animation variants ────────────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 48 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: EASE, delay: i * 0.1 },
  }),
};

export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -56 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 56 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.12 },
  }),
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ── CSS keyframe styles ───────────────────────────────────────────────────────
export const HERO_STYLES = `
  @keyframes floatPlane  { 0%{transform:translateY(120px) translateX(0px) rotate(0deg);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(calc(-100vh - 120px)) translateX(20px) rotate(5deg);opacity:0} }
  @keyframes floatPlane2 { 0%{transform:translateY(120px) translateX(0px) rotate(-3deg);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(calc(-100vh - 120px)) translateX(-30px) rotate(3deg);opacity:0} }
  @keyframes floatPlane3 { 0%{transform:translateY(80px) translateX(0px) rotate(2deg);opacity:0} 10%{opacity:0.7} 90%{opacity:0.7} 100%{transform:translateY(calc(-100vh - 80px)) translateX(15px) rotate(-2deg);opacity:0} }
  @keyframes pulsePin  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.25);opacity:.8} }
  @keyframes ripple    { 0%{transform:scale(.8);opacity:.8} 100%{transform:scale(2.5);opacity:0} }
  @keyframes glowPulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
  @keyframes scanLine  { 0%{transform:translateY(0%);opacity:.15} 50%{opacity:.3} 100%{transform:translateY(100%);opacity:.15} }
  @keyframes gridScroll{ 0%{background-position:0 0} 100%{background-position:40px 40px} }
  .plane-1    { animation: floatPlane  18s linear infinite; }
  .plane-2    { animation: floatPlane2 24s linear infinite 7s; }
  .plane-3    { animation: floatPlane3 30s linear infinite 14s; }
  .pin-pulse  { animation: pulsePin  2s ease-in-out infinite; }
  .ripple-ring{ animation: ripple   2s ease-out infinite; }
  .scan-line  { animation: scanLine  4s linear infinite; }
  .grid-anim  { animation: gridScroll 3s linear infinite; }
`;

// ── Stats ─────────────────────────────────────────────────────────────────────
export const STATS = [
  { value: '50,000+', label: 'Happy Travelers',     icon: Users  },
  { value: '1,200+',  label: 'Destinations Covered',icon: Globe  },
  { value: '95%',     label: 'Satisfaction Rate',   icon: Star   },
  { value: '24/7',    label: 'Customer Support',    icon: Shield },
];

// ── Services ──────────────────────────────────────────────────────────────────
export const SERVICES = [
  {
    icon: Compass,
    title:     'Personalize Travel Agent',
    tagline:   'Perjalanan Sesuai Kebutuhan Anda',
    color:     'from-blue-500 to-cyan-400',
    textColor: 'text-blue-600',
    image:     'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80',
    imageAlt:  'Personalized travel planning',
    description: 'Kami memberikan solusi untuk merancang perjalanan sesuai kebutuhan personal / group / perusahaan Anda. Trivgoo bertindak sebagai mitra perjalanan strategis yang menangani seluruh proses, dimulai dari perencanaan, pemesanan, koordinasi hingga pelaksanaan, secara terintegrasi dan profesional.',
    highlights: ['Perjalanan rekreasi & wisata', 'Perjalanan dinas & offsite meeting', 'Incentive trip', 'Perjalanan khusus manajemen'],
  },
  {
    icon: Moon,
    title:     'Ramadan CSR & Iftar Experience',
    tagline:   'Buka Puasa Bermakna & Dampak Nyata',
    color:     'from-emerald-500 to-teal-400',
    textColor: 'text-emerald-600',
    image:     'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
    imageAlt:  'Masjid Ramadan Experience',
    description: 'Program acara perusahaan yang menggabungkan buka puasa bersama dengan kegiatan tanggung jawab sosial (CSR) dalam satu rangkaian yang bermakna. Dirancang khusus untuk momen Ramadan, membantu perusahaan memperkuat nilai kebersamaan, kepedulian sosial, dan citra positif perusahaan.',
    highlights: ['Internal karyawan & mitra', 'Konsep acara rapi & bernilai', 'Kegiatan CSR terintegrasi', 'Citra korporasi positif'],
  },
  {
    icon: Building2,
    title:     'Corporate Gathering & Team Building',
    tagline:   'Profesional, Hangat, & Berdampak',
    color:     'from-violet-500 to-purple-400',
    textColor: 'text-violet-600',
    image:     'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    imageAlt:  'Corporate Gathering and Team Building',
    description: 'Paket yang dirancang untuk mendukung komunikasi internal perusahaan, penyelarasan visi, serta peningkatan keterlibatan karyawan. Acara dikemas secara profesional, namun tetap hangat, memungkinkan manajemen menyampaikan pesan strategis dalam suasana yang nyaman dan terstruktur.',
    highlights: ['Corporate meeting & update', 'Employee engagement', 'Team building', 'Sesi apresiasi perusahaan'],
  },
];

// ── Gallery tabs ──────────────────────────────────────────────────────────────
export const GALLERY_TABS = [
  {
    label: 'Personalize Travel', icon: Compass, activeColor: 'bg-blue-500',
    images: [
      { src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', caption: 'Perjalanan Rekreasi Keluarga' },
      { src: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80', caption: 'Incentive Trip Eksklusif' },
      { src: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=800&q=80', caption: 'Offsite Meeting & Retreat' },
      { src: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80', caption: 'Perjalanan Dinas Profesional' },
      { src: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=800&q=80', caption: 'Wisata Group & Komunitas' },
      { src: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80', caption: 'Perjalanan Manajemen Senior' },
    ],
  },
  {
    label: 'Ramadan CSR & Iftar', icon: Moon, activeColor: 'bg-emerald-500',
    images: [
      { src: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=800&q=80', caption: 'Iftar Bersama Karyawan' },
      { src: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80', caption: 'Kegiatan CSR Ramadan' },
      { src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', caption: 'Sajian Iftar Premium' },
      { src: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', caption: 'Donasi & Kepedulian Sosial' },
      { src: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', caption: 'Dekorasi Venue Ramadan' },
      { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', caption: 'Dinner & Networking Iftar' },
    ],
  },
  {
    label: 'Corporate Gathering', icon: Building2, activeColor: 'bg-violet-500',
    images: [
      { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', caption: 'Corporate Event Gathering' },
      { src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', caption: 'Team Building Workshop' },
      { src: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80', caption: 'Employee Engagement Outdoor' },
      { src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80', caption: 'Sesi Apresiasi Karyawan' },
      { src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80', caption: 'Presentasi Strategis' },
      { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', caption: 'Aktivitas Tim Kolaboratif' },
    ],
  },
];

// ── Hero map data ─────────────────────────────────────────────────────────────
export const DESTINATION_PINS = [
  { label: 'Tokyo',  top: '28%', left: '78%', delay: '0s'   },
  { label: 'Dubai',  top: '42%', left: '58%', delay: '0.6s' },
  { label: 'Paris',  top: '22%', left: '46%', delay: '1.2s' },
  { label: 'Bali',   top: '62%', left: '76%', delay: '1.8s' },
  { label: 'NYC',    top: '30%', left: '22%', delay: '2.4s' },
  { label: 'Sydney', top: '72%', left: '84%', delay: '3s'   },
  { label: 'Mecca',  top: '48%', left: '60%', delay: '0.3s' },
  { label: 'London', top: '18%', left: '44%', delay: '1.5s' },
];

export const FLIGHT_ROUTES = [
  { x1: 22, y1: 30, x2: 46, y2: 22 },
  { x1: 46, y1: 22, x2: 78, y2: 28 },
  { x1: 58, y1: 42, x2: 76, y2: 62 },
  { x1: 22, y1: 30, x2: 60, y2: 48 },
  { x1: 84, y1: 72, x2: 78, y2: 28 },
];

export const ABOUT_BADGES = [
  'AI-Powered Personalization',
  'Solusi Personal & Korporat',
  'Layanan End-to-End',
];

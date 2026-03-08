import {
  CheckCircle,
  Globe,
  Shield,
  Star,
  Users,
  Compass,
  Building2,
  Moon,
} from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';

/* cubic-bezier tuple typed correctly for framer-motion */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Reusable animation variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE, delay: i * 0.1 },
  }),
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -56 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 56 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.12 },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Hook: trigger once on scroll into view ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  return { ref, inView };
}

const AboutUs: React.FC = () => {
  const [activeGallery, setActiveGallery] = useState(0);

  const stats = [
    { value: '50,000+', label: 'Happy Travelers', icon: Users },
    { value: '1,200+', label: 'Destinations Covered', icon: Globe },
    { value: '95%', label: 'Satisfaction Rate', icon: Star },
    { value: '24/7', label: 'Customer Support', icon: Shield },
  ];

  const services = [
    {
      icon: Compass,
      title: 'Personalize Travel Agent',
      tagline: 'Perjalanan Sesuai Kebutuhan Anda',
      color: 'from-blue-500 to-cyan-400',
      textColor: 'text-blue-600',
      image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Personalized travel planning',
      description:
        'Kami memberikan solusi untuk merancang perjalanan sesuai kebutuhan personal / group / perusahaan Anda. Trivgoo bertindak sebagai mitra perjalanan strategis yang menangani seluruh proses, dimulai dari perencanaan, pemesanan, koordinasi hingga pelaksanaan, secara terintegrasi dan profesional.',
      highlights: ['Perjalanan rekreasi & wisata', 'Perjalanan dinas & offsite meeting', 'Incentive trip', 'Perjalanan khusus manajemen'],
    },
    {
      icon: Moon,
      title: 'Ramadan CSR & Iftar Experience',
      tagline: 'Buka Puasa Bermakna & Dampak Nyata',
      color: 'from-emerald-500 to-teal-400',
      textColor: 'text-emerald-600',
      image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Masjid Ramadan Experience',
      description:
        'Program acara perusahaan yang menggabungkan buka puasa bersama dengan kegiatan tanggung jawab sosial (CSR) dalam satu rangkaian yang bermakna. Dirancang khusus untuk momen Ramadan, membantu perusahaan memperkuat nilai kebersamaan, kepedulian sosial, dan citra positif perusahaan.',
      highlights: ['Internal karyawan & mitra', 'Konsep acara rapi & bernilai', 'Kegiatan CSR terintegrasi', 'Citra korporasi positif'],
    },
    {
      icon: Building2,
      title: 'Corporate Gathering & Team Building',
      tagline: 'Profesional, Hangat, & Berdampak',
      color: 'from-violet-500 to-purple-400',
      textColor: 'text-violet-600',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Corporate Gathering and Team Building',
      description:
        'Paket yang dirancang untuk mendukung komunikasi internal perusahaan, penyelarasan visi, serta peningkatan keterlibatan karyawan. Acara dikemas secara profesional, namun tetap hangat, memungkinkan manajemen menyampaikan pesan strategis dalam suasana yang nyaman dan terstruktur.',
      highlights: ['Corporate meeting & update', 'Employee engagement', 'Team building', 'Sesi apresiasi perusahaan'],
    },
  ];

  const galleryTabs = [
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

  const currentGallery = galleryTabs[activeGallery];

  const destinationPins = [
    { label: 'Tokyo',  top: '28%', left: '78%', delay: '0s'   },
    { label: 'Dubai',  top: '42%', left: '58%', delay: '0.6s' },
    { label: 'Paris',  top: '22%', left: '46%', delay: '1.2s' },
    { label: 'Bali',   top: '62%', left: '76%', delay: '1.8s' },
    { label: 'NYC',    top: '30%', left: '22%', delay: '2.4s' },
    { label: 'Sydney', top: '72%', left: '84%', delay: '3s'   },
    { label: 'Mecca',  top: '48%', left: '60%', delay: '0.3s' },
    { label: 'London', top: '18%', left: '44%', delay: '1.5s' },
  ];

  const flightRoutes = [
    { x1: '22%', y1: '30%', x2: '46%', y2: '22%' },
    { x1: '46%', y1: '22%', x2: '78%', y2: '28%' },
    { x1: '58%', y1: '42%', x2: '76%', y2: '62%' },
    { x1: '22%', y1: '30%', x2: '60%', y2: '48%' },
    { x1: '84%', y1: '72%', x2: '78%', y2: '28%' },
  ];

  /* scroll-reveal refs */
  const aboutRef    = useScrollReveal();
  const statsRef    = useScrollReveal();
  const servicesRef = useScrollReveal(0.08);
  const galleryRef  = useScrollReveal();
  const ctaRef      = useScrollReveal();

  return (
    <div className="min-h-screen">

      <style>{`
        @keyframes floatPlane {
          0%   { transform: translateY(120px) translateX(0px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(calc(-100vh - 120px)) translateX(20px) rotate(5deg); opacity: 0; }
        }
        @keyframes floatPlane2 {
          0%   { transform: translateY(120px) translateX(0px) rotate(-3deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(calc(-100vh - 120px)) translateX(-30px) rotate(3deg); opacity: 0; }
        }
        @keyframes floatPlane3 {
          0%   { transform: translateY(80px) translateX(0px) rotate(2deg); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.7; }
          100% { transform: translateY(calc(-100vh - 80px)) translateX(15px) rotate(-2deg); opacity: 0; }
        }
        @keyframes pulsePin  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.25);opacity:.8} }
        @keyframes ripple    { 0%{transform:scale(.8);opacity:.8} 100%{transform:scale(2.5);opacity:0} }
        @keyframes glowPulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @keyframes scanLine  { 0%{transform:translateY(0%);opacity:.15} 50%{opacity:.3} 100%{transform:translateY(100%);opacity:.15} }
        @keyframes gridScroll{ 0%{background-position:0 0} 100%{background-position:40px 40px} }
        .plane-1   { animation: floatPlane  18s linear infinite; }
        .plane-2   { animation: floatPlane2 24s linear infinite 7s; }
        .plane-3   { animation: floatPlane3 30s linear infinite 14s; }
        .pin-pulse { animation: pulsePin  2s ease-in-out infinite; }
        .ripple-ring{ animation: ripple   2s ease-out infinite; }
        .scan-line { animation: scanLine  4s linear infinite; }
        .grid-anim { animation: gridScroll 3s linear infinite; }
      `}</style>

      {/* ══ 1. HERO ══ */}
      <div className="relative text-white overflow-hidden"
        style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #6b1a12 0%, #a83328 35%, #c34134 65%, #E05845 100%)' }}>

        {/* animated bg */}
        <div className="absolute inset-0 grid-anim" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,220,200,0.2) 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Cellipse cx='600' cy='300' rx='580' ry='280' fill='none' stroke='%23ffd4c0' stroke-width='1'/%3E%3Cellipse cx='600' cy='300' rx='400' ry='280' fill='none' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cellipse cx='600' cy='300' rx='200' ry='280' fill='none' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cline x1='20' y1='300' x2='1180' y2='300' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cline x1='600' y1='20' x2='600' y2='580' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cellipse cx='600' cy='300' rx='580' ry='140' fill='none' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cellipse cx='600' cy='300' rx='580' ry='70' fill='none' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize:'cover', backgroundPosition:'center' }} />
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'10%', left:'15%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,200,150,0.15) 0%, transparent 70%)', animation:'glowPulse 5s ease-in-out infinite' }} />
          <div style={{ position:'absolute', bottom:'5%', right:'10%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', animation:'glowPulse 7s ease-in-out infinite 2s' }} />
          <div style={{ position:'absolute', top:'40%', right:'30%', width:250, height:250, borderRadius:'50%', background:'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', animation:'glowPulse 6s ease-in-out infinite 1s' }} />
        </div>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {flightRoutes.map((r,i)=>(
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="rgba(255,220,200,0.4)" strokeWidth="1" strokeDasharray="6 4" style={{ animation:`glowPulse ${4+i}s ease-in-out infinite ${i*0.8}s` }} />
          ))}
          <path d="M 22% 30% Q 50% 5% 78% 28%" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="8 5"/>
          <path d="M 46% 22% Q 65% 55% 84% 72%" fill="none" stroke="rgba(255,200,150,0.25)" strokeWidth="1" strokeDasharray="5 4"/>
        </svg>
        {destinationPins.map((pin,i)=>(
          <div key={i} className="absolute" style={{ top:pin.top, left:pin.left, transform:'translate(-50%,-50%)' }}>
            <div className="ripple-ring absolute rounded-full border border-orange-200" style={{ width:28, height:28, top:'50%', left:'50%', transform:'translate(-50%,-50%)', animationDelay:pin.delay }} />
            <div className="pin-pulse relative z-10 rounded-full bg-amber-300" style={{ width:10, height:10, boxShadow:'0 0 10px rgba(251,191,36,0.9)', animationDelay:pin.delay }} />
            <span className="absolute left-4 -top-1 font-bold text-orange-100 whitespace-nowrap" style={{ fontSize:10, textShadow:'0 1px 6px rgba(0,0,0,0.5)' }}>{pin.label}</span>
          </div>
        ))}
        <div className="plane-1 absolute pointer-events-none" style={{ bottom:0, left:'25%' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h-1A1.5 1.5 0 0 0 9 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5l9 2.5z" fill="rgba(255,255,255,0.9)"/></svg>
        </div>
        <div className="plane-2 absolute pointer-events-none" style={{ bottom:0, left:'60%' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h-1A1.5 1.5 0 0 0 9 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5l9 2.5z" fill="rgba(251,191,36,0.85)"/></svg>
        </div>
        <div className="plane-3 absolute pointer-events-none" style={{ bottom:0, left:'42%' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h-1A1.5 1.5 0 0 0 9 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5l9 2.5z" fill="rgba(255,200,150,0.7)"/></svg>
        </div>
        <div className="scan-line absolute inset-x-0 pointer-events-none" style={{ height:'3px', top:0, background:'linear-gradient(90deg, transparent, rgba(255,200,180,0.4), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background:'linear-gradient(to bottom, transparent, rgba(80,15,5,0.5))' }} />

        {/* ── Hero content — framer entrance ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center justify-center" style={{ minHeight:'100vh' }}>
          <div className="text-center max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity:0, y:-20 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.6, delay:0.2 }}
              className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20"
            >
              Tentang Kami
            </motion.span>

            <motion.h1
              initial={{ opacity:0, y:40 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.8, delay:0.4, ease:[0.22,1,0.36,1] }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight"
            >
              Satu Platform Untuk<br />
              <motion.span
                initial={{ opacity:0, scale:0.9 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ duration:0.7, delay:0.75, ease:[0.22,1,0.36,1] }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-300 inline-block"
              >
                Semua Kebutuhan Perjalanan
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.6, delay:1 }}
              className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed"
            >
              PT Trivgoo Global Nusantara
            </motion.p>
          </div>
        </div>
      </div>

      {/* ══ 2. ABOUT COMPANY ══ */}
      <div className="bg-white py-20 md:py-28" ref={aboutRef.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <motion.div variants={fadeLeft} initial="hidden" animate={aboutRef.inView ? 'visible' : 'hidden'}>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Lebih dari Sekadar Platform Perjalanan
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                PT Trivgoo Global Nusantara hadir sebagai mitra perjalanan terpercaya yang mengintegrasikan kemudahan teknologi dengan sentuhan Artificial Intelligence. Berkomitmen untuk menyederhanakan setiap perjalanan, baik untuk urusan personal, bisnis, rekreasi, dan ibadah, kami menghadirkan solusi lengkap.
              </p>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Trivgoo adalah platform travel berbasis AI yang tidak hanya menjual tiket dan hotel, tetapi menjadi{' '}
                <strong className="text-primary-700">personal travel experience</strong>. Berbeda dengan kompetitor yang berfokus pada transaksi, Trivgoo berfokus pada pengalaman perjalanan yang dipersonalisasi secara mendalam berdasarkan kepribadian, minat, dan kebutuhan pengguna.
              </p>
              <motion.div
                className="flex flex-wrap gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate={aboutRef.inView ? 'visible' : 'hidden'}
              >
                {['AI-Powered Personalization', 'Solusi Personal & Korporat', 'Layanan End-to-End'].map((item) => (
                  <motion.div key={item} variants={fadeUp} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="font-medium text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="relative" variants={fadeRight} initial="hidden" animate={aboutRef.inView ? 'visible' : 'hidden'}>
              <div className="bg-gradient-to-br from-primary-50 to-teal-50 rounded-3xl p-8 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?auto=format&fit=crop&w=800&q=80"
                  alt="Travel Experience"
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
                <motion.div
                  className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-2xl w-64"
                  initial={{ opacity:0, scale:0.7, y:20 }}
                  animate={aboutRef.inView ? { opacity:1, scale:1, y:0 } : {}}
                  transition={{ duration:0.6, delay:0.5, ease:[0.22,1,0.36,1] }}
                >
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-primary-100 rounded-lg mr-3">
                      <Globe className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">8 Negara</div>
                      <div className="text-sm text-gray-500">Asia Tenggara & Timur Tengah</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ 3. STATS ══ */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-20" ref={statsRef.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate={statsRef.inView ? 'visible' : 'hidden'}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={index} className="text-center" variants={scaleIn} custom={index}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-primary-100 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ══ 4. SERVICES ══ */}
      <div className="bg-gray-50 py-20 md:py-28" ref={servicesRef.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            animate={servicesRef.inView ? 'visible' : 'hidden'}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">LAYANAN KAMI</h2>
          </motion.div>

          <div className="space-y-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100"
                  variants={fadeUp}
                  custom={index}
                  initial="hidden"
                  animate={servicesRef.inView ? 'visible' : 'hidden'}
                  whileHover={{ y:-6, boxShadow:'0 28px 60px -12px rgba(0,0,0,0.14)' }}
                  transition={{ type:'spring', stiffness:180, damping:18 }}
                >
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <motion.img
                      src={service.image}
                      alt={service.imageAlt}
                      className="w-full h-full object-cover"
                      whileHover={{ scale:1.06 }}
                      transition={{ duration:0.6 }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-60`}></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest opacity-80">Paket {index + 1}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold leading-snug mb-1">{service.title}</h3>
                      <p className="text-white/80 italic text-base">"{service.tagline}"</p>
                    </div>
                  </div>

                  <div className="p-8 md:p-12">
                    <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8`}>
                      <div className="lg:w-1/2">
                        <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
                      </div>
                      <div className="lg:w-1/2">
                        <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${service.textColor}`}>Cocok Untuk:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {service.highlights.map((item, i) => (
                            <motion.div
                              key={i}
                              className="flex items-center bg-gray-50 rounded-xl px-4 py-3"
                              initial={{ opacity:0, x:-16 }}
                              animate={servicesRef.inView ? { opacity:1, x:0 } : {}}
                              transition={{ duration:0.4, delay:0.3 + index*0.1 + i*0.07 }}
                            >
                              <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${service.textColor}`} />
                              <span className="text-gray-700 font-medium text-sm">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ 5. GALLERY ══ */}
      <div className="bg-white py-20 md:py-28" ref={galleryRef.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={fadeUp}
            initial="hidden"
            animate={galleryRef.inView ? 'visible' : 'hidden'}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">GALERI</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Sekilas pandang pengalaman nyata dari setiap paket layanan Trivgoo.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-10"
            variants={staggerContainer}
            initial="hidden"
            animate={galleryRef.inView ? 'visible' : 'hidden'}
          >
            {galleryTabs.map((tab, i) => {
              const TabIcon = tab.icon;
              return (
                <motion.button
                  key={i}
                  variants={scaleIn}
                  custom={i}
                  onClick={() => setActiveGallery(i)}
                  whileTap={{ scale:0.93 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 border-2 ${
                    activeGallery === i
                      ? `${tab.activeColor} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </motion.div>

          {/* gallery animates on tab switch */}
          <motion.div
            key={activeGallery}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
          >
            {currentGallery.images.map((img, i) => (
              <motion.div
                key={`${activeGallery}-${i}`}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer ${i === 0 ? 'col-span-2 row-span-1' : ''}`}
                style={{ aspectRatio: i === 0 ? '16/7' : '4/3' }}
                initial={{ opacity:0, scale:0.94 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ duration:0.4, delay:i*0.06, ease:[0.22,1,0.36,1] }}
                whileHover={{ scale:1.02, zIndex:10 }}
              >
                <img src={img.src} alt={img.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="font-semibold text-sm drop-shadow">{img.caption}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══ 6. CTA ══ */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-20 text-white relative overflow-hidden" ref={ctaRef.ref}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/always-grey.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <motion.h2
            className="text-3xl md:text-5xl font-serif font-bold mb-6"
            variants={fadeUp}
            initial="hidden"
            animate={ctaRef.inView ? 'visible' : 'hidden'}
          >
            Siap Memulai Perjalanan Bersama Kami?
          </motion.h2>

          <motion.p
            className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto"
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate={ctaRef.inView ? 'visible' : 'hidden'}
          >
            Bergabunglah bersama ribuan pelancong yang telah merasakan pengalaman perjalanan yang lebih bermakna bersama Trivgoo.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate={ctaRef.inView ? 'visible' : 'hidden'}
          >
            <motion.div variants={scaleIn} custom={0} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}>
              <Link to="/explore" className="inline-block px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl">
                Mulai Perjalanan Anda
              </Link>
            </motion.div>
            <motion.div variants={scaleIn} custom={1} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}>
              <Link to="/contact-us" className="inline-block px-8 py-4 bg-primary-800 text-white rounded-full font-bold text-lg border border-primary-500 hover:bg-primary-900 transition-all shadow-xl">
                Hubungi Tim Kami
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

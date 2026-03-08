import {
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  Clock,
  Compass,
  DollarSign,
  Globe,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';

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
interface JobPosition {
  id: number;
  title: string;
  department: string;
  type: 'Penuh Waktu' | 'Paruh Waktu' | 'Kontrak' | 'Magang';
  location: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  isRemote: boolean;
}

interface TeamCulture {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const Career: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '', email: '', phone: '', coverLetter: '', portfolioUrl: '',
  });

  const openPositionsRef = useRef<HTMLDivElement>(null);
  const cultureRef       = useRef<HTMLDivElement>(null);

  /* scroll-reveal refs */
  const cultureReveal = useReveal();
  const perksReveal   = useReveal();
  const jobsReveal    = useReveal(0.06);
  const ctaReveal     = useReveal();

  /* ── data ── */
  const jobPositions: JobPosition[] = [
    {
      id: 1,
      title: 'Senior Travel Experience Designer',
      department: 'Produk & Pengalaman',
      type: 'Penuh Waktu',
      location: 'Denpasar, Indonesia',
      experience: '5+ tahun',
      description: 'Rancang pengalaman perjalanan luar biasa yang mengubah cara orang menjelajahi Asia Tenggara. Kamu akan bekerja bersama para ahli lokal untuk menciptakan itinerari unik yang memadukan budaya, petualangan, dan kenyamanan premium.',
      requirements: [
        '5+ tahun pengalaman di industri perjalanan atau desain pengalaman',
        'Portofolio kuat dalam produk perjalanan atau paket wisata kurasi',
        'Pengetahuan mendalam tentang destinasi Asia Tenggara',
        'Kemampuan komunikasi dan presentasi yang sangat baik',
        'Mampu bekerja lintas fungsi bersama tim marketing, teknologi, dan operasional',
      ],
      benefits: [
        'Tunjangan perjalanan untuk riset destinasi',
        'Pengaturan kerja yang fleksibel',
        'Asuransi kesehatan & program kebugaran',
        'Anggaran pengembangan profesional',
        'Diskon paket perjalanan',
      ],
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
      requirements: [
        '4+ tahun di bidang pemasaran digital dengan fokus pertumbuhan',
        'Pengalaman dengan SEO, SEM, media sosial, dan email marketing',
        'Pola pikir analitis dengan pengambilan keputusan berbasis data',
        'Pengalaman di brand perjalanan atau gaya hidup lebih diutamakan',
        'Kemampuan copywriting dan pembuatan konten yang kuat',
      ],
      benefits: [
        'Bonus berbasis performa',
        'Anggaran untuk konferensi pemasaran',
        'Kebebasan kreatif dan otonomi kerja',
        'Pengalaman perjalanan bersama tim',
        'Kantor modern di pusat kota',
      ],
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
      requirements: [
        '1+ tahun pengalaman di layanan pelanggan atau perhotelan',
        'Kemampuan komunikasi yang baik dalam Bahasa Indonesia dan Inggris',
        'Keterampilan pemecahan masalah dan empati tinggi',
        'Mampu bekerja dengan jam fleksibel (termasuk akhir pekan)',
        'Passionate terhadap dunia perjalanan dan membantu orang lain',
      ],
      benefits: [
        'Kerja dari mana saja di Indonesia',
        'Kredit perjalanan untuk penggunaan pribadi',
        'Program pelatihan komprehensif',
        'Peluang pertumbuhan karir yang jelas',
        'Dukungan kesehatan mental',
      ],
      postedDate: '25 Desember 2025',
      isRemote: true,
    },
    {
      id: 6,
      title: 'Penulis Konten Perjalanan',
      department: 'Konten',
      type: 'Kontrak',
      location: 'Remote',
      experience: '2+ tahun',
      description: 'Ciptakan konten perjalanan yang menarik dan menginspirasi. Tulis panduan destinasi, artikel blog, dan konten media sosial yang memperkenalkan keindahan Asia Tenggara kepada dunia.',
      requirements: [
        '2+ tahun pengalaman menulis konten perjalanan',
        'Portofolio artikel perjalanan yang telah dipublikasikan',
        'Pemahaman tentang SEO dan praktik terbaiknya',
        'Mampu bekerja mandiri dan memenuhi tenggat waktu',
        'Kecintaan terhadap storytelling dan eksplorasi budaya',
      ],
      benefits: [
        'Jadwal fleksibel dan kerja remote',
        'Kesempatan perjalanan untuk keperluan riset',
        'Eksposur ke audiens internasional',
        'Kebebasan kreatif dan kepemilikan konten',
        'Potensi konversi ke posisi penuh waktu',
      ],
      postedDate: '20 Desember 2025',
      isRemote: true,
    },
  ];

  const teamCulture: TeamCulture[] = [
    {
      icon: Compass,
      title: 'Jiwa Petualang',
      description: 'Kami mendorong eksplorasi dan pengalaman baru, baik dalam pekerjaan maupun perjalanan.',
      color: 'text-blue-500 bg-blue-50',
    },
    {
      icon: Heart,
      title: 'Mengutamakan Manusia',
      description: 'Kesejahteraan dan pertumbuhan tim kami sama pentingnya dengan kesuksesan bisnis.',
      color: 'text-red-500 bg-red-50',
    },
    {
      icon: Sparkles,
      title: 'Mindset Inovasi',
      description: 'Kami selalu mencari cara yang lebih baik untuk memecahkan masalah dan menciptakan nilai.',
      color: 'text-purple-500 bg-purple-50',
    },
    {
      icon: Globe,
      title: 'Wawasan Global',
      description: 'Kami berpikir secara global sembari tetap berakar pada keahlian lokal.',
      color: 'text-green-500 bg-green-50',
    },
  ];

  const perks = [
    { icon: Briefcase,     title: 'Kerja Fleksibel',           description: 'Opsi hybrid, jam kerja fleksibel, dan keseimbangan hidup-kerja' },
    { icon: DollarSign,    title: 'Kompensasi Kompetitif',      description: 'Gaji sesuai pasar, bonus, dan insentif berbasis kinerja' },
    { icon: GraduationCap, title: 'Belajar & Berkembang',       description: 'Anggaran pelatihan, akses konferensi, dan pengembangan karir' },
    { icon: Home,          title: 'Manfaat Perjalanan',         description: 'Diskon perjalanan, FAM trip, dan kesempatan riset destinasi' },
    { icon: Shield,        title: 'Kesehatan & Kebugaran',      description: 'Asuransi komprehensif, dukungan kesehatan mental, dan program kebugaran' },
    { icon: Award,         title: 'Penghargaan & Apresiasi',    description: 'Feedback rutin, bonus kinerja, dan perayaan bersama tim' },
  ];

  const codeSnippets = [
    { text: 'KARIR',      left: '8%',  delay: '0s',   size: 13, dur: 14 },
    { text: 'BERGABUNG',    left: '18%', delay: '2s',   size: 11, dur: 18 },
    { text: 'JABATAN IMPIAN',     left: '30%', delay: '0.8s', size: 14, dur: 16 },
    { text: 'DAFTAR',   left: '44%', delay: '3.5s', size: 12, dur: 20 },
    { text: 'MEMBANGUN',      left: '56%', delay: '1.2s', size: 11, dur: 15 },
    { text: 'TUMBUH',       left: '68%', delay: '4s',   size: 13, dur: 17 },
    { text: 'BERDAMPAK',       left: '78%', delay: '0.4s', size: 12, dur: 19 },
    { text: 'LAMAR',        left: '88%', delay: '2.8s', size: 11, dur: 13 },
    { text: 'PARIWISATA', left: '12%', delay: '5s',   size: 10, dur: 22 },
    { text: 'PORTFOLIO',        left: '50%', delay: '6s',   size: 11, dur: 16 },
    { text: 'TALENTA',      left: '36%', delay: '7s',   size: 12, dur: 18 },
    { text: 'KIRIM CV',     left: '74%', delay: '3s',   size: 11, dur: 21 },
  ];

  const floatingOrbs = [
    { w: 320, h: 320, top: '5%',  left: '-5%', color: 'rgba(255,180,140,0.12)', dur: 8  },
    { w: 280, h: 280, top: '50%', left: '70%', color: 'rgba(255,255,255,0.07)', dur: 11 },
    { w: 200, h: 200, top: '20%', left: '50%', color: 'rgba(251,191,36,0.09)',  dur: 7  },
    { w: 180, h: 180, top: '70%', left: '20%', color: 'rgba(255,140,100,0.1)',  dur: 9  },
  ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const navbarHeight = 80;
      const offsetPosition = ref.current.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleApplyNow = (job: JobPosition) => {
    setSelectedJob(job);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Lamaran dikirim:', { job: selectedJob, ...applicationForm });
    alert(`Lamaran untuk ${selectedJob?.title} telah terkirim! Kami akan segera menghubungi Anda.`);
    setApplicationForm({ fullName: '', email: '', phone: '', coverLetter: '', portfolioUrl: '' });
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes floatCode {
          0%   { transform: translateY(110px) rotate(-6deg); opacity: 0; }
          8%   { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(calc(-100vh - 80px)) rotate(4deg); opacity: 0; }
        }
        @keyframes orbPulse {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.9; transform: scale(1.08); }
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
          50%      { opacity: 0.75; }
        }
        .grid-drift { animation: gridDrift 4s linear infinite; }
        .scan-h     { animation: scanH 5s linear infinite; }
      `}</style>

      {/* ════════════════════════════════
          1. HERO
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

        {/* circuit-line overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {[15,30,50,68,82].map((y,i)=>(
            <line key={`h${i}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="rgba(255,220,200,0.6)" strokeWidth="0.5" strokeDasharray="12 8"/>
          ))}
          {[10,25,40,60,75,90].map((x,i)=>(
            <line key={`v${i}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="rgba(255,220,200,0.4)" strokeWidth="0.5" strokeDasharray="8 10"/>
          ))}
          {[[10,15],[25,30],[40,50],[60,68],[75,30],[90,82],[25,68],[60,15]].map(([x,y],i)=>(
            <circle key={`c${i}`} cx={`${x}%`} cy={`${y}%`} r="3" fill="rgba(255,200,160,0.5)" style={{ animation:`glowDot ${3+i*0.5}s ease-in-out infinite ${i*0.4}s` }}/>
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

        {/* floating code snippets */}
        {codeSnippets.map((s, i) => (
          <div key={i} className="absolute pointer-events-none font-mono font-bold select-none" style={{
            bottom: 0, left: s.left, fontSize: s.size,
            color: 'rgba(255,220,200,0.55)',
            animation: `floatCode ${s.dur}s linear infinite ${s.delay}`,
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
          <div className="text-center max-w-4xl mx-auto">

            <motion.span
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20"
            >
              Bergabung Bersama Kami
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.4, ease: EASE }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight"
            >
              Bangun Masa Depan <br />
              <motion.span
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-300 inline-block"
              >
                Pariwisata Indonesia
              </motion.span>
            </motion.h1>

            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.15 }}
            >
              <motion.button
                onClick={() => scrollToSection(openPositionsRef)}
                className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg shadow-xl transition-all"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}
                whileTap={{ scale: 0.96 }}
              >
                Lihat Lowongan Tersedia
              </motion.button>
              <motion.button
                onClick={() => scrollToSection(cultureRef)}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold text-lg border border-white/30 transition-all"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.18)' }}
                whileTap={{ scale: 0.96 }}
              >
                Budaya Kerja
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          2. BUDAYA & KULTUR
      ════════════════════════════════ */}
      <div
        id="culture"
        ref={(el) => {
          cultureRef.current = el as HTMLDivElement;
          (cultureReveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className="bg-white py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            animate={cultureReveal.inView ? 'visible' : 'hidden'}
          >
            <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">
              Kehidupan di Trivgoo
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Lebih dari Sekadar Pekerjaan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Kami percaya bahwa bekerja harus penuh makna, mendorong pertumbuhan, dan tentu saja — menyenangkan.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={stagger}
            initial="hidden"
            animate={cultureReveal.inView ? 'visible' : 'hidden'}
          >
            {teamCulture.map((culture, index) => {
              const Icon = culture.icon;
              return (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  custom={index}
                  whileHover={{ y: -8, boxShadow: '0 20px 48px rgba(0,0,0,0.1)' }}
                  className="bg-gray-50 rounded-3xl p-8 border border-gray-100 cursor-default"
                >
                  <div className={`w-14 h-14 rounded-2xl ${culture.color.split(' ')[1]} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${culture.color.split(' ')[0]}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{culture.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{culture.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Keuntungan & Tunjangan */}
          <motion.div
            className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-8 md:p-12"
            ref={perksReveal.ref}
            variants={fadeUp}
            initial="hidden"
            animate={perksReveal.inView ? 'visible' : 'hidden'}
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">
                Keuntungan & Tunjangan
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Kami berinvestasi dalam kebahagiaan, pertumbuhan, dan kesejahteraan seluruh tim.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={stagger}
              initial="hidden"
              animate={perksReveal.inView ? 'visible' : 'hidden'}
            >
              {perks.map((perk, index) => {
                const Icon = perk.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    custom={index}
                    whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                    className="flex items-start p-4 bg-white rounded-2xl border border-gray-100 cursor-default"
                  >
                    <div className="p-3 bg-primary-50 rounded-xl mr-4 text-primary-600 flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{perk.title}</h4>
                      <p className="text-sm text-gray-600">{perk.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════
          3. POSISI TERBUKA
      ════════════════════════════════ */}
      <div
        id="open-positions"
        ref={(el) => {
          openPositionsRef.current = el as HTMLDivElement;
          (jobsReveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className="bg-gray-50 py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            animate={jobsReveal.inView ? 'visible' : 'hidden'}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Posisi yang Tersedia
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Temukan peran yang tepat untukmu dan bersama kami membentuk masa depan perjalanan.
            </p>
          </motion.div>

          {/* Filter */}
          <motion.div
            className="flex flex-wrap gap-4 mb-12 justify-center"
            variants={stagger}
            initial="hidden"
            animate={jobsReveal.inView ? 'visible' : 'hidden'}
          >
            {['Semua Posisi', 'Teknologi', 'Operasional', 'Pemasaran'].map((label, i) => (
              <motion.button
                key={label}
                variants={scaleIn}
                custom={i}
                whileTap={{ scale: 0.94 }}
                className={`px-6 py-3 rounded-full font-bold text-sm transition-colors ${
                  i === 0
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-400 hover:text-primary-600'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </motion.div>

          {/* Kartu Lowongan */}
          <motion.div
            className="space-y-6"
            variants={stagger}
            initial="hidden"
            animate={jobsReveal.inView ? 'visible' : 'hidden'}
          >
            {jobPositions.map((job, idx) => (
              <motion.div
                key={job.id}
                variants={fadeUp}
                custom={idx}
                whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.09)' }}
                className="bg-white rounded-3xl p-8 border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700">
                        <Briefcase className="w-3 h-3 mr-1" />{job.department}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        <MapPin className="w-3 h-3 mr-1" />{job.location}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <Clock className="w-3 h-3 mr-1" />{job.type}
                      </span>
                      {job.isRemote && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleApplyNow(job)}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center mt-4 md:mt-0"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Lamar Sekarang <ArrowRight className="w-4 h-4 ml-2" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <Target className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pengalaman</div>
                      <div className="font-bold text-gray-900">{job.experience}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Diposting</div>
                      <div className="font-bold text-gray-900">{job.postedDate}</div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{job.description}</p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {job.requirements.length} persyaratan • {job.benefits.length} keuntungan
                  </div>
                  <button
                    onClick={() => handleApplyNow(job)}
                    className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center"
                  >
                    Selengkapnya <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════
          MODAL FORMULIR LAMARAN
      ════════════════════════════════ */}
      {selectedJob && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Lamar: {selectedJob.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">{selectedJob.department}</span>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">{selectedJob.location}</span>
                    {selectedJob.isRemote && (
                      <><span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-primary-600 font-bold">Remote</span></>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleSubmitApplication}>
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap *</label>
                    <input type="text" name="fullName" value={applicationForm.fullName} onChange={handleInputChange} required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama lengkap Anda" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email *</label>
                      <input type="email" name="email" value={applicationForm.email} onChange={handleInputChange} required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="email@contoh.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Telepon *</label>
                      <input type="tel" name="phone" value={applicationForm.phone} onChange={handleInputChange} required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+62 812 3456 7890" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Portofolio / Website (Opsional)</label>
                    <input type="url" name="portfolioUrl" value={applicationForm.portfolioUrl} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://portofolio-anda.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Surat Lamaran *</label>
                    <textarea name="coverLetter" value={applicationForm.coverLetter} onChange={handleInputChange} required rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Ceritakan mengapa Anda tertarik dengan posisi ini dan apa yang membuat Anda adalah kandidat yang tepat..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">CV / Resume *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <input type="file" accept=".pdf,.doc,.docx" required className="hidden" id="resume-upload" />
                      <label htmlFor="resume-upload" className="cursor-pointer inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                        <ArrowRight className="w-4 h-4 mr-2" /> Unggah CV
                      </label>
                      <p className="text-sm text-gray-500 mt-2">PDF, DOC, DOCX maksimal 5MB</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setSelectedJob(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                    Batal
                  </button>
                  <button type="submit"
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center">
                    Kirim Lamaran <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ════════════════════════════════
          4. CTA SECTION
      ════════════════════════════════ */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-20 text-white relative overflow-hidden" ref={ctaReveal.ref}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <motion.h2
            className="text-3xl md:text-5xl font-serif font-bold mb-6"
            variants={fadeUp}
            initial="hidden"
            animate={ctaReveal.inView ? 'visible' : 'hidden'}
          >
            Belum Menemukan Posisi yang Tepat?
          </motion.h2>

          <motion.p
            className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto"
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate={ctaReveal.inView ? 'visible' : 'hidden'}
          >
            Kami selalu mencari talenta terbaik. Kirimkan CV Anda dan ceritakan bagaimana Anda ingin berkontribusi bersama kami.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={stagger}
            initial="hidden"
            animate={ctaReveal.inView ? 'visible' : 'hidden'}
          >
            <motion.div variants={scaleIn} custom={0} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <a href="mailto:careers@trivgoo.com"
                className="inline-block px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl">
                Kirim CV Anda
              </a>
            </motion.div>
            <motion.div variants={scaleIn} custom={1} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/contact-us"
                className="inline-block px-8 py-4 bg-primary-800 text-white rounded-full font-bold text-lg border border-primary-500 hover:bg-primary-900 transition-all shadow-xl">
                Hubungi Tim Kami
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Career;

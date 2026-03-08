import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  MapPin,
  Search,
  Share2,
  Tag,
  TrendingUp,
  MessageCircle,
  Bookmark,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';

/* ─── Typed cubic-bezier ─── */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Variants ─── */
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

function useReveal(amount = 0.12) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  return { ref, inView };
}

/* ══ interfaces ══ */
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: { name: string; avatar: string; role: string };
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;
  image: string;
  views: number;
  likes: number;
  comments: number;
  isFeatured?: boolean;
  isTrending?: boolean;
}

/* ── floating paper plane (urban version of seagull) ── */
const PaperPlane: React.FC<{ x: number; y: number; size?: number; delay: number; rotate?: number }> = ({ 
  x, y, size = 1, delay, rotate = 15 
}) => (
  <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${size})`}
    style={{ animation: `planeFloat 5s ease-in-out infinite ${delay}s` }}>
    <path d="M-12 0 L0 -8 L12 0 L0 8 Z" fill="rgba(255,220,160,0.65)" stroke="rgba(255,200,150,0.4)" strokeWidth="1" />
    <line x1="0" y1="-8" x2="0" y2="8" stroke="rgba(255,200,150,0.3)" strokeWidth="1" strokeDasharray="2 2" />
  </g>
);

/* ── skyscraper / building ── */
const Skyscraper: React.FC<{ x: number; height: number; width?: number; windows: number; delay: number }> = ({ 
  x, height, width = 30, windows, delay 
}) => {
  const buildingColors = [
    'rgba(100,70,50,0.75)', 'rgba(110,75,55,0.8)', 'rgba(90,65,45,0.7)', 
    'rgba(120,85,60,0.75)', 'rgba(105,72,52,0.8)'
  ];
  const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
  const windowColor = 'rgba(255,200,120,0.7)';
  const windowSpacing = height / (windows + 1);
  
  return (
    <g transform={`translate(${x}, 320)`}
      style={{ animation: `buildingGlow ${4 + delay}s ease-in-out infinite ${delay}s` }}>
      {/* Building body */}
      <rect x={-width/2} y={-height} width={width} height={height} fill={color} rx="2" />
      {/* Building highlight - warm sunset reflection */}
      <rect x={-width/2} y={-height} width="4" height={height} fill="rgba(255,180,100,0.25)" />
      {/* Windows - warm glow */}
      {Array.from({ length: windows }).map((_, i) => (
        <g key={i}>
          <rect 
            x={-width/2 + 5} 
            y={-height + (i + 1) * windowSpacing - 4} 
            width="6" height="6" 
            fill={windowColor} 
            rx="1"
            style={{ animation: `windowTwinkle ${3 + i * 0.4}s ease-in-out infinite ${i * 0.2}s` }}
          />
          <rect 
            x={-width/2 + 18} 
            y={-height + (i + 1) * windowSpacing - 4} 
            width="6" height="6" 
            fill={windowColor} 
            rx="1"
            style={{ animation: `windowTwinkle ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s` }}
          />
        </g>
      ))}
      {/* Antenna */}
      <line x1="0" y1={-height} x2="0" y2={-height-12} stroke="rgba(200,140,80,0.6)" strokeWidth="1.5" />
      <circle cx="0" cy={-height-15} r="2" fill="rgba(255,150,80,0.6)" style={{ animation: 'antennaBlink 2s ease-in-out infinite' }} />
    </g>
  );
};

/* ── bridge structure ── */
const Bridge: React.FC<{ x: number; span: number; delay: number }> = ({ x, span, delay }) => (
  <g transform={`translate(${x}, 300)`} style={{ animation: `bridgeLight ${6 + delay}s ease-in-out infinite` }}>
    <path 
      d={`M0 0 Q${span/4} -10 ${span/2} 0 Q${span*3/4} 10 ${span} 0`} 
      fill="none" 
      stroke="rgba(255,180,120,0.4)" 
      strokeWidth="3" 
      strokeDasharray="8 8"
    />
    {[0, span/4, span/2, span*3/4, span].map((pos, i) => (
      <circle key={i} cx={pos} cy="0" r="3" fill="rgba(255,160,80,0.7)" style={{ animation: `bridgeLightPulse ${3 + i*0.5}s infinite` }} />
    ))}
  </g>
);

const TravelBlog: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 9;

  /* reveal hooks */
  const featuredReveal  = useReveal();
  const trendingReveal  = useReveal();
  const gridReveal      = useReveal();

  /* ── blog posts (Indonesian) ── */
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Pura Tersembunyi di Bali: Melampaui Jalur Wisatawan',
      excerpt: 'Temukan pura-pura kuno yang tersembunyi di dalam hutan lebat Bali, jauh dari keramaian dan komersialisasi.',
      content: '',
      author: { name: 'Andrew Morgan', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'Penulis & Fotografer Perjalanan' },
      category: 'destinasi',
      tags: ['Bali', 'Pura', 'Budaya', 'Permata Tersembunyi'],
      readTime: '8 menit',
      publishDate: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      views: 2543, likes: 187, comments: 42,
      isFeatured: true, isTrending: true,
    },
    {
      id: 2,
      title: 'Wisata Berkelanjutan di Raja Ampat: Cara Berkunjung yang Bertanggung Jawab',
      excerpt: 'Panduan lengkap menjelajahi salah satu ekosistem laut paling beragam di dunia dengan meminimalkan dampak lingkungan.',
      content: '',
      author: { name: 'Maya Sari', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', role: 'Konservasionis Laut' },
      category: 'panduan',
      tags: ['Raja Ampat', 'Berkelanjutan', 'Kehidupan Laut', 'Eco-Tourism'],
      readTime: '12 menit',
      publishDate: '2024-03-12',
      image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=800&q=80',
      views: 1876, likes: 234, comments: 38,
      isTrending: true,
    },
    {
      id: 3,
      title: 'Komodo dari Dekat: Perjalanan Seorang Fotografer',
      excerpt: 'Mengabadikan komodo legendaris di habitat aslinya — tips, cerita, dan foto-foto yang memukau.',
      content: '',
      author: { name: 'Budi Santoso', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', role: 'Fotografer Satwa Liar' },
      category: 'fotografi',
      tags: ['Komodo', 'Satwa Liar', 'Fotografi', 'Indonesia'],
      readTime: '10 menit',
      publishDate: '2024-03-10',
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
      views: 3210, likes: 312, comments: 56,
      isFeatured: true,
    },
    {
      id: 4,
      title: 'Itinerari Yogyakarta 5 Hari: Budaya & Petualangan Lengkap',
      excerpt: 'Dari Borobudur saat fajar hingga petualangan kuliner Jawa, itinerari ini mencakup semuanya.',
      content: '',
      author: { name: 'Siti Nurhaliza', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', role: 'Pemandu Budaya' },
      category: 'panduan',
      tags: ['Yogyakarta', 'Itinerari', 'Budaya', 'Kuliner'],
      readTime: '15 menit',
      publishDate: '2024-03-08',
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
      views: 1895, likes: 156, comments: 29,
    },
    {
      id: 5,
      title: 'Tokyo dengan Budget Terbatas: Nikmati Kemewahan Lebih Hemat',
      excerpt: 'Tips pro untuk menikmati pengalaman terbaik Tokyo tanpa menguras kantong.',
      content: '',
      author: { name: 'Kenji Tanaka', avatar: 'https://randomuser.me/api/portraits/men/29.jpg', role: 'Pakar Wisata Hemat' },
      category: 'panduan',
      tags: ['Tokyo', 'Hemat', 'Mewah', 'Tips'],
      readTime: '7 menit',
      publishDate: '2024-03-05',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
      views: 2789, likes: 198, comments: 41,
    },
    {
      id: 6,
      title: 'Kafe Rahasia Seoul: Tempat Warga Lokal Nongkrong',
      excerpt: 'Di balik tempat wisata mainstream — temukan budaya kafe tersembunyi Seoul yang disukai warga setempat.',
      content: '',
      author: { name: 'Ji-eun Kim', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', role: 'Penulis Kuliner & Budaya' },
      category: 'budaya',
      tags: ['Seoul', 'Kafe', 'Lokal', 'Kuliner'],
      readTime: '6 menit',
      publishDate: '2024-03-03',
      image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80',
      views: 2156, likes: 178, comments: 33,
    },
    {
      id: 7,
      title: 'Mendaki Gunung Bromo: Fakta yang Jarang Diceritakan',
      excerpt: 'Tips penting dan wawasan jujur untuk menaklukkan gunung berapi paling ikonik di Indonesia.',
      content: '',
      author: { name: 'Rizky Pratama', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', role: 'Pemandu Petualangan' },
      category: 'petualangan',
      tags: ['Gunung Bromo', 'Pendakian', 'Petualangan', 'Gunung Berapi'],
      readTime: '11 menit',
      publishDate: '2024-02-28',
      image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80',
      views: 3421, likes: 267, comments: 48,
      isTrending: true,
    },
    {
      id: 8,
      title: 'Hawker Center Singapura: Surga Para Pecinta Kuliner',
      excerpt: 'Menjelajahi scene kuliner jalanan legendaris Singapura layaknya seorang profesional.',
      content: '',
      author: { name: 'Wei Chen', avatar: 'https://randomuser.me/api/portraits/men/51.jpg', role: 'Kritikus Kuliner' },
      category: 'budaya',
      tags: ['Singapura', 'Kuliner', 'Hawker', 'Makanan Jalanan'],
      readTime: '9 menit',
      publishDate: '2024-02-25',
      image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80',
      views: 1987, likes: 145, comments: 27,
    },
    {
      id: 9,
      title: 'Hutan Bambu Kyoto: Menemukan Kedamaian di Tengah Keramaian',
      excerpt: 'Cara menikmati keajaiban Arashiyama tanpa terjebak lautan wisatawan.',
      content: '',
      author: { name: 'Haruki Yamamoto', avatar: 'https://randomuser.me/api/portraits/men/38.jpg', role: 'Penulis Zen & Wellness' },
      category: 'destinasi',
      tags: ['Kyoto', 'Bambu', 'Wellness', 'Jepang'],
      readTime: '8 menit',
      publishDate: '2024-02-22',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      views: 2310, likes: 189, comments: 35,
    },
    {
      id: 10,
      title: 'Skyline Hong Kong: Tips Fotografi untuk Bidikan Sempurna',
      excerpt: 'Kuasai seni mengabadikan skyline ikonik Hong Kong saat golden hour.',
      content: '',
      author: { name: 'Ming Lee', avatar: 'https://randomuser.me/api/portraits/men/62.jpg', role: 'Fotografer Cityscape' },
      category: 'fotografi',
      tags: ['Hong Kong', 'Fotografi', 'Skyline', 'Tips'],
      readTime: '7 menit',
      publishDate: '2024-02-20',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
      views: 2678, likes: 203, comments: 39,
    },
    {
      id: 11,
      title: 'Pasar Malam Bangkok: Lebih dari Sekadar Chatuchak',
      excerpt: 'Temukan pasar malam yang kurang dikenal namun menawarkan pengalaman Thailand yang autentik.',
      content: '',
      author: { name: 'Chaya Wong', avatar: 'https://randomuser.me/api/portraits/women/31.jpg', role: 'Penjelajah Pasar' },
      category: 'budaya',
      tags: ['Bangkok', 'Pasar', 'Kehidupan Malam', 'Belanja'],
      readTime: '6 menit',
      publishDate: '2024-02-18',
      image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80',
      views: 1895, likes: 134, comments: 24,
    },
    {
      id: 12,
      title: 'Menyelam di Bunaken: Surga Bawah Laut',
      excerpt: 'Menjelajahi salah satu lokasi menyelam terbaik di dunia di Sulawesi Utara.',
      content: '',
      author: { name: 'Dewa Putra', avatar: 'https://randomuser.me/api/portraits/men/33.jpg', role: 'Dive Master' },
      category: 'petualangan',
      tags: ['Bunaken', 'Menyelam', 'Kehidupan Laut', 'Petualangan'],
      readTime: '13 menit',
      publishDate: '2024-02-15',
      image: 'https://images.unsplash.com/photo-1514999037859-b486988734f1?auto=format&fit=crop&w=800&q=80',
      views: 2987, likes: 245, comments: 43,
    },
  ];

  const trendingPosts = blogPosts.filter(p => p.isTrending);
  const featuredPosts = blogPosts.filter(p => p.isFeatured);

  useEffect(() => {
    let filtered = blogPosts;
    if (selectedCategory !== 'all')
      filtered = filtered.filter(p => p.category === selectedCategory);
    if (searchQuery.trim())
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const indexOfLastPost  = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts     = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages       = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      destinasi: 'Destinasi', panduan: 'Panduan', fotografi: 'Fotografi',
      budaya: 'Budaya', petualangan: 'Petualangan',
    };
    return map[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  /* city scene data - sunset theme */
  const skyscrapers = [
    { x: 120,  height: 150, windows: 8,  delay: 0   },
    { x: 200,  height: 210, windows: 12, delay: 0.5 },
    { x: 300,  height: 180, windows: 10, delay: 1.2 },
    { x: 400,  height: 280, windows: 16, delay: 0.8 },
    { x: 520,  height: 190, windows: 11, delay: 1.5 },
    { x: 620,  height: 250, windows: 14, delay: 0.3 },
    { x: 720,  height: 160, windows: 9,  delay: 1.9 },
    { x: 830,  height: 220, windows: 13, delay: 0.7 },
    { x: 940,  height: 300, windows: 18, delay: 1.1 },
    { x: 1050, height: 170, windows: 10, delay: 2.0 },
    { x: 1150, height: 230, windows: 14, delay: 0.4 },
    { x: 50,   height: 120, windows: 7,  delay: 1.3 },
  ];

  const paperPlanes = [
    { x: 100,  y: 80,  size: 0.8,  delay: 0,   rotate: 10 },
    { x: 280,  y: 120, size: 1.0,  delay: 1.2, rotate: -5 },
    { x: 450,  y: 60,  size: 0.9,  delay: 0.7, rotate: 15 },
    { x: 620,  y: 100, size: 1.1,  delay: 2.0, rotate: -8 },
    { x: 790,  y: 45,  size: 0.85, delay: 1.5, rotate: 20 },
    { x: 950,  y: 130, size: 1.2,  delay: 0.9, rotate: -12 },
    { x: 1100, y: 70,  size: 0.9,  delay: 1.8, rotate: 8 },
  ];

  const bridges = [
    { x: 200, span: 300, delay: 0.2 },
    { x: 700, span: 250, delay: 1.3 },
  ];

  const floatingOrbs = [
    { w:320, h:320, top:'5%',  left:'-5%',  color:'rgba(255,150,80,0.1)', dur:10 },
    { w:250, h:250, top:'50%', left:'73%',  color:'rgba(255,180,100,0.08)', dur:13 },
    { w:200, h:200, top:'22%', left:'55%',  color:'rgba(255,130,60,0.09)',  dur:8  },
    { w:160, h:160, top:'70%', left:'20%',  color:'rgba(255,200,120,0.07)',  dur:11 },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes buildingGlow {
          0%,100% { opacity: 0.9; }
          50%     { opacity: 1; filter: brightness(1.1); }
        }
        @keyframes windowTwinkle {
          0%,100% { opacity: 0.7; fill: rgba(255,200,120,0.7); }
          50%     { opacity: 1; fill: rgba(255,230,150,1); }
        }
        @keyframes planeFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          40%     { transform: translateY(-12px) rotate(-3deg); }
          70%     { transform: translateY(-6px) rotate(2deg); }
        }
        @keyframes antennaBlink {
          0%,100% { fill: rgba(255,150,80,0.6); }
          50%     { fill: rgba(255,200,100,1); }
        }
        @keyframes bridgeLightPulse {
          0%,100% { fill: rgba(255,160,80,0.7); r: 3; }
          50%     { fill: rgba(255,220,150,1); r: 4; }
        }
        @keyframes sunGlow {
          0%,100% { r: 38; opacity: 0.8; }
          50%     { r: 44; opacity: 1; }
        }
        @keyframes gridDrift {
          0%   { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }
        @keyframes scanH {
          0%   { transform:translateY(0);    opacity:0.15; }
          50%  { opacity:0.3; }
          100% { transform:translateY(100vh); opacity:0.15; }
        }
        .grid-drift { animation: gridDrift 4s linear infinite; }
        .scan-h     { animation: scanH 5s linear infinite; }
      `}</style>

      {/* ════════════════════════════════
          HERO — Urban Cityscape at Sunset
      ════════════════════════════════ */}
      <div
        className="relative text-white overflow-hidden"
        style={{ 
          minHeight: '100vh', 
          background: `linear-gradient(135deg, #E05845 0%, #E06A45 30%, #E07B45 60%, #E08C45 100%)`
        }}
      >
        {/* dot grid - golden hour sparkle */}
        <div className="absolute inset-0 grid-drift"
          style={{ backgroundImage:'radial-gradient(circle, rgba(255,220,150,0.3) 1.5px, transparent 1.5px)', backgroundSize:'48px 48px' }} />

        {/* glowing orbs - warm sunset glow */}
        {floatingOrbs.map((o,i) => (
          <div key={i} className="absolute rounded-full pointer-events-none" style={{
            width:o.w, height:o.h, top:o.top, left:o.left,
            background:`radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            animation:`cloudDrift ${o.dur}s ease-in-out infinite ${i*1.5}s`,
          }} />
        ))}

        {/* ── CITYSCAPE — bottom portion ── */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '60%' }}>
          <svg
            viewBox="0 0 1280 420"
            preserveAspectRatio="xMidYMax meet"
            className="absolute bottom-0 left-0 w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* ── SUNSET SUN with warm glow ── */}
            <circle cx="640" cy="100" r="38" fill="rgba(255,180,80,0.25)"
              style={{ animation:'sunGlow 5s ease-in-out infinite' }} />
            <circle cx="640" cy="100" r="30" fill="rgba(255,160,70,0.3)" />
            <circle cx="640" cy="100" r="22" fill="rgba(255,140,60,0.4)" />
            <circle cx="640" cy="100" r="16" fill="rgba(255,120,50,0.5)" />
            
            {/* sun rays - warm sunset rays */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 22.5) * Math.PI / 180;
              const x1 = 640 + Math.cos(angle) * 45;
              const y1 = 100 + Math.sin(angle) * 45;
              const x2 = 640 + Math.cos(angle) * 70;
              const y2 = 100 + Math.sin(angle) * 70;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,180,80,0.2)" strokeWidth="2" strokeLinecap="round"
                style={{ animation:`windowTwinkle ${3 + i*0.2}s ease-in-out infinite ${i*0.1}s` }}/>;
            })}

            {/* ── CITY ATMOSPHERE (warm haze) ── */}
            <rect x="0" y="180" width="1280" height="240" fill="rgba(255,140,70,0.12)" />

            {/* ── distant buildings silhouette with sunset glow ── */}
            <g opacity="0.4">
              {[50,150,250,350,450,550,650,750,850,950,1050,1150,1250].map((x, i) => (
                <rect key={i} x={x} y={160 - i%3 * 10} width="20" height={70 + i*8} fill="rgba(180,90,50,0.5)" />
              ))}
            </g>

            {/* ── BRIDGES with warm glow ── */}
            {bridges.map((bridge, i) => (
              <Bridge key={i} x={bridge.x} span={bridge.span} delay={bridge.delay} />
            ))}

            {/* ── URBAN GROUND / CITY BASE with sunset colors ── */}
            <path d="M0 300 Q160 295 320 300 Q480 305 640 298 Q800 291 960 300 Q1120 309 1280 300 L1280 420 L0 420 Z"
              fill="rgba(140,70,40,0.5)" />
            
            {/* ground reflections - golden hour */}
            <path d="M0 305 Q160 300 320 305 Q480 310 640 303 Q800 296 960 305 Q1120 314 1280 305"
              fill="none" stroke="rgba(255,200,120,0.2)" strokeWidth="2" />
            
            {/* ground ripples / texture */}
            {[315, 325, 335, 345].map((y, i) => (
              <path key={i}
                d={`M${100 + i*20} ${y} Q${300 + i*15} ${y-1} ${500 + i*20} ${y} Q${700+i*10} ${y+1} ${900+i*15} ${y} Q${1100+i*10} ${y-1} ${1280} ${y}`}
                fill="none" stroke="rgba(255,160,80,0.1)" strokeWidth="1" />
            ))}

            {/* ── SKYSCRAPERS with sunset reflections ── */}
            {skyscrapers.map((b, i) => (
              <g key={i}>
                <Skyscraper x={b.x} height={b.height} windows={b.windows} delay={b.delay} />
              </g>
            ))}

            {/* ── PAPER PLANES at sunset ── */}
            {paperPlanes.map((p, i) => (
              <PaperPlane key={i} x={p.x} y={p.y} size={p.size} delay={p.delay} rotate={p.rotate} />
            ))}

            {/* ── warm light sparkles / sun reflections ── */}
            {[150,280,420,560,700,840,980,1120,1240,200,660,920].map((x, i) => {
              const y = 190 + (i % 6) * 12;
              return (
                <g key={i} style={{ animation:`windowTwinkle ${2+i*0.3}s ease-in-out infinite ${i*0.15}s` }}>
                  <circle cx={x} cy={y} r="2" fill="rgba(255,200,100,0.6)" />
                  <circle cx={x+3} cy={y-1} r="1.5" fill="rgba(255,220,150,0.6)" />
                </g>
              );
            })}

            {/* ── HELICOPTER / DRONE at sunset ── */}
            <g style={{ animation: 'planeFloat 7s ease-in-out infinite 0.5s' }} opacity="0.7">
              <circle cx="440" cy="180" r="4" fill="rgba(255,140,60,0.6)" />
              <line x1="440" y1="180" x2="430" y2="170" stroke="rgba(255,180,100,0.5)" strokeWidth="1.5" />
              <line x1="440" y1="180" x2="450" y2="170" stroke="rgba(255,180,100,0.5)" strokeWidth="1.5" />
              <circle cx="440" cy="180" r="7" fill="none" stroke="rgba(255,160,80,0.3)" strokeWidth="1" />
            </g>
            
            <g style={{ animation: 'planeFloat 8s ease-in-out infinite 2s' }} opacity="0.6">
              <circle cx="860" cy="160" r="4" fill="rgba(255,160,70,0.6)" />
              <line x1="860" y1="160" x2="850" y2="150" stroke="rgba(255,180,100,0.5)" strokeWidth="1.5" />
              <line x1="860" y1="160" x2="870" y2="150" stroke="rgba(255,180,100,0.5)" strokeWidth="1.5" />
            </g>

            {/* ── horizon glow (sunset gradient) ── */}
            <rect x="0" y="170" width="1280" height="20"
              fill="url(#horizonGlow)" opacity="0.7" />
            <defs>
              <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,150,70,0.4)" />
                <stop offset="100%" stopColor="rgba(255,100,50,0)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* scan line - warm sunset tone */}
        <div className="scan-h absolute inset-x-0 pointer-events-none"
          style={{ height:'2px', top:0, background:'linear-gradient(90deg, transparent, rgba(255,200,150,0.4), transparent)' }} />

        {/* bottom fade - warm gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background:'linear-gradient(to bottom, transparent, rgba(200,80,40,0.6))' }} />

        {/* ── Hero Content ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"
          style={{ minHeight: '50vh' }}>
          <div className="text-center max-w-4xl mx-auto">

            <motion.span
              initial={{ opacity:0, y:-18 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.55, delay:0.2 }}
              className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20"
            >
              Blog Wisata
            </motion.span>

            <motion.h1
              initial={{ opacity:0, y:44 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.85, delay:0.4, ease:EASE }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight"
            >
             Setiap Destinasi<br />
              <motion.span
                initial={{ opacity:0, scale:0.88 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ duration:0.7, delay:0.75, ease:EASE }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-orange-300 inline-block"
              >
               Punya Cerita
              </motion.span>
            </motion.h1>

            {/* Search Bar */}
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity:0, y:24 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.6, delay:1.15 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari artikel, destinasi kota, atau topik..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          PILIHAN EDITOR
      ════════════════════════════════ */}
      {featuredPosts.length > 0 && (
        <div className="bg-gray-50 py-16 md:py-20" ref={featuredReveal.ref}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between mb-10">
              <motion.div variants={fadeLeft} initial="hidden" animate={featuredReveal.inView ? 'visible' : 'hidden'}>
                <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-2 block">Artikel Unggulan</span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-1">Pilihan Editor</h2>
                <p className="text-gray-600">Cerita pilihan yang dikurasi oleh tim redaksi kami</p>
              </motion.div>
              <motion.div
                className="hidden md:flex items-center text-primary-600 font-bold hover:text-primary-700 transition-colors cursor-pointer"
                variants={fadeRight} initial="hidden" animate={featuredReveal.inView ? 'visible' : 'hidden'}
              >
                Lihat Semua Unggulan <ArrowRight className="w-4 h-4 ml-2" />
              </motion.div>
            </div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              variants={stagger} initial="hidden" animate={featuredReveal.inView ? 'visible' : 'hidden'}
            >
              {featuredPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  variants={scaleIn} custom={idx}
                  whileHover={{ y:-6, boxShadow:'0 24px 55px rgba(0,0,0,0.11)' }}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 cursor-pointer"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img src={post.image} alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-600 text-white">
                        Unggulan
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-sm text-gray-500 mr-4">
                        <Calendar className="w-4 h-4 mr-1" />{formatDate(post.publishDate)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />{post.readTime} baca
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center">
                        <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full mr-3" />
                        <div>
                          <div className="font-bold text-gray-900">{post.author.name}</div>
                          <div className="text-sm text-gray-500">{post.author.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-500">
                        <button className="flex items-center hover:text-red-500 transition-colors">
                          <Heart className="w-5 h-5" /><span className="ml-1 text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-5 h-5" /><span className="ml-1 text-sm">{post.comments}</span>
                        </button>
                        <button className="hover:text-gray-700 transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          SEDANG TRENDING
      ════════════════════════════════ */}
      {trendingPosts.length > 0 && (
        <div className="bg-white py-16 md:py-20" ref={trendingReveal.ref}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <motion.div
              className="flex items-center justify-between mb-10"
              variants={fadeLeft} initial="hidden" animate={trendingReveal.inView ? 'visible' : 'hidden'}
            >
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-1">Sedang Trending</h2>
                  <p className="text-gray-600">Artikel paling banyak dibaca minggu ini</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={stagger} initial="hidden" animate={trendingReveal.inView ? 'visible' : 'hidden'}
            >
              {trendingPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  variants={fadeUp} custom={idx}
                  whileHover={{ y:-5, boxShadow:'0 20px 50px rgba(0,0,0,0.09)' }}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 cursor-pointer"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={post.image} alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
                        Trending
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="mr-3">{formatDate(post.publishDate)}</span>
                      <span>•</span>
                      <span className="ml-3">{post.readTime} baca</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full mr-2" />
                        <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{post.views}</span>
                        <span className="flex items-center"><Heart className="w-4 h-4 mr-1" />{post.likes}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          SEMUA ARTIKEL
      ════════════════════════════════ */}
      <div className="bg-gray-50 py-16 md:py-20" ref={gridReveal.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div className="mb-10" variants={fadeLeft} initial="hidden" animate={gridReveal.inView ? 'visible' : 'hidden'}>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-1">Artikel Terbaru</h2>
            <p className="text-gray-600">Jelajahi semua artikel dan panduan perjalanan kami</p>
          </motion.div>

          {currentPosts.length > 0 ? (
            <>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={stagger} initial="hidden" animate={gridReveal.inView ? 'visible' : 'hidden'}
              >
                {currentPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    variants={fadeUp} custom={idx}
                    whileHover={{ y:-5, boxShadow:'0 20px 50px rgba(0,0,0,0.09)' }}
                    onClick={() => navigate(`/blog/${post.id}`)}
                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 cursor-pointer"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img src={post.image} alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700">
                          {categoryLabel(post.category)}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="mr-3">{formatDate(post.publishDate)}</span>
                        <span>•</span>
                        <span className="ml-3">{post.readTime} baca</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                            <Tag className="w-3 h-3 mr-1" />{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                          <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full mr-2" />
                          <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
                        </div>
                        <motion.button
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          whileHover={{ scale:1.2 }} whileTap={{ scale:0.9 }}
                        >
                          <Bookmark className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  className="flex justify-center items-center mt-16 space-x-2"
                  variants={fadeUp} initial="hidden" animate={gridReveal.inView ? 'visible' : 'hidden'}
                >
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                    className={`p-2 rounded-full ${currentPage===1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page===1 || page===totalPages || (page>=currentPage-1 && page<=currentPage+1))
                    .map((page, index, array) => {
                      const showEllipsis = index < array.length-1 && array[index+1]-page > 1;
                      return (
                        <React.Fragment key={page}>
                          <button onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-full font-bold ${currentPage===page ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                            {page}
                          </button>
                          {showEllipsis && <span className="text-gray-400 px-2">...</span>}
                        </React.Fragment>
                      );
                    })}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage===totalPages}
                    className={`p-2 rounded-full ${currentPage===totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              className="text-center py-20"
              variants={fadeUp} initial="hidden" animate={gridReveal.inView ? 'visible' : 'hidden'}
            >
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Artikel tidak ditemukan</h3>
              <p className="text-gray-600">Coba sesuaikan kata kunci pencarian Anda</p>
              <motion.button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
              >
                Hapus Filter
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TravelBlog;
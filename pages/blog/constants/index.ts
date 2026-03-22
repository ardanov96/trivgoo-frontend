import type { Variants } from 'framer-motion';
import type { BlogPost } from '../types';

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
  @keyframes buildingGlow   { 0%,100%{opacity:0.9} 50%{opacity:1;filter:brightness(1.1)} }
  @keyframes windowTwinkle  { 0%,100%{opacity:0.7;fill:rgba(255,200,120,0.7)} 50%{opacity:1;fill:rgba(255,230,150,1)} }
  @keyframes planeFloat     { 0%,100%{transform:translateY(0) rotate(0deg)} 40%{transform:translateY(-12px) rotate(-3deg)} 70%{transform:translateY(-6px) rotate(2deg)} }
  @keyframes antennaBlink   { 0%,100%{fill:rgba(255,150,80,0.6)} 50%{fill:rgba(255,200,100,1)} }
  @keyframes bridgeLightPulse { 0%,100%{fill:rgba(255,160,80,0.7);r:3} 50%{fill:rgba(255,220,150,1);r:4} }
  @keyframes sunGlow        { 0%,100%{r:38;opacity:0.8} 50%{r:44;opacity:1} }
  @keyframes gridDrift      { 0%{background-position:0 0} 100%{background-position:48px 48px} }
  @keyframes scanH          { 0%{transform:translateY(0);opacity:0.15} 50%{opacity:0.3} 100%{transform:translateY(100vh);opacity:0.15} }
  .grid-drift { animation: gridDrift 4s linear infinite; }
  .scan-h     { animation: scanH 5s linear infinite; }
`;

// ── Hero cityscape data ───────────────────────────────────────────────────────
export const SKYSCRAPERS = [
  { x:120,  height:150, windows:8,  delay:0   },
  { x:200,  height:210, windows:12, delay:0.5 },
  { x:300,  height:180, windows:10, delay:1.2 },
  { x:400,  height:280, windows:16, delay:0.8 },
  { x:520,  height:190, windows:11, delay:1.5 },
  { x:620,  height:250, windows:14, delay:0.3 },
  { x:720,  height:160, windows:9,  delay:1.9 },
  { x:830,  height:220, windows:13, delay:0.7 },
  { x:940,  height:300, windows:18, delay:1.1 },
  { x:1050, height:170, windows:10, delay:2.0 },
  { x:1150, height:230, windows:14, delay:0.4 },
  { x:50,   height:120, windows:7,  delay:1.3 },
];

export const PAPER_PLANES = [
  { x:100,  y:80,  size:0.8,  delay:0,   rotate:10  },
  { x:280,  y:120, size:1.0,  delay:1.2, rotate:-5  },
  { x:450,  y:60,  size:0.9,  delay:0.7, rotate:15  },
  { x:620,  y:100, size:1.1,  delay:2.0, rotate:-8  },
  { x:790,  y:45,  size:0.85, delay:1.5, rotate:20  },
  { x:950,  y:130, size:1.2,  delay:0.9, rotate:-12 },
  { x:1100, y:70,  size:0.9,  delay:1.8, rotate:8   },
];

export const BRIDGES = [
  { x:200, span:300, delay:0.2 },
  { x:700, span:250, delay:1.3 },
];

export const FLOATING_ORBS = [
  { w:320, h:320, top:'5%',  left:'-5%', color:'rgba(255,150,80,0.1)',   dur:10 },
  { w:250, h:250, top:'50%', left:'73%', color:'rgba(255,180,100,0.08)', dur:13 },
  { w:200, h:200, top:'22%', left:'55%', color:'rgba(255,130,60,0.09)',  dur:8  },
  { w:160, h:160, top:'70%', left:'20%', color:'rgba(255,200,120,0.07)', dur:11 },
];

export const SPARKLE_POSITIONS = [150,280,420,560,700,840,980,1120,1240,200,660,920];
export const DISTANT_BUILDINGS = [50,150,250,350,450,550,650,750,850,950,1050,1150,1250];
export const GROUND_RIPPLES    = [315, 325, 335, 345];

// ── Blog data ─────────────────────────────────────────────────────────────────
export const POSTS_PER_PAGE = 9;

export const BLOG_POSTS: BlogPost[] = [
  { id:1,  title:'Pura Tersembunyi di Bali: Melampaui Jalur Wisatawan',              excerpt:'Temukan pura-pura kuno yang tersembunyi di dalam hutan lebat Bali, jauh dari keramaian dan komersialisasi.',                              content:'', author:{ name:'Andrew Morgan',    avatar:'https://randomuser.me/api/portraits/men/32.jpg',   role:'Penulis & Fotografer Perjalanan' }, category:'destinasi',  tags:['Bali','Pura','Budaya','Permata Tersembunyi'],          readTime:'8 menit',  publishDate:'2024-03-15', image:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', views:2543, likes:187, comments:42, isFeatured:true,  isTrending:true  },
  { id:2,  title:'Wisata Berkelanjutan di Raja Ampat: Cara Berkunjung yang Bertanggung Jawab', excerpt:'Panduan lengkap menjelajahi salah satu ekosistem laut paling beragam di dunia dengan meminimalkan dampak lingkungan.',             content:'', author:{ name:'Maya Sari',        avatar:'https://randomuser.me/api/portraits/women/44.jpg', role:'Konservasionis Laut'              }, category:'panduan',    tags:['Raja Ampat','Berkelanjutan','Kehidupan Laut','Eco-Tourism'], readTime:'12 menit', publishDate:'2024-03-12', image:'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=800&q=80', views:1876, likes:234, comments:38, isTrending:true  },
  { id:3,  title:'Komodo dari Dekat: Perjalanan Seorang Fotografer',                 excerpt:'Mengabadikan komodo legendaris di habitat aslinya — tips, cerita, dan foto-foto yang memukau.',                                         content:'', author:{ name:'Budi Santoso',     avatar:'https://randomuser.me/api/portraits/men/67.jpg',   role:'Fotografer Satwa Liar'           }, category:'fotografi',  tags:['Komodo','Satwa Liar','Fotografi','Indonesia'],         readTime:'10 menit', publishDate:'2024-03-10', image:'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80', views:3210, likes:312, comments:56, isFeatured:true  },
  { id:4,  title:'Itinerari Yogyakarta 5 Hari: Budaya & Petualangan Lengkap',        excerpt:'Dari Borobudur saat fajar hingga petualangan kuliner Jawa, itinerari ini mencakup semuanya.',                                            content:'', author:{ name:'Siti Nurhaliza',   avatar:'https://randomuser.me/api/portraits/women/68.jpg', role:'Pemandu Budaya'                  }, category:'panduan',    tags:['Yogyakarta','Itinerari','Budaya','Kuliner'],           readTime:'15 menit', publishDate:'2024-03-08', image:'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80', views:1895, likes:156, comments:29 },
  { id:5,  title:'Tokyo dengan Budget Terbatas: Nikmati Kemewahan Lebih Hemat',      excerpt:'Tips pro untuk menikmati pengalaman terbaik Tokyo tanpa menguras kantong.',                                                               content:'', author:{ name:'Kenji Tanaka',     avatar:'https://randomuser.me/api/portraits/men/29.jpg',   role:'Pakar Wisata Hemat'              }, category:'panduan',    tags:['Tokyo','Hemat','Mewah','Tips'],                        readTime:'7 menit',  publishDate:'2024-03-05', image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80', views:2789, likes:198, comments:41 },
  { id:6,  title:'Kafe Rahasia Seoul: Tempat Warga Lokal Nongkrong',                 excerpt:'Di balik tempat wisata mainstream — temukan budaya kafe tersembunyi Seoul yang disukai warga setempat.',                                 content:'', author:{ name:'Ji-eun Kim',       avatar:'https://randomuser.me/api/portraits/women/22.jpg', role:'Penulis Kuliner & Budaya'        }, category:'budaya',     tags:['Seoul','Kafe','Lokal','Kuliner'],                      readTime:'6 menit',  publishDate:'2024-03-03', image:'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80', views:2156, likes:178, comments:33 },
  { id:7,  title:'Mendaki Gunung Bromo: Fakta yang Jarang Diceritakan',              excerpt:'Tips penting dan wawasan jujur untuk menaklukkan gunung berapi paling ikonik di Indonesia.',                                             content:'', author:{ name:'Rizky Pratama',    avatar:'https://randomuser.me/api/portraits/men/45.jpg',   role:'Pemandu Petualangan'             }, category:'petualangan', tags:['Gunung Bromo','Pendakian','Petualangan','Gunung Berapi'], readTime:'11 menit', publishDate:'2024-02-28', image:'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80', views:3421, likes:267, comments:48, isTrending:true  },
  { id:8,  title:'Hawker Center Singapura: Surga Para Pecinta Kuliner',              excerpt:'Menjelajahi scene kuliner jalanan legendaris Singapura layaknya seorang profesional.',                                                    content:'', author:{ name:'Wei Chen',          avatar:'https://randomuser.me/api/portraits/men/51.jpg',   role:'Kritikus Kuliner'                }, category:'budaya',     tags:['Singapura','Kuliner','Hawker','Makanan Jalanan'],      readTime:'9 menit',  publishDate:'2024-02-25', image:'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80', views:1987, likes:145, comments:27 },
  { id:9,  title:'Hutan Bambu Kyoto: Menemukan Kedamaian di Tengah Keramaian',       excerpt:'Cara menikmati keajaiban Arashiyama tanpa terjebak lautan wisatawan.',                                                                    content:'', author:{ name:'Haruki Yamamoto',  avatar:'https://randomuser.me/api/portraits/men/38.jpg',   role:'Penulis Zen & Wellness'          }, category:'destinasi',  tags:['Kyoto','Bambu','Wellness','Jepang'],                   readTime:'8 menit',  publishDate:'2024-02-22', image:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', views:2310, likes:189, comments:35 },
  { id:10, title:'Skyline Hong Kong: Tips Fotografi untuk Bidikan Sempurna',         excerpt:'Kuasai seni mengabadikan skyline ikonik Hong Kong saat golden hour.',                                                                      content:'', author:{ name:'Ming Lee',          avatar:'https://randomuser.me/api/portraits/men/62.jpg',   role:'Fotografer Cityscape'            }, category:'fotografi',  tags:['Hong Kong','Fotografi','Skyline','Tips'],              readTime:'7 menit',  publishDate:'2024-02-20', image:'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80', views:2678, likes:203, comments:39 },
  { id:11, title:'Pasar Malam Bangkok: Lebih dari Sekadar Chatuchak',                excerpt:'Temukan pasar malam yang kurang dikenal namun menawarkan pengalaman Thailand yang autentik.',                                             content:'', author:{ name:'Chaya Wong',        avatar:'https://randomuser.me/api/portraits/women/31.jpg', role:'Penjelajah Pasar'                }, category:'budaya',     tags:['Bangkok','Pasar','Kehidupan Malam','Belanja'],         readTime:'6 menit',  publishDate:'2024-02-18', image:'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80', views:1895, likes:134, comments:24 },
  { id:12, title:'Menyelam di Bunaken: Surga Bawah Laut',                            excerpt:'Menjelajahi salah satu lokasi menyelam terbaik di dunia di Sulawesi Utara.',                                                               content:'', author:{ name:'Dewa Putra',        avatar:'https://randomuser.me/api/portraits/men/33.jpg',   role:'Dive Master'                     }, category:'petualangan', tags:['Bunaken','Menyelam','Kehidupan Laut','Petualangan'],   readTime:'13 menit', publishDate:'2024-02-15', image:'https://images.unsplash.com/photo-1514999037859-b486988734f1?auto=format&fit=crop&w=800&q=80', views:2987, likes:245, comments:43 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
export const formatDate = (ds: string): string =>
  new Date(ds).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export const categoryLabel = (cat: string): string => {
  const map: Record<string, string> = {
    destinasi: 'Destinasi', panduan: 'Panduan', fotografi: 'Fotografi',
    budaya: 'Budaya', petualangan: 'Petualangan',
  };
  return map[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
};

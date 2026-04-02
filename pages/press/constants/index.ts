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

// Category keys are now i18n keys consumed by components via t()
export type PressReleaseCategory = 'announcement' | 'partnership' | 'award' | 'expansion';
export type CoverageType         = 'article' | 'interview' | 'review' | 'feature';
export type MediaAssetType       = 'image' | 'video' | 'logo' | 'press-kit';

export interface PressRelease {
  id:          number;
  titleKey:    string;   // e.g. 'press.releases.items.1.title'
  summaryKey:  string;   // e.g. 'press.releases.items.1.summary'
  date:        string;
  category:    PressReleaseCategory;
  downloadUrl: string;
  isNew?:      boolean;
}

export interface MediaAsset {
  id:          number;
  type:        MediaAssetType;
  titleKey:    string;   // e.g. 'press.assets.items.1.title'
  descKey:     string;   // e.g. 'press.assets.items.1.description'
  thumbnail:   string;
  downloadUrl: string;
  format:      string;
  size:        string;
}

export interface PressCoverage {
  id:      number;
  outlet:  string;
  logo:    string;
  titleKey:   string;   // e.g. 'press.coverage.items.1.title'
  excerptKey: string;   // e.g. 'press.coverage.items.1.excerpt'
  url:     string;
  date:    string;
  type:    CoverageType;
}

export interface ContactInfo {
  icon:       React.ComponentType<{ className?: string }>;
  titleKey:   string;   // e.g. 'press.contact.contacts.press_inquiries'
  detailKey:  string;   // e.g. 'press.contact.contacts.press_inquiries' (or literal for email/phone)
  detail:     string;   // literal value (email address, phone number)
  link:       string;
}

// ── Press releases ────────────────────────────────────────────────────────────
export const PRESS_RELEASES: PressRelease[] = [
  { id: 1, titleKey: 'press.releases.items.1.title', summaryKey: 'press.releases.items.1.summary', date: '15 Mar 2024', category: 'announcement', downloadUrl: '#', isNew: true },
  { id: 2, titleKey: 'press.releases.items.2.title', summaryKey: 'press.releases.items.2.summary', date: '10 Mar 2024', category: 'partnership',  downloadUrl: '#' },
  { id: 3, titleKey: 'press.releases.items.3.title', summaryKey: 'press.releases.items.3.summary', date: '28 Feb 2024', category: 'award',         downloadUrl: '#' },
  { id: 4, titleKey: 'press.releases.items.4.title', summaryKey: 'press.releases.items.4.summary', date: '15 Feb 2024', category: 'expansion',     downloadUrl: '#' },
  { id: 5, titleKey: 'press.releases.items.5.title', summaryKey: 'press.releases.items.5.summary', date: '5 Feb 2024',  category: 'announcement',  downloadUrl: '#' },
  { id: 6, titleKey: 'press.releases.items.6.title', summaryKey: 'press.releases.items.6.summary', date: '22 Jan 2024', category: 'partnership',   downloadUrl: '#' },
];

// ── Media assets ──────────────────────────────────────────────────────────────
export const MEDIA_ASSETS: MediaAsset[] = [
  { id: 1, type: 'logo',      titleKey: 'press.assets.items.1.title', descKey: 'press.assets.items.1.description', thumbnail: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=400&q=80', downloadUrl: '#', format: 'ZIP (SVG, PNG, EPS)', size: '45 MB'   },
  { id: 2, type: 'image',     titleKey: 'press.assets.items.2.title', descKey: 'press.assets.items.2.description', thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80', downloadUrl: '#', format: 'ZIP (JPG, PNG)',      size: '2.3 GB'  },
  { id: 3, type: 'video',     titleKey: 'press.assets.items.3.title', descKey: 'press.assets.items.3.description', thumbnail: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=400&q=80', downloadUrl: '#', format: 'MP4 (4K, 1080p)',     size: '1.8 GB'  },
  { id: 4, type: 'press-kit', titleKey: 'press.assets.items.4.title', descKey: 'press.assets.items.4.description', thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80', downloadUrl: '#', format: 'PDF + ZIP',           size: '3.2 GB'  },
  { id: 5, type: 'image',     titleKey: 'press.assets.items.5.title', descKey: 'press.assets.items.5.description', thumbnail: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80', downloadUrl: '#', format: 'JPG',                 size: '850 MB'  },
  { id: 6, type: 'video',     titleKey: 'press.assets.items.6.title', descKey: 'press.assets.items.6.description', thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&q=80', downloadUrl: '#', format: 'MP4',                 size: '2.1 GB'  },
];

// ── Press coverage ────────────────────────────────────────────────────────────
export const PRESS_COVERAGE: PressCoverage[] = [
  { id: 1, outlet: 'TechCrunch',       logo: 'https://logo.clearbit.com/techcrunch.com',       titleKey: 'press.coverage.items.1.title', excerptKey: 'press.coverage.items.1.excerpt', url: '#', date: '18 Mar 2024',  type: 'feature'   },
  { id: 2, outlet: 'Forbes',           logo: 'https://logo.clearbit.com/forbes.com',            titleKey: 'press.coverage.items.2.title', excerptKey: 'press.coverage.items.2.excerpt', url: '#', date: '12 Mar 2024',  type: 'interview' },
  { id: 3, outlet: 'Travel + Leisure', logo: 'https://logo.clearbit.com/travelandleisure.com',  titleKey: 'press.coverage.items.3.title', excerptKey: 'press.coverage.items.3.excerpt', url: '#', date: '5 Mar 2024',   type: 'review'    },
  { id: 4, outlet: 'The Jakarta Post', logo: 'https://logo.clearbit.com/thejakartapost.com',    titleKey: 'press.coverage.items.4.title', excerptKey: 'press.coverage.items.4.excerpt', url: '#', date: '25 Feb 2024',  type: 'article'   },
  { id: 5, outlet: 'Bloomberg',        logo: 'https://logo.clearbit.com/bloomberg.com',         titleKey: 'press.coverage.items.5.title', excerptKey: 'press.coverage.items.5.excerpt', url: '#', date: '20 Feb 2024',  type: 'feature'   },
  { id: 6, outlet: 'CNN Travel',       logo: 'https://logo.clearbit.com/cnn.com',               titleKey: 'press.coverage.items.6.title', excerptKey: 'press.coverage.items.6.excerpt', url: '#', date: '15 Feb 2024',  type: 'article'   },
];

// ── Contact info ──────────────────────────────────────────────────────────────
// Icons are imported by the component itself; only keys + literal values here
export const CONTACT_INFO_DATA = [
  { titleKey: 'press.contact.contacts.press_inquiries', detail: 'press@trivgoo.com',             link: 'mailto:press@trivgoo.com', icon: 'mail'  },
  { titleKey: 'press.contact.contacts.media_relations', detail: '+62 21 1234 5678 ext. 2',       link: 'tel:+622112345678',        icon: 'phone' },
  { titleKey: 'press.contact.contacts.speaker_request', detailKey: 'press.contact.contacts.speaker_request_detail', detail: '', link: '#contact-form', icon: 'users' },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns the i18n key for a category color class — color logic stays in getCategoryColor
export const getCategoryColorClass = (category: PressReleaseCategory): string => {
  switch (category) {
    case 'announcement': return 'bg-blue-100 text-blue-700';
    case 'partnership':  return 'bg-green-100 text-green-700';
    case 'award':        return 'bg-amber-100 text-amber-700';
    case 'expansion':    return 'bg-purple-100 text-purple-700';
    default:             return 'bg-gray-100 text-gray-700';
  }
};

export const getCategoryColor = getCategoryColorClass;

// Returns the i18n key for the category label
export const getCategoryKey = (category: PressReleaseCategory): string =>
  `press.releases.categories.${category}`;

// Returns the i18n key for an asset type label
export const getAssetTypeKey = (type: MediaAssetType): string =>
  `press.assets.types.${type === 'press-kit' ? 'press_kit' : type}`;

// Returns the i18n key for a coverage type label
export const getCoverageTypeKey = (type: CoverageType): string =>
  `press.coverage.types.${type}`;

// Legacy helper — kept for backward compat; prefer getAssetTypeKey + t()
export const getAssetLabel = (type: MediaAssetType): string => {
  switch (type) {
    case 'press-kit': return 'Press Kit';
    case 'logo':      return 'Logo';
    case 'image':     return 'Image';
    case 'video':     return 'Video';
    default:          return type;
  }
};
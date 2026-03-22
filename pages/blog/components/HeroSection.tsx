import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  EASE, HERO_STYLES, SKYSCRAPERS, PAPER_PLANES, BRIDGES,
  FLOATING_ORBS, SPARKLE_POSITIONS, DISTANT_BUILDINGS, GROUND_RIPPLES,
} from '../constants';
import { PaperPlane, Skyscraper, Bridge } from './CityPrimitives';

interface Props {
  searchQuery:   string;
  onSearchChange:(q: string) => void;
}

export const HeroSection = ({ searchQuery, onSearchChange }: Props) => (
  <div className="relative text-white overflow-hidden" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #E05845 0%, #E06A45 30%, #E07B45 60%, #E08C45 100%)' }}>
    <style>{HERO_STYLES}</style>

    {/* Dot grid */}
    <div className="absolute inset-0 grid-drift" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,220,150,0.3) 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />

    {/* Glowing orbs */}
    {FLOATING_ORBS.map((o, i) => (
      <div key={i} className="absolute rounded-full pointer-events-none" style={{ width: o.w, height: o.h, top: o.top, left: o.left, background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`, animation: `cloudDrift ${o.dur}s ease-in-out infinite ${i * 1.5}s` }} />
    ))}

    {/* Cityscape SVG */}
    <div className="absolute bottom-0 left-0 right-0" style={{ height: '60%' }}>
      <svg viewBox="0 0 1280 420" preserveAspectRatio="xMidYMax meet" className="absolute bottom-0 left-0 w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,150,70,0.4)" />
            <stop offset="100%" stopColor="rgba(255,100,50,0)"   />
          </linearGradient>
        </defs>

        {/* Sun */}
        <circle cx="640" cy="100" r="38" fill="rgba(255,180,80,0.25)" style={{ animation: 'sunGlow 5s ease-in-out infinite' }} />
        <circle cx="640" cy="100" r="30" fill="rgba(255,160,70,0.3)" />
        <circle cx="640" cy="100" r="22" fill="rgba(255,140,60,0.4)" />
        <circle cx="640" cy="100" r="16" fill="rgba(255,120,50,0.5)" />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5) * Math.PI / 180;
          return <line key={i} x1={640 + Math.cos(a) * 45} y1={100 + Math.sin(a) * 45} x2={640 + Math.cos(a) * 70} y2={100 + Math.sin(a) * 70} stroke="rgba(255,180,80,0.2)" strokeWidth="2" strokeLinecap="round" style={{ animation: `windowTwinkle ${3 + i * 0.2}s ease-in-out infinite ${i * 0.1}s` }} />;
        })}

        {/* Atmosphere */}
        <rect x="0" y="180" width="1280" height="240" fill="rgba(255,140,70,0.12)" />

        {/* Distant buildings silhouette */}
        <g opacity="0.4">
          {DISTANT_BUILDINGS.map((x, i) => <rect key={i} x={x} y={160 - i % 3 * 10} width="20" height={70 + i * 8} fill="rgba(180,90,50,0.5)" />)}
        </g>

        {/* Bridges */}
        {BRIDGES.map((b, i) => <Bridge key={i} x={b.x} span={b.span} delay={b.delay} />)}

        {/* Ground */}
        <path d="M0 300 Q160 295 320 300 Q480 305 640 298 Q800 291 960 300 Q1120 309 1280 300 L1280 420 L0 420 Z" fill="rgba(140,70,40,0.5)" />
        <path d="M0 305 Q160 300 320 305 Q480 310 640 303 Q800 296 960 305 Q1120 314 1280 305" fill="none" stroke="rgba(255,200,120,0.2)" strokeWidth="2" />
        {GROUND_RIPPLES.map((y, i) => (
          <path key={i} d={`M${100 + i * 20} ${y} Q${300 + i * 15} ${y - 1} ${500 + i * 20} ${y} Q${700 + i * 10} ${y + 1} ${900 + i * 15} ${y} Q${1100 + i * 10} ${y - 1} ${1280} ${y}`} fill="none" stroke="rgba(255,160,80,0.1)" strokeWidth="1" />
        ))}

        {/* Skyscrapers */}
        {SKYSCRAPERS.map((b, i) => <Skyscraper key={i} x={b.x} height={b.height} windows={b.windows} delay={b.delay} />)}

        {/* Paper planes */}
        {PAPER_PLANES.map((p, i) => <PaperPlane key={i} x={p.x} y={p.y} size={p.size} delay={p.delay} rotate={p.rotate} />)}

        {/* Sparkles */}
        {SPARKLE_POSITIONS.map((x, i) => {
          const y = 190 + (i % 6) * 12;
          return (
            <g key={i} style={{ animation: `windowTwinkle ${2 + i * 0.3}s ease-in-out infinite ${i * 0.15}s` }}>
              <circle cx={x}     cy={y}     r="2"   fill="rgba(255,200,100,0.6)" />
              <circle cx={x + 3} cy={y - 1} r="1.5" fill="rgba(255,220,150,0.6)" />
            </g>
          );
        })}

        {/* Drones / helicopters */}
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

        {/* Horizon glow */}
        <rect x="0" y="170" width="1280" height="20" fill="url(#horizonGlow)" opacity="0.7" />
      </svg>
    </div>

    {/* Scan line + bottom fade */}
    <div className="scan-h absolute inset-x-0 pointer-events-none" style={{ height: '2px', top: 0, background: 'linear-gradient(90deg, transparent, rgba(255,200,150,0.4), transparent)' }} />
    <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, transparent, rgba(200,80,40,0.6))' }} />

    {/* Content */}
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20" style={{ minHeight: '50vh' }}>
      <div className="text-center max-w-4xl mx-auto">
        <motion.span initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }} className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20">
          Blog Wisata
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.4, ease: EASE }} className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
          Setiap Destinasi<br />
          <motion.span initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.75, ease: EASE }} className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-orange-300 inline-block">
            Punya Cerita
          </motion.span>
        </motion.h1>

        {/* Search bar */}
        <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.15 }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input type="text" placeholder="Cari artikel, destinasi kota, atau topik..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent" />
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);

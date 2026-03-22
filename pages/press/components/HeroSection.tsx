import { motion } from 'framer-motion';
import { EASE, HERO_STYLES, MEDIA_SNIPPETS, FLOATING_ORBS, CIRCUIT_H, CIRCUIT_V, CIRCUIT_DOTS } from '../constants';

export const HeroSection = () => (
  <div className="relative text-white overflow-hidden" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #5a1209 0%, #8c2518 30%, #b83428 60%, #E05845 100%)' }}>
    <style>{HERO_STYLES}</style>

    {/* Dot grid */}
    <div className="absolute inset-0 grid-drift" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,210,190,0.22) 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />

    {/* Circuit overlay */}
    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      {CIRCUIT_H.map((y, i) => <line key={`h${i}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="rgba(255,220,200,0.6)" strokeWidth="0.5" strokeDasharray="12 8" />)}
      {CIRCUIT_V.map((x, i) => <line key={`v${i}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="rgba(255,220,200,0.4)" strokeWidth="0.5" strokeDasharray="8 10" />)}
      {CIRCUIT_DOTS.map(([x, y], i) => <circle key={`c${i}`} cx={`${x}%`} cy={`${y}%`} r="3" fill="rgba(255,200,160,0.5)" style={{ animation: `glowDot ${3 + i * 0.4}s ease-in-out infinite ${i * 0.35}s` }} />)}
    </svg>

    {/* Glowing orbs */}
    {FLOATING_ORBS.map((o, i) => (
      <div key={i} className="absolute rounded-full pointer-events-none" style={{ width: o.w, height: o.h, top: o.top, left: o.left, background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`, animation: `orbPulse ${o.dur}s ease-in-out infinite ${i * 1.5}s` }} />
    ))}

    {/* Floating text */}
    {MEDIA_SNIPPETS.map((s, i) => (
      <div key={i} className="absolute pointer-events-none font-mono font-bold select-none" style={{ bottom: 0, left: s.left, fontSize: s.size, color: 'rgba(255,220,200,0.55)', animation: `floatMedia ${s.dur}s linear infinite ${s.delay}`, whiteSpace: 'nowrap' }}>
        {s.text}
      </div>
    ))}

    {/* Scan line + bottom fade */}
    <div className="scan-h absolute inset-x-0 pointer-events-none" style={{ height: '2px', top: 0, background: 'linear-gradient(90deg, transparent, rgba(255,200,170,0.35), transparent)' }} />
    <div className="absolute bottom-0 left-0 right-0 h-36" style={{ background: 'linear-gradient(to bottom, transparent, rgba(70,10,5,0.55))' }} />

    {/* Content */}
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
      <div className="text-center max-w-4xl mx-auto">
        <motion.span initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }} className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20">
          Pers & Media
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.4, ease: EASE }} className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
          Informasi Resmi untuk <br />
          <motion.span initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.75, ease: EASE }} className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-300 inline-block">
            Rekan Media
          </motion.span>
        </motion.h1>
      </div>
    </div>
  </div>
);

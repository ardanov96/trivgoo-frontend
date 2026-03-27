import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { DESTINATION_PINS, FLIGHT_ROUTES, HERO_STYLES, EASE } from '../constants';

// Plane SVG path (reused 3x at different sizes)
const PlanePath = () => (
  <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h-1A1.5 1.5 0 0 0 9 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5l9 2.5z" />
);

export const HeroSection = () => {
  const { t } = useTranslation();
  return (
  <div
    className="relative text-white overflow-hidden"
    style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #6b1a12 0%, #a83328 35%, #c34134 65%, #E05845 100%)' }}
  >
    <style>{HERO_STYLES}</style>

    {/* Animated grid bg */}
    <div className="absolute inset-0 grid-anim" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,220,200,0.2) 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

    {/* Globe SVG overlay */}
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Cellipse cx='600' cy='300' rx='580' ry='280' fill='none' stroke='%23ffd4c0' stroke-width='1'/%3E%3Cellipse cx='600' cy='300' rx='400' ry='280' fill='none' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cellipse cx='600' cy='300' rx='200' ry='280' fill='none' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cline x1='20' y1='300' x2='1180' y2='300' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cline x1='600' y1='20' x2='600' y2='580' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cellipse cx='600' cy='300' rx='580' ry='140' fill='none' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3Cellipse cx='600' cy='300' rx='580' ry='70' fill='none' stroke='%23ffd4c0' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

    {/* Glow orbs */}
    <div className="absolute inset-0 pointer-events-none">
      {[
        { top: '10%', left: '15%', size: 400, color: 'rgba(255,200,150,0.15)', delay: '0s', dur: '5s' },
        { bottom: '5%', right: '10%', size: 350, color: 'rgba(255,255,255,0.1)', delay: '2s', dur: '7s' },
        { top: '40%', right: '30%', size: 250, color: 'rgba(251,191,36,0.12)', delay: '1s', dur: '6s' },
      ].map((o, i) => (
        <div key={i} style={{ position: 'absolute', ...o, width: o.size, height: o.size, borderRadius: '50%', background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`, animation: `glowPulse ${o.dur} ease-in-out infinite ${o.delay}` }} />
      ))}
    </div>

    {/* Flight route lines */}
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      {FLIGHT_ROUTES.map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="rgba(255,220,200,0.4)" strokeWidth="0.3" strokeDasharray="1.5 1" style={{ animation: `glowPulse ${4 + i}s ease-in-out infinite ${i * 0.8}s` }} />
      ))}
      <path d="M 22 30 Q 50 5 78 28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" strokeDasharray="2 1.2" />
      <path d="M 46 22 Q 65 55 84 72" fill="none" stroke="rgba(255,200,150,0.25)" strokeWidth="0.3" strokeDasharray="1.2 1" />
    </svg>

    {/* Destination pins */}
    {DESTINATION_PINS.map((pin, i) => (
      <div key={i} className="absolute" style={{ top: pin.top, left: pin.left, transform: 'translate(-50%,-50%)' }}>
        <div className="ripple-ring absolute rounded-full border border-orange-200" style={{ width: 28, height: 28, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animationDelay: pin.delay }} />
        <div className="pin-pulse relative z-10 rounded-full bg-amber-300" style={{ width: 10, height: 10, boxShadow: '0 0 10px rgba(251,191,36,0.9)', animationDelay: pin.delay }} />
        <span className="absolute left-4 -top-1 font-bold text-orange-100 whitespace-nowrap" style={{ fontSize: 10, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{pin.label}</span>
      </div>
    ))}

    {/* Floating planes */}
    {[
      { cls: 'plane-1', left: '25%', size: 48, fill: 'rgba(255,255,255,0.9)' },
      { cls: 'plane-2', left: '60%', size: 32, fill: 'rgba(251,191,36,0.85)' },
      { cls: 'plane-3', left: '42%', size: 22, fill: 'rgba(255,200,150,0.7)' },
    ].map(({ cls, left, size, fill }) => (
      <div key={cls} className={`${cls} absolute pointer-events-none`} style={{ bottom: 0, left }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <PlanePath />{/* fill applied inline */}
          <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h-1A1.5 1.5 0 0 0 9 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5l9 2.5z" fill={fill} />
        </svg>
      </div>
    ))}

    {/* Scan line + bottom fade */}
    <div className="scan-line absolute inset-x-0 pointer-events-none" style={{ height: '3px', top: 0, background: 'linear-gradient(90deg, transparent, rgba(255,200,180,0.4), transparent)' }} />
    <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, transparent, rgba(80,15,5,0.5))' }} />

    {/* Headline */}
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
      <div className="text-center max-w-4xl mx-auto">
        <motion.span initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20">
          {t('about.badge', 'About Us')}
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: EASE }} className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
          {t('about.hero_title1', 'One Platform For')}<br />
          <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.75, ease: EASE }} className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-300 inline-block">
            {t('about.hero_title2', 'All Your Travel Needs')}
          </motion.span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1 }} className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
          PT Trivgoo Global Nusantara
        </motion.p>
      </div>
    </div>
  </div>
  );
}

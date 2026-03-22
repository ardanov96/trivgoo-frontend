import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Wrench } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Animated gear ─────────────────────────────────────────────────────────────
const Gear = ({ size, duration, reverse = false, className = '' }: { size: number; duration: number; reverse?: boolean; className?: string }) => (
  <motion.svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    className={`text-primary-300 ${className}`}
    animate={{ rotate: reverse ? -360 : 360 }}
    transition={{ duration, repeat: Infinity, ease: 'linear' }}
  >
    <path
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      stroke="currentColor" strokeWidth="1.5"
    />
    <path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </motion.svg>
);

// ── Countdown timer (optional — set to null to hide) ─────────────────────────
// Change this to a future timestamp to show a real countdown, e.g.:
// const BACK_AT = new Date('2026-01-01T08:00:00+07:00').getTime();
const BACK_AT: number | null = null;

function useCountdown(target: number | null) {
  const calc = () => {
    if (!target) return null;
    const diff = target - Date.now();
    if (diff <= 0) return { h: '00', m: '00', s: '00' };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return {
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0'),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setTime(calc), 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const Maintenance503: React.FC = () => {
  const countdown = useCountdown(BACK_AT);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-gray-900 to-gray-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Deep glow orbs */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #E05845 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />

      {/* Floating gears — decorative */}
      <div className="absolute top-16 left-12 opacity-20"><Gear size={64} duration={12} /></div>
      <div className="absolute top-24 left-28 opacity-15"><Gear size={36} duration={8} reverse /></div>
      <div className="absolute bottom-20 right-14 opacity-20"><Gear size={72} duration={15} reverse /></div>
      <div className="absolute bottom-28 right-32 opacity-15"><Gear size={40} duration={10} /></div>
      <div className="absolute top-1/2 left-8 opacity-10"><Gear size={48} duration={20} /></div>
      <div className="absolute top-1/3 right-10 opacity-10"><Gear size={56} duration={18} reverse /></div>

      <motion.div
        className="relative z-10 text-center max-w-lg w-full"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="mb-10"
        >
          <img src="/offest_inline_trp.png" alt="Trivgoo" className="h-10 w-auto mx-auto opacity-90" />
        </motion.div>

        {/* Icon */}
        <motion.div
          className="relative w-28 h-28 mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-800/60 to-gray-800/60 border-2 border-primary-700/40 shadow-2xl" />
          {/* Outer pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-500/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Wrench className="w-12 h-12 text-primary-400" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* 503 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="mb-4"
        >
          <span
            className="text-9xl leading-none font-black select-none"
            style={{
              background: 'linear-gradient(135deg, #E05845 0%, #f97316 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 8px 32px rgba(224,88,69,0.3))',
            }}
          >
            503
          </span>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary-800/60 text-primary-300 text-xs font-bold px-3 py-1 rounded-full mb-5 border border-primary-700/40">
            <Wrench className="w-3 h-3" /> Sedang Maintenance
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
            Kami Sedang Berbenah
          </h1>
          <p className="text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">
            Trivgoo sedang dalam pemeliharaan terjadwal untuk memberikan pengalaman
            yang lebih baik. <br/> Kami akan segera kembali!
          </p>
        </motion.div>

        {/* Countdown (only shown if BACK_AT is set) */}
        {countdown && (
          <motion.div
            className="flex justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {[{ label: 'Jam', value: countdown.h }, { label: 'Menit', value: countdown.m }, { label: 'Detik', value: countdown.s }].map(({ label, value }) => (
              <div key={label} className="bg-gray-800/80 border border-gray-700/60 rounded-2xl px-5 py-3 min-w-[72px] text-center">
                <div className="text-2xl font-mono font-bold text-white">{value}</div>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Progress bar (decorative) */}
        <motion.div
          className="max-w-xs mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Progress pemeliharaan</span>
            <span className="text-primary-400 font-semibold">Hampir selesai...</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-amber-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: ['30%', '55%', '70%', '82%'] }}
              transition={{ duration: 4, ease: 'easeOut', times: [0, 0.3, 0.7, 1] }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Maintenance503;

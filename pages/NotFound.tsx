import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, MapPin, Search } from 'lucide-react';

// ── Typed easing ──────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Animated compass needle ───────────────────────────────────────────────────
const SpinningCompass = () => (
  <motion.div
    className="relative w-32 h-32 mx-auto mb-8"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
  >
    {/* Outer ring */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100 to-orange-50 border-4 border-primary-200 shadow-xl shadow-primary-100/60" />
    {/* Cardinal points */}
    {['N', 'E', 'S', 'W'].map((dir, i) => {
      const positions = [
        { top: '4px', left: '50%', transform: 'translateX(-50%)' },
        { top: '50%', right: '4px', transform: 'translateY(-50%)' },
        { bottom: '4px', left: '50%', transform: 'translateX(-50%)' },
        { top: '50%', left: '4px', transform: 'translateY(-50%)' },
      ];
      return (
        <span
          key={dir}
          className={`absolute text-[10px] font-black ${dir === 'N' ? 'text-primary-600' : 'text-gray-400'}`}
          style={positions[i] as React.CSSProperties}
        >
          {dir}
        </span>
      );
    })}
    {/* Spinning needle */}
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ rotate: [0, 15, -10, 25, -5, 360] }}
      transition={{ duration: 4, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
    >
      {/* North (red) */}
      <div className="absolute w-2 h-11 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom">
        <div className="w-full h-full bg-gradient-to-t from-primary-500 to-primary-600 rounded-t-full rounded-b-sm shadow-sm" />
      </div>
      {/* South (gray) */}
      <div className="absolute w-2 h-8 top-1/2 left-1/2 -translate-x-1/2 origin-top">
        <div className="w-full h-full bg-gradient-to-b from-gray-400 to-gray-300 rounded-b-full rounded-t-sm" />
      </div>
      {/* Center dot */}
      <div className="absolute w-3 h-3 bg-white rounded-full border-2 border-primary-400 shadow z-10" />
    </motion.div>
  </motion.div>
);

// ── Main component ────────────────────────────────────────────────────────────
const NotFound: React.FC = () => {
  const navigate  = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/60 to-primary-50 flex flex-col items-center justify-center px-4 pt-20 relative overflow-hidden">

      {/* ── Background decorations ── */}
      {/* Soft glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #E05845 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}
      />

      {/* ── Main card ── */}
      <motion.div
        className="relative z-10 text-center max-w-lg w-full"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* Compass */}
        <SpinningCompass />

        {/* 404 number */}
        <motion.div
          className="relative mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        >
          <span
            className="text-[10rem] leading-none font-black select-none pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #E05845 0%, #f97316 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 8px 24px rgba(224,88,69,0.2))',
            }}
          >
            404
          </span>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
        >
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3">
            Destinasi Tidak Ditemukan
          </h1>
          <p className="text-gray-500 leading-relaxed mb-8 max-w-sm mx-auto">
            Sepertinya halaman yang kamu cari sudah pindah, dihapus, atau belum pernah ada.
            Yuk, lanjutkan perjalananmu dari sini!
          </p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
        >

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-gray-900/20"
            >
              <Compass className="w-4 h-4" />
              Beranda
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30"
            >
              <Search className="w-4 h-4" />
              Jelajahi Wisata
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

    </div>
  );
};

export default NotFound;

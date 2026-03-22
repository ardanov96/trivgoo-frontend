import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Lock, ShieldOff } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const Forbidden403: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50/40 to-amber-50 flex flex-col items-center justify-center px-4 pt-20 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #E05845 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

      <motion.div
        className="relative z-10 text-center max-w-md w-full"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* Icon */}
        <motion.div
          className="relative w-28 h-28 mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-100 to-orange-100 border-4 border-red-200 shadow-xl shadow-red-100/60" />
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-red-300/50"
            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldOff className="w-12 h-12 text-red-500" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* 403 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="mb-4"
        >
          <span
            className="text-9xl leading-none font-black select-none"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 60%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 8px 24px rgba(239,68,68,0.2))',
            }}
          >
            403
          </span>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
        >
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
            <Lock className="w-3 h-3" /> Akses Ditolak
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3">
            Kamu Tidak Punya Izin
          </h1>
          <p className="text-gray-500 leading-relaxed mb-8 max-w-sm mx-auto">
            Halaman ini hanya dapat diakses oleh pengguna dengan hak akses tertentu.
            Pastikan kamu sudah login dengan akun yang tepat.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
        >
          <motion.button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm"
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </motion.button>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-gray-900/20">
              <Home className="w-4 h-4" /> Beranda
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Forbidden403;

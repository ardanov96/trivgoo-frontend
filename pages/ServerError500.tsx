import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Props {
  /** Passed by ErrorBoundary to reset React error state instead of hard-reload */
  onReset?: () => void;
}

const ServerError500: React.FC<Props> = ({ onReset }) => {
  const navigate  = useNavigate();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      if (onReset) {
        // Called from ErrorBoundary — reset component tree without full reload
        onReset();
        setRetrying(false);
      } else {
        window.location.reload();
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30 flex flex-col items-center justify-center px-4 pt-20 relative overflow-hidden">

      {/* Background */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-slate-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-orange-200/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #64748b 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

      <motion.div
        className="relative z-10 text-center max-w-md w-full"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* Animated warning icon */}
        <motion.div
          className="relative w-28 h-28 mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-amber-200 shadow-xl shadow-amber-100/60" />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
          >
            <AlertTriangle className="w-12 h-12 text-amber-500" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* 500 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="mb-4"
        >
          <span
            className="text-9xl leading-none font-black select-none"
            style={{
              background: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 8px 24px rgba(71,85,105,0.2))',
            }}
          >
            500
          </span>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
        >
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3">
            Ups, Ada Masalah di Server
          </h1>
          <p className="text-gray-500 leading-relaxed mb-8 max-w-sm mx-auto">
            Sepertinya server kami sedang tidak berjalan dengan baik. Coba lagi dalam beberapa saat.
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
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 disabled:opacity-60"
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
          >
            <motion.span
              animate={retrying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.8, repeat: retrying ? Infinity : 0, ease: 'linear' }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.span>
            {retrying ? 'Mencoba ulang...' : 'Coba Lagi'}
          </motion.button>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30">
              <Home className="w-4 h-4" /> Beranda
            </Link>
          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default ServerError500;

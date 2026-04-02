import React, { useState } from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Props {
  onReset?: () => void;
}

const ServerError500: React.FC<Props> = ({ onReset }) => {
  const navigate = useNavigate();
  const { langNavigate, langPath } = useLangNavigate();
  const { t } = useTranslation();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      if (onReset) { onReset(); setRetrying(false); }
      else window.location.reload();
    }, 800);
  };

  return (
    <>
      <SEO title="500 Server Error | Trivgoo" noindex={true} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30 flex flex-col items-center justify-center px-4 pt-20 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-slate-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-orange-200/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #64748b 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

      <motion.div className="relative z-10 text-center max-w-md w-full" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
        <motion.div className="relative w-28 h-28 mx-auto mb-8" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-amber-200 shadow-xl shadow-amber-100/60" />
          <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ rotate: [0, -8, 8, -5, 5, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}>
            <AlertTriangle className="w-12 h-12 text-amber-500" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.3 }} className="mb-4">
          <span className="text-9xl leading-none font-black select-none"
            style={{ background: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 8px 24px rgba(71,85,105,0.2))' }}>
            500
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3">
            {t('errors.500_title', 'Server Error')}
          </h1>
          <p className="text-gray-500 leading-relaxed mb-8 max-w-sm mx-auto">
            {t('errors.500_desc', "Something went wrong on our end. Please try again in a moment.")}
          </p>
        </motion.div>

        <motion.div className="flex flex-col sm:flex-row gap-3 justify-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}>
          <motion.button onClick={handleRetry} disabled={retrying}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 disabled:opacity-60"
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <motion.span animate={retrying ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.8, repeat: retrying ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw className="w-4 h-4" />
            </motion.span>
            {retrying ? t('common.loading', 'Loading...') : t('errors.try_again', 'Try Again')}
          </motion.button>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to={langPath('/')} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30">
              <Home className="w-4 h-4" /> {t('errors.go_home', 'Go to Homepage')}
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
};

export default ServerError500;

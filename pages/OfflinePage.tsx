import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Animated signal bars ──────────────────────────────────────────────────────
const SignalBars = ({ active }: { active: boolean }) => (
  <div className="flex items-end gap-1">
    {[40, 60, 80, 100].map((h, i) => (
      <motion.div
        key={i}
        className={`w-2.5 rounded-sm ${active ? 'bg-green-400' : 'bg-gray-600'}`}
        style={{ height: `${h * 0.36}px` }}
        animate={active
          ? { opacity: [0.4, 1, 0.4], scaleY: [0.8, 1, 0.8] }
          : { opacity: i < 2 ? 0.3 : 0.1 }
        }
        transition={active
          ? { duration: 1.5, repeat: Infinity, delay: i * 0.15 }
          : {}
        }
      />
    ))}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const OfflinePage: React.FC = () => {
  const { t } = useTranslation();
  const [isOnline,  setIsOnline]  = useState(navigator.onLine);
  const [retrying,  setRetrying]  = useState(false);
  const [justBack,  setJustBack]  = useState(false);

  useEffect(() => {
    const onOnline  = () => { setIsOnline(true);  setJustBack(true); };
    const onOffline = () => { setIsOnline(false); setJustBack(false); };
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Auto-redirect when connection is restored
  useEffect(() => {
    if (isOnline && justBack) {
      const t = setTimeout(() => window.location.reload(), 1500);
      return () => clearTimeout(t);
    }
  }, [isOnline, justBack]);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) window.location.reload();
      else setRetrying(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-slate-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />

      {/* Floating signal rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-gray-700/40 pointer-events-none"
          style={{ width: i * 160, height: i * 160 }}
          animate={{ opacity: [0.3, 0.05, 0.3], scale: [1, 1.04, 1] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.6 }}
        />
      ))}

      <motion.div
        className="relative z-10 text-center max-w-md w-full"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* Icon with signal bars */}
        <motion.div
          className="relative w-28 h-28 mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
        >
          <div className="absolute inset-0 rounded-full bg-gray-800/80 border-2 border-gray-700/60 shadow-2xl" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-gray-600/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isOnline ? (
                <motion.div key="online" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Wifi className="w-12 h-12 text-green-400" strokeWidth={1.5} />
                </motion.div>
              ) : (
                <motion.div key="offline" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <WifiOff className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Signal bars indicator */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <SignalBars active={isOnline} />
        </motion.div>

        {/* Text */}
        <AnimatePresence mode="wait">
          {isOnline ? (
            <motion.div
              key="back-online"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 bg-green-900/40 text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-green-800/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Koneksi Pulih!
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                Kamu Kembali Online
              </h1>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">
                Koneksimu sudah pulih. Halaman akan dimuat ulang secara otomatis...
              </p>
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  Memuat ulang halaman...
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="offline-state"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                Kamu Sedang Offline
              </h1>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">
                Sepertinya koneksi internetmu terputus. Periksa Wi-Fi atau data selulermu,
                lalu coba lagi.
              </p>

              {/* Tips */}
              <div className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5 mb-8 text-left max-w-sm mx-auto">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">TIPS</p>
                <ul className="space-y-2.5">
                  {[
                    t('errors.offline_desc', 'Check your connection') + ' Wi-Fi atau data seluler',
                    'Restart router atau modem',
                    'Aktifkan mode pesawat, lalu matikan kembali',
                    'Coba pindah ke jaringan lain',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <span className="w-5 h-5 rounded-full bg-gray-700 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Retry */}
              <motion.button
                onClick={handleRetry}
                disabled={retrying}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/40 disabled:opacity-60"
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              >
                <motion.span animate={retrying ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.8, repeat: retrying ? Infinity : 0, ease: 'linear' }}>
                  <RefreshCw className="w-4 h-4" />
                </motion.span>
                {retrying ? 'Memeriksa koneksi...' : t('errors.try_again', 'Try Again')}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OfflinePage;

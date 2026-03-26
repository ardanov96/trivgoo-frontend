import { ChevronLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ── Destination hero banner ───────────────────────────────────────────────────

interface DestinationHeroProps {
  image:    string;
  query:    string;
  subtitle: string;
}

export const DestinationHero = ({ image, query, subtitle }: DestinationHeroProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
      className="relative w-full h-[220px] md:h-[300px] overflow-hidden">
      <motion.img src={image} alt={query} className="w-full h-full object-cover"
        initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/55 via-gray-900/35 to-gray-900/75" />

      <motion.button onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
        className="absolute top-20 left-6 md:left-10 flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
      </motion.button>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-4">
        <motion.p initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="text-white/70 text-[11px] md:text-sm font-semibold uppercase tracking-[0.2em] mb-2">
          All Time Favourite Activities In
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg mb-3 leading-tight">
          {query}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-white/75 text-sm md:text-base max-w-lg leading-relaxed">
          {subtitle}
        </motion.p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent" />
    </motion.div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  isCarCategory: boolean;
  onClear:       () => void;
}

export const EmptyState = ({ isCarCategory, onClear }: EmptyStateProps) => (
  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
    className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
    <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
      <Search className="w-10 h-10 text-gray-300" />
    </div>
    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">No results found</h3>
    <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
      We couldn't find any {isCarCategory ? 'rental cars' : 'items'} matching your search.
    </p>
    <button onClick={onClear} className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
      Clear All Filters
    </button>
  </motion.div>
);

// pages/explore/components/LocationPromptModal.tsx

import { MapPin, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onConfirm: (location: string) => void;
  onClose:   () => void;
}

const QUICK_LOCATIONS = [
  'Kuta, Bali', 'Seminyak, Bali', 'Ubud, Bali',
  'Denpasar, Bali', 'Nusa Dua, Bali', 'Canggu, Bali',
];

export const LocationPromptModal = ({ onConfirm, onClose }: Props) => {
  const [input, setInput] = useState('');
  const { t } = useTranslation();

  const handleConfirm = () => {
    const val = input.trim();
    if (!val) return;
    onConfirm(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                {t('location_prompt.title')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('location_prompt.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Input */}
        <div className="p-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              autoFocus
              type="text"
              placeholder={t('location_prompt.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium"
            />
          </div>

          {/* Quick picks */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              {t('location_prompt.popular_locations')}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setInput(loc)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${input === loc
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!input.trim()}
            className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-all active:scale-[0.98] shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            {t('location_prompt.confirm_button')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

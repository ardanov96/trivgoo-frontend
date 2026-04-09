import { useState } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StayFilters {
  minPrice:        string;
  maxPrice:        string;
  starRatings:     number[];   // e.g. [4, 5]
  promotions:      string[];   // e.g. ['Free Cancellation', 'Breakfast']
  hotelTypes:      string[];   // e.g. ['Hotel', 'Villa', 'Resort']
  areas:           string[];   // e.g. ['Kuta', 'Seminyak', 'Nusa Dua']
  facilities:      string[];   // e.g. ['Wi-Fi', 'Swimming Pool', 'Gym']
}

export const INITIAL_STAY_FILTERS: StayFilters = {
  minPrice:    '',
  maxPrice:    '',
  starRatings: [],
  promotions:  [],
  hotelTypes:  [],
  areas:       [],
  facilities:  [],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const STAR_OPTIONS  = [5, 4, 3, 2, 1];
const PROMO_OPTIONS = ['Free Cancellation', 'Breakfast', 'Last Minute', 'Package Rate', 'Deal of the Day'];
const TYPE_OPTIONS  = ['Hotel', 'Villa', 'Resort', 'Guest House', 'Bed & Breakfast', 'Hostel'];
const FACILITY_OPTIONS = ['Wi-Fi', 'Swimming Pool', 'Gym', 'Spa', 'Restaurant', 'Parking', 'Airport Shuttle', 'Wheelchair', 'Safety Box', 'Extrabed Allowed'];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// ── Collapsible Section ───────────────────────────────────────────────────────

interface SectionProps {
  title:    string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section = ({ title, children, defaultOpen = true }: SectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <span className="text-sm font-bold text-gray-800 group-hover:text-primary-600 transition-colors">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Toggle helpers ────────────────────────────────────────────────────────────

function toggleArr<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

// ── Main StayFilterPanel ──────────────────────────────────────────────────────

interface Props {
  filters:      StayFilters;
  onChange:     (filters: StayFilters) => void;
  onClear:      () => void;
  areaOptions?: string[]; 
  isMobile?:    boolean;
  onClose?:     () => void;
}

export const StayFilterPanel = ({ filters, onChange, onClear, areaOptions = [], isMobile, onClose }: Props) => {
  const { t } = useTranslation();

  const activeCount = [
    filters.minPrice || filters.maxPrice ? 1 : 0,
    filters.starRatings.length,
    filters.promotions.length,
    filters.hotelTypes.length,
    filters.areas.length,
    filters.facilities.length,
  ].reduce((a, b) => a + b, 0);

  const set = (partial: Partial<StayFilters>) => onChange({ ...filters, ...partial });

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${isMobile ? 'p-4' : 'p-5'} h-fit sticky top-24`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
            {t('explore.filters', 'Filters')}
          </span>
          {activeCount > 0 && (
            <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {t('explore.clear_all', 'Clear All')}
            </button>
          )}
          {isMobile && onClose && (
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Price Per Night */}
      <Section title={t('explore.price_per_night', 'Price Per Night (IDR)')}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Rp</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              min="0"
              onChange={e => set({ minPrice: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Rp</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              min="0"
              onChange={e => set({ maxPrice: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </Section>

      {/* Star Rating */}
      <Section title={t('explore.star_rating', 'Star Rating')}>
        <div className="flex flex-col gap-2">
          {STAR_OPTIONS.map(star => {
            const checked = filters.starRatings.includes(star);
            return (
              <label key={star} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => set({ starRatings: toggleArr(filters.starRatings, star) })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < star} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                  {star} {t('common.stars', 'Stars')}
                </span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Promotions */}
      <Section title={t('explore.promotions', 'Promotions')}>
        <div className="flex flex-col gap-2">
          {PROMO_OPTIONS.map(promo => {
            const checked = filters.promotions.includes(promo);
            return (
              <label key={promo} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => set({ promotions: toggleArr(filters.promotions, promo) })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {promo}
                </span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Hotel Type */}
      <Section title={t('explore.hotel_type', 'Hotel Type')}>
        <div className="flex flex-col gap-2">
          {TYPE_OPTIONS.map(type => {
            const checked = filters.hotelTypes.includes(type);
            return (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => set({ hotelTypes: toggleArr(filters.hotelTypes, type) })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {type}
                </span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Areas */}
      <Section title={t('explore.areas', 'Areas')}>
        <div className="flex flex-col gap-2">
          {areaOptions.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              {t('explore.no_areas', 'Ketik destinasi di kolom pencarian untuk melihat area.')}
            </p>
          ) : areaOptions.map(area => {
            const checked = filters.areas.includes(area);
            return (
              <label key={area} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => set({ areas: toggleArr(filters.areas, area) })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {area}
                </span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Facilities */}
      <Section title={t('explore.facilities', 'Facilities')}>
        <div className="flex flex-col gap-2">
          {FACILITY_OPTIONS.map(fac => {
            const checked = filters.facilities.includes(fac);
            return (
              <label key={fac} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => set({ facilities: toggleArr(filters.facilities, fac) })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {fac}
                </span>
              </label>
            );
          })}
        </div>
      </Section>
    </div>
  );
};

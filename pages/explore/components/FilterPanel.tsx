import {
  ArrowLeftRight, ArrowUpDown, Calendar, Clock, Gauge, PlaneLanding,
  PlaneTakeoff, Search, Users, UserCog, X,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  CATEGORY_TABS, SORT_OPTIONS, TOUR_TAGS, STAY_TAGS,
  filterContainerVariants, filterItemVariants, slideLeftVariants,
} from '../constants';
import type { RentalFilters, TransferFilters } from '../hooks/useExploreFilters';

// ── Helpers ───────────────────────────────────────────────────────────────────

const toDateStr = (date: Date | null): string =>
  date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';

const formatDisplayDate = (dateStr: string, locale = 'id-ID'): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Mini inline date picker ───────────────────────────────────────────────────

interface InlineDatePickerProps {
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
}

const InlineDatePicker = ({ value, onChange, placeholder }: InlineDatePickerProps) => {
  const [open, setOpen]     = useState(false);
  const [view, setView]     = useState(new Date());
  const ref                 = useRef<HTMLDivElement>(null);
  const today               = new Date(); today.setHours(0, 0, 0, 0);
  const daysInMonth         = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const firstDay            = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const monthLabel          = view.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isDisabled = (d: number) => {
    const date = new Date(view.getFullYear(), view.getMonth(), d);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (d: number) =>
    !!value && toDateStr(new Date(view.getFullYear(), view.getMonth(), d)) === value;

  const isToday = (d: number) =>
    toDateStr(new Date(view.getFullYear(), view.getMonth(), d)) === toDateStr(new Date());

  const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`text-sm font-semibold text-left w-full ${value ? 'text-gray-800' : 'text-gray-400'}`}>
        {value ? formatDisplayDate(value) : placeholder}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64 z-[80]">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-500 text-xs">‹</button>
            <span className="text-xs font-bold text-gray-700 capitalize">{monthLabel}</span>
            <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-500 text-xs">›</button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {days.map(d => <span key={d} className="text-center text-[9px] font-bold text-gray-400">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const d = i + 1;
              const dis = isDisabled(d);
              const sel = isSelected(d);
              const tod = isToday(d);
              return (
                <button key={d} type="button" disabled={dis}
                  onClick={() => { onChange(toDateStr(new Date(view.getFullYear(), view.getMonth(), d))); setOpen(false); }}
                  className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-[11px] font-semibold transition-all
                    ${sel ? 'bg-primary-600 text-white'
                      : dis ? 'text-gray-300 cursor-not-allowed'
                      : tod ? 'border border-primary-400 text-primary-600 hover:bg-primary-50'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Airport Transfer Search Bar ───────────────────────────────────────────────

interface AirportTransferSearchBarProps {
  filters:  TransferFilters;
  onChange: (field: keyof TransferFilters, value: string) => void;
}

const AirportTransferSearchBar = ({ filters, onChange }: AirportTransferSearchBarProps) => {
  const { t }     = useTranslation();
  const [swapped, setSwapped] = useState(false);

  const handleSwap = () => {
    const tmpFrom = filters.from;
    onChange('from', filters.to);
    onChange('to',   tmpFrom);
    setSwapped(s => !s);
  };

  const hours   = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 30];
  const [timeOpen, setTimeOpen] = useState(false);
  const timeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (timeRef.current && !timeRef.current.contains(e.target as Node)) setTimeOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const parts  = (filters.pickupTime || '09:00').split(':');
  const hour   = parseInt(parts[0]) || 0;
  const minute = parseInt(parts[1]) || 0;
  const setHour   = (h: number) => onChange('pickupTime', `${String(h).padStart(2,'0')}:${String(minute).padStart(2,'0')}`);
  const setMinute = (m: number) => onChange('pickupTime', `${String(hour).padStart(2,'0')}:${String(m).padStart(2,'0')}`);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
      <div className="px-5 py-2.5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-primary-50 rounded-t-2xl flex items-center gap-2">
        <PlaneTakeoff className="w-4 h-4 text-primary-600" />
        <span className="text-xs font-extrabold text-primary-700 uppercase tracking-wider">
          {t('hero.search_transfer', 'Cari Airport Transfer')}
        </span>
      </div>

      <div className="flex flex-col md:flex-row divide-y divide-gray-100 md:divide-y-0 md:divide-x">
        {/* From */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3.5 relative">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <PlaneTakeoff className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              {t('hero.from_airport', 'Dari Bandara')}
            </p>
            <input type="text" placeholder={t('hero.airport_placeholder', 'Nama bandara...')}
              value={filters.from} onChange={e => onChange('from', e.target.value)}
              className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none placeholder-gray-400" />
          </div>
          <button type="button" onClick={handleSwap}
            className="absolute right-0 translate-x-1/2 z-10 w-7 h-7 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95">
            <ArrowLeftRight className={`w-3 h-3 transition-transform duration-300 ${swapped ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* To */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3.5">
          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <PlaneLanding className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              {t('hero.to_destination', 'Ke Tujuan')}
            </p>
            <input type="text" placeholder={t('hero.destination_placeholder', 'Area, hotel, gedung...')}
              value={filters.to} onChange={e => onChange('to', e.target.value)}
              className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none placeholder-gray-400" />
          </div>
        </div>

        {/* Pickup Date */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3.5">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              {t('hero.pickup_date', 'Tanggal Jemput')}
            </p>
            <InlineDatePicker value={filters.pickupDate}
              onChange={v => onChange('pickupDate', v)}
              placeholder={t('hero.pick_date', 'Pilih tanggal')} />
          </div>
        </div>

        {/* Pickup Time */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3.5" ref={timeRef}>
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0 relative">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              {t('hero.pickup_time_label', 'Waktu')}
            </p>
            <button type="button" onClick={() => setTimeOpen(o => !o)}
              className="text-sm font-semibold text-gray-800 hover:text-primary-600 transition-colors">
              {filters.pickupTime || '09:00'}
            </button>
            {timeOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[80] overflow-hidden w-40">
                <div className="flex">
                  <div className="flex-1 border-r border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 text-center py-1.5 border-b border-gray-100">Jam</p>
                    <div className="h-36 overflow-y-auto">
                      {hours.map(h => (
                        <button key={h} type="button" onClick={() => setHour(h)}
                          className={`w-full py-1.5 text-xs font-semibold text-center transition-colors
                            ${h === hour ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                          {String(h).padStart(2,'00')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 text-center py-1.5 border-b border-gray-100">Menit</p>
                    <div className="h-36 overflow-y-auto">
                      {minutes.map(m => (
                        <button key={m} type="button" onClick={() => setMinute(m)}
                          className={`w-full py-1.5 text-xs font-semibold text-center transition-colors
                            ${m === minute ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                          {String(m).padStart(2,'00')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-3 py-1.5 flex justify-end">
                  <button type="button" onClick={() => setTimeOpen(false)}
                    className="text-xs font-bold text-primary-600">Selesai</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main FilterPanel ──────────────────────────────────────────────────────────

interface Props {
  searchQuery:           string;
  selectedCategory:      number | null;
  selectedSubCategory:   string | null;
  sortBy:                string | null;
  rentalFilters:         RentalFilters;
  transferFilters:       TransferFilters;
  isCarCategory:         boolean;
  isTransferCategory:    boolean;
  onSearch:              (v: string) => void;
  onCategorySelect:      (id: number) => void;
  onSubCategorySelect:   (v: string | null) => void;
  onSortChange:          (v: any) => void;
  onRentalFilterChange:  (field: keyof RentalFilters, value: string) => void;
  onTransferFilterChange:(field: keyof TransferFilters, value: string) => void;
}

export const FilterPanel = ({
  searchQuery, selectedCategory, selectedSubCategory, sortBy,
  rentalFilters, transferFilters,
  isCarCategory, isTransferCategory,
  onSearch, onCategorySelect, onSubCategorySelect, onSortChange,
  onRentalFilterChange, onTransferFilterChange,
}: Props) => {
  const { t } = useTranslation();

  return (
    <motion.div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 mb-12">
      <div className="flex flex-col gap-8">

        {/* ── Category tabs ── */}
        <motion.div variants={filterContainerVariants} initial="hidden" animate="visible"
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {CATEGORY_TABS.map((item) => (
            <motion.button key={item.id} variants={filterItemVariants}
              onClick={() => onCategorySelect(item.id)} whileTap={{ scale: 0.95 }}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
                ${selectedCategory === item.id
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900'}`}>
              {item.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Airport Transfer search bar ── */}
        {isTransferCategory ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <AirportTransferSearchBar filters={transferFilters} onChange={onTransferFilterChange} />
          </motion.div>
        ) : (
          /* ── Regular search + sort ── */
          <motion.div variants={slideLeftVariants} initial="hidden" animate="visible"
            transition={{ delay: 0.15 }} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={isCarCategory
                  ? t('explore.search_car_placeholder')
                  : t('explore.search_placeholder')
                }
                value={searchQuery}
                onChange={e => onSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium"
              />
              {searchQuery && (
                <button onClick={() => onSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {selectedCategory === 1 && (
              <div className="relative w-full lg:w-56">
                <select value={selectedSubCategory || ''} onChange={e => onSubCategorySelect(e.target.value || null)}
                  className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer">
                  <option value="">{t('explore.trip_type')}</option>
                  <option value="Open Trip">{t('explore.open_trip')}</option>
                  <option value="Private Trip">{t('explore.private_trip')}</option>
                  <option value="Group Trip">{t('explore.group_trip')}</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}

            <div className="relative w-full lg:w-56">
              <select value={sortBy || ''} onChange={e => onSortChange(e.target.value || null)}
                className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer">
                <option value="">{t('explore.sort')}</option>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </motion.div>
        )}

        {/* ── Sort for transfer ── */}
        {isTransferCategory && (
          <div className="flex justify-end">
            <div className="relative w-full lg:w-56">
              <select value={sortBy || ''} onChange={e => onSortChange(e.target.value || null)}
                className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer">
                <option value="">{t('explore.sort')}</option>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* ── Rental filters ── */}
        {isCarCategory && !isTransferCategory && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Gauge className="h-5 w-5 text-gray-400" /></div>
              <select value={rentalFilters.transmission} onChange={e => onRentalFilterChange('transmission', e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer appearance-none">
                <option value="">{t('explore.transmission')}</option>
                <option value="Automatic">{t('explore.automatic')}</option>
                <option value="Manual">{t('explore.manual')}</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Users className="h-5 w-5 text-gray-400" /></div>
              <select value={rentalFilters.passengerCapacity} onChange={e => onRentalFilterChange('passengerCapacity', e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer appearance-none">
                <option value="">{t('explore.passenger_capacity')}</option>
                <option value="2">2 {t('common.passengers')}</option>
                <option value="4">4 {t('common.passengers')}</option>
                <option value="6">6 {t('common.passengers')}</option>
                <option value="8">8+ {t('common.passengers')}</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><UserCog className="h-5 w-5 text-gray-400" /></div>
              <select value={rentalFilters.driverType} onChange={e => onRentalFilterChange('driverType', e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer appearance-none">
                <option value="">{t('explore.all_driver_types')}</option>
                <option value="with_driver">{t('explore.with_driver')}</option>
                <option value="without_driver">{t('explore.without_driver')}</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-gray-400 font-medium">Rp</span></div>
              <input type="number" placeholder={t('explore.min_price')} value={rentalFilters.minPrice}
                onChange={e => onRentalFilterChange('minPrice', e.target.value)} min="0"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-gray-400 font-medium">Rp</span></div>
              <input type="number" placeholder={t('explore.max_price')} value={rentalFilters.maxPrice}
                onChange={e => onRentalFilterChange('maxPrice', e.target.value)} min="0"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500" />
            </div>
          </motion.div>
        )}

        {/* ── Tag filters for tours / stays ── */}
        {(selectedCategory === 1 || selectedCategory === 2) && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
            className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <button onClick={() => onSubCategorySelect(null)}
              className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
                ${selectedSubCategory === null
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600'}`}>
              {t('explore.all_categories')}
            </button>
            {(selectedCategory === 1 ? TOUR_TAGS : STAY_TAGS).map((tag) => (
              <button key={tag} onClick={() => onSubCategorySelect(tag)}
                className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
                  ${selectedSubCategory === tag
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600'}`}>
                {tag}
              </button>
            ))}
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};

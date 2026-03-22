import { ArrowUpDown, Gauge, Search, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORY_TABS, SORT_OPTIONS, TOUR_TAGS, STAY_TAGS, filterContainerVariants, filterItemVariants, slideLeftVariants } from '../constants';
import type { RentalFilters } from '../hooks/useExploreFilters';

interface Props {
  searchQuery:          string;
  selectedCategory:     number | null;
  selectedSubCategory:  string | null;
  sortBy:               string | null;
  rentalFilters:        RentalFilters;
  isCarCategory:        boolean;
  onSearch:             (v: string) => void;
  onCategorySelect:     (id: number) => void;
  onSubCategorySelect:  (v: string | null) => void;
  onSortChange:         (v: any) => void;
  onRentalFilterChange: (field: keyof RentalFilters, value: string) => void;
}

export const FilterPanel = ({
  searchQuery, selectedCategory, selectedSubCategory, sortBy, rentalFilters, isCarCategory,
  onSearch, onCategorySelect, onSubCategorySelect, onSortChange, onRentalFilterChange,
}: Props) => (
  <motion.div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 mb-12">
    <div className="flex flex-col gap-8">

      {/* Category tabs */}
      <motion.div variants={filterContainerVariants} initial="hidden" animate="visible" className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {CATEGORY_TABS.map((item) => (
          <motion.button key={item.id} variants={filterItemVariants} onClick={() => onCategorySelect(item.id)} whileTap={{ scale: 0.95 }}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${selectedCategory === item.id ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900'}`}>
            {item.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Search + sort */}
      <motion.div variants={slideLeftVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input
            type="text"
            placeholder={isCarCategory ? 'Search rental location...' : 'Search destination or package...'}
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium"
          />
          {searchQuery && (
            <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {selectedCategory === 1 && (
          <div className="relative w-full lg:w-56">
            <select value={selectedSubCategory || ''} onChange={(e) => onSubCategorySelect(e.target.value || null)}
              className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer">
              <option value="">Trip Type</option>
              <option value="Open Trip">Open Trip</option>
              <option value="Private Trip">Private Trip</option>
              <option value="Group Trip">Group Trip</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}

        <div className="relative w-full lg:w-56">
          <select value={sortBy || ''} onChange={(e) => onSortChange(e.target.value || null)}
            className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer">
            <option value="">Sort by</option>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Rental filters */}
      {isCarCategory && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Gauge className="h-5 w-5 text-gray-400" /></div>
            <select value={rentalFilters.transmission} onChange={(e) => onRentalFilterChange('transmission', e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer appearance-none">
              <option value="">Transmission Type</option><option value="Automatic">Matic</option><option value="Manual">Manual</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Users className="h-5 w-5 text-gray-400" /></div>
            <select value={rentalFilters.passengerCapacity} onChange={(e) => onRentalFilterChange('passengerCapacity', e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500 cursor-pointer appearance-none">
              <option value="">Passenger Capacity</option>
              <option value="2">2 Passengers</option><option value="4">4 Passengers</option>
              <option value="6">6 Passengers</option><option value="8">8+ Passengers</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-gray-400 font-medium">Rp</span></div>
            <input type="number" placeholder="Min Price" value={rentalFilters.minPrice} onChange={(e) => onRentalFilterChange('minPrice', e.target.value)} min="0"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-gray-400 font-medium">Rp</span></div>
            <input type="number" placeholder="Max Price" value={rentalFilters.maxPrice} onChange={(e) => onRentalFilterChange('maxPrice', e.target.value)} min="0"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white font-medium text-gray-600 text-sm focus:outline-none focus:border-primary-500" />
          </div>
        </motion.div>
      )}

      {/* Tag filters for tours / stays */}
      {(selectedCategory === 1 || selectedCategory === 2) && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button onClick={() => onSubCategorySelect(null)}
            className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${selectedSubCategory === null ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600'}`}>
            Semua
          </button>
          {(selectedCategory === 1 ? TOUR_TAGS : STAY_TAGS).map((tag) => (
            <button key={tag} onClick={() => onSubCategorySelect(tag)}
              className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${selectedSubCategory === tag ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-600 hover:text-white hover:border-primary-600'}`}>
              {tag}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  </motion.div>
);

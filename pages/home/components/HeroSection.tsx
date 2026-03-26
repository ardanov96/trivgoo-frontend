'use client';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { useTypewriter } from '../hooks/useTypewriter';
import { useCalendar }   from '../hooks/useCalendar';
import { SEARCH_CATEGORIES, POPULAR_DESTINATIONS, CATEGORY_ID_MAP } from '../constants';

export const HeroSection = () => {
  const navigate = useNavigate();
  const { langNavigate, langPath } = useLangNavigate();
  const { t } = useTranslation();
  const typewriterText = useTypewriter();

  const [searchCategory, setSearchCategory]             = useState('tours');
  const [searchQuery, setSearchQuery]                   = useState('');
  const [showSuggestions, setShowSuggestions]           = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>(POPULAR_DESTINATIONS);
  const searchRef     = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const calendar      = useCalendar();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) calendar.setIsOpen(false);
      if (searchRef.current    && !searchRef.current.contains(e.target as Node))    setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setFilteredDestinations(
      q.length > 0 ? POPULAR_DESTINATIONS.filter((d) => d.toLowerCase().includes(q.toLowerCase())) : POPULAR_DESTINATIONS
    );
    if (q.length > 0) setShowSuggestions(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (calendar.searchDate) params.append('date', calendar.searchDate);
    const cid = CATEGORY_ID_MAP[searchCategory];
    if (cid) params.append('category_id', String(cid));
    langNavigate(`/explore?${params.toString()}`);
  };

  const activeCategoryConfig = SEARCH_CATEGORIES.find((c) => c.id === searchCategory) || SEARCH_CATEGORIES[0];

  // ── Label helpers ────────────────────────────────────────────────────────
  const locationLabel = searchCategory === 'cars'
    ? t('hero.pickup_location', 'Pick-up Location')
    : searchCategory === 'transfers'
    ? t('hero.from_to', 'From/To')
    : t('hero.destination', 'Destination');

  const guestLabel = (searchCategory === 'cars' || searchCategory === 'transfers')
    ? t('hero.passengers', 'Passengers')
    : t('hero.guests', 'Guests');

  const guestPlaceholder = (searchCategory === 'cars' || searchCategory === 'transfers')
    ? t('hero.add_passengers', 'Add passengers')
    : t('hero.add_guests', 'Add guests');

  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center px-4 pt-28 md:pt-24 lg:pt-28 pb-12">
      {/* Background video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video className="w-full h-full object-cover" src="/videos/video-bg.mp4" autoPlay loop muted playsInline />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/20 to-gray-900/70" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto text-center px-4">
        {/* Heading */}
        <motion.h1 className="font-serif font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="block text-sm md:text-base lg:text-lg font-medium tracking-widest text-white/80 mb-2"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
          >
            🌟{t('hero.hello', "Hello Triverse, Let's")}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="block text-2xl md:text-4xl lg:text-5xl opacity-90"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700 }}
          >
            {t('hero.find_your', 'Find Your')}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="block text-6xl md:text-8xl lg:text-[10rem] text-outlined bg-clip-text bg-gradient-to-r from-primary-200 to-white mb-10 md:mb-14"
            style={{ fontFamily: "'Vlogger', serif", minHeight: '1.2em', lineHeight: '1.2' }}
          >
            {typewriterText || '\u00A0'}
          </motion.span>
        </motion.h1>

        {/* Search Widget */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full max-w-4xl mx-auto relative z-[60]"
        >
          {/* Category tabs */}
          <div className="flex justify-center mb-4 md:mb-6 px-4 md:px-0">
            <div className="bg-gray-900/40 backdrop-blur-md p-1.5 rounded-3xl flex flex-wrap justify-center gap-1 border border-white/10 w-full md:w-auto">
              {SEARCH_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = searchCategory === cat.id;
                return (
                  <button key={cat.id} onClick={() => setSearchCategory(cat.id)}
                    className={`flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap mb-1 md:mb-0 ${isActive ? 'bg-white text-primary-700 shadow-lg scale-105' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary-600' : 'text-white/80'}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch md:items-center border border-white/40 divide-y divide-gray-100 md:divide-y-0 relative pr-0 md:pr-16">

            {/* Destination */}
            <div className="flex-1 flex items-center md:border-r md:border-gray-200 p-4 md:p-3 md:pl-8 relative" ref={searchRef}>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-left w-full relative">
                <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {locationLabel}
                </label>
                <input
                  type="text"
                  placeholder={activeCategoryConfig.placeholder}
                  className="w-full text-base text-gray-800 font-medium focus:outline-none placeholder-gray-400 bg-transparent"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                />
              </div>
              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 mt-4 w-full md:w-80 bg-white rounded-2xl shadow-2xl py-2 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2 z-[70]">
                  <div className="absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100" />
                  <div className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    {searchQuery
                      ? t('hero.suggestions', 'Suggestions')
                      : t('hero.popular_destinations', 'Popular Destinations')
                    }
                  </div>
                  {filteredDestinations.length > 0 ? (
                    <ul className="max-h-64 overflow-y-auto">
                      {filteredDestinations.map((dest, i) => (
                        <li key={i}>
                          <button type="button" onClick={() => { setSearchQuery(dest); setShowSuggestions(false); }}
                            className="w-full text-left px-5 py-3 flex items-center hover:bg-gray-50 transition-colors border border-gray-50 last:border-0">
                            <div className="p-2 bg-primary-50 rounded-lg mr-3 text-primary-600"><MapPin className="w-4 h-4" /></div>
                            <span className="text-sm text-gray-700 font-medium">{dest}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-5 py-4 text-sm text-gray-500 text-center">
                      {t('explore.no_results', 'No results found.')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div className="flex-1 flex items-center md:border-r md:border-gray-200 p-4 md:p-3 md:px-6 relative" ref={datePickerRef}>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-left w-full cursor-pointer" onClick={() => calendar.setIsOpen(!calendar.isOpen)}>
                <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 cursor-pointer">
                  {t('hero.date', 'Date')}
                </label>
                <input
                  type="text"
                  placeholder={t('hero.add_dates', 'Add dates')}
                  className="w-full text-base text-gray-800 font-medium focus:outline-none placeholder-gray-400 cursor-pointer bg-transparent"
                  value={calendar.searchDate}
                  readOnly
                />
              </div>
              {/* Calendar dropdown */}
              {calendar.isOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-2xl p-6 w-[280px] md:w-[320px] z-[70] animate-in fade-in slide-in-from-top-2 border border-gray-100 ring-1 ring-black/5">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100" />
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-lg font-serif font-bold text-gray-900">{calendar.monthLabel}</h3>
                    <div className="flex space-x-2">
                      <button onClick={calendar.handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={calendar.handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 mb-3 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 place-items-center mb-6">{calendar.renderCalendarGrid()}</div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button onClick={(e) => { e.preventDefault(); calendar.handleClear(); }} className="text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-gray-800 transition-colors">
                      {t('common.cancel', 'Clear')}
                    </button>
                    <button onClick={(e) => { e.preventDefault(); calendar.handleToday(); }} className="text-xs font-bold uppercase tracking-wide text-primary-600 hover:text-primary-700 transition-colors">
                      {t('hero.today', 'Today')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Guests */}
            <div className="flex-1 flex items-center p-4 md:p-3 md:px-6">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left w-full">
                <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {guestLabel}
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder={guestPlaceholder}
                  className="w-full text-base text-gray-800 font-medium focus:outline-none placeholder-gray-400 bg-transparent"
                />
              </div>
            </div>

            {/* Submit — desktop */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:block z-10">
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl shadow-primary-600/30 transition-all hover:scale-105 active:scale-95">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Submit — mobile */}
            <div className="p-4 md:hidden">
              <button type="submit" className="w-full bg-primary-600 active:bg-primary-700 text-white rounded-xl h-12 font-bold shadow-lg transition-transform active:scale-95">
                {t('common.search', 'Search')}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-12 md:mt-12 flex items-center justify-center gap-2 text-white/90 text-sm font-medium relative z-10 pb-8 md:pb-0"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-900 bg-gray-300">
                <img src={`https://randomuser.me/api/portraits/thumb/women/${i + 20}.jpg`} className="w-full h-full rounded-full" alt="User" />
              </div>
            ))}
          </div>
          <span className="ml-2 text-xs md:text-sm">
            {t('hero.trusted_by', 'Trusted by 50,000+ travelers worldwide')}
          </span>
        </motion.div>
      </div>
    </div>
  );
};

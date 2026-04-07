'use client';
import { Calendar, Car, ChevronLeft, ChevronRight, MapPin, Minus, Plus, Search, Users, ArrowLeftRight, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { useTypewriter } from '../hooks/useTypewriter';
import { getSearchCategories, POPULAR_DESTINATIONS } from '../constants';
import type { RouteSlugMap } from '../../../src/i18n/slugs';

type CategoryId = 'tours' | 'stays' | 'cars' | 'transfers' | 'events';

// ── Video Sources (local /public/videos/) ─────────────────────────────────────
const VIDEO = {
  desktopWebm: '/videos/video-bg-desktop.webm',
  desktopMp4:  '/videos/video-bg-desktop.mp4',
  mobileMp4:   '/videos/video-bg-mobile.mp4',
  posterWebp:  '/videos/video-poster.webp',
  posterJpg:   '/videos/video-poster.jpg',
};

// ── Adaptive Video Strategy ───────────────────────────────────────────────────
function useVideoStrategy() {
  const [strategy, setStrategy] = useState<'desktop' | 'mobile' | 'poster'>('poster');

  useEffect(() => {
    // 1. Reduce motion → poster only
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStrategy('poster'); return;
    }
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    };
    const conn = nav.connection;
    // 2. Data saver aktif → poster only
    if (conn?.saveData) { setStrategy('poster'); return; }
    // 3. Koneksi lambat → poster only
    if (conn?.effectiveType && ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
      setStrategy('poster'); return;
    }
    // 4. Mobile → video ringan 720p, desktop → 1080p
    setStrategy(window.innerWidth < 768 ? 'mobile' : 'desktop');
  }, []);

  return strategy;
}

// ── Video Background Component ────────────────────────────────────────────────
const VideoBackground = () => {
  const strategy          = useVideoStrategy();
  const videoRef          = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const onCanPlay         = useCallback(() => setReady(true), []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Poster — tampil duluan, fade out setelah video siap */}
      <picture className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${ready ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <source srcSet={VIDEO.posterWebp} type="image/webp" />
        <img
          src={VIDEO.posterJpg}
          alt=""
          className="w-full h-full object-cover"
          // @ts-ignore — fetchpriority valid HTML5
          fetchpriority="high"
          decoding="async"
        />
      </picture>

      {/* Video — hanya load jika bukan poster-only mode */}
      {strategy !== 'poster' && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={onCanPlay}
        >
          {/* WebM duluan — Chrome/Firefox/Edge (3.9MB) */}
          {strategy === 'desktop' && (
            <source src={VIDEO.desktopWebm} type="video/webm" />
          )}
          {/* MP4 — Safari fallback (desktop 9.2MB) atau mobile (2.0MB) */}
          <source
            src={strategy === 'mobile' ? VIDEO.mobileMp4 : VIDEO.desktopMp4}
            type="video/mp4"
          />
        </video>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/20 to-gray-900/70" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const toDateStr = (date: Date | null): string =>
  date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Mini Calendar ─────────────────────────────────────────────────────────────

interface MiniCalendarProps {
  value: string; onChange: (val: string) => void;
  minDate?: string; label: string; placeholder?: string;
}

const MiniCalendar = ({ value, onChange, minDate, label, placeholder }: MiniCalendarProps) => {
  const { t }                       = useTranslation();
  const [isOpen, setIsOpen]         = useState(false);
  const [viewDate, setViewDate]     = useState(new Date());
  const ref                         = useRef<HTMLDivElement>(null);
  const defaultPlaceholder          = placeholder ?? t('hero.pick_date', 'Pilih tanggal');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay    = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const monthLabel  = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const today       = new Date(); today.setHours(0, 0, 0, 0);
  const minDateObj  = minDate ? new Date(minDate + 'T00:00:00') : today;

  const handleSelect = (day: number) => {
    onChange(toDateStr(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)));
    setIsOpen(false);
  };
  const isDisabled = (day: number) => { const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day); d.setHours(0,0,0,0); return d < minDateObj; };
  const isSelected = (day: number) => !!value && toDateStr(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)) === value;
  const isToday    = (day: number) => toDateStr(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)) === toDateStr(new Date());

  const dayHeaders = [
    t('calendar.days_short.sun','Min'), t('calendar.days_short.mon','Sen'),
    t('calendar.days_short.tue','Sel'), t('calendar.days_short.wed','Rab'),
    t('calendar.days_short.thu','Kam'), t('calendar.days_short.fri','Jum'),
    t('calendar.days_short.sat','Sab'),
  ];

  return (
    <div className="relative w-full" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer select-none text-left">
        {label && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>}
        <p className={`text-sm font-semibold leading-tight ${value ? 'text-gray-800' : 'text-gray-400'}`}>
          {value ? formatDisplayDate(value) : defaultPlaceholder}
        </p>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 bg-white rounded-2xl shadow-2xl p-5 w-72 z-[90] border border-gray-100">
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100" />
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-800 text-sm capitalize">{monthLabel}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()-1))} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
              <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()+1))} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2 text-center">
            {dayHeaders.map((d,i) => <span key={i} className="text-[10px] font-bold text-gray-400">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {[...Array(firstDay)].map((_,i) => <div key={`e-${i}`} />)}
            {[...Array(daysInMonth)].map((_,i) => {
              const day=i+1; const dis=isDisabled(day); const sel=isSelected(day); const tod=isToday(day);
              return (
                <button key={day} type="button" onClick={() => !dis && handleSelect(day)} disabled={dis}
                  className={`flex items-center justify-center h-8 w-8 mx-auto rounded-full text-xs font-semibold transition-all
                    ${sel ? 'bg-primary-600 text-white' : dis ? 'text-gray-300 cursor-not-allowed' : tod ? 'border border-primary-400 text-primary-600 hover:bg-primary-50' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Scroll Time Picker ────────────────────────────────────────────────────────

interface ScrollTimePickerProps { value: string; onChange: (val: string) => void; }

const ScrollTimePicker = ({ value, onChange }: ScrollTimePickerProps) => {
  const { t }               = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref                 = useRef<HTMLDivElement>(null);
  const hourRef             = useRef<HTMLDivElement>(null);
  const parts  = value.split(':'); const hour = parseInt(parts[0])||0; const minute = parseInt(parts[1])||0;
  const hours = Array.from({length:24},(_,i)=>i); const minutes = [0,30];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => {
    if (isOpen && hourRef.current) { const el = hourRef.current.children[hour] as HTMLElement; el?.scrollIntoView({block:'center',behavior:'smooth'}); }
  }, [isOpen, hour]);

  const setHour   = (h: number) => onChange(`${String(h).padStart(2,'0')}:${String(minute).padStart(2,'0')}`);
  const setMinute = (m: number) => onChange(`${String(hour).padStart(2,'0')}:${String(m).padStart(2,'0')}`);

  return (
    <div className="relative" ref={ref}>
      <p onClick={() => setIsOpen(!isOpen)} className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-primary-600 transition-colors text-left">{value}</p>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[90] overflow-hidden w-44">
          <div className="flex">
            <div className="flex-1 border-r border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center py-2 border-b border-gray-100">{t('hero.hour','Jam')}</p>
              <div ref={hourRef} className="h-44 overflow-y-auto scroll-smooth">
                {hours.map(h => <button key={h} type="button" onClick={() => setHour(h)} className={`w-full py-2 text-sm font-semibold text-center transition-colors ${h===hour?'bg-primary-50 text-primary-600':'text-gray-700 hover:bg-gray-50'}`}>{String(h).padStart(2,'0')}</button>)}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center py-2 border-b border-gray-100">{t('hero.minute','Menit')}</p>
              <div className="h-44 overflow-y-auto">
                {minutes.map(m => <button key={m} type="button" onClick={() => setMinute(m)} className={`w-full py-2 text-sm font-semibold text-center transition-colors ${m===minute?'bg-primary-50 text-primary-600':'text-gray-700 hover:bg-gray-50'}`}>{String(m).padStart(2,'0')}</button>)}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 px-4 py-2 flex justify-end">
            <button type="button" onClick={() => setIsOpen(false)} className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">{t('common.confirm','Selesai')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Pax Counter ───────────────────────────────────────────────────────────────

interface PaxCounterProps { value: number; onChange: (val: number) => void; min?: number; label: string; }
const PaxCounter = ({ value, onChange, min=1, label }: PaxCounterProps) => (
  <div className="w-full text-left">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(min, value-1))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Minus className="w-3 h-3" /></button>
      <span className="text-sm font-bold text-gray-800 min-w-[2ch] text-left">{value}</span>
      <button type="button" onClick={() => onChange(value+1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Plus className="w-3 h-3" /></button>
    </div>
  </div>
);

// ── Field Wrapper ─────────────────────────────────────────────────────────────

const FieldWrapper = ({ icon, children, border=true, className='' }: { icon: React.ReactNode; children: React.ReactNode; border?: boolean; className?: string; }) => (
  <div className={`flex-1 flex items-center gap-3 p-4 md:p-4 md:px-5 text-left ${border?'md:border-r md:border-gray-200':''} ${className}`}>
    <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0 text-left">{children}</div>
  </div>
);

// ── Airport Transfer Fields ───────────────────────────────────────────────────

interface AirportTransferFieldsProps {
  fromAirport: string; setFromAirport: (v: string) => void;
  toDestination: string; setToDestination: (v: string) => void;
  transferDate: string; setTransferDate: (v: string) => void;
  transferTime: string; setTransferTime: (v: string) => void;
}
const AirportTransferFields: React.FC<AirportTransferFieldsProps> = ({ fromAirport, setFromAirport, toDestination, setToDestination, transferDate, setTransferDate, transferTime, setTransferTime }) => {
  const { t } = useTranslation();
  const [swapped, setSwapped] = useState(false);
  const handleSwap = () => { const tmp=fromAirport; setFromAirport(toDestination); setToDestination(tmp); setSwapped(s=>!s); };
  return (
    <>
      <div className="flex-1 flex items-center gap-3 p-4 md:px-5 md:border-r md:border-gray-200 relative text-left">
        <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0"><PlaneTakeoff className="w-4 h-4" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('hero.from_airport','Dari Bandara')}</p>
          <input type="text" placeholder={t('hero.airport_placeholder','Contoh: Ngurah Rai International')} className="w-full text-sm text-gray-800 font-semibold focus:outline-none placeholder-gray-400 bg-transparent" value={fromAirport} onChange={e => setFromAirport(e.target.value)} />
        </div>
        <button type="button" onClick={handleSwap} className="absolute right-0 translate-x-1/2 z-10 w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95" title={t('hero.swap_locations','Tukar lokasi')}>
          <ArrowLeftRight className={`w-3.5 h-3.5 transition-transform duration-300 ${swapped?'rotate-180':''}`} />
        </button>
      </div>
      <div className="flex-1 flex items-center gap-3 p-4 md:px-5 md:border-r md:border-gray-200 text-left">
        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0"><PlaneLanding className="w-4 h-4" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('hero.to_destination','Ke Tujuan')}</p>
          <input type="text" placeholder={t('hero.destination_placeholder','Area, alamat, hotel, gedung...')} className="w-full text-sm text-gray-800 font-semibold focus:outline-none placeholder-gray-400 bg-transparent" value={toDestination} onChange={e => setToDestination(e.target.value)} />
        </div>
      </div>
      <div className="flex-1 flex items-center gap-3 p-4 md:px-5 md:border-r md:border-gray-200 text-left">
        <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0"><Calendar className="w-4 h-4" /></div>
        <div className="flex-1 min-w-0"><MiniCalendar value={transferDate} onChange={setTransferDate} label={t('hero.pickup_date','Tanggal Jemput')} placeholder={t('hero.pick_date','Pilih tanggal')} /></div>
      </div>
      <div className="flex-1 flex items-center gap-3 p-4 md:px-5 text-left">
        <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0"><Car className="w-4 h-4" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('hero.pickup_time_label','Waktu')}</p>
          <ScrollTimePicker value={transferTime} onChange={setTransferTime} />
        </div>
      </div>
    </>
  );
};

// ── Main HeroSection ──────────────────────────────────────────────────────────

export const HeroSection = () => {
  const { langNavigate }  = useLangNavigate();
  const { t }             = useTranslation();
  const typewriterText    = useTypewriter();
  const SEARCH_CATEGORIES = getSearchCategories(t);

  const [searchCategory,       setSearchCategory]       = useState<CategoryId>('tours');
  const [searchQuery,          setSearchQuery]          = useState('');
  const [showSuggestions,      setShowSuggestions]      = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>(POPULAR_DESTINATIONS);
  const searchRef = useRef<HTMLDivElement>(null);

  const [tourDate,      setTourDate]      = useState('');
  const [tourPax,       setTourPax]       = useState(2);
  const [checkIn,       setCheckIn]       = useState('');
  const [checkOut,      setCheckOut]      = useState('');
  const [stayGuests,    setStayGuests]    = useState(2);
  const [pickupDate,    setPickupDate]    = useState('');
  const [pickupTime,    setPickupTime]    = useState('09:00');
  const [dropoffDate,   setDropoffDate]   = useState('');
  const [dropoffTime,   setDropoffTime]   = useState('09:00');
  const [withDriver,    setWithDriver]    = useState<boolean | null>(null);
  const [fromAirport,   setFromAirport]   = useState('');
  const [toDestination, setToDestination] = useState('');
  const [transferDate,  setTransferDate]  = useState('');
  const [transferTime,  setTransferTime]  = useState('09:00');

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value; setSearchQuery(q);
    setFilteredDestinations(q.length > 0 ? POPULAR_DESTINATIONS.filter(d => d.toLowerCase().includes(q.toLowerCase())) : POPULAR_DESTINATIONS);
    if (q.length > 0) setShowSuggestions(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const categoryCanonicalMap: Record<CategoryId, keyof RouteSlugMap> = { tours:'tours', stays:'stays', cars:'car-rental', transfers:'airport-transfer', events:'events' };
    const canonical = categoryCanonicalMap[searchCategory];
    if (searchCategory === 'transfers') {
      if (fromAirport.trim())   params.append('from',        fromAirport);
      if (toDestination.trim()) params.append('to',          toDestination);
      if (transferDate)         params.append('pickup_date', transferDate);
      if (transferTime)         params.append('pickup_time', transferTime);
    } else {
      if (searchQuery.trim()) params.append('search', searchQuery);
      if ((searchCategory==='tours'||searchCategory==='events') && tourDate) params.append('date', tourDate);
      if (searchCategory==='stays' && checkIn) { params.append('check_in',checkIn); if (checkOut) params.append('check_out',checkOut); if (stayGuests>1) params.append('guests',String(stayGuests)); }
      if (searchCategory==='cars' && pickupDate) { params.append('pickup_date',pickupDate); params.append('pickup_time',pickupTime); if (dropoffDate){params.append('dropoff_date',dropoffDate);params.append('dropoff_time',dropoffTime);} if (withDriver!==null) params.append('with_driver',String(withDriver)); }
    }
    const queryString = params.toString();
    langNavigate(`/explore/${canonical}${queryString?`?${queryString}`:''}`);
  };

  const isCarCategory      = searchCategory === 'cars';
  const isTransferCategory = searchCategory === 'transfers';
  const isStayCategory     = searchCategory === 'stays';
  const activeCat          = SEARCH_CATEGORIES.find(c => c.id === searchCategory) || SEARCH_CATEGORIES[0];
  const locationLabel      = isCarCategory ? t('hero.pickup_location','Lokasi Penjemputan') : t('hero.destination','Destinasi');
  const driverOptions      = [
    { val: false as const, Icon: Car,   label: t('hero.self_drive','Lepas Kunci') },
    { val: true  as const, Icon: Users, label: t('hero.with_driver','Dengan Sopir') },
  ];

  const renderDynamicFields = () => {
    if (isCarCategory) return (
      <>
        <FieldWrapper icon={<Calendar className="w-4 h-4" />} border>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('hero.rental_start','Mulai Sewa')}</p>
          <MiniCalendar value={pickupDate} onChange={setPickupDate} label="" />
          <ScrollTimePicker value={pickupTime} onChange={setPickupTime} />
        </FieldWrapper>
        <FieldWrapper icon={<Car className="w-4 h-4" />} border={false}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('hero.rental_end','Selesai Sewa')}</p>
          <MiniCalendar value={dropoffDate} onChange={setDropoffDate} minDate={pickupDate||undefined} label="" />
          <ScrollTimePicker value={dropoffTime} onChange={setDropoffTime} />
        </FieldWrapper>
      </>
    );
    if (isStayCategory) return (
      <>
        <FieldWrapper icon={<Calendar className="w-4 h-4" />} border>
          <div className="flex gap-4 text-left">
            <MiniCalendar value={checkIn} onChange={val=>{setCheckIn(val);if(checkOut&&val>=checkOut)setCheckOut('');}} label={t('stay.check_in_label','Check-in')} />
            <div className="w-px bg-gray-200 self-stretch" />
            <MiniCalendar value={checkOut} onChange={setCheckOut} minDate={checkIn||undefined} label={t('stay.check_out_label','Check-out')} />
          </div>
        </FieldWrapper>
        <FieldWrapper icon={<Users className="w-4 h-4" />} border={false}>
          <PaxCounter value={stayGuests} onChange={setStayGuests} min={1} label={t('common.guests','Tamu')} />
        </FieldWrapper>
      </>
    );
    return (
      <>
        <FieldWrapper icon={<Calendar className="w-4 h-4" />} border>
          <MiniCalendar value={tourDate} onChange={setTourDate} label={t('product.select_date','Tanggal')} />
        </FieldWrapper>
        <FieldWrapper icon={<Users className="w-4 h-4" />} border={false}>
          <PaxCounter value={tourPax} onChange={setTourPax} min={1} label={t('product.participants','Peserta')} />
        </FieldWrapper>
      </>
    );
  };

  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center px-4 pt-28 md:pt-24 lg:pt-28 pb-12">

      {/* ── Optimized Video Background ── */}
      <VideoBackground />

      <div className="relative z-20 w-full max-w-7xl mx-auto text-center px-4">

        {/* Heading */}
        <motion.h1 className="font-serif font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
          <motion.span initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.1}}
            className="block text-sm md:text-base lg:text-lg font-medium tracking-widest text-white/80 mb-2"
            style={{fontFamily:'Helvetica, Arial, sans-serif'}}>
            🌟{t('hero.hello',"Hello Triverse, Let's")}
          </motion.span>
          <motion.span initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.3}}
            className="block text-2xl md:text-4xl lg:text-5xl opacity-90"
            style={{fontFamily:'Helvetica, Arial, sans-serif',fontWeight:700}}>
            {t('hero.find_your','Find Your')}
          </motion.span>
          <motion.span initial={{opacity:0,scale:0.8,y:20}} animate={{opacity:1,scale:1,y:0}} transition={{duration:1,delay:0.5}}
            className="block text-6xl md:text-8xl lg:text-[10rem] text-outlined bg-clip-text bg-gradient-to-r from-primary-200 to-white mb-10 md:mb-14"
            style={{fontFamily:"'Vlogger', serif",minHeight:'1.2em',lineHeight:'1.2'}}>
            {typewriterText || '\u00A0'}
          </motion.span>
        </motion.h1>

        {/* Search Widget */}
        <motion.div initial={{opacity:0,y:30,scale:0.95}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.8,delay:0.8}}
          className="w-full max-w-5xl mx-auto relative z-[60]">

          {/* Category tabs */}
          <div className="flex justify-center mb-4 md:mb-5 px-4 md:px-0">
            <div className="bg-gray-900/40 backdrop-blur-md p-1.5 rounded-3xl flex flex-wrap justify-center gap-1 border border-white/10 w-full md:w-auto">
              {SEARCH_CATEGORIES.map(cat => {
                const Icon = cat.icon; const isActive = searchCategory === cat.id;
                return (
                  <button key={cat.id}
                    onClick={() => { setSearchCategory(cat.id as CategoryId); if (cat.id !== 'cars') setWithDriver(null); }}
                    className={`flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap mb-1 md:mb-0
                      ${isActive ? 'bg-white text-primary-700 shadow-lg scale-105' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                    <Icon className={`w-4 h-4 mr-2 ${isActive?'text-primary-600':'text-white/80'}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit}
            className={`bg-white/95 backdrop-blur-xl shadow-2xl border border-white/40 overflow-visible
              ${isCarCategory||isTransferCategory ? 'rounded-2xl md:rounded-3xl' : 'rounded-2xl md:rounded-full'}`}>

            {isCarCategory && (
              <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-500 shrink-0">{t('hero.rental_type','Tipe Sewa')}</span>
                <div className="flex gap-2">
                  {driverOptions.map(opt => (
                    <button key={String(opt.val)} type="button" onClick={() => setWithDriver(opt.val)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all
                        ${withDriver===opt.val ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 bg-white'}`}>
                      <opt.Icon className="w-3.5 h-3.5" />{opt.label}
                    </button>
                  ))}
                </div>
                {withDriver===null && <span className="text-[10px] text-gray-400 italic">{t('hero.pick_rental_type','Pilih tipe sewa')}</span>}
              </div>
            )}

            {isTransferCategory ? (
              <div className="flex flex-col md:flex-row items-stretch md:items-center divide-y divide-gray-100 md:divide-y-0 relative min-h-[72px] pr-0 md:pr-40">
                <AirportTransferFields fromAirport={fromAirport} setFromAirport={setFromAirport} toDestination={toDestination} setToDestination={setToDestination} transferDate={transferDate} setTransferDate={setTransferDate} transferTime={transferTime} setTransferTime={setTransferTime} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block z-10">
                  <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-5 h-14 flex items-center gap-2 font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
                    <Search className="w-4 h-4" />{t('hero.search_transfer','Cari Transfer')}
                  </button>
                </div>
                <div className="p-4 md:hidden">
                  <button type="submit" className="w-full bg-primary-600 text-white rounded-xl h-12 font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" />{t('hero.search_transfer','Cari Transfer')}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col md:flex-row items-stretch md:items-center divide-y divide-gray-100 md:divide-y-0 relative min-h-[72px] ${isCarCategory?'pr-0 md:pr-40':'pr-0 md:pr-16'}`}>
                <div className="flex-1 flex items-center gap-3 p-4 md:p-4 md:pl-7 md:border-r md:border-gray-200 relative text-left" ref={searchRef}>
                  <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0"><MapPin className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{locationLabel}</p>
                    <input type="text" placeholder={activeCat.placeholder}
                      className="w-full text-sm text-gray-800 font-semibold focus:outline-none placeholder-gray-400 bg-transparent text-left"
                      value={searchQuery} onChange={handleSearchChange} onFocus={() => setShowSuggestions(true)} />
                  </div>
                  {showSuggestions && (
                    <div className="absolute top-full left-0 mt-3 w-full md:w-80 bg-white rounded-2xl shadow-2xl py-2 overflow-hidden border border-gray-100 z-[70]">
                      <div className="absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100" />
                      <div className="px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        {searchQuery ? t('hero.suggestions','Saran') : t('hero.popular_destinations','Destinasi Populer')}
                      </div>
                      {filteredDestinations.length > 0 ? (
                        <ul className="max-h-56 overflow-y-auto">
                          {filteredDestinations.map((dest,i) => (
                            <li key={i}>
                              <button type="button" onClick={() => {setSearchQuery(dest);setShowSuggestions(false);}}
                                className="w-full text-left px-5 py-2.5 flex items-center hover:bg-gray-50 transition-colors gap-3">
                                <div className="p-1.5 bg-primary-50 rounded-lg text-primary-600 shrink-0"><MapPin className="w-3.5 h-3.5" /></div>
                                <span className="text-sm text-gray-700 font-medium">{dest}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-5 py-4 text-sm text-gray-400 text-center">{t('explore.no_results','Tidak ditemukan')}</div>
                      )}
                    </div>
                  )}
                </div>
                {renderDynamicFields()}
                {isCarCategory ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block z-10">
                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-5 h-14 flex items-center gap-2 font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
                      <Search className="w-4 h-4" />{t('hero.search_car','Cari Mobil')}
                    </button>
                  </div>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block z-10">
                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95">
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="p-4 md:hidden">
                  <button type="submit" className="w-full bg-primary-600 text-white rounded-xl h-12 font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" />{isCarCategory ? t('hero.search_car','Cari Mobil') : t('common.search','Cari')}
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>

        {/* Trust badge */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:1.1}}
          className="mt-10 flex items-center justify-center gap-2 text-white/90 text-sm font-medium relative z-10 pb-8 md:pb-0">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-900 bg-gray-300 overflow-hidden">
                <img src={`https://randomuser.me/api/portraits/thumb/women/${i+20}.jpg`} className="w-full h-full rounded-full" alt="" />
              </div>
            ))}
          </div>
          <span className="ml-2 text-xs md:text-sm">{t('hero.trusted_by','Dipercaya 50.000+ traveler di seluruh dunia')}</span>
        </motion.div>
      </div>
    </div>
  );
};

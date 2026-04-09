import {
  ArrowRight, Calendar, Clock, Lightbulb, Map, MapPin,
  Send, Sparkles, Star, Sunrise, Sunset, UtensilsCrossed,
} from 'lucide-react';
import React, { useState } from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { generateTripPlan } from '../services/aiTripService';
import { Product } from '../types';
import { encodeId } from '../utils/hashids';
import { generateSlug } from '../utils/slugify';

// ── Animation Variants ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.5 } },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return num.toLocaleString('id-ID');
}

interface DaySection {
  day:   number;
  title: string;
  body:  string;
}

function parseItineraryToDays(text: string): DaySection[] {
  if (!text) return [];

  const matches = [...text.matchAll(/^(#{1,3}\s*(Day\s*\d+|Hari\s*(ke-?)?\d+)[^\n]*)/gim)];
  if (matches.length === 0) return [];

  return matches.map((match, idx) => {
    const start  = match.index!;
    const end    = idx + 1 < matches.length ? matches[idx + 1].index! : text.length;
    const heading = match[0].replace(/^#+\s*/, '').trim();
    const body    = text.slice(start + match[0].length, end).trim();
    const numMatch = heading.match(/\d+/);
    return { day: numMatch ? parseInt(numMatch[0]) : idx + 1, title: heading, body };
  });
}

function getDayIcon(body: string) {
  const lower = body.toLowerCase();
  if (lower.includes('sunrise') || lower.includes('pagi') || lower.includes('morning'))
    return <Sunrise className="w-4 h-4" />;
  if (lower.includes('dinner') || lower.includes('makan malam') || lower.includes('restaurant'))
    return <UtensilsCrossed className="w-4 h-4" />;
  if (lower.includes('sunset') || lower.includes('sore'))
    return <Sunset className="w-4 h-4" />;
  return <Calendar className="w-4 h-4" />;
}

// ── Day Accordion Card ────────────────────────────────────────────────────────

const DayCard: React.FC<{ section: DaySection; index: number }> = ({ section, index }) => {
  const [open, setOpen] = useState(index === 0);

  const cleanTitle = section.title.replace(
    /^(Day\s*\d+|Hari\s*(ke-)?\d+)\s*[:\-–]?\s*/i, ''
  );

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/70 transition-colors"
      >
        {/* Day Badge */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-600 text-white flex flex-col items-center justify-center leading-none shadow-sm shadow-primary-200">
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">Day</span>
          <span className="text-xl font-bold leading-tight">{section.day}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-primary-500 mb-0.5">
            {getDayIcon(section.body)}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {section.day === 1 ? 'Hari Pertama'
                : section.day === 2 ? 'Hari Kedua'
                : section.day === 3 ? 'Hari Ketiga'
                : `Hari ${section.day}`}
            </span>
          </div>
          <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">
            {cleanTitle || section.title}
          </h4>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-50 pt-4">
              <div className="prose prose-sm prose-primary max-w-none text-gray-600 leading-relaxed
                [&>p]:mb-3 [&>ul]:mb-3 [&>ul>li]:mb-1.5 [&>ul>li]:text-gray-600
                [&>h4]:font-bold [&>h4]:text-gray-800 [&>h4]:mt-4 [&>h4]:mb-2 [&>h4]:text-sm
                [&>strong]:text-gray-800 [&>ol>li]:mb-1.5">
                <ReactMarkdown>{section.body}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Skeleton Cards ────────────────────────────────────────────────────────────

const SkeletonDayCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 bg-gray-100 rounded w-1/4" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  </div>
);

const SkeletonProductCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-3 flex gap-3 animate-pulse">
    <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-2.5 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-4 bg-gray-100 rounded w-1/2 mt-1" />
    </div>
  </div>
);

// ── Product Card ──────────────────────────────────────────────────────────────

const ProductCard: React.FC<{ product: Product; langPath: (p: string) => string }> = ({
  product, langPath,
}) => (
  <motion.div variants={fadeUp}>
    <Link
      to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}
      className="group flex gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all overflow-hidden p-3"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {Number(product.rating) > 4.5 && (
          <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[9px] font-bold shadow-sm flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            {Number(product.rating).toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>
          <h4 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h4>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-[9px] text-gray-400 block leading-none mb-0.5">
              {product.currency}
            </span>
            <span className="text-sm font-bold text-primary-700 leading-none">
              {formatPrice(product.price)}
            </span>
          </div>
          <span className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const AITripPlanner: React.FC = () => {
  const { t }        = useTranslation();
  const { langPath } = useLangNavigate();

  const [userStory, setUserStory]                     = useState('');
  const [rawItinerary, setRawItinerary]               = useState('');
  const [daySections, setDaySections]                 = useState<DaySection[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading]                     = useState(false);
  const [hasSearched, setHasSearched]                 = useState(false);

  const SUGGESTIONS = [
    t('ai_planner.suggestion_1'),
    t('ai_planner.suggestion_2'),
    t('ai_planner.suggestion_3'),
    t('ai_planner.suggestion_4'),
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userStory.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setRawItinerary('');
    setDaySections([]);
    setRecommendedProducts([]);

    const result = await generateTripPlan(userStory);
    const parsed = parseItineraryToDays(result.itinerary);

    setDaySections(parsed);
    setRawItinerary(result.itinerary);
    setRecommendedProducts(result.recommendedProducts);
    setIsLoading(false);
  };

  return (
    <>
      <SEO title="AI Trip Planner | Trivgoo" />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Hero ──────────────────────────────────────────────────────────── */}
          <motion.div
            className="text-center mb-10"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-6 h-6 text-primary-600" />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight"
            >
              {t('ai_planner.title')}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto px-4"
            >
              {t('ai_planner.desc1')}{t('ai_planner.desc2')}
            </motion.p>
          </motion.div>

          {/* ── Input Card ────────────────────────────────────────────────────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-10"
          >
            <div className="h-1 bg-gradient-to-r from-primary-400 via-purple-500 to-orange-400" />
            <div className="p-6 md:p-8">
              <form onSubmit={handleGenerate}>
                <div className="relative">
                  <textarea
                    className="w-full h-36 p-5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-base text-gray-700 bg-gray-50 focus:bg-white transition-all shadow-inner"
                    placeholder={t('ai_planner.placeholder')}
                    value={userStory}
                    onChange={(e) => setUserStory(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3">
                    <motion.button
                      type="submit"
                      disabled={isLoading || !userStory.trim()}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <motion.span
                            className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                          />
                          {t('ai_planner.thinking')}
                        </>
                      ) : (
                        <>{t('ai_planner.generate')} <Send className="w-3.5 h-3.5" /></>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>

              {/* Suggestions */}
              <AnimatePresence>
                {!hasSearched && (
                  <motion.div
                    className="mt-5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5" />
                      {t('ai_planner.try_prompts')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s, i) => (
                        <motion.button
                          key={i}
                          onClick={() => setUserStory(s)}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className="text-xs px-3.5 py-2 bg-white border border-gray-200 hover:border-primary-400 hover:bg-primary-50 rounded-xl transition-all text-gray-500 hover:text-primary-700"
                        >
                          "{s}"
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Results ───────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {hasSearched && (
              <motion.div
                key="results"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
              >

                {/* Left — Itinerary */}
                <motion.div variants={slideLeft} className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Map className="w-[18px] h-[18px] text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {t('ai_planner.your_itinerary')}
                    </h3>
                    {!isLoading && daySections.length > 0 && (
                      <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daySections.length} hari
                      </span>
                    )}
                  </div>

                  {isLoading ? (
                    <motion.div variants={stagger} className="space-y-3">
                      {[1, 2, 3].map(i => <SkeletonDayCard key={i} />)}
                    </motion.div>

                  ) : daySections.length > 0 ? (
                    <motion.div variants={stagger} className="space-y-3">
                      {daySections.map((s, i) => (
                        <DayCard key={i} section={s} index={i} />
                      ))}
                    </motion.div>

                  ) : rawItinerary ? (
                    /* Fallback prose jika AI tidak pakai heading Day N */
                    <motion.div
                      variants={fadeIn}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                    >
                      <div className="prose prose-sm prose-teal max-w-none text-gray-600 leading-relaxed">
                        <ReactMarkdown>{rawItinerary}</ReactMarkdown>
                      </div>
                    </motion.div>
                  ) : null}
                </motion.div>

                {/* Right — Recommended Products */}
                <motion.div variants={slideRight} className="lg:col-span-1">
                  <div className="sticky top-24 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-[18px] h-[18px] text-amber-400 fill-amber-400" />
                      <h3 className="text-base font-bold text-gray-900">
                        {t('ai_planner.recommended')}
                      </h3>
                    </div>

                    {isLoading ? (
                      <>
                        <SkeletonProductCard />
                        <SkeletonProductCard />
                        <SkeletonProductCard />
                      </>

                    ) : recommendedProducts.length > 0 ? (
                      <motion.div variants={stagger} className="space-y-3">
                        {recommendedProducts.map(p => (
                          <ProductCard key={p.id} product={p} langPath={langPath} />
                        ))}
                        <motion.div variants={fadeUp}>
                          <Link
                            to={langPath('/explore')}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-xs font-bold text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors mt-1"
                          >
                            Lihat semua paket <ArrowRight className="w-3 h-3" />
                          </Link>
                        </motion.div>
                      </motion.div>

                    ) : (
                      <motion.div
                        variants={fadeIn}
                        className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200"
                      >
                        <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {t('ai_planner.no_match')}{t('ai_planner.options')}
                        </p>
                        <Link
                          to={langPath('/explore')}
                          className="inline-block mt-3 text-primary-600 font-bold text-sm hover:underline"
                        >
                          {t('common.see_all')}
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
};

export default AITripPlanner;

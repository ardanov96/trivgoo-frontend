'use client';

import { ArrowRight, Brain, ChevronLeft, ChevronRight, Clock, Map, MapPin, Quote, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { useNavigate } from 'react-router-dom';
import {
  aiCardVariants, aiContainerVariants,
  ctaContainerVariants, ctaLeftVariants, ctaRightVariants, ctaBadgeVariants, ctaButtonVariants,
  destContainerVariants, destBubbleVariants,
  fadeUpVariants,
} from '../constants/variants';
import { DESTINATION_STORIES, ITINERARY_CARDS, PROMO_CARDS, REVIEWS, WHY_CHOOSE_US } from '../constants';

// ── AI Trip Planner ───────────────────────────────────────────────────────────

export const AiPlannerSection = () => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();

  const AI_CARDS = [
    { Icon: Brain,    titleKey: 'home.ai_card_0_title', descKey: 'home.ai_card_0_desc', titleFb: 'Smart Recommendations', descFb: "AI learns your preferences to suggest hidden gems you'll love." },
    { Icon: Clock,    titleKey: 'home.ai_card_1_title', descKey: 'home.ai_card_1_desc', titleFb: 'Time Optimization',     descFb: 'Maximize your holiday with efficiently planned routes and schedules.' },
    { Icon: Map,      titleKey: 'home.ai_card_2_title', descKey: 'home.ai_card_2_desc', titleFb: 'Interactive Maps',      descFb: 'Visualize your journey with integrated maps and navigation.' },
    { Icon: Sparkles, titleKey: 'home.ai_card_3_title', descKey: 'home.ai_card_3_desc', titleFb: 'Personalized For You',  descFb: 'Every itinerary is unique, tailored specifically to your travel style.' },
  ];

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={aiContainerVariants} className="bg-white py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
      <div className="absolute -left-20 top-40 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">
            {t('home.ai_badge', 'Future of Travel')}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            {t('home.ai_title', 'Smart AI Trip Planner')}
          </h2>
          <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
            {t('home.ai_subtitle', 'Leading AI technology that understands your preferences and creates the perfect itinerary according to your wishes and budget.')}
          </p>
        </div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {AI_CARDS.map(({ Icon, titleKey, descKey, titleFb, descFb }, i) => (
            <motion.div key={i} variants={aiCardVariants} whileHover="hover" className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 group text-center cursor-pointer relative will-change-transform">
              <motion.div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-100" whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.8 }}>
                <Icon className="w-8 h-8 text-primary-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t(titleKey, titleFb)}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t(descKey, descFb)}</p>
            </motion.div>
          ))}
        </motion.div>
        <div className="text-center">
          <Link to={langPath('/ai-planner')} className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-full font-bold text-lg shadow-xl shadow-primary-600/30 hover:bg-primary-700 transition-all hover:-translate-y-1 hover:shadow-2xl group active:scale-95">
            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
            {t('home.ai_try_free', 'Try AI Planner Free')}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ── Popular Destinations ──────────────────────────────────────────────────────

export const DestinationsSection = () => {
  const { langNavigate, langPath } = useLangNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative py-8 md:py-12 border-b border-gray-100 overflow-hidden">
      <div className="absolute inset-0 bg-[#FFEEEB]" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-400 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-300 rounded-full blur-3xl opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            {t('home.destinations_title', 'Popular Destinations')}
          </h2>
          <Link to={langPath('/explore')} className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center">
            {t('home.destinations_view_all', 'View All')} <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <motion.div variants={destContainerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-center justify-start md:justify-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible py-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar md:flex-nowrap">
          {DESTINATION_STORIES.map((dest, index) => (
            <motion.div key={index} variants={destBubbleVariants} whileHover={{ scale: 1.12, y: -6, transition: { type: 'spring', stiffness: 300 } }} onClick={() => langNavigate(`/explore?search=${dest.name}`)} className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
              <motion.div className="w-[70px] h-[70px] md:w-[84px] md:h-[84px] lg:w-[100px] lg:h-[100px] rounded-full p-[2px] md:p-[3px] bg-gradient-to-tr from-amber-400 via-orange-500 to-primary-600 relative" whileHover={{ boxShadow: '0 0 20px rgba(224,88,69,0.6)' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="absolute -inset-[3px] rounded-full border-2 border-dashed border-primary-400/40 pointer-events-none" />
                <div className="w-full h-full rounded-full border-[2px] md:border-[3px] border-white overflow-hidden bg-white relative z-10">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
              </motion.div>
              <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: index * 0.07 + 0.3 }} className="mt-3 text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors block">
                {dest.name}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// ── Itinerary + Promo Cards ───────────────────────────────────────────────────

interface ItinerarySectionProps { onReferralOpen: () => void; }

export const ItinerarySection = ({ onReferralOpen }: ItinerarySectionProps) => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUpVariants} className="bg-gray-50 py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(224,88,69,0.05),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(251,191,36,0.06),_transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
            {t('home.itinerary_title_1', 'Inspiration for Your')}<br className="hidden md:block" />
            {t('home.itinerary_title_2', 'Itinerary')}
          </h2>
        </div>

        {/* Itinerary slider */}
        <div className="relative group mb-12">
          <button onClick={() => document.getElementById('itinerary-slider')?.scrollBy({ left: -250, behavior: 'smooth' })} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-20 w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={() => document.getElementById('itinerary-slider')?.scrollBy({ left: 250, behavior: 'smooth' })} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-20 w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div id="itinerary-slider" className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
            {ITINERARY_CARDS.map((item, idx) => (
              <div key={item.id} className="min-w-[300px] md:min-w-[380px] flex-shrink-0 relative rounded-2xl overflow-hidden cursor-pointer group h-[160px] md:h-[180px]">
                <img src={item.image} alt={t(`home.itinerary_${idx}_title`, item.title)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(224,88,69,0.90) 0%, rgba(224,88,69,0.75) 35%, rgba(224,88,69,0.10) 50%, transparent 75%)' }} />
                <div className="relative z-10 h-full flex flex-col justify-between p-5">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${item.tagColor}`}>
                    {t(`home.itinerary_${idx}_tag`, item.tag)}
                  </span>
                  <div>
                    <h3 className="text-white font-bold text-lg md:text-xl leading-snug mb-1 drop-shadow-sm">
                      {t(`home.itinerary_${idx}_title`, item.title)}
                    </h3>
                    <p className="text-white/70 text-xs leading-relaxed">
                      {t(`home.itinerary_${idx}_duration`, item.duration)} · {t(`home.itinerary_${idx}_pax`, item.pax)}
                    </p>
                  </div>
                  <Link
                    to={langPath(`/explore?search=${encodeURIComponent(item.destination)}&category_id=1&from=itinerary`)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg w-fit hover:bg-primary-50 transition-colors shadow-md"
                  >
                    {t('home.itinerary_see_activities', 'See Activities')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROMO_CARDS.map((card, idx) => {
            const titleKey  = `home.promo_${card.id}_title`;
            const descKey   = `home.promo_${card.id}_desc`;
            const btnKey    = `home.promo_${card.id}_btn`;
            return (
              <div key={card.id} className={`relative rounded-3xl overflow-hidden border ${card.border} bg-gradient-to-br ${card.bg} group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center`}>
                <div className={`h-1.5 w-full ${card.accent}`} />
                <div className="p-8 flex flex-col flex-1 relative z-10 items-center w-full">
                  <div className="w-full flex justify-center mb-6 h-28 items-center">
                    <img src={card.promoImage} alt={t(titleKey, card.title)} className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${card.iconColor}`}>{card.id}</span>
                  <h3 className="font-serif font-bold text-2xl text-gray-900 leading-tight mb-4">{t(titleKey, card.title)}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1 max-w-[280px]">{t(descKey, card.description)}</p>
                  {card.id === 'referral'
                    ? <button onClick={onReferralOpen} className={`inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 group/btn w-full md:w-auto ${card.buttonStyle}`}>
                        {t(btnKey, card.buttonLabel)} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    : <Link to={langPath(card.buttonLink)} className={`inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 group/btn w-full md:w-auto ${card.buttonStyle}`}>
                        {t(btnKey, card.buttonLabel)} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// ── Why Choose Us ─────────────────────────────────────────────────────────────

export const WhyChooseUsSection = () => {
  const { t } = useTranslation();

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUpVariants} className="bg-white py-16 md:py-24 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-60" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
            {t('home.why_title', 'Why Choose Us')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE_US.map((card, idx) => (
            <div key={card.id} className={`relative rounded-3xl overflow-hidden border ${card.border} bg-gradient-to-br ${card.bg} group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center`}>
              <div className={`h-1.5 w-full ${card.accent}`} />
              <div className="p-6 flex flex-col flex-1 relative z-10 items-center w-full">
                <div className="w-full flex justify-center mb-6 h-40 items-center overflow-hidden">
                  <img src={card.promoImage} alt={t(`home.why_${idx}_title`, card.title)} className="h-full w-auto object-contain scale-110 group-hover:scale-125 transition-transform duration-500" />
                </div>
                <h3 className="font-serif font-bold text-xl text-gray-900 leading-tight mb-3">
                  {t(`home.why_${idx}_title`, card.title)}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-1">
                  {t(`home.why_${idx}_desc`, card.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ── Testimonials ──────────────────────────────────────────────────────────────

export const TestimonialsSection = () => {
  const { t } = useTranslation();

  return (
    <div className="py-20 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
            {t('home.testimonials_title', 'Stories from the Road')}
          </h2>
        </div>
      </div>
      <div className="relative z-10 space-y-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {(['marquee-left', 'marquee-right'] as const).map((dir, ri) => (
          <div key={ri} className={`flex gap-6 ${dir} w-max px-6`}>
            {[...REVIEWS, ...REVIEWS].map((review, index) => (
              <div key={`r${ri}-${index}`} className="w-[260px] bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:bg-gray-800/80 transition-colors flex-shrink-0 relative">
                <Quote className="w-6 h-6 text-primary-500 absolute top-4 right-4 opacity-40" />
                <div className="flex items-center mb-4">
                  <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full border-2 border-primary-500 mr-3" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{review.user}</h4>
                    <div className="flex text-amber-400 text-xs">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />)}</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic leading-relaxed line-clamp-4">"{review.text}"</p>
                <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide mt-4">
                  <MapPin className="w-3 h-3 mr-1 text-primary-500" />{review.location}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── App Download CTA ──────────────────────────────────────────────────────────

export const AppCtaSection = () => {
  const { t } = useTranslation();

  return (
    <motion.div className="relative bg-primary-600 py-24 px-4 overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={ctaContainerVariants}>
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-primary-400/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
        <motion.div variants={ctaLeftVariants} className="text-white max-w-xl text-center lg:text-left">
          <motion.div variants={ctaBadgeVariants} className="mb-4 flex flex-wrap gap-2 justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> {t('home.app_badge', 'App Exclusive')}
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            {t('home.app_title', 'Unlock App-Only Deals')}
          </h2>
          <p className="text-primary-100 text-lg md:text-xl mb-3">
            {t('home.app_subtitle', 'Save up to')} <span className="font-bold text-white">IDR 400.000</span> {t('common.on_first_transaction', 'on your first transaction.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            {[
              { src: 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg', alt: 'App Store', i: 0 },
              { src: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg', alt: 'Google Play', i: 1 },
            ].map(({ src, alt, i }) => (
              <motion.div key={alt} custom={i} variants={ctaButtonVariants} className="relative flex flex-col items-center gap-2 cursor-not-allowed select-none" title="Segera hadir">
                <span className="inline-flex items-center gap-1.5 bg-amber-400 text-black text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  <Clock className="w-3 h-3" /> {t('home.app_coming_soon', 'Coming Soon')}
                </span>
                <div className="flex items-center gap-4 bg-black px-6 py-4 rounded-2xl shadow-xl opacity-70">
                  <img src={src} alt={alt} className="h-8" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={ctaRightVariants} className="flex flex-col items-center">
          <motion.div className="bg-white p-8 rounded-[32px] shadow-2xl" whileHover={{ scale: 1.05, rotate: 1, boxShadow: '0 30px 60px rgba(0,0,0,0.25)', transition: { duration: 0.3 } }}>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://trivgoo.com/app" alt="QR Code Download Trivgoo App" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="flex items-center gap-2 mt-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-white text-sm uppercase tracking-widest font-semibold">
              {t('home.app_scan', 'Scan to download')}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

import {
  ArrowLeft, Search, HelpCircle, MessageCircle, Mail, Phone,
  BookOpen, CreditCard, MapPin, Calendar, Users, Shield,
  ChevronDown, ChevronUp, Clock, Globe, Headphones, Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../src/hooks/useLangNavigate';

interface FAQ {
  id: number;
  categoryKey: string; // slug statis, misal 'booking'
  question: string;
  answer: string;
}

const HelpCenter: React.FC = () => {
  const { t } = useTranslation();
  const { langPath } = useLangNavigate();

  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId,        setOpenFaqId]        = useState<number | null>(null);

  // ── Category config (slug → i18n key + icon) ──────────────────────────
  const CATEGORY_CONFIG = [
    { slug: 'all',      labelKey: 'help.cat_all',     icon: BookOpen   },
    { slug: 'booking',  labelKey: 'help.cat_booking',  icon: CreditCard },
    { slug: 'cancel',   labelKey: 'help.cat_cancel',   icon: Shield     },
    { slug: 'account',  labelKey: 'help.cat_account',  icon: Users      },
    { slug: 'travel',   labelKey: 'help.cat_travel',   icon: MapPin     },
    { slug: 'support',  labelKey: 'help.cat_support',  icon: Headphones },
  ] as const;

  // ── FAQ data (categoryKey = slug statis) ───────────────────────────────
  const FAQ_DATA: FAQ[] = [
    { id: 1,  categoryKey: 'booking', question: t('help.q1'),  answer: t('help.a1')  },
    { id: 2,  categoryKey: 'booking', question: t('help.q2'),  answer: t('help.a2')  },
    { id: 3,  categoryKey: 'booking', question: t('help.q3'),  answer: t('help.a3')  },
    { id: 4,  categoryKey: 'booking', question: t('help.q4'),  answer: t('help.a4')  },
    { id: 5,  categoryKey: 'cancel',  question: t('help.q5'),  answer: t('help.a5')  },
    { id: 6,  categoryKey: 'cancel',  question: t('help.q6'),  answer: t('help.a6')  },
    { id: 7,  categoryKey: 'cancel',  question: t('help.q7'),  answer: t('help.a7')  },
    { id: 8,  categoryKey: 'cancel',  question: t('help.q8'),  answer: t('help.a8')  },
    { id: 9,  categoryKey: 'account', question: t('help.q9'),  answer: t('help.a9')  },
    { id: 10, categoryKey: 'account', question: t('help.q10'), answer: t('help.a10') },
    { id: 11, categoryKey: 'account', question: t('help.q11'), answer: t('help.a11') },
    { id: 12, categoryKey: 'account', question: t('help.q12'), answer: t('help.a12') },
    { id: 13, categoryKey: 'travel',  question: t('help.q13'), answer: t('help.a13') },
    { id: 14, categoryKey: 'travel',  question: t('help.q14'), answer: t('help.a14') },
    { id: 15, categoryKey: 'travel',  question: t('help.q15'), answer: t('help.a15') },
    { id: 16, categoryKey: 'travel',  question: t('help.q16'), answer: t('help.a16') },
    { id: 17, categoryKey: 'support', question: t('help.q17'), answer: t('help.a17') },
    { id: 18, categoryKey: 'support', question: t('help.q18'), answer: t('help.a18') },
    { id: 19, categoryKey: 'support', question: t('help.q19'), answer: t('help.a19') },
    { id: 20, categoryKey: 'support', question: t('help.q20'), answer: t('help.a20') },
  ];

  const CONTACT_OPTIONS = [
    {
      id: 1, icon: MessageCircle,
      title:       t('help.live_chat',      'Live Chat'),
      description: t('help.live_chat_desc', 'Chat directly with our team'),
      action:      t('help.start_chat',     'Start Chat'),
      color: 'from-blue-500 to-blue-600',
      badge:       t('help.available_now',  'Available Now'),
      detail: null,
      link: 'https://wa.me/6282144443784',
    },
    {
      id: 2, icon: Mail,
      title:       'Email',
      description: t('help.email_desc',  'Response within 24 hours'),
      action:      t('help.send_email',  'Send Email'),
      color: 'from-purple-500 to-purple-600',
      badge: null,
      detail: 'cs@trivgoo.com',
      link: 'mailto:cs@trivgoo.com',
    },
    {
      id: 3, icon: Phone,
      title:       t('help.phone',     'Phone'),
      description: t('help.phone_desc','Talk directly with our team'),
      action:      t('help.call_now',  'Call Now'),
      color: 'from-green-500 to-green-600',
      badge: null,
      detail: '+62 821-4444-3784',
      link: 'tel:+6282144443784',
    },
    {
      id: 4, icon: Globe,
      title:       'WhatsApp',
      description: t('help.wa_desc',       'Fast response via WhatsApp'),
      action:      t('help.send_message',  'Send Message'),
      color: 'from-emerald-500 to-emerald-600',
      badge: null,
      detail: '+62 821-4444-3784',
      link: 'https://wa.me/6282144443784',
    },
  ];

  // ── Filter ─────────────────────────────────────────────────────────────
  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch   = faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || faq.categoryKey === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: number) => setOpenFaqId(openFaqId === id ? null : id);

  // ── Helper: get translated label for a FAQ's category ─────────────────
  const getCategoryLabel = (slug: string) => {
    const cat = CATEGORY_CONFIG.find((c) => c.slug === slug);
    return cat ? t(cat.labelKey) : slug;
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map(faq => ({
      "@type": "Question",
      "name": faq.question ? faq.question.replace(/<[^>]*>?/gm, '') : '',
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer ? faq.answer.replace(/<[^>]*>?/gm, '') : ''
      }
    }))
  };

  return (
    <>
      <SEO title="Help Center | Trivgoo" jsonLd={faqJsonLd} />
      <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div
        className="relative text-white py-20 md:py-32 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6b1a12 0%, #a83328 35%, #c34134 65%, #E05845 100%)' }}
      >
        <style>{`
          @keyframes hcGrid{0%{background-position:0 0}100%{background-position:40px 40px}}
          @keyframes hcGlow{0%,100%{opacity:.35}50%{opacity:.65}}
          @keyframes hcScan{0%{transform:translateY(0%);opacity:.12}50%{opacity:.25}100%{transform:translateY(100%);opacity:.12}}
          @keyframes hcFloat{0%{opacity:0;transform:translateY(32px)}100%{opacity:1;transform:translateY(0)}}
          @keyframes hcBadge{0%{opacity:0;transform:translateY(-12px)}100%{opacity:1;transform:translateY(0)}}
          @keyframes hcSearch{0%{opacity:0;transform:translateY(24px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}
          .hc-grid{animation:hcGrid 3s linear infinite}.hc-glow1{animation:hcGlow 5s ease-in-out infinite}
          .hc-glow2{animation:hcGlow 7s ease-in-out infinite 2s}.hc-scan{animation:hcScan 4s linear infinite}
          .hc-back{animation:hcFloat .6s cubic-bezier(.22,1,.36,1) both}.hc-badge{animation:hcBadge .6s cubic-bezier(.22,1,.36,1) .1s both}
          .hc-title{animation:hcFloat .9s cubic-bezier(.22,1,.36,1) .25s both}.hc-sub{animation:hcFloat .7s cubic-bezier(.22,1,.36,1) .4s both}
          .hc-srch{animation:hcSearch .8s cubic-bezier(.22,1,.36,1) .55s both}
        `}</style>

        {/* Background decorations */}
        <div className="hc-grid absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,220,200,0.18) 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
        <div className="hc-glow1 absolute pointer-events-none rounded-full"
          style={{ top: '-8%', right: '-4%', width: 440, height: 440, background: 'radial-gradient(circle, rgba(255,200,150,0.18) 0%, transparent 70%)' }} />
        <div className="hc-glow2 absolute pointer-events-none rounded-full"
          style={{ bottom: '-12%', left: '-6%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div className="hc-scan absolute inset-x-0 pointer-events-none"
          style={{ height: 3, top: 0, background: 'linear-gradient(90deg,transparent,rgba(255,200,180,0.35),transparent)' }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to={langPath('/')}
            className="hc-back inline-flex items-center text-red-200 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">{t('help.back_home', 'Back to Home')}</span>
          </Link>

          <div className="hc-badge flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <HelpCircle className="w-6 h-6 text-red-100" />
            </div>
            <span className="text-red-200 text-xs font-bold uppercase tracking-[0.2em]">
              {t('help.badge', 'Help Center · Trivgoo')}
            </span>
          </div>

          <h1 className="hc-title text-4xl md:text-6xl font-serif font-bold mb-5 leading-tight">
            {t('help.title', 'Help Center')}
          </h1>
          <p className="hc-sub text-xl text-red-100 max-w-3xl leading-relaxed mb-10">
            {t('help.subtitle', 'Find answers to common questions or contact our support team.')}
          </p>

          <div className="hc-srch max-w-3xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('help.search_placeholder', 'Search help articles, FAQs, or topics...')}
                className="w-full pl-16 pr-6 py-5 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20 text-lg shadow-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            {t('help.browse_by_category', 'Browse by Category')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORY_CONFIG.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-primary-600'}`} />
                  {t(cat.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">

          {/* FAQ list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                {t('help.faq_title', 'Frequently Asked Questions')}
              </h2>
              <span className="text-sm text-gray-500 font-semibold">
                {filteredFAQs.length} {t('help.results', 'results')}
              </span>
            </div>

            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary-300 transition-colors">
                      <button onClick={() => toggleFaq(faq.id)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left">
                        <div className="flex-1 pr-4">
                          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full mb-2">
                            {getCategoryLabel(faq.categoryKey)}
                          </span>
                          <h3 className="text-base font-bold text-gray-900">{faq.question}</h3>
                        </div>
                        {isOpen
                          ? <ChevronUp   className="w-5 h-5 text-primary-600 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-gray-400    flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-2 border-t border-gray-100">
                          <p className="text-gray-700 leading-relaxed text-sm">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('explore.no_results', 'No results found')}
                </h3>
                <p className="text-gray-600">
                  {t('help.no_results_desc', 'Try adjusting your search or browse categories above.')}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl p-8 text-white sticky top-8"
              style={{ background: 'linear-gradient(135deg,#6b1a12 0%,#c34134 100%)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{t('help.need_more_help', 'Need More Help?')}</h3>
              </div>
              <p className="text-red-100 mb-6 leading-relaxed">
                {t('help.not_found_desc', "Can't find what you're looking for? Our support team is ready to help.")}
              </p>
              <div className="space-y-3 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-red-200" />
                    <span className="font-bold text-sm">{t('help.service_hours', 'Service Hours')}</span>
                  </div>
                  <p className="text-sm text-red-100">
                    {t('help.weekday_hours', 'Mon-Fri: 09:00–18:00 WIB')}<br />
                    {t('help.weekend_hours', 'Sat: 09:00–15:00 WIB')}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-red-200" />
                    <span className="font-bold text-sm">{t('help.emergency_24_7', 'Emergency 24/7')}</span>
                  </div>
                  <p className="text-sm text-red-100">
                    {t('help.emergency_desc', 'For travelers on active trips')}
                  </p>
                </div>
              </div>
              <Link to={langPath('/contact-us')}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl">
                {t('help.contact_support', 'Contact Support')}
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              {t('contact.title', 'Contact Us')}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('help.contact_desc', 'Choose the most convenient way to reach our support team')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTACT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isExternal = !opt.link.startsWith('mailto') && !opt.link.startsWith('tel');
              return (
                <div key={opt.id}
                  className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${opt.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{opt.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{opt.description}</p>
                  {opt.badge  && <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-4">{opt.badge}</span>}
                  {opt.detail && <p className="text-sm text-gray-500 mb-4">{opt.detail}</p>}
                  
                  <a  href={opt.link}
                    target={isExternal ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all text-center block text-sm"
                  >
                    {opt.action}
                  </a>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
    </>
  );
};

export default HelpCenter;
import { ArrowLeft, ChevronRight, FileText } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { Link } from 'react-router-dom';

const TermAndService: React.FC = () => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('tentang');

  // ── Sections (label dari i18n) ─────────────────────────────────────────
  const SECTIONS = [
    { id: 'tentang',          labelKey: 'terms.nav_tentang'          },
    { id: 'acceptance',       labelKey: 'terms.nav_acceptance'       },
    { id: 'services',         labelKey: 'terms.nav_services'         },
    { id: 'user-obligations', labelKey: 'terms.nav_user_obligations' },
    { id: 'booking',          labelKey: 'terms.nav_booking'          },
    { id: 'pricing',          labelKey: 'terms.nav_pricing'          },
    { id: 'payment-methods',  labelKey: 'terms.nav_payment_methods'  },
    { id: 'cancellation',     labelKey: 'terms.nav_cancellation'     },
    { id: 'liability',        labelKey: 'terms.nav_liability'        },
    { id: 'privacy',          labelKey: 'terms.nav_privacy'          },
    { id: 'changes',          labelKey: 'terms.nav_changes'          },
    { id: 'contact',          labelKey: 'terms.nav_contact'          },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Animated Hero ── */}
      <div
        className="relative text-white py-20 md:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6b1a12 0%, #a83328 35%, #c34134 65%, #E05845 100%)' }}
      >
        <style>{`
          @keyframes gridScroll2 { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
          @keyframes glowPulse2  { 0%,100% { opacity:.35; } 50% { opacity:.65; } }
          @keyframes scanLine2   { 0% { transform:translateY(0%); opacity:.12; } 50% { opacity:.25; } 100% { transform:translateY(100%); opacity:.12; } }
          @keyframes floatIn2    { 0% { opacity:0; transform:translateY(32px); } 100% { opacity:1; transform:translateY(0); } }
          @keyframes badgeIn2    { 0% { opacity:0; transform:translateY(-12px); } 100% { opacity:1; transform:translateY(0); } }
          @keyframes routeGlow   { 0%,100%{opacity:.2;} 50%{opacity:.45;} }
          .ts-grid  { animation: gridScroll2 3s linear infinite; }
          .ts-glow1 { animation: glowPulse2 5s ease-in-out infinite; }
          .ts-glow2 { animation: glowPulse2 7s ease-in-out infinite 2.5s; }
          .ts-glow3 { animation: glowPulse2 6s ease-in-out infinite 1s; }
          .ts-scan  { animation: scanLine2 4s linear infinite; }
          .ts-title { animation: floatIn2 .9s cubic-bezier(.22,1,.36,1) .3s both; }
          .ts-badge { animation: badgeIn2 .6s cubic-bezier(.22,1,.36,1) .1s both; }
          .ts-meta  { animation: floatIn2 .7s cubic-bezier(.22,1,.36,1) .55s both; }
          .ts-back  { animation: floatIn2 .6s cubic-bezier(.22,1,.36,1) 0s both; }
          .ts-route { animation: routeGlow 4s ease-in-out infinite; }
        `}</style>

        {/* Animated dot grid */}
        <div className="ts-grid absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,220,200,0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Glow blobs */}
        <div className="ts-glow1 absolute pointer-events-none rounded-full" style={{ top: '-10%', right: '-6%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(255,200,150,0.16) 0%, transparent 70%)' }} />
        <div className="ts-glow2 absolute pointer-events-none rounded-full" style={{ bottom: '-15%', left: '-8%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 70%)' }} />
        <div className="ts-glow3 absolute pointer-events-none rounded-full" style={{ top: '35%', right: '25%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)' }} />

        {/* SVG dashed routes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path className="ts-route" d="M 90% 90% Q 60% 20% 10% 40%" fill="none" stroke="rgba(255,220,200,0.3)" strokeWidth="1.5" strokeDasharray="8 6" />
          <path className="ts-route" d="M 80% 10% Q 45% 60% 5% 70%" fill="none" stroke="rgba(255,200,150,0.2)" strokeWidth="1" strokeDasharray="6 5" style={{ animationDelay: '1s' }} />
          <path className="ts-route" d="M 50% 95% Q 70% 40% 95% 25%" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="5 4" style={{ animationDelay: '2s' }} />
          <circle cx="10%" cy="40%" r="3" fill="rgba(255,220,200,0.5)" style={{ animation: 'glowPulse2 3s ease-in-out infinite' }} />
          <circle cx="90%" cy="90%" r="2.5" fill="rgba(251,191,36,0.6)" style={{ animation: 'glowPulse2 4s ease-in-out infinite .5s' }} />
          <circle cx="80%" cy="10%" r="2" fill="rgba(255,200,150,0.5)" style={{ animation: 'glowPulse2 5s ease-in-out infinite 1s' }} />
        </svg>

        {/* Scan line */}
        <div className="ts-scan absolute inset-x-0 pointer-events-none" style={{ height: 3, top: 0, background: 'linear-gradient(90deg, transparent, rgba(255,200,180,0.35), transparent)' }} />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(80,15,5,0.35))' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={langPath('/')} className="ts-back inline-flex items-center text-red-200 hover:text-white text-sm mb-8 group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('terms.back_home', 'Back to Home')}
          </Link>

          <div className="ts-badge flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <FileText className="w-5 h-5 text-red-100" />
            </div>
            <span className="text-red-200 text-xs font-bold uppercase tracking-[0.2em]">
              {t('terms.badge', 'Legal · Trivgoo')}
            </span>
          </div>

          <h1 className="ts-title text-4xl md:text-6xl font-serif font-bold leading-tight mb-4">
            {t('terms.title', 'Terms and Service')}
          </h1>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-10">

          {/* Sidebar nav */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">
                {t('terms.on_this_page', 'ON THIS PAGE')}
              </p>
              <nav className="space-y-0.5">
                {SECTIONS.map((s) => {
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`w-full text-left flex items-start gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${
                        isActive
                          ? 'text-primary-600 font-bold bg-primary-50'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />}
                      <span className={isActive ? '' : 'pl-3.5'}>{t(s.labelKey)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Article */}
          <article className="flex-1 min-w-0 prose prose-gray max-w-none">

            {/* 0 — Intro */}
            <section id="tentang" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.tentang_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.tentang_p1')}</p>
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.tentang_p2')}</p>
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.tentang_p3')}</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm pl-2">
                {([1,2,3,4,5,6,7,8,9] as const).map((n) => (
                  <li key={n}>{t(`terms.tentang_list_${n}`)}</li>
                ))}
              </ol>
            </section>

            {/* 1 — Acceptance */}
            <section id="acceptance" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.acceptance_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.acceptance_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>{t('terms.acceptance_li1')}</li>
                <li>{t('terms.acceptance_li2')}</li>
                <li>{t('terms.acceptance_li3')}</li>
                <li>{t('terms.acceptance_li4')}</li>
              </ul>
            </section>

            {/* 2 — Services */}
            <section id="services" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.services_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.services_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li><strong>{t('terms.services_li1_label')}</strong> {t('terms.services_li1_desc')}</li>
                <li><strong>{t('terms.services_li2_label')}</strong> {t('terms.services_li2_desc')}</li>
                <li><strong>{t('terms.services_li3_label')}</strong> {t('terms.services_li3_desc')}</li>
                <li><strong>{t('terms.services_li4_label')}</strong> {t('terms.services_li4_desc')}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>{t('terms.services_note_label')}</strong> {t('terms.services_note_desc')}
              </p>
            </section>

            {/* 3 — User Obligations */}
            <section id="user-obligations" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.obligations_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.obligations_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>{t('terms.obligations_li1')}</li>
                <li>{t('terms.obligations_li2')}</li>
                <li>{t('terms.obligations_li3')}</li>
                <li>{t('terms.obligations_li4')}</li>
                <li>{t('terms.obligations_li5')}</li>
                <li>{t('terms.obligations_li6')}</li>
                <li>{t('terms.obligations_li7')}</li>
              </ul>
            </section>

            {/* 4 — Booking */}
            <section id="booking" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.booking_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.booking_p1')}</p>
              <p className="text-gray-700 leading-relaxed">{t('terms.booking_p2')}</p>
            </section>

            {/* 4a — Pricing (sub-section) */}
            <section id="pricing" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('terms.pricing_title')}</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.pricing_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>{t('terms.pricing_li1')}</li>
                <li>{t('terms.pricing_li2')}</li>
                <li>{t('terms.pricing_li3')}</li>
              </ul>
            </section>

            {/* 4b — Payment Methods (sub-section) */}
            <section id="payment-methods" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('terms.payment_title')}</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.payment_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>{t('terms.payment_li1')}</li>
                <li>{t('terms.payment_li2')}</li>
                <li>{t('terms.payment_li3')}</li>
                <li>{t('terms.payment_li4')}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">{t('terms.payment_p2')}</p>
            </section>

            {/* 5 — Cancellation */}
            <section id="cancellation" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.cancellation_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.cancellation_p1')}</p>
              <p className="text-gray-700 leading-relaxed mb-4 font-medium">{t('terms.cancellation_p2')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2 mb-4">
                <li><strong>{t('terms.cancellation_li1_label')}</strong> {t('terms.cancellation_li1_desc')}</li>
                <li><strong>{t('terms.cancellation_li2_label')}</strong> {t('terms.cancellation_li2_desc')}</li>
                <li><strong>{t('terms.cancellation_li3_label')}</strong> {t('terms.cancellation_li3_desc')}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">{t('terms.cancellation_p3')}</p>
            </section>

            {/* 6 — Liability */}
            <section id="liability" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.liability_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.liability_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2 mb-4">
                <li>{t('terms.liability_li1')}</li>
                <li>{t('terms.liability_li2')}</li>
                <li>{t('terms.liability_li3')}</li>
                <li>{t('terms.liability_li4')}</li>
                <li>{t('terms.liability_li5')}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">{t('terms.liability_p2')}</p>
            </section>

            {/* 7 — Privacy */}
            <section id="privacy" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.privacy_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.privacy_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2 mb-4">
                <li>{t('terms.privacy_li1')}</li>
                <li>{t('terms.privacy_li2')}</li>
                <li>{t('terms.privacy_li3')}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.privacy_p2')}{' '}
                <Link to={langPath('/privacy-policy')} className="text-primary-600 hover:underline font-medium">
                  {t('terms.privacy_policy_link')}
                </Link>{' '}
                {t('terms.privacy_p2_suffix')}
              </p>
            </section>

            {/* 8 — Changes */}
            <section id="changes" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.changes_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.changes_p1')}</p>
              <p className="text-gray-700 leading-relaxed">{t('terms.changes_p2')}</p>
            </section>

            {/* 9 — Contact */}
            <section id="contact" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('terms.contact_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('terms.contact_p1')}</p>
              <ul className="list-none space-y-2 text-gray-700 text-sm pl-2">
                <li>📧 Email: <a href="mailto:cs@trivgoo.com" className="text-primary-600 hover:underline font-medium">cs@trivgoo.com</a></li>
                <li>💬 WhatsApp: <a href="https://wa.me/6282144443784" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">+62 821-4444-3784</a></li>
              </ul>
            </section>

          </article>
        </div>
      </div>
    </div>
  );
};

export default TermAndService;
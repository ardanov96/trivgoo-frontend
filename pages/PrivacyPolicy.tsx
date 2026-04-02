import { ArrowLeft, ChevronRight, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('tentang');

  // ── Sections (slug statis + i18n key) ─────────────────────────────────
  const SECTIONS = [
    { id: 'tentang',             labelKey: 'privacy.nav_tentang'       },
    { id: 'data-pribadi',        labelKey: 'privacy.nav_data_pribadi'  },
    { id: 'pembuatan-akun',      labelKey: 'privacy.nav_pembuatan_akun'},
    { id: 'transaksi',           labelKey: 'privacy.nav_transaksi'     },
    { id: 'informasi-biometrik', labelKey: 'privacy.nav_biometrik'     },
    { id: 'pihak-ketiga',        labelKey: 'privacy.nav_pihak_ketiga'  },
    { id: 'karier',              labelKey: 'privacy.nav_karier'        },
    { id: 'data-teknis',         labelKey: 'privacy.nav_data_teknis'   },
    { id: 'cara-kami',           labelKey: 'privacy.nav_cara_kami'     },
    { id: 'tujuan',              labelKey: 'privacy.nav_tujuan'        },
    { id: 'transfer',            labelKey: 'privacy.nav_transfer'      },
    { id: 'hak-pemilik',         labelKey: 'privacy.nav_hak_pemilik'   },
    { id: 'portabilitas',        labelKey: 'privacy.nav_portabilitas'  },
    { id: 'perhatian',           labelKey: 'privacy.nav_perhatian'     },
    { id: 'hukum',               labelKey: 'privacy.nav_hukum'         },
    { id: 'bahasa',              labelKey: 'privacy.nav_bahasa'        },
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
    <>
      <SEO title="Privacy Policy | Trivgoo" />
      <div className="min-h-screen bg-white">

      {/* ── Animated Hero ── */}
      <div
        className="relative text-white py-20 md:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6b1a12 0%, #a83328 35%, #c34134 65%, #E05845 100%)' }}
      >
        <style>{`
          @keyframes gridScroll { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
          @keyframes glowPulse  { 0%,100% { opacity:.35; } 50% { opacity:.65; } }
          @keyframes scanLine   { 0% { transform:translateY(0%); opacity:.12; } 50% { opacity:.25; } 100% { transform:translateY(100%); opacity:.12; } }
          @keyframes floatIn    { 0% { opacity:0; transform:translateY(32px); } 100% { opacity:1; transform:translateY(0); } }
          @keyframes badgeIn    { 0% { opacity:0; transform:translateY(-12px); } 100% { opacity:1; transform:translateY(0); } }
          .hero-grid  { animation: gridScroll 3s linear infinite; }
          .hero-glow1 { animation: glowPulse 5s ease-in-out infinite; }
          .hero-glow2 { animation: glowPulse 7s ease-in-out infinite 2s; }
          .hero-scan  { animation: scanLine 4s linear infinite; }
          .hero-title { animation: floatIn .9s cubic-bezier(.22,1,.36,1) .3s both; }
          .hero-badge { animation: badgeIn .6s cubic-bezier(.22,1,.36,1) .1s both; }
          .hero-meta  { animation: floatIn .7s cubic-bezier(.22,1,.36,1) .55s both; }
          .hero-back  { animation: floatIn .6s cubic-bezier(.22,1,.36,1) 0s both; }
        `}</style>

        {/* Animated dot grid */}
        <div className="hero-grid absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,220,200,0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Glow blobs */}
        <div className="hero-glow1 absolute pointer-events-none rounded-full" style={{ top: '-8%', right: '-4%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(255,200,150,0.18) 0%, transparent 70%)' }} />
        <div className="hero-glow2 absolute pointer-events-none rounded-full" style={{ bottom: '-12%', left: '-6%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div className="hero-glow1 absolute pointer-events-none rounded-full" style={{ top: '40%', left: '30%', width: 260, height: 260, background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)', animationDelay: '1s' }} />

        {/* SVG dashed flight routes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M 5% 80% Q 40% 10% 80% 30%" fill="none" stroke="rgba(255,220,200,0.25)" strokeWidth="1.5" strokeDasharray="8 6" />
          <path d="M 15% 60% Q 55% 5% 90% 50%" fill="none" stroke="rgba(255,200,150,0.15)" strokeWidth="1" strokeDasharray="6 5" />
          <path d="M 0% 40% Q 50% 70% 95% 20%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5 4" />
        </svg>

        {/* Scan line */}
        <div className="hero-scan absolute inset-x-0 pointer-events-none" style={{ height: 3, top: 0, background: 'linear-gradient(90deg, transparent, rgba(255,200,180,0.35), transparent)' }} />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(80,15,5,0.35))' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={langPath('/')} className="hero-back inline-flex items-center text-red-200 hover:text-white text-sm mb-8 group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('privacy.back_home', 'Back to Home')}
          </Link>

          <div className="hero-badge flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Shield className="w-5 h-5 text-red-100" />
            </div>
            <span className="text-red-200 text-xs font-bold uppercase tracking-[0.2em]">
              {t('privacy.badge', 'Legal · Trivgoo')}
            </span>
          </div>

          <h1 className="hero-title text-4xl md:text-6xl font-serif font-bold leading-tight mb-4">
            {t('privacy.title', 'Privacy Policy')}
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
                {t('privacy.on_this_page', 'ON THIS PAGE')}
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

            {/* 0 — Privacy Notice intro */}
            <section id="tentang" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.tentang_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.tentang_p1')}</p>
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.tentang_p2')}</p>
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.tentang_p3')}</p>
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.tentang_p4')}</p>
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.tentang_p5')}</p>
              <p className="text-gray-700 leading-relaxed mb-2 font-medium">{t('privacy.tentang_p6')}</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm pl-2">
                {([1,2,3,4,5,6,7,8,9,10,11,12] as const).map((n) => (
                  <li key={n}>{t(`privacy.tentang_list_${n}`)}</li>
                ))}
              </ol>
            </section>

            {/* 1 — Data Pribadi */}
            <section id="data-pribadi" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.data_pribadi_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.data_pribadi_p1')}</p>
              <p className="text-gray-700 leading-relaxed">{t('privacy.data_pribadi_p2')}</p>
            </section>

            {/* 1a — Pembuatan Akun */}
            <section id="pembuatan-akun" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('privacy.akun_title')}</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.akun_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>{t('privacy.akun_li1')}</li>
                <li>{t('privacy.akun_li2')}</li>
                <li>{t('privacy.akun_li3')}</li>
                <li>{t('privacy.akun_li4')}</li>
                <li>{t('privacy.akun_li5')}</li>
              </ul>
            </section>

            {/* 1b — Transaksi */}
            <section id="transaksi" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('privacy.transaksi_title')}</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.transaksi_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>{t('privacy.transaksi_li1')}</li>
                <li>{t('privacy.transaksi_li2')}</li>
                <li>{t('privacy.transaksi_li3')}</li>
                <li>{t('privacy.transaksi_li4')}</li>
              </ul>
            </section>

            {/* 1c — Biometrik */}
            <section id="informasi-biometrik" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('privacy.biometrik_title')}</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed">{t('privacy.biometrik_p1')}</p>
            </section>

            {/* 1d — Pihak Ketiga */}
            <section id="pihak-ketiga" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('privacy.pihak_ketiga_title')}</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.pihak_ketiga_p1')}</p>
              <p className="text-gray-700 leading-relaxed">{t('privacy.pihak_ketiga_p2')}</p>
            </section>

            {/* 1e — Karier */}
            <section id="karier" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('privacy.karier_title')}</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed">{t('privacy.karier_p1')}</p>
            </section>

            {/* 1f — Data Teknis */}
            <section id="data-teknis" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('privacy.teknis_title')}</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.teknis_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>{t('privacy.teknis_li1')}</li>
                <li>{t('privacy.teknis_li2')}</li>
                <li>{t('privacy.teknis_li3')}</li>
                <li>{t('privacy.teknis_li4')}</li>
                <li>{t('privacy.teknis_li5')}</li>
                <li>{t('privacy.teknis_li6')}</li>
              </ul>
            </section>

            {/* 2 — Cara Kami */}
            <section id="cara-kami" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.cara_kami_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.cara_kami_p1')}</p>
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.cara_kami_p2')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>{t('privacy.cara_kami_li1')}</li>
                <li>{t('privacy.cara_kami_li2')}</li>
                <li>{t('privacy.cara_kami_li3')}</li>
                <li>{t('privacy.cara_kami_li4')}</li>
                <li>{t('privacy.cara_kami_li5')}</li>
                <li>{t('privacy.cara_kami_li6')}</li>
                <li>{t('privacy.cara_kami_li7')}</li>
              </ul>
            </section>

            {/* 3 — Tujuan */}
            <section id="tujuan" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.tujuan_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.tujuan_p1')}</p>
              <p className="text-gray-700 leading-relaxed">{t('privacy.tujuan_p2')}</p>
            </section>

            {/* 4 — Transfer */}
            <section id="transfer" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.transfer_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.transfer_p1')}</p>
              <p className="text-gray-700 leading-relaxed">{t('privacy.transfer_p2')}</p>
            </section>

            {/* 5 — Hak Pemilik */}
            <section id="hak-pemilik" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.hak_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.hak_p1')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li><strong>{t('privacy.hak_li1_label')}</strong> {t('privacy.hak_li1_desc')}</li>
                <li><strong>{t('privacy.hak_li2_label')}</strong> {t('privacy.hak_li2_desc')}</li>
                <li><strong>{t('privacy.hak_li3_label')}</strong> {t('privacy.hak_li3_desc')}</li>
                <li><strong>{t('privacy.hak_li4_label')}</strong> {t('privacy.hak_li4_desc')}</li>
                <li><strong>{t('privacy.hak_li5_label')}</strong> {t('privacy.hak_li5_desc')}</li>
                <li><strong>{t('privacy.hak_li6_label')}</strong> {t('privacy.hak_li6_desc')}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                {t('privacy.hak_p2')}{' '}
                <a href="mailto:cs@trivgoo.com" className="text-primary-600 hover:underline font-medium">
                  cs@trivgoo.com
                </a>.
              </p>
            </section>

            {/* 6 — Portabilitas */}
            <section id="portabilitas" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.portabilitas_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed">
                {t('privacy.portabilitas_p1')}{' '}
                <a href="mailto:cs@trivgoo.com" className="text-primary-600 hover:underline font-medium">
                  cs@trivgoo.com
                </a>.
              </p>
            </section>

            {/* 7 — Perhatian & Keluhan */}
            <section id="perhatian" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.perhatian_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.perhatian_p1')}</p>
              <ul className="list-none space-y-2 text-gray-700 text-sm pl-2">
                <li>📧 Email: <a href="mailto:cs@trivgoo.com" className="text-primary-600 hover:underline font-medium">cs@trivgoo.com</a></li>
                <li>💬 WhatsApp: <a href="https://wa.me/6282144443784" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">+62 821-4444-3784</a></li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">{t('privacy.perhatian_p2')}</p>
            </section>

            {/* 8 — Hukum */}
            <section id="hukum" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.hukum_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.hukum_p1')}</p>
              <p className="text-gray-700 leading-relaxed">{t('privacy.hukum_p2')}</p>
            </section>

            {/* 9 — Bahasa */}
            <section id="bahasa" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{t('privacy.bahasa_title')}</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed">{t('privacy.bahasa_p1')}</p>
            </section>

          </article>
        </div>
      </div>
    </div>
    </>
  );
};

export default PrivacyPolicy;
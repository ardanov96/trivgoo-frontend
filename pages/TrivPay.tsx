import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Wallet, FileText, Camera, Star, ShieldCheck, Smartphone, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const TrivPay: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white">

      {/* ── HERO BANNER ── */}
      <section className="bg-[#FFF0EE] pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden relative">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-600 leading-tight mb-4">
                {t('trivpay.hero_title')}
              </h1>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                {t('trivpay.hero_desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-95">
                  <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-7" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-95">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-7" />
                </a>
              </div>
            </motion.div>

            {/* Right – Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="flex-1 flex justify-center md:justify-end"
            >
              <img src="/homepage-asset/card2.png" alt="TrivPay Wallet Illustration" className="w-72 md:w-96 object-contain drop-shadow-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS TRIVPAY ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
              {t('trivpay.what_title')}
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex-1">
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                {t('trivpay.what_desc')}
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Wallet,   text: t('trivpay.item_balance') },
                  { icon: FileText, text: t('trivpay.item_docs') },
                  { icon: Camera,   text: t('trivpay.item_photos') },
                  { icon: Star,     text: t('trivpay.item_points') },
                ].map(({ icon: Icon, text }, i) => (
                  <motion.li key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="flex-1 flex justify-center">
              <img src="/homepage-asset/card2.png" alt="TrivPay Features" className="w-72 md:w-80 object-contain drop-shadow-lg" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES ── */}
      <section className="py-16 md:py-24 bg-[#FFF0EE] relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              {t('trivpay.features_title')}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              {t('trivpay.features_desc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wallet,   title: t('trivpay.feat_balance'),   desc: t('trivpay.feat_balance_desc'),   color: 'bg-rose-50',   iconColor: 'text-primary-600' },
              { icon: FileText, title: t('trivpay.feat_docs'),      desc: t('trivpay.feat_docs_desc'),      color: 'bg-amber-50',  iconColor: 'text-amber-600'   },
              { icon: Camera,   title: t('trivpay.feat_memories'),  desc: t('trivpay.feat_memories_desc'),  color: 'bg-blue-50',   iconColor: 'text-blue-600'    },
              { icon: Star,     title: t('trivpay.feat_points'),    desc: t('trivpay.feat_points_desc'),    color: 'bg-green-50',  iconColor: 'text-green-600'   },
            ].map(({ icon: Icon, title, desc, color, iconColor }, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-white rounded-3xl p-7 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TRIVPOINTS WORK ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              {t('trivpay.points_title')}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              {t('trivpay.points_desc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: ShieldCheck, title: t('trivpay.step1_title'), desc: t('trivpay.step1_desc') },
              { step: '02', icon: Star,        title: t('trivpay.step2_title'), desc: t('trivpay.step2_desc') },
              { step: '03', icon: Gift,        title: t('trivpay.step3_title'), desc: t('trivpay.step3_desc') },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 border border-gray-100">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                  {t('trivpay.step')} {step}
                </span>
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-5 mt-3">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-serif font-bold text-xl text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-primary-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD CTA ── */}
      <section className="relative bg-primary-600 py-20 px-4 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary-400/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-white max-w-xl text-center lg:text-left">
            <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
              <Smartphone className="w-5 h-5 text-primary-200" />
              <span className="text-primary-200 font-bold text-sm uppercase tracking-widest">
                {t('trivpay.download_now')}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-5 leading-tight">
              {t('trivpay.cta_title')}
            </h2>
            <p className="text-primary-100 text-base mb-8">
              {t('trivpay.cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#" className="flex items-center justify-center bg-black px-6 py-3.5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-8" />
              </a>
              <a href="#" className="flex items-center justify-center bg-black px-6 py-3.5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8" />
              </a>
            </div>
          </motion.div>

          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white p-6 rounded-[28px] shadow-2xl">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://trivgoo.com/app"
                alt="QR Code TrivPay"
                className="w-44 h-44 object-contain"
              />
            </div>
            <span className="text-white mt-4 text-xs uppercase tracking-widest font-semibold">
              {t('trivpay.scan_to_download')}
            </span>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default TrivPay;

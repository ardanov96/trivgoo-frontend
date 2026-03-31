import { CheckCircle, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { fadeLeft, fadeRight, fadeUp, scaleIn, staggerContainer, EASE, STATS, ABOUT_BADGES } from '../constants';

// ── About Company ─────────────────────────────────────────────────────────────

interface AboutProps { inView: boolean; }

export const AboutSection = React.forwardRef<HTMLDivElement, AboutProps>(({ inView }, ref) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white py-20 md:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <motion.div variants={fadeLeft} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              {t('about.about_title', 'Lebih dari Sekadar Platform Perjalanan')}
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {t('about.about_desc_1', 'PT Trivgoo Global Nusantara hadir sebagai mitra perjalanan terpercaya yang mengintegrasikan kemudahan teknologi dengan sentuhan Artificial Intelligence. Berkomitmen untuk menyederhanakan setiap perjalanan, baik untuk urusan personal, bisnis, rekreasi, dan ibadah, kami menghadirkan solusi lengkap.')}
            </p>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {t('about.about_desc_2_start', 'Trivgoo adalah platform travel berbasis AI yang tidak hanya menjual tiket dan hotel, tetapi menjadi ')}
              <strong className="text-primary-700">
                {t('about.personal_travel_experience', 'personal travel experience')}
              </strong>
              {t('about.about_desc_2_end', '. Berbeda dengan kompetitor yang berfokus pada transaksi, Trivgoo berfokus pada pengalaman perjalanan yang dipersonalisasi secara mendalam berdasarkan kepribadian, minat, dan kebutuhan pengguna.')}
            </p>
            <motion.div className="flex flex-wrap gap-4" variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
              {ABOUT_BADGES.map((item, index) => (
                <motion.div key={index} variants={fadeUp} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium text-gray-700">
                    {t(`about.badge_${index}`, item)}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="relative" variants={fadeRight} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <div className="bg-gradient-to-br from-primary-50 to-teal-50 rounded-3xl p-8 shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?auto=format&fit=crop&w=800&q=80" 
                alt={t('about.travel_experience_image_alt', 'Travel Experience')} 
                className="rounded-2xl shadow-lg w-full h-auto" 
              />
              <motion.div
                className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-2xl w-64"
                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-primary-100 rounded-lg mr-3">
                    <Globe className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {t('about.countries_count', '8 Negara')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('about.countries_region', 'Asia Tenggara & Timur Tengah')}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

AboutSection.displayName = 'AboutSection';

// ── Stats ─────────────────────────────────────────────────────────────────────

interface StatsProps { inView: boolean; }

export const StatsSection = React.forwardRef<HTMLDivElement, StatsProps>(({ inView }, ref) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8" variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} className="text-center" variants={scaleIn} custom={index}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-100 font-medium">
                  {t(`about.stat_${index}`, stat.label)}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
});

StatsSection.displayName = 'StatsSection';
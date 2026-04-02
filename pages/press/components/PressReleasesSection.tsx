import { ArrowRight, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { fadeUp, fadeLeft, fadeRight, stagger, PRESS_RELEASES, getCategoryColorClass, getCategoryKey } from '../constants';

interface Props { inView: boolean; }

export const PressReleasesSection = React.forwardRef<HTMLDivElement, Props>(({ inView }, ref) => {
  const { t } = useTranslation();
  return (
  <div className="bg-gray-50 py-20 md:py-28" ref={ref}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <motion.div variants={fadeLeft} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
            {t('press.releases.section_title')}
          </h2>
        </motion.div>
        <motion.div className="mt-4 md:mt-0" variants={fadeRight} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <button className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center">
            {t('press.releases.see_all')} <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </motion.div>
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
        {PRESS_RELEASES.map((release, idx) => (
          <motion.div
            key={release.id}
            variants={fadeUp}
            custom={idx}
            whileHover={{ y: -5, boxShadow: '0 20px 50px rgba(0,0,0,0.09)' }}
            className="bg-white rounded-3xl p-8 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getCategoryColorClass(release.category)}`}>
                {t(getCategoryKey(release.category))}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{release.date}</span>
                {release.isNew && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    {t('press.releases.badge_new')}
                  </span>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
              {t(release.titleKey)}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t(release.summaryKey)}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <a href={release.downloadUrl} className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                {t('press.releases.download_pdf')}
              </a>
              <button className="text-gray-500 hover:text-gray-700">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </div>
  );
});
PressReleasesSection.displayName = 'PressReleasesSection';

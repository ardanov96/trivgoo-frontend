import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { fadeUp, scaleIn, stagger, TEAM_CULTURE, PERKS } from '../constants';
import { useReveal } from '../hooks';

interface Props { inView: boolean; }

export const CultureSection = React.forwardRef<HTMLDivElement, Props>(({ inView }, ref) => {
  const perksReveal = useReveal();

  const { t } = useTranslation();
  return (
    <div id="culture" className="bg-white py-20 md:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div className="text-center mb-16" variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">Kehidupan di Trivgoo</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">Lebih dari Sekadar Pekerjaan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Kami percaya bahwa bekerja harus penuh makna, mendorong pertumbuhan, dan tentu saja — menyenangkan.</p>
        </motion.div>

        {/* Culture cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16" variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          {TEAM_CULTURE.map((culture, index) => {
            const Icon      = culture.icon;
            const [textCls, bgCls] = culture.color.split(' ');
            return (
              <motion.div key={index} variants={scaleIn} custom={index} whileHover={{ y: -8, boxShadow: '0 20px 48px rgba(0,0,0,0.1)' }} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 cursor-default">
                <div className={`w-14 h-14 rounded-2xl ${bgCls} flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 ${textCls}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{culture.title}</h3>
                <p className="text-gray-600 leading-relaxed">{culture.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Perks */}
        <motion.div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-8 md:p-12" ref={perksReveal.ref} variants={fadeUp} initial="hidden" animate={perksReveal.inView ? 'visible' : 'hidden'}>
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">Keuntungan & Tunjangan</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">Kami berinvestasi dalam kebahagiaan, pertumbuhan, dan kesejahteraan seluruh tim.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" animate={perksReveal.inView ? 'visible' : 'hidden'}>
            {PERKS.map((perk, index) => {
              const Icon = perk.icon;
              return (
                <motion.div key={index} variants={fadeUp} custom={index} whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }} className="flex items-start p-4 bg-white rounded-2xl border border-gray-100 cursor-default">
                  <div className="p-3 bg-primary-50 rounded-xl mr-4 text-primary-600 flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{perk.title}</h4>
                    <p className="text-sm text-gray-600">{perk.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
});
CultureSection.displayName = 'CultureSection';

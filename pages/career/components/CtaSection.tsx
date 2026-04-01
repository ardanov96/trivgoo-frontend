import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { fadeUp, scaleIn, stagger } from '../constants';

interface Props { inView: boolean; }

export const CtaSection = React.forwardRef<HTMLDivElement, Props>(({ inView }, ref) => {
  const { t } = useTranslation();
  const { langPath } = useLangNavigate();

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-20 text-white relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <motion.h2
          className="text-3xl md:text-5xl font-serif font-bold mb-6"
          variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        >
          {t('career.cta_title', "Haven't Found the Right Position?")}
        </motion.h2>

        <motion.p
          className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto"
          variants={fadeUp} custom={1} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        >
          {t('career.cta_desc', "We're always looking for the best talent. Send your CV and tell us how you'd like to contribute.")}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        >
          <motion.div variants={scaleIn} custom={0} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <a
              href="mailto:careers@trivgoo.com"
              className="inline-block px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl"
            >
              {t('career.cta_send_cv', 'Send Your CV')}
            </a>
          </motion.div>
          <motion.div variants={scaleIn} custom={1} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to={langPath('/contact-us')}
              className="inline-block px-8 py-4 bg-primary-800 text-white rounded-full font-bold text-lg border border-primary-500 hover:bg-primary-900 transition-all shadow-xl"
            >
              {t('career.cta_contact', 'Contact Our Team')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
});
CtaSection.displayName = 'CtaSection';

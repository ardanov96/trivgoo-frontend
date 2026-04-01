import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { fadeUp, scaleIn, stagger, JOB_POSITIONS } from '../constants';
import type { JobPosition } from '../constants';
import { JobCard } from './JobCard';

interface Props {
  inView:  boolean;
  onApply: (job: JobPosition) => void;
}

export const JobsSection = React.forwardRef<HTMLDivElement, Props>(({ inView, onApply }, ref) => {
  const { t } = useTranslation();

  const filters = [
    t('career.filter_all',       'All Positions'),
    t('career.filter_tech',      'Technology'),
    t('career.filter_ops',       'Operations'),
    t('career.filter_marketing', 'Marketing'),
  ];

  return (
    <div id="open-positions" className="bg-gray-50 py-20 md:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div className="text-center mb-16" variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
            {t('career.jobs_title', 'Open Positions')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t('career.jobs_subtitle', 'Find the right role for you and join us in shaping the future of travel.')}
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div className="flex flex-wrap gap-4 mb-12 justify-center" variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          {filters.map((label, i) => (
            <motion.button
              key={label}
              variants={scaleIn}
              custom={i}
              whileTap={{ scale: 0.94 }}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-colors ${
                i === 0
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-400 hover:text-primary-600'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Job cards */}
        <motion.div className="space-y-6" variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          {JOB_POSITIONS.map((job, idx) => (
            <JobCard key={job.id} job={job} index={idx} onApply={onApply} />
          ))}
        </motion.div>
      </div>
    </div>
  );
});
JobsSection.displayName = 'JobsSection';

import { ExternalLink, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { fadeUp, stagger, PRESS_COVERAGE } from '../constants';

interface Props { inView: boolean; }

export const CoverageSection = React.forwardRef<HTMLDivElement, Props>(({ inView }, ref) => (
  <div className="bg-white py-20 md:py-28" ref={ref}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <motion.div className="text-center mb-16" variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">Artikel Resmi</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Artikel dan ulasan terbaru tentang Trivgoo di berbagai publikasi terkemuka.</p>
      </motion.div>

      <motion.div className="space-y-6" variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
        {PRESS_COVERAGE.map((coverage, idx) => (
          <motion.div key={coverage.id} variants={fadeUp} custom={idx} whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }} className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-start gap-6">

              {/* Outlet logo */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                  <img src={coverage.logo} alt={coverage.outlet} className="w-12 h-12 object-contain" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{coverage.title}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-gray-700">{coverage.outlet}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">{coverage.type}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 mt-2 md:mt-0">{coverage.date}</span>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{coverage.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <a href={coverage.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center">
                    Baca Artikel <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                  <button className="text-gray-400 hover:text-gray-600"><Quote className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </div>
));
CoverageSection.displayName = 'CoverageSection';

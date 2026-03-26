import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { fadeUp, scaleIn, staggerContainer, EASE, GALLERY_TABS } from '../constants';

interface Props {
  inView:        boolean;
  activeGallery: number;
  onTabChange:   (i: number) => void;
}

export const GallerySection = React.forwardRef<HTMLDivElement, Props>(({ inView, activeGallery, onTabChange }, ref) => {
  const current = GALLERY_TABS[activeGallery];

  return (
    <div className="bg-white py-20 md:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div className="text-center mb-12" variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">GALERI</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Sekilas pandang pengalaman nyata dari setiap paket layanan Trivgoo.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <motion.div className="flex flex-wrap justify-center gap-3 mb-10" variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          {GALLERY_TABS.map((tab, i) => {
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={i}
                variants={scaleIn}
                custom={i}
                onClick={() => onTabChange(i)}
                whileTap={{ scale: 0.93 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 border-2 ${
                  activeGallery === i
                    ? `${tab.activeColor} text-white border-transparent shadow-lg scale-105`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Image grid — animates on tab change */}
        <motion.div
          key={activeGallery}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {current.images.map((img, i) => (
            <motion.div
              key={`${activeGallery}-${i}`}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${i === 0 ? 'col-span-2 row-span-1' : ''}`}
              style={{ aspectRatio: i === 0 ? '16/7' : '4/3' }}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
              whileHover={{ scale: 1.02, zIndex: 10 }}
            >
              <img src={img.src} alt={img.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="font-semibold text-sm drop-shadow">{img.caption}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
});

GallerySection.displayName = 'GallerySection';

import { Download, FileText, Image, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { fadeUp, scaleIn, stagger, MEDIA_ASSETS, getAssetLabel } from '../constants';
import type { MediaAsset } from '../constants';

const getAssetIcon = (type: MediaAsset['type']) => {
  switch (type) {
    case 'video':     return <Video     className="w-5 h-5" />;
    case 'press-kit': return <FileText  className="w-5 h-5" />;
    default:          return <Image     className="w-5 h-5" />;
  }
};

interface Props {
  inView:    boolean;
  onPreview: (asset: MediaAsset) => void;
}

export const MediaAssetsSection = React.forwardRef<HTMLDivElement, Props>(({ inView, onPreview }, ref) => (
  <div className="bg-gray-50 py-20 md:py-28" ref={ref}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <motion.div className="text-center mb-16" variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
        <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">Unduh Materi</span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">Aset Media</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Unduh logo, foto, video, dan materi brand resmi Trivgoo untuk keperluan peliputan media Anda.</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
        {MEDIA_ASSETS.map((asset, idx) => (
          <motion.div key={asset.id} variants={scaleIn} custom={idx} whileHover={{ y: -6, boxShadow: '0 24px 55px rgba(0,0,0,0.11)' }} className="bg-white rounded-3xl overflow-hidden border border-gray-100 group cursor-default">
            <div className="relative h-48 overflow-hidden">
              <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                  {getAssetIcon(asset.type)}
                  <span className="ml-1">{getAssetLabel(asset.type)}</span>
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{asset.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{asset.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-5">
                <span className="bg-gray-100 px-2 py-1 rounded">{asset.format}</span>
                <span>{asset.size}</span>
              </div>
              <motion.button onClick={() => onPreview(asset)} className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Download className="w-4 h-4 mr-2" /> Unduh Sekarang
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </div>
));
MediaAssetsSection.displayName = 'MediaAssetsSection';

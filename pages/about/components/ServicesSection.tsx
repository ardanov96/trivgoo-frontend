import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { fadeUp, SERVICES } from '../constants';

interface Props { inView: boolean; }

export const ServicesSection = React.forwardRef<HTMLDivElement, Props>(({ inView }, ref) => (
  <div className="bg-gray-50 py-20 md:py-28" ref={ref}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <motion.div className="text-center mb-16" variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">LAYANAN KAMI</h2>
      </motion.div>

      <div className="space-y-16">
        {SERVICES.map((service, index) => {
          const Icon    = service.icon;
          const isEven  = index % 2 === 0;

          return (
            <motion.div
              key={index}
              className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100"
              variants={fadeUp}
              custom={index}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              whileHover={{ y: -6, boxShadow: '0 28px 60px -12px rgba(0,0,0,0.14)' }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            >
              {/* Image banner */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <motion.img src={service.image} alt={service.imageAlt} className="w-full h-full object-cover" whileHover={{ scale: 1.06 }} transition={{ duration: 0.6 }} />
                <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-60`} />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest opacity-80">Paket {index + 1}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold leading-snug mb-1">{service.title}</h3>
                  <p className="text-white/80 italic text-base">"{service.tagline}"</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 md:p-12">
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8`}>
                  <div className="lg:w-1/2">
                    <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
                  </div>
                  <div className="lg:w-1/2">
                    <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${service.textColor}`}>Cocok Untuk:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.highlights.map((item, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center bg-gray-50 rounded-xl px-4 py-3"
                          initial={{ opacity: 0, x: -16 }}
                          animate={inView ? { opacity: 1, x: 0 } : {}}
                          transition={{ duration: 0.4, delay: 0.3 + index * 0.1 + i * 0.07 }}
                        >
                          <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${service.textColor}`} />
                          <span className="text-gray-700 font-medium text-sm">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </div>
));

ServicesSection.displayName = 'ServicesSection';

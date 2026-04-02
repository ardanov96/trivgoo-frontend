import { Mail, Phone, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { fadeUp, scaleIn, stagger, CONTACT_INFO_DATA } from '../constants';

// Map icon string keys to actual Lucide components
const ICON_MAP = { mail: Mail, phone: Phone, users: Users } as const;

interface Props { inView: boolean; }

export const ContactSection = React.forwardRef<HTMLDivElement, Props>(({ inView }, ref) => {
  const { t } = useTranslation();
  return (
  <div className="bg-white py-20 md:py-28" ref={ref}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-8 md:p-12">

        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
            {t('press.contact.section_title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('press.contact.section_subtitle')}
          </p>
        </motion.div>

        {/* Contact cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {CONTACT_INFO_DATA.map((contact, index) => {
            const Icon = ICON_MAP[contact.icon];
            // detail: use detailKey if available, else literal detail string
            const detail = 'detailKey' in contact && contact.detailKey
              ? t(contact.detailKey)
              : contact.detail;
            return (
              <motion.a
                key={index}
                href={contact.link}
                variants={scaleIn}
                custom={index}
                whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.09)' }}
                className="group bg-white p-6 rounded-2xl border border-gray-100 transition-all duration-300 block"
              >
                <div className="p-3 bg-primary-50 rounded-xl inline-block mb-4 text-primary-600 group-hover:bg-primary-100 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {t(contact.titleKey)}
                </h3>
                <p className="text-gray-600">{detail}</p>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Request form */}
        <motion.div
          className="bg-white rounded-2xl p-8 border border-gray-100"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {t('press.contact.form.title')}
          </h3>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('press.contact.form.full_name')}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('press.contact.form.full_name_placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('press.contact.form.media_institution')}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('press.contact.form.media_institution_placeholder')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('press.contact.form.email')}
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('press.contact.form.email_placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('press.contact.form.phone')}
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('press.contact.form.phone_placeholder')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('press.contact.form.request_type')}
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">{t('press.contact.form.request_type_placeholder')}</option>
                <option value="interview">{t('press.contact.form.request_type_interview')}</option>
                <option value="press">{t('press.contact.form.request_type_press')}</option>
                <option value="partnership">{t('press.contact.form.request_type_partnership')}</option>
                <option value="event">{t('press.contact.form.request_type_event')}</option>
                <option value="other">{t('press.contact.form.request_type_other')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('press.contact.form.message')}
              </label>
              <textarea
                rows={4}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('press.contact.form.message_placeholder')}
              />
            </div>
            <div className="flex justify-end">
              <motion.button
                type="submit"
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Mail className="w-4 h-4 mr-2" />
                {t('press.contact.form.submit')}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  </div>
  );
});
ContactSection.displayName = 'ContactSection';

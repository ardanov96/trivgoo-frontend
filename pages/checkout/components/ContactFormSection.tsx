import { Mail, Phone, User } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { useContactForm } from '../hooks/useContactForm';

type FormHook = ReturnType<typeof useContactForm>;

interface Props {
  form:     FormHook['form'];
  errors:   FormHook['errors'];
  setField: FormHook['setField'];
}

const inputBase  = 'w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all';
const inputValid = 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20';
const inputError = 'border-red-400 focus:ring-red-500/20';

export const ContactFormSection: React.FC<Props> = ({ form, errors, setField }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">{t('contact_form.section_title')}</h3>
      <div className="space-y-3">

        {/* Full Name */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
            {t('contact_form.name_label')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder={t('contact_form.name_placeholder')}
              className={`${inputBase} ${errors.name ? inputError : inputValid}`}
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
            {t('contact_form.email_label')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder={t('contact_form.email_placeholder')}
              className={`${inputBase} ${errors.email ? inputError : inputValid}`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Phone / WhatsApp */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
            {t('contact_form.phone_label')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder={t('contact_form.phone_placeholder')}
              className={`${inputBase} ${errors.phone ? inputError : inputValid}`}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

      </div>
    </div>
  );
};

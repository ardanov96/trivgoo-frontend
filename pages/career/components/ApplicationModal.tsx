import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { EASE } from '../constants';
import type { JobPosition } from '../constants';
import type { ApplicationForm } from '../hooks';

interface Props {
  job:      JobPosition;
  form:     ApplicationForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose:  () => void;
}

export const ApplicationModal = ({ job, form, onChange, onSubmit, onClose }: Props) => {
  const { t, i18n } = useTranslation();

  // Pull translated title for display — fall back to raw job.title
  const jobIndex = ['Senior Travel Experience Designer', 'Spesialis Pemasaran & Pertumbuhan', 'Analis Bisnis', 'Penulis Konten Perjalanan']
    .findIndex(title => title === job.title);
  const displayTitle = jobIndex >= 0
    ? t(`career.job_${jobIndex}_title`, job.title)
    : job.title;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('career.modal_title', 'Apply: {{title}}', { title: displayTitle })}
              </h2>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span>{jobIndex >= 0 ? t(`career.job_${jobIndex}_dept`, job.department) : job.department}</span>
                <span>•</span>
                <span>{jobIndex >= 0 ? t(`career.job_${jobIndex}_location`, job.location) : job.location}</span>
                {job.isRemote && (
                  <><span>•</span><span className="text-primary-600 font-bold">{t('career.job_remote_badge', 'Remote')}</span></>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit}>
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('career.modal_fullname_label', 'Full Name *')}
                </label>
                <input
                  type="text" name="fullName" value={form.fullName} onChange={onChange} required
                  placeholder={t('career.modal_fullname_placeholder', 'Your full name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t('career.modal_email_label', 'Email Address *')}
                  </label>
                  <input
                    type="email" name="email" value={form.email} onChange={onChange} required
                    placeholder={t('career.modal_email_placeholder', 'email@example.com')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t('career.modal_phone_label', 'Phone Number *')}
                  </label>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={onChange} required
                    placeholder={t('career.modal_phone_placeholder', 'e.g. +62 812 3456 7890')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('career.modal_portfolio_label', 'Portfolio / Website (Optional)')}
                </label>
                <input
                  type="url" name="portfolioUrl" value={form.portfolioUrl} onChange={onChange}
                  placeholder={t('career.modal_portfolio_placeholder', 'https://your-portfolio.com')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('career.modal_cover_label', 'Cover Letter *')}
                </label>
                <textarea
                  name="coverLetter" value={form.coverLetter} onChange={onChange} required rows={6}
                  placeholder={t('career.modal_cover_placeholder', 'Tell us why you\'re interested in this role and what makes you the right candidate...')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('career.modal_cv_label', 'CV / Resume *')}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <input type="file" accept=".pdf,.doc,.docx" required className="hidden" id="resume-upload" />
                  <label htmlFor="resume-upload" className="cursor-pointer inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                    <ArrowRight className="w-4 h-4 mr-2" /> {t('career.modal_cv_upload', 'Upload CV')}
                  </label>
                  <p className="text-sm text-gray-500 mt-2">{t('career.modal_cv_hint', 'PDF, DOC, DOCX maximum 5MB')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button" onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                {t('career.modal_cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center"
              >
                {t('career.modal_submit', 'Submit Application')} <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

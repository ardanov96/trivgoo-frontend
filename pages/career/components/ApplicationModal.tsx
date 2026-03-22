import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { EASE } from '../constants';
import type { JobPosition } from '../constants';
import type { ApplicationForm } from '../hooks';

interface Props {
  job:          JobPosition;
  form:         ApplicationForm;
  onChange:     (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit:     (e: React.FormEvent) => void;
  onClose:      () => void;
}

export const ApplicationModal = ({ job, form, onChange, onSubmit, onClose }: Props) => (
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lamar: {job.title}</h2>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <span>{job.department}</span>
              <span>•</span>
              <span>{job.location}</span>
              {job.isRemote && (<><span>•</span><span className="text-primary-600 font-bold">Remote</span></>)}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap *</label>
              <input type="text" name="fullName" value={form.fullName} onChange={onChange} required placeholder="Nama lengkap Anda" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email *</label>
                <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="email@contoh.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Telepon *</label>
                <input type="tel" name="phone" value={form.phone} onChange={onChange} required placeholder="cth: 081234567890" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Portofolio / Website (Opsional)</label>
              <input type="url" name="portfolioUrl" value={form.portfolioUrl} onChange={onChange} placeholder="https://portofolio-anda.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Surat Lamaran *</label>
              <textarea name="coverLetter" value={form.coverLetter} onChange={onChange} required rows={6} placeholder="Ceritakan mengapa Anda tertarik dengan posisi ini dan apa yang membuat Anda adalah kandidat yang tepat..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">CV / Resume *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <input type="file" accept=".pdf,.doc,.docx" required className="hidden" id="resume-upload" />
                <label htmlFor="resume-upload" className="cursor-pointer inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                  <ArrowRight className="w-4 h-4 mr-2" /> Unggah CV
                </label>
                <p className="text-sm text-gray-500 mt-2">PDF, DOC, DOCX maksimal 5MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center">
              Kirim Lamaran <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  </motion.div>
);

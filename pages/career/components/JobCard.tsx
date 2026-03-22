import { ArrowRight, Briefcase, Calendar, Clock, MapPin, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from '../constants';
import type { JobPosition } from '../constants';

interface Props {
  job:   JobPosition;
  index: number;
  onApply: (job: JobPosition) => void;
}

export const JobCard = ({ job, index, onApply }: Props) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.09)' }}
    className="bg-white rounded-3xl p-8 border border-gray-100"
  >
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700">
            <Briefcase className="w-3 h-3 mr-1" />{job.department}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <MapPin className="w-3 h-3 mr-1" />{job.location}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <Clock className="w-3 h-3 mr-1" />{job.type}
          </span>
          {job.isRemote && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Remote</span>
          )}
        </div>
      </div>
      <motion.button onClick={() => onApply(job)} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center mt-4 md:mt-0" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        Lamar Sekarang <ArrowRight className="w-4 h-4 ml-2" />
      </motion.button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="flex items-center">
        <div className="p-2 bg-gray-100 rounded-lg mr-3"><Target className="w-5 h-5 text-gray-600" /></div>
        <div>
          <div className="text-sm text-gray-500">Pengalaman</div>
          <div className="font-bold text-gray-900">{job.experience}</div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="p-2 bg-gray-100 rounded-lg mr-3"><Calendar className="w-5 h-5 text-gray-600" /></div>
        <div>
          <div className="text-sm text-gray-500">Diposting</div>
          <div className="font-bold text-gray-900">{job.postedDate}</div>
        </div>
      </div>
    </div>

    <p className="text-gray-600 mb-6">{job.description}</p>

    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-500">
        {job.requirements.length} persyaratan • {job.benefits.length} keuntungan
      </div>
      <button onClick={() => onApply(job)} className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center">
        Selengkapnya <ArrowRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  </motion.div>
);

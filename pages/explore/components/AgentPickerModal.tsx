// pages/explore/components/AgentPickerModal.tsx

import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Star, Tag, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../../src/hooks/useLangNavigate';
import { useTranslation } from 'react-i18next';
import { CarDetails } from '../../../types';
import { generateSlug } from '../../../utils/slugify';
import { encodeId } from '../../../utils/hashids';
import { getImageUrl, FALLBACK_IMAGE } from '../../../utils/imageUtils';
import { getActiveVouchers, calcBestDiscount, formatRp, CarGroup } from '../utils';
import { CAR_REVIEW_HIGHLIGHTS } from '../constants';

const PREVIEW_DAYS = 2;

interface Props {
  group:   CarGroup;
  onClose: () => void;
}

export const AgentPickerModal = ({ group, onClose }: Props) => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 leading-tight">
              {t('agent_picker.title')}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-500" />
              {group.representativeProduct.location?.split(',').slice(-2).join(',').trim()} ·{' '}
              <span className="font-semibold text-gray-700">
                {t('agent_picker.providers_available', { count: group.agents.length })}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Agent list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {group.agents
            .sort((a, b) => Number(a.price) - Number(b.price))
            .map((agent, idx) => {
              const details        = agent.details as CarDetails;
              const activeVouchers = getActiveVouchers(agent);
              const baseTotal      = Number(agent.price) * PREVIEW_DAYS;
              const bestDiscount   = calcBestDiscount(activeVouchers, baseTotal);
              const finalTotal     = baseTotal - bestDiscount;
              const hasPromo       = bestDiscount > 0;
              const bestVoucher    = activeVouchers.find((v: any) =>
                calcBestDiscount([v], baseTotal) === bestDiscount
              );

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.07 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all duration-200 group/item"
                >
                  {/* Voucher badges */}
                  <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 flex-wrap">
                    {activeVouchers.length > 0 ? (
                      <>
                        {activeVouchers.slice(0, 2).map((v: any) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-500 text-white"
                          >
                            <Tag className="w-3 h-3" />
                            {v.code} · {v.type === 'percent' ? `${v.value}% OFF` : `${formatRp(v.value)} OFF`}
                          </span>
                        ))}
                        {activeVouchers.length > 2 && (
                          <span className="text-[10px] text-orange-500 font-bold">
                            +{activeVouchers.length - 2} {t('common.more')}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-500 text-white">
                        <ShieldCheck className="w-3 h-3" /> {t('agent_picker.verified')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-4 px-4 pb-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      <img
                        src={getImageUrl(agent.image_url || agent.image)}
                        alt={agent.name}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {(agent as any).owner?.company_name
                            || (agent as any).owner?.name
                            || t('agent_picker.title')}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-gray-800">
                            {agent.rating ? `${agent.rating}/10.0` : '7.5/10.0'}
                          </span>
                        </div>
                      </div>

                      {agent.location && (
                        <p className="flex items-center gap-1 text-[11px] text-gray-400 mb-1.5">
                          <MapPin className="w-3 h-3 text-primary-400 shrink-0" />
                          <span className="truncate">
                            {agent.location.split(',').slice(-3).join(',').trim()}
                          </span>
                        </p>
                      )}

                      <div className="mb-2 space-y-0.5">
                        {CAR_REVIEW_HIGHLIGHTS.map((h, hi) => (
                          <div key={hi} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {details?.transmission === 'Automatic' ? t('explore.automatic') : t('explore.manual')}
                        </span>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {details?.seats || 4} {t('common.passengers')}
                        </span>
                        {details?.driver && (
                          <span className="bg-primary-50 text-primary-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            + {t('explore.with_driver')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          {agent.currency} {Number(agent.price).toLocaleString('id-ID')}{t('agent_picker.per_day')}
                        </p>
                        {hasPromo ? (
                          <>
                            <p className="text-xs text-gray-400 line-through">
                              {formatRp(baseTotal)} {t('agent_picker.estimate_suffix')}
                            </p>
                            <p className="text-base font-extrabold text-green-600 leading-tight">
                              {formatRp(finalTotal)}
                              <span className="text-[10px] font-bold text-green-500 ml-0.5">
                                {t('agent_picker.estimate_suffix')}
                              </span>
                            </p>
                            {bestVoucher && (
                              <p className="text-[10px] text-orange-500 font-bold mt-0.5">
                                {t('agent_picker.save', { amount: formatRp(bestDiscount) })}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-base font-extrabold text-primary-600 leading-tight">
                            {formatRp(baseTotal)}
                            <span className="text-[10px] font-bold text-primary-500 ml-0.5">
                              {t('agent_picker.estimate_suffix')}
                            </span>
                          </p>
                        )}
                      </div>
                      <Link
                        to={langPath(`/product/${encodeId(agent.id)}/${generateSlug(agent.name)}`)}
                        onClick={onClose}
                        className="inline-flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-primary-600/25 transition-all active:scale-95 whitespace-nowrap"
                      >
                        {t('agent_picker.choose')} <ArrowRight className="w-3.5 h-3.5 group-hover/item:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400 text-center">
            {t('agent_picker.footer_note', { days: PREVIEW_DAYS })}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

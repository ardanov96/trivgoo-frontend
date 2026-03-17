// src/components/agent/components/CampaignStrip.tsx
import { Calendar, Gift, Percent, DollarSign, Zap, Users, Package, Star, ChevronRight } from 'lucide-react';
import React from 'react';
import { PromoCampaign, resolveBannerUrl } from '../../../services/promoService';

type Props = {
  campaigns: PromoCampaign[];
  onJoinCampaign: (campaign: PromoCampaign) => void;
};

const TYPE_LABEL: Record<string, string> = {
  flash_sale:     'Flash Sale',
  seasonal:       'Seasonal',
  member_only:    'Member Only',
  referral_bonus: 'Referral Bonus',
  bundle:         'Bundle',
};

const TYPE_COLOR: Record<string, string> = {
  flash_sale:     'bg-red-500',
  seasonal:       'bg-blue-500',
  member_only:    'bg-purple-500',
  referral_bonus: 'bg-green-500',
  bundle:         'bg-amber-500',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const CampaignsStrip: React.FC<Props> = ({ campaigns, onJoinCampaign }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16 blur-3xl" />

      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-bold flex items-center mb-2">
          <Gift className="w-6 h-6 mr-3 text-yellow-400" /> Campaign Aktif
        </h2>
        <p className="text-indigo-200 text-sm max-w-xl">
          Tingkatkan penjualan dengan bergabung ke event promosi eksklusif dan raih visibilitas lebih tinggi.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar relative z-10">
        {campaigns.map((campaign) => {
          const now = new Date();
          const isLive = new Date(campaign.starts_at) <= now && new Date(campaign.ends_at) >= now;
          const bannerSrc = resolveBannerUrl(campaign.banner_image);

          return (
            <div
              key={campaign.id}
              className="min-w-[280px] max-w-[280px] bg-white text-gray-900 rounded-2xl overflow-hidden shadow-lg flex flex-col flex-shrink-0"
            >
              {/* Banner */}
              <div className="h-28 relative overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                {bannerSrc ? (
                  <img src={bannerSrc} alt={campaign.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Zap className="w-10 h-10 text-indigo-300" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[campaign.type] || 'bg-gray-500'}`}>
                    {TYPE_LABEL[campaign.type] || campaign.type}
                  </span>
                </div>
                <div className={`absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}>
                  {isLive ? '● Live' : 'Belum Mulai'}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1 line-clamp-1">{campaign.name}</h3>
                {campaign.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{campaign.description}</p>
                )}
                <div className="flex items-center text-[11px] text-gray-400 mb-3">
                  <Calendar className="w-3 h-3 mr-1 shrink-0" />
                  {formatDate(campaign.starts_at)} – {formatDate(campaign.ends_at)}
                </div>

                {/* Stats */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      {campaign.discount_type === 'percent'
                        ? <Percent className="w-3 h-3" />
                        : <DollarSign className="w-3 h-3" />
                      }
                      Diskon
                    </span>
                    <span className="font-bold text-primary-600">
                      {campaign.discount_type === 'percent'
                        ? `${campaign.discount_value}%`
                        : `Rp ${Number(campaign.discount_value).toLocaleString('id-ID')}`
                      }
                      {campaign.max_discount && (
                        <span className="text-gray-400 font-normal ml-1">
                          (max Rp {Number(campaign.max_discount).toLocaleString('id-ID')})
                        </span>
                      )}
                    </span>
                  </div>
                  {campaign.min_transaction > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Min. transaksi</span>
                      <span className="font-semibold text-gray-700">
                        Rp {Number(campaign.min_transaction).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  {campaign.max_usage && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Pemakaian</span>
                      <span className="font-semibold text-gray-700">{campaign.used_count} / {campaign.max_usage}</span>
                    </div>
                  )}
                  {campaign.min_tier_name && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1"><Star className="w-3 h-3" /> Min. Tier</span>
                      <span className="font-semibold text-purple-600">{campaign.min_tier_name}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onJoinCampaign(campaign)}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 mt-auto"
                >
                  Daftarkan Produk <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignsStrip;

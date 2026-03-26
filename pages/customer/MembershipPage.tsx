// pages/user/MembershipPage.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Star, Crown, Zap, CheckCircle2, Loader2,
  ArrowLeft, TrendingUp, Percent, Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { loyaltyService, type MembershipTier, type UserMembership } from '../../services/loyaltyService';
import MembershipCard from '../../components/MembershipCard';
import { useAuth } from '../../AuthContext';

const TIER_ICONS: Record<string, React.ReactNode> = {
  bronze:   <Shield className="w-6 h-6" />,
  silver:   <Star className="w-6 h-6" />,
  gold:     <Crown className="w-6 h-6" />,
  platinum: <Zap className="w-6 h-6" />,
};

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

const MembershipPage: React.FC = () => {
  const { langPath } = useLangNavigate();
  const { user } = useAuth();
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [allTiers, setAllTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [mem, tiers] = await Promise.all([
          loyaltyService.getMembership(),
          loyaltyService.getAllTiers(),
        ]);
        setMembership(mem);
        setAllTiers(tiers.sort((a, b) => a.level - b.level));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={langPath('/loyalty')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Loyalty
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Membership Tier</h1>
          <p className="text-gray-500 text-sm mt-1">Semakin banyak berbelanja, semakin besar keuntunganmu</p>
        </motion.div>

        {/* Current Card */}
        {membership && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Tier Kamu Saat Ini</p>
            <MembershipCard membership={membership} userName={user?.name} />
          </motion.div>
        )}

        {/* All Tiers */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Semua Tier</p>
          <div className="space-y-4">
            {allTiers.map((tier, idx) => {
              const isCurrent = membership?.tier.id === tier.id;
              const isPassed = membership ? tier.level < membership.tier.level : false;
              const isLocked = membership ? tier.level > membership.tier.level : true;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.07 }}
                  className={`bg-white rounded-2xl border-2 p-5 transition-all ${
                    isCurrent ? 'border-gray-900 shadow-lg' :
                    isPassed ? 'border-green-200' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                        style={{ backgroundColor: tier.color ?? '#cd7f32' }}
                      >
                        {TIER_ICONS[tier.slug] ?? <Star className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-lg text-gray-900">{tier.name}</h3>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded-full">TIER KAMU</span>
                          )}
                          {isPassed && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {tier.description && <p className="text-xs text-gray-500 mt-0.5">{tier.description}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className={`rounded-xl p-3 text-center ${isCurrent ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                      <Percent className={`w-4 h-4 mx-auto mb-1 ${isCurrent ? 'text-white' : 'text-primary-600'}`} />
                      <p className={`font-bold text-xl ${isCurrent ? 'text-white' : 'text-gray-900'}`}>{tier.discount_percent}%</p>
                      <p className={`text-[10px] font-semibold ${isCurrent ? 'text-white/60' : 'text-gray-500'}`}>Diskon</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${isCurrent ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                      <Sparkles className={`w-4 h-4 mx-auto mb-1 ${isCurrent ? 'text-yellow-400' : 'text-purple-600'}`} />
                      <p className={`font-bold text-xl ${isCurrent ? 'text-white' : 'text-gray-900'}`}>{tier.point_multiplier}×</p>
                      <p className={`text-[10px] font-semibold ${isCurrent ? 'text-white/60' : 'text-gray-500'}`}>Point</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${isCurrent ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                      <TrendingUp className={`w-4 h-4 mx-auto mb-1 ${isCurrent ? 'text-green-400' : 'text-green-600'}`} />
                      <p className={`font-bold text-base ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                        {tier.max_discount_per_order ? formatRp(tier.max_discount_per_order) : '∞'}
                      </p>
                      <p className={`text-[10px] font-semibold ${isCurrent ? 'text-white/60' : 'text-gray-500'}`}>Max Diskon</p>
                    </div>
                  </div>

                  {/* Syarat */}
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-semibold">Syarat naik tier ini</p>
                    <div className="flex gap-3 text-right">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{formatRp(tier.min_spending)}</p>
                        <p className="text-[10px] text-gray-400">Min. Spending</p>
                      </div>
                      {tier.min_points > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-900">{tier.min_points.toLocaleString('id-ID')} pts</p>
                          <p className="text-[10px] text-gray-400">Min. Points</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress jika ini adalah tier berikutnya */}
                  {membership?.next_tier?.id === tier.id && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Progress kamu</span>
                        <span>{Math.round(membership.progress_percent)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${membership.progress_percent}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: tier.color ?? '#cd7f32' }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Butuh {formatRp(membership.spending_to_next)} lagi untuk naik ke {tier.name}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MembershipPage;

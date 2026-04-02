import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Crown, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserMembership } from '../services/loyaltyService';

interface MembershipCardProps {
  membership: UserMembership;
  userName?: string;
  compact?: boolean;
}

const TIER_CONFIG: Record<string, {
  gradient: string;
  textColor: string;
  icon: React.ReactNode;
  shine: string;
  border: string;
}> = {
  bronze: {
    gradient: 'from-[#cd7f32] via-[#e8a95c] to-[#cd7f32]',
    textColor: 'text-[#5c3a1e]',
    icon: <Shield className="w-6 h-6" />,
    shine: 'from-white/0 via-white/20 to-white/0',
    border: 'border-[#cd7f32]/40',
  },
  silver: {
    gradient: 'from-[#9e9e9e] via-[#e0e0e0] to-[#9e9e9e]',
    textColor: 'text-[#2c2c2c]',
    icon: <Star className="w-6 h-6" />,
    shine: 'from-white/0 via-white/30 to-white/0',
    border: 'border-[#bdbdbd]/40',
  },
  gold: {
    gradient: 'from-[#b8960c] via-[#ffd700] to-[#b8960c]',
    textColor: 'text-[#3d2b00]',
    icon: <Crown className="w-6 h-6" />,
    shine: 'from-white/0 via-white/40 to-white/0',
    border: 'border-[#ffd700]/50',
  },
  platinum: {
    gradient: 'from-[#3a3a5c] via-[#7c7ca8] to-[#3a3a5c]',
    textColor: 'text-white',
    icon: <Zap className="w-6 h-6" />,
    shine: 'from-white/0 via-white/20 to-white/0',
    border: 'border-[#7c7ca8]/40',
  },
};

function getConfig(slug: string) {
  return TIER_CONFIG[slug.toLowerCase()] ?? TIER_CONFIG['bronze'];
}

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)     return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

const MembershipCard: React.FC<MembershipCardProps> = ({
  membership,
  userName,
  compact = false,
}) => {
  const { t } = useTranslation();
  const { tier, next_tier, progress_percent, spending_to_next, total_spending } = membership;
  const cfg = getConfig(tier.slug);

  // Resolve userName here so t() is in scope for the fallback
  const displayName = userName ?? t('membership_card.default_member');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl border ${cfg.border} shadow-2xl ${compact ? 'p-5' : 'p-7'}`}
      style={{
        background: `linear-gradient(135deg, ${tier.color || '#cd7f32'} 0%, ${tier.color || '#cd7f32'}cc 50%, ${tier.color || '#cd7f32'} 100%)`,
      }}
    >
      {/* Shine overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${cfg.shine} pointer-events-none`} />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Top row ── */}
      <div className="relative flex items-start justify-between mb-6">
        <div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-1">
            {t('membership_card.member_label')}
          </p>
          <h3 className="text-white text-2xl font-serif font-bold tracking-wide">
            {tier.name}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30">
          {cfg.icon}
        </div>
      </div>

      {/* ── Name & spending ── */}
      <div className="relative mb-6">
        <p className="text-white font-bold text-lg tracking-wide truncate">{displayName}</p>
        <p className="text-white/60 text-xs mt-0.5">
          {t('membership_card.total_spending')}:{' '}
          <span className="text-white font-semibold">{formatRp(total_spending)}</span>
        </p>
      </div>

      {/* ── Benefits row ── */}
      {!compact && (
        <div className="relative flex gap-4 mb-6">
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">
              {t('membership_card.benefit_discount')}
            </p>
            <p className="text-white font-bold text-xl">{tier.discount_percent}%</p>
          </div>
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">
              {t('membership_card.benefit_points')}
            </p>
            <p className="text-white font-bold text-xl">{tier.point_multiplier}×</p>
          </div>
          {tier.max_discount_per_order && (
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">
                {t('membership_card.benefit_max_discount')}
              </p>
              <p className="text-white font-bold text-base">{formatRp(tier.max_discount_per_order)}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Progress to next tier ── */}
      {next_tier && (
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <p className="text-white/70 text-xs font-semibold">
              {t('membership_card.progress_toward')}{' '}
              <span className="text-white font-bold">{next_tier.name}</span>
            </p>
            <p className="text-white/70 text-xs">
              {formatRp(spending_to_next)} {t('membership_card.progress_more')}
            </p>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress_percent}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <p className="text-white/50 text-[10px] mt-1 text-right">{Math.round(progress_percent)}%</p>
        </div>
      )}

      {/* ── Highest tier ── */}
      {!next_tier && (
        <div className="relative flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <p className="text-white/80 text-xs font-semibold">{t('membership_card.highest_tier')}</p>
        </div>
      )}
    </motion.div>
  );
};

export default MembershipCard;

// src/hooks/useCampaignTimer.ts
import { useState, useEffect, useCallback } from 'react';
import type { PromoCampaign } from '../../services/promoService';

export interface CampaignTimerResult {
  h: string;
  m: string;
  s: string;
  totalSeconds: number;
  progressPercent: number;
  isExpired: boolean;
  isUrgent: boolean;
  isCritical: boolean;
}

export function useCampaignTimer(
  campaign: PromoCampaign | null | undefined,
  fallbackSeconds = 24 * 60 * 60,
): CampaignTimerResult {

  const getRemainingSeconds = useCallback((): number => {
    if (!campaign?.ends_at) return fallbackSeconds;
    const ms = new Date(campaign.ends_at).getTime() - Date.now();
    return Math.max(0, Math.floor(ms / 1000));
  }, [campaign?.ends_at, fallbackSeconds]);

  const getProgress = useCallback((): number => {
    if (!campaign?.starts_at || !campaign?.ends_at) return 0;
    const start   = new Date(campaign.starts_at).getTime();
    const end     = new Date(campaign.ends_at).getTime();
    const total   = end - start;
    if (total <= 0) return 100;
    const elapsed = Date.now() - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }, [campaign?.starts_at, campaign?.ends_at]);

  const [totalSeconds, setTotalSeconds]       = useState<number>(getRemainingSeconds);
  const [progressPercent, setProgressPercent] = useState<number>(getProgress);

  useEffect(() => {
    setTotalSeconds(getRemainingSeconds());
    setProgressPercent(getProgress());
  }, [campaign?.ends_at, campaign?.starts_at, getRemainingSeconds, getProgress]);

  useEffect(() => {
    if (getRemainingSeconds() <= 0) return;
    const id = setInterval(() => {
      const secs = getRemainingSeconds();
      setTotalSeconds(secs);
      setProgressPercent(getProgress());
      if (secs <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.ends_at, campaign?.starts_at]);

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
    totalSeconds,
    progressPercent,
    isExpired:  totalSeconds <= 0,
    isUrgent:   totalSeconds > 0 && totalSeconds <= 3600,
    isCritical: totalSeconds > 0 && totalSeconds <= 600,
  };
}
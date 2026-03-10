// src/hooks/useActiveCampaigns.ts
import { useEffect, useState } from 'react';
import { promoService, type PromoCampaign } from '../../services/promoService';

interface UseActiveCampaignsResult {
  campaigns: PromoCampaign[];
  /** Kampanye utama: flash_sale diprioritaskan, fallback ke index 0 */
  primaryCampaign: PromoCampaign | null;
  loading: boolean;
  refetch: () => void;
}

export function useActiveCampaigns(): UseActiveCampaignsResult {
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tick, setTick]           = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    promoService.getActiveCampaigns()
      .then((data) => { if (!cancelled) setCampaigns(data); })
      .catch((err) => { console.warn('[useActiveCampaigns]', err?.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const primaryCampaign =
    campaigns.find((c) => c.type === 'flash_sale') ??
    campaigns[0] ??
    null;

  return {
    campaigns,
    primaryCampaign,
    loading,
    refetch: () => setTick((t) => t + 1),
  };
}
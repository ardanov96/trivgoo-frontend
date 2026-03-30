// frontend-trivgoo/pages/checkout/hooks/useVoucher.ts

import { useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AppliedVoucher {
  id:              number;
  code:            string;
  type:            'percent' | 'fixed';
  value:           number;
  max_discount:    number | null;
  min_transaction: number;
  scope_owner?:    'admin' | 'agent';
  description?:    string | null;
  expires_at?:     string | null;
}

export interface AppliedVoucherPair {
  admin: AppliedVoucher | null; // voucher platform (admin)
  agent: AppliedVoucher | null; // voucher eksklusif agent
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Hitung diskon satu voucher terhadap amount */
export function calcSingleDiscount(voucher: AppliedVoucher, amount: number): number {
  if (!voucher) return 0;
  let disc = 0;
  if (voucher.type === 'percent') {
    disc = Math.floor((amount * voucher.value) / 100);
    if (voucher.max_discount != null) disc = Math.min(disc, voucher.max_discount);
  } else {
    disc = voucher.value;
  }
  return Math.min(disc, Math.max(0, amount));
}

/**
 * Hitung total diskon dari dua voucher secara bertahap:
 *   1. Admin voucher → dihitung dari amount asli
 *   2. Agent voucher → dihitung dari sisa setelah diskon admin
 */
export function calcTotalDiscount(pair: AppliedVoucherPair, amount: number): number {
  const adminDisc  = pair.admin ? calcSingleDiscount(pair.admin, amount) : 0;
  const afterAdmin = Math.max(0, amount - adminDisc);
  const agentDisc  = pair.agent ? calcSingleDiscount(pair.agent, afterAdmin) : 0;
  return adminDisc + agentDisc;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useVoucher() {
  const [appliedPair, setAppliedPair] = useState<AppliedVoucherPair>({
    admin: null,
    agent: null,
  });

  /** Apply satu voucher — masuk ke slot admin atau agent sesuai scope_owner */
  const apply = useCallback((voucher: AppliedVoucher, amount: number) => {
    if (amount < voucher.min_transaction) return;
    const owner = voucher.scope_owner ?? 'admin';
    setAppliedPair(prev => ({ ...prev, [owner]: voucher }));
  }, []);

  /** Hapus voucher berdasarkan owner slot */
  const remove = useCallback((owner: 'admin' | 'agent') => {
    setAppliedPair(prev => ({ ...prev, [owner]: null }));
  }, []);

  /** Hapus semua voucher */
  const removeAll = useCallback(() => {
    setAppliedPair({ admin: null, agent: null });
  }, []);

  /** Total diskon dari kedua voucher untuk amount tertentu */
  const totalDiscountFor = useCallback(
    (amount: number) => calcTotalDiscount(appliedPair, amount),
    [appliedPair],
  );

  // Backward compat — komponen lama yang masih pakai appliedVoucher / appliedDiscount
  const appliedVoucher  = appliedPair.admin ?? appliedPair.agent ?? null;
  const appliedDiscount = 0; // deprecated — gunakan totalDiscountFor(amount)

  return {
    // Multi-voucher (baru)
    appliedPair,
    totalDiscountFor,
    // Backward compat (lama)
    appliedVoucher,
    appliedDiscount,
    // Actions
    apply,
    remove,
    removeAll,
  };
}

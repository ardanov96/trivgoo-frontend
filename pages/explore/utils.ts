import { Product } from '../../types';
import { CarDetails, TourDetails, StayDetails } from '../../types';
import { DESTINATION_BANNERS } from './constants';

// ── Type guards ───────────────────────────────────────────────────────────────

export const isTour = (d: any): d is TourDetails => d?.type === 'tour';
export const isStay = (d: any): d is StayDetails => d?.type === 'stay';
export const isCar  = (d: any): d is CarDetails  => d?.type === 'car';

// ── Voucher helpers ───────────────────────────────────────────────────────────

export const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

export const getActiveVouchers = (product: Product): any[] => {
  const now = new Date();
  return ((product as any).vouchers || []).filter(
    (v: any) => v.is_active && (!v.expires_at || new Date(v.expires_at) >= now)
  );
};

export const calcBestDiscount = (vouchers: any[], amount: number): number => {
  if (!vouchers.length) return 0;
  return Math.max(
    ...vouchers.map((v: any) => {
      if (Number(amount) < Number(v.min_transaction)) return 0;
      if (v.type === 'percent') {
        const d = Math.floor((amount * Number(v.value)) / 100);
        return v.max_discount != null ? Math.min(d, Number(v.max_discount)) : d;
      }
      return Math.min(Number(v.value), amount);
    })
  );
};

// ── Location formatter ────────────────────────────────────────────────────────

export const formatLocation = (location: string): string => {
  if (!location) return '';
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
  const cleaned = parts.filter(
    (p) =>
      !/\d/.test(p) &&
      !['indonesia', 'jawa', 'java'].includes(p.toLowerCase()) &&
      !/^dusun/i.test(p) && !/^rt/i.test(p) && !/^rw/i.test(p) &&
      !/^jalan/i.test(p) && !/^jl/i.test(p) && !/^gg/i.test(p) && !/^gang/i.test(p)
  );
  return cleaned.slice(-3).join(', ');
};

// ── Destination banner ────────────────────────────────────────────────────────

export const getDestinationBanner = (query: string) =>
  DESTINATION_BANNERS[query.toLowerCase().trim()] ?? null;

// ── Car grouping ──────────────────────────────────────────────────────────────

export const extractProvince  = (location: string) => location.split(',').at(-1)?.trim().toLowerCase() || '';
export const extractCarModel  = (name: string) => name.split(' ').slice(0, 2).join(' ').toLowerCase();

export type CarGroup = {
  groupKey:              string;
  representativeProduct: Product;
  agents:                Product[];
};

export const groupCarProducts = (products: Product[]): CarGroup[] => {
  const map = new Map<string, Product[]>();
  products.forEach((p) => {
    const key = `${extractCarModel(p.name)}__${extractProvince(p.location || '')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  });
  const groups: CarGroup[] = [];
  map.forEach((agents, groupKey) => {
    const sorted = [...agents].sort((a, b) => Number(a.price) - Number(b.price));
    groups.push({ groupKey, representativeProduct: sorted[0], agents });
  });
  return groups;
};

export const ADMIN_FEE = 4000;

export const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
export const formatCurrency = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
export const getTransmissionLabel = (t?: string) =>
  !t ? '-' : t.toLowerCase() === 'automatic' ? 'Matic' : 'Manual';

export function calcDiscount(voucher: any, amount: number): number {
  if (!voucher) return 0;
  let discount = 0;
  if (voucher.type === 'percent') {
    discount = Math.floor((amount * Number(voucher.value)) / 100);
    if (voucher.max_discount != null) discount = Math.min(discount, Number(voucher.max_discount));
  } else {
    discount = Number(voucher.value);
  }
  return Math.min(discount, amount);
}

export function formatDateString(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d))
      return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
    return dateStr;
  } catch { return dateStr; }
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '-';
  if (dateStr.includes(' - ')) {
    const [start, end] = dateStr.split(' - ');
    return `${formatDateString(start)} – ${formatDateString(end)}`;
  }
  return formatDateString(dateStr);
}

import { useState } from 'react';
import { calcDiscount } from '../constants';

export const useVoucher = () => {
  const [appliedVoucher,  setAppliedVoucher]  = useState<any | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const apply  = (voucher: any, amount: number) => {
    setAppliedVoucher(voucher);
    setAppliedDiscount(calcDiscount(voucher, amount));
  };

  const remove = () => {
    setAppliedVoucher(null);
    setAppliedDiscount(0);
  };

  return { appliedVoucher, appliedDiscount, apply, remove };
};

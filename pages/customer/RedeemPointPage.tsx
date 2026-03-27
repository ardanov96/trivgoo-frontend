import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../../src/hooks/useLangNavigate';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, Ticket, ShoppingCart, CheckCircle2, Loader2,
  ArrowLeft, Info, Gift, ChevronRight, AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { loyaltyService, type PointBalance, type PointRedemption } from '../../services/loyaltyService';

// ── Config ───────────────────────────────────────────────────────────────────
const VOUCHER_OPTIONS = [
  { points: 100,  value: 10_000,  label: '100 pts → Rp 10.000' },
  { points: 250,  value: 25_000,  label: '250 pts → Rp 25.000' },
  { points: 500,  value: 50_000,  label: '500 pts → Rp 50.000' },
  { points: 1000, value: 100_000, label: '1.000 pts → Rp 100.000' },
  { points: 2000, value: 210_000, label: '2.000 pts → Rp 210.000 🔥' },
];

function formatRp(n: number) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

const RedeemPointPage: React.FC = () => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [redemptions, setRedemptions] = useState<PointRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'voucher' | 'checkout'>('voucher');
  const [selectedOption, setSelectedOption] = useState<typeof VOUCHER_OPTIONS[0] | null>(null);
  const [checkoutPoints, setCheckoutPoints] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<PointRedemption | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [bal, red] = await Promise.all([
          loyaltyService.getBalance(),
          loyaltyService.getRedemptions(),
        ]);
        setBalance(bal);
        setRedemptions(red.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const checkoutValue = Math.floor(Number(checkoutPoints || 0) / 10); // 10 pts = Rp 1.000

  const handleRedeem = async () => {
    setError(null);
    if (mode === 'voucher' && !selectedOption) return;
    if (mode === 'checkout' && (!checkoutPoints || Number(checkoutPoints) <= 0)) return;

    const points = mode === 'voucher' ? selectedOption!.points : Number(checkoutPoints);
    if ((balance?.balance ?? 0) < points) {
      setError('Point tidak cukup');
      return;
    }

    setSubmitting(true);
    try {
      const result = await loyaltyService.redeem({ redemption_type: mode, points });
      setSuccess(result);
      // refresh balance
      const newBal = await loyaltyService.getBalance();
      setBalance(newBal);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Gagal melakukan redeem');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={langPath('/loyalty')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t('loyalty.back_to_loyalty', 'Back to Loyalty')}
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gray-900">{t('loyalty.redeem', 'Redeem Points')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('redeem.subtitle', 'Convert your points into discount vouchers or checkout deductions')}</p>
        </motion.div>

        {/* Balance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white flex items-center justify-between"
        >
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider">{t('loyalty.your_points', 'Point Balance')}</p>
            <p className="text-4xl font-bold font-mono mt-1">{(balance?.balance ?? 0).toLocaleString('id-ID')}</p>
            <p className="text-white/50 text-xs mt-1">{t('redeem.pts_available', 'pts available')}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center">
            <Coins className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1.5">
            {(['voucher', 'checkout'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setSuccess(null); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
                  ${mode === m ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {m === 'voucher' ? <><Ticket className="w-4 h-4" /> {t('redeem.to_voucher', 'To Voucher')}</> : <><ShoppingCart className="w-4 h-4" /> {t('redeem.checkout_deduct', 'Checkout Deduct')}</>}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {mode === 'voucher' ? (
            <motion.div
              key="voucher"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">{t('redeem.voucher_info', 'Redeemed vouchers will be saved to your account and can be used at checkout. Valid for 30 days.')}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {VOUCHER_OPTIONS.map((opt) => {
                  const canAfford = (balance?.balance ?? 0) >= opt.points;
                  const isSelected = selectedOption?.points === opt.points;
                  return (
                    <button
                      key={opt.points}
                      disabled={!canAfford}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left
                        ${isSelected ? 'border-gray-900 bg-gray-50' : canAfford ? 'border-gray-200 hover:border-gray-400 bg-white' : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          <Gift className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{formatRp(opt.value)} {t('redeem.discount', 'discount')}</p>
                          <p className="text-xs text-gray-500">{opt.points.toLocaleString('id-ID')} {t('loyalty.points', 'points')}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-gray-900" />}
                      {!canAfford && <p className="text-xs text-red-400 font-semibold">{t('redeem.insufficient_points', 'Insufficient points')}</p>}
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between text-white"
                >
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider">{t('redeem.you_will_get', 'You will get')}</p>
                    <p className="text-2xl font-bold mt-1">{formatRp(selectedOption.value)} <span className="text-sm font-normal text-white/60">{t('redeem.voucher', 'voucher')}</span></p>
                    <p className="text-white/50 text-xs mt-0.5">{t('redeem.deduct_from_balance', 'Deduct')} {selectedOption.points.toLocaleString('id-ID')} pts {t('redeem.from_balance', 'from balance')}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/40" />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-4"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">{t('redeem.checkout_info', 'Checkout deduction will be saved as credit and applied automatically on next transaction. Rate: 10 pts = Rp 1,000.')}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  {t('redeem.amount_label', 'Points to Redeem')}
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={checkoutPoints}
                    onChange={e => setCheckoutPoints(e.target.value)}
                    min={10}
                    max={balance?.balance ?? 0}
                    step={10}
                    placeholder="{t('redeem.amount_placeholder', 'Enter point amount')}"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary-500 text-sm font-semibold transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">{t('redeem.max_label', 'Max')}: {(balance?.balance ?? 0).toLocaleString('id-ID')} pts</p>
              </div>

              {checkoutPoints && Number(checkoutPoints) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 rounded-2xl p-4 text-white"
                >
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">{t('redeem.you_will_get', 'You will get')}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{formatRp(checkoutValue)}</p>
                      <p className="text-white/50 text-xs mt-0.5">{t('redeem.checkout_credit', 'checkout discount credit')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs">Pakai</p>
                      <p className="font-bold">{Number(checkoutPoints).toLocaleString('id-ID')} pts</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-800">{t('redeem.success_title', 'Redeem Successful!')}</p>
                  <p className="text-xs text-green-600">
                    {success.redemption_type === 'voucher'
                      ? `Voucher ${success.voucher_code ?? ''} sudah tersimpan di akunmu`
                      : `Kredit ${formatRp(success.discount_amount ?? 0)} siap digunakan`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="w-full text-center text-xs font-semibold text-green-700 hover:underline"
              >
                {t('redeem.redeem_again', 'Redeem again')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        {!success && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={handleRedeem}
            disabled={submitting || (mode === 'voucher' ? !selectedOption : !checkoutPoints)}
            className="w-full py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading', 'Processing...')}</> : <><Gift className="w-4 h-4" /> {t('redeem.redeem_now', 'Redeem Now')}</>}
          </motion.button>
        )}

        {/* Redemption History */}
        {redemptions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 className="text-base font-bold text-gray-900 mb-3">{t('redeem.history_title', 'Redemption History')}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {redemptions.map(r => (
                <div key={r.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${r.redemption_type === 'voucher' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                      {r.redemption_type === 'voucher' ? <Ticket className="w-4 h-4 text-blue-600" /> : <ShoppingCart className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {r.redemption_type === 'voucher' ? `Voucher ${r.voucher_code ?? ''}` : t('redeem.checkout_deduct', 'Checkout Deduct')}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">−{r.points_spent.toLocaleString('id-ID')} pts</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.status === 'used' ? 'bg-green-100 text-green-700' :
                      r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      r.status === 'expired' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-500'}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RedeemPointPage;

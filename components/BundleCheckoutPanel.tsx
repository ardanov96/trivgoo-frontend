// ─────────────────────────────────────────────────────────────────────────────
// BundleCheckoutPanel.tsx
// Taruh sebagai komponen inline di AITripPlanner.tsx (sebelum const AITripPlanner)
// atau sebagai file terpisah di components/BundleCheckoutPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { ArrowRight, Check, Package, Sparkles, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return num.toLocaleString('id-ID');
}

function getCategoryLabel(catId: number): 'Tour' | 'Stay' | 'Transport' {
  if (catId === 1 || catId === 3) return 'Tour';
  if (catId === 2)                 return 'Stay';
  return 'Transport';
}

// Hitung diskon berdasarkan jumlah kategori yang ada
function calcBundleDiscount(categories: Set<string>): number {
  if (categories.has('Tour') && categories.has('Stay') && categories.has('Transport')) return 10; // 10% diskon full bundle
  if (categories.size >= 2) return 5; // 5% diskon 2 kategori
  return 0;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface BundleCheckoutPanelProps {
  products:    Product[];
  cartAdded:   Set<number>;
  isBooking:   boolean;
  onCheckout:  (products: Product[], discountPct: number, bundleLabel: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
const BundleCheckoutPanel: React.FC<BundleCheckoutPanelProps> = ({
  products,
  cartAdded,
  isBooking,
  onCheckout,
}) => {
  const analysis = useMemo(() => {
    if (products.length < 2) return null;

    const categories = new Set(products.map(p => getCategoryLabel(p.category_id)));
    const discountPct = calcBundleDiscount(categories);

    // Hitung total per currency
    const totals: Record<string, number> = {};
    products.forEach(p => {
      const cur = p.currency ?? 'IDR';
      totals[cur] = (totals[cur] ?? 0) + parseFloat(String(p.price) || '0');
    });

    const discountedTotals: Record<string, number> = {};
    Object.entries(totals).forEach(([cur, total]) => {
      discountedTotals[cur] = discountPct > 0
        ? Math.round(total * (1 - discountPct / 100))
        : total;
    });

    const catList = [...categories];
    const bundleLabel = catList.length === 3
      ? 'Paket Lengkap (Tour + Hotel + Transport)'
      : catList.length === 2
        ? `Paket ${catList.join(' + ')}`
        : 'Paket AI';

    const catColors: Record<string, string> = {
      Tour:      'bg-blue-50 text-blue-700',
      Stay:      'bg-purple-50 text-purple-700',
      Transport: 'bg-amber-50 text-amber-700',
    };

    return {
      categories,
      catList,
      catColors,
      discountPct,
      totals,
      discountedTotals,
      bundleLabel,
      productCount: products.length,
    };
  }, [products]);

  if (!analysis || analysis.productCount < 2) return null;

  const allInCart   = products.every(p => cartAdded.has(p.id));
  const { discountPct, totals, discountedTotals, bundleLabel, catList, catColors } = analysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-primary-200 shadow-md overflow-hidden"
    >
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-orange-400" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary-700 leading-none mb-0.5">
              {bundleLabel}
            </p>
            <p className="text-[10px] text-primary-500">
              {analysis.productCount} paket dari rekomendasi AI
            </p>
          </div>
          {discountPct > 0 && (
            <div className="flex-shrink-0 flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl px-2 py-1">
              <Tag className="w-3 h-3 text-green-600" />
              <span className="text-[10px] font-bold text-green-700">Hemat {discountPct}%</span>
            </div>
          )}
        </div>

        {/* Category badges */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {catList.map(cat => (
            <span key={cat} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catColors[cat] ?? 'bg-gray-100 text-gray-600'}`}>
              {cat}
            </span>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-3 space-y-1.5">
          {Object.entries(totals).map(([cur, total]) => (
            <div key={cur}>
              {discountPct > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Harga normal</span>
                  <span className="text-[10px] text-gray-400 line-through tabular-nums">
                    {cur} {formatPrice(total)}
                  </span>
                </div>
              )}
              {discountPct > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-green-600">
                    Diskon bundle {discountPct}%
                  </span>
                  <span className="text-[10px] font-bold text-green-600 tabular-nums">
                    − {cur} {formatPrice(total - discountedTotals[cur])}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-dashed border-gray-200 mt-1">
                <span className="text-xs font-bold text-gray-600">Total bundle</span>
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 block leading-none mb-0.5">{cur}</span>
                  <span className="text-base font-bold text-primary-700 tabular-nums">
                    {formatPrice(discountedTotals[cur])}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <p className="text-[9px] text-gray-400">*Belum termasuk makan & biaya tak terduga</p>
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={() => onCheckout(products, discountPct, bundleLabel)}
          disabled={isBooking || allInCart}
          whileTap={!allInCart ? { scale: 0.97 } : {}}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            allInCart
              ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 disabled:opacity-60'
          }`}
        >
          {isBooking ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
              />
              Memproses bundle...
            </>
          ) : allInCart ? (
            <><Check className="w-4 h-4" />Sudah di keranjang</>
          ) : (
            <>
              <Package className="w-4 h-4" />
              Pesan Paket Lengkap
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {!allInCart && (
          <p className="text-[10px] text-center text-gray-400 mt-2">
            Semua paket akan ditambahkan ke keranjang sekaligus
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default BundleCheckoutPanel;


// ─────────────────────────────────────────────────────────────────────────────
// CARA INTEGRASI KE AITripPlanner.tsx
// ─────────────────────────────────────────────────────────────────────────────

/*
1. Import di bagian atas AITripPlanner.tsx:
   import BundleCheckoutPanel from '../components/BundleCheckoutPanel';

2. Tambah state di dalam AITripPlanner:
   const [isBundleCheckingOut, setIsBundleCheckingOut] = useState(false);

3. Tambah handler handleBundleCheckout:

   const handleBundleCheckout = async (
     bundleProducts: Product[],
     discountPct: number,
     bundleLabel: string
   ) => {
     if (!user) { langNavigate('/login'); return; }
     setIsBundleCheckingOut(true);
     try {
       // Tambah semua produk ke cart
       for (const p of bundleProducts) {
         if (!cartAdded.has(p.id)) {
           await addToCart(p, 1);
           setCartAdded(prev => new Set([...prev, p.id]));
         }
       }
       showToast(`${bundleProducts.length} paket ditambahkan!`, 'success');

       // Redirect ke cart dengan info bundle
       langNavigate('/cart', {
         state: {
           fromBundle: true,
           bundleLabel,
           discountPct,
           bundleProductIds: bundleProducts.map(p => p.id),
         }
       });
     } catch {
       showToast('Gagal menambahkan bundle. Coba lagi.', 'error');
     } finally {
       setIsBundleCheckingOut(false);
     }
   };

4. Render di dalam sidebar kanan, setelah UnavailablePanel dan sebelum BudgetEstimator:

   {!isLoading && recommendedProducts.length >= 2 && (
     <BundleCheckoutPanel
       products={recommendedProducts}
       cartAdded={cartAdded}
       isBooking={isBundleCheckingOut}
       onCheckout={handleBundleCheckout}
     />
   )}

5. Di halaman Cart (pages/Cart.tsx atau CheckoutSummary.tsx),
   baca state dari location dan tampilkan badge diskon:

   import { useLocation } from 'react-router-dom';
   const location = useLocation();
   const bundleState = location.state;

   {bundleState?.fromBundle && bundleState.discountPct > 0 && (
     <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4">
       <Tag className="w-4 h-4 text-green-600" />
       <p className="text-sm font-bold text-green-700">
         Bundle discount {bundleState.discountPct}% dari AI Trip Planner
       </p>
     </div>
   )}
*/

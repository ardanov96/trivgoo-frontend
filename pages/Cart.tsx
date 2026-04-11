import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, MapPin, Package, ShoppingCart,
  Tag, Trash2, X,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../AuthContext';
import { useCart } from '../components/CartContext';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { encodeId } from '../utils/hashids';
import { generateSlug } from '../utils/slugify';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return num.toLocaleString('id-ID');
}

function categoryLabel(catId: number): string {
  if (catId === 1 || catId === 3) return 'Tour';
  if (catId === 2)                 return 'Penginapan';
  return 'Transport';
}

function categoryColor(catId: number): string {
  if (catId === 1 || catId === 3) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (catId === 2)                 return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

// Bundle discount logic (sama dengan BundleCheckoutPanel)
function calcBundleDiscount(products: any[]): number {
  const cats = new Set(products.map(p => categoryLabel(p.category_id)));
  if (cats.has('Tour') && cats.has('Penginapan') && cats.has('Transport')) return 10;
  if (cats.size >= 2) return 5;
  return 0;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const Cart: React.FC = () => {
  const { t }                      = useTranslation();
  const navigate                   = useNavigate();
  const location                   = useLocation();
  const { langPath, langNavigate } = useLangNavigate();
  const { user }                   = useAuth();
  const { cartItems, removeFromCart } = useCart();

  // Baca state dari AITripPlanner jika ada (bundle flow)
  const bundleState = location.state as {
    fromBundle?:      boolean;
    bundleLabel?:     string;
    discountPct?:     number;
    bundleProductIds?: number[];
  } | null;

  const discountPct  = bundleState?.discountPct ?? calcBundleDiscount(cartItems.map(i => i.product));
  const hasBundleDiscount = discountPct > 0 && cartItems.length >= 2;

  // Total per currency
  const totals = cartItems.reduce<Record<string, number>>((acc, item) => {
    const cur = item.product.currency ?? 'IDR';
    acc[cur] = (acc[cur] ?? 0) + parseFloat(String(item.product.price) || '0');
    return acc;
  }, {});

  const discountedTotals = Object.fromEntries(
    Object.entries(totals).map(([cur, total]) => [
      cur,
      hasBundleDiscount ? Math.round(total * (1 - discountPct / 100)) : total,
    ])
  );

  // ── Handle checkout satu produk ───────────────────────────────────────────
  const handleCheckoutSingle = (item: any) => {
    if (!user) {
      langNavigate('/login', { state: { from: location.pathname } });
      return;
    }
    // Format state sesuai CheckoutSummary.tsx
    navigate(langPath('/checkout-summary'), {
      state: {
        productId:     item.product.id,
        productName:   item.product.name,
        location:      item.product.location,
        date:          new Date().toISOString().split('T')[0], // user set nanti
        pax:           item.quantity ?? 1,
        pricePerPax:   parseFloat(String(item.product.price)),
        basePricePerPax: parseFloat(String(item.product.price)),
        totalPrice:    parseFloat(String(item.product.price)) * (item.quantity ?? 1),
        image:         item.product.image,
        duration:      1,
        unitLabel:     'Tiket',
        priceUnitLabel: 'orang',
        vehicleType:   item.product.category_id === 3 ? 'car' : undefined,
        availableVouchers: [],
      },
    });
  };

  // ── Handle checkout semua (bundle) ────────────────────────────────────────
  const handleCheckoutAll = () => {
    if (!user) {
      langNavigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!cartItems.length) return;

    // Untuk bundle, checkout produk pertama dengan info bundle di state
    // User akan checkout satu per satu — ini flow sementara sampai multi-checkout diimplementasi
    // Pilih produk pertama sebagai anchor checkout
    const first = cartItems[0];
    const totalIDR = discountedTotals['IDR'] ?? 0;

    navigate(langPath('/checkout-summary'), {
      state: {
        productId:     first.product.id,
        productName:   hasBundleDiscount
          ? (bundleState?.bundleLabel ?? `Paket ${cartItems.length} Produk`)
          : first.product.name,
        location:      first.product.location,
        date:          new Date().toISOString().split('T')[0],
        pax:           1,
        pricePerPax:   totalIDR,
        basePricePerPax: totals['IDR'] ?? 0,
        totalPrice:    totals['IDR'] ?? 0,
        image:         first.product.image,
        duration:      1,
        unitLabel:     'Paket',
        priceUnitLabel: 'paket',
        vehicleType:   undefined,
        availableVouchers: [],
        // Bundle info — digunakan CheckoutSummary untuk tampilkan diskon
        bundleDiscount:    hasBundleDiscount ? Math.round((totals['IDR'] ?? 0) * discountPct / 100) : 0,
        bundleLabel:       bundleState?.bundleLabel,
        bundleProductIds:  cartItems.map(i => i.product.id),
      },
    });
  };

  const isEmpty = cartItems.length === 0;

  return (
    <>
      <SEO title="Keranjang | Trivgoo" />
      <div className="min-h-screen bg-gray-50 pb-32">

        {/* ── Header ── */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800 flex-1">Keranjang</h1>
            {!isEmpty && (
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {cartItems.length} paket
              </span>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">

          {/* ── Empty state ── */}
          {isEmpty && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <h2 className="text-lg font-bold text-gray-700 mb-2">Keranjang masih kosong</h2>
              <p className="text-sm text-gray-400 mb-6">Tambahkan paket wisata dari AI Trip Planner atau jelajahi destinasi</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={langPath('/ai-planner')}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors">
                  AI Trip Planner
                </Link>
                <Link to={langPath('/explore')}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  Jelajahi Paket
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Bundle discount banner ── */}
          <AnimatePresence>
            {hasBundleDiscount && !isEmpty && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-800">
                    Bundle discount {discountPct}% aktif!
                  </p>
                  <p className="text-[10px] text-green-600">
                    {bundleState?.bundleLabel ?? `Kamu memesan ${cartItems.length} kategori paket berbeda`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Cart items ── */}
          <AnimatePresence>
            {cartItems.map((item, i) => (
              <motion.div key={item.product.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Product info */}
                <Link to={langPath(`/product/${encodeId(item.product.id)}/${generateSlug(item.product.name)}`)}
                  className="group flex gap-3 p-4 pb-2">
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden relative">
                    <img src={item.product.image} alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${categoryColor(item.product.category_id)}`}>
                        {categoryLabel(item.product.category_id)}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug mb-1">
                      {item.product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{item.product.location}</span>
                    </div>
                  </div>
                </Link>

                {/* Price + actions */}
                <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-2">
                  <div>
                    <span className="text-[9px] text-gray-400 block">{item.product.currency ?? 'IDR'}</span>
                    <span className="text-base font-bold text-primary-700 tabular-nums">
                      {formatPrice(item.product.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.product.id)}
                      className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleCheckoutSingle(item)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-600 rounded-xl text-xs font-bold transition-colors">
                      Pesan ini saja <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── Price summary ── */}
          {!isEmpty && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Ringkasan Harga</h3>

              {cartItems.map(item => (
                <div key={item.product.id} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500 truncate flex-1">{item.product.name}</span>
                  <span className="text-xs font-bold text-gray-700 flex-shrink-0 tabular-nums">
                    {formatPrice(item.product.price)}
                  </span>
                </div>
              ))}

              {Object.entries(totals).map(([cur, total]) => (
                <div key={cur}>
                  {hasBundleDiscount && (
                    <>
                      <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                        <span className="text-xs text-gray-500">Subtotal</span>
                        <span className="text-xs text-gray-400 line-through tabular-nums">{cur} {formatPrice(total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Diskon bundle {discountPct}%
                        </span>
                        <span className="text-xs font-bold text-green-600 tabular-nums">
                          − {cur} {formatPrice(Math.round(total * discountPct / 100))}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200 mt-1">
                    <span className="text-sm font-bold text-gray-800">Total</span>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 block leading-none mb-0.5">{cur}</span>
                      <span className="text-lg font-bold text-primary-700 tabular-nums">
                        {formatPrice(discountedTotals[cur] ?? total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-[10px] text-gray-400">*Belum termasuk admin fee dan biaya tambahan</p>
            </motion.div>
          )}

        </div>

        {/* ── Fixed bottom CTA ── */}
        {!isEmpty && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 p-4">
            <div className="max-w-2xl mx-auto space-y-2">

              {/* Checkout all button */}
              <motion.button onClick={handleCheckoutAll} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all">
                <ShoppingCart className="w-4 h-4" />
                {user
                  ? `Checkout ${hasBundleDiscount ? `(Hemat ${discountPct}%)` : `(${cartItems.length} paket)`}`
                  : 'Login & Checkout'
                }
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              {/* Back to planner */}
              <Link to={langPath('/ai-planner')}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                ← Kembali ke AI Planner
              </Link>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Cart;


// ─────────────────────────────────────────────────────────────────────────────
// CARA INTEGRASI — daftarkan di App.tsx / router
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Import:
//    const Cart = lazy(() => import('./pages/Cart'));
//
// 2. Tambahkan route (public — tidak perlu auth, auth di-handle di dalam page):
//    <Route path="cart" element={<Cart />} />
//
// 3. Pastikan CartContext punya removeFromCart yang berfungsi.
//    Jika cart disimpan di localStorage, pastikan key-nya konsisten.
//
// 4. Untuk flow dari AITripPlanner — CartBanner sudah link ke langPath('/cart'),
//    tidak perlu ubah apapun di AITripPlanner.tsx.

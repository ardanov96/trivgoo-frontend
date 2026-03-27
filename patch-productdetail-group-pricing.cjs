// patch-productdetail-group-pricing.cjs
// Inject Group Pricing tier selector + Child pax counter ke ProductDetail.tsx
const fs = require('fs');

let content = fs.readFileSync('pages/ProductDetail.tsx', 'utf8');

// ── 1. Tambah state untuk selectedTierIdx dan child pax ──────────────────────
const OLD_PAX_STATE = `  const [tourPax, setTourPax] = useState(2);`;

const NEW_PAX_STATE = `  const [tourPax, setTourPax] = useState(2);
  // Group Trip tier & child pax
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const [infantPax,  setInfantPax]  = useState(0);
  const [childPax,   setChildPax]   = useState(0);
  const [teenPax,    setTeenPax]    = useState(0);`;

if (content.includes(OLD_PAX_STATE)) {
  content = content.replace(OLD_PAX_STATE, NEW_PAX_STATE);
  console.log('✅ Added tier & child pax state');
} else {
  console.log('⚠️  tourPax state not found');
}

// ── 2. Tambah helper kalkulasi harga group/child ──────────────────────────────
// Inject sebelum "const generateCheckoutPayload"
const OLD_CHECKOUT_FN = `  const generateCheckoutPayload = (type: 'tour_stay' | 'car') => {`;

const PRICE_HELPERS = `  // ── Group & Child price helpers ────────────────────────────────────────────
  const getGroupTiers = () => (tourDetails as any)?.groupPricingTiers || [];
  const getChildPricing = () => (tourDetails as any)?.childPricing;

  const getTierPrice = (basePrice: number) => {
    const tiers = getGroupTiers();
    if (!tiers.length || tourDetails?.tripType !== 'Group Trip') return basePrice;
    const tier = tiers[selectedTierIdx];
    if (!tier) return basePrice;
    return Math.round(basePrice * (1 - tier.discountPct / 100));
  };

  const getChildPrice = (basePrice: number, type: 'infant' | 'child' | 'teen') => {
    const cp = getChildPricing();
    if (!cp?.enabled) return basePrice;
    const discountPct = cp[type] ?? 0;
    return Math.round(basePrice * (1 - discountPct / 100));
  };

  const calcTourTotal = (basePrice: number) => {
    const tierPrice = getTierPrice(basePrice);
    const adultTotal = tierPrice * tourPax;
    const cp = getChildPricing();
    if (!cp?.enabled) return adultTotal;
    const infantTotal = getChildPrice(basePrice, 'infant') * infantPax;
    const childTotal  = getChildPrice(basePrice, 'child')  * childPax;
    const teenTotal   = getChildPrice(basePrice, 'teen')   * teenPax;
    return adultTotal + infantTotal + childTotal + teenTotal;
  };

  const totalPaxCount = () => tourPax + infantPax + childPax + teenPax;

  const generateCheckoutPayload = (type: 'tour_stay' | 'car') => {`;

if (content.includes(OLD_CHECKOUT_FN)) {
  content = content.replace(OLD_CHECKOUT_FN, PRICE_HELPERS);
  console.log('✅ Added price helpers');
} else {
  console.log('⚠️  generateCheckoutPayload not found');
}

// ── 3. Update checkout payload untuk sertakan tier & child data ───────────────
const OLD_PAYLOAD = `        pricePerPax: Number(product.price), pax: qty, guestCount: qty, duration: dur,
        totalPrice: Number(product.price) * qty * dur,`;

const NEW_PAYLOAD = `        pricePerPax: isTourProduct ? getTierPrice(Number(product.price)) : Number(product.price),
        basePricePerPax: Number(product.price),
        pax: isTourProduct ? totalPaxCount() : qty,
        guestCount: isTourProduct ? totalPaxCount() : qty,
        duration: dur,
        totalPrice: isTourProduct ? calcTourTotal(Number(product.price)) : Number(product.price) * qty * dur,
        adultPax: isTourProduct ? tourPax : qty,
        infantPax: isTourProduct ? infantPax : 0,
        childPax: isTourProduct ? childPax : 0,
        teenPax: isTourProduct ? teenPax : 0,
        selectedTier: isTourProduct ? getGroupTiers()[selectedTierIdx] : null,
        childPricing: isTourProduct ? getChildPricing() : null,`;

if (content.includes(OLD_PAYLOAD)) {
  content = content.replace(OLD_PAYLOAD, NEW_PAYLOAD);
  console.log('✅ Updated checkout payload');
} else {
  console.log('⚠️  Payload pattern not found');
}

// ── 4. Inject Group Tier selector UI sebelum Date picker (isTourProduct block) ─
// Cari blok isTourProduct date picker
const OLD_TOUR_BOOKING = `                    <div className="mb-4"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{t('product.select_date', 'Date')} <span className="text-red-500">*</span></label>`;

const NEW_TOUR_BOOKING = `                    {/* ── Group Trip Tier Selector ── */}
                    {tourDetails?.tripType === 'Group Trip' && getGroupTiers().length > 0 && (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Pilih Ukuran Group <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {getGroupTiers().map((tier: any, idx: number) => {
                            const tierPrice = Math.round(Number(product.price) * (1 - tier.discountPct / 100));
                            const isSelected = selectedTierIdx === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedTierIdx(idx);
                                  setTourPax(tier.minPax);
                                }}
                                className={\`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all \${
                                  isSelected
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }\`}
                              >
                                <div className="text-left">
                                  <p className={\`text-sm font-bold \${isSelected ? 'text-primary-700' : 'text-gray-800'}\`}>
                                    {tier.label}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {tier.minPax}–{tier.maxPax === 99 ? '∞' : tier.maxPax} peserta
                                  </p>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                  <p className={\`text-sm font-extrabold \${isSelected ? 'text-primary-600' : 'text-gray-900'}\`}>
                                    {product.currency} {tierPrice.toLocaleString('id-ID')}
                                  </p>
                                  <p className="text-[10px] text-gray-400">/orang</p>
                                  {tier.discountPct > 0 && (
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                      -{tier.discountPct}%
                                    </span>
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="ml-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mb-4"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{t('product.select_date', 'Date')} <span className="text-red-500">*</span></label>`;

if (content.includes(OLD_TOUR_BOOKING)) {
  content = content.replace(OLD_TOUR_BOOKING, NEW_TOUR_BOOKING);
  console.log('✅ Injected Group Tier selector UI');
} else {
  console.log('⚠️  Tour date picker position not found');
}

// ── 5. Inject Child Pax counters setelah Adult pax counter ───────────────────
const OLD_ADULT_PAX = `                      <div className="mb-5"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{t('product.participants', 'Participants')} <span className="text-red-500">*</span></label><div className={\`flex items-center gap-3 border rounded-xl p-2 bg-gray-50 \${fieldErrors.tourPax ? 'border-red-400' : 'border-gray-200'}\`}><button onClick={() => {
                          const _tt = (product?.details as any)?.tripType || 'Open Trip';
                          const _min = _tt === 'Private Trip' ? 1 : _tt === 'Group Trip' ? 6 : 2;
                          setTourPax(p => Math.max(_min, p - 1));
                        }} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Minus className="w-3.5 h-3.5" /></button><span className="flex-1 text-center font-extrabold text-gray-900">{tourPax} orang</span><button onClick={() => setTourPax(p => p + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Plus className="w-3.5 h-3.5" /></button></div><FieldError name="tourPax" /></div>`;

const NEW_ADULT_PAX = `                      <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                          {t('product.participants', 'Participants')} <span className="text-red-500">*</span>
                        </label>
                        {/* Dewasa */}
                        <div className={\`flex items-center gap-3 border rounded-xl p-2 bg-gray-50 mb-2 \${fieldErrors.tourPax ? 'border-red-400' : 'border-gray-200'}\`}>
                          <span className="text-xs text-gray-500 w-16 shrink-0">🧑 Dewasa</span>
                          <button onClick={() => {
                            const _tt = (product?.details as any)?.tripType || 'Open Trip';
                            const tier = getGroupTiers()[selectedTierIdx];
                            const _min = tier ? tier.minPax : (_tt === 'Private Trip' ? 1 : _tt === 'Group Trip' ? 6 : 2);
                            setTourPax(p => Math.max(_min, p - 1));
                          }} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="flex-1 text-center font-extrabold text-gray-900">{tourPax}</span>
                          <button onClick={() => {
                            const tier = getGroupTiers()[selectedTierIdx];
                            if (tier && tier.maxPax !== 99 && tourPax >= tier.maxPax) return;
                            setTourPax(p => p + 1);
                          }} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <FieldError name="tourPax" />

                        {/* Child pax — hanya tampil jika childPricing enabled */}
                        {getChildPricing()?.enabled && (
                          <div className="space-y-2 mt-2">
                            {[
                              { key: 'infant', label: '🍼 Bayi', desc: '0–1 tahun', pax: infantPax, setter: setInfantPax, priceType: 'infant' as const },
                              { key: 'child',  label: '👦 Anak',  desc: '2–11 tahun', pax: childPax,  setter: setChildPax,  priceType: 'child' as const  },
                              { key: 'teen',   label: '🧑 Remaja', desc: '12–17 tahun', pax: teenPax, setter: setTeenPax,  priceType: 'teen' as const   },
                            ].map(cat => {
                              const price = getChildPrice(Number(product.price), cat.priceType);
                              const discountPct = getChildPricing()?.[cat.priceType] ?? 0;
                              return (
                                <div key={cat.key} className="flex items-center gap-3 border border-amber-100 rounded-xl p-2 bg-amber-50">
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-gray-700">{cat.label}</span>
                                    <span className="text-[10px] text-gray-400 ml-1">{cat.desc}</span>
                                    <div className="text-[10px] text-amber-600 font-semibold">
                                      {discountPct === 100 ? 'GRATIS' : \`\${product.currency} \${price.toLocaleString('id-ID')}/orang\`}
                                    </div>
                                  </div>
                                  <button onClick={() => cat.setter(p => Math.max(0, p - 1))} className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex items-center justify-center hover:border-amber-400 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                                  <span className="w-6 text-center font-extrabold text-gray-900 text-sm">{cat.pax}</span>
                                  <button onClick={() => cat.setter(p => p + 1)} className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex items-center justify-center hover:border-amber-400 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>`;

if (content.includes(OLD_ADULT_PAX)) {
  content = content.replace(OLD_ADULT_PAX, NEW_ADULT_PAX);
  console.log('✅ Injected child pax counters');
} else {
  console.log('⚠️  Adult pax pattern not found');
}

// ── 6. Update price summary box untuk tour ────────────────────────────────────
const OLD_TOUR_SUMMARY = `                      {isTourProduct ? (<div className="flex justify-between text-sm text-gray-600"><span>{tourPax} orang × {product.currency} {Number(product.price).toLocaleString('id-ID')}</span><span className="font-semibold">{product.currency} {(Number(product.price) * tourPax).toLocaleString('id-ID')}</span></div>) : (<div className="flex justify-between text-sm text-gray-600"><span>{nights > 0 ? \`\${nights} malam\` : '— malam'} × {stayGuests} tamu × {product.currency} {Number(product.price).toLocaleString('id-ID')}</span><span className="font-semibold">{nights > 0 ? \`\${product.currency} \${(Number(product.price) * nights * stayGuests).toLocaleString('id-ID')}\` : '—'}</span></div>)}
                      <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-gray-900"><span>{t('checkout.total', 'Total')}</span><span className="text-primary-600">{nights > 0 || isTourProduct ? \`\${product.currency} \${tourStayTotal.toLocaleString('id-ID')}\` : '—'}</span></div>`;

const NEW_TOUR_SUMMARY = `                      {isTourProduct ? (
                        <div className="space-y-1.5">
                          {/* Dewasa */}
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{tourPax} dewasa × {product.currency} {getTierPrice(Number(product.price)).toLocaleString('id-ID')}</span>
                            <span className="font-semibold">{product.currency} {(getTierPrice(Number(product.price)) * tourPax).toLocaleString('id-ID')}</span>
                          </div>
                          {/* Child rows */}
                          {getChildPricing()?.enabled && infantPax > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{infantPax} bayi × {getChildPricing().infant === 100 ? 'GRATIS' : \`\${product.currency} \${getChildPrice(Number(product.price), 'infant').toLocaleString('id-ID')}\`}</span>
                              <span className="font-semibold">{product.currency} {(getChildPrice(Number(product.price), 'infant') * infantPax).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          {getChildPricing()?.enabled && childPax > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{childPax} anak × {product.currency} {getChildPrice(Number(product.price), 'child').toLocaleString('id-ID')}</span>
                              <span className="font-semibold">{product.currency} {(getChildPrice(Number(product.price), 'child') * childPax).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          {getChildPricing()?.enabled && teenPax > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{teenPax} remaja × {product.currency} {getChildPrice(Number(product.price), 'teen').toLocaleString('id-ID')}</span>
                              <span className="font-semibold">{product.currency} {(getChildPrice(Number(product.price), 'teen') * teenPax).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                      ) : (<div className="flex justify-between text-sm text-gray-600"><span>{nights > 0 ? \`\${nights} malam\` : '— malam'} × {stayGuests} tamu × {product.currency} {Number(product.price).toLocaleString('id-ID')}</span><span className="font-semibold">{nights > 0 ? \`\${product.currency} \${(Number(product.price) * nights * stayGuests).toLocaleString('id-ID')}\` : '—'}</span></div>)}
                      <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-gray-900"><span>{t('checkout.total', 'Total')}</span><span className="text-primary-600">{isTourProduct ? \`\${product.currency} \${calcTourTotal(Number(product.price)).toLocaleString('id-ID')}\` : nights > 0 ? \`\${product.currency} \${tourStayTotal.toLocaleString('id-ID')}\` : '—'}</span></div>`;

if (content.includes(OLD_TOUR_SUMMARY)) {
  content = content.replace(OLD_TOUR_SUMMARY, NEW_TOUR_SUMMARY);
  console.log('✅ Updated price summary box');
} else {
  console.log('⚠️  Price summary pattern not found');
}

fs.writeFileSync('pages/ProductDetail.tsx', content, 'utf8');
console.log('\n✅ ProductDetail.tsx updated!');

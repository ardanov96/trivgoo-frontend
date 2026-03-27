// patch-addproduct-group-pricing.cjs
// Inject Group Pricing & Child Pricing UI ke AddProduct.tsx
const fs = require('fs');

let content = fs.readFileSync('pages/agent/AddProduct.tsx', 'utf8');

// ── 1. Tambah state untuk groupPricingTiers dan childPricing ─────────────────
const OLD_TOUR_STATE = `  const [tourDetails, setTourDetails] = useState({
    duration: "",
    tripType: "Open Trip" as "Open Trip" | "Private Trip" | "Group Trip",
    inclusions: [""],
    exclusions: [""],
  });`;

const NEW_TOUR_STATE = `  const [tourDetails, setTourDetails] = useState({
    duration: "",
    tripType: "Open Trip" as "Open Trip" | "Private Trip" | "Group Trip",
    inclusions: [""],
    exclusions: [""],
  });

  // ── Group Trip pricing tiers ─────────────────────────────────────────────
  const [groupPricingTiers, setGroupPricingTiers] = useState([
    { label: 'Group of 6-10', minPax: 6,  maxPax: 10, discountPct: 15 },
    { label: 'Group of 3-5',  minPax: 3,  maxPax: 5,  discountPct: 8  },
    { label: 'Group of 2',    minPax: 2,  maxPax: 2,  discountPct: 0  },
  ]);

  // ── Child pricing ────────────────────────────────────────────────────────
  const [childPricing, setChildPricing] = useState({
    enabled: false,
    infant: 100,  // bayi 0-1 tahun gratis by default
    child: 30,    // anak 2-11 tahun diskon 30%
    teen: 15,     // remaja 12-17 tahun diskon 15%
  });`;

if (content.includes(OLD_TOUR_STATE)) {
  content = content.replace(OLD_TOUR_STATE, NEW_TOUR_STATE);
  console.log('✅ Added groupPricingTiers and childPricing state');
} else {
  console.log('⚠️  Tour state pattern not found');
}

// ── 2. Update buildDetails() untuk include groupPricingTiers dan childPricing ─
const OLD_BUILD = `        duration: tourDetails.duration || "1 Day",
        tripType: tourDetails.tripType,
        minPax: tourDetails.tripType === 'Private Trip' ? 1 : tourDetails.tripType === 'Group Trip' ? 6 : 2,
        itinerary: itineraryItems,`;

const NEW_BUILD = `        duration: tourDetails.duration || "1 Day",
        tripType: tourDetails.tripType,
        minPax: tourDetails.tripType === 'Private Trip' ? 1 : tourDetails.tripType === 'Group Trip' ? 6 : 2,
        groupPricingTiers: tourDetails.tripType === 'Group Trip' ? groupPricingTiers : undefined,
        childPricing: childPricing.enabled ? childPricing : undefined,
        itinerary: itineraryItems,`;

if (content.includes(OLD_BUILD)) {
  content = content.replace(OLD_BUILD, NEW_BUILD);
  console.log('✅ Updated buildDetails()');
} else {
  console.log('⚠️  buildDetails pattern not found');
}

// ── 3. Update edit mode load untuk groupPricingTiers dan childPricing ─────────
const OLD_LOAD = `                setTourDetails({
                  duration: product.details.duration,
                  tripType: (product.details as any).tripType || "Open Trip",
                  inclusions: product.details.inclusions,
                  exclusions: product.details.exclusions,
                });`;

const NEW_LOAD = `                setTourDetails({
                  duration: product.details.duration,
                  tripType: (product.details as any).tripType || "Open Trip",
                  inclusions: product.details.inclusions,
                  exclusions: product.details.exclusions,
                });
                if ((product.details as any).groupPricingTiers) {
                  setGroupPricingTiers((product.details as any).groupPricingTiers);
                }
                if ((product.details as any).childPricing) {
                  setChildPricing((product.details as any).childPricing);
                }`;

if (content.includes(OLD_LOAD)) {
  content = content.replace(OLD_LOAD, NEW_LOAD);
  console.log('✅ Updated edit mode load');
} else {
  console.log('⚠️  Edit mode load pattern not found');
}

// ── 4. Inject Group Pricing UI setelah Trip Type info banner ─────────────────
// Cari posisi setelah info banner tripType, sebelum Duration grid
const GROUP_PRICING_UI = `
                {/* ── Group Trip Pricing Tiers ── */}
                {tourDetails.tripType === 'Group Trip' && (
                  <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-purple-900">Pricing per Group Size</p>
                        <p className="text-xs text-purple-500 mt-0.5">Diskon otomatis dari base price berdasarkan jumlah peserta</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {groupPricingTiers.map((tier, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-3 border border-purple-100 flex items-center gap-3">
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Label</label>
                              <input
                                type="text"
                                value={tier.label}
                                onChange={e => {
                                  const t = [...groupPricingTiers];
                                  t[idx] = { ...t[idx], label: e.target.value };
                                  setGroupPricingTiers(t);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-purple-400"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Min–Max Pax</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number" min={1}
                                  value={tier.minPax}
                                  onChange={e => {
                                    const t = [...groupPricingTiers];
                                    t[idx] = { ...t[idx], minPax: Number(e.target.value) };
                                    setGroupPricingTiers(t);
                                  }}
                                  className="w-12 px-2 py-1.5 text-xs rounded-lg border border-gray-200 text-center focus:outline-none focus:border-purple-400"
                                />
                                <span className="text-gray-400 text-xs">–</span>
                                <input
                                  type="number" min={1}
                                  value={tier.maxPax === 99 ? '' : tier.maxPax}
                                  placeholder="∞"
                                  onChange={e => {
                                    const t = [...groupPricingTiers];
                                    t[idx] = { ...t[idx], maxPax: e.target.value === '' ? 99 : Number(e.target.value) };
                                    setGroupPricingTiers(t);
                                  }}
                                  className="w-12 px-2 py-1.5 text-xs rounded-lg border border-gray-200 text-center focus:outline-none focus:border-purple-400"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Diskon %</label>
                              <div className="relative">
                                <input
                                  type="number" min={0} max={99}
                                  value={tier.discountPct}
                                  onChange={e => {
                                    const t = [...groupPricingTiers];
                                    t[idx] = { ...t[idx], discountPct: Number(e.target.value) };
                                    setGroupPricingTiers(t);
                                  }}
                                  className="w-full px-2 py-1.5 pr-6 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-purple-400"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setGroupPricingTiers(groupPricingTiers.filter((_, i) => i !== idx))}
                            className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                            disabled={groupPricingTiers.length <= 1}
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setGroupPricingTiers([...groupPricingTiers, { label: 'Group baru', minPax: 1, maxPax: 99, discountPct: 0 }])}
                      className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Tier
                    </button>
                    <div className="mt-3 bg-purple-100 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-purple-700 font-semibold">
                        💡 Diskon dihitung dari base price per orang. Contoh: base Rp 500k, diskon 15% → Rp 425k/orang untuk tier ini.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Child Pricing ── */}
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-amber-900">Harga Anak-anak</p>
                      <p className="text-xs text-amber-500 mt-0.5">Diskon % dari base price per kategori usia</p>
                    </div>
                    <div
                      onClick={() => setChildPricing(p => ({ ...p, enabled: !p.enabled }))}
                      className={\`relative w-11 h-6 rounded-full transition-colors cursor-pointer \${childPricing.enabled ? 'bg-amber-500' : 'bg-gray-300'}\`}
                    >
                      <div className={\`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform \${childPricing.enabled ? 'translate-x-5' : 'translate-x-0'}\`} />
                    </div>
                  </div>
                  {childPricing.enabled && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'infant', label: '🍼 Bayi', desc: '0–1 tahun' },
                        { key: 'child',  label: '👦 Anak', desc: '2–11 tahun' },
                        { key: 'teen',   label: '🧑 Remaja', desc: '12–17 tahun' },
                      ].map(cat => (
                        <div key={cat.key} className="bg-white rounded-xl p-3 border border-amber-100 text-center">
                          <p className="text-sm mb-0.5">{cat.label}</p>
                          <p className="text-[10px] text-gray-400 mb-2">{cat.desc}</p>
                          <div className="relative">
                            <input
                              type="number" min={0} max={100}
                              value={childPricing[cat.key as keyof typeof childPricing] as number}
                              onChange={e => setChildPricing(p => ({ ...p, [cat.key]: Number(e.target.value) }))}
                              className="w-full px-2 py-1.5 pr-6 text-sm font-bold rounded-lg border border-gray-200 text-center focus:outline-none focus:border-amber-400"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                          </div>
                          <p className="text-[10px] text-amber-600 font-semibold mt-1">
                            {childPricing[cat.key as keyof typeof childPricing] === 100 ? 'GRATIS' : \`Diskon \${childPricing[cat.key as keyof typeof childPricing]}%\`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
`;

// Inject setelah info banner trip type, sebelum Duration grid
const INJECT_AFTER = `                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">`;

const INJECT_REPLACEMENT = `                  </p>
                </div>
${GROUP_PRICING_UI}
                <div className="grid grid-cols-2 gap-6">`;

if (content.includes(INJECT_AFTER)) {
  content = content.replace(INJECT_AFTER, INJECT_REPLACEMENT);
  console.log('✅ Injected Group Pricing & Child Pricing UI');
} else {
  console.log('⚠️  Inject position not found');
}

fs.writeFileSync('pages/agent/AddProduct.tsx', content, 'utf8');
console.log('\n✅ AddProduct.tsx updated!');

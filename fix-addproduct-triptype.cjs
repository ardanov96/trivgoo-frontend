// fix-addproduct-triptype.cjs
const fs = require('fs');
const path = 'pages/agent/AddProduct.tsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// ── Fix 1: tourDetails state (line 464-471) ───────────────────────────────
// Tambah tripType setelah difficulty
content = content.replace(
  `    duration: "",
    groupSize: "",
    difficulty: "Easy" as "Easy" | "Moderate" | "Hard",
    ageRestriction: "",
    meetingPoint: "",
    inclusions: [""],
    exclusions: [""],`,
  `    duration: "",
    groupSize: "",
    difficulty: "Easy" as "Easy" | "Moderate" | "Hard",
    tripType: "Open Trip" as "Open Trip" | "Private Trip" | "Group Trip",
    ageRestriction: "",
    meetingPoint: "",
    inclusions: [""],
    exclusions: [""],`
);

// ── Fix 2: Edit mode load (line ~703) ────────────────────────────────────
content = content.replace(
  `                  duration: product.details.duration,
                  groupSize: product.details.groupSize,
                  difficulty: product.details.difficulty,
                  ageRestriction: product.details.ageRestriction || "",
                  meetingPoint: product.details.meetingPoint,
                  inclusions: product.details.inclusions,
                  exclusions: product.details.exclusions,`,
  `                  duration: product.details.duration,
                  groupSize: product.details.groupSize,
                  difficulty: product.details.difficulty,
                  tripType: (product.details as any).tripType || "Open Trip",
                  ageRestriction: product.details.ageRestriction || "",
                  meetingPoint: product.details.meetingPoint,
                  inclusions: product.details.inclusions,
                  exclusions: product.details.exclusions,`
);

// ── Fix 3: buildDetails() (line ~963) ───────────────────────────────────
content = content.replace(
  `        duration: tourDetails.duration || "1 Day",
        groupSize: tourDetails.groupSize || "Flexible",
        difficulty: tourDetails.difficulty,
        meetingPoint: tourDetails.meetingPoint,
        ageRestriction: tourDetails.ageRestriction,
        itinerary: itineraryItems,`,
  `        duration: tourDetails.duration || "1 Day",
        groupSize: tourDetails.groupSize || "Flexible",
        difficulty: tourDetails.difficulty,
        tripType: tourDetails.tripType,
        minPax: tourDetails.tripType === 'Private Trip' ? 1 : tourDetails.tripType === 'Group Trip' ? 6 : 2,
        meetingPoint: tourDetails.meetingPoint,
        ageRestriction: tourDetails.ageRestriction,
        itinerary: itineraryItems,`
);

// ── Fix 4: Inject Trip Type selector UI sebelum Duration grid ────────────
// Cari baris "Tour Specifics" section dan tambah Trip Type selector
const TRIP_TYPE_UI = `
                {/* ── Trip Type ── */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Trip Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: 'Open Trip' as const,    label: 'Open Trip',    desc: 'Min. 2 peserta', icon: '🌐' },
                      { value: 'Private Trip' as const, label: 'Private Trip', desc: 'Min. 1 peserta', icon: '🔒' },
                      { value: 'Group Trip' as const,   label: 'Group Trip',   desc: 'Min. 6 peserta', icon: '👥' },
                    ]).map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setTourDetails({ ...tourDetails, tripType: opt.value })}
                        className={\`relative p-3 rounded-xl border-2 text-left transition-all \${
                          tourDetails.tripType === opt.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }\`}
                      >
                        {tourDetails.tripType === opt.value && (
                          <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <span className="text-lg mb-1 block">{opt.icon}</span>
                        <p className={\`text-xs font-bold \${tourDetails.tripType === opt.value ? 'text-primary-700' : 'text-gray-800'}\`}>{opt.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mt-2 flex items-center gap-1.5">
                    <span>ℹ️</span>
                    {tourDetails.tripType === 'Open Trip' && 'Peserta dari berbagai grup bergabung. Minimum 2 peserta.'}
                    {tourDetails.tripType === 'Private Trip' && 'Paket eksklusif untuk satu grup/individu. Minimum 1 peserta.'}
                    {tourDetails.tripType === 'Group Trip' && 'Paket khusus grup besar. Minimum 6 peserta.'}
                  </p>
                </div>

`;

// Inject sebelum <div className="grid grid-cols-2 gap-6"> di section isTour
// Cari anchor yang unik: Duration label dalam isTour section
const DURATION_ANCHOR = `                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>`;

if (content.includes(DURATION_ANCHOR)) {
  content = content.replace(DURATION_ANCHOR, TRIP_TYPE_UI + DURATION_ANCHOR);
  console.log('✅ Trip Type UI injected');
} else {
  console.log('⚠️  Duration anchor not found');
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ AddProduct.tsx saved');

// Verify
console.log('\nVerify:');
const verify = content.split('\n');
verify.forEach((l, i) => {
  if (l.includes('tripType') || l.includes('Trip Type') || l.includes('minPax')) {
    console.log(`  ${i+1}: ${l.trim().substring(0, 80)}`);
  }
});

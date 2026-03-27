// fix-triptype.cjs
const fs = require('fs');

// ── 1. types.ts — tambah tripType dan minPax ke TourDetails ──────────────
console.log('🔧 Updating types.ts...');
const typesPath = 'types.ts';
let types = fs.readFileSync(typesPath, 'utf8');

const oldTourDetails = `export interface TourDetails {
  type: "tour";
  tourCategory: TourCategory;
  duration: string;
  groupSize: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  ageRestriction?: string;
  meetingPoint: string;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
}`;

const newTourDetails = `export type TripType = 'Open Trip' | 'Private Trip' | 'Group Trip';

export interface TourDetails {
  type: "tour";
  tourCategory: TourCategory;
  tripType?: TripType;
  minPax?: number;
  duration: string;
  groupSize: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  ageRestriction?: string;
  meetingPoint: string;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
}`;

if (types.includes(oldTourDetails)) {
  types = types.replace(oldTourDetails, newTourDetails);
  fs.writeFileSync(typesPath, types, 'utf8');
  console.log('✅ types.ts updated');
} else {
  console.log('⚠️  types.ts pattern not found exactly, trying partial match...');
  if (!types.includes('tripType?:') && types.includes('tourCategory: TourCategory;')) {
    // Insert after tourCategory line
    types = types.replace(
      '  tourCategory: TourCategory;\n',
      '  tourCategory: TourCategory;\n  tripType?: TripType;\n  minPax?: number;\n'
    );
    // Add TripType type before TourDetails
    types = types.replace(
      'export interface TourDetails {',
      "export type TripType = 'Open Trip' | 'Private Trip' | 'Group Trip';\n\nexport interface TourDetails {"
    );
    fs.writeFileSync(typesPath, types, 'utf8');
    console.log('✅ types.ts updated (partial)');
  }
}

// ── 2. AddProduct.tsx — tambah tripType state + input form ───────────────
console.log('\n🔧 Updating AddProduct.tsx...');
const addProductPath = 'pages/agent/AddProduct.tsx';
let addProduct = fs.readFileSync(addProductPath, 'utf8');

// 2a. Tambah tripType ke tourDetails state
const oldTourState = `  const [tourDetails, setTourDetails] = useState({
    duration: "",
    groupSize: "",
    difficulty: "Easy" as "Easy" | "Moderate" | "Hard",
    ageRestriction: "",
    meetingPoint: "",
    inclusions: [""],
    exclusions: [""],
  });`;

const newTourState = `  const [tourDetails, setTourDetails] = useState({
    duration: "",
    groupSize: "",
    difficulty: "Easy" as "Easy" | "Moderate" | "Hard",
    ageRestriction: "",
    meetingPoint: "",
    tripType: "Open Trip" as "Open Trip" | "Private Trip" | "Group Trip",
    inclusions: [""],
    exclusions: [""],
  });`;

if (addProduct.includes(oldTourState)) {
  addProduct = addProduct.replace(oldTourState, newTourState);
  console.log('  ✅ tourDetails state updated');
} else {
  console.log('  ⚠️  tourDetails state not found exactly');
}

// 2b. Tambah tripType ke buildDetails()
const oldBuildDetails = `        duration: tourDetails.duration || "1 Day",
        groupSize: tourDetails.groupSize || "Flexible",
        difficulty: tourDetails.difficulty,
        meetingPoint: tourDetails.meetingPoint,
        ageRestriction: tourDetails.ageRestriction,`;

const newBuildDetails = `        duration: tourDetails.duration || "1 Day",
        groupSize: tourDetails.groupSize || "Flexible",
        difficulty: tourDetails.difficulty,
        meetingPoint: tourDetails.meetingPoint,
        ageRestriction: tourDetails.ageRestriction,
        tripType: tourDetails.tripType,
        minPax: tourDetails.tripType === 'Private Trip' ? 1 : tourDetails.tripType === 'Group Trip' ? 6 : 2,`;

if (addProduct.includes(oldBuildDetails)) {
  addProduct = addProduct.replace(oldBuildDetails, newBuildDetails);
  console.log('  ✅ buildDetails() updated');
} else {
  console.log('  ⚠️  buildDetails() pattern not found');
}

// 2c. Load tripType saat edit mode
const oldEditLoad = `                setTourDetails({
                  duration: product.details.duration,
                  groupSize: product.details.groupSize,
                  difficulty: product.details.difficulty,
                  ageRestriction: product.details.ageRestriction || "",
                  meetingPoint: product.details.meetingPoint,
                  inclusions: product.details.inclusions,
                  exclusions: product.details.exclusions,
                });`;

const newEditLoad = `                setTourDetails({
                  duration: product.details.duration,
                  groupSize: product.details.groupSize,
                  difficulty: product.details.difficulty,
                  ageRestriction: product.details.ageRestriction || "",
                  meetingPoint: product.details.meetingPoint,
                  tripType: (product.details as any).tripType || "Open Trip",
                  inclusions: product.details.inclusions,
                  exclusions: product.details.exclusions,
                });`;

if (addProduct.includes(oldEditLoad)) {
  addProduct = addProduct.replace(oldEditLoad, newEditLoad);
  console.log('  ✅ edit mode load updated');
} else {
  console.log('  ⚠️  edit mode load pattern not found');
}

// 2d. Tambah Trip Type input di form — setelah Duration & Group Size grid
const oldFormGrid = `                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. 3 Days" value={tourDetails.duration} onChange={(e) => setTourDetails({ ...tourDetails, duration: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Group Size</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. Max 10" value={tourDetails.groupSize} onChange={(e) => setTourDetails({ ...tourDetails, groupSize: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Difficulty</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={tourDetails.difficulty} onChange={(e) => setTourDetails({ ...tourDetails, difficulty: e.target.value as any })}>
                      <option>Easy</option><option>Moderate</option><option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meeting Point</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. Hotel Lobby" value={tourDetails.meetingPoint} onChange={(e) => setTourDetails({ ...tourDetails, meetingPoint: e.target.value })} />
                  </div>
                </div>`;

const newFormGrid = `                {/* ── Trip Type Selector ── */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trip Type <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: 'Open Trip',    label: 'Open Trip',    desc: 'Min. 2 peserta', icon: '🌐' },
                      { value: 'Private Trip', label: 'Private Trip', desc: 'Min. 1 peserta', icon: '🔒' },
                      { value: 'Group Trip',   label: 'Group Trip',   desc: 'Min. 6 peserta', icon: '👥' },
                    ] as const).map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setTourDetails({ ...tourDetails, tripType: opt.value })}
                        className={\`relative p-3 rounded-xl border-2 text-left transition-all \${tourDetails.tripType === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-white'}\`}
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
                    {tourDetails.tripType === 'Open Trip' && 'Open Trip: Peserta dari berbagai grup bergabung. Minimum 2 peserta.'}
                    {tourDetails.tripType === 'Private Trip' && 'Private Trip: Paket eksklusif untuk satu grup/individu. Minimum 1 peserta.'}
                    {tourDetails.tripType === 'Group Trip' && 'Group Trip: Paket khusus grup besar. Minimum 6 peserta.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. 3 Days" value={tourDetails.duration} onChange={(e) => setTourDetails({ ...tourDetails, duration: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Group Size</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. Max 10" value={tourDetails.groupSize} onChange={(e) => setTourDetails({ ...tourDetails, groupSize: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Difficulty</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={tourDetails.difficulty} onChange={(e) => setTourDetails({ ...tourDetails, difficulty: e.target.value as any })}>
                      <option>Easy</option><option>Moderate</option><option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meeting Point</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. Hotel Lobby" value={tourDetails.meetingPoint} onChange={(e) => setTourDetails({ ...tourDetails, meetingPoint: e.target.value })} />
                  </div>
                </div>`;

if (addProduct.includes(oldFormGrid)) {
  addProduct = addProduct.replace(oldFormGrid, newFormGrid);
  console.log('  ✅ Tour form grid updated with Trip Type selector');
} else {
  console.log('  ⚠️  Tour form grid not found exactly');
}

fs.writeFileSync(addProductPath, addProduct, 'utf8');
console.log('✅ AddProduct.tsx saved');

// ── 3. ProductDetail.tsx — dinamis minPax berdasarkan tripType ───────────
console.log('\n🔧 Updating ProductDetail.tsx...');
const pdPath = 'pages/ProductDetail.tsx';
let pd = fs.readFileSync(pdPath, 'utf8');

// 3a. Update highlights untuk tampilkan tripType dan minPax dinamis
const oldHighlights = `    const highlights = isTourProduct ? [
      { icon: Clock, label: 'Durasi', value: (tourDetails as any)?.duration || 'Full Day' },
      { icon: Users, label: 'Min. Peserta', value: \`\${(tourDetails as any)?.minPax || 2} orang\` },
      { icon: Award, label: 'Kategori', value: (tourDetails as any)?.tourCategory || 'Wisata' },
      { icon: CheckCircle2, label: 'Bahasa', value: (tourDetails as any)?.language || 'Indonesia' },
    ]`;

const newHighlights = `    // Hitung minPax dari tripType
    const tripType = (tourDetails as any)?.tripType || 'Open Trip';
    const minPaxFromTripType = tripType === 'Private Trip' ? 1 : tripType === 'Group Trip' ? 6 : 2;
    const minPax = (tourDetails as any)?.minPax ?? minPaxFromTripType;

    const highlights = isTourProduct ? [
      { icon: Clock, label: 'Durasi', value: (tourDetails as any)?.duration || 'Full Day' },
      { icon: Users, label: 'Min. Peserta', value: \`\${minPax} orang\` },
      { icon: Award, label: 'Tipe Trip', value: tripType },
      { icon: CheckCircle2, label: 'Kategori', value: (tourDetails as any)?.tourCategory || 'Wisata' },
    ]`;

if (pd.includes(oldHighlights)) {
  pd = pd.replace(oldHighlights, newHighlights);
  console.log('  ✅ highlights updated');
} else {
  console.log('  ⚠️  highlights pattern not found');
}

// 3b. Update validasi minPax di generateCheckoutPayload
const oldValidation = `      if (isTourProduct) {
        if (!tourDate) errors.tourDate = 'Pilih tanggal tour terlebih dahulu';
        if (tourPax < 2) errors.tourPax = t('product.min_pax_error', 'Minimum 2 participants');`;

const newValidation = `      if (isTourProduct) {
        const _tripType = (product.details as any)?.tripType || 'Open Trip';
        const _minPax = _tripType === 'Private Trip' ? 1 : _tripType === 'Group Trip' ? 6 : 2;
        if (!tourDate) errors.tourDate = 'Pilih tanggal tour terlebih dahulu';
        if (tourPax < _minPax) errors.tourPax = \`Minimum \${_minPax} peserta untuk \${_tripType}\`;`;

if (pd.includes(oldValidation)) {
  pd = pd.replace(oldValidation, newValidation);
  console.log('  ✅ validation updated');
} else {
  console.log('  ⚠️  validation pattern not found');
}

// 3c. Update tombol minus tourPax agar dinamis
const oldMinus = `onClick={() => setTourPax(p => Math.max(2, p - 1))}`;
// Ganti dengan logika dinamis — perlu ambil minPax dari product
const newMinus = `onClick={() => {
                          const _tt = (product?.details as any)?.tripType || 'Open Trip';
                          const _min = _tt === 'Private Trip' ? 1 : _tt === 'Group Trip' ? 6 : 2;
                          setTourPax(p => Math.max(_min, p - 1));
                        }}`;

if (pd.includes(oldMinus)) {
  pd = pd.replace(oldMinus, newMinus);
  console.log('  ✅ minus button updated');
} else {
  console.log('  ⚠️  minus button pattern not found');
}

// 3d. Update default tourPax state — tetap 2 tapi akan disesuaikan saat product load
// Tambah useEffect untuk set tourPax default berdasarkan tripType
const oldLoadEffect = `  useEffect(() => {
    const load = async () => {
      if (!id) {
        setProduct(null);
        setReviews([]);
        setError('Product ID is missing.');
        setIsLoading(false);
        return;
      }`;

const newLoadEffect = `  // Set default tourPax berdasarkan tripType saat product berhasil dimuat
  useEffect(() => {
    if (!product) return;
    const tt = (product.details as any)?.tripType || 'Open Trip';
    const defaultMin = tt === 'Private Trip' ? 1 : tt === 'Group Trip' ? 6 : 2;
    setTourPax(prev => Math.max(prev, defaultMin));
  }, [product]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setProduct(null);
        setReviews([]);
        setError('Product ID is missing.');
        setIsLoading(false);
        return;
      }`;

if (pd.includes(oldLoadEffect)) {
  pd = pd.replace(oldLoadEffect, newLoadEffect);
  console.log('  ✅ useEffect for default tourPax added');
} else {
  console.log('  ⚠️  load effect pattern not found');
}

fs.writeFileSync(pdPath, pd, 'utf8');
console.log('✅ ProductDetail.tsx saved');

// ── Verify ───────────────────────────────────────────────────────────────
console.log('\n📋 Verify results:');
console.log('grep -n "tripType\\|minPax\\|TripType" types.ts');
console.log('grep -n "tripType\\|Trip Type" pages/agent/AddProduct.tsx | head -10');
console.log('grep -n "tripType\\|minPax\\|_tripType\\|_min" pages/ProductDetail.tsx | head -10');

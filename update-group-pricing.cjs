// update-group-pricing.cjs
const fs = require('fs');

// ── 1. Update types.ts ────────────────────────────────────────────────────────
console.log('🔧 Updating types.ts...');
let types = fs.readFileSync('types.ts', 'utf8');

const OLD_TOUR_DETAILS = `export interface TourDetails {
  type: "tour";
  tourCategory: TourCategory;
  duration: string;
  tripType?: "Open Trip" | "Private Trip" | "Group Trip";
  minPax?: number;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
}`;

const NEW_TOUR_DETAILS = `// ─── Group Trip Pricing Tier ────────────────────────────────────────────────
export interface GroupPricingTier {
  label: string;       // e.g. "Group of 6-10"
  minPax: number;      // min peserta di tier ini
  maxPax: number;      // max peserta (99 = unlimited)
  discountPct: number; // diskon % dari base price
}

// ─── Child Pricing ───────────────────────────────────────────────────────────
export interface ChildPricing {
  enabled: boolean;
  infant: number;   // diskon % untuk bayi 0-1 tahun (misal 100 = gratis)
  child: number;    // diskon % untuk anak 2-11 tahun
  teen: number;     // diskon % untuk remaja 12-17 tahun
}

export interface TourDetails {
  type: "tour";
  tourCategory: TourCategory;
  duration: string;
  tripType?: "Open Trip" | "Private Trip" | "Group Trip";
  minPax?: number;
  // Group Trip pricing tiers (otomatis dari base price + diskon %)
  groupPricingTiers?: GroupPricingTier[];
  // Child pricing (opsional, bisa diaktifkan semua trip type)
  childPricing?: ChildPricing;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
}`;

if (types.includes(OLD_TOUR_DETAILS)) {
  types = types.replace(OLD_TOUR_DETAILS, NEW_TOUR_DETAILS);
  fs.writeFileSync('types.ts', types, 'utf8');
  console.log('✅ types.ts updated');
} else {
  console.log('⚠️  Pattern not found, manual update needed');
}

// ── 2. Verify ─────────────────────────────────────────────────────────────────
console.log('\nVerify TourDetails:');
const updated = fs.readFileSync('types.ts', 'utf8');
const start = updated.indexOf('export interface TourDetails');
const end = updated.indexOf('\nexport interface StayDetails');
console.log(updated.substring(start, end));

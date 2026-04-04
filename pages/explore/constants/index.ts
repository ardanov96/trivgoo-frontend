import type { Variants } from 'framer-motion';

// ── Destination banners ───────────────────────────────────────────────────────

export const DESTINATION_BANNERS: Record<string, { image: string; subtitle: string }> = {
  'bali':         { image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80', subtitle: "Don't forget to check out these activities while you're here." },
  'raja ampat':   { image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1600&q=80', subtitle: "Explore the world's best diving and marine paradise." },
  'yogyakarta':   { image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1600&q=80', subtitle: "Discover the cultural heart of Java." },
  'lombok':       { image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=80', subtitle: "Find your paradise on pristine white-sand beaches." },
  'komodo':       { image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=1600&q=80', subtitle: "Home to dragons, pink beaches, and crystal waters." },
  'tokyo':        { image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80', subtitle: "Where ancient tradition meets futuristic wonder." },
  'kyoto':        { image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80', subtitle: "Step into the timeless beauty of old Japan." },
  'seoul':        { image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1600&q=80', subtitle: "A city alive with culture, food, and energy." },
  'bangkok':      { image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1600&q=80', subtitle: "Temples, street food, and endless adventure." },
  'singapore':    { image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1600&q=80', subtitle: "Asia's most iconic city-state awaits you." },
  'padar island': { image: 'https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?auto=format&fit=crop&w=1600&q=80', subtitle: "Breathtaking hilltop views over Komodo's hidden gem." },
  'hong kong':    { image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80', subtitle: "A dazzling skyline where East meets West." },
};

export const CATEGORY_TABS = [
  { label: 'Travel',           id: 1 },
  { label: 'Hotel & Villa',    id: 2 },
  { label: 'Car Rental',       id: 3 },
  { label: 'Airport Transfer', id: 4 },
  { label: 'Event',            id: 5 },
];

export const TOUR_TAGS  = ['Family', 'Honeymoon', 'Solo Travel', 'Healing', 'Workation', 'Adventure', 'Cultural', 'Culinary', 'Eco Tourism'];
export const STAY_TAGS  = ['Hotel', 'Villa', 'Homestay', 'Resort'];

export const SORT_OPTIONS = [
  { value: 'price_asc',  label: 'Lowest Price' },
  { value: 'price_desc', label: 'Highest Price' },
  { value: 'rating',     label: 'Highest Rating' },
];

export const CAR_REVIEW_HIGHLIGHTS = ['Kemudahan Pickup', 'Kebersihan Mobil', 'Sikap Staff'];

// ── Framer Motion variants ────────────────────────────────────────────────────

export const containerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const fadeUpVariants: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const slideLeftVariants: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const filterContainerVariants: Variants = {
  hidden:  { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05, delayChildren: 0.1 } },
};

export const filterItemVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const carCardVariants: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export const CATEGORY_SLUG_MAP: Record<string, number> = {
  'tours':            1,
  'stays':            2,
  'car-rental':       3,
  'airport-transfer': 4,
  'events':           5,
};

export const CATEGORY_ID_TO_SLUG: Record<number, string> = {
  1: 'tours',
  2: 'stays',
  3: 'car-rental',
  4: 'airport-transfer',
  5: 'events',
};

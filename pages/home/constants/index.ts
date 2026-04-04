import { Building2, Calendar, Car, Palmtree, Plane } from 'lucide-react';
import type { TFunction } from 'i18next';

export const POPULAR_DESTINATIONS = [
  'Bali, Indonesia', 'Raja Ampat, Indonesia', 'Yogyakarta, Indonesia',
  'Padar Island, Indonesia', 'Tokyo, Japan', 'Seoul, South Korea',
  'Bangkok, Thailand', 'Singapore, Singapore', 'Kyoto, Japan', 'Hong Kong, China',
];

export const DESTINATION_STORIES = [
  { name: 'Bali',         image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=300&q=80' },
  { name: 'Raja Ampat',   image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=300&q=80' },
  { name: 'Yogyakarta',   image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80' },
  { name: 'Padar Island', image: 'https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tokyo',        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80' },
  { name: 'Seoul',        image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=300&q=80' },
  { name: 'Bangkok',      image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=300&q=80' },
  { name: 'Singapore',    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=300&q=80' },
  { name: 'Kyoto',        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80' },
  { name: 'Hong Kong',    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80' },
];

export const REVIEWS = [
  {
    id: 1, user: 'Sarah Jenkins', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5,
    text: 'The trip to Bali was absolutely magical. The guide knew all the hidden spots away from the crowds. Best vacation ever!',
    location: 'Ubud, Bali',
    tripImage: 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2, user: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5,
    text: 'Our honeymoon in Santorini was handled perfectly by Trivgoo. From the private villa to the sunset dinner, everything was seamless.',
    location: 'Oia, Santorini',
    tripImage: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3, user: 'Emma Wilson', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 4.8,
    text: 'I was nervous traveling solo to Japan, but the itinerary was so well planned. I felt safe and had the adventure of a lifetime.',
    location: 'Kyoto, Japan',
    tripImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
  },
];

// ── Fungsi — dipanggil di dalam komponen dengan t dari useTranslation ────────

export const getSearchCategories = (t: TFunction) => [
  {
    id: 'tours',
    label: t('home.cat_tours', 'Tour'),
    icon: Palmtree,
    placeholder: t('search.placeholder_tours', 'Where do you want to go?'),
  },
  {
    id: 'stays',
    label: t('home.cat_stays', 'Hotel & Villa'),
    icon: Building2,
    placeholder: t('search.placeholder_stays', 'City, hotel, or destination'),
  },
  {
    id: 'cars',
    label: t('home.cat_cars', 'Car Rental'),
    icon: Car,
    placeholder: t('search.placeholder_cars', 'Pick-up location'),
  },
  {
    id: 'transfers',
    label: t('home.cat_transfers', 'Airport Transfer'),
    icon: Plane,
    placeholder: t('search.placeholder_transfers', 'Airport or Hotel'),
  },
  {
    id: 'events',
    label: t('home.cat_events', 'Event'),
    icon: Calendar,
    placeholder: t('search.placeholder_events', 'Concert, festival, or event'),
  },
];

export const getTravelFilters = (t: TFunction) => [
  t('home.filter_all', 'All'),
  t('home.filter_family', 'Family'),
  t('home.filter_honeymoon', 'Honeymoon'),
  t('home.filter_solo', 'Solo Travel'),
  t('home.filter_healing', 'Healing'),
  t('home.filter_workation', 'Workation'),
  t('home.filter_adventure', 'Adventure'),
  t('home.filter_cultural', 'Cultural'),
  t('home.filter_culinary', 'Culinary'),
  t('home.filter_eco', 'Eco Tourism'),
];

// Tetap ekspor versi statis untuk backward compatibility
export const SEARCH_CATEGORIES = [
  { id: 'tours',     label: 'Tour',            icon: Palmtree,  placeholder: 'Where do you want to go?' },
  { id: 'stays',     label: 'Hotel & Villa',   icon: Building2, placeholder: 'City, hotel, or destination' },
  { id: 'cars',      label: 'Car Rental',      icon: Car,       placeholder: 'Pick-up location' },
  { id: 'transfers', label: 'Airport Transfer',icon: Plane,     placeholder: 'Airport or Hotel' },
  { id: 'events',    label: 'Event',           icon: Calendar,  placeholder: 'Concert, festival, or event' },
];

export const TRAVEL_FILTERS = [
  'All', 'Family', 'Honeymoon', 'Solo Travel', 'Healing',
  'Workation', 'Adventure', 'Cultural', 'Culinary', 'Eco Tourism',
];

export const ITINERARY_CARDS = [
  { id: 1, destination: 'Bali',       title: '5D4N Bali Cultural Escape',      duration: '5 Days 4 Nights', pax: 'For 2–8 pax',  tag: 'Honeymoon', tagColor: 'bg-rose-100 text-rose-600',   image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
  { id: 2, destination: 'Raja Ampat', title: '7D6N Raja Ampat Dive Adventure', duration: '7 Days 6 Nights', pax: 'For 4–10 pax', tag: 'Adventure', tagColor: 'bg-blue-100 text-blue-600',   image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=600&q=80' },
  { id: 3, destination: 'Yogyakarta', title: '4D3N Jogja Heritage Trail',      duration: '4 Days 3 Nights', pax: 'For 2–12 pax', tag: 'Cultural',  tagColor: 'bg-amber-100 text-amber-700', image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80' },
  { id: 4, destination: 'Lombok',     title: '6D5N Lombok & Gili Islands',     duration: '6 Days 5 Nights', pax: 'For 2–6 pax',  tag: 'Healing',   tagColor: 'bg-green-100 text-green-600', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80' },
  { id: 5, destination: 'Komodo',     title: '5D4N Komodo & Pink Beach',       duration: '5 Days 4 Nights', pax: 'For 4–8 pax',  tag: 'Adventure', tagColor: 'bg-blue-100 text-blue-600',   image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=600&q=80' },
];

export const PROMO_CARDS = [
  {
    id: 'blog',     promoImage: '/homepage-asset/card1.png', title: 'Check out the Trivgoo Blog',
    description: 'Follow the latest travel trends, tips, and stories and plan your next unforgettable trip.',
    buttonLabel: 'Read Now', buttonLink: '/travel-blog',
    bg: 'from-primary-50/50 to-rose-50/50', border: 'border-primary-100/50',
    iconColor: 'text-primary-600', accent: 'bg-primary-500',
    buttonStyle: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/25',
  },
  {
    id: 'trivpay',  promoImage: '/homepage-asset/card2.png', title: 'Save on Fun with TrivPay',
    description: 'Find out how to save more when you book and leave a review',
    buttonLabel: 'How It Works', buttonLink: '/trivpay',
    bg: 'from-primary-50/50 to-rose-50/50', border: 'border-primary-100/50',
    iconColor: 'text-primary-600', accent: 'bg-primary-500',
    buttonStyle: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/25',
  },
  {
    id: 'referral', promoImage: '/homepage-asset/card3.png', title: 'Share Joy & Get Reward',
    description: 'Invite your friends to explore with Trivgoo and earn travel credits for every successful referral.',
    buttonLabel: 'Invite Friend', buttonLink: '/referral',
    bg: 'from-primary-50/50 to-rose-50/50', border: 'border-primary-100/50',
    iconColor: 'text-primary-600', accent: 'bg-primary-500',
    buttonStyle: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/25',
  },
];

export const WHY_CHOOSE_US = [
  { id: 'quality', promoImage: '/homepage-asset/whychoose1.png', title: 'Best Quality',   description: 'We ensure every destination and activity meets our high standards for your comfort.',     bg: 'from-orange-50/50 to-amber-50/50', border: 'border-emerald-100/50', iconColor: 'text-emerald-600', accent: 'bg-red-500' },
  { id: 'price',   promoImage: '/homepage-asset/whychoose2.png', title: 'Best Price',     description: 'Get the most competitive prices and exclusive deals for your dream vacation.',            bg: 'from-orange-50/50 to-amber-50/50', border: 'border-emerald-100/50', iconColor: 'text-emerald-600', accent: 'bg-red-500' },
  { id: 'support', promoImage: '/homepage-asset/whychoose3.png', title: '24/7 Support',   description: 'Our dedicated team is always ready to help you anytime, anywhere during your trip.',     bg: 'from-orange-50/50 to-amber-50/50', border: 'border-emerald-100/50', iconColor: 'text-emerald-600', accent: 'bg-red-500' },
  { id: 'secure',  promoImage: '/homepage-asset/whychoose4.png', title: 'Secure Payment', description: 'Your transactions are protected with the latest security technology for peace of mind.', bg: 'from-orange-50/50 to-amber-50/50', border: 'border-emerald-100/50', iconColor: 'text-emerald-600', accent: 'bg-red-500' },
];

export const CATEGORY_ID_MAP: Record<string, number> = {
  tours: 1, stays: 2, cars: 3, transfers: 4, events: 5,
};

export const TYPING_WORDS = ['Paradise', 'Adventure', 'Serenity', 'Escape'];
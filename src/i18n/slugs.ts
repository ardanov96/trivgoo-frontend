import type { SupportedLang } from './index';

export interface RouteSlugMap {
  explore:            string;
  tours:              string;
  stays:              string;
  'car-rental':       string;
  'airport-transfer': string;
  events:             string;
}

export const ROUTE_SLUGS: Record<SupportedLang, RouteSlugMap> = {
  id: { explore: 'explore', tours: 'tours',   stays: 'stays',        'car-rental': 'sewa-mobil',          'airport-transfer': 'transfer-bandara',        events: 'acara'           },
  en: { explore: 'explore', tours: 'tours',   stays: 'stays',        'car-rental': 'car-rental',          'airport-transfer': 'airport-transfer',        events: 'events'          },
  es: { explore: 'explore', tours: 'tours',   stays: 'alojamiento',  'car-rental': 'alquiler-coches',     'airport-transfer': 'transfer-aeropuerto',     events: 'eventos'         },
  zh: { explore: 'explore', tours: 'tours',   stays: 'stays',        'car-rental': 'rent-car',            'airport-transfer': 'airport-transfer',        events: 'events'          },
  ar: { explore: 'explore', tours: 'tours',   stays: 'stays',        'car-rental': 'car-rental',          'airport-transfer': 'airport-transfer',        events: 'events'          },
  ms: { explore: 'explore', tours: 'tours',   stays: 'penginapan',   'car-rental': 'sewa-kereta',         'airport-transfer': 'transfer-lapangan-terbang', events: 'acara'         },
  fr: { explore: 'explore', tours: 'tours',   stays: 'hebergement',  'car-rental': 'location-voiture',    'airport-transfer': 'transfert-aeroport',      events: 'evenements'      },
  de: { explore: 'explore', tours: 'touren',  stays: 'unterkunft',   'car-rental': 'mietwagen',           'airport-transfer': 'flughafentransfer',       events: 'veranstaltungen' },
  ja: { explore: 'explore', tours: 'tours',   stays: 'stays',        'car-rental': 'car-rental',          'airport-transfer': 'airport-transfer',        events: 'events'          },
  ko: { explore: 'explore', tours: 'tours',   stays: 'stays',        'car-rental': 'car-rental',          'airport-transfer': 'airport-transfer',        events: 'events'          },
  ru: { explore: 'explore', tours: 'tury',    stays: 'prozhivanie',  'car-rental': 'arenda-avtomobilya',  'airport-transfer': 'transfer-iz-aeroporta',   events: 'meropriyatiya'   },
  hi: { explore: 'explore', tours: 'tours',   stays: 'stays',        'car-rental': 'car-rental',          'airport-transfer': 'airport-transfer',        events: 'events'          },
};

// Reverse map: semua localized slug → canonical key
// Digunakan di Explore page untuk resolve /:categorySlug ke canonical
export const SLUG_TO_CANONICAL: Record<string, keyof RouteSlugMap> = 
  Object.values(ROUTE_SLUGS).reduce((acc, slugMap) => {
    (Object.entries(slugMap) as [keyof RouteSlugMap, string][]).forEach(([canonical, slug]) => {
      acc[slug] = canonical;
    });
    return acc;
  }, {} as Record<string, keyof RouteSlugMap>);
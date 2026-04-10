import http from './http';
import { Product } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TripPlanResult {
  itinerary:            string;
  recommendedProducts:  Product[];
  unavailableProducts:  Product[];   // booked/blocked on requested dates
  rawForHistory:        string;
  travelDates:          { start: string; end: string } | null;
}

export interface ConvMessage {
  role:    'user' | 'assistant';
  content: string;
}

export interface TravelDates {
  start: string;  // YYYY-MM-DD
  end:   string;  // YYYY-MM-DD
}

export interface SavedItinerary {
  id:                   number;
  title:                string;
  user_story:           string;
  itinerary:            string;
  recommended_products: Product[];
  share_token:          string;
  created_at:           string;
}

export interface SavedItineraryListItem {
  id:          number;
  title:       string;
  user_story:  string;
  share_token: string;
  created_at:  string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyResult(message: string): TripPlanResult {
  return {
    itinerary:           `**Gagal:** ${message}`,
    recommendedProducts: [],
    unavailableProducts: [],
    rawForHistory:       '',
    travelDates:         null,
  };
}

function extractResult(data: any): TripPlanResult {
  return {
    itinerary:           data.itinerary           ?? '',
    recommendedProducts: data.recommendedProducts ?? [],
    unavailableProducts: data.unavailableProducts ?? [],
    rawForHistory:       data.rawForHistory       ?? data.itinerary ?? '',
    travelDates:         data.travelDates         ?? null,
  };
}

// ── Generate (initial) ────────────────────────────────────────────────────────

export const generateTripPlan = async (
  userStory:    string,
  travelDates?: TravelDates,
): Promise<TripPlanResult> => {
  try {
    const res = await http.post('/ai/trip-plan', {
      userStory,
      travelStart: travelDates?.start,
      travelEnd:   travelDates?.end,
    });
    if (res.data?.error) throw new Error(res.data.message ?? 'AI error');
    return extractResult(res.data.data);
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Terjadi kesalahan.';
    console.error('[aiTripService.generate]', msg);
    return emptyResult(msg);
  }
};

// ── Refine (multi-turn) ───────────────────────────────────────────────────────

export const refineTripPlan = async (
  messages:     ConvMessage[],
  travelDates?: TravelDates,
): Promise<TripPlanResult> => {
  try {
    const res = await http.post('/ai/trip-refine', {
      messages,
      travelStart: travelDates?.start,
      travelEnd:   travelDates?.end,
    });
    if (res.data?.error) throw new Error(res.data.message ?? 'AI error');
    return extractResult(res.data.data);
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Terjadi kesalahan.';
    console.error('[aiTripService.refine]', msg);
    return emptyResult(msg);
  }
};

// ── Save itinerary ────────────────────────────────────────────────────────────

export const saveItinerary = async (payload: {
  title?:              string;
  userStory:           string;
  itinerary:           string;
  recommendedProducts: Product[];
}): Promise<{ id: number; title: string; shareToken: string }> => {
  const res = await http.post('/ai/itineraries', payload);
  if (res.data?.error) throw new Error(res.data.message ?? 'Gagal menyimpan');
  return res.data.data;
};

// ── List / Get / Delete saved itineraries ────────────────────────────────────

export const listSavedItineraries = async (): Promise<SavedItineraryListItem[]> => {
  const res = await http.get('/ai/itineraries');
  if (res.data?.error) throw new Error(res.data.message);
  return res.data.data ?? [];
};

export const getSavedItinerary = async (id: number): Promise<SavedItinerary> => {
  const res = await http.get(`/ai/itineraries/${id}`);
  if (res.data?.error) throw new Error(res.data.message);
  return res.data.data;
};

export const deleteSavedItinerary = async (id: number): Promise<void> => {
  const res = await http.delete(`/ai/itineraries/${id}`);
  if (res.data?.error) throw new Error(res.data.message);
};

export const getSharedItinerary = async (token: string): Promise<SavedItinerary> => {
  const res = await http.get(`/ai/itineraries/share/${token}`);
  if (res.data?.error) throw new Error(res.data.message);
  return res.data.data;
};
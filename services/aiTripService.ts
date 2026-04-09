import http from './http';
import { Product } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TripPlanResult {
  itinerary:           string;
  recommendedProducts: Product[];
  rawForHistory:       string;
}

export interface ConvMessage {
  role:    'user' | 'assistant';
  content: string;
}

// ── Generate (initial) ────────────────────────────────────────────────────────

export const generateTripPlan = async (
  userStory: string,
): Promise<TripPlanResult> => {
  try {
    const res = await http.post('/ai/trip-plan', { userStory });

    if (res.data?.error) throw new Error(res.data.message ?? 'AI error');

    return {
      itinerary:           res.data.data.itinerary           ?? '',
      recommendedProducts: res.data.data.recommendedProducts ?? [],
      rawForHistory:       res.data.data.rawForHistory       ?? res.data.data.itinerary ?? '',
    };
  } catch (err: any) {
    const message = err?.response?.data?.message ?? err?.message ?? 'Terjadi kesalahan.';
    console.error('[aiTripService.generate]', message);
    return { itinerary: `**Gagal:** ${message}`, recommendedProducts: [], rawForHistory: '' };
  }
};

// ── Refine (multi-turn) ───────────────────────────────────────────────────────

export const refineTripPlan = async (
  messages: ConvMessage[],
): Promise<TripPlanResult> => {
  try {
    const res = await http.post('/ai/trip-refine', { messages });

    if (res.data?.error) throw new Error(res.data.message ?? 'AI error');

    return {
      itinerary:           res.data.data.itinerary           ?? '',
      recommendedProducts: res.data.data.recommendedProducts ?? [],
      rawForHistory:       res.data.data.rawForHistory       ?? res.data.data.itinerary ?? '',
    };
  } catch (err: any) {
    const message = err?.response?.data?.message ?? err?.message ?? 'Terjadi kesalahan.';
    console.error('[aiTripService.refine]', message);
    return { itinerary: `**Gagal:** ${message}`, recommendedProducts: [], rawForHistory: '' };
  }
};

// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import id from './locales/id/translation.json';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import zh from './locales/zh/translation.json';
import ar from './locales/ar/translation.json';
import ms from './locales/ms/translation.json';
import fr from './locales/fr/translation.json';
import de from './locales/de/translation.json';
import ja from './locales/ja/translation.json';
import ko from './locales/ko/translation.json';
import ru from './locales/ru/translation.json';
import hi from './locales/hi/translation.json';

// ── Supported languages ────────────────────────────────────────────────────
export const SUPPORTED_LANGS = ['id', 'en', 'zh', 'ar', 'ms', 'fr', 'de', 'ja', 'ko', 'es', 'ru', 'hi'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

export const LANG_META: Record<SupportedLang, { label: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  id: { label: 'Indonesia', flag: '🇮🇩', dir: 'ltr' },
  en: { label: 'English',   flag: '🇬🇧', dir: 'ltr' },
  es: { label: 'Español',   flag: '🇪🇸', dir: 'ltr' },
  zh: { label: '中文',      flag: '🇨🇳', dir: 'ltr' },
  ar: { label: 'العربية',  flag: '🇸🇦', dir: 'rtl' },
  ms: { label: 'Melayu',    flag: '🇲🇾', dir: 'ltr' },
  fr: { label: 'Français',  flag: '🇫🇷', dir: 'ltr' },
  de: { label: 'Deutsch',   flag: '🇩🇪', dir: 'ltr' },
  ja: { label: '日本語',     flag: '🇯🇵', dir: 'ltr' },
  ko: { label: '한국어',     flag: '🇰🇷', dir: 'ltr' },
  ru: { label: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  hi: { label: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
};

// ── Init ───────────────────────────────────────────────────────────────────
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en },
      es: { translation: es },
      zh: { translation: zh },
      ar: { translation: ar },
      ms: { translation: ms },
      fr: { translation: fr },
      de: { translation: de },
      ja: { translation: ja },
      ko: { translation: ko },
      ru: { translation: ru },
      hi: { translation: hi },
    },
    fallbackLng: 'id',
    detection: {
      // Urutan deteksi: URL path → localStorage → browser
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      lookupLocalStorage: 'trivgoo_lang',
    },
    interpolation: { escapeValue: false },
  });

export default i18n;

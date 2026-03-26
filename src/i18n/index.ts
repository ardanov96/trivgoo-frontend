// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import id from './locales/id/translation.json';
import en from './locales/en/translation.json';
import zh from './locales/zh/translation.json';
import ar from './locales/ar/translation.json';

export const SUPPORTED_LANGS = ['id', 'en', 'zh', 'ar'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

export const LANG_META: Record<SupportedLang, { label: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  id: { label: 'Indonesia', flag: '🇮🇩', dir: 'ltr' },
  en: { label: 'English',   flag: '🇬🇧', dir: 'ltr' },
  zh: { label: '中文',       flag: '🇨🇳', dir: 'ltr' },
  ar: { label: 'العربية',   flag: '🇸🇦', dir: 'rtl' },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en },
      zh: { translation: zh },
      ar: { translation: ar },
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
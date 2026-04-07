// src/i18n/index.ts — OPTIMIZED: lazy load per bahasa
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── Supported languages ────────────────────────────────────────────────────
export const SUPPORTED_LANGS = ['id', 'en', 'zh', 'ar', 'ms', 'fr', 'de', 'ja', 'ko', 'es', 'ru', 'hi'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

export const LANG_META: Record<SupportedLang, { label: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  id: { label: 'Indonesia', flag: '🇮🇩', dir: 'ltr' },
  en: { label: 'English',   flag: '🇬🇧', dir: 'ltr' },
  es: { label: 'Español',   flag: '🇪🇸', dir: 'ltr' },
  zh: { label: '中文',      flag: '🇨🇳', dir: 'ltr' },
  ar: { label: 'العربية',   flag: '🇸🇦', dir: 'rtl' },
  ms: { label: 'Melayu',    flag: '🇲🇾', dir: 'ltr' },
  fr: { label: 'Français',  flag: '🇫🇷', dir: 'ltr' },
  de: { label: 'Deutsch',   flag: '🇩🇪', dir: 'ltr' },
  ja: { label: '日本語',    flag: '🇯🇵', dir: 'ltr' },
  ko: { label: '한국어',    flag: '🇰🇷', dir: 'ltr' },
  ru: { label: 'Русский',   flag: '🇷🇺', dir: 'ltr' },
  hi: { label: 'हिन्दी',   flag: '🇮🇳', dir: 'ltr' },
};

// ── Detect bahasa awal dari URL path atau localStorage ─────────────────────
function detectInitialLang(): SupportedLang {
  // Dari URL path: /en/... → 'en'
  const pathLang = window.location.pathname.split('/')[1] as SupportedLang;
  if (SUPPORTED_LANGS.includes(pathLang)) return pathLang;

  // Dari localStorage
  const stored = localStorage.getItem('trivgoo_lang') as SupportedLang;
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

  // Dari browser
  const browserLang = navigator.language.split('-')[0] as SupportedLang;
  if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

  return 'id'; // fallback
}

// ── Lazy load translation per bahasa ──────────────────────────────────────
// Setiap bahasa jadi chunk terpisah — hanya didownload saat dibutuhkan
async function loadTranslation(lang: SupportedLang): Promise<Record<string, unknown>> {
  switch (lang) {
    case 'id': return (await import('./locales/id/translation.json')).default;
    case 'en': return (await import('./locales/en/translation.json')).default;
    case 'es': return (await import('./locales/es/translation.json')).default;
    case 'zh': return (await import('./locales/zh/translation.json')).default;
    case 'ar': return (await import('./locales/ar/translation.json')).default;
    case 'ms': return (await import('./locales/ms/translation.json')).default;
    case 'fr': return (await import('./locales/fr/translation.json')).default;
    case 'de': return (await import('./locales/de/translation.json')).default;
    case 'ja': return (await import('./locales/ja/translation.json')).default;
    case 'ko': return (await import('./locales/ko/translation.json')).default;
    case 'ru': return (await import('./locales/ru/translation.json')).default;
    case 'hi': return (await import('./locales/hi/translation.json')).default;
    default:   return (await import('./locales/id/translation.json')).default;
  }
}

// ── Init i18n ──────────────────────────────────────────────────────────────
const initialLang = detectInitialLang();

// Load hanya bahasa awal secara synchronous-like via top-level await trick
// Kita init dulu dengan resources kosong, lalu tambahkan setelah load
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
    lng: initialLang,
    fallbackLng: 'id',
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      lookupLocalStorage: 'trivgoo_lang',
    },
    interpolation: { escapeValue: false },
    // Jangan tampilkan key jika translation belum siap
    saveMissing: false,
  });

// Load bahasa awal langsung
loadTranslation(initialLang).then(translation => {
  i18n.addResourceBundle(initialLang, 'translation', translation, true, true);
  if (!i18n.hasResourceBundle(initialLang, 'translation')) {
    i18n.changeLanguage(initialLang);
  } else {
    // Trigger re-render
    i18n.emit('languageChanged', initialLang);
  }
});

// Jika bahasa awal bukan 'id', load fallback 'id' juga di background
if (initialLang !== 'id') {
  loadTranslation('id').then(translation => {
    i18n.addResourceBundle('id', 'translation', translation, true, true);
  });
}

// ── Helper: ganti bahasa dengan lazy load ─────────────────────────────────
export async function changeLanguage(lang: SupportedLang): Promise<void> {
  // Kalau belum pernah diload, load dulu
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    const translation = await loadTranslation(lang);
    i18n.addResourceBundle(lang, 'translation', translation, true, true);
  }
  await i18n.changeLanguage(lang);
  localStorage.setItem('trivgoo_lang', lang);

  // Update dir untuk bahasa RTL (Arabic)
  document.documentElement.dir = LANG_META[lang].dir;
  document.documentElement.lang = lang;
}

export default i18n;

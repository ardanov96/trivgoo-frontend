// src/hooks/useGeoDetect.ts
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SUPPORTED_LANGS, SupportedLang } from '../i18n';

// ── Map country code (ISO 3166-1 alpha-2) → language code (ISO 639-1) ──────
// Kode NEGARA (IP-based) → Kode BAHASA (i18n routing)
const COUNTRY_LANG: Record<string, SupportedLang> = {
  // Indonesian
  ID: 'id',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  // English
  GB: 'en', US: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en', ZA: 'en',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', QA: 'ar', KW: 'ar', BH: 'ar',
  OM: 'ar', JO: 'ar', LB: 'ar', IQ: 'ar', SY: 'ar', LY: 'ar',
  TN: 'ar', MA: 'ar', DZ: 'ar', YE: 'ar', SD: 'ar',
  // Malay
  MY: 'ms', BN: 'ms',
  // French
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr',
  // German
  DE: 'de', AT: 'de', LI: 'de',
  // Japanese — kode negara JP → bahasa ja
  JP: 'ja',
  // Korean — kode negara KR → bahasa ko
  KR: 'ko',
};

export function useGeoDetect() {
  const { lang } = useParams<{ lang: string }>();
  const navigate  = useNavigate(); // ✅ pakai useNavigate biasa (bukan langNavigate)

  useEffect(() => {
    // 1. Skip jika URL sudah punya lang yang valid
    if (lang && SUPPORTED_LANGS.includes(lang as SupportedLang)) return;

    // 2. Pakai preferensi tersimpan jika ada
    const saved = localStorage.getItem('trivgoo_lang') as SupportedLang | null;
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      navigate(`/${saved}`, { replace: true });
      return;
    }

    // 3. Coba deteksi dari browser language (cepat, tanpa API call)
    const browserLang = navigator.language?.split('-')[0] as SupportedLang;
    if (browserLang && SUPPORTED_LANGS.includes(browserLang)) {
      navigate(`/${browserLang}`, { replace: true });
      return;
    }

    // 4. Hit backend untuk geo-detect berdasarkan IP
    fetch('/api/v1/locale/detect')
      .then(r => r.json())
      .then(data => {
        // Backend mengembalikan { country: 'JP', lang: 'ja' }
        const detectedLang: SupportedLang =
          (data.lang && SUPPORTED_LANGS.includes(data.lang as SupportedLang))
            ? data.lang
            : (COUNTRY_LANG[data.country] ?? 'id');
        navigate(`/${detectedLang}`, { replace: true });
      })
      .catch(() => navigate('/id', { replace: true }));
  }, []);
}

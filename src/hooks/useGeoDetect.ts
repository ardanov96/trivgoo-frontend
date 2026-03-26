// src/hooks/useGeoDetect.ts
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SUPPORTED_LANGS, SupportedLang } from '../i18n';

// Map country code → lang
const COUNTRY_LANG: Record<string, SupportedLang> = {
  ID: 'id', // Indonesia
  CN: 'zh', TW: 'zh', HK: 'zh', // Chinese
  GB: 'en', US: 'en', AU: 'en', CA: 'en', // English
  SA: 'ar', AE: 'ar', EG: 'ar', QA: 'ar', // Arabic
};

export function useGeoDetect() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip jika URL sudah punya lang yang valid
    if (lang && SUPPORTED_LANGS.includes(lang as SupportedLang)) return;

    // Skip jika user sudah punya preferensi tersimpan
    const saved = localStorage.getItem('trivgoo_lang') as SupportedLang | null;
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      langNavigate(`/${saved}`, { replace: true });
      return;
    }

    // Hit backend untuk geo-detect
    fetch('/api/v1/locale/detect')
      .then(r => r.json())
      .then(data => {
        const detectedLang: SupportedLang = data.lang ?? 'id';
        langNavigate(`/${detectedLang}`, { replace: true });
      })
      .catch(() => langNavigate('/id', { replace: true }));
  }, []);
}
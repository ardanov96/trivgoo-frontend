// src/components/LegacyRedirect.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGS, SupportedLang } from '../src/i18n';

export default function LegacyRedirect() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check localStorage priority
    const saved = localStorage.getItem('trivgoo_lang') as SupportedLang | null;
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      navigate(`/${saved}${pathname}${search}${hash}`, { replace: true });
      return;
    }

    // 2. Check browser language (get first 2 letters, e.g., 'en-US' -> 'en')
    const browserLangStr = navigator.language?.split('-')[0] as SupportedLang | undefined;
    if (browserLangStr && SUPPORTED_LANGS.includes(browserLangStr)) {
      navigate(`/${browserLangStr}${pathname}${search}${hash}`, { replace: true });
      return; // fallback handled successfully
    }

    // 3. Fallback to default 'id'
    navigate(`/id${pathname}${search}${hash}`, { replace: true });
  }, [navigate, pathname, search, hash]);

  return null; // Render nothing since it's just a redirect wrapper
}

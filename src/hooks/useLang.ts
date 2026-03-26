import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, SupportedLang } from '../i18n';

export function useLang() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n, t } = useTranslation();

  const currentLang: SupportedLang =
    SUPPORTED_LANGS.includes(lang as SupportedLang)
      ? (lang as SupportedLang)
      : 'id';

  const changeLang = (newLang: SupportedLang) => {
    // Ganti segment :lang di URL, path lainnya tetap
    const segments = location.pathname.split('/');
    segments[1] = newLang; // index 1 = lang segment
    const newPath = segments.join('/') || `/${newLang}`;

    localStorage.setItem('trivgoo_lang', newLang);
    i18n.changeLanguage(newLang);

    // Handle RTL untuk bahasa Arab
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;

    navigate(newPath + location.search, { replace: true });
  };

  return { currentLang, changeLang, t, i18n };
}
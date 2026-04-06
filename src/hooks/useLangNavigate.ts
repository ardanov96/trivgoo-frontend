import { useNavigate, useLocation, NavigateOptions } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, type SupportedLang } from '../i18n';
import { ROUTE_SLUGS, type RouteSlugMap } from '../i18n/slugs';

// Path prefixes yang TIDAK perlu lang-prefix (dashboard, auth internal)
const SKIP_LANG_PREFIXES = ['/admin', '/agent', '/payment', '/my-'];

const needsLangPrefix = (path: string): boolean => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return !SKIP_LANG_PREFIXES.some(prefix => clean.startsWith(prefix));
};

export const useLangNavigate = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { i18n }    = useTranslation();

  const pathLang    = location.pathname.split('/')[1];
  const currentLang = (
    SUPPORTED_LANGS.includes(pathLang as SupportedLang)
      ? pathLang
      : i18n.language
  ) as SupportedLang;

  const slugMap = ROUTE_SLUGS[currentLang] ?? ROUTE_SLUGS['en'];

  const langSlug = (canonical: keyof RouteSlugMap): string =>
    slugMap[canonical] ?? canonical;

  const langPath = (path: string): string => {
    // Jika path sudah mengandung lang prefix (misal /en/...), kembalikan apa adanya
    const firstSegment = path.split('/').filter(Boolean)[0];
    if (SUPPORTED_LANGS.includes(firstSegment as SupportedLang)) {
      return path;
    }

    // Dashboard & protected internal routes — hanya tambah lang prefix, tanpa slug translation
    if (!needsLangPrefix(path)) {
      return `/${currentLang}${path}`;
    }

    // Public routes — tambah lang prefix + translate category slugs
    const prefix = `/${currentLang}`;
    const translatedPath = path.replace(
      /\/(tours|stays|car-rental|airport-transfer|events|explore)(\/|$|\?|#)/g,
      (_match, segment: keyof RouteSlugMap, after: string) => {
        const translated = slugMap[segment] ?? segment;
        return `/${translated}${after}`;
      }
    );

    const finalPath = translatedPath === path
      ? path.replace(
          /\/(tours|stays|car-rental|airport-transfer|events|explore)$/,
          (_m, segment: keyof RouteSlugMap) => `/${slugMap[segment] ?? segment}`
        )
      : translatedPath;

    return `${prefix}${finalPath}`;
  };

  const langNavigate = (
    path: string,
    options?: NavigateOptions
  ): void => {
    navigate(langPath(path), options);
  };

  return { langNavigate, langPath, langSlug, currentLang };
};
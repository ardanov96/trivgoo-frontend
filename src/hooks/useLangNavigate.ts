// src/hooks/useLangNavigate.ts
import { useParams, useNavigate, NavigateOptions } from 'react-router-dom';
import { useCallback } from 'react';

export function useLangNavigate() {
  const { lang } = useParams<{ lang: string }>();
  const navigate  = useNavigate();
  const l         = lang ?? 'id';

  const langPath = useCallback(
    (path: string) => {
      if (path.startsWith(`/${l}/`) || path === `/${l}`) return path;
      if (path.startsWith('/')) return `/${l}${path}`;
      return path;
    },
    [l],
  );

  const langNavigate = useCallback(
    (path: string, options?: NavigateOptions) => { // ✅ NavigateOptions dari react-router-dom
      navigate(langPath(path), options);
    },
    [navigate, langPath],
  );

  return { langNavigate, langPath, lang: l };
}
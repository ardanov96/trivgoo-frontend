// src/components/LanguageSwitcher.tsx
import { LANG_META, SUPPORTED_LANGS, SupportedLang } from "@/src/i18n";
import { useLang } from '@/src/hooks/useLang';

export function LanguageSwitcher() {
  const { currentLang, changeLang } = useLang();

  return (
    <div className="flex items-center gap-1">
      {SUPPORTED_LANGS.map(code => (
        <button
          key={code}
          onClick={() => changeLang(code)}
          title={LANG_META[code].label}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold transition-all ${
            currentLang === code
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {LANG_META[code].flag} {LANG_META[code].label}
        </button>
      ))}
    </div>
  );
}
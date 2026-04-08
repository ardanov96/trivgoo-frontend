'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ChevronDown, ChevronUp, Shield, BarChart2, Megaphone, Settings2, Check } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CookiePreferences {
  essential: true;       // always true, cannot be toggled
  functional: boolean;   // language, search history/filters
  analytics: boolean;    // Google Analytics
  marketing: boolean;    // third-party ads
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    [key: string]: any; // Allow for dynamic ga-disable keys
  }
}

const CONSENT_KEY = 'trivgoo_cookie_consent';
const CONSENT_VERSION = '1.0';

// ── localStorage helpers ──────────────────────────────────────────────────────

export function getStoredConsent(): (CookiePreferences & { version: string }) | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function storeConsent(prefs: CookiePreferences) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...prefs, version: CONSENT_VERSION }));
  }
}

// ── Google Analytics Logic ────────────────────────────────────────────────────

export function loadGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  if (!document.getElementById('ga-script')) {
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });
}

export function disableGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return;
  window[`ga-disable-${measurementId}`] = true;
}

// ── UI Components ─────────────────────────────────────────────────────────────

const Toggle = ({
  checked, onChange, disabled = false,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
      ${checked ? 'bg-primary-500' : 'bg-gray-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200
      ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const CategoryRow = ({ 
  icon, title, description, checked, onChange, disabled, badge 
}: { 
  icon: React.ReactNode; title: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; badge?: string 
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 p-4">
        <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-800">{title}</span>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <Toggle checked={checked} onChange={onChange} disabled={disabled} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-50 bg-gray-50/50"
          >
            <p className="px-4 pb-4 pt-2 text-xs text-gray-500 leading-relaxed">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

interface CookieConsentProps {
  googleAnalyticsId?: string;
  onConsentChange?: (prefs: CookiePreferences) => void;
}

export const CookieConsent = ({ googleAnalyticsId, onConsentChange }: CookieConsentProps) => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  const applyConsent = useCallback((p: CookiePreferences) => {
    if (googleAnalyticsId) {
      if (p.analytics) {
        window[`ga-disable-${googleAnalyticsId}`] = false;
        loadGoogleAnalytics(googleAnalyticsId);
      } else {
        disableGoogleAnalytics(googleAnalyticsId);
      }
    }
    onConsentChange?.(p);
  }, [googleAnalyticsId, onConsentChange]);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setPrefs(stored);
      applyConsent(stored);
    }

    const handleManualOpen = () => {
      setVisible(true);
      setDrawerOpen(true);
    };

    window.addEventListener('open-cookie-settings', handleManualOpen);
    return () => window.removeEventListener('open-cookie-settings', handleManualOpen);
  }, [applyConsent]);

  const handleAction = (newPrefs: CookiePreferences) => {
    storeConsent(newPrefs);
    applyConsent(newPrefs);
    setDrawerOpen(false);
    setTimeout(() => setVisible(false), 400);
  };

  const handleAcceptAll = () => {
    handleAction({ essential: true, functional: true, analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    handleAction({ essential: true, functional: false, analytics: false, marketing: false });
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay Backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-3xl shadow-2xl max-h-[92dvh] flex flex-col"
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{t('cookie.manage_title')}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{t('cookie.manage_subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <CategoryRow
                icon={<Shield className="w-4 h-4" />}
                title={t('cookie.cat_essential')}
                description={t('cookie.cat_essential_desc')}
                checked={true}
                onChange={() => {}}
                disabled={true}
                badge={t('cookie.always_on')}
              />
              <CategoryRow
                icon={<Check className="w-4 h-4" />}
                title={t('cookie.cat_functional')}
                description={t('cookie.cat_functional_desc')}
                checked={prefs.functional}
                onChange={v => setPrefs(p => ({ ...p, functional: v }))}
              />
              <CategoryRow
                icon={<BarChart2 className="w-4 h-4" />}
                title={t('cookie.cat_analytics')}
                description={t('cookie.cat_analytics_desc')}
                checked={prefs.analytics}
                onChange={v => setPrefs(p => ({ ...p, analytics: v }))}
              />
              <CategoryRow
                icon={<Megaphone className="w-4 h-4" />}
                title={t('cookie.cat_marketing')}
                description={t('cookie.cat_marketing_desc')}
                checked={prefs.marketing}
                onChange={v => setPrefs(p => ({ ...p, marketing: v }))}
              />

              <p className="text-[11px] text-gray-400 leading-relaxed pt-2">
                {t('cookie.policy_note')}{' '}
                <a href={`/${i18n.language}/privacy-policy`} className="underline text-primary-600 font-medium hover:text-primary-700">
                  {t('cookie.privacy_policy')}
                </a>{' '}
                {t('cookie.and')}{' '}
                <a href={`/${i18n.language}/terms-and-service`} className="underline text-primary-600 font-medium hover:text-primary-700">
                  {t('cookie.terms')}
                </a>{' '}
                {t('cookie.policy_note2')}
              </p>
            </div>

            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 bg-gray-50/50">
              <button
                onClick={handleRejectAll}
                className="flex-1 h-11 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-white transition-all active:scale-[0.98]"
              >
                {t('cookie.reject_all')}
              </button>
              <button
                onClick={() => handleAction(prefs)}
                className="flex-1 h-11 rounded-xl border-2 border-primary-500 text-sm font-bold text-primary-600 hover:bg-white transition-all active:scale-[0.98]"
              >
                {t('cookie.save_preferences')}
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 h-11 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-lg shadow-primary-200 transition-all active:scale-[0.98]"
              >
                {t('cookie.accept_all')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Banner (Small) */}
      <AnimatePresence>
        {!drawerOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[9990]"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-5">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    {t('cookie.banner_title')}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    {t('cookie.banner_desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3 h-9 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  {t('cookie.manage')}
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 h-9 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  {t('cookie.reject_all')}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 h-9 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-200 transition-all"
                >
                  {t('cookie.accept_all')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
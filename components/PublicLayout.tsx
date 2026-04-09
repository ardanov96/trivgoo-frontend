import { Heart, LogOut, Menu, ShoppingCart, Sparkles, X, User as UserIcon, ChevronDown, Package, LayoutDashboard } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../AuthContext";
import { useWishlist } from "../components/WishlistContext";
import { useCart } from "../components/CartContext";
import CartDrawer from "../components/CartDrawer";
import { authService } from "../services/authService";
import { UserRole } from "../types";
import UserAvatar from "./UserAvatar";
import { useLangNavigate } from "@/src/hooks/useLangNavigate";
import { LANG_META, SUPPORTED_LANGS, SupportedLang } from '@/src/i18n';
import { CookieConsent } from "./CookieConsent";

const PublicLayout: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { wishlist } = useWishlist();
  const { cartCount } = useCart();
  const location = useLocation();
  const { t } = useTranslation();

  const [isMenuOpen,            setIsMenuOpen]            = useState(false);
  const [scrolled,              setScrolled]              = useState(false);
  const [isCartOpen,            setIsCartOpen]            = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileOpen,   setIsMobileProfileOpen]   = useState(false);
  const [isLangDropdownOpen,    setIsLangDropdownOpen]    = useState(false);

  const didFetchMeRef   = useRef(false);
  const dropdownRef     = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const { langPath, langNavigate, currentLang: lang } = useLangNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setIsProfileDropdownOpen(false);
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node))
        setIsLangDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (didFetchMeRef.current) return;
    didFetchMeRef.current = true;
    (async () => {
      try {
        const me = await authService.me();
        updateUser({
          id: me.id, name: me.name, email: me.email, role: me.role,
          avatar: me.avatar, specialization: me.specialization ?? null,
          verification_status: me.verification_status,
        });
      } catch (err: any) {
        if (err?.response?.status === 401) logout();
      }
    })();
  }, [logout, updateUser]);

  const handleLogout = () => { logout(); langNavigate('/'); };

  const isHome              = location.pathname === `/${lang}` || location.pathname === `/${lang}/`;
  const isScrolledOrNotHome = scrolled || !isHome;
  const iconCls             = isScrolledOrNotHome ? "text-gray-600 hover:bg-gray-100" : "text-white/90 hover:bg-white/20";
  const currentLangMeta     = LANG_META[lang as SupportedLang] ?? LANG_META['id'];

  // ── Sub-Components ──────────────────────────────────────────────────────────

  const LangSwitcher = () => (
    <div className="relative" ref={langDropdownRef}>
      <button
        onClick={() => setIsLangDropdownOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
          isScrolledOrNotHome ? 'text-gray-600 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
        }`}
      >
        <span className="text-base leading-none">{currentLangMeta.flag}</span>
        <span className="text-xs font-bold hidden lg:block">{currentLangMeta.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isLangDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('layout.pick_language')}</p>
          </div>
          <div className="py-1 max-h-72 overflow-y-auto">
            {SUPPORTED_LANGS.map(l => (
              <button
                key={l}
                onClick={() => {
                  localStorage.setItem('trivgoo_lang', l);
                  setIsLangDropdownOpen(false);
                  const currentPath = window.location.pathname;
                  const rest = currentPath.replace(new RegExp('^/[a-z]{2}(?=/|$)'), '') || '/';
                  window.location.href = '/' + l + rest;
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  l === lang ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg leading-none">{LANG_META[l].flag}</span>
                <span className="text-xs font-bold">{LANG_META[l].label}</span>
                {l === lang && <div className="w-2 h-2 rounded-full bg-primary-500 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const WishlistIcon = ({ mobile = false }: { mobile?: boolean }) => (
    <Link
      to={langPath('/wishlist')}
      className={
        mobile
          ? `relative p-2 flex items-center justify-center ${isScrolledOrNotHome ? "text-gray-600" : "text-white"}`
          : `p-2 rounded-full transition-colors relative flex items-center justify-center ${iconCls}`
      }
    >
      <Heart className={mobile ? "w-6 h-6" : "w-5 h-5"} />
      {wishlist.length > 0 && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
      )}
    </Link>
  );

  const CartIcon = ({ mobile = false }: { mobile?: boolean }) => (
    <button
      onClick={() => setIsCartOpen(true)}
      className={
        mobile
          ? `relative p-2 flex items-center justify-center ${isScrolledOrNotHome ? "text-gray-600" : "text-white"}`
          : `relative p-2 rounded-full transition-colors flex items-center justify-center ${iconCls}`
      }
    >
      <ShoppingCart className={mobile ? "w-6 h-6" : "w-5 h-5"} />
      {cartCount > 0 && (
        <span className={`absolute font-bold rounded-full flex items-center justify-center shadow border border-white bg-primary-600 text-white ${
          mobile
            ? "top-0 right-0 min-w-[16px] h-[16px] text-[9px]"
            : "-top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px]"
        }`}>
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <CookieConsent />

      {/* ══════════════════════════ NAVBAR ══════════════════════════ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolledOrNotHome
          ? "bg-white/95 backdrop-blur-md border-gray-100 shadow-sm py-3"
          : "bg-transparent border-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            {/* ── Logo & Desktop Nav ── */}
            <div className="flex items-center gap-8 md:gap-12">
              <Link to={langPath('/')} className="flex-shrink-0 flex items-center">
                <img
                  src="/offest_inline_trp.png"
                  alt="Trivgoo Logo"
                  className="h-10 md:h-14 w-auto transition-all"
                />
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link to={langPath('/')} className={`text-sm font-medium transition-colors hover:text-accent-500 leading-none ${isScrolledOrNotHome ? "text-gray-600" : "text-white/90"}`}>
                  {t('nav.home')}
                </Link>
                <Link to={langPath('/explore')} className={`text-sm font-medium transition-colors hover:text-accent-500 leading-none ${isScrolledOrNotHome ? "text-gray-600" : "text-white/90"}`}>
                  {t('nav.explore')}
                </Link>
                <Link to={langPath('/ai-planner')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all leading-none ${
                  isScrolledOrNotHome
                    ? "bg-primary-50 text-primary-700 ring-1 ring-primary-100"
                    : "bg-white/20 text-white backdrop-blur-sm border border-white/30"
                }`}>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  {t('nav.ai_planner')}
                </Link>
              </div>
            </div>

            {/* ── Desktop Actions ── */}
            <div className="hidden md:flex items-center gap-1">
              <LangSwitcher />
              <WishlistIcon />
              <CartIcon />

              {user ? (
                <div className="flex items-center pl-3 ml-1 border-l border-gray-200/30 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors group ${isScrolledOrNotHome ? "text-gray-700" : "text-white"}`}
                  >
                    <UserAvatar user={user} className="h-9 w-9 border-2 border-white shadow-sm group-hover:border-primary-200 shrink-0" />
                    <span className="max-w-[100px] truncate leading-none">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 z-50">
                      {user.role === UserRole.CUSTOMER ? (
                        <>
                          <Link to={langPath('/my-account')} onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                            <UserIcon className="w-4 h-4 mr-3 text-gray-400 shrink-0" /> {t('nav.my_account')}
                          </Link>
                          <Link to={langPath('/my-bookings')} onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                            <Package className="w-4 h-4 mr-3 text-gray-400 shrink-0" /> {t('nav.my_bookings')}
                          </Link>
                        </>
                      ) : (
                        <Link to={langPath(user.role === UserRole.ADMIN ? '/admin' : '/agent')} onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                          <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400 shrink-0" /> {t('nav.dashboard')}
                        </Link>
                      )}
                      <div className="h-px bg-gray-100 my-1" />
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium">
                        <LogOut className="w-4 h-4 mr-3 shrink-0" /> {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 pl-3 ml-1 border-l border-gray-200/30">
                  <Link to={langPath('/login')} className={`px-4 py-2 text-sm font-medium leading-none ${isScrolledOrNotHome ? "text-gray-600" : "text-white hover:text-primary-100"}`}>
                    {t('nav.login')}
                  </Link>
                  <Link to={langPath('/register')} className="bg-accent-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-accent-600 transition-all leading-none">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Right ── */}
            <div className="flex items-center md:hidden gap-1">
              <WishlistIcon mobile />
              <CartIcon mobile />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-md flex items-center justify-center ${isScrolledOrNotHome ? "text-gray-500 hover:bg-gray-100" : "text-white hover:bg-white/20"}`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-xl border-t absolute w-full left-0 top-full animate-in slide-in-from-top duration-300">
            <div className="p-4 space-y-1">
              <Link to={langPath('/')} onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">{t('nav.home')}</Link>
              <Link to={langPath('/explore')} onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">{t('nav.explore')}</Link>
              <Link to={langPath('/ai-planner')} onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">{t('nav.ai_planner')}</Link>

              {!user ? (
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <Link to={langPath('/login')} onClick={() => setIsMenuOpen(false)} className="flex justify-center py-3 border border-gray-200 rounded-xl text-gray-700 font-medium">{t('nav.login')}</Link>
                  <Link to={langPath('/register')} onClick={() => setIsMenuOpen(false)} className="flex justify-center py-3 bg-primary-600 text-white rounded-xl font-bold">{t('nav.register')}</Link>
                </div>
              ) : (
                <div className="pt-4 border-t mt-4">
                  <button onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)} className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center text-left">
                      <UserAvatar user={user} className="h-10 w-10 shrink-0" />
                      <div className="ml-3">
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${isMobileProfileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all ${isMobileProfileOpen ? 'max-h-48 mt-2' : 'max-h-0'}`}>
                    <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                      <Link to={langPath('/my-account')} onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-600">{t('nav.my_account')}</Link>
                      <Link to={langPath('/my-bookings')} onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-600">{t('nav.my_bookings')}</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium">{t('nav.logout')}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow w-full"><Outlet /></main>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer className="bg-gray-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

            {/* ── Brand column ── */}
            <div className="space-y-6">
              <img src="/Lapisan.png" alt="Trivgoo Logo" className="h-16 w-auto" />
              <p className="text-gray-400 text-sm leading-relaxed">{t('layout.footer_tagline')}</p>

              {/* Social Icons */}
              <div className="flex space-x-3">

                {/* Instagram */}
                <a
                  href="https://instagram.com/trivgoo"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Trivgoo Instagram"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 transition-all duration-300"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/people/Trivgoo/61587494577134/?ref=NONE_xav_ig_profile_page_web#"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Trivgoo Facebook"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1877F2] transition-all duration-300"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/trivgooglobalnusantara?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnHRuvbHc4A-iUVsOzCYnc89qtQxbifK31w2LNulP7I1b61AqaeaQxbAUr6jQ_aem_dnHPD0peyVGlJwmLfF3t4g"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Trivgoo LinkedIn"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#0A66C2] transition-all duration-300"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>

              </div>
            </div>

            {/* ── Company links ── */}
            <div>
              <h4 className="font-bold mb-6">{t('footer.company')}</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to={langPath('/about-us')}        className="hover:text-primary-400 transition-colors">About Us</Link></li>
                <li><Link to={langPath('/career')}          className="hover:text-primary-400 transition-colors">Careers</Link></li>
                <li><Link to={langPath('/press-and-media')} className="hover:text-primary-400 transition-colors">Press &amp; Media</Link></li>
                <li><Link to={langPath('/travel-blog')}     className="hover:text-primary-400 transition-colors">Travel Blog</Link></li>
                <li><Link to={langPath('/register/agent')}  className="hover:text-primary-400 transition-colors">Become an Agent</Link></li>
              </ul>
            </div>

            {/* ── Support links ── */}
            <div>
              <h4 className="font-bold mb-6">{t('footer.support')}</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to={langPath('/help-center')}       className="hover:text-primary-400 transition-colors">Help Center</Link></li>
                <li><Link to={langPath('/contact-us')}        className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                <li><Link to={langPath('/privacy-policy')}    className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to={langPath('/terms-and-service')} className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* ── Newsletter ── */}
            <div>
              <h4 className="font-bold mb-6">{t('footer.newsletter_title')}</h4>
              <p className="text-gray-400 text-sm mb-4">{t('footer.newsletter_desc')}</p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button className="bg-primary-600 py-2 rounded-lg font-bold hover:bg-primary-500 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* ── Payment logos ── */}
          <div className="border-t border-gray-800 pt-8 pb-6">
            <div className="bg-white rounded-2xl px-6 py-5">
              <div className="flex flex-wrap gap-3 items-center">
                <img src="/payment_service/bca.png"        alt="BCA"          className="h-7 w-auto object-contain" />
                <img src="/payment_service/bni.png"        alt="BNI"          className="h-7 w-auto object-contain" />
                <img src="/payment_service/bri.png"        alt="BRI"          className="h-7 w-auto object-contain" />
                <img src="/payment_service/mandiri.png"    alt="Mandiri"      className="h-7 w-auto object-contain" />
                <img src="/payment_service/permata.png"    alt="Permata Bank" className="h-7 w-auto object-contain" />
                <img src="/payment_service/cimb.png"       alt="CIMB Niaga"   className="h-7 w-auto object-contain" />
                <img src="/payment_service/danamon.png"    alt="Danamon"      className="h-7 w-auto object-contain" />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/visa.png"       alt="Visa"         className="h-6 w-auto object-contain" />
                <img src="/payment_service/mastercard.jpg" alt="Mastercard"   className="h-8 w-auto object-contain" />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/gopay.png"      alt="GoPay"        className="h-7 w-auto object-contain" />
                <img src="/payment_service/ovo.png"        alt="OVO"          className="h-6 w-auto object-contain" />
                <img src="/payment_service/dana.png"       alt="Dana"         className="h-7 w-auto object-contain" />
                <img src="/payment_service/shopeepay.png"  alt="ShopeePay"    className="h-6 w-auto object-contain" />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/alfamart.png"   alt="Alfamart"     className="h-7 w-auto object-contain" />
                <img src="/payment_service/indomaret.png"  alt="Indomaret"    className="h-7 w-auto object-contain" />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/qris.png"       alt="QRIS"         className="h-7 w-auto object-contain" />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/xendit.png"     alt="Xendit"       className="h-7 w-auto object-contain" />
              </div>
            </div>
          </div>

          {/* ── Copyright ── */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Trivgoo Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to={langPath('/privacy-policy')} className="text-gray-500 hover:text-white text-xs">{t('footer.privacy')}</Link>
              <button
                onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
                className="text-gray-500 hover:text-white text-xs"
              >
                {t('footer.cookie_settings', 'Cookie Settings')}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

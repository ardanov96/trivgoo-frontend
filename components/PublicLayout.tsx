import { Heart, LogOut, Menu, ShoppingCart, Sparkles, X, User as UserIcon, ChevronDown, Package, LayoutDashboard } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../AuthContext";
import { useWishlist } from "../components/WishlistContext";
import { useCart } from "../components/CartContext";
import CartDrawer from "../components/CartDrawer";
import { authService } from "../services/authService";
import { UserRole } from "../types";
import UserAvatar from "./UserAvatar";
import { useLangNavigate } from "@/src/hooks/useLangNavigate";

const PublicLayout: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { wishlist } = useWishlist();
  const { cartCount } = useCart();
  const location = useLocation();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const didFetchMeRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { langPath, langNavigate, lang } = useLangNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setIsProfileDropdownOpen(false);
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
  }, []);

  const handleLogout = () => { logout(); langNavigate('/'); };
  const isHome = location.pathname === `/${lang}` || location.pathname === `/${lang}/`;
  const iconCls = scrolled || !isHome ? "text-gray-600 hover:bg-gray-100" : "text-white/90 hover:bg-white/20";

  const WishlistIcon = ({ mobile = false }: { mobile?: boolean }) => (
    <Link to={langPath('/wishlist')} title={t('nav.wishlist', 'Wishlist')}
      className={mobile ? `relative p-2 ${scrolled || !isHome ? "text-gray-600" : "text-white"}` : `p-2 rounded-full transition-colors relative ${iconCls}`}
    >
      <Heart className={mobile ? "w-6 h-6" : "w-5 h-5"} />
      {wishlist.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />}
    </Link>
  );

  const CartIcon = ({ mobile = false }: { mobile?: boolean }) => (
    <button onClick={() => setIsCartOpen(true)} title={t('nav.cart', 'Cart')}
      className={mobile ? `relative p-2 ${scrolled || !isHome ? "text-gray-600" : "text-white"}` : `relative p-2 rounded-full transition-colors ${iconCls}`}
    >
      <ShoppingCart className={mobile ? "w-6 h-6" : "w-5 h-5"} />
      {cartCount > 0 && (
        <span className={`absolute font-bold rounded-full flex items-center justify-center shadow border border-white bg-primary-600 text-white ${mobile ? "top-0 right-0 min-w-[16px] h-[16px] text-[9px] px-0.5" : "-top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] px-1"}`}>
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out border-b ${scrolled || !isHome ? "bg-white/95 backdrop-blur-md border-gray-100 shadow-sm py-3" : "bg-transparent border-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">

            <div className="flex items-center">
              <Link to={langPath('/')} className="flex-shrink-0 flex items-center group relative z-10">
                <img src="/offest_inline_trp.png" alt="Trivgoo Logo" className="h-10 md:h-16 w-auto" />
              </Link>
              <div className="hidden md:ml-12 md:flex md:space-x-8">
                <Link to={langPath('/')} className={`inline-flex items-center text-sm font-medium transition-colors hover:text-accent-500 ${scrolled || !isHome ? "text-gray-600" : "text-white/90 hover:text-white"}`}>
                  {t('nav.home', 'Home')}
                </Link>
                <Link to={langPath('/explore')} className={`inline-flex items-center text-sm font-medium transition-colors hover:text-accent-500 ${scrolled || !isHome ? "text-gray-600" : "text-white/90 hover:text-white"}`}>
                  {t('nav.explore', 'Explore')}
                </Link>
                <Link to={langPath('/ai-planner')} className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${scrolled || !isHome ? "bg-primary-50 text-primary-700 hover:bg-primary-100 ring-1 ring-primary-100" : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border border-white/30"}`}>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />{t('nav.ai_planner', 'AI Planner')}
                </Link>
              </div>
            </div>

            {/* Desktop right */}
            <div className="hidden md:flex md:items-center space-x-2">
              <WishlistIcon />
              <CartIcon />
              {user ? (
                <div className="flex items-center space-x-4 pl-2 border-l border-gray-200/20">
                  <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className={`flex items-center text-sm font-medium transition-colors group ${scrolled || !isHome ? "text-gray-700 hover:text-primary-600" : "text-white hover:text-primary-200"}`}>
                      <UserAvatar user={user} className="h-9 w-9 border-2 border-white shadow-sm mr-2 group-hover:border-primary-200 transition-colors" />
                      <span>{user.name}</span>
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                        {user.role === UserRole.CUSTOMER && (<>
                          <Link to={langPath('/my-account')} onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                            <UserIcon className="w-4 h-4 mr-3 text-gray-400" /> {t('nav.my_account', 'My Account')}
                          </Link>
                          <Link to={langPath('/my-bookings')} onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                            <Package className="w-4 h-4 mr-3 text-gray-400" /> {t('nav.my_bookings', 'My Bookings')}
                          </Link>
                        </>)}
                        {(user.role === UserRole.ADMIN || user.role === UserRole.AGENT) && (
                          <Link to={langPath(user.role === UserRole.ADMIN ? '/admin' : '/agent')} onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                            <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400" /> {t('nav.dashboard', 'Dashboard')}
                          </Link>
                        )}
                        <div className="h-px bg-gray-100 my-1" />
                        <button onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium">
                          <LogOut className="w-4 h-4 mr-3 text-red-500" /> {t('nav.logout', 'Logout')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 pl-2 border-l border-gray-200/20">
                  <Link to={langPath('/login')} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${scrolled || !isHome ? "text-gray-600 hover:text-primary-600" : "text-white hover:text-primary-100"}`}>
                    {t('nav.login', 'Login')}
                  </Link>
                  <Link to={langPath('/register')} className="bg-accent-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-accent-500/20 hover:bg-accent-600 hover:shadow-accent-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                    {t('nav.register', 'Sign Up')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile right */}
            <div className="-mr-2 flex items-center md:hidden gap-1">
              <WishlistIcon mobile />
              <CartIcon mobile />
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors ${scrolled || !isHome ? "text-gray-500 hover:bg-gray-100" : "text-white hover:bg-white/20"}`}>
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-xl border-t absolute w-full left-0 top-full">
            <div className="pt-2 pb-6 space-y-1 px-4">
              <Link to={langPath('/')} onClick={() => setIsMenuOpen(false)} className="bg-primary-50 text-primary-700 block px-4 py-3 rounded-lg text-base font-medium mt-2">{t('nav.home', 'Home')}</Link>
              <Link to={langPath('/explore')} onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium">{t('nav.explore', 'Explore')}</Link>
              <Link to={langPath('/ai-planner')} onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium">{t('nav.ai_planner', 'AI Planner')}</Link>
              <Link to={langPath('/wishlist')} onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium">
                {t('nav.wishlist', 'Wishlist')}
                {wishlist.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlist.length}</span>}
              </Link>
              <button onClick={() => { setIsMenuOpen(false); setIsCartOpen(true); }} className="w-full text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium">
                <span className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> {t('nav.cart', 'Cart')}</span>
                {cartCount > 0 && <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
              </button>
              {!user ? (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Link to={langPath('/login')} onClick={() => setIsMenuOpen(false)} className="flex justify-center items-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">{t('nav.login', 'Login')}</Link>
                  <Link to={langPath('/register')} onClick={() => setIsMenuOpen(false)} className="flex justify-center items-center px-4 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700">{t('nav.register', 'Sign Up')}</Link>
                </div>
              ) : (
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center px-4 py-2">
                    <UserAvatar user={user} className="h-10 w-10" />
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="mt-3 w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">
                    <LogOut className="w-5 h-5 mr-3" /> {t('nav.logout', 'Logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow w-full"><Outlet /></main>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div className="space-y-6">
              <img src="/Lapisan.png" alt="Trivgoo Logo" className="h-16 w-auto" />
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">Curating the world's most breathtaking adventures and luxury stays. Your journey begins with a single click.</p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-primary-600 transition-all cursor-pointer flex items-center justify-center text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </div>
                <a href="https://www.instagram.com/trivgoo/" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 bg-gray-800 rounded-full hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 transition-all duration-300 cursor-pointer flex items-center justify-center text-gray-400 hover:text-white transform hover:-translate-y-0.5 hover:shadow-lg">
                  <svg className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white tracking-wide">{t('footer.company', 'Company')}</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to={langPath('/about-us')} className="hover:text-primary-400 transition-colors">{t('footer.about', 'About Trivgoo')}</Link></li>
                <li><Link to={langPath('/career')} className="hover:text-primary-400 transition-colors">{t('footer.careers', 'Careers')}</Link></li>
                <li><Link to={langPath('/press-and-media')} className="hover:text-primary-400 transition-colors">{t('footer.press', 'Press & Media')}</Link></li>
                <li><Link to={langPath('/travel-blog')} className="hover:text-primary-400 transition-colors">{t('footer.blog', 'Travel Blog')}</Link></li>
                <li><Link to={langPath('/register/agent')} className="hover:text-primary-400 transition-colors">{t('footer.become_agent', 'Become an Agent')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white tracking-wide">{t('footer.support', 'Support')}</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to={langPath('/help-center')} className="hover:text-primary-400 transition-colors">{t('footer.help_center', 'Help Center')}</Link></li>
                <li><Link to={langPath('/terms-and-service')} className="hover:text-primary-400 transition-colors">{t('footer.terms', 'Terms of Service')}</Link></li>
                <li><Link to={langPath('/privacy-policy')} className="hover:text-primary-400 transition-colors">{t('footer.privacy', 'Privacy Policy')}</Link></li>
                <li><Link to={langPath('/contact-us')} className="hover:text-primary-400 transition-colors">{t('footer.contact', 'Contact Us')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white tracking-wide">{t('footer.newsletter_title', 'Stay Updated')}</h4>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{t('footer.newsletter_desc', 'Join our newsletter for exclusive deals and travel inspiration.')}</p>
              <form className="flex flex-col space-y-3">
                <input type="email" placeholder={t('footer.newsletter_placeholder', 'Your email address')} className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-500 text-sm" />
                <button className="bg-primary-600 px-4 py-3 rounded-xl font-bold text-sm hover:bg-primary-500 transition-all shadow-lg shadow-primary-900/50 hover:translate-y-[-2px]">{t('footer.newsletter_button', 'Subscribe Now')}</button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 pb-6">
            <div className="bg-white rounded-2xl px-6 py-5">
              <div className="flex flex-wrap gap-3 items-center">
                <img src="/payment_service/bca.png" alt="BCA" className="h-7 w-auto object-contain" />
                <img src="/payment_service/bni.png" alt="BNI" className="h-7 w-auto object-contain" />
                <img src="/payment_service/bri.png" alt="BRI" className="h-7 w-auto object-contain" />
                <img src="/payment_service/mandiri.png" alt="Mandiri" className="h-7 w-auto object-contain" />
                <img src="/payment_service/permata.png" alt="Permata Bank" className="h-7 w-auto object-contain" />
                <img src="/payment_service/cimb.png" alt="CIMB Niaga" className="h-7 w-auto object-contain" />
                <img src="/payment_service/danamon.png" alt="Danamon" className="h-7 w-auto object-contain" />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/visa.png" alt="Visa" className="h-6 w-auto object-contain" />
                <img src="/payment_service/mastercard.jpg" alt="Mastercard" className="h-8 w-auto object-contain" />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/gopay.png" alt="GoPay" className="h-7 w-auto object-contain" />
                <img src="/payment_service/ovo.png" alt="OVO" className="h-6 w-auto object-contain" />
                <img src="/payment_service/dana.png" alt="Dana" className="h-7 w-auto object-contain" />
                <img src="/payment_service/shopeepay.png" alt="ShopeePay" className="h-6 w-auto object-contain" />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/alfamart.png" alt="Alfamart" className="h-7 w-auto object-contain" />
                <img src="/payment_service/indomaret.png" alt="Indomaret" className="h-7 w-auto object-contain" />
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/doku.png" alt="DOKU" className="h-7 w-auto object-contain" />
                <span className="text-xs text-gray-400 font-medium">{t('footer.secured_by', 'Secured by DOKU')}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Trivgoo Inc. {t('footer.rights', 'All rights reserved.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

import { Heart, LogOut, Menu, ShoppingCart, Sparkles, X, User as UserIcon, ChevronDown, Package, LayoutDashboard } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useWishlist } from "../components/WishlistContext";
import { useCart } from "../components/CartContext";
import CartDrawer from "../components/CartDrawer";
import { authService } from "../services/authService";
import { UserRole } from "../types";
import UserAvatar from "./UserAvatar";

// ─── Payment Method Logo Components (inline SVG, zero external deps) ──────────

const DokuLogo = () => (
  <svg viewBox="0 0 80 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <path d="M2 3h8c5.5 0 9 3.2 9 9s-3.5 9-9 9H2V3z" fill="#00A651"/>
    <path d="M5.5 6.5v11h4.5c3.2 0 5.2-2 5.2-5.5S13.2 6.5 10 6.5H5.5z" fill="white"/>
    <path d="M22 12c0-5.2 3.7-9.2 9-9.2s9 4 9 9.2-3.7 9.2-9 9.2-9-4-9-9.2z" fill="#00A651"/>
    <path d="M25.8 12c0 2.9 2.1 5.2 5.2 5.2s5.2-2.3 5.2-5.2-2.1-5.2-5.2-5.2-5.2 2.3-5.2 5.2z" fill="white"/>
    <path d="M44 3h3.8V11l7-8h4.8L52 12l8.5 9H56L49.8 14V21H46V3z" fill="#00A651" transform="translate(-2)"/>
    <path d="M63 3h3.8v11.5c0 2 1.2 2.8 3 2.8s3-.8 3-2.8V3H76.6v11.5c0 4.2-2.8 6.7-6.8 6.7S63 18.7 63 14.5V3z" fill="#00A651" transform="translate(-2)"/>
  </svg>
);

const VisaLogo = () => (
  <svg viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto">
    <path d="M23.5 2L18 18h-4.5L19 2h4.5zM40.5 11.8l2.2-6.2 1.3 6.2H40.5zm5 6.2H50L46 2h-3.8c-.9 0-1.6.5-1.9 1.3L34.5 18H39l1-2.6h5.5l.5 2.6zM33.5 12.8c0-4.5-6.2-4.8-6.2-6.8 0-.6.6-1.2 1.8-1.4.8-.1 2.9-.2 5.3 1L35.4 1C34.1.6 32.4.3 30.3.3c-4.4 0-7.5 2.3-7.5 5.7 0 2.5 2.2 3.8 3.8 4.6 1.7.8 2.3 1.4 2.3 2.2 0 1.2-1.3 1.6-2.6 1.6-2.2 0-3.4-.6-4.4-1l-1 4.5c1 .5 2.9.9 4.8.9 4.6 0 7.6-2.3 7.6-6zM19.5 2L11 18H6.5L2.3 5.5C2 4.6 1.9 4.3 1.2 4 .7 3.7-.2 3.3-1 3.2L-.9 2h7.5c1 0 1.8.6 2 1.7L11 11.8 14.8 2h4.7z" fill="#1A1F71" transform="translate(2)"/>
  </svg>
);

const MastercardLogo = () => (
  <svg viewBox="0 0 46 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
    <circle cx="16" cy="15" r="13" fill="#EB001B"/>
    <circle cx="30" cy="15" r="13" fill="#F79E1B"/>
    <path d="M23 5.2A13 13 0 0128 15a13 13 0 01-5 9.8A13 13 0 0118 15a13 13 0 015-9.8z" fill="#FF5F00"/>
  </svg>
);

const JCBLogo = () => (
  <svg viewBox="0 0 46 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
    <rect width="46" height="30" rx="4" fill="white"/>
    <rect x="2" y="2" width="13" height="26" rx="3" fill="#003087"/>
    <rect x="16.5" y="2" width="13" height="26" rx="3" fill="#CC0000"/>
    <rect x="31" y="2" width="13" height="26" rx="3" fill="#007B40"/>
    <text x="4" y="20" fontFamily="Arial Black,sans-serif" fontSize="9" fontWeight="900" fill="white">JCB</text>
  </svg>
);

const BCALogo = () => (
  <svg viewBox="0 0 74 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="74" height="30" rx="4" fill="#005BAA"/>
    <text x="7" y="21" fontFamily="Arial Black,sans-serif" fontSize="14" fontWeight="900" fill="white">BCA</text>
    <path d="M55 8h12v2.5H55V8zm0 5h12v2.5H55V13zm0 5h12v2.5H55V18z" fill="#F7941D"/>
  </svg>
);

const BNILogo = () => (
  <svg viewBox="0 0 72 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="72" height="30" rx="4" fill="#F47920"/>
    <text x="7" y="21" fontFamily="Arial Black,sans-serif" fontSize="14" fontWeight="900" fill="white">BNI</text>
    <path d="M50 7h16v2H50V7zM50 13h16v2H50v-2zM50 19h16v2H50v-2z" fill="white" opacity="0.6"/>
    <rect x="52" y="9" width="12" height="12" rx="1" fill="none" stroke="white" strokeWidth="1" opacity="0.4"/>
  </svg>
);

const BRILogo = () => (
  <svg viewBox="0 0 72 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="72" height="30" rx="4" fill="#003087"/>
    <text x="7" y="21" fontFamily="Arial Black,sans-serif" fontSize="14" fontWeight="900" fill="white">BRI</text>
    <path d="M50 7h16v2.5H50V7zm0 5.5h16v2.5H50V12.5zm0 5.5h16v2.5H50V18z" fill="#F7941D" opacity="0.9"/>
  </svg>
);

const MandiriLogo = () => (
  <svg viewBox="0 0 86 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="86" height="30" rx="4" fill="#003087"/>
    <text x="5" y="21" fontFamily="Arial Black,sans-serif" fontSize="11.5" fontWeight="900" fill="white">MANDIRI</text>
    <path d="M74 6c2.5 3.5 4 7 4 9s-1.5 5.5-4 9" stroke="#F7941D" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    <path d="M78 9c1.5 2.5 2.5 4.5 2.5 6s-1 3.5-2.5 6" stroke="#F7941D" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
  </svg>
);

const PermataLogo = () => (
  <svg viewBox="0 0 84 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="84" height="30" rx="4" fill="#E63946"/>
    <text x="5" y="21" fontFamily="Arial Black,sans-serif" fontSize="10.5" fontWeight="900" fill="white">PERMATA</text>
    <polygon points="76,5 81,15 76,25 71,15" fill="white" opacity="0.35"/>
  </svg>
);

const CIMBLogo = () => (
  <svg viewBox="0 0 74 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="74" height="30" rx="4" fill="#C8102E"/>
    <text x="7" y="21" fontFamily="Arial Black,sans-serif" fontSize="13" fontWeight="900" fill="white">CIMB</text>
    <path d="M61 7l7 8-7 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/>
  </svg>
);

const DanamonLogo = () => (
  <svg viewBox="0 0 86 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="86" height="30" rx="4" fill="#E31837"/>
    <text x="4" y="21" fontFamily="Arial Black,sans-serif" fontSize="10.5" fontWeight="900" fill="white">DANAMON</text>
  </svg>
);

const GopayLogo = () => (
  <svg viewBox="0 0 82 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="82" height="30" rx="15" fill="#00AED6"/>
    <circle cx="18" cy="15" r="9" fill="white" opacity="0.25"/>
    <circle cx="18" cy="15" r="6" fill="white" opacity="0.4"/>
    <circle cx="18" cy="15" r="3" fill="white"/>
    <text x="30" y="20" fontFamily="Arial Black,sans-serif" fontSize="12" fontWeight="900" fill="white">GoPay</text>
  </svg>
);

const OvoLogo = () => (
  <svg viewBox="0 0 66 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="66" height="30" rx="15" fill="#4C3494"/>
    <text x="15" y="21" fontFamily="Arial Black,sans-serif" fontSize="14" fontWeight="900" fill="white">OVO</text>
  </svg>
);

const DanaLogo = () => (
  <svg viewBox="0 0 72 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="72" height="30" rx="6" fill="#118EEA"/>
    <text x="12" y="21" fontFamily="Arial Black,sans-serif" fontSize="14" fontWeight="900" fill="white">DANA</text>
    <circle cx="64" cy="10" r="4.5" fill="white" opacity="0.25"/>
    <circle cx="64" cy="10" r="2.5" fill="white" opacity="0.4"/>
  </svg>
);

const ShopeePayLogo = () => (
  <svg viewBox="0 0 94 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="94" height="30" rx="6" fill="#EE4D2D"/>
    <circle cx="15" cy="15" r="10" fill="white" opacity="0.15"/>
    <path d="M10 12c0-2 1.8-3 5-3s5 1 5 3c0 3.5-10 3-10 7 0 2 1.8 3 5 3s5-1 5-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <text x="28" y="20" fontFamily="Arial Black,sans-serif" fontSize="10" fontWeight="900" fill="white">ShopeePay</text>
  </svg>
);

const LinkAjaLogo = () => (
  <svg viewBox="0 0 82 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="82" height="30" rx="6" fill="#E82529"/>
    <path d="M8 18a5 5 0 010-6h3a5 5 0 010 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <path d="M17 12a5 5 0 010 6h-3a5 5 0 010-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <path d="M14 15h-3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <text x="27" y="20" fontFamily="Arial Black,sans-serif" fontSize="11" fontWeight="900" fill="white">LinkAja</text>
  </svg>
);

const QrisLogo = () => (
  <svg viewBox="0 0 72 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="72" height="30" rx="4" fill="white"/>
    {/* QR pattern blocks */}
    <rect x="4" y="4" width="9" height="9" rx="1.5" fill="#E31837"/>
    <rect x="5.5" y="5.5" width="6" height="6" rx="0.8" fill="white"/>
    <rect x="7" y="7" width="3" height="3" fill="#E31837"/>
    <rect x="4" y="17" width="9" height="9" rx="1.5" fill="#E31837"/>
    <rect x="5.5" y="18.5" width="6" height="6" rx="0.8" fill="white"/>
    <rect x="7" y="20" width="3" height="3" fill="#E31837"/>
    <rect x="17" y="4" width="9" height="9" rx="1.5" fill="#E31837"/>
    <rect x="18.5" y="5.5" width="6" height="6" rx="0.8" fill="white"/>
    <rect x="20" y="7" width="3" height="3" fill="#E31837"/>
    <rect x="17" y="15" width="3" height="3" fill="#E31837"/>
    <rect x="22" y="15" width="4" height="3" fill="#E31837"/>
    <rect x="17" y="20" width="9" height="3" fill="#E31837"/>
    <rect x="17" y="24" width="4" height="2" fill="#E31837"/>
    {/* QRIS text */}
    <text x="30" y="20" fontFamily="Arial Black,sans-serif" fontSize="11.5" fontWeight="900" fill="#E31837">QRIS</text>
  </svg>
);

const AlfamartLogo = () => (
  <svg viewBox="0 0 88 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="88" height="30" rx="4" fill="#E31837"/>
    {/* Alfa triangle A */}
    <path d="M7 22L14 8l7 14M9 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <text x="23" y="20" fontFamily="Arial Black,sans-serif" fontSize="9.5" fontWeight="900" fill="white">ALFAMART</text>
  </svg>
);

const IndomaretLogo = () => (
  <svg viewBox="0 0 98 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="98" height="30" rx="4" fill="#E31837"/>
    <rect x="5" y="7" width="5" height="16" rx="1.5" fill="white"/>
    <text x="15" y="20" fontFamily="Arial Black,sans-serif" fontSize="9" fontWeight="900" fill="white">INDOMARET</text>
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const PublicLayout: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { wishlist } = useWishlist();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const didFetchMeRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
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

  const handleLogout = () => { logout(); navigate("/"); };

  const navigateToDashboard = () => {
    if (user?.role === UserRole.ADMIN) navigate("/admin");
    if (user?.role === UserRole.AGENT) navigate("/agent");
    if (user?.role === UserRole.CUSTOMER) navigate("/my-bookings");
  };

  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out border-b ${
        scrolled || !isHome ? "bg-white/95 backdrop-blur-md border-gray-100 shadow-sm py-3" : "bg-transparent border-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group relative z-10">
                <img src="/offest_inline_trp.png" alt="Trivgoo Logo" className="h-10 md:h-16 w-auto" />
              </Link>
              <div className="hidden md:ml-12 md:flex md:space-x-8">
                {["Home", "Explore"].map((item) => (
                  <Link key={item} to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className={`inline-flex items-center text-sm font-medium transition-colors hover:text-accent-500 ${
                      scrolled || !isHome ? "text-gray-600" : "text-white/90 hover:text-white"
                    }`}>{item}</Link>
                ))}
                <Link to="/ai-planner" className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  scrolled || !isHome ? "bg-primary-50 text-primary-700 hover:bg-primary-100 ring-1 ring-primary-100" : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border border-white/30"
                }`}>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />AI Planner
                </Link>
              </div>
            </div>

            <div className="hidden md:flex md:items-center space-x-2">
              {user && (
                <>
                  <Link to="/wishlist" title="Wishlist" className={`p-2 rounded-full transition-colors relative ${scrolled || !isHome ? "text-gray-600 hover:bg-gray-100" : "text-white/90 hover:bg-white/20"}`}>
                    <Heart className="w-5 h-5" />
                    {wishlist.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />}
                  </Link>
                  <button onClick={() => setIsCartOpen(true)} title="Keranjang" className={`relative p-2 rounded-full transition-colors ${scrolled || !isHome ? "text-gray-600 hover:bg-gray-100" : "text-white/90 hover:bg-white/20"}`}>
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow border border-white">{cartCount > 9 ? "9+" : cartCount}</span>}
                  </button>
                </>
              )}
              {user ? (
                <div className="flex items-center space-x-4 pl-2 border-l border-gray-200/20">
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
                      className={`flex items-center text-sm font-medium transition-colors group ${scrolled || !isHome ? "text-gray-700 hover:text-primary-600" : "text-white hover:text-primary-200"}`}
                    >
                      <UserAvatar 
                        user={user} 
                        className="h-9 w-9 border-2 border-white shadow-sm mr-2 group-hover:border-primary-200 transition-colors" 
                      />
                      <span>{user.name}</span>
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                        <Link 
                          to={user.role === UserRole.CUSTOMER ? '/my-account' : '/profile'} 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 mr-3 text-gray-400" /> Profil Saya
                        </Link>
                        {user.role === UserRole.CUSTOMER && (
                          <Link 
                            to="/my-bookings" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          >
                            <Package className="w-4 h-4 mr-3 text-gray-400" /> My Booking
                          </Link>
                        )}
                        {(user.role === UserRole.ADMIN || user.role === UserRole.AGENT) && (
                          <Link 
                            to={user.role === UserRole.ADMIN ? '/admin' : '/agent'} 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400" /> Dashboard
                          </Link>
                        )}
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                          onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }} 
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-red-500" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 pl-2 border-l border-gray-200/20">
                  <Link to="/login" className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${scrolled || !isHome ? "text-gray-600 hover:text-primary-600" : "text-white hover:text-primary-100"}`}>Login</Link>
                  <Link to="/register" className="bg-accent-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-accent-500/20 hover:bg-accent-600 hover:shadow-accent-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">Sign Up</Link>
                </div>
              )}
            </div>

            <div className="-mr-2 flex items-center md:hidden gap-1">
              <Link to="/wishlist" className={`relative p-2 ${scrolled || !isHome ? "text-gray-600" : "text-white"}`}>
                <Heart className="w-6 h-6" />
                {wishlist.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />}
              </Link>
              <button onClick={() => setIsCartOpen(true)} className={`relative p-2 ${scrolled || !isHome ? "text-gray-600" : "text-white"}`}>
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && <span className="absolute top-0 right-0 min-w-[16px] h-[16px] bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow border border-white">{cartCount > 9 ? "9+" : cartCount}</span>}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors ${scrolled || !isHome ? "text-gray-500 hover:bg-gray-100" : "text-white hover:bg-white/20"}`}>
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-xl border-t absolute w-full left-0 top-full">
            <div className="pt-2 pb-6 space-y-1 px-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="bg-primary-50 text-primary-700 block px-4 py-3 rounded-lg text-base font-medium mt-2">Home</Link>
              <Link to="/explore" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium">Explore</Link>
              <Link to="/ai-planner" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium">AI Planner</Link>
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium">
                Wishlist
                {wishlist.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlist.length}</span>}
              </Link>
              <button onClick={() => { setIsMenuOpen(false); setIsCartOpen(true); }} className="w-full text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium">
                <span className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Keranjang</span>
                {cartCount > 0 && <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
              </button>
              {!user ? (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex justify-center items-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex justify-center items-center px-4 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700">Sign Up</Link>
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
                    <LogOut className="w-5 h-5 mr-3" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow w-full"><Outlet /></main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div className="space-y-6">
              <img src="/Lapisan.png" alt="Trivgoo Logo" className="h-16 w-auto" />
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">Curating the world's most breathtaking adventures and luxury stays. Your journey begins with a single click.</p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-primary-600 transition-all cursor-pointer flex items-center justify-center text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </div>
                <a href="https://www.instagram.com/trivgoo/" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 bg-gray-800 rounded-full hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 transition-all duration-300 cursor-pointer flex items-center justify-center text-gray-400 hover:text-white transform hover:-translate-y-0.5 hover:shadow-lg">
                  <svg className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h2.28c-2.604-.251-5.18.251-5.18.251zm.968 1.954H9.79c-2.477 0-2.906.012-3.856.056-.95.044-1.463.197-1.805.33a3.02 3.02 0 00-1.115.727 3.02 3.02 0 00-.727 1.115c-.133.342-.286.855-.33 1.805-.044.95-.056 1.379-.056 3.856s.012 2.906.056 3.856c.044.95.197 1.463.33 1.805.215.549.512 1.047.882 1.472.425.37.923.667 1.472.882.342.133.855.286 1.805.33.95.044 1.379.056 3.856.056s2.906-.012 3.856-.056c.95-.044 1.463-.197 1.805-.33.549-.215 1.047-.512 1.472-.882.37-.425.667-.923.882-1.472.133-.342.286-.855.33-1.805.044-.95.056-1.379.056-3.856s-.012-2.906-.056-3.856c-.044-.95-.197-1.463-.33-1.805a3.02 3.02 0 00-.727-1.115 3.02 3.02 0 00-1.115-.727c-.342-.133-.855-.286-1.805-.33-.95-.044-1.379-.056-3.856-.056zm0 5.02a5.02 5.02 0 100 10.04 5.02 5.02 0 000-10.04zm0 1.954a3.066 3.066 0 110 6.132 3.066 3.066 0 010-6.132zm5.836-3.765a1.18 1.18 0 110 2.36 1.18 1.18 0 010-2.36z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white tracking-wide">Company</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to="/about-us" className="hover:text-primary-400 transition-colors">About Trivgoo</Link></li>
                <li><Link to="/career" className="hover:text-primary-400 transition-colors">Careers</Link></li>
                <li><Link to="/press-and-media" className="hover:text-primary-400 transition-colors">Press & Media</Link></li>
                <li><Link to="/travel-blog" className="hover:text-primary-400 transition-colors">Travel Blog</Link></li>
                <li><Link to="/register/agent" className="hover:text-primary-400 transition-colors">Become an Agent</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white tracking-wide">Support</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to="/help-center" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
                <li><Link to="/terms-and-service" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/contact-us" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white tracking-wide">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">Join our newsletter for exclusive deals and travel inspiration.</p>
              <form className="flex flex-col space-y-3">
                <input type="email" placeholder="Your email address" className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-500 text-sm" />
                <button className="bg-primary-600 px-4 py-3 rounded-xl font-bold text-sm hover:bg-primary-500 transition-all shadow-lg shadow-primary-900/50 hover:translate-y-[-2px]">Subscribe Now</button>
              </form>
            </div>
          </div>

          {/* ── Payment Methods Section ────────────────────────────────────── */}
          <div className="border-t border-gray-800 pt-8 pb-6">
            <div className="bg-white rounded-2xl px-6 py-5">
              <div className="flex flex-wrap gap-3 items-center">

                {/* ── Bank ── */}
                <img src="/payment_service/bca.png"     alt="BCA"          className="h-7 w-auto object-contain" />
                <img src="/payment_service/bni.png"     alt="BNI"          className="h-7 w-auto object-contain" />
                <img src="/payment_service/bri.png"     alt="BRI"          className="h-7 w-auto object-contain" />
                <img src="/payment_service/mandiri.png" alt="Mandiri"      className="h-7 w-auto object-contain" />
                <img src="/payment_service/permata.png" alt="Permata Bank" className="h-7 w-auto object-contain" />
                <img src="/payment_service/cimb.png"    alt="CIMB Niaga"   className="h-7 w-auto object-contain" />
                <img src="/payment_service/danamon.png" alt="Danamon"      className="h-7 w-auto object-contain" />

                <div className="w-px h-6 bg-gray-200 mx-1" />

                {/* ── Kartu ── */}
                <img src="/payment_service/visa.png"       alt="Visa"       className="h-6 w-auto object-contain" />
                <img src="/payment_service/mastercard.jpg" alt="Mastercard" className="h-8 w-auto object-contain" />

                <div className="w-px h-6 bg-gray-200 mx-1" />

                {/* ── Dompet Digital ── */}
                <img src="/payment_service/gopay.png"     alt="GoPay"     className="h-7 w-auto object-contain" />
                <img src="/payment_service/ovo.png"       alt="OVO"       className="h-6 w-auto object-contain" />
                <img src="/payment_service/dana.png"      alt="Dana"      className="h-7 w-auto object-contain" />
                <img src="/payment_service/shopeepay.png" alt="ShopeePay" className="h-6 w-auto object-contain" />

                <div className="w-px h-6 bg-gray-200 mx-1" />

                {/* ── Minimarket ── */}
                <img src="/payment_service/alfamart.png"  alt="Alfamart"  className="h-7 w-auto object-contain" />
                <img src="/payment_service/indomaret.png" alt="Indomaret" className="h-7 w-auto object-contain" />

                {/* ── Separator + DOKU di paling kanan/bawah ── */}
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <img src="/payment_service/doku.png" alt="DOKU" className="h-7 w-auto object-contain" />
                <span className="text-xs text-gray-400 font-medium">Secured by DOKU</span>

              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Trivgoo Inc. All rights reserved.</p>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
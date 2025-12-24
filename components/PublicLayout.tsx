import { Heart, LogOut, Menu, Sparkles, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useWishlist } from '../components/WishlistContext';
import { authService } from '../services/authService';
import { UserRole } from '../types';

const PublicLayout: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const didFetchMeRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (didFetchMeRef.current) return;
    didFetchMeRef.current = true;

    (async () => {
      try {
        const me = await authService.me();

        updateUser({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          avatar: me.avatar,
          specialization: me.specialization ?? null,
          verification_status: me.verification_status,
        });
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) logout();
      }
    })();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigateToDashboard = () => {
    if (user?.role === UserRole.ADMIN) navigate('/admin');
    if (user?.role === UserRole.AGENT) navigate('/agent');
    if (user?.role === UserRole.CUSTOMER) navigate('/my-bookings');
  };

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out border-b ${
          scrolled || !isHome
            ? 'bg-white/95 backdrop-blur-md border-gray-100 shadow-sm py-3'
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group relative z-10">
                <span
                  className={`text-2xl md:text-3xl font-serif font-bold tracking-tighter transition-colors ${
                    scrolled || !isHome ? 'text-primary-800' : 'text-white'
                  }`}
                >
                  trivgoo<span className="text-accent-500">.</span>
                </span>
              </Link>

              <div className="hidden md:ml-12 md:flex md:space-x-8">
                {['Home', 'Explore'].map((item) => (
                  <Link
                    key={item}
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className={`inline-flex items-center text-sm font-medium transition-colors hover:text-accent-500 ${
                      scrolled || !isHome ? 'text-gray-600' : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {item}
                  </Link>
                ))}

                <Link
                  to="/ai-planner"
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    scrolled || !isHome
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 ring-1 ring-primary-100'
                      : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border border-white/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  AI Planner
                </Link>
              </div>
            </div>

            <div className="hidden md:flex md:items-center space-x-4">
              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className={`p-2 rounded-full transition-colors relative group ${
                  scrolled || !isHome
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/20'
                }`}
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-4 pl-2 border-l border-gray-200/20">
                  <button
                    onClick={navigateToDashboard}
                    className={`flex items-center text-sm font-medium transition-colors group ${
                      scrolled || !isHome
                        ? 'text-gray-700 hover:text-primary-600'
                        : 'text-white hover:text-primary-200'
                    }`}
                  >
                    <img
                      className="h-9 w-9 rounded-full border-2 border-white shadow-sm mr-2 object-cover group-hover:border-primary-200 transition-colors"
                      src={user.avatar}
                      alt=""
                    />
                    <span>{user.name}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-full transition-colors ${
                      scrolled || !isHome
                        ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 pl-2 border-l border-gray-200/20">
                  <Link
                    to="/login"
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                      scrolled || !isHome
                        ? 'text-gray-600 hover:text-primary-600'
                        : 'text-white hover:text-primary-100'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    className="bg-accent-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-accent-500/20 hover:bg-accent-600 hover:shadow-accent-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center md:hidden">
              <Link
                to="/wishlist"
                className={`mr-4 p-2 ${scrolled || !isHome ? 'text-gray-600' : 'text-white'}`}
              >
                <Heart className="w-6 h-6" />
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors ${
                  scrolled || !isHome
                    ? 'text-gray-500 hover:bg-gray-100'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-xl border-t absolute w-full left-0 top-full">
            <div className="pt-2 pb-6 space-y-1 px-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="bg-primary-50 text-primary-700 block px-4 py-3 rounded-lg text-base font-medium mt-2"
              >
                Home
              </Link>
              <Link
                to="/explore"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium"
              >
                Explore
              </Link>
              <Link
                to="/ai-planner"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium"
              >
                AI Planner
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between"
              >
                Wishlist
                {wishlist.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {!user ? (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-center items-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-center items-center px-4 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center px-4 py-2">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={user.avatar || '/default-avatar.png'}
                      alt=""
                    />
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer (unchanged) */}
      <footer className="bg-gray-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div className="space-y-6">
              <span className="text-3xl font-serif font-bold tracking-tighter text-white block">
                trivgoo<span className="text-primary-500">.</span>
              </span>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Curating the world's most breathtaking adventures and luxury stays. Your journey
                begins with a single click.
              </p>
              <div className="flex space-x-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-primary-600 transition-all cursor-pointer flex items-center justify-center text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-primary-600 transition-all cursor-pointer flex items-center justify-center text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h2.28c-2.604-.251-5.18.251-5.18.251zm.968 1.954H9.79c-2.477 0-2.906.012-3.856.056-.95.044-1.463.197-1.805.33a3.02 3.02 0 00-1.115.727 3.02 3.02 0 00-.727 1.115c-.133.342-.286.855-.33 1.805-.044.95-.056 1.379-.056 3.856s.012 2.906.056 3.856c.044.95.197 1.463.33 1.805.215.549.512 1.047.882 1.472.425.37.923.667 1.472.882.342.133.855.286 1.805.33.95.044 1.379.056 3.856.056s2.906-.012 3.856-.056c.95-.044 1.463-.197 1.805-.33.549-.215 1.047-.512 1.472-.882.37-.425.667-.923.882-1.472.133-.342.286-.855.33-1.805.044-.95.056-1.379.056-3.856s-.012-2.906-.056-3.856c-.044-.95-.197-1.463-.33-1.805a3.02 3.02 0 00-.727-1.115 3.02 3.02 0 00-1.115-.727c-.342-.133-.855-.286-1.805-.33-.95-.044-1.379-.056-3.856-.056zm0 5.02a5.02 5.02 0 100 10.04 5.02 5.02 0 000-10.04zm0 1.954a3.066 3.066 0 110 6.132 3.066 3.066 0 010-6.132zm5.836-3.765a1.18 1.18 0 110 2.36 1.18 1.18 0 010-2.36z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white tracking-wide">
                Company
              </h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    About Trivgoo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Press & Media
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Travel Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white tracking-wide">
                Support
              </h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white tracking-wide">
                Stay Updated
              </h4>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Join our newsletter for exclusive deals and travel inspiration.
              </p>
              <form className="flex flex-col space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-500 text-sm"
                />
                <button className="bg-primary-600 px-4 py-3 rounded-xl font-bold text-sm hover:bg-primary-500 transition-all shadow-lg shadow-primary-900/50 hover:translate-y-[-2px]">
                  Subscribe Now
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2024 Trivgoo Inc. All rights reserved.</p>
            <div className="flex space-x-6 text-gray-500 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

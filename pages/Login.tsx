import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastContext';
import { agentService } from '../services/agentService';
import { authService } from '../services/authService';
import { UserRole, VerificationStatus } from '../types';

const inputClass =
  'appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';

// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  show: { opacity: 0.6, scale: 1, transition: { duration: 1.4, ease: 'easeOut' } },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } },
};

const Login: React.FC = () => {
  const { langNavigate, langPath } = useLangNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { login, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const passwordInputClass = useMemo(() => `${inputClass} pr-12`, []);

  const handleRedirectByRole = useCallback(
    (targetRole: UserRole | string | undefined) => {
      const r = (targetRole as UserRole) || UserRole.CUSTOMER;
      if (r === UserRole.ADMIN) {
        langNavigate('/admin');
      } else if (r === UserRole.AGENT) {
        langNavigate('/agent');
      } else {
        const from = (location.state as any)?.from;
        navigate(from || '/');
      }
    },
    [langNavigate, navigate, location.state],
  );

  const syncVerificationStatusIfAny = useCallback(async () => {
    try {
      const verification = await agentService.getMyVerification();
      if (!verification) return;
      const status = verification?.verification_status;
      if (status) updateUser({ verification_status: status as VerificationStatus });
    } catch { /* silent */ }
  }, [updateUser]);

  const handleResendVerification = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      const msg = await authService.resendUnverified(email);
      showToast(msg, 'success');
      setIsUnverified(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t('auth.resend_failed', 'Gagal mengirim ulang email');
      showToast(msg, 'error');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsUnverified(false);
      setLoading(true);
      try {
        const result = await login(email, password);
        if (!result.success) {
          const msg = result.message || t('auth.invalid_credentials');
          setError(msg);
          setIsUnverified(result.is_unverified === true);
          showToast(msg, 'error');
          return;
        }
        await syncVerificationStatusIfAny();
        showToast(t('auth.welcome_back'), 'success');
        handleRedirectByRole(result.user?.role as UserRole | undefined);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          t('auth.invalid_credentials', 'Invalid credentials.');
        const isUnverifiedFlag = err?.response?.data?.data?.is_unverified === true;
        setError(msg);
        setIsUnverified(isUnverifiedFlag);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, showToast, syncVerificationStatusIfAny, handleRedirectByRole, t],
  );

  return (
    <>
      <SEO title="Login | Trivgoo" noindex={true} />
      <div className="min-h-screen flex bg-white">

        {/* ── Left Side - Visual ── */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
          <motion.img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80"
            alt="Travel"
            className="absolute inset-0 w-full h-full object-cover"
            variants={panelVariants}
            initial="hidden"
            animate="show"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-primary-900 to-transparent"
            variants={overlayVariants}
            initial="hidden"
            animate="show"
          />
          <motion.div
            className="relative z-10 w-full flex flex-col justify-between p-12 text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          >
            <span className="text-3xl font-serif font-bold tracking-tighter mt-8" />
            <div>
              <h2 className="text-4xl font-serif font-bold text-white mb-6">
                {t('auth.login_visual_title')}
              </h2>
              <p className="text-lg text-primary-100 max-w-md">
                {t('auth.login_visual_desc')}
              </p>
            </div>
            <div className="text-primary-200 text-sm" />
          </motion.div>
        </div>

        {/* ── Right Side - Form ── */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <motion.div
            className="mx-auto w-full max-w-sm lg:w-96"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* Header */}
            <motion.div variants={fadeUp} className="mb-10">
              <Link
                to={langPath('/')}
                className="text-gray-400 hover:text-gray-600 flex items-center mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
              </Link>
              <h2 className="text-3xl font-serif font-bold text-gray-900">
                {t('auth.login_title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('auth.login_subtitle')}
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit}
              variants={staggerContainer}
            >
              {/* Email */}
              <motion.div variants={fadeUp}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('auth.email')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder={t('auth.email_placeholder')}
                    autoComplete="email"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={fadeUp}>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('auth.password')}
                  </label>
                  <Link
                    to={langPath('/forgot-password')}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    {t('auth.forgot_password')}
                  </Link>
                </div>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={passwordInputClass}
                    placeholder={t('auth.password_placeholder')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? t('common.close') : t('common.view')}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="rounded-lg bg-red-50 p-4 overflow-hidden"
                  >
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{t('common.error')}</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                        {isUnverified && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={handleResendVerification}
                              disabled={resendLoading}
                              className="text-sm font-medium text-red-800 underline hover:text-red-900 transition-colors disabled:opacity-50"
                            >
                              {resendLoading
                                ? t('auth.sending', 'Mengirim...')
                                : t('auth.resend_verification', 'Kirim Ulang Email Verifikasi')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.div variants={fadeUp}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      />
                      {t('auth.signing_in')}
                    </span>
                  ) : (
                    t('auth.login_button')
                  )}
                </motion.button>
              </motion.div>
            </motion.form>

            {/* Sign up link */}
            <motion.div variants={fadeUp} className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.no_account')}{' '}
                <Link
                  to={langPath('/register')}
                  className="font-bold text-primary-600 hover:text-primary-500 transition-colors"
                >
                  {t('auth.sign_up')}
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;

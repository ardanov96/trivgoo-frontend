import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
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
      const msg = err?.response?.data?.message || err?.message || t('auth.resend_failed', 'Gagal mengirim ulang email');
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
          const msg = result.message || t('auth.invalid_credentials', 'Invalid credentials.');
          setError(msg);
          setIsUnverified(result.is_unverified === true);
          showToast(msg, 'error');
          return;
        }
        await syncVerificationStatusIfAny();
        showToast(t('auth.welcome_back', 'Welcome back!'), 'success');
        handleRedirectByRole(result.user?.role as UserRole | undefined);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || t('auth.invalid_credentials', 'Invalid credentials.');
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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900 to-transparent" />
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <span className="text-3xl font-serif font-bold tracking-tighter mt-8" />
          <div>
            <h2 className="text-4xl font-serif font-bold text-white mb-6">
              {t('auth.login_visual_title', 'Turn your travel dreams into reality.')}
            </h2>
            <p className="text-lg text-primary-100 max-w-md">
              {t('auth.login_visual_desc', 'Join thousands of travelers who have found their perfect getaway with Trivgoo.')}
            </p>
          </div>
          <div className="text-primary-200 text-sm" />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link to={langPath('/')} className="text-gray-400 hover:text-gray-600 flex items-center mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back', 'Back to Home')}
            </Link>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              {t('auth.login_title', 'Welcome back')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.login_subtitle', 'Please enter your details to sign in.')}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email', 'Email address')}
              </label>
              <div className="mt-1">
                <input
                  id="email" name="email" type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder={t('auth.email_placeholder', 'you@example.com')}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('auth.password', 'Password')}
                </label>
                <Link to={langPath('/forgot-password')} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  {t('auth.forgot_password', 'Forgot password?')}
                </Link>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className={passwordInputClass}
                  placeholder={t('auth.password_placeholder', 'Enter your password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{t('common.error', 'Error')}</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                    {isUnverified && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendLoading}
                          className="text-sm font-medium text-red-800 underline hover:text-red-900 transition-colors disabled:opacity-50"
                        >
                          {resendLoading ? t('auth.sending', 'Mengirim...') : t('auth.resend_verification', 'Kirim Ulang Email Verifikasi')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? t('auth.signing_in', 'Signing in...') : t('auth.login_button', 'Sign in')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.no_account', "Don't have an account?")}{' '}
              <Link to={langPath('/register')} className="font-bold text-primary-600 hover:text-primary-500 transition-colors">
                {t('auth.sign_up', 'Sign up')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

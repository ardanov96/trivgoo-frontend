import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../components/ToastContext';
import { useLangNavigate } from '../src/hooks/useLangNavigate'; // ✅ fix missing import

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { langPath } = useLangNavigate(); // ✅ fix missing hook
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      showToast(t('auth.reset_link_sent', 'Reset link sent to your email'), 'success');
    } catch (err: any) {
      showToast(err.message || t('auth.reset_link_failed', 'Failed to send reset link'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <Link to={langPath('/login')} className="text-gray-400 hover:text-gray-600 flex items-center mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('auth.back_to_login', 'Back to Login')}
          </Link>
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            {t('auth.reset_password', 'Reset Password')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.reset_password_desc', "Enter your email and we'll send you a link to get back into your account.")}
          </p>
        </div>

        {!sent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email', 'Email Address')}
              </label>
              <input
                id="email" type="email" required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder={t('auth.email_placeholder', 'you@example.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-60"
            >
              {loading
                ? t('auth.sending', 'Sending...')
                : t('auth.send_reset', 'Send Reset Link')
              }
            </button>
          </form>
        ) : (
          <div className="mt-8 text-center p-6 bg-green-50 rounded-xl">
            <Mail className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-800 font-medium">{t('auth.check_email_title', 'Check your email!')}</p>
            <p className="text-green-700 text-sm mt-2">
              {t('auth.reset_sent_to', "We've sent a password reset link to")}{' '}
              <strong>{email}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

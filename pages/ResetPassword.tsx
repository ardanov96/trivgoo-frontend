import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../components/ToastContext';
import { useLangNavigate } from '../src/hooks/useLangNavigate'; // ✅ fix missing import

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { langNavigate, langPath } = useLangNavigate(); // ✅ fix missing hook
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidating(false);
        setTokenValid(false);
        return;
      }
      try {
        const data = await authService.validateResetToken(token);
        setEmail(data.email);
        setTokenValid(true);
      } catch (err: any) {
        setTokenValid(false);
        showToast(err.message || t('auth.token_invalid', 'Token is invalid or expired'), 'error');
      } finally {
        setValidating(false);
      }
    };
    validateToken();
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return showToast(t('auth.password_mismatch', 'Passwords do not match'), 'error');
    }
    if (password.length < 6) {
      return showToast(t('auth.password_too_short', 'Password must be at least 6 characters'), 'error');
    }
    setLoading(true);
    try {
      await authService.resetPassword({ token, password });
      showToast(t('auth.password_updated', 'Password updated successfully!'), 'success');
      langNavigate('/login'); // ✅ fix langNavigate
    } catch (err: any) {
      showToast(err.message || t('auth.reset_failed', 'Failed to reset password'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('auth.validating_token', 'Validating reset token...')}</p>
        </div>
      </div>
    );
  }

  // Invalid / expired token
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            {t('auth.invalid_link', 'Invalid Link')}
          </h2>
          <p className="text-gray-600 text-sm">
            {t('auth.invalid_link_desc', 'This reset password link is invalid or has expired. Please request a new one.')}
          </p>
          <Link
            to={langPath('/forgot-password')} // ✅
            className="inline-block w-full py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all text-center"
          >
            {t('auth.request_new_link', 'Request New Reset Link')}
          </Link>
          <Link
            to={langPath('/login')} // ✅
            className="block text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← {t('auth.back_to_login', 'Back to Login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            {t('auth.new_password', 'New Password')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.new_password_desc', 'Please enter your new password below.')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <div className="space-y-4">
            {/* Email Read-Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email', 'Email')}
              </label>
              <input
                type="email" value={email} readOnly disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
              />
            </div>

            {/* New Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.new_password', 'New Password')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder={t('auth.enter_new_password', 'Enter new password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.confirm_password', 'Confirm New Password')}
              </label>
              <input
                type="password" required minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder={t('auth.re_enter_password', 'Re-enter new password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Mismatch warning */}
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle size={14} />
                {t('auth.password_mismatch', 'Passwords do not match')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword || password !== confirmPassword}
            className="w-full py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? t('auth.updating', 'Updating...')
              : t('auth.update_password', 'Reset Password')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

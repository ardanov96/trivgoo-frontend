import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastContext';
import { authService } from '../services/authService';
import { UserRole } from '../types';

const inputClass = 'appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { langNavigate, langPath } = useLangNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    role: UserRole.CUSTOMER,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { refreshMe } = useAuth();
  const { showToast } = useToast();

  const setField = useCallback((key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        referral_code: localStorage.getItem('trivgoo_ref_code') || null,
      };
      await authService.register(payload);
      localStorage.removeItem('trivgoo_ref_code');
      setIsSuccess(true);
      showToast(t('auth.account_created'), 'success');
    } catch (err: any) {
      let msg = t('auth.register_failed');
      if (err?.response?.status === 409) {
        msg = t('auth.email_taken');
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <>
        <SEO title="Register | Trivgoo" noindex={true} />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 md:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('auth.check_email_title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.check_email_desc')}{' '}
            <strong className="text-gray-900">{form.email}</strong>.{' '}
            {t('auth.check_email_desc2')}
          </p>
          <div className="mt-6">
            <button
              onClick={() => langNavigate('/login')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              {t('auth.go_to_login')}
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Register | Trivgoo" noindex={true} />
      <div className="min-h-screen flex bg-white pt-16 md:pt-20">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1500&q=80"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent" />
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <span className="text-3xl font-serif font-bold tracking-tighter">
            <img src="/Lapisan.png" alt="Trivgoo Logo" className="h-16 w-auto" />
          </span>
          <div>
            <h2 className="text-4xl font-serif font-bold mb-6">
              {t('auth.register_visual_title')}
            </h2>
            <p className="text-lg text-primary-100 max-w-md">
              {t('auth.register_visual_desc')}
            </p>
          </div>
          <div className="text-primary-200 text-sm" />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link to={langPath('/login')} className="text-gray-400 hover:text-gray-600 flex items-center mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
            </Link>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              {t('auth.register_title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.register_subtitle')}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('auth.full_name')}
              </label>
              <input
                placeholder={t('auth.name_placeholder')}
                className={inputClass} required
                value={form.name} onChange={e => setField('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                placeholder={t('auth.email_placeholder')}
                type="email" className={inputClass} required
                value={form.email} onChange={e => setField('email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.phone')}
              </label>
              <input
                placeholder="e.g. 081234567890"
                type="tel" className={inputClass} required
                value={form.phone_number} onChange={e => setField('phone_number', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.create_password')}
                  className={`${inputClass} pr-12`} required
                  value={form.password} onChange={e => setField('password', e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.signing_up') : t('auth.register_button')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.have_account')}{' '}
            <Link to={langPath('/login')} className="font-bold text-primary-600 hover:text-primary-500">
              {t('auth.sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register;

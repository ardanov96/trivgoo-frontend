import { ArrowLeft, Eye, EyeOff, Building2, Car, Palmtree } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastContext';
import { authService } from '../services/authService';
import { AgentSpecialization, UserRole } from '../types';

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
  show: { opacity: 0.5, scale: 1, transition: { duration: 1.4, ease: 'easeOut' } },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } },
};

const successVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const RegisterAgent: React.FC = () => {
  const { t } = useTranslation();
  const { langNavigate, langPath } = useLangNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    role: UserRole.AGENT,
    specialization: AgentSpecialization.TOUR,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { refreshMe, updateUser } = useAuth();
  const { showToast } = useToast();

  const setField = useCallback((key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(form);
      setIsSuccess(true);
      showToast(t('auth.account_created', 'Account created! Please verify your email.'), 'success');
    } catch (err: any) {
      let msg = t('auth.register_failed', 'Registration failed. Please try again.');
      if (err?.response?.status === 409)
        msg = t('auth.email_taken', 'Email already registered. Please use another email or Login.');
      else if (err?.response?.data?.message) msg = err.response.data.message;
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
        <SEO title="Agent Registration | Trivgoo" noindex={true} />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 md:pt-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center"
            variants={successVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {t('auth.check_email_title', 'Check Your Email!')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('auth.check_email_desc', 'We sent a verification link to')}{' '}
                <strong className="text-gray-900">{form.email}</strong>.{' '}
                {t('auth.check_email_desc2', 'Please check your inbox (or spam folder) to activate your Agent account.')}
              </p>
            </motion.div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <motion.button
                onClick={() => langNavigate('/login')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                {t('auth.go_to_login', 'Go to Login')}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  // ── Specialization button helper ────────────────────────────────────────────
  const specBtnBase =
    'cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-colors';

  const specBtnClass = (active: boolean) =>
    `${specBtnBase} ${
      active
        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
        : 'border-gray-200 text-gray-500 hover:border-gray-300'
    }`;

  return (
    <>
      <SEO title="Agent Registration | Trivgoo" noindex={true} />
      <div className="min-h-screen flex bg-white pt-16 md:pt-20">

        {/* ── Left Side - Visual ── */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-primary-900 overflow-hidden">
          <motion.img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1500&q=80"
            alt="Business Partnership"
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
            <span className="text-3xl font-serif font-bold tracking-tighter">
              <img src="/Lapisan.png" alt="Trivgoo Logo" className="h-16 w-auto" />
            </span>
            <div>
              <h2 className="text-4xl font-serif font-bold mb-6">
                {t('auth.agent_visual_title', 'Grow your business with us.')}
              </h2>
              <p className="text-lg text-primary-100 max-w-md">
                {t('auth.agent_visual_desc', 'Reach millions of travelers and manage your bookings with our advanced partner tools.')}
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
                to={langPath('/login')}
                className="text-gray-400 hover:text-gray-600 flex items-center mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth.back_to_login', 'Back to Login')}
              </Link>
              <h2 className="text-3xl font-serif font-bold text-gray-900">
                {t('auth.become_agent', 'Become an Agent')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('auth.agent_subtitle', 'Register your agency or service provider account.')}
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit}
              variants={staggerContainer}
            >
              {/* Business name */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-gray-700">
                  {t('auth.business_name', 'Business / Full Name')}
                </label>
                <input
                  placeholder={t('auth.business_name_placeholder', 'e.g. Nusantara Wisata Tour')}
                  className={inputClass}
                  required
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                />
              </motion.div>

              {/* Email */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-gray-700">
                  {t('auth.business_email', 'Business Email')}
                </label>
                <input
                  placeholder="agency@example.com"
                  type="email"
                  className={inputClass}
                  required
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                />
              </motion.div>

              {/* Phone */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-gray-700">
                  {t('profile.phone', 'Phone Number')}
                </label>
                <input
                  placeholder="e.g. 081234567890"
                  type="tel"
                  className={inputClass}
                  required
                  value={form.phone_number}
                  onChange={e => setField('phone_number', e.target.value)}
                />
              </motion.div>

              {/* Specialization selector */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.business_focus', 'My Business Focus')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: AgentSpecialization.TOUR,      Icon: Palmtree,  label: t('auth.spec_tour', 'Tour') },
                    { value: AgentSpecialization.STAY,      Icon: Building2, label: t('auth.spec_stay', 'Stay') },
                    { value: AgentSpecialization.TRANSPORT, Icon: Car,       label: t('auth.spec_transport', 'Transport') },
                  ].map(({ value, Icon, label }) => (
                    <motion.div
                      key={value}
                      role="button"
                      onClick={() => setField('specialization', value)}
                      className={specBtnClass(form.specialization === value)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-bold">{label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.create_password', 'Create a strong password')}
                    className={`${inputClass} pr-12`}
                    required
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
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
                    <div className="text-sm text-red-700">{error}</div>
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
                  className="w-full py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      />
                      {t('auth.processing', 'Processing...')}
                    </span>
                  ) : (
                    t('auth.register_as_agent', 'Register as Agent')
                  )}
                </motion.button>
              </motion.div>
            </motion.form>

            {/* Sign in link */}
            <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-gray-600">
              {t('auth.have_partner_account', 'Already have a partner account?')}{' '}
              <Link
                to={langPath('/login')}
                className="font-bold text-primary-600 hover:text-primary-500"
              >
                {t('auth.sign_in', 'Sign in')}
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RegisterAgent;

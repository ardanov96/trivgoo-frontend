import { ArrowLeft, Building2, Car, Eye, EyeOff, Palmtree } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastContext';
import { agentService } from '../services/agentService';
import { authService } from '../services/authService';
import { AgentSpecialization, UserRole, VerificationStatus } from '../types';

type FormState = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  specialization: AgentSpecialization;
};

const initialForm: FormState = {
  name: '',
  email: '',
  password: '',
  role: UserRole.CUSTOMER,
  specialization: AgentSpecialization.TOUR,
};

const inputClass =
  'appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, updateUser, refreshMe } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleRedirectByRole = useCallback(
    (targetRole: UserRole | string | undefined) => {
      const r = (targetRole as UserRole) || UserRole.CUSTOMER;

      if (r === UserRole.ADMIN) {
        navigate('/admin');
      } else if (r === UserRole.AGENT) {
        navigate('/agent');
      } else {
        const from = (location.state as any)?.from;
        navigate(from || '/');
      }
    },
    [navigate, location.state],
  );

  const syncVerificationStatusIfAny = useCallback(async () => {
    try {
      const verification = await agentService.getMyVerification();
      if (!verification) return;

      const status = verification?.verification_status;
      if (status) {
        updateUser({ verification_status: status as VerificationStatus });
      }
    } catch {
      // silent
    }
  }, [updateUser]);

  const roleBtnClass = useCallback(
    (active: boolean) =>
      `cursor-pointer px-4 py-3 rounded-xl border text-center font-medium text-sm transition-all ${
        active
          ? 'border-primary-500 bg-primary-50 text-primary-700'
          : 'border-gray-200 hover:border-gray-300 text-gray-600'
      }`,
    [],
  );

  const specBtnClass = useCallback(
    (active: boolean) =>
      `cursor-pointer p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
        active
          ? 'border-primary-500 bg-primary-50 text-primary-700'
          : 'border-gray-200 text-gray-500 hover:border-gray-300'
      }`,
    [],
  );

  const passwordInputClass = useMemo(() => `${inputClass} pr-12`, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        // ===== REGISTER FLOW =====
        if (isRegistering) {
          const payload: any = {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
          };

          if (form.role === UserRole.AGENT) {
            payload.specialization = form.specialization;
          }

          await authService.register(payload);
          await refreshMe();
          await syncVerificationStatusIfAny();

          showToast('Account created! Welcome.', 'success');
          handleRedirectByRole(form.role);
          return;
        }

        // ===== LOGIN FLOW =====
        const result = await login(form.email, form.password);
        if (!result.success) {
          const msg = result.message || 'Invalid credentials.';
          setError(msg);
          showToast(msg, 'error');
          return;
        }

        await syncVerificationStatusIfAny();
        showToast('Welcome back!', 'success');

        const backendRole = result.user?.role as UserRole | undefined;
        handleRedirectByRole(backendRole);
      } catch (err: any) {
        console.error(err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          (isRegistering
            ? 'Registration failed. Email might already be in use.'
            : 'Invalid credentials.');
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [
      form,
      isRegistering,
      login,
      refreshMe,
      showToast,
      syncVerificationStatusIfAny,
      handleRedirectByRole,
    ],
  );

  const fillCredentials = useCallback((roleEmail: string) => {
    setForm((prev) => ({ ...prev, email: roleEmail, password: '' }));
    setIsRegistering(false);
  }, []);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent"></div>
        <div className="relative z-10 w-full flex flex-col justify-between p-12">
          <div className="flex items-center">
            <span className="text-3xl font-serif font-bold text-white tracking-tighter">
              trivgoo.
            </span>
          </div>
          <div>
            <h2 className="text-4xl font-serif font-bold text-white mb-6">
              Turn your travel dreams into reality.
            </h2>
            <p className="text-lg text-primary-100 max-w-md">
              Join thousands of travelers who have found their perfect getaway with Trivgoo.
            </p>
          </div>
          <div className="text-primary-200 text-sm">&copy; 2024 Trivgoo Inc.</div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link
              to="/"
              className="text-gray-400 hover:text-gray-600 flex items-center mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>

            <h2 className="text-3xl font-serif font-bold text-gray-900">
              {isRegistering ? 'Create Account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isRegistering
                ? 'Enter your details to get started.'
                : 'Please enter your details to sign in.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    className={inputClass}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  I am
                </label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setField('role', UserRole.CUSTOMER)}
                    className={roleBtnClass(form.role === UserRole.CUSTOMER)}
                    role="button"
                    tabIndex={0}
                  >
                    Traveler
                  </div>
                  <div
                    onClick={() => setField('role', UserRole.AGENT)}
                    className={roleBtnClass(form.role === UserRole.AGENT)}
                    role="button"
                    tabIndex={0}
                  >
                    Agent / Vendor
                  </div>
                </div>
              </div>
            )}

            {isRegistering && form.role === UserRole.AGENT && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  My Business Focus
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setField('specialization', AgentSpecialization.TOUR)}
                    className={specBtnClass(form.specialization === AgentSpecialization.TOUR)}
                    role="button"
                    tabIndex={0}
                  >
                    <Palmtree className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Tour</span>
                  </div>

                  <div
                    onClick={() => setField('specialization', AgentSpecialization.STAY)}
                    className={specBtnClass(form.specialization === AgentSpecialization.STAY)}
                    role="button"
                    tabIndex={0}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Stay</span>
                  </div>

                  <div
                    onClick={() => setField('specialization', AgentSpecialization.TRANSPORT)}
                    className={specBtnClass(form.specialization === AgentSpecialization.TRANSPORT)}
                    role="button"
                    tabIndex={0}
                  >
                    <Car className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Trans</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>

                {!isRegistering && (
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: arahkan ke page forgot password kalau udah ada
                      showToast('Forgot password flow belum dibuat.', 'info');
                    }}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  className={passwordInputClass}
                  placeholder={isRegistering ? 'Create a password' : 'Enter your password'}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
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
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? isRegistering
                    ? 'Signing up...'
                    : 'Signing in...'
                  : isRegistering
                  ? 'Sign Up'
                  : 'Sign in'}
              </button>
            </div>

            {/* contoh helper (kalau mau dipakai lagi nanti) */}
            {/* <button type="button" onClick={() => fillCredentials("agent@demo.com")}>Use Demo</button> */}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering((v) => !v);
                  setError('');
                  setShowPassword(false);
                  // optional: reset password aja biar aman
                  setForm((prev) => ({ ...prev, password: '' }));
                }}
                className="font-bold text-primary-600 hover:text-primary-500 transition-colors"
              >
                {isRegistering ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

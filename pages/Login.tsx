import { ArrowLeft, Building2, Car, Palmtree } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastContext';
import { agentService } from '../services/agentService';
import { authService } from '../services/authService';
import { AgentSpecialization, UserRole, VerificationStatus } from '../types';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [specialization, setSpecialization] = useState<AgentSpecialization>(
    AgentSpecialization.TOUR,
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ session auth: pakai login + updateUser + refreshMe
  const { login, updateUser, refreshMe } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRedirectByRole = (targetRole: UserRole | string | undefined) => {
    const r = (targetRole as UserRole) || UserRole.CUSTOMER;

    if (r === UserRole.ADMIN) {
      navigate('/admin');
    } else if (r === UserRole.AGENT) {
      navigate('/agent');
    } else {
      const from = (location.state as any)?.from;
      navigate(from || '/');
    }
  };

  const syncVerificationStatusIfAny = async () => {
    try {
      const verification = await agentService.getMyVerification();
      if (!verification) return;

      const status = verification?.verification_status;

      if (status) {
        updateUser({ verification_status: status as VerificationStatus });
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ===== REGISTER FLOW =====
      if (isRegistering) {
        const payload: any = {
          name,
          email,
          password,
          role,
        };

        if (role === UserRole.AGENT) {
          payload.specialization = specialization;
        }

        // backend register sekarang set session + return { user: ... }
        await authService.register(payload);

        // ✅ ambil user terbaru dari session
        await refreshMe();

        // optional: sync verification status dari endpoint verification
        await syncVerificationStatusIfAny();

        showToast('Account created! Welcome.', 'success');

        // redirect berdasarkan role yg dipilih (atau nanti bisa ambil dari ctx user)
        handleRedirectByRole(role);
        return;
      }

      // ===== LOGIN FLOW =====
      const result = await login(email, password);
      if (!result.success) {
        const msg = result.message || 'Invalid credentials.';
        setError(msg);
        showToast(msg, 'error');
        return;
      }

      // optional: sync verification status dari endpoint verification (khusus agent)
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
  };

  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword(''); // biarin user isi password sendiri
    setIsRegistering(false);
  };

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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
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
                    onClick={() => setRole(UserRole.CUSTOMER)}
                    className={`cursor-pointer px-4 py-3 rounded-xl border text-center font-medium text-sm transition-all ${
                      role === UserRole.CUSTOMER
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    Traveler
                  </div>
                  <div
                    onClick={() => setRole(UserRole.AGENT)}
                    className={`cursor-pointer px-4 py-3 rounded-xl border text-center font-medium text-sm transition-all ${
                      role === UserRole.AGENT
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    Agent / Vendor
                  </div>
                </div>
              </div>
            )}

            {isRegistering && role === UserRole.AGENT && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  My Business Focus
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setSpecialization(AgentSpecialization.TOUR)}
                    className={`cursor-pointer p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                      specialization === AgentSpecialization.TOUR
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Palmtree className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Tour</span>
                  </div>
                  <div
                    onClick={() => setSpecialization(AgentSpecialization.STAY)}
                    className={`cursor-pointer p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                      specialization === AgentSpecialization.STAY
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Stay</span>
                  </div>
                  <div
                    onClick={() => setSpecialization(AgentSpecialization.TRANSPORT)}
                    className={`cursor-pointer p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                      specialization === AgentSpecialization.TRANSPORT
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
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
                  <a
                    href="#"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={isRegistering ? 'Create a password' : 'Enter your password'}
                />
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
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
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

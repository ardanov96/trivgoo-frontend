import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastContext';
import { authService } from '../services/authService';
import { UserRole } from '../types';

const inputClass = 'appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';

const Register: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    role: UserRole.CUSTOMER, // Default role disetel ke CUSTOMER
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { refreshMe } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const setField = useCallback((key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mengirim payload dengan role yang sudah dipastikan CUSTOMER
      await authService.register(form);

      setIsSuccess(true);
      showToast('Account created! Please verify your email.', 'success');
    } catch (err: any) {
      let msg = 'Registration failed. Please try again.';
      if (err?.response?.status === 409) {
        msg = 'Email sudah terdaftar. Silakan gunakan email lain atau Login.';
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }

      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 md:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Periksa Email Anda!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Kami telah mengirimkan tautan verifikasi ke <strong className="text-gray-900">{form.email}</strong>.
            Silakan periksa kotak masuk (atau folder spam) Anda untuk mengaktifkan akun.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Lanjut ke Halaman Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white pt-16 md:pt-20">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1500&q=80"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent"></div>
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <span className="text-3xl font-serif font-bold tracking-tighter">
            <img
              src="/Lapisan.png"
              alt="Trivgoo Logo"
              className="h-16 w-auto"
            />
          </span>
          <div>
            <h2 className="text-4xl font-serif font-bold mb-6">Start your journey today.</h2>
            <p className="text-lg text-primary-100 max-w-md">Join thousands of travelers who have found their perfect getaway with Trivgoo.</p>
          </div>
          <div className="text-primary-200 text-sm"></div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link to="/login" className="text-gray-400 hover:text-gray-600 flex items-center mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your details to get started as a Traveler.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                placeholder="John Doe"
                className={inputClass}
                required
                value={form.name}
                onChange={e => setField('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                placeholder="you@example.com"
                type="email"
                className={inputClass}
                required
                value={form.email}
                onChange={e => setField('email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
              <input
                placeholder="cth: 081234567890"
                type="tel"
                className={inputClass}
                required
                value={form.phone_number}
                onChange={e => setField('phone_number', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
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
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500">Sign in</Link>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-2">Tertarik menjadi Mitra/Agen Trivgoo?</p>
            <Link to="/register/agent" className="inline-flex items-center justify-center px-4 py-2 border border-primary-200 text-sm font-medium rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors">
              Daftar sebagai Agen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
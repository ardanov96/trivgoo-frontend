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
    password: '',
    role: UserRole.CUSTOMER, // Default role disetel ke CUSTOMER
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      await refreshMe();

      showToast('Account created! Welcome.', 'success');
      navigate('/'); // Redirect ke home setelah berhasil mendaftar sebagai customer
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Email might already be in use.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

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
          <span className="text-3xl font-serif font-bold tracking-tighter">trivgoo.</span>
          <div>
            <h2 className="text-4xl font-serif font-bold mb-6">Start your journey today.</h2>
            <p className="text-lg text-primary-100 max-w-md">Join thousands of travelers who have found their perfect getaway with Trivgoo.</p>
          </div>
          <div className="text-primary-200 text-sm">&copy; 2024 Trivgoo Inc.</div>
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
        </div>
      </div>
    </div>
  );
};

export default Register;
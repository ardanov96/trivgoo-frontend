import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useLangNavigate } from '../src/hooks/useLangNavigate'; // ✅ fix

const VerifyEmail: React.FC = () => {
  const { t } = useTranslation();
  const { langPath } = useLangNavigate(); // ✅ fix
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status,  setStatus]  = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState(t('auth.verify_email_desc', 'Verifying your email...'));
  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('auth.verify_token_missing', 'Invalid or missing verification token.'));
      return;
    }
    if (hasFetched.current) return;
    hasFetched.current = true;
    const verify = async () => {
      try {
        const msg = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(msg);
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.response?.data?.message || t('auth.verify_failed', 'Verification failed. The link might be expired or invalid.'));
      }
    };
    verify();
  }, [token, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">

        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 text-primary-600 animate-spin mb-4" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{t('auth.validating_token', 'Validating...')}</h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{t('auth.verify_success', 'Success!')}</h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            <div className="mt-6">
              <Link to={langPath('/login')} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition">
                {t('auth.go_to_login', 'Go to Login')}
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{t('auth.verify_title', 'Verification Failed')}</h2>
            <p className="mt-2 text-sm text-red-600 font-medium">{message}</p>
            <div className="mt-6 space-y-3 w-full">
              <Link to={langPath('/login')} className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
                {t('auth.back_to_login', 'Back to Login')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

import {
  Building2,
  CheckCircle,
  Clock,
  CreditCard,
  LayoutDashboard,
  Upload,
  User,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { agentService } from '../../services/agentService';
import { authService } from '../../services/authService';
import { AgentSpecialization, AgentType, VerificationStatus } from '../../types';

const AgentVerification: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: AgentType.INDIVIDUAL,
    idCardNumber: '',
    taxId: '',
    companyName: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idDocumentName, setIdDocumentName] = useState<string>('');

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    if (didFetchRef.current) return;
    didFetchRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const verification = await agentService.getMyVerification();

        const status = verification?.verification_status as VerificationStatus;

        if (cancelled) return;

        if (user?.verification_status !== status) {
          updateUser({ ...user, verification_status: status });
        }
      } catch {
        if (cancelled) return;

        if (user?.verification_status !== VerificationStatus.PENDING) {
          updateUser({ ...user, verification_status: VerificationStatus.PENDING });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (user?.verification_status === VerificationStatus.VERIFIED) {
      navigate('/agent');
    }
  }, [user?.verification_status, navigate]);

  if (user?.verification_status === VerificationStatus.PENDING) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center p-12 animate-in fade-in">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-25" />
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Under Review</h2>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Thank you for submitting your documents. Our admin team is currently reviewing your
            profile to ensure safety and quality.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto border border-gray-100 mb-10">
            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              Next Steps
            </h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Admin reviews your ID and business documents.</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                  2
                </div>
                <span>You will receive a notification upon approval.</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                  3
                </div>
                <span>Once approved, you can start adding products.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/agent')}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Explore Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIdDocument(file);
    setIdDocumentName(file ? file.name : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      setError(null);

      const specialization = user.specialization || AgentSpecialization.TOUR;

      await agentService.submitVerification({
        type: formData.type,
        idCardNumber: formData.idCardNumber,
        taxId: formData.taxId,
        companyName: formData.companyName || undefined,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
        specialization,
        idDocument,
      });

      let freshUser: any = null;
      try {
        freshUser = await authService.me();
      } catch {}

      const verification = await agentService.getMyVerification();
      const vStatus =
        (verification?.verification_status as VerificationStatus) ?? VerificationStatus.PENDING;

      if (freshUser) {
        const mergedUser = freshUser.user ? freshUser.user : freshUser;
        updateUser({
          ...mergedUser,
          verification_status: vStatus,
        });
      } else {
        updateUser({
          ...user,
          verification_status: vStatus,
        });
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit verification. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Verification</h1>
        <p className="text-gray-500">Complete your profile to start listing services on Trivgoo.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-primary-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                step === 1
                  ? 'bg-white text-primary-600 border-white'
                  : 'bg-primary-700 border-primary-500 text-primary-300'
              }`}
            >
              1
            </div>
            <div className="h-1 w-12 bg-primary-500 rounded" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                step === 2
                  ? 'bg-white text-primary-600 border-white'
                  : 'bg-primary-700 border-primary-500 text-primary-300'
              }`}
            >
              2
            </div>
          </div>
          <span className="font-bold uppercase text-sm tracking-wider">
            {step === 1 ? 'Profile Details' : 'Bank Details'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Agent Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData({ ...formData, type: AgentType.INDIVIDUAL })}
                    className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                      formData.type === AgentType.INDIVIDUAL
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-bold">Individual</span>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, type: AgentType.CORPORATE })}
                    className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                      formData.type === AgentType.CORPORATE
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-bold">Corporate</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ID Card / Passport Number
                  </label>
                  <input
                    required
                    name="idCardNumber"
                    value={formData.idCardNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. 3201..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tax ID (NPWP)
                  </label>
                  <input
                    required
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. 09.2..."
                  />
                </div>
              </div>

              {formData.type === AgentType.CORPORATE && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                  <input
                    required
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. PT. Travel Jaya"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Upload ID Document
                </label>
                <label
                  htmlFor="idDocument"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm">
                    {idDocumentName || 'Click to upload KTP or Passport'}
                  </span>
                  <input
                    id="idDocument"
                    name="idDocument"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" /> Bank Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                    <input
                      required
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="e.g. BCA"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        required
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="123xxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Account Holder Name
                      </label>
                      <input
                        required
                        name="accountHolder"
                        value={formData.accountHolder}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Name on Card"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Verification'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AgentVerification;

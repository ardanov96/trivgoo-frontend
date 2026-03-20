import {
  ArrowLeft, Camera, Check, Eye, EyeOff, Lock, Mail, ShieldCheck, User,
  Building2, Save, MapPin, Phone, Info, Clock, AlertCircle, X, ShieldAlert
} from "lucide-react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { useAuth } from "../../AuthContext";
import { agentService } from "../../services/agentService";
import { useToast } from "../../components/ToastContext";

type Tab = 'profile' | 'security' | 'business';

export default function ProfileSetting() {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth.user;
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── SERVER DATA ─────────────────────────────────────────────────────────────
  const [serverProfile, setServerProfile] = useState<any>(null);
  const [serverBiz, setServerBiz] = useState<any>(null);
  const [serverReq, setServerReq] = useState<any>(null);

  // ── FORM STATES ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarState, setAvatarState] = useState<{ kind: "url" | "file"; preview: string; file?: File }>({
    kind: "url",
    preview: "/default-avatar.png",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

  // ── INITIAL DATA FETCH ───────────────────────────────────────────────────────
  const fetchSettings = async () => {
    try {
      setIsLoadingUser(true);
      const data = await agentService.getProfileSettings();
      const p = data.profile || {};
      
      setServerProfile(p);
      setServerBiz(data.business);
      setServerReq(data.pending_bank_request);

      setFormData({
        name: p.name || "",
        phone: p.phone || "",
        address: p.address || "",
      });

      setAvatarState({
        kind: "url",
        preview: p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'Agent')}`,
      });
    } catch (e: any) {
      showToast(e.message || 'Failed to load settings', 'error');
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ── DIRTY CHECK (PROFILE) ────────────────────────────────────────────────────
  const isProfileDirty = useMemo(() => {
    if (!serverProfile) return false;
    if (avatarState.kind === 'file') return true;
    if (formData.name.trim() !== (serverProfile.name || "")) return true;
    if (formData.phone.trim() !== (serverProfile.phone || "")) return true;
    if (formData.address.trim() !== (serverProfile.address || "")) return true;
    return false;
  }, [formData, serverProfile, avatarState]);

  // ── VALIDATION & SUBMIT: PROFILE ─────────────────────────────────────────────
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileDirty) return;

    if (!formData.name.trim()) return showToast('Full Name is required.', 'error');
    
    // WA Validation logic: minimum 10 digits
    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (cleanedPhone && cleanedPhone.length < 10) {
      return showToast('Nomor WA / HP tidak valid.', 'error');
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('phone', formData.phone);
      payload.append('address', formData.address);
      if (avatarState.kind === 'file' && avatarState.file) {
        payload.append('avatar', avatarState.file);
      }

      await agentService.updateProfile(payload);
      showToast('Perubahan profil dan kontak berhasil disimpan.', 'success');
      await fetchSettings(); // refresh state to clear dirty check
      if ((auth as any).refreshUser) (auth as any).refreshUser();
    } catch (e: any) {
      showToast(e.response?.data?.message || e.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── VALIDATION & SUBMIT: SECURITY ────────────────────────────────────────────
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = securityData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return showToast('Semua field kata sandi wajib diisi.', 'error');
    }
    if (newPassword.length < 8) {
      return showToast('Kata sandi baru minimal 8 karakter.', 'error');
    }
    if (newPassword !== confirmPassword) {
      return showToast('Konfirmasi kata sandi tidak cocok.', 'error');
    }

    setIsSubmitting(true);
    try {
      await agentService.updatePassword({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword });
      
      await Swal.fire({
        icon: 'success',
        title: 'Sandi Diperbarui',
        text: 'Silakan login kembali dengan sandi baru Anda.',
        confirmButtonColor: '#0f172a',
      });
      // Logout trigger by AuthContext logic or simply navigate
      window.location.reload();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Sandi saat ini salah.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── BANK REQUEST MODAL ───────────────────────────────────────────────────────
  const promptBankChange = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Request Bank Change',
      html: `
        <div class="text-left space-y-4 mt-4">
          <p class="text-sm text-amber-600 mb-2 font-medium bg-amber-50 p-3 rounded-lg flex items-start">
             <span class="mr-2">⚠️</span>
             Rekening pencairan komisi hanya dapat diubah melalui peninjauan Admin demi keamanan dana Anda.
          </p>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase">Nama Bank</label>
            <input id="swal-bank" class="swal2-input !mx-0 !w-full !mt-1 !text-sm" placeholder="Contoh: BCA / Mandiri">
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase">Nomor Rekening</label>
            <input id="swal-acc" type="number" class="swal2-input !mx-0 !w-full !mt-1 !text-sm" placeholder="Contoh: 1234567890">
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase">Atas Nama Rekening</label>
            <input id="swal-name" class="swal2-input !mx-0 !w-full !mt-1 !text-sm" placeholder="Sesuai buku tabungan">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Ajukan Perubahan',
      confirmButtonColor: '#0f172a',
      preConfirm: () => {
        const bank_name = (document.getElementById('swal-bank') as HTMLInputElement).value;
        const bank_account_number = (document.getElementById('swal-acc') as HTMLInputElement).value;
        const bank_account_holder = (document.getElementById('swal-name') as HTMLInputElement).value;

        if (!bank_name || !bank_account_number || !bank_account_holder) {
          Swal.showValidationMessage('Semua form wajib diisi');
          return false;
        }
        return { bank_name, bank_account_number, bank_account_holder };
      }
    });

    if (formValues) {
      try {
        await agentService.requestBankChange(formValues);
        showToast('Permintaan Anda telah dikirim ke Admin.', 'success');
        fetchSettings();
      } catch (e: any) {
        showToast(e.response?.data?.message || e.message, 'error');
      }
    }
  };

  // ── RENDER HELPERS ───────────────────────────────────────────────────────────
  if (isLoadingUser) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sticky top-0 bg-gray-50 z-20 py-4 gap-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings & Configuration</h1>
            <p className="text-sm text-gray-500">Enterprise Profile & Security Management</p>
          </div>
        </div>
        {activeTab === 'profile' && (
          <button
            onClick={handleProfileSubmit}
            disabled={!isProfileDirty || isSubmitting}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
          >
            {isSubmitting ? (
              <span className="flex items-center"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Saving...</span>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Profile</>
            )}
          </button>
        )}
         {activeTab === 'security' && (
          <button
            onClick={handleSecuritySubmit}
            disabled={!securityData.oldPassword || !securityData.newPassword || !securityData.confirmPassword || isSubmitting}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
          >
             {isSubmitting ? (
              <span className="flex items-center"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Updating...</span>
            ) : (
              <><Lock className="w-4 h-4 mr-2" /> Update Password</>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* VERTICAL SIDEBAR TABS */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col gap-1 sticky top-32">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-colors ${
                activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5 mr-3" />
              General Profile
              {isProfileDirty && activeTab !== 'profile' && <span className="w-2 h-2 rounded-full bg-amber-500 ml-auto" title="Unsaved changes"></span>}
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-colors ${
                activeTab === 'security' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShieldCheck className="w-5 h-5 mr-3" />
              Security
            </button>

            <button
              onClick={() => setActiveTab('business')}
              className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-colors ${
                activeTab === 'business' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-5 h-5 mr-3" />
              Business & Payout
              {serverReq && <span className="ml-auto flex items-center justify-center bg-blue-100 text-blue-700 text-[10px] uppercase px-2 py-0.5 rounded-full font-bold">Pending</span>}
            </button>
          </div>
        </div>

        {/* TAB CONTENT PANEL */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] overflow-hidden">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Public Profile & Contact</h2>
              
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                    <img src={avatarState.preview} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2.5 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black transition-transform active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) return showToast('Maksimal ukuran foto adalah 2MB.', 'error');
                      setAvatarState({ kind: 'file', file, preview: URL.createObjectURL(file) });
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Agent Avatar</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">This is your public identity. Upload a professional logo or portrait. JPG or PNG under 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium transition-all"
                      value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email" disabled
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                      value={serverProfile?.email || ""}
                      title="Email tidak dapat diubah"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. 08123456789"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium transition-all"
                      value={formData.phone} onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Operational Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your office or main operational address"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium transition-all"
                      value={formData.address} onChange={(e) => setFormData(p => ({...p, address: e.target.value}))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-red-700">Account Security</h2>
              
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-8 flex gap-3 text-amber-800">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">Changing your password will instantly log you out of all active sessions to secure your account. You will need to log back in immediately.</p>
              </div>

              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword.old ? "text" : "password"} placeholder="Verify current security key"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 bg-gray-50 focus:bg-white font-medium"
                      value={securityData.oldPassword} onChange={(e) => setSecurityData(p => ({...p, oldPassword: e.target.value}))}
                    />
                    <button type="button" onClick={() => setShowPassword(p => ({...p, old: !p.old}))} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                      {showPassword.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"} placeholder="At least 8 characters"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 bg-gray-50 focus:bg-white font-medium"
                      value={securityData.newPassword} onChange={(e) => setSecurityData(p => ({...p, newPassword: e.target.value}))}
                    />
                    <button type="button" onClick={() => setShowPassword(p => ({...p, new: !p.new}))} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                      {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"} placeholder="Type it exactly as above"
                      className={`w-full px-4 py-3.5 rounded-xl border focus:ring-2 focus:ring-red-500 bg-gray-50 focus:bg-white font-medium ${securityData.newPassword && securityData.confirmPassword && securityData.newPassword !== securityData.confirmPassword ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-200'}`}
                      value={securityData.confirmPassword} onChange={(e) => setSecurityData(p => ({...p, confirmPassword: e.target.value}))}
                    />
                     <button type="button" onClick={() => setShowPassword(p => ({...p, confirm: !p.confirm}))} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                      {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUSINESS INFO */}
          {activeTab === 'business' && (
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-blue-700 flex justify-between">
                <span>Business & Payout Data</span>
                {serverBiz?.status === 'VERIFIED' && (
                  <span className="flex items-center text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Check className="w-4 h-4 mr-1" /> Verified Partner
                  </span>
                )}
              </h2>

              {!serverBiz ? (
                <div className="text-center py-12">
                   <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   <h3 className="font-bold text-gray-600">No Business Payload</h3>
                   <p className="text-sm text-gray-400">Please complete the Account Verification process first.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {serverReq && (
                    <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl">
                      <h4 className="font-bold text-blue-900 flex items-center mb-2">
                         <Clock className="w-5 h-5 mr-2" /> Pending Bank Change Request
                      </h4>
                      <p className="text-sm text-blue-800 mb-3">You have requested to change your payout bank on {new Date(serverReq.created_at).toLocaleDateString()}. Trivgoo Admin is reviewing this request.</p>
                      <div className="bg-white/60 p-3 rounded-lg border border-blue-100 text-sm font-medium text-blue-900 grid grid-cols-2 gap-2">
                        <span className="opacity-70 text-xs">New Bank:</span> <span>{serverReq.bank_name}</span>
                        <span className="opacity-70 text-xs">New Account:</span> <span>{serverReq.bank_account_number}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Corporate Entity</h3>
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Company / Team Name</p>
                        <p className="font-bold text-gray-900">{serverBiz.company_name || serverProfile?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Agent Type</p>
                        <p className="font-bold text-gray-900">{serverBiz.agent_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tax ID (NPWP)</p>
                        <p className="font-bold font-mono text-gray-600">{serverBiz.tax_id}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Payout Account</h3>
                       <button onClick={promptBankChange} disabled={!!serverReq} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50 disabled:no-underline">
                         Request Change
                       </button>
                    </div>
                    <div className="bg-blue-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-lg border border-blue-800">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Building2 className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-blue-200 text-sm mb-1 font-medium">Bank / Payment Channel</p>
                        <p className="text-xl font-bold mb-6 tracking-wide">{serverBiz.bank_name}</p>
                        
                        <p className="text-blue-200 text-sm mb-1 font-medium">Account Number</p>
                        <p className="text-3xl font-mono tracking-widest mb-6 drop-shadow-md">{serverBiz.bank_account_number}</p>
                        
                        <p className="text-blue-200 text-sm mb-1 font-medium">Account Holder</p>
                        <p className="text-lg font-bold uppercase tracking-wider">{serverBiz.bank_account_holder}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
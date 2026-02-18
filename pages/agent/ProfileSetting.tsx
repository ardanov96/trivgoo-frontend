import {
  ArrowLeft,
  Camera,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

import { useAuth } from "../../AuthContext";
// import { userService } from "../../services/userService";
import { mediaService } from "../../services/mediaService";
import { userService } from "@/services/userService";

const ProfileSetting: React.FC = () => {
  const navigate = useNavigate();
  
  // SOLUSI ERROR 1: Destructure sesuai apa yang ada di AuthContextValue. 
  // Jika refreshUser memang tidak ada, hapus dari destructuring.
  const auth = useAuth();
  const user = auth.user;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // SOLUSI ERROR 2: Gunakan Type Casting (user as any) jika avatar_url belum ada di Interface AuthUser
  const [avatarState, setAvatarState] = useState<{
    kind: "url" | "file";
    preview: string;
    file?: File;
  }>({
    kind: "url",
    preview: (user as any)?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarState.kind === "file") URL.revokeObjectURL(avatarState.preview);
    
    setAvatarState({
      kind: "file",
      file,
      preview: URL.createObjectURL(file),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New password and confirmation do not match.',
        confirmButtonColor: '#0f172a',
      });
    }

    const confirmResult = await Swal.fire({
      title: 'Update Profile?',
      text: "Are you sure you want to save these changes?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      confirmButtonText: 'Yes, Update it!',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-2.5',
        cancelButton: 'rounded-xl px-6 py-2.5'
      }
    });

    if (!confirmResult.isConfirmed) return;

    setIsSubmitting(true);
    Swal.fire({
      title: 'Updating Profile...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: 'rounded-3xl' }
    });

    try {
      let finalAvatarUrl = (user as any)?.avatar_url;

      if (avatarState.kind === "file" && avatarState.file) {
        finalAvatarUrl = await mediaService.uploadOne(avatarState.file, "avatars");
      }

      // 2. Kirim Payload ke API
      
      const payload = {
        name: formData.name,
        avatar_url: finalAvatarUrl,
        ...(formData.newPassword && { 
           current_password: formData.currentPassword,
           new_password: formData.newPassword 
        })
      };
      
      await userService.updateProfile(payload);


      await Swal.fire({
        title: 'Success!',
        text: 'Profile updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-3xl' }
      });
      
      // Jika refreshUser ada di auth tetapi error typing, panggil dengan (auth as any).refreshUser()
      if ((auth as any).refreshUser) {
        (auth as any).refreshUser();
      }

    } catch (error: any) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update profile.',
        icon: 'error',
        confirmButtonColor: '#0f172a',
        customClass: { popup: 'rounded-3xl' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center mb-8 sticky top-0 bg-gray-50 z-20 py-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-500">Manage your account information and security.</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all disabled:opacity-70 flex items-center"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </span>
            ) : (
              <>
                Save Changes <Check className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Account Information Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm">
                1
              </span>
              Account Information
            </h3>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-gray-50">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                    <img 
                      src={avatarState.preview} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-transform active:scale-90"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Profile Photo</h4>
                  <p className="text-sm text-gray-500">Upload a professional photo. JPG or PNG, max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                      value={formData.email}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3 text-sm">
                2
              </span>
              Security & Password
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Enter current password to verify"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white"
                    onChange={handleChange}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
              Agent Status
            </h4>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Specialization</p>
                <p className="font-bold text-primary-700">{user?.specialization || "General Agent"}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Verification</p>
                <div className="flex items-center text-green-600 font-bold">
                  <Check className="w-4 h-4 mr-1" /> Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;
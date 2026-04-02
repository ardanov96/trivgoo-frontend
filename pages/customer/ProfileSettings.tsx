import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../../src/hooks/useLangNavigate';
import { Camera, ChevronRight, Check, ChevronDown, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../AuthContext';
import { authService } from '../../services/authService';
import UserAvatar from '../../components/UserAvatar';
import { ReferralStats } from '../../types';

const ProfileSettings: React.FC = () => {
  const { user, updateUser, refreshMe, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { langNavigate } = useLangNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  useEffect(() => {
    if (user?.referral_code) {
      authService.getReferralStats().then(setReferralStats).catch(() => {});
    }
  }, [user?.referral_code]);

  // Date parsing
  let defaultY = '', defaultM = '', defaultD = '';
  if (user?.tanggal_lahir) {
    const d = new Date(user.tanggal_lahir);
    if (!isNaN(d.getTime())) {
      defaultY = d.getFullYear().toString();
      defaultM = (d.getMonth() + 1).toString();
      defaultD = d.getDate().toString();
    }
  }

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState(user?.jenis_kelamin || '');
  
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAddress, setProfileAddress] = useState(user?.tempat_tinggal || '');
  
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(defaultD);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(defaultM);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(defaultY);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setSelectedGender(user.jenis_kelamin || '');
      setProfileAddress(user.tempat_tinggal || '');
      if (user.tanggal_lahir) {
        const d = new Date(user.tanggal_lahir);
        if (!isNaN(d.getTime())) {
          setSelectedYear(d.getFullYear().toString());
          setSelectedMonth((d.getMonth() + 1).toString());
          setSelectedDay(d.getDate().toString());
        }
      }
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const handlePhotoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setSelectedPhotoFile(file);
    setPhotoPreviewUrl(previewUrl);
  };

  const handleUploadConfirm = async () => {
    if (!selectedPhotoFile) return;
    setIsUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('profile_photo', selectedPhotoFile);
      await authService.updateProfile(fd);
      await refreshMe();
      Swal.fire({ icon: 'success', title: 'Foto Terunggah', text: 'Foto profil Anda berhasil diperbarui.', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      setSelectedPhotoFile(null);
      setPhotoPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Upload Gagal', text: err?.response?.data?.message || 'Gagal mengunggah foto profil' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUploadCancel = () => {
    setSelectedPhotoFile(null);
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveEmail = async () => {
    if (!emailInput || emailInput === user?.email) return;
    setIsSavingEmail(true);
    try {
      const fd = new FormData();
      fd.append('email', emailInput);
      const updatedUser = await authService.updateProfile(fd);
      updateUser(updatedUser);
      setIsEmailModalOpen(false);
      setEmailInput('');
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Silakan cek email baru Anda untuk instruksi verifikasi.', confirmButtonColor: '#006CE4' });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: err?.response?.data?.message || 'Gagal mengubah email', confirmButtonColor: '#006CE4' });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSavePhone = async () => {
    setIsSavingPhone(true);
    try {
      const fd = new FormData();
      fd.append('phone_number', phoneInput);
      const updatedUser = await authService.updateProfile(fd);
      updateUser(updatedUser);
      setIsPhoneModalOpen(false);
      Swal.fire({ icon: 'success', title: 'Tersimpan', text: 'Nomor handphone berhasil disimpan!', confirmButtonColor: '#006CE4' });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: err?.response?.data?.message || 'Gagal menyimpan nomor handphone', confirmButtonColor: '#006CE4' });
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await authService.resendVerification();
      Swal.fire({ icon: 'success', title: 'Terkirim', text: 'Email verifikasi ulang telah dikirim!', confirmButtonColor: '#006CE4' });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err?.response?.data?.message || 'Gagal mengirim ulang email', confirmButtonColor: '#006CE4' });
    } finally {
      setIsResending(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      if (profileName) fd.append('name', profileName);
      if (selectedGender) fd.append('jenis_kelamin', selectedGender);
      if (profileAddress) fd.append('tempat_tinggal', profileAddress);
      if (selectedYear && selectedMonth && selectedDay) {
        let numericMonth = typeof selectedMonth === 'string' && isNaN(Number(selectedMonth))
          ? (['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'].indexOf(selectedMonth) + 1).toString()
          : selectedMonth;
        fd.append('tanggal_lahir', `${selectedYear}-${numericMonth.toString().padStart(2,'0')}-${selectedDay.toString().padStart(2,'0')}`);
      }
      const updatedUser = await authService.updateProfile(fd);
      updateUser(updatedUser);
      Swal.fire({ icon: 'success', title: 'Profil Tersimpan', text: 'Perubahan pada profil Anda telah berhasil disimpan.', timer: 3000, showConfirmButton: false, toast: true, position: 'top-end' });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal Tersimpan', text: err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil Anda.', confirmButtonColor: '#006CE4' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    langNavigate('/');
  };

  // ── Nav Items ─────────────────────────────────────────────────────────────
  // to: string  → render sebagai <Link>
  // to: null    → render sebagai <button> (logout)
  // active: true → highlighted sebagai halaman aktif
  const navItems: { id: string; label: string; to: string | null; active?: boolean }[] = [
    { id: 'kartu',            label: 'Kartu Saya',                   to: '/my-cards' },
    { id: 'pesanan',          label: 'Pesanan Saya',                 to: '/my-bookings' },
    { id: 'pembelian',        label: 'Daftar Pembelian',             to: '/my-bookings' },   // sama dengan Pesanan Saya
    { id: 'refunds',          label: 'Refunds',                      to: '/my-refunds' },
    { id: 'notif-harga',      label: 'Notifikasi Harga Penerbangan', to: '/my-price-alerts' },
    { id: 'penumpang',        label: 'Detail Penumpang Tersimpan',   to: '/my-passengers' },
    { id: 'notif-pengaturan', label: 'Pengaturan Notifikasi',        to: '/my-notifications' },
    { id: 'akun',             label: 'Akun Saya',                    to: '/my-account', active: true },
    { id: 'logout',           label: 'Log Out',                      to: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar Kiri ── */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4">
              <div className="flex flex-col mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 relative flex-shrink-0 flex items-center justify-center group">
                    <UserAvatar user={user} previewUrl={photoPreviewUrl} className="w-16 h-16 shadow-inner" />
                    {!photoPreviewUrl && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer transition-opacity ${isUploadingPhoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        {isUploadingPhoto
                          ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <Camera className="text-white w-5 h-5" />
                        }
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handlePhotoSelection} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate">{user?.name || 'Customer Name'}</h2>
                    <p className="text-sm text-gray-500 truncate">Google</p>
                  </div>
                </div>

                {photoPreviewUrl && (
                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={handleUploadCancel} disabled={isUploadingPhoto} className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      Batal
                    </button>
                    <button onClick={handleUploadConfirm} disabled={isUploadingPhoto} className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2">
                      {isUploadingPhoto && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      Simpan Foto
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 mb-6 w-fit">
                Bronze Priority
              </div>

              {/* Nav Items */}
              <div className="flex flex-col gap-0.5 -mx-2">
                {navItems.map((item) => {
                  // Logout — special red button
                  if (item.to === null) {
                    return (
                      <button
                        key={item.id}
                        onClick={handleLogout}
                        className="flex justify-between items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left text-red-500 hover:bg-red-50"
                      >
                        {item.label}
                      </button>
                    );
                  }

                  // Active page — non-clickable highlight
                  if (item.active) {
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center w-full px-4 py-3 rounded-xl text-sm font-bold bg-primary-50 text-primary-700"
                      >
                        {item.label}
                      </div>
                    );
                  }

                  // Regular nav link
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      className="flex justify-between items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {item.label}
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Konten Utama Kanan ── */}
          <div className="w-full lg:w-3/4 min-w-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h1>

              <div className="flex border-b border-gray-100 gap-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'info' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Informasi Akun
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'security' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Password & Keamanan
                </button>
              </div>

              {activeTab === 'info' && (
                <div className="mt-8 space-y-8">

                  {/* Data Pribadi */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Data Pribadi</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Lengkap</label>
                        <input
                          type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Jenis Kelamin */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">Jenis Kelamin</label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => { setIsGenderOpen(!isGenderOpen); setIsDayOpen(false); setIsMonthOpen(false); setIsYearOpen(false); }}
                              className={`w-full flex justify-between items-center pl-4 pr-10 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition-all ${isGenderOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                              <span className={selectedGender ? "text-gray-900" : "text-gray-500"}>{selectedGender || 'Pilih jenis kelamin'}</span>
                              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isGenderOpen ? 'rotate-180 text-primary-500' : ''}`} />
                            </button>
                            {isGenderOpen && (
                              <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg py-1 animate-in fade-in slide-in-from-top-2">
                                {['Laki-laki', 'Perempuan'].map((g) => (
                                  <button key={g} type="button" onClick={() => { setSelectedGender(g); setIsGenderOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedGender === g ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                  >{g}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tanggal Lahir */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Lahir</label>
                          <div className="grid grid-cols-3 gap-2">
                            {/* Hari */}
                            <div className="relative">
                              <button type="button" onClick={() => { setIsDayOpen(!isDayOpen); setIsMonthOpen(false); setIsYearOpen(false); setIsGenderOpen(false); }}
                                className={`w-full flex justify-between items-center pl-3 pr-8 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition-all ${isDayOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                                <span className={selectedDay ? "text-gray-900 truncate" : "text-gray-500 truncate"}>{selectedDay || 'Hari'}</span>
                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isDayOpen ? 'rotate-180 text-primary-500' : ''}`} />
                              </button>
                              {isDayOpen && (
                                <div className="absolute z-20 w-min min-w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 scrollbar-thin scrollbar-thumb-gray-200">
                                  {Array.from({length: 31}, (_, i) => String(i + 1)).map((d) => (
                                    <button key={d} type="button" onClick={() => { setSelectedDay(d); setIsDayOpen(false); }}
                                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedDay === d ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>{d}</button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Bulan */}
                            <div className="relative">
                              <button type="button" onClick={() => { setIsMonthOpen(!isMonthOpen); setIsDayOpen(false); setIsYearOpen(false); setIsGenderOpen(false); }}
                                className={`w-full flex justify-between items-center pl-3 pr-8 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition-all ${isMonthOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                                <span className={selectedMonth ? "text-gray-900 truncate" : "text-gray-500 truncate"}>{selectedMonth || 'Bulan'}</span>
                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isMonthOpen ? 'rotate-180 text-primary-500' : ''}`} />
                              </button>
                              {isMonthOpen && (
                                <div className="absolute z-20 w-min min-w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 scrollbar-thin scrollbar-thumb-gray-200">
                                  {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'].map((m) => (
                                    <button key={m} type="button" onClick={() => { setSelectedMonth(m); setIsMonthOpen(false); }}
                                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedMonth === m ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>{m}</button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Tahun */}
                            <div className="relative">
                              <button type="button" onClick={() => { setIsYearOpen(!isYearOpen); setIsDayOpen(false); setIsMonthOpen(false); setIsGenderOpen(false); }}
                                className={`w-full flex justify-between items-center pl-3 pr-8 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition-all ${isYearOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                                <span className={selectedYear ? "text-gray-900 truncate" : "text-gray-500 truncate"}>{selectedYear || 'Tahun'}</span>
                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isYearOpen ? 'rotate-180 text-primary-500' : ''}`} />
                              </button>
                              {isYearOpen && (
                                <div className="absolute z-20 w-min min-w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 scrollbar-thin scrollbar-thumb-gray-200">
                                  {Array.from({length: 80}, (_, i) => String(new Date().getFullYear() - 10 - i)).map((y) => (
                                    <button key={y} type="button" onClick={() => { setSelectedYear(y); setIsYearOpen(false); }}
                                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedYear === y ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>{y}</button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Kota Tempat Tinggal</label>
                        <input
                          type="text" value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          placeholder="Masukkan kota tempat tinggal"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-colors">Nanti saja</button>
                        <button
                          onClick={handleSaveProfile} disabled={isSaving}
                          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          Simpan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Email</h3>
                        <p className="text-sm text-gray-500">Amankan akun dengan verifikasi email.</p>
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-900">
                          <span>{user?.email || 'email@example.com'}</span>
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                            <Check className="w-3 h-3" /> Terverifikasi
                          </span>
                        </div>
                      </div>
                      <button onClick={() => { setEmailInput(''); setIsEmailModalOpen(true); }}
                        className="px-5 py-2 border border-primary-200 text-primary-600 hover:bg-primary-50 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                        {user?.email ? 'Ubah Email' : '+ Tambah Email'}
                      </button>
                    </div>
                    {user?.pending_email && (
                      <div className="w-full mt-2 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <span>{user.pending_email}</span>
                          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">Belum Verifikasi</span>
                        </div>
                        <button onClick={handleResendEmail} disabled={isResending} className="px-4 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                          {isResending ? 'Mengirim...' : 'Kirim Ulang Email'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* No. Handphone */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">No. Handphone</h3>
                      <p className="text-sm text-gray-500">Gunakan nomor handphone untuk kemudahan login.</p>
                      {user?.phone_number && <div className="mt-3 text-sm font-medium text-gray-900">{user.phone_number}</div>}
                    </div>
                    <button onClick={() => { setPhoneInput(user?.phone_number || ''); setIsPhoneModalOpen(true); }}
                      className="px-5 py-2 border border-primary-200 text-primary-600 hover:bg-primary-50 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                      {user?.phone_number ? 'Ubah Nomor' : '+ Tambah No. Handphone'}
                    </button>
                  </div>

                  {/* Referral Code */}
                  {user?.referral_code && (
                    <div className="bg-gradient-to-r from-primary-50 to-white rounded-2xl border border-primary-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-primary-900 mb-1">Ajak Teman</h3>
                        <p className="text-sm text-gray-500">Bagikan link ini dan nikmati keuntungan bersama.</p>
                        <div className="mt-3 text-sm font-bold tracking-widest text-primary-700 bg-white px-4 py-2 rounded-lg border border-primary-200 inline-block shadow-sm">
                          {user.referral_code}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const url = `${window.location.origin}/register?ref=${user.referral_code}`;
                          navigator.clipboard.writeText(url);
                          Swal.fire({ icon: 'success', title: 'Tersalin!', text: 'Link referral berhasil disalin ke clipboard.', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                        }}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm transition-colors hover:bg-primary-700 whitespace-nowrap shadow-md shadow-primary-500/20">
                        Salin Tautan
                      </button>
                    </div>
                  )}

                  {/* Referral Statistics & Travel Coins */}
                  {referralStats && (
                    <div className="space-y-6 mt-6">

                      {/* Travel Coins Card */}
                      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-amber-900 mb-1">💰 Travel Coins Saya</h3>
                            <p className="text-3xl font-black text-amber-800 tracking-tight">
                              {(referralStats.point_balance?.balance || 0).toLocaleString('id-ID')} <span className="text-base font-bold text-amber-600">Coins</span>
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              ≈ Rp{((referralStats.point_balance?.balance || 0) * 10).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="text-right text-xs text-amber-700 space-y-1">
                            <p>Total Didapat: <span className="font-bold">{(referralStats.point_balance?.lifetime_earned || 0).toLocaleString('id-ID')}</span></p>
                            <p>Total Dipakai: <span className="font-bold">{(referralStats.point_balance?.lifetime_spent || 0).toLocaleString('id-ID')}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                          <p className="text-sm font-bold text-gray-500 mb-1">Total Dilihat (Klik)</p>
                          <p className="text-2xl font-black text-gray-900">{referralStats.total_clicks}</p>
                        </div>
                        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-center">
                          <p className="text-sm font-bold text-primary-700 mb-1">Total Bergabung</p>
                          <p className="text-2xl font-black text-primary-900">{referralStats.total_registered}</p>
                        </div>
                      </div>

                      {/* Friends Table with Reward Status */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Riwayat Referral</h3>

                        {referralStats.friends && referralStats.friends.length > 0 ? (
                          <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                                <tr>
                                  <th className="px-4 py-3">Nama Teman</th>
                                  <th className="px-4 py-3">Verifikasi</th>
                                  <th className="px-4 py-3">Booking</th>
                                  <th className="px-4 py-3 text-right">Bergabung</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {referralStats.friends.map((friend, idx) => {
                                  const dateJoined = new Date(friend.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                  });
                                  const isVerified = friend.verification_status === 'VERIFIED' || friend.verification_status === 'WAITING_DOCUMENT';
                                  return (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{friend.name}</p>
                                        <p className="text-xs text-gray-400">
                                          {friend.email.replace(/(.{2})(.*)(?=@)/, (_m: string, p1: string, p2: string) => p1 + p2.replace(/./g, '*'))}
                                        </p>
                                      </td>
                                      <td className="px-4 py-3">
                                        {isVerified ? (
                                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                                            <Check className="w-3 h-3" /> +500
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                                            ⏳ Menunggu
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        {friend.booking_rewarded ? (
                                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                                            <Check className="w-3 h-3" /> +1.500
                                          </span>
                                        ) : friend.has_booking ? (
                                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                                            ✓ Sudah Booking
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                            ⏳ Belum
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-right text-gray-500 text-xs">{dateJoined}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                            <p className="text-sm text-gray-500 font-medium">Belum ada teman yang bergabung menggunakan link Anda.</p>
                          </div>
                        )}

                        {/* Gamification Microcopy */}
                        {referralStats.friends && referralStats.friends.some(f => !f.booking_rewarded && (f.verification_status === 'VERIFIED' || f.verification_status === 'WAITING_DOCUMENT')) && (
                          <div className="mt-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100 p-4 text-center">
                            <p className="text-sm font-bold text-primary-800">
                              🔥 Ajak temanmu untuk booking pertama dan dapatkan <span className="text-primary-600">+1.500 poin</span> lagi!
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              )}

              {activeTab === 'security' && (
                <div className="mt-8">
                  <p className="text-gray-500 text-sm">Pengaturan password dan keamanan akun.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal Email */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95">
            <button onClick={() => setIsEmailModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ubah Email</h3>
            <p className="text-sm text-gray-500 mb-6">Masukkan alamat email baru Anda. Kami akan mengirimkan pesan verifikasi ke email ini.</p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Baru</label>
              <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="emailbaru@example.com" />
            </div>
            <div className="flex gap-3 justify-end">
              <button disabled={isSavingEmail} onClick={() => setIsEmailModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
              <button onClick={handleSaveEmail} disabled={isSavingEmail || !emailInput} className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50">
                {isSavingEmail ? 'Menyimpan...' : 'Simpan Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Phone */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95">
            <button onClick={() => setIsPhoneModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nomor Handphone</h3>
            <p className="text-sm text-gray-500 mb-6">Masukkan nomor handphone aktif Anda untuk mempermudah pemesanan dan verifikasi keamanan.</p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Nomor Handphone</label>
              <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Contoh: 08123456789" />
            </div>
            <div className="flex gap-3 justify-end">
              <button disabled={isSavingPhone} onClick={() => setIsPhoneModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
              <button onClick={handleSavePhone} disabled={isSavingPhone || !phoneInput} className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50">
                {isSavingPhone ? 'Menyimpan...' : 'Simpan Nomor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;

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
  const { langNavigate, langPath } = useLangNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  useEffect(() => {
    if (user?.referral_code) {
      authService.getReferralStats().then(setReferralStats).catch(() => {});
    }
  }, [user?.referral_code]);

  function parseTanggalLahir(dateStr: string | undefined): { y: string, m: string, d: string } {
    if (!dateStr) return { y: '', m: '', d: '' };
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return {
        y: d.getFullYear().toString(),
        m: (d.getMonth() + 1).toString(),
        d: d.getDate().toString(),
      };
    }
    const match = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(dateStr);
    if (match) return { y: match[3], m: match[2], d: match[1] };
    const match2 = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.exec(dateStr);
    if (match2) return { y: match2[1], m: match2[2], d: match2[3] };
    return { y: '', m: '', d: '' };
  }

  const { y: defaultY, m: defaultM, d: defaultD } = parseTanggalLahir(user?.tanggal_lahir);

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
        const { y, m, d } = parseTanggalLahir(user.tanggal_lahir);
        setSelectedYear(y);
        setSelectedMonth(m);
        setSelectedDay(d);
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

  // Month labels — keyed so translation works
  const MONTHS = [
    t('profile.month_jan', 'Jan'), t('profile.month_feb', 'Feb'), t('profile.month_mar', 'Mar'),
    t('profile.month_apr', 'Apr'), t('profile.month_may', 'Mei'), t('profile.month_jun', 'Jun'),
    t('profile.month_jul', 'Jul'), t('profile.month_aug', 'Agt'), t('profile.month_sep', 'Sep'),
    t('profile.month_oct', 'Okt'), t('profile.month_nov', 'Nov'), t('profile.month_dec', 'Des'),
  ];

  const GENDERS = [t('profile.male', 'Male'), t('profile.female', 'Female')];

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
      Swal.fire({ icon: 'success', title: t('profile.photo_uploaded_title', 'Photo Uploaded'), text: t('profile.photo_uploaded_text', 'Your profile photo has been updated.'), toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      setSelectedPhotoFile(null);
      setPhotoPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: t('profile.photo_upload_failed', 'Upload Failed'), text: err?.response?.data?.message || t('profile.photo_upload_error', 'Failed to upload profile photo') });
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
      Swal.fire({ icon: 'success', title: t('common.success', 'Success!'), text: t('profile.email_verify_sent', 'Please check your new email for verification instructions.'), confirmButtonColor: '#006CE4' });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: err?.response?.data?.message || t('profile.email_change_failed', 'Failed to change email'), confirmButtonColor: '#006CE4' });
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
      Swal.fire({ icon: 'success', title: t('common.saved', 'Saved'), text: t('profile.phone_saved', 'Phone number saved successfully!'), confirmButtonColor: '#006CE4' });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: err?.response?.data?.message || t('profile.phone_save_failed', 'Failed to save phone number'), confirmButtonColor: '#006CE4' });
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await authService.resendVerification();
      Swal.fire({ icon: 'success', title: t('profile.resend_sent', 'Sent'), text: t('profile.resend_sent_text', 'Verification email has been resent!'), confirmButtonColor: '#006CE4' });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: t('profile.resend_failed', 'Failed'), text: err?.response?.data?.message || t('profile.resend_error', 'Failed to resend email'), confirmButtonColor: '#006CE4' });
    } finally {
      setIsResending(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      if (profileName) fd.append('name', profileName);
      if (selectedGender) {
        // Convert displayed label back to internal value
        const genderIndex = GENDERS.indexOf(selectedGender);
        const genderValue = genderIndex === 0 ? 'Laki-laki' : genderIndex === 1 ? 'Perempuan' : selectedGender;
        fd.append('jenis_kelamin', genderValue);
      }
      if (profileAddress) fd.append('tempat_tinggal', profileAddress);
      if (selectedYear && selectedMonth && selectedDay) {
        const monthIndex = MONTHS.indexOf(selectedMonth);
        const numericMonth = monthIndex >= 0 ? (monthIndex + 1).toString() : (isNaN(Number(selectedMonth)) ? selectedMonth : selectedMonth);
        fd.append('tanggal_lahir', `${selectedYear}-${numericMonth.toString().padStart(2,'0')}-${selectedDay.toString().padStart(2,'0')}`);
      }
      const updatedUser = await authService.updateProfile(fd);
      updateUser(updatedUser);
      Swal.fire({ icon: 'success', title: t('profile.saved_title', 'Profile Saved'), text: t('profile.saved_text', 'Your profile changes have been saved.'), timer: 3000, showConfirmButton: false, toast: true, position: 'top-end' });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: t('profile.save_failed_title', 'Save Failed'), text: err?.response?.data?.message || t('profile.save_failed_text', 'An error occurred while saving your profile.'), confirmButtonColor: '#006CE4' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    langNavigate('/');
  };

  const navItems: { id: string; label: string; to: string | null; active?: boolean }[] = [
    { id: 'kartu',            label: t('profile.my_cards', 'My Cards'),                        to: '/my-cards' },
    { id: 'pesanan',          label: t('nav.my_bookings', 'My Bookings'),                      to: '/my-bookings' },
    { id: 'pembelian',        label: t('profile.purchase_list', 'Purchase List'),              to: '/my-bookings' },
    { id: 'refunds',          label: t('profile.my_refunds', 'Refunds'),                       to: '/my-refunds' },
    { id: 'notif-harga',      label: t('profile.price_alerts', 'Flight Price Alerts'),         to: '/my-price-alerts' },
    { id: 'penumpang',        label: t('profile.passengers', 'Saved Passenger Details'),       to: '/my-passengers' },
    { id: 'notif-pengaturan', label: t('profile.notifications', 'Notification Settings'),      to: '/my-notifications' },
    { id: 'akun',             label: t('profile.my_account', 'My Account'),                    to: '/my-account', active: true },
    { id: 'logout',           label: t('profile.logout', 'Log Out'),                           to: null },
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
                    <h2 className="text-lg font-bold text-gray-900 truncate">{user?.name || t('profile.customer_name', 'Customer Name')}</h2>
                    <p className="text-sm text-gray-500 truncate">Google</p>
                  </div>
                </div>

                {photoPreviewUrl && (
                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={handleUploadCancel} disabled={isUploadingPhoto} className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button onClick={handleUploadConfirm} disabled={isUploadingPhoto} className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2">
                      {isUploadingPhoto && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {t('profile.save_photo', 'Save Photo')}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 mb-6 w-fit">
                {t('profile.bronze_priority', 'Bronze Priority')}
              </div>

              {/* Nav Items */}
              <div className="flex flex-col gap-0.5 -mx-2">
                {navItems.map((item) => {
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
                  return (
                    <Link
                      key={item.id}
                      to={langPath(item.to)}
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
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.settings_title', 'Settings')}</h1>

              <div className="flex border-b border-gray-100 gap-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'info' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t('profile.account_info', 'Account Information')}
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'security' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t('profile.security', 'Password & Security')}
                </button>
              </div>

              {activeTab === 'info' && (
                <div className="mt-8 space-y-8">

                  {/* Data Pribadi */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">{t('profile.personal_data', 'Personal Data')}</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('profile.full_name', 'Full Name')}</label>
                        <input
                          type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          placeholder={t('profile.full_name_placeholder', 'Enter your full name')}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Jenis Kelamin */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('profile.gender', 'Gender')}</label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => { setIsGenderOpen(!isGenderOpen); setIsDayOpen(false); setIsMonthOpen(false); setIsYearOpen(false); }}
                              className={`w-full flex justify-between items-center pl-4 pr-10 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition-all ${isGenderOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                              <span className={selectedGender ? "text-gray-900" : "text-gray-500"}>{selectedGender || t('profile.select_gender', 'Select gender')}</span>
                              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isGenderOpen ? 'rotate-180 text-primary-500' : ''}`} />
                            </button>
                            {isGenderOpen && (
                              <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg py-1 animate-in fade-in slide-in-from-top-2">
                                {GENDERS.map((g) => (
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
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('profile.birthdate', 'Date of Birth')}</label>
                          <div className="grid grid-cols-3 gap-2">
                            {/* Hari */}
                            <div className="relative">
                              <button type="button" onClick={() => { setIsDayOpen(!isDayOpen); setIsMonthOpen(false); setIsYearOpen(false); setIsGenderOpen(false); }}
                                className={`w-full flex justify-between items-center pl-3 pr-8 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition-all ${isDayOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                                <span className={selectedDay ? "text-gray-900 truncate" : "text-gray-500 truncate"}>{selectedDay || t('profile.day', 'Day')}</span>
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
                                <span className={selectedMonth ? "text-gray-900 truncate" : "text-gray-500 truncate"}>{selectedMonth || t('profile.month', 'Month')}</span>
                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isMonthOpen ? 'rotate-180 text-primary-500' : ''}`} />
                              </button>
                              {isMonthOpen && (
                                <div className="absolute z-20 w-min min-w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 scrollbar-thin scrollbar-thumb-gray-200">
                                  {MONTHS.map((m) => (
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
                                <span className={selectedYear ? "text-gray-900 truncate" : "text-gray-500 truncate"}>{selectedYear || t('profile.year', 'Year')}</span>
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
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('profile.city', 'City of Residence')}</label>
                        <input
                          type="text" value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          placeholder={t('profile.city_placeholder', 'Enter your city')}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-colors">{t('profile.later', 'Maybe Later')}</button>
                        <button
                          onClick={handleSaveProfile} disabled={isSaving}
                          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {t('common.save', 'Save')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{t('profile.email', 'Email')}</h3>
                        <p className="text-sm text-gray-500">{t('profile.email_desc', 'Secure your account with email verification.')}</p>
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-900">
                          <span>{user?.email || 'email@example.com'}</span>
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                            <Check className="w-3 h-3" /> {t('profile.verified', 'Verified')}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => { setEmailInput(''); setIsEmailModalOpen(true); }}
                        className="px-5 py-2 border border-primary-200 text-primary-600 hover:bg-primary-50 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                        {user?.email ? t('profile.change_email', 'Change Email') : t('profile.add_email', '+ Add Email')}
                      </button>
                    </div>
                    {user?.pending_email && (
                      <div className="w-full mt-2 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <span>{user.pending_email}</span>
                          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">{t('profile.unverified', 'Unverified')}</span>
                        </div>
                        <button onClick={handleResendEmail} disabled={isResending} className="px-4 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                          {isResending ? t('profile.resending', 'Sending...') : t('profile.resend_email', 'Resend Email')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* No. Handphone */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{t('profile.phone', 'Phone Number')}</h3>
                      <p className="text-sm text-gray-500">{t('profile.phone_desc', 'Use your phone number for easier login.')}</p>
                      {user?.phone_number && <div className="mt-3 text-sm font-medium text-gray-900">{user.phone_number}</div>}
                    </div>
                    <button onClick={() => { setPhoneInput(user?.phone_number || ''); setIsPhoneModalOpen(true); }}
                      className="px-5 py-2 border border-primary-200 text-primary-600 hover:bg-primary-50 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                      {user?.phone_number ? t('profile.change_phone', 'Change Number') : t('profile.add_phone', '+ Add Phone Number')}
                    </button>
                  </div>

                  {/* Referral Code */}
                  {user?.referral_code && (
                    <div className="bg-gradient-to-r from-primary-50 to-white rounded-2xl border border-primary-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-primary-900 mb-1">{t('profile.invite_friends', 'Invite Friends')}</h3>
                        <p className="text-sm text-gray-500">{t('profile.invite_desc', 'Share this link and enjoy benefits together.')}</p>
                        <div className="mt-3 text-sm font-bold tracking-widest text-primary-700 bg-white px-4 py-2 rounded-lg border border-primary-200 inline-block shadow-sm">
                          {user.referral_code}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/register?ref=${user.referral_code}`;
                          navigator.clipboard.writeText(url);
                          Swal.fire({ icon: 'success', title: t('common.copied', 'Copied!'), text: t('profile.referral_copied', 'Referral link copied to clipboard.'), toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                        }}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm transition-colors hover:bg-primary-700 whitespace-nowrap shadow-md shadow-primary-500/20">
                        {t('profile.copy_link', 'Copy Link')}
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
                  <p className="text-gray-500 text-sm">{t('profile.security_desc', 'Account password and security settings.')}</p>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('profile.change_email', 'Change Email')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('profile.change_email_desc', 'Enter your new email address. We will send a verification message to this email.')}</p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('profile.new_email', 'New Email')}</label>
              <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="newemail@example.com" />
            </div>
            <div className="flex gap-3 justify-end">
              <button disabled={isSavingEmail} onClick={() => setIsEmailModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">{t('common.cancel', 'Cancel')}</button>
              <button onClick={handleSaveEmail} disabled={isSavingEmail || !emailInput} className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50">
                {isSavingEmail ? t('profile.saving', 'Saving...') : t('profile.save_email', 'Save Email')}
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('profile.phone', 'Phone Number')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('profile.phone_modal_desc', 'Enter your active phone number to speed up bookings and security verification.')}</p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('profile.phone', 'Phone Number')}</label>
              <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t('profile.phone_placeholder', 'e.g. 08123456789')} />
            </div>
            <div className="flex gap-3 justify-end">
              <button disabled={isSavingPhone} onClick={() => setIsPhoneModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">{t('common.cancel', 'Cancel')}</button>
              <button onClick={handleSavePhone} disabled={isSavingPhone || !phoneInput} className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50">
                {isSavingPhone ? t('profile.saving', 'Saving...') : t('profile.save_phone', 'Save Number')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;

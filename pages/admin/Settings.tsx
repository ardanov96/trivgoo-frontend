
import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ToastContext';
import Swal from 'sweetalert2';
import { Save, Globe, DollarSign, Shield, Bell, Lock, Power, RefreshCw, Smartphone } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  // const API_URL = "http://localhost:4000";
  const API_URL = process.env.REACT_APP_API_URL || (import.meta as any).env?.VITE_API_URL || "http://192.168.1.99:4000";
  const [activeTab, setActiveTab] = useState<'general' | 'finance' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [siteName, setSiteName] = useState('Trivgoo Travel');
  const [supportEmail, setSupportEmail] = useState('support@trivgoo.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const [commissionRate, setCommissionRate] = useState(11);
  const [currency, setCurrency] = useState('USD');
  const [payoutSchedule, setPayoutSchedule] = useState('weekly');

  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSiteName(data.site_name);
          setSupportEmail(data.support_email);
          setMaintenanceMode(data.maintenance_mode);
          setCommissionRate(data.commission_rate);
          setCurrency(data.currency);
          setPayoutSchedule(data.payout_schedule);
          setRequire2FA(data.require_2fa);
          setSessionTimeout(data.session_timeout);
        }
      });
  }, []);

  const handleClearCache = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This might log out active users or slow down the system temporarily.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827', 
      cancelButtonColor: '#ef4444', 
      confirmButtonText: 'Yes, clear it!',
      customClass: {
        popup: 'rounded-2xl', 
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl'
      }
    });

    if (result.isConfirmed) {
      // Tampilkan loading saat proses fetch berlangsung
      Swal.fire({
        title: 'Processing...',
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      try {
        const response = await fetch(`${API_URL}/api/settings/clear-cache`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          Swal.fire({
            title: 'Cleared!',
            text: 'System cache has been successfully cleared.',
            icon: 'success',
            confirmButtonColor: '#111827',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl'
            }
          });
        } else {
          throw new Error('Failed to clear');
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Could not connect to the server',
          icon: 'error',
          confirmButtonColor: '#111827',
          customClass: {
            popup: 'rounded-2xl'
          }
        });
      }
    }
  };

  const handleSave = async () => {
  setIsSaving(true);
    try {
      const payload = {
        siteName, supportEmail, maintenanceMode, 
        commissionRate, currency, payoutSchedule, 
        require2FA, sessionTimeout
      };
      
      console.log("Mengirim payload:", payload);

      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Settings updated successfully!', 'success');
      } else {
        console.error("Server Error:", result);
        showToast(`Error: ${result.message || 'Server error'}`, 'error');
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      showToast('Cannot connect to server', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
          <p className="text-gray-500 text-sm">Configure global settings for the Trivgoo platform.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all disabled:opacity-70"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-1 sticky top-28">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'general' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Globe className="w-4 h-4 mr-3" /> General
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'finance' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <DollarSign className="w-4 h-4 mr-3" /> Finance & Fees
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Shield className="w-4 h-4 mr-3" /> Security
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">General Configuration</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Platform Name</label>
                  <input 
                    type="text" 
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                  <div className="relative">
                    <Bell className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="email" 
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                      <Power className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Maintenance Mode</p>
                      <p className="text-xs text-gray-500">Disable access for all non-admin users.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* FINANCE SETTINGS */}
          {activeTab === 'finance' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Financial Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Platform Fee (%)</label>
                  <div className="relative">
                     <input 
                        type="number" 
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-bold"
                     />
                     <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Deducted from agent earnings per booking.</p>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Default Currency</label>
                   <select 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white"
                   >
                      <option value="USD">USD ($)</option>
                      <option value="IDR">IDR (Rp)</option>
                      <option value="EUR">EUR (€)</option>
                   </select>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-3">Payout Schedule</label>
                 <div className="grid grid-cols-3 gap-3">
                    {['weekly', 'bi-weekly', 'monthly'].map(opt => (
                       <div 
                          key={opt}
                          onClick={() => setPayoutSchedule(opt)}
                          className={`cursor-pointer p-3 border rounded-xl text-center capitalize text-sm font-bold transition-all ${payoutSchedule === opt ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                       >
                          {opt}
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* SECURITY SETTINGS */}
          {activeTab === 'security' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
               <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Security & Access</h3>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                           <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-gray-900">Force 2FA for Admins</p>
                           <p className="text-xs text-gray-500">Require Two-Factor Authentication.</p>
                        </div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={require2FA} onChange={(e) => setRequire2FA(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                     </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-200 text-gray-600 rounded-lg">
                           <Lock className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-gray-900">Session Timeout</p>
                           <p className="text-xs text-gray-500">Auto-logout inactive users (mins).</p>
                        </div>
                     </div>
                     <input 
                        type="number" 
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-lg border border-gray-300 text-center font-bold text-sm"
                     />
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-red-600 mb-4 uppercase tracking-wide">Danger Zone</h4>
                  <button 
                    onClick={handleClearCache}
                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">
                     Clear System Cache
                  </button>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

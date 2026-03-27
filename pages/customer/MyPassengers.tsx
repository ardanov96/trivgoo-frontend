import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../src/hooks/useLangNavigate';
import {
  ChevronRight, User, Plus, Trash2, Edit3, X,
  Baby, UserCheck, Briefcase, Shield, Calendar,
  CheckCircle2, AlertCircle,
} from 'lucide-react';

type PassengerType = 'adult' | 'child' | 'infant';

interface Passenger {
  id: string;
  name: string;
  type: PassengerType;
  idNumber: string;
  idType: 'ktp' | 'passport';
  nationality: string;
  dob: string;
  passportExpiry?: string;
  isPrimary: boolean;
  isValid: boolean;
}

const MOCK_PASSENGERS: Passenger[] = [
  { id: '1', name: 'Budi Santoso',   type: 'adult',  idType: 'passport', idNumber: 'A1234567', nationality: 'Indonesia', dob: '15 Mar 1990', passportExpiry: '20 Jan 2029', isPrimary: true,  isValid: true  },
  { id: '2', name: 'Sari Santoso',   type: 'adult',  idType: 'ktp',      idNumber: '3171234567890001', nationality: 'Indonesia', dob: '08 Jul 1993', isPrimary: false, isValid: true  },
  { id: '3', name: 'Aldi Santoso',   type: 'child',  idType: 'passport', idNumber: 'B9876543', nationality: 'Indonesia', dob: '12 Jun 2016', passportExpiry: '01 Mar 2026', isPrimary: false, isValid: false },
];

const TYPE_CONFIG: Record<PassengerType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  adult:  { label: 'Dewasa', icon: <User className="w-4 h-4" />,    color: 'text-blue-600',   bg: 'bg-blue-100' },
  child:  { label: 'Anak',   icon: <UserCheck className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-100' },
  infant: { label: 'Bayi',   icon: <Baby className="w-4 h-4" />,    color: 'text-pink-600',   bg: 'bg-pink-100' },
};

const MyPassengers: React.FC = () => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();
  const [passengers, setPassengers] = useState<Passenger[]>(MOCK_PASSENGERS);
  const [selectedId, setSelectedId] = useState<string>(MOCK_PASSENGERS[0]?.id ?? '');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selected = passengers.find(p => p.id === selectedId);

  const handleDelete = (id: string) => {
    setPassengers(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(passengers[0]?.id ?? '');
  };

  const handleSetPrimary = (id: string) =>
    setPassengers(prev => prev.map(p => ({ ...p, isPrimary: p.id === id })));

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to={langPath('/my-account')} className="hover:text-primary-600 transition-colors">Akun Saya</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">Detail Penumpang Tersimpan</span>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Penumpang Tersimpan</h1>
            <p className="text-sm text-gray-500 mt-1">Data penumpang untuk mempercepat proses booking</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary-600/20 active:scale-95">
            <Plus className="w-4 h-4" /> Tambah Penumpang
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total',  value: passengers.length,                                         color: 'text-gray-900' },
            { label: 'Valid',  value: passengers.filter(p => p.isValid).length,                  color: 'text-emerald-600' },
            { label: 'Expired', value: passengers.filter(p => !p.isValid).length,                color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Passenger list */}
          <div className="lg:col-span-2 space-y-3">
            {passengers.map(p => {
              const tc = TYPE_CONFIG[p.type];
              return (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 transition-all duration-200 hover:shadow-md ${selectedId === p.id ? 'border-primary-400 ring-2 ring-primary-100' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${tc.bg} flex items-center justify-center shrink-0`}>
                      <span className={tc.color}>{tc.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                        {p.isPrimary && <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-full">Utama</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{tc.label} · {p.idType === 'passport' ? 'Paspor' : 'KTP'}</p>
                    </div>
                    <div className="shrink-0">
                      {p.isValid
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        : <AlertCircle className="w-4 h-4 text-red-400" />
                      }
                    </div>
                  </div>
                </button>
              );
            })}

            {passengers.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <User className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Belum ada penumpang tersimpan</p>
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {!selected ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center h-full flex flex-col items-center justify-center">
                <User className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">Pilih penumpang untuk melihat detail</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${TYPE_CONFIG[selected.type].bg} flex items-center justify-center`}>
                      <span className={`${TYPE_CONFIG[selected.type].color} scale-150`}>{TYPE_CONFIG[selected.type].icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                        {selected.isPrimary && <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Utama</span>}
                      </div>
                      <p className="text-sm text-gray-500">{TYPE_CONFIG[selected.type].label} · {selected.nationality}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(selected.id)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(selected.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!selected.isValid && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700 mb-0.5">Dokumen Kedaluwarsa</p>
                      <p className="text-xs text-red-500">Masa berlaku paspor penumpang ini sudah habis. Perbarui sebelum melakukan booking.</p>
                    </div>
                  </div>
                )}

                {/* Info grid */}
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { icon: <User className="w-4 h-4" />,       label: 'Nama Lengkap',      value: selected.name },
                    { icon: <Calendar className="w-4 h-4" />,   label: 'Tanggal Lahir',     value: selected.dob },
                    { icon: <Shield className="w-4 h-4" />,     label: 'Jenis Dokumen',     value: selected.idType === 'passport' ? 'Paspor' : 'KTP' },
                    { icon: <Briefcase className="w-4 h-4" />,  label: 'Nomor Dokumen',     value: selected.idNumber },
                    { icon: <Shield className="w-4 h-4" />,     label: 'Kewarganegaraan',   value: selected.nationality },
                    ...(selected.passportExpiry ? [{ icon: <Calendar className="w-4 h-4" />, label: 'Berlaku s/d Paspor', value: selected.passportExpiry }] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {!selected.isPrimary && (
                  <button onClick={() => handleSetPrimary(selected.id)}
                    className="w-full py-3 border border-primary-200 text-primary-600 hover:bg-primary-50 rounded-xl font-bold text-sm transition-colors">
                    Jadikan Penumpang Utama
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowAdd(false)} className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Tambah Penumpang</h3>
                  <p className="text-xs text-gray-400">Data dokumen perjalanan</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipe Penumpang</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['adult', 'child', 'infant'] as PassengerType[]).map(t => (
                      <button key={t} className={`py-2.5 rounded-xl border text-xs font-bold transition-colors ${t === 'adult' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        {TYPE_CONFIG[t].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                  <input type="text" placeholder="Sesuai dokumen" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tanggal Lahir</label>
                  <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Jenis Dokumen</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: 'passport', l: 'Paspor' }, { v: 'ktp', l: 'KTP' }].map(d => (
                      <button key={d.v} className={`py-2.5 rounded-xl border text-xs font-bold transition-colors ${d.v === 'passport' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>{d.l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nomor Dokumen</label>
                  <input type="text" placeholder="Nomor paspor / KTP" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Berlaku s/d (Paspor)</label>
                  <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <button onClick={() => setShowAdd(false)} className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md">
                  Simpan Penumpang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPassengers;

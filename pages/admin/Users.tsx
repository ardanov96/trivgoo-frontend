// src/pages/admin/UsersManagement.tsx

import { CheckCircle, ShieldAlert, UserCheck, User as UserIcon, XCircle, Eye } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AgentListItem, ApiResponse, CustomerListItem, VerificationStatus } from '../../types';
import Swal from 'sweetalert2';

function unwrapArray<T>(res: unknown): T[] {
  // support kalau service return langsung array
  if (Array.isArray(res)) return res as T[];

  // support kalau service return { data: [] }
  const maybe = res as ApiResponse<T[]>;
  if (Array.isArray(maybe?.data)) return maybe.data;

  return [];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const resolveDocUrl = (url: string): string => {
  if (!url) return '';
  
  const cleanUrl = url.replace(/^\/?public\//, '/');
  
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
  
  return `${API_BASE_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
};

const UsersManagement: React.FC = () => {
  const DetailBlock = ({ label, value, isEnum = false }: { label: string, value?: any, isEnum?: boolean }) => (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-800">
        {isEnum ? (value?.replace('_', ' ') || '-') : (value || '-')}
      </p>
    </div>
  );

  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'agents' | 'customers'>('agents');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAgent, setSelectedAgent] = useState<AgentListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

const handleDownloadPdf = async (url: string) => {
  try {
    const filename = url.split('/').pop() || 'document.pdf';

    const response = await fetch(url, { credentials: 'include' }); // ✅ kirim session cookie
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    console.error('Download failed:', err);
  }
};

  // ✅ per-user loading untuk tombol approve/reject
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  // ✅ anti setState setelah unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const confirmAction = (id: number | string, action: 'approve' | 'reject') => {
  const isApprove = action === 'approve';
  
  Swal.fire({
    title: isApprove ? 'Approve Agent?' : 'Reject Agent?',
    text: `Are you sure you want to ${action} this agent?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: isApprove ? '#10B981' : '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: isApprove ? 'Yes, approve!' : 'Yes, reject!',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      handleVerify(Number(id), action); // Pastikan handleVerify juga menerima number
    }
  });
};

  const handleViewDetail = (agent: AgentListItem) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [agentRes, customerRes] = await Promise.all([
        adminService.getAllAgents(),
        adminService.getAllCustomers(),
      ]);

      const nextAgents = unwrapArray<AgentListItem>(agentRes);
      const nextCustomers = unwrapArray<CustomerListItem>(customerRes);

      if (!mountedRef.current) return;
      setAgents(nextAgents);
      setCustomers(nextCustomers);
    } catch (e: any) {
      console.error(e);
      if (!mountedRef.current) return;
      setError(e?.response?.data?.message || e?.message || 'Failed to load users');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerify = useCallback(
    async (userId: number, action: 'approve' | 'reject') => {
      try {
        setError(null);
        setProcessingIds((prev) => new Set(prev).add(userId));

        const apiAction = action === 'approve' ? 'APPROVE' : 'REJECT';
        await adminService.updateAgentVerification(userId, apiAction);

        // reload list
        await loadData();
      } catch (e: any) {
        console.error(e);
        if (!mountedRef.current) return;
        setError(
          e?.response?.data?.message || e?.message || 'Failed to update verification status',
        );
      } finally {
        if (!mountedRef.current) return;
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [loadData],
  );

  const getVerificationBadge = (status?: VerificationStatus | string | null) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center w-fit font-bold">
            <CheckCircle className="w-3 h-3 mr-1" /> Verified
          </span>
        );
      case VerificationStatus.PENDING:
        return (
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center w-fit font-bold">
            <ShieldAlert className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case VerificationStatus.REJECTED:
        return (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center w-fit font-bold">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center w-fit font-bold">
            Unverified
          </span>
        );
    }
  };

  const formatEnum = (val?: string | null) => {
    if (!val) return '-';
    const s = String(val).replaceAll('_', ' ');
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const agentCount = agents.length;
  const customerCount = customers.length;

  const emptyStateText = useMemo(() => {
    if (isLoading) return '';
    if (activeTab === 'agents' && agentCount === 0) return 'No agents found.';
    if (activeTab === 'customers' && customerCount === 0) return 'No customers found.';
    return '';
  }, [activeTab, agentCount, customerCount, isLoading]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-500 text-sm">Manage agents, customers, and verifications.</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 pt-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('agents')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center ${
                activeTab === 'agents'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Agents ({agentCount})
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center ${
                activeTab === 'customers'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Customers ({customerCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
          ) : emptyStateText ? (
            <div className="p-8 text-center text-sm text-gray-500">{emptyStateText}</div>
          ) : activeTab === 'agents' ? (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {agents.map((u) => {
                  const agentType = u.verification?.agent_type ?? null;
                  const specialization = u.verification?.specialization ?? u.specialization ?? null;

                  // ✅ handle beberapa kemungkinan field dari backend
                  const status =
                    (u as any).verification_status ?? (u as any).verificationStatus ?? null;

                  const isPending = status === VerificationStatus.PENDING;
                  const isProcessing = processingIds.has(u.id);

                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                className="w-full h-full object-cover"
                                alt={u.name}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {formatEnum(agentType)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {formatEnum(specialization)}
                      </td>

                      <td className="px-6 py-4">{getVerificationBadge(status)}</td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetail(u)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          title="View Verification Data"
                          type="button"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {isPending ? (
                          <>
                            <button
                              onClick={() => confirmAction(u.id, 'approve')}
                              className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              title="Approve"
                              type="button"
                              disabled={isProcessing}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => confirmAction(u.id, 'reject')}
                              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              title="Reject"
                              type="button"
                              disabled={isProcessing}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {customers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              className="w-full h-full object-cover"
                              alt={u.name}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-gray-900">{u.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DETAIL VERIFIKASI */}
      {isModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Verification Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              {/* Identitas Dasar */}
              <div className="grid grid-cols-2 gap-6">
                <DetailBlock label="Agent Type" value={selectedAgent.verification?.agent_type} isEnum />
                <DetailBlock label="Specialization" value={selectedAgent.verification?.specialization || selectedAgent.specialization} isEnum />
                
                <DetailBlock 
                  label={selectedAgent.verification?.agent_type === 'CORPORATE' ? "NIB Number" : "ID Card Number"} 
                  value={selectedAgent.verification?.id_card_number} 
                />

                <DetailBlock 
                  label={selectedAgent.verification?.agent_type === 'CORPORATE' ? "Corporate Tax ID (NPWP)" : "Tax ID (NPWP)"} 
                  value={selectedAgent.verification?.tax_id} 
                />

                <DetailBlock label="Company Name" value={selectedAgent.verification?.company_name} />
              </div>

              <hr className="border-gray-100" />

              {/* Informasi Bank */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-blue-800 font-bold text-sm mb-4 flex items-center">
                  {/* <CreditCard className="w-4 h-4 mr-2" /> Bank Account Information */}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DetailBlock label="Bank Name" value={selectedAgent.verification?.bank_name} />
                  <DetailBlock label="Account Number" value={selectedAgent.verification?.bank_account_number} />
                  <DetailBlock label="Account Holder" value={selectedAgent.verification?.bank_account_holder} />
                </div>
              </div>

              {/* Dokumen Lampiran */}
              {selectedAgent.verification?.id_document_url && (
              <div>
                {/* Keterangan Label Dinamis */}
                <p className="text-xs text-gray-400 font-bold uppercase mb-3">
                  {selectedAgent.verification?.agent_type === 'CORPORATE' 
                    ? 'NIB Document Preview' 
                    : 'ID Document Preview'}
                </p>
                
                {selectedAgent.verification.id_document_url.toLowerCase().endsWith('.pdf') ? (
                  /* UI KHUSUS PDF */
                  <div className="flex flex-col items-center justify-center p-8 bg-red-50 border-2 border-dashed border-red-200 rounded-xl">
                    <div className="bg-red-500 p-4 rounded-full mb-4 shadow-lg shadow-red-200">
                      {/* Icon Dokumen Putih */}
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-red-700 font-bold mb-2">Corporate NIB Document (PDF)</p>
                    <p className="text-red-500/70 text-[10px] mb-4 uppercase tracking-widest">Click below to view or download</p>
                    
                      <div className="flex gap-3">
                        <a
                          href={resolveDocUrl(selectedAgent.verification.id_document_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-300 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-all"
                        >
                          <Eye className="w-4 h-4" /> Open
                        </a>

                        {/* Force download sebagai .pdf via Blob */}
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(resolveDocUrl(selectedAgent.verification!.id_document_url!))}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-md active:scale-95"
                        >
                          ↓ Download PDF
                        </button>
                      </div>
                  </div>
                ) : (
                  /* UI UNTUK GAMBAR (KTP/INDIVIDUAL) */
                  <a 
                    href={resolveDocUrl(selectedAgent.verification.id_document_url)}
                    target="_blank" 
                    rel="noreferrer"
                    className="group relative block rounded-xl overflow-hidden border-2 border-gray-100 hover:border-primary-500 transition-all"
                  >
                    <img 
                      src={resolveDocUrl(selectedAgent.verification.id_document_url)}
                      className="w-full h-auto max-h-64 object-contain bg-gray-50"
                      alt="Verification Document" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-bold flex items-center gap-2">
                        <Eye className="w-5 h-5" /> View Full Image
                      </span>
                    </div>
                  </a>
                )}
              </div>
            )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;

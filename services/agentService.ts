import { AgentSpecialization, AgentType } from '../types';
import http, { unwrap } from './http';
import { mediaService } from './mediaService';

export interface VerifyAgentPayload {
  agent_type: AgentType;
  idCardNumber: string;
  taxId: string;
  companyName?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  specialization: AgentSpecialization;
  idDocument?: File | null;
}

export const agentService = {
  async submitVerification(payload: VerifyAgentPayload): Promise<void> {
    const {
      idDocument,
      agent_type,
      idCardNumber,
      taxId,
      companyName,
      bankName,
      accountNumber,
      accountHolder,
      specialization,
    } = payload;

    // ── 1. Client-side file type guard ──────────────────────────────────────
    if (idDocument instanceof File) {
      const fileType = idDocument.type;

      if (agent_type === AgentType.INDIVIDUAL) {
        if (!fileType.startsWith('image/')) {
          throw new Error('Only images allowed for Individual type');
        }
      } else if (agent_type === AgentType.CORPORATE) {
        if (fileType !== 'application/pdf') {
          throw new Error('Only PDF allowed for Corporate type');
        }
      }
    }

    // ── 2. Build FormData so multer can route to the correct folder ─────────
    //    upload_type + agent_type are read by upload.js middleware:
    //      INDIVIDUAL → public/users/individual
    //      CORPORATE  → public/users/corporate
    const formData = new FormData();
    formData.append('upload_type', 'AGENT_DOCUMENT');
    formData.append('agent_type', agent_type);
    formData.append('id_card_number', idCardNumber);
    formData.append('tax_id', taxId);
    formData.append('bank_name', bankName);
    formData.append('bank_account_number', accountNumber);
    formData.append('bank_account_holder', accountHolder);
    formData.append('specialization', specialization);

    if (companyName) {
      formData.append('company_name', companyName);
    }

    if (idDocument instanceof File) {
      // Field name must match upload.single('idDocument') in agent.js route
      formData.append('idDocument', idDocument);
    }

    // ── 3. POST as multipart — backend saves file & returns path via req.file ─
    await http.post('/agent/verification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async getMyVerification() {
    const res = await http.get('/agent/verification');
    return res.data;
  },

  async getProfileSettings() {
    const res = await http.get('/agent/profile/settings');
    return unwrap(res.data);
  },

  async updateProfile(formData: FormData) {
    const res = await http.put('/agent/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res.data);
  },

  async updatePassword(payload: any) {
    const res = await http.put('/agent/password', payload);
    return unwrap(res.data);
  },

  async requestBankChange(payload: any) {
    const res = await http.post('/agent/bank/request-change', payload);
    return unwrap(res.data);
  },
};
import { AgentSpecialization, AgentType } from '../types';
import http from './http';
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

    if (idDocument instanceof File) {
      const fileType = idDocument.type;

      if (agent_type === 'INDIVIDUAL') {
        if (!fileType.startsWith('image/')) {
          throw new Error('Only images allowed for Individual type');
        }
      } else if (agent_type === 'CORPORATE') {
        if (fileType !== 'application/pdf') {
          throw new Error('Only PDF allowed for Corporate type');
        }
      }
    }

    const uploadedUrl = await mediaService.uploadOne(idDocument, 'agent-verification');

    const finalIdDocUrl = uploadedUrl;

    if (!finalIdDocUrl) throw new Error('Failed to upload document');

    await http.post('/agent/verification', {
      agent_type,
      id_card_number: idCardNumber,
      tax_id: taxId,
      company_name: companyName ?? null,
      bank_name: bankName,
      bank_account_number: accountNumber,
      bank_account_holder: accountHolder,
      specialization,
      id_document_url: finalIdDocUrl,
    });
  },

  async getMyVerification() {
    const res = await http.get('/agent/verification');
    return res.data;
  },
};

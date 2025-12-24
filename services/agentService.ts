import { AgentSpecialization, AgentType } from '../types';
import http from './http';
import { mediaService } from './mediaService';

export interface VerifyAgentPayload {
  type: AgentType;
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
      type,
      idCardNumber,
      taxId,
      companyName,
      bankName,
      accountNumber,
      accountHolder,
      specialization,
    } = payload;

    const uploadedUrl =
      idDocument instanceof File
        ? await mediaService.uploadOne(idDocument, 'agent-verification')
        : null;

    const finalIdDocUrl = uploadedUrl;

    if (!finalIdDocUrl) throw new Error('ID document is required');

    await http.post('/agent/verification', {
      type,
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

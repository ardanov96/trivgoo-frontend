import { ApiEnvelope, LoginPayload, RegisterPayload, User, ReferralStats } from '../types';
import http, { unwrap } from './http';

type LoginData = { user: User };
type MeData = { user: User };
type UpdateProfileData = { user: User };

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    const res = await http.post<ApiEnvelope<LoginData>>('/auth/login', payload);
    const data = unwrap(res.data);
    return data.user;
  },

  async register(payload: RegisterPayload): Promise<void> {
    const res = await http.post<ApiEnvelope<null>>('/auth/register', payload);
    unwrap(res.data);
  },

  async me(): Promise<User> {
    const res = await http.get<ApiEnvelope<MeData>>('/auth/me');
    const data = unwrap(res.data);
    return data.user;
  },

  async updateProfile(payload: FormData): Promise<User> {
    const res = await http.patch<ApiEnvelope<UpdateProfileData>>('/auth/update-profile', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = unwrap(res.data);
    return data.user;
  },

  async logout(): Promise<void> {
    const res = await http.post<ApiEnvelope<null>>('/auth/logout');
    unwrap(res.data);
  },

  async forgotPassword(email: string): Promise<string> {
    // HAPUS /api/v1 di sini, cukup mulai dari /auth
    const res = await http.post<ApiEnvelope<null>>('/auth/forgot-password', { email });
    const data = unwrap(res.data);
    return res.data.message || 'Success';
  },

  async resetPassword(payload: { token: string | null; password: string }): Promise<string> {
    // HAPUS /api/v1 di sini juga
    const res = await http.post<ApiEnvelope<null>>('/auth/reset-password', payload);
    const data = unwrap(res.data);
    return res.data.message || 'Success';
  },

  async validateResetToken(token: string): Promise<{ email: string }> {
    const res = await http.get<ApiEnvelope<{ email: string }>>(`/auth/reset-password?token=${token}`);
    return unwrap(res.data);
  },

  async verifyEmail(token: string): Promise<string> {
    const res = await http.get<ApiEnvelope<null>>(`/auth/verify-email?token=${token}`);
    return res.data.message || 'Email verified successfully';
  },

  async resendVerification(): Promise<string> {
    const res = await http.post<ApiEnvelope<null>>('/auth/resend-verification');
    return res.data.message || 'Verification email resent successfully';
  },

  async resendUnverified(email: string): Promise<string> {
    const res = await http.post<ApiEnvelope<null>>('/auth/resend-unverified', { email });
    return res.data.message || 'Verification email resent successfully';
  },

  async trackReferralClick(code: string): Promise<void> {
    const res = await http.post<ApiEnvelope<null>>('/auth/referral/track_click', { code });
    unwrap(res.data);
  },

  async getReferralStats(): Promise<ReferralStats> {
    const res = await http.get<ApiEnvelope<ReferralStats>>('/auth/referral/stats');
    return unwrap(res.data);
  },

};

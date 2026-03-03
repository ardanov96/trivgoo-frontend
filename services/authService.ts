import { ApiEnvelope, LoginPayload, RegisterPayload, User } from '../types';
import http, { unwrap } from './http';

type LoginData = { user: User };
type RegisterData = { user: User };
type MeData = { user: User };
type UpdateProfileData = { user: User };

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    const res = await http.post<ApiEnvelope<LoginData>>('/auth/login', payload);
    const data = unwrap(res.data);
    return data.user;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const res = await http.post<ApiEnvelope<RegisterData>>('/auth/register', payload);
    const data = unwrap(res.data);
    return data.user;
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
  
};

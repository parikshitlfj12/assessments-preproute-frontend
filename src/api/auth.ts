import { api } from '@/lib/axios';
import type { ApiEnvelope, LoginResponse } from '@/types';

export async function login(userId: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', {
    userId,
    password,
  });
  return data.data;
}

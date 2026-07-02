import { api } from '@/lib/axios';
import type {
  ApiEnvelope,
  CreateTestPayload,
  Test,
  UpdateTestPayload,
} from '@/types';

export async function getTests(): Promise<Test[]> {
  const { data } = await api.get<ApiEnvelope<Test[]>>('/tests');
  return data.data;
}

export async function getTestById(id: string): Promise<Test> {
  const { data } = await api.get<ApiEnvelope<Test>>(`/tests/${id}`);
  return data.data;
}

export async function createTest(payload: CreateTestPayload): Promise<Test> {
  const { data } = await api.post<ApiEnvelope<Test>>('/tests', payload);
  return data.data;
}

export async function updateTest(id: string, payload: UpdateTestPayload): Promise<Test> {
  const { data } = await api.put<ApiEnvelope<Test>>(`/tests/${id}`, payload);
  return data.data;
}

export async function deleteTest(id: string): Promise<void> {
  await api.delete<ApiEnvelope<unknown>>(`/tests/${id}`);
}

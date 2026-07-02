import { api } from '@/lib/axios';
import type { ApiEnvelope, Question, QuestionPayload } from '@/types';

export async function bulkCreateQuestions(
  questions: QuestionPayload[],
): Promise<Question[]> {
  const { data } = await api.post<ApiEnvelope<Question[]>>('/questions/bulk', {
    questions,
  });
  return data.data;
}

export async function fetchQuestionsByIds(questionIds: string[]): Promise<Question[]> {
  if (questionIds.length === 0) return [];
  const { data } = await api.post<ApiEnvelope<Question[]>>('/questions/fetchBulk', {
    question_ids: questionIds,
  });
  return data.data;
}

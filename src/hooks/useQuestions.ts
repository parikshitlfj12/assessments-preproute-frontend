import { useMutation, useQuery } from '@tanstack/react-query';
import { bulkCreateQuestions, fetchQuestionsByIds } from '@/api/questions';
import { queryKeys } from '@/lib/queryClient';
import type { QuestionPayload } from '@/types';

export function useTestQuestions(questionIds: string[] | null | undefined) {
  const ids = questionIds ?? [];
  return useQuery({
    queryKey: queryKeys.questions(ids),
    queryFn: () => fetchQuestionsByIds(ids),
    enabled: ids.length > 0,
  });
}

export function useBulkCreateQuestions() {
  return useMutation({
    mutationFn: (questions: QuestionPayload[]) => bulkCreateQuestions(questions),
  });
}

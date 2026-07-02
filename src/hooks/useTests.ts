import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTest,
  deleteTest,
  getTestById,
  getTests,
  updateTest,
} from '@/api/tests';
import { queryKeys } from '@/lib/queryClient';
import type { CreateTestPayload, Test, UpdateTestPayload } from '@/types';

export function useTests() {
  return useQuery({
    queryKey: queryKeys.tests,
    queryFn: getTests,
  });
}

export function useTest(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.test(id ?? ''),
    queryFn: () => getTestById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTestPayload) => createTest(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tests });
    },
  });
}

export function useUpdateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTestPayload }) =>
      updateTest(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.tests });
      qc.invalidateQueries({ queryKey: queryKeys.test(data.id) });
    },
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTest(id),
    // Optimistically drop the row so the list updates instantly, with rollback on failure.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.tests });
      const previous = qc.getQueryData<Test[]>(queryKeys.tests);
      qc.setQueryData<Test[]>(queryKeys.tests, (old) => old?.filter((t) => t.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(queryKeys.tests, context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tests });
    },
  });
}

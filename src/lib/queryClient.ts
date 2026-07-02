import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

export const queryKeys = {
  subjects: ['subjects'] as const,
  topics: (subjectId: string) => ['topics', subjectId] as const,
  subtopics: (topicId: string) => ['subtopics', topicId] as const,
  subtopicsMulti: (topicIds: string[]) => ['subtopics-multi', ...topicIds] as const,
  tests: ['tests'] as const,
  test: (id: string) => ['test', id] as const,
  questions: (ids: string[]) => ['questions', ...ids] as const,
};

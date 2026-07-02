import { useQuery } from '@tanstack/react-query';
import {
  getSubTopicsByTopic,
  getSubTopicsByTopics,
  getSubjects,
  getTopicsBySubject,
} from '@/api/taxonomy';
import { queryKeys } from '@/lib/queryClient';

export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: getSubjects,
    staleTime: 10 * 60_000,
  });
}

export function useTopics(subjectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.topics(subjectId ?? ''),
    queryFn: () => getTopicsBySubject(subjectId as string),
    enabled: Boolean(subjectId),
  });
}

export function useSubTopics(topicId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.subtopics(topicId ?? ''),
    queryFn: () => getSubTopicsByTopic(topicId as string),
    enabled: Boolean(topicId),
  });
}

/** Sub-topics for a set of selected topics (POST /sub-topics/multi-topics). */
export function useSubTopicsForTopics(topicIds: string[]) {
  return useQuery({
    queryKey: queryKeys.subtopicsMulti(topicIds),
    queryFn: () => getSubTopicsByTopics(topicIds),
    enabled: topicIds.length > 0,
  });
}

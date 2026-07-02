import { api } from '@/lib/axios';
import type { ApiEnvelope, SubTopic, Subject, Topic } from '@/types';

export async function getSubjects(): Promise<Subject[]> {
  const { data } = await api.get<ApiEnvelope<Subject[]>>('/subjects');
  return data.data;
}

export async function getTopicsBySubject(subjectId: string): Promise<Topic[]> {
  const { data } = await api.get<ApiEnvelope<Topic[]>>(`/topics/subject/${subjectId}`);
  return data.data;
}

export async function getSubTopicsByTopic(topicId: string): Promise<SubTopic[]> {
  const { data } = await api.get<ApiEnvelope<SubTopic[]>>(`/sub-topics/topic/${topicId}`);
  return data.data;
}

/** Fetch sub-topics for several topics at once. */
export async function getSubTopicsByTopics(topicIds: string[]): Promise<SubTopic[]> {
  if (topicIds.length === 0) return [];
  const { data } = await api.post<ApiEnvelope<SubTopic[]>>('/sub-topics/multi-topics', {
    topicIds,
  });
  return data.data;
}

import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubTopicsForTopics, useSubjects, useTopics } from '@/hooks/useTaxonomy';
import { useTest } from '@/hooks/useTests';
import { testDetailsSchema, type TestDetailsForm } from '@/lib/validation';
import type { CreateTestPayload, TestStatus } from '@/types';

const DEFAULT_VALUES: TestDetailsForm = {
  name: '',
  type: 'chapterwise',
  subject: '',
  topics: [],
  sub_topics: [],
  difficulty: 'easy',
  correct_marks: 5,
  wrong_marks: -1,
  unattempt_marks: 0,
  total_time: 60,
  total_questions: 50,
  total_marks: 250,
};

/**
 * Encapsulates the test-details form: RHF setup, cascading taxonomy queries,
 * edit hydration (mapping read-model names back to write-model UUIDs) and the
 * payload builder. Shared by the Create/Edit page and the in-flow edit modal.
 */
export function useTestForm(testId?: string) {
  const isEditing = Boolean(testId);
  const subjectsQuery = useSubjects();
  const testQuery = useTest(testId);

  const hydratedRef = useRef(false);
  const pendingRef = useRef<{ topics: string[]; subtopics: string[] } | null>(null);
  const existingStatusRef = useRef<TestStatus | null>(null);

  const form = useForm<TestDetailsForm>({
    resolver: zodResolver(testDetailsSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { watch, setValue, reset } = form;

  const subjectId = watch('subject');
  const topicIds = watch('topics');
  const subTopicIds = watch('sub_topics');

  const topicsQuery = useTopics(subjectId || undefined);
  const subTopicsQuery = useSubTopicsForTopics(topicIds ?? []);

  // Edit hydration: map names (read model) back to UUIDs (write model).
  useEffect(() => {
    if (!isEditing || hydratedRef.current) return;
    const test = testQuery.data;
    const subjects = subjectsQuery.data;
    if (!test || !subjects) return;

    const subject = subjects.find((s) => s.name === test.subject);
    existingStatusRef.current = test.status ?? 'draft';
    pendingRef.current = { topics: test.topics ?? [], subtopics: test.sub_topics ?? [] };

    reset({
      name: test.name,
      type: (['chapterwise', 'pyq', 'mock'].includes(test.type)
        ? test.type
        : 'chapterwise') as 'chapterwise' | 'pyq' | 'mock',
      subject: subject?.id ?? '',
      topics: [],
      sub_topics: [],
      difficulty: test.difficulty,
      correct_marks: test.correct_marks,
      wrong_marks: test.wrong_marks,
      unattempt_marks: test.unattempt_marks,
      total_time: test.total_time,
      total_questions: test.total_questions,
      total_marks: test.total_marks,
    });
    hydratedRef.current = true;
  }, [isEditing, testQuery.data, subjectsQuery.data, reset]);

  useEffect(() => {
    if (!pendingRef.current || !topicsQuery.data) return;
    const names = pendingRef.current.topics;
    if (names.length === 0) return;
    const ids = topicsQuery.data.filter((t) => names.includes(t.name)).map((t) => t.id);
    if (ids.length > 0) setValue('topics', ids);
  }, [topicsQuery.data, setValue]);

  useEffect(() => {
    if (!pendingRef.current || !subTopicsQuery.data) return;
    const names = pendingRef.current.subtopics;
    if (names.length === 0) {
      pendingRef.current = null;
      return;
    }
    const ids = subTopicsQuery.data.filter((s) => names.includes(s.name)).map((s) => s.id);
    if (ids.length > 0) {
      setValue('sub_topics', ids);
      pendingRef.current = null;
    }
  }, [subTopicsQuery.data, setValue]);

  const subjectOptions = useMemo(
    () => (subjectsQuery.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    [subjectsQuery.data],
  );
  const topicOptions = useMemo(
    () => (topicsQuery.data ?? []).map((t) => ({ value: t.id, label: t.name })),
    [topicsQuery.data],
  );
  const subTopicOptions = useMemo(
    () => (subTopicsQuery.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    [subTopicsQuery.data],
  );

  const buildPayload = (status: TestStatus): CreateTestPayload => {
    const v = watch();
    return {
      name: v.name.trim(),
      type: v.type,
      subject: v.subject,
      topics: v.topics,
      sub_topics: v.sub_topics,
      correct_marks: Number(v.correct_marks),
      wrong_marks: Number(v.wrong_marks),
      unattempt_marks: Number(v.unattempt_marks),
      difficulty: v.difficulty,
      total_time: Number(v.total_time),
      total_marks: Number(v.total_marks),
      total_questions: Number(v.total_questions),
      status,
    };
  };

  return {
    form,
    isEditing,
    testQuery,
    subjectsQuery,
    subjectId,
    topicIds,
    subTopicIds,
    topicsQuery,
    subTopicsQuery,
    subjectOptions,
    topicOptions,
    subTopicOptions,
    buildPayload,
    existingStatusRef,
  };
}

export type UseTestForm = ReturnType<typeof useTestForm>;

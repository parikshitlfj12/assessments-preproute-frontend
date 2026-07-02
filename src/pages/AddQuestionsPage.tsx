import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronsLeft, CircleDashed, LogOut, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/common/PageHeader';
import { TestInfoCard } from '@/components/common/TestInfoCard';
import { EditTestModal } from '@/components/common/EditTestModal';
import { QuestionEditor } from '@/components/questions/QuestionEditor';
import { Button } from '@/components/ui/Button';
import { FullPageLoader } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useTest, useUpdateTest } from '@/hooks/useTests';
import { useBulkCreateQuestions, useTestQuestions } from '@/hooks/useQuestions';
import { getApiErrorMessage } from '@/lib/axios';
import { cn } from '@/lib/utils';
import type { QuestionForm } from '@/lib/validation';
import type { Question, QuestionPayload } from '@/types';

interface DraftQuestion extends QuestionForm {
  localId: string;
  serverId?: string;
}

let counter = 0;
const newLocalId = () => `q_${Date.now()}_${counter++}`;

function toDraft(q: Question): DraftQuestion {
  return {
    localId: newLocalId(),
    serverId: q.id,
    question: q.question,
    option1: q.option1,
    option2: q.option2,
    option3: q.option3,
    option4: q.option4,
    correct_option: q.correct_option,
    explanation: q.explanation ?? '',
    difficulty: q.difficulty ?? 'easy',
    topic: q.topic ?? '',
    sub_topic: q.sub_topic ?? '',
    media_url: q.media_url ?? '',
  };
}

export function AddQuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const testQuery = useTest(id);
  const existingQuestions = useTestQuestions(testQuery.data?.questions);
  const bulkCreate = useBulkCreateQuestions();
  const updateTest = useUpdateTest();

  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const hydratedRef = useRef(false);

  // Load already-saved questions once (edit flow).
  useEffect(() => {
    if (hydratedRef.current) return;
    if (existingQuestions.data && existingQuestions.data.length > 0) {
      setDrafts(existingQuestions.data.map(toDraft));
      hydratedRef.current = true;
    }
  }, [existingQuestions.data]);

  const test = testQuery.data;

  const editingDraft = useMemo(
    () => drafts.find((d) => d.localId === editingId),
    [drafts, editingId],
  );

  // currentPos === -1 is the sentinel for "composing a brand-new question"
  // (i.e. not editing an existing draft); the editor then sits after the last draft.
  const currentPos = editingId ? drafts.findIndex((d) => d.localId === editingId) : -1;
  const editorIndex = currentPos >= 0 ? currentPos + 1 : drafts.length + 1;

  const goPrev = () => {
    if (currentPos > 0) setEditingId(drafts[currentPos - 1].localId);
    else if (currentPos === -1 && drafts.length > 0) setEditingId(drafts[drafts.length - 1].localId);
  };
  const goNext = () => {
    if (currentPos >= 0 && currentPos < drafts.length - 1) setEditingId(drafts[currentPos + 1].localId);
    else if (currentPos === drafts.length - 1) setEditingId(null);
  };
  const canPrev = currentPos > 0 || (currentPos === -1 && drafts.length > 0);
  const canNext = currentPos >= 0;

  const topicOptions = useMemo(
    () => (test?.topics ?? []).map((t) => ({ value: t, label: t })),
    [test?.topics],
  );
  const subTopicOptions = useMemo(
    () => (test?.sub_topics ?? []).map((s) => ({ value: s, label: s })),
    [test?.sub_topics],
  );

  const handleSubmitQuestion = (value: QuestionForm) => {
    if (editingId) {
      setDrafts((prev) =>
        prev.map((d) => (d.localId === editingId ? { ...d, ...value } : d)),
      );
      setEditingId(null);
      toast.success('Question updated');
    } else {
      if (test && drafts.length >= test.total_questions) {
        toast.error(`This test is limited to ${test.total_questions} question${test.total_questions === 1 ? '' : 's'}.`);
        return;
      }
      setDrafts((prev) => [...prev, { ...value, localId: newLocalId() }]);
      toast.success('Question added');
    }
  };

  const removeDraft = (localId: string) => {
    setDrafts((prev) => prev.filter((d) => d.localId !== localId));
    if (editingId === localId) setEditingId(null);
  };

  const handleSaveAndContinue = async () => {
    if (!id || !test) return;
    if (drafts.length === 0) {
      toast.error('Add at least one question to continue');
      return;
    }
    setSaving(true);
    try {
      // Persist only questions that have not yet been created on the server.
      const toCreate = drafts.filter((d) => !d.serverId);
      let createdIds: string[] = [];
      if (toCreate.length > 0) {
        const payload: QuestionPayload[] = toCreate.map((d) => {
          const q: QuestionPayload = {
            type: 'mcq',
            question: d.question.trim(),
            option1: d.option1.trim(),
            option2: d.option2.trim(),
            option3: d.option3.trim(),
            option4: d.option4.trim(),
            correct_option: d.correct_option,
            // Backend requires the subject name on each question.
            subject: test.subject,
            difficulty: d.difficulty,
            test_id: id,
          };
          // The backend validates topic/sub_topic as strings and rejects null,
          // so only include them when we have a value (falling back to the test's own).
          const topic = d.topic?.trim() || test.topics[0];
          if (topic) q.topic = topic;
          const subTopic = d.sub_topic?.trim() || test.sub_topics?.[0];
          if (subTopic) q.sub_topic = subTopic;
          const explanation = d.explanation?.trim();
          if (explanation) q.explanation = explanation;
          const mediaUrl = d.media_url?.trim();
          if (mediaUrl) q.media_url = mediaUrl;
          return q;
        });
        const created = await bulkCreate.mutateAsync(payload);
        createdIds = created.map((q) => q.id);
      }

      const existingIds = drafts.map((d) => d.serverId).filter(Boolean) as string[];
      const allIds = [...existingIds, ...createdIds];

      await updateTest.mutateAsync({
        id,
        payload: {
          questions: allIds,
          total_questions: allIds.length,
          total_marks: allIds.length * test.correct_marks,
        },
      });

      toast.success('Questions saved');
      navigate(`/tests/${id}/preview`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save questions'));
    } finally {
      setSaving(false);
    }
  };

  if (testQuery.isLoading) return <FullPageLoader label="Loading test..." />;
  if (testQuery.isError || !test) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">{getApiErrorMessage(testQuery.error)}</p>
      </div>
    );
  }

  // The test declares how many questions it should have; don't allow adding more.
  const atLimit = drafts.length >= test.total_questions;
  const showAddEditor = !editingDraft && !atLimit;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Test Creation', to: '/dashboard' },
          { label: test.name, to: `/tests/${id}/edit` },
          { label: 'Add Questions' },
        ]}
        title="Add Questions"
      />

      <div className="px-4 py-5 sm:px-6">
        <div className="mb-6">
          <TestInfoCard
            name={test.name}
            type={test.type}
            difficulty={test.difficulty}
            subject={test.subject}
            topics={test.topics}
            subTopics={test.sub_topics}
            totalTime={test.total_time}
            totalQuestions={test.total_questions}
            totalMarks={test.total_marks}
            onEdit={() => setEditOpen(true)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Question list panel */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-ink-900">Question creation</p>
                <ChevronsLeft className="h-4 w-4 text-ink-300" aria-hidden="true" />
              </div>
              <p className="mb-3 text-xs font-medium text-ink-400">
                Total Questions . {test.total_questions}
              </p>
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {drafts.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-surface-border px-3 py-6 text-center text-xs text-ink-400">
                    Add your first question →
                  </p>
                ) : (
                  drafts.map((d, i) => (
                    <div
                      key={d.localId}
                      className={cn(
                        'group flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition',
                        editingId === d.localId
                          ? 'border-brand-300 bg-brand-50'
                          : 'border-surface-border hover:border-brand-200 hover:bg-surface-muted',
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <button
                        className="flex-1 truncate text-left font-medium text-ink-700"
                        onClick={() => setEditingId(d.localId)}
                        title={d.question}
                      >
                        Question {i + 1}
                      </button>
                      <button
                        onClick={() => removeDraft(d.localId)}
                        className="rounded-md p-1 text-ink-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        aria-label="Delete question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {!atLimit && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-xs text-ink-400">
                  <CircleDashed className="h-3.5 w-3.5" />
                  Target: {test.total_questions} questions
                </div>
              )}
            </div>
          </aside>

          {/* Editor */}
          <div className="card p-6">
            {editingDraft || showAddEditor ? (
              <QuestionEditor
                index={editorIndex}
                total={Math.max(drafts.length, test.total_questions)}
                initialValue={editingDraft}
                isEditing={Boolean(editingId)}
                topicOptions={topicOptions}
                subTopicOptions={subTopicOptions}
                onSubmit={handleSubmitQuestion}
                onCancelEdit={() => setEditingId(null)}
                onPrev={goPrev}
                onNext={goNext}
                canPrev={canPrev}
                canNext={canNext}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <div>
                  <p className="text-base font-bold text-ink-900">
                    All {test.total_questions} question{test.total_questions === 1 ? '' : 's'} added
                  </p>
                  <p className="mt-1 text-sm text-ink-400">
                    You've reached this test's target. Select a question on the left to edit it, or
                    continue to publish.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-surface-border pt-6 sm:flex-row sm:justify-between">
          <Button
            variant="danger"
            className="bg-[#f77f7f] hover:bg-[#f26a6a]"
            onClick={() => setExitOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            Exit Test Creation
          </Button>
          <Button onClick={handleSaveAndContinue} isLoading={saving} disabled={drafts.length === 0}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Modal
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        title="Exit test creation?"
        description="Unsaved questions in the editor list will be lost. Your test details are already saved as a draft."
        footer={
          <>
            <Button variant="outline" onClick={() => setExitOpen(false)}>
              Keep Editing
            </Button>
            <Button variant="danger" onClick={() => navigate('/dashboard')}>
              Exit to Dashboard
            </Button>
          </>
        }
      />

      {editOpen && id && <EditTestModal testId={id} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

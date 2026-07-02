import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarClock, CheckCircle2, ChevronsLeft, CircleDashed, ListChecks, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/common/PageHeader';
import { TestInfoCard } from '@/components/common/TestInfoCard';
import { EditTestModal } from '@/components/common/EditTestModal';
import { QuestionPreviewCard } from '@/components/questions/QuestionPreviewCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { FullPageLoader, Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTest, useUpdateTest } from '@/hooks/useTests';
import { useTestQuestions } from '@/hooks/useQuestions';
import { LIVE_UNTIL_PRESETS } from '@/lib/constants';
import { getApiErrorMessage } from '@/lib/axios';
import { cn, stripHtml } from '@/lib/utils';
import type { TestStatus, UpdateTestPayload } from '@/types';

type PublishMode = 'now' | 'schedule';

export function PreviewPublishPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const testQuery = useTest(id);
  const questionsQuery = useTestQuestions(testQuery.data?.questions);
  const updateTest = useUpdateTest();

  const [mode, setMode] = useState<PublishMode>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [livePreset, setLivePreset] = useState('always');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const test = testQuery.data;
  const questions = questionsQuery.data ?? [];

  const computeExpiry = useMemo(
    () =>
      (): string | null => {
        const preset = LIVE_UNTIL_PRESETS.find((p) => p.id === livePreset);
        if (!preset || preset.id === 'always') return null;
        if (preset.id === 'custom') {
          if (!customEndDate) return null;
          const iso = new Date(`${customEndDate}T${customEndTime || '23:59'}`);
          return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
        }
        if (preset.days != null) {
          const d = new Date();
          d.setDate(d.getDate() + preset.days);
          return d.toISOString();
        }
        return null;
      },
    [livePreset, customEndDate, customEndTime],
  );

  const handlePublish = async () => {
    if (!id) return;
    if (questions.length === 0) {
      toast.error('Add at least one question before publishing');
      return;
    }

    const status: TestStatus = 'live';
    let scheduledDate: string | null = null;

    if (mode === 'schedule') {
      if (!scheduleDate || !scheduleTime) {
        toast.error('Select a schedule date and time');
        return;
      }
      const scheduled = new Date(`${scheduleDate}T${scheduleTime}`);
      if (Number.isNaN(scheduled.getTime()) || scheduled.getTime() <= Date.now()) {
        toast.error('Schedule must be a future date and time');
        return;
      }
      scheduledDate = scheduled.toISOString();
      // The backend has no dedicated "scheduled" status; a scheduled test stays
      // `live` with a future scheduled_date that the backend gates visibility on.
    }

    if (livePreset === 'custom' && !customEndDate) {
      toast.error('Select a custom end date, or choose another duration');
      return;
    }

    const expiryDate = computeExpiry();

    // The backend validates these as ISO 8601 dates and rejects explicit nulls,
    // so we only include them when we actually have a value.
    const payload: UpdateTestPayload = { status };
    if (scheduledDate) payload.scheduled_date = scheduledDate;
    if (expiryDate) payload.expiry_date = expiryDate;

    setPublishing(true);
    setPublishError(null);
    try {
      await updateTest.mutateAsync({ id, payload });
      toast.success(
        mode === 'schedule' ? 'Test scheduled successfully!' : 'Test published successfully!',
      );
      navigate('/dashboard');
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not publish the test');
      setPublishError(message);
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  };

  if (testQuery.isLoading) return <FullPageLoader label="Loading preview..." />;
  if (testQuery.isError || !test) {
    return (
      <div className="p-6">
        <EmptyState
          title="Couldn't load test"
          description={getApiErrorMessage(testQuery.error)}
          action={<Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>}
        />
      </div>
    );
  }

  const allDone = questions.length >= 1;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Test Creation', to: '/dashboard' },
          { label: test.name, to: `/tests/${id}/questions` },
          { label: 'Preview & Publish' },
        ]}
        title="Test creation"
      />

      <div className="px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left: Question creation panel */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-ink-900">Question creation</p>
                <ChevronsLeft className="h-4 w-4 text-ink-300" aria-hidden="true" />
              </div>
              <p className="mb-3 text-xs font-medium text-ink-400">
                Total Questions . {test.total_questions}
              </p>

              {questionsQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : (
                <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
                  {questions.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-surface-border px-3 py-6 text-center text-xs text-ink-400">
                      No questions added yet.
                    </p>
                  ) : (
                    questions.map((q, i) => (
                      <button
                        key={q.id}
                        onClick={() => navigate(`/tests/${id}/questions`)}
                        title={stripHtml(q.question) || `Question ${i + 1}`}
                        className="flex w-full items-center gap-2 rounded-xl border border-surface-border px-3 py-2.5 text-left text-sm transition hover:border-brand-200 hover:bg-surface-muted"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="flex-1 truncate font-medium text-ink-700">
                          Question {i + 1}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-xs text-ink-400">
                <CircleDashed className="h-3.5 w-3.5" />
                Target: {test.total_questions} questions
              </div>
            </div>
          </aside>

          {/* Main: test summary + publish settings */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-extrabold text-ink-900">Test created</h2>
              {allDone && (
                <Badge tone="green">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {questions.length >= test.total_questions ? 'All ' : ''}
                  {questions.length} {questions.length === 1 ? 'Question' : 'Questions'} done
                </Badge>
              )}
            </div>

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

            {/* All questions with options (required in the complete test overview) */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-ink-900">
                  <ListChecks className="h-5 w-5 text-brand-500" />
                  Questions
                  <span className="text-sm font-medium text-ink-400">({questions.length})</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/tests/${id}/questions`)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Questions
                </Button>
              </div>

              {questionsQuery.isLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : questions.length === 0 ? (
                <EmptyState
                  icon={<ListChecks className="h-6 w-6" />}
                  title="No questions added yet"
                  description="You need at least one question before publishing this test."
                  action={
                    <Button onClick={() => navigate(`/tests/${id}/questions`)}>Add Questions</Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <QuestionPreviewCard key={q.id} question={q} index={i + 1} />
                  ))}
                </div>
              )}
            </div>

            <div className="card space-y-5 p-6">
              {/* Mode tabs */}
              <SegmentedControl<PublishMode>
                className="inline-flex"
                options={[
                  { value: 'now', label: 'Publish Now' },
                  { value: 'schedule', label: 'Schedule Publish' },
                ]}
                value={mode}
                onChange={setMode}
              />

              {mode === 'schedule' && (
                <div className="animate-fade-in space-y-2">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                    <CalendarClock className="h-4 w-4 text-brand-500" />
                    Select Date and Time
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      aria-label="Schedule date"
                      className="input-base w-full"
                      value={scheduleDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                    <input
                      type="time"
                      aria-label="Schedule time"
                      className="input-base w-full"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Live Until */}
              <div>
                <p className="mb-1 text-sm font-bold text-ink-900">Live Until</p>
                <p className="mb-4 text-xs text-ink-400">
                  Choose how long this test should remain available on the platform.
                </p>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-3">
                  {LIVE_UNTIL_PRESETS.map((preset) => {
                    const active = livePreset === preset.id;
                    return (
                      <label
                        key={preset.id}
                        className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink-700"
                      >
                        <input
                          type="radio"
                          name="live-until"
                          className="sr-only"
                          checked={active}
                          onChange={() => setLivePreset(preset.id)}
                        />
                        <span
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
                            active ? 'border-brand-500' : 'border-surface-border',
                          )}
                        >
                          {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
                        </span>
                        {preset.label}
                      </label>
                    );
                  })}
                </div>

                {livePreset === 'custom' && (
                  <div className="mt-4 grid animate-fade-in grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      type="date"
                      aria-label="End date"
                      className="input-base w-full"
                      value={customEndDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                    <input
                      type="time"
                      aria-label="End time"
                      className="input-base w-full"
                      value={customEndTime}
                      onChange={(e) => setCustomEndTime(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {publishError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
                  {publishError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button isLoading={publishing} disabled={!allDone} onClick={handlePublish}>
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editOpen && id && <EditTestModal testId={id} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

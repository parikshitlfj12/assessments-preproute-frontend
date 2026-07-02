import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/common/PageHeader';
import { TestDetailsFields } from '@/components/common/TestDetailsFields';
import { Button } from '@/components/ui/Button';
import { FullPageLoader } from '@/components/ui/Spinner';
import { useTestForm } from '@/hooks/useTestForm';
import { useCreateTest, useUpdateTest } from '@/hooks/useTests';
import { TEST_TYPE_LABELS } from '@/lib/constants';
import { getApiErrorMessage } from '@/lib/axios';
import type { TestStatus } from '@/types';

export function CreateEditTestPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const tf = useTestForm(id);
  const createMutation = useCreateTest();
  const updateMutation = useUpdateTest();

  const [submitAction, setSubmitAction] = useState<'draft' | 'next' | null>(null);
  const selectedType = tf.form.watch('type');

  const persist = async (status: TestStatus) => {
    const payload = tf.buildPayload(status);
    if (isEditing && id) {
      await updateMutation.mutateAsync({ id, payload });
      return id;
    }
    const created = await createMutation.mutateAsync(payload);
    return created.id;
  };

  const onValid = async (action: 'draft' | 'next') => {
    setSubmitAction(action);
    try {
      const status = tf.existingStatusRef.current ?? 'draft';
      const testId = await persist(status);
      if (action === 'draft') {
        toast.success(isEditing ? 'Test updated' : 'Draft saved');
        navigate('/dashboard');
      } else {
        toast.success(isEditing ? 'Details updated' : 'Test details saved');
        navigate(`/tests/${testId}/questions`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save the test'));
    } finally {
      setSubmitAction(null);
    }
  };

  if (isEditing && (tf.testQuery.isLoading || tf.subjectsQuery.isLoading)) {
    return <FullPageLoader label="Loading test details..." />;
  }

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Test Creation', to: '/dashboard' },
          { label: isEditing ? 'Edit Test' : 'Create Test' },
          { label: TEST_TYPE_LABELS[selectedType] },
        ]}
        title={isEditing ? 'Edit Test Details' : 'Create a New Test'}
        divider={false}
      />

      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <form
          id="test-form"
          onSubmit={tf.form.handleSubmit(() => onValid('next'))}
          className="card space-y-7 p-6 sm:p-8"
        >
          <TestDetailsFields tf={tf} />

          {/* Footer actions */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              isLoading={busy && submitAction === 'draft'}
              onClick={tf.form.handleSubmit(() => onValid('draft'))}
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={busy && submitAction === 'next'}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

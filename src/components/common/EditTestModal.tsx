import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { TestDetailsFields } from '@/components/common/TestDetailsFields';
import { useTestForm } from '@/hooks/useTestForm';
import { useUpdateTest } from '@/hooks/useTests';
import { getApiErrorMessage } from '@/lib/axios';

/**
 * In-flow "Edit Test creation" modal. Mount only when open so the taxonomy
 * queries and hydration run just for the active edit session.
 */
export function EditTestModal({ testId, onClose }: { testId: string; onClose: () => void }) {
  const tf = useTestForm(testId);
  const updateMutation = useUpdateTest();
  const loading = tf.testQuery.isLoading || tf.subjectsQuery.isLoading;

  const handleSave = tf.form.handleSubmit(async () => {
    try {
      const status = tf.existingStatusRef.current ?? 'draft';
      await updateMutation.mutateAsync({ id: testId, payload: tf.buildPayload(status) });
      toast.success('Test details updated');
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update the test'));
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Test creation"
      className="max-h-[92vh] max-w-5xl overflow-y-auto"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={updateMutation.isPending}>
            Save
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <TestDetailsFields tf={tf} />
      )}
    </Modal>
  );
}

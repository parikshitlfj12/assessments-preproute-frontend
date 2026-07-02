import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { NumberStepper } from '@/components/ui/NumberStepper';
import { DIFFICULTY_OPTIONS, TEST_TYPE_OPTIONS } from '@/lib/constants';
import type { Difficulty, TestType } from '@/types';
import type { UseTestForm } from '@/hooks/useTestForm';

const TYPE_OPTIONS = TEST_TYPE_OPTIONS as { value: TestType; label: string }[];
const DIFFICULTY_RADIO = DIFFICULTY_OPTIONS as { value: Difficulty; label: string }[];

/** Presentational field set for the test-details form; state lives in useTestForm. */
export function TestDetailsFields({ tf }: { tf: UseTestForm }) {
  const {
    form: { control, register, setValue, formState },
    subjectsQuery,
    subjectId,
    topicIds,
    subTopicIds,
    subjectOptions,
    topicOptions,
    subTopicOptions,
    subTopicsQuery,
  } = tf;
  const { errors } = formState;

  return (
    <div className="space-y-7">
      {/* Test type tabs */}
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <SegmentedControl options={TYPE_OPTIONS} value={field.value} onChange={field.onChange} />
        )}
      />

      {/* Primary details */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <Select
              label="Subject"
              required
              placeholder={subjectsQuery.isLoading ? 'Loading subjects...' : 'Choose from Drop-down'}
              options={subjectOptions}
              error={errors.subject?.message}
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value);
                setValue('topics', []);
                setValue('sub_topics', []);
              }}
            />
          )}
        />
        <Input
          label="Name of Test"
          required
          placeholder="Enter name of Test"
          error={errors.name?.message}
          {...register('name')}
        />

        <Controller
          control={control}
          name="topics"
          render={({ field }) => (
            <MultiSelect
              label="Topic"
              required
              placeholder="Choose from Drop-down"
              options={topicOptions}
              value={field.value}
              onChange={(next) => {
                field.onChange(next);
                const validSubIds = (subTopicsQuery.data ?? [])
                  .filter((s) => next.includes(s.topic_id))
                  .map((s) => s.id);
                setValue(
                  'sub_topics',
                  (subTopicIds ?? []).filter((sid) => validSubIds.includes(sid)),
                );
              }}
              disabled={!subjectId}
              emptyMessage={!subjectId ? 'Select a subject first' : 'No topics found'}
              error={errors.topics?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="sub_topics"
          render={({ field }) => (
            <MultiSelect
              label="Sub Topic"
              placeholder="Choose from Drop-down"
              options={subTopicOptions}
              value={field.value}
              onChange={field.onChange}
              disabled={!topicIds || topicIds.length === 0}
              emptyMessage={
                !topicIds || topicIds.length === 0 ? 'Select topics first' : 'No sub-topics found'
              }
            />
          )}
        />

        <Input
          label="Duration (Minutes)"
          type="number"
          required
          placeholder="Enter the time"
          error={errors.total_time?.message}
          {...register('total_time')}
        />
        <div>
          <p className="label-base">
            Test Difficulty Level<span className="ml-0.5 text-red-500">*</span>
          </p>
          <Controller
            control={control}
            name="difficulty"
            render={({ field }) => (
              <RadioGroup
                name="difficulty"
                options={DIFFICULTY_RADIO}
                value={field.value}
                onChange={field.onChange}
                className="w-full justify-between pt-2"
              />
            )}
          />
        </div>
      </div>

      {/* Marking scheme */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-bold text-ink-900">Marking Scheme:</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <p className="label-base">Wrong Answer</p>
            <Controller
              control={control}
              name="wrong_marks"
              render={({ field }) => (
                <NumberStepper
                  aria-label="Wrong answer marks"
                  value={Number(field.value)}
                  onChange={field.onChange}
                  max={0}
                  showSign
                />
              )}
            />
          </div>
          <div>
            <p className="label-base">Unattempted</p>
            <Controller
              control={control}
              name="unattempt_marks"
              render={({ field }) => (
                <NumberStepper
                  aria-label="Unattempted marks"
                  value={Number(field.value)}
                  onChange={field.onChange}
                  showSign
                />
              )}
            />
          </div>
          <div>
            <p className="label-base">Correct Answer</p>
            <Controller
              control={control}
              name="correct_marks"
              render={({ field }) => (
                <NumberStepper
                  aria-label="Correct answer marks"
                  value={Number(field.value)}
                  onChange={field.onChange}
                  min={0}
                  showSign
                />
              )}
            />
          </div>
          <Input
            label="No of Questions"
            type="number"
            required
            placeholder="Ex: 50"
            error={errors.total_questions?.message}
            {...register('total_questions')}
          />
          <Input
            label="Total Marks"
            type="number"
            required
            placeholder="Ex: 250 Marks"
            error={errors.total_marks?.message}
            {...register('total_marks')}
          />
        </div>
      </div>
    </div>
  );
}

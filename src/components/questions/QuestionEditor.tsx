import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { DIFFICULTY_OPTIONS } from '@/lib/constants';
import { downloadQuestionCsvTemplate } from '@/lib/csv';
import { questionSchema, type QuestionForm } from '@/lib/validation';
import { cn } from '@/lib/utils';
import type { CorrectOption } from '@/types';

const OPTION_FIELDS: { key: keyof QuestionForm; option: CorrectOption; label: string }[] = [
  { key: 'option1', option: 'option1', label: 'A' },
  { key: 'option2', option: 'option2', label: 'B' },
  { key: 'option3', option: 'option3', label: 'C' },
  { key: 'option4', option: 'option4', label: 'D' },
];

const EMPTY: QuestionForm = {
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: 'option1',
  explanation: '',
  difficulty: 'easy',
  topic: '',
  sub_topic: '',
  media_url: '',
};

interface QuestionEditorProps {
  index: number;
  total: number;
  initialValue?: QuestionForm;
  isEditing: boolean;
  topicOptions?: { value: string; label: string }[];
  subTopicOptions?: { value: string; label: string }[];
  onSubmit: (value: QuestionForm) => void;
  onCancelEdit?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  onImportCsv?: (text: string) => void;
}

export function QuestionEditor({
  index,
  total,
  initialValue,
  isEditing,
  topicOptions = [],
  subTopicOptions = [],
  onSubmit,
  onCancelEdit,
  onPrev,
  onNext,
  canPrev = false,
  canNext = false,
  onImportCsv,
}: QuestionEditorProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialValue ?? EMPTY,
  });

  useEffect(() => {
    reset(initialValue ?? EMPTY);
  }, [initialValue, reset]);

  const correctOption = watch('correct_option');
  const mediaUrl = watch('media_url');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportCsv?.(await file.text());
    e.target.value = ''; // allow re-importing the same file
  };

  const submit = (values: QuestionForm) => {
    onSubmit(values);
    if (!isEditing) reset(EMPTY);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Header: index + question-type actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink-900">
          Question <span className="text-brand-500">{index}</span>
          <span className="text-ink-400"> / {total}</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
            <Plus className="h-3.5 w-3.5" />
            MCQ
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink-500 transition hover:bg-surface-muted"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Import CSV
          </button>
          <button
            type="button"
            onClick={downloadQuestionCsvTemplate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink-500 transition hover:bg-surface-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Template
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvFile}
            className="hidden"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => reset(EMPTY)}
        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 transition hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete All Edits
      </button>

      {/* Question text with a working rich-text formatting bar */}
      <Controller
        control={control}
        name="question"
        render={({ field }) => (
          <RichTextEditor
            value={field.value}
            onChange={field.onChange}
            placeholder="Type here"
            error={errors.question?.message}
          />
        )}
      />

      {/* Options */}
      <div>
        <p className="label-base">Type the options below</p>
        <div className="space-y-3">
          {OPTION_FIELDS.map(({ key, option, label }) => {
            const isCorrect = correctOption === option;
            return (
              <div
                key={option}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-2 transition',
                  isCorrect ? 'border-emerald-300 bg-emerald-50/50' : 'border-surface-border',
                )}
              >
                <button
                  type="button"
                  onClick={() => setValue('correct_option', option, { shouldValidate: true })}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition',
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-surface-border text-ink-400 hover:border-brand-400',
                  )}
                  aria-label={`Mark option ${label} as correct`}
                >
                  {isCorrect ? <Check className="h-4 w-4" /> : label}
                </button>
                <Input
                  placeholder="Type Option here"
                  className="border-0 shadow-none focus:ring-0"
                  error={errors[key]?.message}
                  {...register(key)}
                />
                <button
                  type="button"
                  onClick={() => setValue(key, '')}
                  className="shrink-0 rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label={`Clear option ${label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Solution */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-700">Add Solution</span>
          <button
            type="button"
            onClick={() => setValue('explanation', '')}
            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-500"
            aria-label="Clear solution"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <Textarea placeholder="Type here" rows={3} {...register('explanation')} />
      </div>

      {/* Question image (optional, stored as media_url) */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
            <ImageIcon className="h-4 w-4 text-ink-400" />
            Question image (optional)
          </span>
          {mediaUrl && (
            <button
              type="button"
              onClick={() => setValue('media_url', '', { shouldValidate: true })}
              className="rounded-lg p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-500"
              aria-label="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <Input
          placeholder="Paste an image URL (https://…)"
          error={errors.media_url?.message}
          {...register('media_url')}
        />
        {mediaUrl && /^https?:\/\//i.test(mediaUrl) && (
          <img
            src={mediaUrl}
            alt="Question attachment preview"
            className="mt-3 max-h-48 rounded-xl border border-surface-border object-contain"
          />
        )}
      </div>

      {/* Question navigation */}
      {(onPrev || onNext) && (
        <div className="flex items-center justify-center gap-20 py-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-ink-500 transition enabled:hover:bg-surface-muted disabled:opacity-40"
            aria-label="Previous question"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-ink-500 transition enabled:hover:bg-surface-muted disabled:opacity-40"
            aria-label="Next question"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Question settings */}
      <div className="space-y-4">
        <p className="text-sm font-bold text-ink-700">Question settings</p>
        <Controller
          control={control}
          name="difficulty"
          render={({ field }) => (
            <Select
              label="Level of Difficulty"
              placeholder="Select from Drop-down"
              options={DIFFICULTY_OPTIONS}
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="topic"
          render={({ field }) => (
            <Select
              label="Topic"
              placeholder="Select from Drop-down"
              options={topicOptions}
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="sub_topic"
          render={({ field }) => (
            <Select
              label="Sub-topic"
              placeholder="Select from Drop-down"
              options={subTopicOptions}
              {...field}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {isEditing && onCancelEdit && (
          <Button type="button" variant="ghost" onClick={onCancelEdit}>
            <RotateCcw className="h-4 w-4" />
            Cancel Edit
          </Button>
        )}
        <Button type="submit">
          <Plus className="h-4 w-4" />
          {isEditing ? 'Update Question' : 'Add Question'}
        </Button>
      </div>
    </form>
  );
}

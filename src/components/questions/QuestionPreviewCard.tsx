import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DIFFICULTY_LABELS } from '@/lib/constants';
import { cn, sanitizeHtml } from '@/lib/utils';
import type { CorrectOption, Difficulty, Question } from '@/types';

const OPTION_KEYS: { key: CorrectOption; label: string }[] = [
  { key: 'option1', label: 'A' },
  { key: 'option2', label: 'B' },
  { key: 'option3', label: 'C' },
  { key: 'option4', label: 'D' },
];

const DIFFICULTY_TONE: Record<Difficulty, 'green' | 'amber' | 'red'> = {
  easy: 'green',
  medium: 'amber',
  hard: 'red',
};

/** Read-only rendering of a question with all four options and the correct answer marked. */
export function QuestionPreviewCard({ question, index }: { question: Question; index: number }) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-sm font-bold text-brand-500">Q{index}.</span>
          <div
            className="rte-content mt-1 text-sm font-medium text-ink-900"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.question) }}
          />
        </div>
        {question.difficulty && (
          <Badge tone={DIFFICULTY_TONE[question.difficulty]}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </Badge>
        )}
      </div>

      {question.media_url && (
        <img
          src={question.media_url}
          alt={`Question ${index} illustration`}
          className="mb-3 max-h-56 rounded-xl border border-surface-border object-contain"
        />
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OPTION_KEYS.map(({ key, label }) => {
          const isCorrect = question.correct_option === key;
          return (
            <div
              key={key}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition',
                isCorrect
                  ? 'border-emerald-300 bg-emerald-50/60 font-medium text-emerald-800'
                  : 'border-surface-border text-ink-700',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-surface-border text-ink-400',
                )}
              >
                {isCorrect ? <Check className="h-3.5 w-3.5" /> : label}
              </span>
              <span className="flex-1">{question[key]}</span>
            </div>
          );
        })}
      </div>

      {question.explanation && (
        <div className="mt-3 rounded-xl bg-surface-muted px-3 py-2.5 text-sm text-ink-600">
          <span className="font-semibold text-ink-700">Solution: </span>
          {question.explanation}
        </div>
      )}
    </div>
  );
}

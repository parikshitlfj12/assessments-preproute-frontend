import { Clock, FileText, GraduationCap, ListChecks, Pencil } from 'lucide-react';
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { TEST_TYPE_LABELS } from '@/lib/constants';
import type { TestType } from '@/types';

export interface TestInfoCardProps {
  name: string;
  type: TestType;
  difficulty: string;
  subject: string;
  topics: string[];
  subTopics: string[];
  totalTime: number;
  totalQuestions: number;
  totalMarks: number;
  onEdit?: () => void;
}

function Row({ label, values, empty }: { label: string; values: string[]; empty: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-20 shrink-0 text-ink-400">{label}</span>
      <span className="text-ink-400">:</span>
      <div className="flex flex-wrap gap-1.5">
        {values.length > 0 ? (
          values.map((v) => (
            <span
              key={v}
              className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
            >
              {v}
            </span>
          ))
        ) : (
          <span className="italic text-ink-400">{empty}</span>
        )}
      </div>
    </div>
  );
}

export function TestInfoCard({
  name,
  type,
  difficulty,
  subject,
  topics,
  subTopics,
  totalTime,
  totalQuestions,
  totalMarks,
  onEdit,
}: TestInfoCardProps) {
  return (
    <div className="card relative p-5">
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute right-4 top-4 rounded-lg p-2 text-brand-500 transition hover:bg-brand-50"
          aria-label="Edit test details"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <Badge tone="indigo" className="rounded-full bg-ink-900 px-3 py-1 text-white">
        {TEST_TYPE_LABELS[type]}
      </Badge>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <GraduationCap className="h-5 w-5 text-brand-500" />
        <h3 className="text-lg font-extrabold text-ink-900">{name}</h3>
        <DifficultyBadge difficulty={difficulty} />
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-20 shrink-0 text-ink-400">Subject</span>
            <span className="text-ink-400">:</span>
            <span className="font-medium text-ink-700">{subject || '—'}</span>
          </div>
          <Row label="Topic" values={topics} empty="No topics" />
          <Row label="Sub Topic" values={subTopics} empty="No sub-topics" />
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-surface-muted px-4 py-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
            <Clock className="h-4 w-4 text-ink-400" />
            {totalTime} Min
          </span>
          <span className="h-4 w-px bg-surface-border" />
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
            <ListChecks className="h-4 w-4 text-ink-400" />
            {totalQuestions} Qs
          </span>
          <span className="h-4 w-px bg-surface-border" />
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
            <FileText className="h-4 w-4 text-ink-400" />
            {totalMarks} Marks
          </span>
        </div>
      </div>
    </div>
  );
}

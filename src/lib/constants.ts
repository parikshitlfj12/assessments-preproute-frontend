import type { SelectOption } from '@/components/ui/Select';
import type { CorrectOption, Difficulty, TestType } from '@/types';

export const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Difficult' },
];

// Test-type tabs as shown in the Figma design.
export const TEST_TYPE_OPTIONS: SelectOption[] = [
  { value: 'chapterwise', label: 'Chapterwise' },
  { value: 'pyq', label: 'PYQ' },
  { value: 'mock', label: 'Mock Test' },
];

export const CORRECT_OPTION_VALUES: CorrectOption[] = [
  'option1',
  'option2',
  'option3',
  'option4',
];

export const TEST_TYPE_LABELS: Record<TestType, string> = {
  chapterwise: 'Chapter Wise',
  pyq: 'PYQ',
  mock: 'Mock Test',
  'full-length': 'Full Length',
  custom: 'Custom',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Difficult',
};

export interface LiveUntilPreset {
  id: string;
  label: string;
  days: number | null; // null = always available / custom handled separately
}

export const LIVE_UNTIL_PRESETS: LiveUntilPreset[] = [
  { id: 'always', label: 'Always Available', days: null },
  { id: '1w', label: '1 Week', days: 7 },
  { id: '2w', label: '2 Weeks', days: 14 },
  { id: '3w', label: '3 Weeks', days: 21 },
  { id: '1m', label: '1 Month', days: 30 },
  { id: 'custom', label: 'Custom Duration', days: null },
];

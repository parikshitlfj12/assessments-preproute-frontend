import { questionSchema, type QuestionForm } from '@/lib/validation';
import type { CorrectOption } from '@/types';

/**
 * Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes ("")
 * and both LF / CRLF line endings. Good enough for spreadsheet exports without
 * pulling in a dependency.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      field = '';
      row = [];
    } else {
      field += char;
    }
  }
  // Flush trailing field/row (file without a final newline).
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Maps normalized CSV header names to our form field keys.
const HEADER_ALIASES: Record<string, keyof QuestionForm> = {
  question: 'question',
  questiontext: 'question',
  option1: 'option1',
  optiona: 'option1',
  a: 'option1',
  option2: 'option2',
  optionb: 'option2',
  b: 'option2',
  option3: 'option3',
  optionc: 'option3',
  c: 'option3',
  option4: 'option4',
  optiond: 'option4',
  d: 'option4',
  correctoption: 'correct_option',
  correct: 'correct_option',
  answer: 'correct_option',
  difficulty: 'difficulty',
  level: 'difficulty',
  topic: 'topic',
  subtopic: 'sub_topic',
  explanation: 'explanation',
  solution: 'explanation',
  mediaurl: 'media_url',
  image: 'media_url',
  imageurl: 'media_url',
};

function normalizeCorrectOption(raw: string): CorrectOption | undefined {
  const v = raw.trim().toLowerCase();
  if (['option1', 'a', '1'].includes(v)) return 'option1';
  if (['option2', 'b', '2'].includes(v)) return 'option2';
  if (['option3', 'c', '3'].includes(v)) return 'option3';
  if (['option4', 'd', '4'].includes(v)) return 'option4';
  return undefined;
}

function normalizeDifficulty(raw?: string): QuestionForm['difficulty'] {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'medium') return 'medium';
  if (v === 'hard' || v === 'difficult') return 'hard';
  return 'easy';
}

export interface CsvImportResult {
  questions: QuestionForm[];
  skipped: number;
  total: number;
}

/** Parse CSV text into validated questions, skipping (and counting) bad rows. */
export function parseQuestionsCsv(text: string): CsvImportResult {
  const rows = parseCsv(text);
  if (rows.length < 2) return { questions: [], skipped: 0, total: 0 };

  const header = rows[0].map((h) => HEADER_ALIASES[normalizeKey(h)]);
  const dataRows = rows.slice(1);
  const questions: QuestionForm[] = [];
  let skipped = 0;

  for (const cells of dataRows) {
    const record: Record<string, string> = {};
    header.forEach((field, i) => {
      if (field) record[field] = (cells[i] ?? '').trim();
    });

    const mediaUrl = record.media_url ?? '';
    const candidate = {
      question: record.question ?? '',
      option1: record.option1 ?? '',
      option2: record.option2 ?? '',
      option3: record.option3 ?? '',
      option4: record.option4 ?? '',
      correct_option: normalizeCorrectOption(record.correct_option ?? '') ?? 'option1',
      difficulty: normalizeDifficulty(record.difficulty),
      explanation: record.explanation ?? '',
      topic: record.topic ?? '',
      sub_topic: record.sub_topic ?? '',
      // Drop obviously invalid media URLs instead of failing the whole row.
      media_url: /^https?:\/\//i.test(mediaUrl) ? mediaUrl : '',
    };

    const parsed = questionSchema.safeParse(candidate);
    if (parsed.success) questions.push(parsed.data);
    else skipped++;
  }

  return { questions, skipped, total: dataRows.length };
}

const TEMPLATE_HEADERS = [
  'question',
  'option1',
  'option2',
  'option3',
  'option4',
  'correct_option',
  'difficulty',
  'topic',
  'sub_topic',
  'explanation',
  'media_url',
];

const TEMPLATE_SAMPLE = [
  'What is 2 + 2?',
  '3',
  '4',
  '5',
  '6',
  'option2',
  'easy',
  '',
  '',
  'Basic addition',
  '',
];

/** Trigger a download of a ready-to-fill CSV template. */
export function downloadQuestionCsvTemplate() {
  const csv = [
    TEMPLATE_HEADERS.join(','),
    TEMPLATE_SAMPLE.map((c) => (c.includes(',') ? `"${c}"` : c)).join(','),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'questions-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

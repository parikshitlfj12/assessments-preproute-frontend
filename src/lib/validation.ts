import { z } from 'zod';

export const testDetailsSchema = z.object({
  name: z.string().trim().min(3, 'Test name must be at least 3 characters'),
  type: z.enum(['chapterwise', 'pyq', 'mock']),
  subject: z.string().min(1, 'Please select a subject'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correct_marks: z.coerce.number().min(0, 'Cannot be negative'),
  wrong_marks: z.coerce.number().max(0, 'Negative marking should be 0 or less'),
  unattempt_marks: z.coerce.number(),
  total_time: z.coerce.number().min(1, 'Time must be at least 1 minute'),
  total_questions: z.coerce.number().min(1, 'At least 1 question required'),
  total_marks: z.coerce.number().min(1, 'Total marks must be greater than 0'),
});

export type TestDetailsForm = z.infer<typeof testDetailsSchema>;

export const questionSchema = z.object({
  question: z.string().trim().min(1, 'Question text is required'),
  option1: z.string().trim().min(1, 'Option 1 is required'),
  option2: z.string().trim().min(1, 'Option 2 is required'),
  option3: z.string().trim().min(1, 'Option 3 is required'),
  option4: z.string().trim().min(1, 'Option 4 is required'),
  correct_option: z.enum(['option1', 'option2', 'option3', 'option4']),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  topic: z.string().optional(),
  sub_topic: z.string().optional(),
  media_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export type QuestionForm = z.infer<typeof questionSchema>;

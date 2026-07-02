// ---------------------------------------------------------------------------
// Shared domain & API types
// ---------------------------------------------------------------------------

/** Every backend response is wrapped in this envelope. */
export interface ApiEnvelope<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface AuthUser {
  id: string;
  userId: string;
  name: string;
  role: string;
  subrole?: string | null;
  phone?: string;
  joiningDate?: string;
  endDate?: string;
  lastActive?: string;
  payment?: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface Subject {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubTopic {
  id: string;
  topic_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
// `chapterwise` | `pyq` | `mock` mirror the Figma test-type tabs; the trailing
// values are kept so tests created before this mapping still render safely.
export type TestType = 'chapterwise' | 'pyq' | 'mock' | 'full-length' | 'custom';
// Status values observed on the live backend.
export type TestStatus = 'draft' | 'live' | 'expired' | 'unpublished';

/**
 * Shape returned by GET /tests and GET /tests/:id.
 * Note the read model returns `subject`, `topics` and `sub_topics` as human
 * readable names (strings), whereas the write model expects UUIDs.
 */
export interface Test {
  id: string;
  name: string;
  type: TestType;
  subject: string; // subject NAME on read
  topics: string[]; // topic NAMES on read
  sub_topics: string[]; // sub-topic NAMES on read
  questions: string[] | null; // array of question UUIDs
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty;
  total_marks: number;
  total_time: number;
  total_questions: number;
  status: TestStatus | null;
  scheduled_date?: string | null;
  expiry_date?: string | null;
  created_by?: number;
  created_at?: string;
  updated_at?: string | null;
}

/** Payload for POST /tests (write model uses UUIDs). */
export interface CreateTestPayload {
  name: string;
  type: TestType;
  subject: string; // subject UUID
  topics: string[]; // topic UUIDs
  sub_topics: string[]; // sub-topic UUIDs
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: TestStatus | null;
}

/** Partial payload for PUT /tests/:id. */
export type UpdateTestPayload = Partial<CreateTestPayload> & {
  questions?: string[];
  scheduled_date?: string | null;
  expiry_date?: string | null;
};

export type CorrectOption = 'option1' | 'option2' | 'option3' | 'option4';

/**
 * Payload item for POST /questions/bulk.
 * NOTE: the live backend additionally requires `subject` (the subject NAME as a
 * string) on every question — this is not in the shared API doc but is enforced
 * by server-side validation. `topic` / `sub_topic` are optional (nullable).
 */
export interface QuestionPayload {
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: CorrectOption;
  subject: string;
  topic?: string | null;
  sub_topic?: string | null;
  explanation?: string;
  difficulty?: Difficulty;
  media_url?: string;
  test_id: string;
}

/** Shape returned by POST /questions/fetchBulk and /questions/bulk. */
export interface Question extends Omit<QuestionPayload, 'test_id'> {
  id: string;
  test_id?: string;
  created_at?: string;
  updated_at?: string;
}

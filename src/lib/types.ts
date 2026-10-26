// Mirrors the FastAPI response models (gira-perimi-be/app/schemas).

export type User = {
  id: string;
  email: string;
  name: string;
  given_name: string | null;
  picture_url: string | null;
  phone: string | null;
  plan: string;
  created_at: string;
};

export type AuthConfig = {
  google_client_id: string | null;
  paywall_enabled: boolean;
};

export type Option = { text: string; image: string | null };

export type Question = {
  id: number;
  ref: string;
  text: string;
  image: string | null;
  options: Option[];
  topic: string;
};

export type QuestionWithAnswer = Question & { answer: number };

export type Topic = {
  id: string;
  name: string;
  description: string;
  icon: string;
  question_count: number;
  lessons: string[];
};

export type SignRef = { id: string; code: string; name: string; image: string };

export type LessonBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "callout"; tone: "tip" | "warning" | "info" | "law" | "key"; title: string; blocks: LessonBlock[] }
  | { type: "signs"; codes: string[]; signs: SignRef[] };

export type LessonSummary = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  icon: string;
  topics: string[];
  minutes: number;
  free: boolean;
  question_count: number;
  sections: string[];
  completed: boolean;
  locked: boolean;
};

export type Lesson = Omit<LessonSummary, "sections" | "locked"> & {
  sources: string[];
  sections: { id: string; title: string; blocks: LessonBlock[] }[];
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

export type Sign = {
  id: string;
  code: string;
  category: string;
  name: string;
  description: string;
  image: string;
};

export type SignCategory = { id: string; name: string; description: string; letter: string; count: number };

export type Overview = {
  questions: number;
  lessons: number;
  signs: number;
  topics: number;
  exam: {
    question_count: number;
    duration_minutes: number;
    pass_mark: number;
    readiness_min_exams: number;
    readiness_min_average: number;
  };
};

export type ExamItem = Question & {
  position: number;
  question_id: number;
  selected: number | null;
  answer: number | null;
  is_correct: boolean | null;
};

export type Exam = {
  id: string;
  status: "in_progress" | "completed";
  started_at: string;
  deadline_at: string;
  submitted_at: string | null;
  server_time: string;
  auto_submitted: boolean;
  total: number;
  score: number | null;
  pass_mark: number;
  passed: boolean | null;
  answered: number;
  items: ExamItem[];
};

export type ExamSummary = {
  id: string;
  status: "in_progress" | "completed";
  started_at: string;
  submitted_at: string | null;
  total: number;
  score: number | null;
  passed: boolean | null;
  duration_seconds: number | null;
};

export type PracticeMode = "random" | "new" | "mistakes";

export type PracticeSet = {
  topic: string | null;
  mode: PracticeMode;
  available: number;
  questions: QuestionWithAnswer[];
};

export type ReadinessStatus = "new" | "learning" | "almost" | "ready";

export type Readiness = {
  status: ReadinessStatus;
  ready: boolean;
  exams_completed: number;
  exams_required: number;
  exams_remaining: number;
  average: number | null;
  average_required: number;
};

export type ExamStats = {
  completed: number;
  passed: number;
  average: number | null;
  best: number | null;
  last: number | null;
  pass_rate: number | null;
};

export type TopicMastery = {
  topic: string;
  name: string;
  answered: number;
  correct: number;
  accuracy: number | null;
  question_count: number;
  seen: number;
};

export type Dashboard = {
  user: User;
  readiness: Readiness;
  exams: ExamStats;
  trend: { exam_id: string; date: string; score: number; passed: boolean }[];
  topics: TopicMastery[];
  lessons: { completed: number; total: number; completed_slugs: string[]; next_slug: string | null };
  practice_answers: number;
  questions_seen: number;
  question_total: number;
  streak_days: number;
  activity: { day: string; answers: number }[];
  recent_exams: ExamSummary[];
  in_progress_exam: string | null;
};

export type Admin = { id: string; email: string; name: string; last_login_at: string | null };

export type PlatformStats = {
  users_total: number;
  users_new_7d: number;
  users_active_7d: number;
  users_ready: number;
  exams_total: number;
  exams_7d: number;
  average_score: number | null;
  pass_rate: number | null;
  practice_answers: number;
  daily: { day: string; signups: number; exams: number }[];
  score_distribution: { score: number; count: number }[];
  topics: { topic: string; name: string; answered: number; accuracy: number | null }[];
};

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  picture_url: string | null;
  plan: string;
  is_active: boolean;
  created_at: string;
  last_active_at: string | null;
  exams_completed: number;
  average: number | null;
  best: number | null;
  ready: boolean;
  readiness_status: ReadinessStatus;
};

export type Page<T> = { items: T[]; total: number; page: number; page_size: number };

export type AdminUserDetail = {
  id: string;
  email: string;
  name: string;
  picture_url: string | null;
  phone: string | null;
  plan: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  last_active_at: string | null;
  readiness: Readiness;
  exams: ExamStats;
  topics: TopicMastery[];
  lessons_completed: number;
  lessons_total: number;
  practice_answers: number;
  recent_exams: ExamSummary[];
};

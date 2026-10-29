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
  /** "YYYY-MM-DD" (Kigali day) or null. */
  exam_date: string | null;
  daily_goal: number;
  reminders: boolean;
  /** False until the learner finishes or skips the first-time welcome (/ikaze). */
  onboarded: boolean;
  /** Has signed in with Google: name and photo come from Google. False for accounts opened with an email link. */
  google_account: boolean;
};

/** POST /practice/placement: the welcome quiz, saved in one go. */
export type PlacementResult = { correct: number; total: number; weak_topics: string[] };

export type AuthConfig = {
  google_client_id: string | null;
  /** Sign-in links by email are offered (the server can send email). */
  email_login: boolean;
  paywall_enabled: boolean;
  reminders_available: boolean;
  /** VAPID public key for phone notifications; null when they are switched off on the server. */
  push_public_key: string | null;
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

/** Why the answer is right, and the article of law behind it (null when not written yet). */
export type Explained = { explanation: string | null; law_ref: string | null };

export type QuestionWithAnswer = Question & Explained & { answer: number };

/** GET /me/badges: achievement badges, earned or with the progress towards them. */
export type Badge = { id: string; title: string; description: string; earned: boolean; current: number; target: number };
export type Badges = { earned: number; total: number; items: Badge[] };

/** GET /questions/search: the best 30 matches, and how many there are in all. */
export type QuestionSearch = { total: number; items: QuestionWithAnswer[] };

/** open: the last answer to the question is still wrong; fixed: answered correctly since. */
export type MistakeStatus = "all" | "open" | "fixed";

export type Mistake = {
  question: QuestionWithAnswer;
  wrong_count: number;
  last_wrong_at: string;
  /** The option picked the last time (null: left unanswered in an exam). */
  last_selected: number | null;
  fixed: boolean;
};

export type Mistakes = {
  total: number;
  page: number;
  page_size: number;
  counts: Record<MistakeStatus, number>;
  topics: Record<string, number>;
  items: Mistake[];
};

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
  | { type: "signs"; codes: string[]; signs: SignRef[] }
  | { type: "diagram"; name: string };

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
    readiness_recent_exams: number;
  };
};

export type ExamItem = Question &
  Explained & {
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
  /** `average` is over this many most recent exams; abandoned exams are left out of both counts. */
  average_window: number;
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

export type ReviewSummary = {
  due: number;
  due_questions: number;
  due_signs: number;
  learning: number;
  mastered: number;
  next_due_at: string | null;
  /** Items still being learned in Leitner boxes 1–5. */
  boxes: number[];
};

export type ReviewItem =
  | { kind: "question"; box: number; question: QuestionWithAnswer }
  | { kind: "sign"; box: number; sign: Sign };

export type ReviewSession = { summary: ReviewSummary; items: ReviewItem[] };

/** passed: the exam date is behind us; succeeded: the learner told us they passed the real exam. */
export type PlanPace = "none" | "on_track" | "tight" | "today" | "passed" | "succeeded";

export type StudyPlan = {
  exam_date: string | null;
  days_left: number | null;
  lessons_left: number;
  exams_left: number;
  pace: PlanPace;
  exam_every_days: number | null;
  exams_per_day: number | null;
};

export type Today = {
  answered: number;
  goal: number;
  lesson_done: boolean;
  exam_done: boolean;
  exam_suggested: boolean;
};

export type OfflinePack = { version: string; topics: Topic[]; questions: QuestionWithAnswer[] };

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
  today: Today;
  plan: StudyPlan;
  review: ReviewSummary;
  /** "Watsinze ikizamini?": the past exam date to ask about, or null. */
  outcome_question: string | null;
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
  outcomes_answered: number;
  outcomes_passed: number;
  testimonials_pending: number;
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
  exam_date: string | null;
  daily_goal: number;
  streak_days: number;
  review: ReviewSummary;
};

export type QuestionFilter = "all" | "missing" | "unreviewed" | "reviewed" | "edited";

export type AdminQuestion = Explained & {
  id: number;
  ref: string;
  text: string;
  image: string | null;
  options: Option[];
  answer: number;
  topic: string;
  reviewed: boolean;
  edited: boolean;
  updated_at: string | null;
  updated_by: string | null;
  answered: number;
  accuracy: number | null;
};

export type AdminQuestions = Page<AdminQuestion> & {
  counts: { total: number; with_explanation: number; reviewed: number; edited: number };
};

export type OutcomeResult = "passed" | "failed" | "not_taken";

/** GET /stats/outcomes: the real-exam pass rate learners reported (null until enough answered) and testimonials. */
export type OutcomeStats = {
  answered: number;
  passed: number;
  pass_rate: number | null;
  testimonials: { name: string; text: string; exam_date: string }[];
};

export type TestimonialStatus = "pending" | "approved" | "hidden";

export type AdminTestimonial = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  exam_date: string;
  result: OutcomeResult;
  text: string;
  public: boolean;
  status: TestimonialStatus;
  created_at: string;
};

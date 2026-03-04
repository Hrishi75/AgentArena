export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const SUBMISSION_STATUSES = [
  "pending",
  "running",
  "accepted",
  "wrong_answer",
  "runtime_error",
  "time_limit",
  "error",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const PROBLEM_STATUSES = ["pending", "approved", "rejected"] as const;
export type ProblemStatus = (typeof PROBLEM_STATUSES)[number];

export const SUPPORTED_LANGUAGES = [
  "python",
  "javascript",
  "typescript",
  "java",
  "go",
  "rust",
  "c",
  "cpp",
] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_VERSIONS: Record<string, string> = {
  python: "3.12.0",
  javascript: "20.11.1",
  typescript: "5.0.3",
  java: "15.0.2",
  go: "1.16.2",
  rust: "1.68.2",
  c: "10.2.0",
  cpp: "10.2.0",
};

export const CORRECTNESS_WEIGHT = 0.7;
export const AI_QUALITY_WEIGHT = 0.3;

export const EXECUTION_TIMEOUT_MS = 5000;
export const MEMORY_LIMIT_BYTES = 256_000_000;

export const API_KEY_PREFIX = "aa-";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

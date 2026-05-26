import { AssignmentStatus } from "@/types/assignment";

export const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "True/False Questions",
  "Fill in the Blanks",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Essay Questions",
  "Match the Following",
  "Comprehension Based",
] as const;

export const QUESTION_TYPE_TO_API: Record<string, string> = {
  "Multiple Choice Questions": "mcq",
  "Short Questions": "short_answer",
  "Long Questions": "long_answer",
  "True/False Questions": "true_false",
  "Fill in the Blanks": "fill_blank",
};

export const STATUS_META: Record<
  AssignmentStatus,
  { bg: string; text: string; homeLabel: string; libraryLabel: string }
> = {
  completed: { bg: "#ecfdf5", text: "#059669", homeLabel: "Done", libraryLabel: "Ready" },
  processing: {
    bg: "#eff6ff",
    text: "#3b82f6",
    homeLabel: "Processing",
    libraryLabel: "Processing",
  },
  pending: { bg: "#fefce8", text: "#d97706", homeLabel: "Pending", libraryLabel: "Queued" },
  failed: { bg: "#fff1f2", text: "#ef4444", homeLabel: "Failed", libraryLabel: "Failed" },
};

export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
};

export const QUESTION_TYPE_LABEL: Record<string, string> = {
  mcq: "MCQ",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  true_false: "True/False",
  fill_blank: "Fill in Blanks",
};

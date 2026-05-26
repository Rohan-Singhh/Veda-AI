export type AssignmentStatus = "pending" | "processing" | "completed" | "failed";
export type AssignmentDifficulty = "easy" | "medium" | "hard" | "mixed";

export interface AssignmentFormData {
  subject: string;
  topic: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: AssignmentDifficulty;
  additionalInstructions?: string;
  uploadedFileText?: string;
}

export interface AssignmentResponse {
  _id: string;
  subject: string;
  topic: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions: string;
  status: AssignmentStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentListItem {
  _id: string;
  subject: string;
  topic: string;
  status: AssignmentStatus;
  createdAt: string;
  dueDate: string;
  questionTypes?: string[];
  numberOfQuestions?: number;
  totalMarks?: number;
  difficulty?: string;
}

export interface QuestionData {
  questionNumber: number;
  text: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  options?: string[];
}

export interface SectionData {
  title: string;
  instruction: string;
  questions: QuestionData[];
}

export interface PaperData {
  _id: string;
  assignmentId: string;
  title: string;
  subject: string;
  topic: string;
  totalMarks: number;
  duration: string;
  sections: SectionData[];
}

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AssignmentFormData {
  subject: string;
  topic: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
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
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
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

export async function createAssignment(
  data: AssignmentFormData
): Promise<AssignmentResponse> {
  const res = await api.post("/assignments", data);
  return res.data.assignment;
}

export async function getAssignment(id: string): Promise<AssignmentResponse> {
  const res = await api.get(`/assignments/${id}`);
  return res.data.assignment;
}

export async function getQuestionPaper(id: string): Promise<PaperData> {
  const res = await api.get(`/assignments/${id}/paper`);
  return res.data.paper;
}

export async function regeneratePaper(
  id: string
): Promise<AssignmentResponse> {
  const res = await api.post(`/assignments/${id}/regenerate`);
  return res.data.assignment;
}

export async function generatePdfToBackend(id: string): Promise<{ message: string; url?: string }> {
  const res = await api.post(`/assignments/${id}/pdf`);
  return res.data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await api.delete(`/assignments/${id}`);
}

export default api;

import { create } from "zustand";
import {
  AssignmentFormData,
  AssignmentResponse,
  PaperData,
} from "@/types/assignment";

export type AppStatus =
  | "idle"
  | "submitting"
  | "processing"
  | "completed"
  | "failed";

interface AssignmentStore {
  // Form state
  formData: AssignmentFormData;
  setFormData: (data: Partial<AssignmentFormData>) => void;
  resetForm: () => void;

  // Current assignment
  currentAssignment: AssignmentResponse | null;
  setCurrentAssignment: (assignment: AssignmentResponse | null) => void;

  // Generated paper
  generatedPaper: PaperData | null;
  setGeneratedPaper: (paper: PaperData | null) => void;

  // Status
  status: AppStatus;
  setStatus: (status: AppStatus) => void;

  // Error
  error: string | null;
  setError: (error: string | null) => void;
}

const defaultFormData: AssignmentFormData = {
  subject: "",
  topic: "",
  dueDate: "",
  questionTypes: [],
  numberOfQuestions: 10,
  totalMarks: 50,
  difficulty: "mixed",
  additionalInstructions: "",
  uploadedFileText: "",
};

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  formData: { ...defaultFormData },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetForm: () =>
    set({
      formData: { ...defaultFormData },
      status: "idle",
      error: null,
    }),

  currentAssignment: null,
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

  generatedPaper: null,
  setGeneratedPaper: (paper) => set({ generatedPaper: paper }),

  status: "idle",
  setStatus: (status) => set({ status }),

  error: null,
  setError: (error) => set({ error }),
}));

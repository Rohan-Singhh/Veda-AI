import axios from "axios";
import { API_BASE } from "@/config/api";
import {
  AssignmentFormData,
  AssignmentListItem,
  AssignmentResponse,
  PaperData,
} from "@/types/assignment";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export type {
  AssignmentFormData,
  AssignmentListItem,
  AssignmentResponse,
  PaperData,
};

export async function createAssignment(
  data: AssignmentFormData
): Promise<AssignmentResponse> {
  const res = await api.post("/assignments", data);
  return res.data.assignment;
}

export async function getAssignments(): Promise<AssignmentListItem[]> {
  const res = await api.get("/assignments");
  return res.data.assignments || [];
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

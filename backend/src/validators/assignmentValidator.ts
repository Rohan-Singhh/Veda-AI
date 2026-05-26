import { z } from "zod";

export const createAssignmentSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required"),
  topic: z.string().trim().min(1, "Topic is required"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Due date must be valid"),
  questionTypes: z
    .array(z.enum(["mcq", "short_answer", "long_answer", "true_false", "fill_blank"]))
    .min(1, "At least one question type is required"),
  numberOfQuestions: z.number().int().min(1, "Must have at least 1 question"),
  totalMarks: z.number().int().min(1, "Total marks must be at least 1"),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  additionalInstructions: z.string().trim().max(2000).optional(),
  uploadedFileText: z.string().max(20000).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

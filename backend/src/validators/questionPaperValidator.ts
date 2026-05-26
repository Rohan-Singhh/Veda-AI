import { z } from "zod";

const questionSchema = z.object({
  questionNumber: z.number().int().min(1),
  text: z.string().trim().min(1),
  type: z.string().trim().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  marks: z.number().int().min(1),
  options: z.array(z.string().trim().min(1)).optional(),
});

const sectionSchema = z.object({
  title: z.string().trim().min(1),
  instruction: z.string().trim().min(1),
  questions: z.array(questionSchema).min(1),
});

export const generatedPaperSchema = z.object({
  title: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  topic: z.string().trim().min(1),
  totalMarks: z.number().int().min(1),
  duration: z.string().trim().min(1),
  sections: z.array(sectionSchema).min(1),
});

export type GeneratedPaper = z.infer<typeof generatedPaperSchema>;

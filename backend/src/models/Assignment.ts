import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  subject: string;
  topic: string;
  dueDate: Date;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  additionalInstructions?: string;
  uploadedFileText?: string;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: {
      type: [String],
      required: true,
      enum: ["mcq", "short_answer", "long_answer", "true_false", "fill_blank"],
    },
    numberOfQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "mixed",
    },
    additionalInstructions: { type: String, default: "" },
    uploadedFileText: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema
);

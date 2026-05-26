import { Request, Response } from "express";
import { Assignment } from "../models/Assignment";
import { QuestionPaper } from "../models/QuestionPaper";
import { getGenerationQueue } from "../queues/generationQueue";
import { getPdfQueue } from "../queues/pdfQueue";
import { setAssignmentJobState, getAssignmentJobState, setPdfJobState } from "../services/jobStateService";
import { ApiError } from "../utils/apiError";
import { getRedisClient } from "../utils/redis";
import { createAssignmentSchema } from "../validators/assignmentValidator";
import fs from "fs";
import path from "path";

export async function createAssignment(req: Request, res: Response): Promise<void> {
  const data = createAssignmentSchema.parse(req.body);

  const assignment = new Assignment({
    ...data,
    dueDate: new Date(data.dueDate),
    status: "pending",
  });
  await assignment.save();

  await setAssignmentJobState(assignment._id!.toString(), {
    status: "pending",
    progress: 5,
    message: "Assignment queued for generation",
  });

  const queue = await getGenerationQueue();
  await queue.add(
    "generate-paper",
    { assignmentId: assignment._id!.toString() },
    { jobId: `gen-${assignment._id!.toString()}` }
  );

  res.status(201).json({
    message: "Assignment created and queued for generation",
    assignment: assignment.toJSON(),
  });
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const assignment = await Assignment.findById(id);

  if (!assignment) {
    throw new ApiError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found");
  }

  res.json({ assignment: assignment.toJSON() });
}

export async function getAllAssignments(_req: Request, res: Response): Promise<void> {
  const assignments = await Assignment.find().sort({ createdAt: -1 }).limit(50);
  res.json({ assignments });
}

export async function getAssignmentStatus(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const state = await getAssignmentJobState(id);

  if (!state) {
    throw new ApiError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found");
  }

  res.json({ state });
}

export async function getQuestionPaper(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  try {
    const redis = await getRedisClient();
    const cached = await redis.get(`paper:${id}`);
    if (cached) {
      res.json({ paper: JSON.parse(cached), source: "cache" });
      return;
    }
  } catch {
    // Redis unavailable, continue to MongoDB.
  }

  const paper = await QuestionPaper.findOne({ assignmentId: id });

  if (!paper) {
    throw new ApiError(404, "QUESTION_PAPER_NOT_FOUND", "Question paper not found");
  }

  try {
    const redis = await getRedisClient();
    await redis.set(`paper:${id}`, JSON.stringify(paper.toJSON()), "EX", 3600);
  } catch {
    // Ignore cache write failures.
  }

  res.json({ paper: paper.toJSON(), source: "database" });
}

export async function regeneratePaper(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  const assignment = await Assignment.findById(id);
  if (!assignment) {
    throw new ApiError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found");
  }

  assignment.status = "pending";
  assignment.errorMessage = undefined;
  await assignment.save();

  try {
    const redis = await getRedisClient();
    await redis.del(`paper:${id}`);
  } catch {
    // Ignore cache failures.
  }

  await setAssignmentJobState(id, {
    status: "pending",
    progress: 5,
    message: "Paper regeneration queued",
    errorMessage: undefined,
  });

  const queue = await getGenerationQueue();
  await queue.add("generate-paper", { assignmentId: id }, { jobId: `regen-${id}-${Date.now()}` });

  res.json({ message: "Paper regeneration queued", assignment: assignment.toJSON() });
}

export async function generatePdf(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  const assignment = await Assignment.findById(id).lean();
  if (!assignment) {
    throw new ApiError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found");
  }

  const pdfPath = path.join(__dirname, "../../public/pdfs", `${id}.pdf`);
  if (fs.existsSync(pdfPath)) {
    await setPdfJobState(id, {
      status: "completed",
      progress: 100,
      url: `/pdfs/${id}.pdf`,
    });
    res.json({ message: "PDF already exists", url: `/pdfs/${id}.pdf` });
    return;
  }

  const paper = await QuestionPaper.findOne({ assignmentId: id }).lean();
  if (!paper) {
    throw new ApiError(409, "QUESTION_PAPER_NOT_READY", "Question paper must be generated before PDF export");
  }

  await setPdfJobState(id, {
    status: "pending",
    progress: 5,
  });

  const queue = await getPdfQueue();
  await queue.add("generate-pdf", { assignmentId: id }, { jobId: `pdf-${id}-${Date.now()}` });

  res.json({ message: "PDF generation queued" });
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  const assignment = await Assignment.findByIdAndDelete(id);
  if (!assignment) {
    throw new ApiError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found");
  }

  await QuestionPaper.deleteOne({ assignmentId: id });

  try {
    const redis = await getRedisClient();
    await redis.del(`paper:${id}`, `job:assignment:${id}`);
  } catch {
    // Ignore cache failures.
  }

  const pdfPath = path.join(__dirname, "../../public/pdfs", `${id}.pdf`);
  if (fs.existsSync(pdfPath)) {
    fs.unlinkSync(pdfPath);
  }

  res.json({ message: "Assignment deleted successfully" });
}

import { Request, Response } from "express";
import { z } from "zod";
import { Assignment } from "../models/Assignment";
import { QuestionPaper } from "../models/QuestionPaper";
import { getGenerationQueue } from "../queues/generationQueue";
import { getPdfQueue } from "../queues/pdfQueue";
import { getRedisClient } from "../utils/redis";
import fs from "fs";
import path from "path";

// Zod validation schema
const createAssignmentSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  dueDate: z.string().min(1, "Due date is required"),
  questionTypes: z
    .array(
      z.enum(["mcq", "short_answer", "long_answer", "true_false", "fill_blank"])
    )
    .min(1, "At least one question type is required"),
  numberOfQuestions: z.number().int().min(1, "Must have at least 1 question"),
  totalMarks: z.number().int().min(1, "Total marks must be at least 1"),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  additionalInstructions: z.string().optional(),
  uploadedFileText: z.string().optional(),
});

export async function createAssignment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const validation = createAssignmentSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
      });
      return;
    }

    const data = validation.data;

    // Create assignment in MongoDB
    const assignment = new Assignment({
      ...data,
      dueDate: new Date(data.dueDate),
      status: "pending",
    });
    await assignment.save();

    // Add job to BullMQ queue
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
  } catch (error: any) {
    console.error("Create assignment error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function getAssignment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    res.json({ assignment: assignment.toJSON() });
  } catch (error: any) {
    console.error("Get assignment error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function getAllAssignments(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ assignments });
  } catch (error: any) {
    console.error("Get all assignments error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function getQuestionPaper(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    // Check Redis cache first
    try {
      const redis = await getRedisClient();
      const cached = await redis.get(`paper:${id}`);
      if (cached) {
        res.json({ paper: JSON.parse(cached), source: "cache" });
        return;
      }
    } catch {
      // Redis unavailable, continue to MongoDB
    }

    // Fallback to MongoDB
    const paper = await QuestionPaper.findOne({ assignmentId: id });

    if (!paper) {
      res.status(404).json({ error: "Question paper not found" });
      return;
    }

    // Cache it for next time
    try {
      const redis = await getRedisClient();
      await redis.set(`paper:${id}`, JSON.stringify(paper.toJSON()), "EX", 3600);
    } catch {
      // Ignore cache write failures
    }

    res.json({ paper: paper.toJSON(), source: "database" });
  } catch (error: any) {
    console.error("Get question paper error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function regeneratePaper(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    // Reset status
    assignment.status = "pending";
    await assignment.save();

    // Delete old cached paper
    try {
      const redis = await getRedisClient();
      await redis.del(`paper:${id}`);
    } catch {
      // Ignore
    }

    // Re-queue job
    const queue = await getGenerationQueue();
    await queue.add(
      "generate-paper",
      { assignmentId: id },
      { jobId: `regen-${id}-${Date.now()}` }
    );

    res.json({ message: "Paper regeneration queued", assignment: assignment.toJSON() });
  } catch (error: any) {
    console.error("Regenerate paper error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function generatePdf(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    // Check if PDF already exists
    const pdfPath = path.join(__dirname, "../../public/pdfs", `${id}.pdf`);
    if (fs.existsSync(pdfPath)) {
      res.json({ message: "PDF already exists", url: `/pdfs/${id}.pdf` });
      return;
    }

    // Queue PDF generation
    const queue = await getPdfQueue();
    await queue.add(
      "generate-pdf",
      { assignmentId: id },
      { jobId: `pdf-${id}-${Date.now()}` }
    );

    res.json({ message: "PDF generation queued" });
  } catch (error: any) {
    console.error("Generate PDF error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function deleteAssignment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    // Delete assignment
    await Assignment.findByIdAndDelete(id);

    // Delete corresponding question paper
    await QuestionPaper.deleteOne({ assignmentId: id });

    // Delete from Redis cache
    try {
      const redis = await getRedisClient();
      await redis.del(`paper:${id}`);
    } catch {
      // ignore
    }

    // Delete generated PDF if it exists
    try {
      const pdfPath = path.join(__dirname, "../../public/pdfs", `${id}.pdf`);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    } catch {
      // ignore
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error: any) {
    console.error("Delete assignment error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}


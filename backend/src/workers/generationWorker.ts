import { Worker, Job } from "bullmq";
import { getRedisClient } from "../utils/redis";
import { Assignment } from "../models/Assignment";
import { QuestionPaper } from "../models/QuestionPaper";
import { generateQuestionPaper } from "../ai/openrouterService";
import { emitToAssignment } from "../socket/socketHandler";

interface GenerationJobData {
  assignmentId: string;
}

export async function startGenerationWorker(): Promise<Worker> {
  const connection = await getRedisClient();

  const worker = new Worker<GenerationJobData>(
    "question-generation",
    async (job: Job<GenerationJobData>) => {
      const { assignmentId } = job.data;
      console.log(`🔄 Processing job for assignment: ${assignmentId}`);

      try {
        // Update status to processing
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: "processing",
        });

        // Notify frontend
        emitToAssignment(assignmentId, "assignment:processing", {
          assignmentId,
          status: "processing",
          message: "Generating questions...",
        });

        // Fetch the assignment
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
          throw new Error(`Assignment not found: ${assignmentId}`);
        }

        // Generate questions using AI
        const paperData = await generateQuestionPaper(assignment);

        // Save to MongoDB
        const paper = await QuestionPaper.findOneAndUpdate(
          { assignmentId },
          { ...paperData, assignmentId },
          { upsert: true, new: true }
        );

        // Cache in Redis
        try {
          const redis = await getRedisClient();
          await redis.set(
            `paper:${assignmentId}`,
            JSON.stringify(paper.toJSON()),
            "EX",
            3600 // 1 hour TTL
          );
        } catch {
          console.warn("Redis cache write failed, continuing...");
        }

        // Update assignment status
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: "completed",
        });

        // Notify frontend
        emitToAssignment(assignmentId, "assignment:completed", {
          assignmentId,
          status: "completed",
          paper: paper.toJSON(),
        });

        console.log(`✅ Job completed for assignment: ${assignmentId}`);
        return paper.toJSON();
      } catch (error: any) {
        console.error(
          `❌ Job failed for assignment: ${assignmentId}`,
          error.message
        );

        // Update status to failed
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: "failed",
          errorMessage: error.message,
        });

        // Notify frontend
        emitToAssignment(assignmentId, "assignment:failed", {
          assignmentId,
          status: "failed",
          error: error.message,
        });

        throw error;
      }
    },
    {
      connection: connection as any,
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Worker: Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Worker: Job ${job?.id} failed:`, err.message);
  });

  console.log("✅ Generation worker started");
  return worker;
}

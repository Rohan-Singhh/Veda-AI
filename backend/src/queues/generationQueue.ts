import { Queue } from "bullmq";
import { getRedisClient } from "../utils/redis";

let generationQueue: Queue | null = null;

export async function getGenerationQueue(): Promise<Queue> {
  if (generationQueue) return generationQueue;

  const connection = await getRedisClient();

  generationQueue = new Queue("question-generation", {
    connection: connection as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  });

  console.log("✅ BullMQ queue initialized");
  return generationQueue;
}

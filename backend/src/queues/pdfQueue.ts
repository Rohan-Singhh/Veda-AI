import { Queue } from "bullmq";
import { getRedisClient } from "../utils/redis";

let pdfQueue: Queue | null = null;

export async function getPdfQueue(): Promise<Queue> {
  if (pdfQueue) return pdfQueue;

  const connection = await getRedisClient();

  pdfQueue = new Queue("pdf-generation", {
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

  console.log("✅ BullMQ PDF queue initialized");
  return pdfQueue;
}

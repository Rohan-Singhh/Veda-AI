import { Assignment } from "../models/Assignment";
import { getRedisClient } from "../utils/redis";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface JobState {
  assignmentId: string;
  status: JobStatus;
  progress: number;
  message?: string;
  errorMessage?: string;
  pdf?: {
    status: JobStatus;
    progress: number;
    url?: string;
    errorMessage?: string;
  };
  updatedAt: string;
}

const JOB_STATE_TTL_SECONDS = 60 * 60 * 24;

export async function setAssignmentJobState(
  assignmentId: string,
  update: Partial<Omit<JobState, "assignmentId" | "updatedAt">>
): Promise<void> {
  const current = await getAssignmentJobState(assignmentId, false);
  const next: JobState = {
    assignmentId,
    status: update.status || current?.status || "pending",
    progress: update.progress ?? current?.progress ?? 0,
    message: update.message ?? current?.message,
    errorMessage: update.errorMessage,
    pdf: update.pdf ?? current?.pdf,
    updatedAt: new Date().toISOString(),
  };

  try {
    const redis = await getRedisClient();
    await redis.set(jobStateKey(assignmentId), JSON.stringify(next), "EX", JOB_STATE_TTL_SECONDS);
  } catch {
    // Job state is helpful for UX, but Mongo remains the durable source of truth.
  }
}

export async function setPdfJobState(
  assignmentId: string,
  pdf: NonNullable<JobState["pdf"]>
): Promise<void> {
  const current = await getAssignmentJobState(assignmentId, false);
  await setAssignmentJobState(assignmentId, {
    ...(current || { status: "completed", progress: 100 }),
    pdf,
  });
}

export async function getAssignmentJobState(
  assignmentId: string,
  includeMongoFallback = true
): Promise<JobState | null> {
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(jobStateKey(assignmentId));
    if (cached) {
      return JSON.parse(cached) as JobState;
    }
  } catch {
    // Fall through to Mongo fallback.
  }

  if (!includeMongoFallback) {
    return null;
  }

  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) {
    return null;
  }

  return {
    assignmentId,
    status: assignment.status,
    progress: statusToProgress(assignment.status),
    message: statusToMessage(assignment.status),
    errorMessage: assignment.errorMessage,
    updatedAt: assignment.updatedAt?.toISOString?.() || new Date().toISOString(),
  };
}

function jobStateKey(assignmentId: string): string {
  return `job:assignment:${assignmentId}`;
}

function statusToProgress(status: JobStatus): number {
  switch (status) {
    case "pending":
      return 5;
    case "processing":
      return 50;
    case "completed":
      return 100;
    case "failed":
      return 100;
  }
}

function statusToMessage(status: JobStatus): string {
  switch (status) {
    case "pending":
      return "Waiting in queue";
    case "processing":
      return "Generating question paper";
    case "completed":
      return "Question paper ready";
    case "failed":
      return "Generation failed";
  }
}

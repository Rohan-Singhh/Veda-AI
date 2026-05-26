"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { connectSocket, joinAssignmentRoom, disconnectSocket } from "@/services/socket";
import { getAssignment } from "@/services/api";
import { PROCESSING_STEPS } from "@/constants/processingSteps";
import { PaperData } from "@/types/assignment";

interface ProcessingPageProps {
  params: Promise<{ id: string }>;
}

const STEPS = PROCESSING_STEPS;

type StepState = "pending" | "active" | "done";

export default function ProcessingPage({ params }: ProcessingPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { setGeneratedPaper, setStatus, setCurrentAssignment } = useAssignmentStore();

  const [stepStates, setStepStates] = useState<StepState[]>(["active", "pending", "pending"]);
  const [failed, setFailed] = useState(false);
  const [failMsg, setFailMsg] = useState("");

  const advance = (to: number) => {
    setStepStates((prev) => {
      const next = [...prev] as StepState[];
      for (let i = 0; i < to; i++) next[i] = "done";
      if (to < next.length) next[to] = "active";
      return next;
    });
  };

  useEffect(() => {
    // Initial status check
    const checkStatus = async () => {
      try {
        const assignment = await getAssignment(id);
        setCurrentAssignment(assignment);
        if (assignment.status === "completed") { router.push(`/assignment/${id}`); return; }
        if (assignment.status === "failed") { setStatus("failed"); router.push(`/assignment/${id}`); }
      } catch { /* ignore */ }
    };
    checkStatus();

    const socket = connectSocket();
    joinAssignmentRoom(id);

    socket.on("assignment:processing", () => advance(1));

    socket.on("assignment:completed", (data: { paper: PaperData }) => {
      advance(STEPS.length); // mark all done
      setGeneratedPaper(data.paper);
      setStatus("completed");
      setTimeout(() => router.push(`/assignment/${id}`), 800);
    });

    socket.on("assignment:failed", (data: { error: string }) => {
      setStatus("failed");
      setFailed(true);
      setFailMsg(data.error || "Unknown error");
      setTimeout(() => router.push(`/assignment/${id}`), 3000);
    });

    // Fallback timers
    const t1 = setTimeout(() => setStepStates((p) => p[0] === "active" ? ["done", "active", "pending"] : p), 3000);
    const t2 = setTimeout(() => setStepStates((p) => p[1] === "active" ? ["done", "done", "active"] : p), 8000);

    // Poll
    const poll = setInterval(async () => {
      try {
        const a = await getAssignment(id);
        if (a.status === "completed") { clearInterval(poll); router.push(`/assignment/${id}`); }
        else if (a.status === "failed") { clearInterval(poll); setStatus("failed"); router.push(`/assignment/${id}`); }
      } catch { /* ignore */ }
    }, 5000);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      clearInterval(poll);
      disconnectSocket();
    };
  }, [id, router, setGeneratedPaper, setStatus, setCurrentAssignment]);

  const activeStep = stepStates.findIndex((s) => s === "active");
  const progressPct = stepStates.filter((s) => s === "done").length / STEPS.length * 100;

  return (
    <AppShell title="Processing">
      <div className="proc-page">

        {/* ── Orb ── */}
        <div className={`proc-orb ${failed ? "proc-orb--failed" : ""}`}>
          {failed ? (
            <svg width="36" height="36" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="36" height="36" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </div>

        {/* ── Heading ── */}
        <h2 className="proc-heading">
          {failed
            ? "Generation Failed"
            : activeStep >= 0
            ? STEPS[activeStep]!.label + "…"
            : "Almost ready!"}
        </h2>
        <p className="proc-sub">
          {failed ? failMsg : "This usually takes 10–20 seconds"}
        </p>

        {/* ── Progress bar ── */}
        <div className="proc-bar-track">
          <div className="proc-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* ── Steps list ── */}
        <ul className="proc-steps">
          {STEPS.map((step, i) => {
            const state = stepStates[i]!;
            return (
              <li key={i} className={`proc-step proc-step--${state}`}>
                <div className="proc-step-icon">
                  {state === "done" ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : state === "active" ? (
                    <span className="proc-step-spinner" />
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af" }}>{i + 1}</span>
                  )}
                </div>
                <div className="proc-step-text">
                  <span className="proc-step-label">{step.label}</span>
                  <span className="proc-step-desc">{step.desc}</span>
                </div>
              </li>
            );
          })}
        </ul>

      </div>
    </AppShell>
  );
}

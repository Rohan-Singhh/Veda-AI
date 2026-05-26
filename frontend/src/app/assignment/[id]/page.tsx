"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import QuestionPaperView from "@/components/QuestionPaperView";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import {
  getAssignment,
  getQuestionPaper,
  regeneratePaper,
  generatePdfToBackend,
  PaperData,
} from "@/services/api";

interface AssignmentPageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentPage({ params }: AssignmentPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { generatedPaper, setGeneratedPaper, setCurrentAssignment } =
    useAssignmentStore();

  const [paper, setPaper] = useState<PaperData | null>(generatedPaper);
  const [loading, setLoading] = useState(!generatedPaper);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (paper) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        const assignment = await getAssignment(id);
        setCurrentAssignment(assignment);

        if (assignment.status === "processing" || assignment.status === "pending") {
          router.push(`/assignment/${id}/processing`);
          return;
        }
        if (assignment.status === "failed") {
          setError(assignment.errorMessage || "Generation failed. Please try again.");
          setLoading(false);
          return;
        }

        const paperData = await getQuestionPaper(id);
        setPaper(paperData);
        setGeneratedPaper(paperData);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load question paper.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, paper, router, setCurrentAssignment, setGeneratedPaper]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regeneratePaper(id);
      setGeneratedPaper(null);
      router.push(`/assignment/${id}/processing`);
    } catch {
      setError("Failed to regenerate. Please try again.");
      setIsRegenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const result = await generatePdfToBackend(id);
      if (!result.url) {
        const poll = setInterval(async () => {
          try {
            const res = await generatePdfToBackend(id);
            if (res.url) {
              clearInterval(poll);
              setIsGeneratingPdf(false);
              window.open(`http://localhost:5000${res.url}`, "_blank");
            }
          } catch {
            clearInterval(poll);
            setIsGeneratingPdf(false);
          }
        }, 2000);
      } else {
        setIsGeneratingPdf(false);
        window.open(`http://localhost:5000${result.url}`, "_blank");
      }
    } catch {
      setIsGeneratingPdf(false);
      window.print();
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <AppShell title="Loading...">
        <div className="ap-center-screen">
          <span
            className="spinner"
            style={{ width: 36, height: 36, borderColor: "#e5e7eb", borderTopColor: "#e8612d" }}
          />
          <p style={{ marginTop: 16, fontSize: 14, color: "#6b7280" }}>Loading paper…</p>
        </div>
      </AppShell>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <AppShell title="Error">
        <div className="ap-center-screen">
          <div className="ap-error-icon">
            <svg width="28" height="28" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "12px 0 6px" }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 400, textAlign: "center", marginBottom: 20 }}>{error}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/" className="btn-outline">← New Assessment</Link>
            <button onClick={handleRegenerate} className="btn-solid" disabled={isRegenerating}>
              {isRegenerating && <span className="spinner" style={{ width: 14, height: 14 }} />}
              🔄 Try Again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!paper) return null;

  /* ── Main View ── */
  return (
    <AppShell title="Generated Paper">
      <div className="ap-page">

        {/* ── Top action bar ── */}
        <div className="ap-topbar no-print">
          <div className="ap-topbar-left">
            <div className="ap-topbar-dot" />
            <div>
              <h1 className="ap-page-title">Generated Paper</h1>
              <p className="ap-page-sub">{paper.subject} — {paper.topic}</p>
            </div>
          </div>

          <div className="ap-topbar-actions">
            <Link href="/" className="btn-outline">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </Link>

            <button
              onClick={handleRegenerate}
              className="btn-outline"
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <span className="spinner" style={{ width: 14, height: 14, borderColor: "#d1d5db", borderTopColor: "#6b7280" }} />
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Regenerate
            </button>

            <button
              onClick={handleDownloadPDF}
              className="btn-solid"
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <span className="spinner" style={{ width: 14, height: 14 }} />
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Download PDF
            </button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="ap-stats no-print">
          <div className="ap-stat-chip">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {paper.duration}
          </div>
          <div className="ap-stat-chip">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            {paper.totalMarks} marks
          </div>
          <div className="ap-stat-chip">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {paper.sections.reduce((s, sec) => s + sec.questions.length, 0)} questions
          </div>
          <div className="ap-stat-chip">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {paper.sections.length} sections
          </div>
        </div>

        {/* ── Question Paper ── */}
        <div className="ap-paper-wrapper">
          <QuestionPaperView paper={paper} />
        </div>

        {/* ── Footer ── */}
        <div className="ap-footer no-print">
          <Link href="/" className="btn-outline">← Create another assessment</Link>
          <button onClick={handleDownloadPDF} className="btn-solid" disabled={isGeneratingPdf}>
            {isGeneratingPdf ? (
              <span className="spinner" style={{ width: 14, height: 14 }} />
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Download PDF
          </button>
        </div>

      </div>
    </AppShell>
  );
}

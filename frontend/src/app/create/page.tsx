"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { createAssignment } from "@/services/api";
import { QUESTION_TYPE_OPTIONS, QUESTION_TYPE_TO_API } from "@/constants/assignment";
import {
  createDefaultQuestionRows,
  createQuestionRow,
  QuestionRow,
} from "@/lib/questionRows";
import { AssignmentDifficulty } from "@/types/assignment";

interface SpeechRecognitionResultLike {
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  results: Iterable<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export default function CreatePage() {
  const router = useRouter();
  const { setCurrentAssignment, setStatus } = useAssignmentStore();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 state
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>(createDefaultQuestionRows);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Step 2 state
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<AssignmentDifficulty>("mixed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sub = params.get("subject");
    const top = params.get("topic");
    window.requestAnimationFrame(() => {
      if (sub) setSubject(sub);
      if (top) setTopic(top);
    });
  }, []);

  // ── File upload helpers ──────────────────────────────────────
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"].includes(f.type)
    );
    setUploadedFiles((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Question row helpers ─────────────────────────────────────
  const updateRow = (id: string, patch: Partial<QuestionRow>) => {
    setQuestionRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const removeRow = (id: string) => {
    setQuestionRows((prev) => prev.filter((r) => r.id !== id));
  };

  const addRow = () => {
    setQuestionRows((prev) => [
      ...prev,
      { ...createQuestionRow("Multiple Choice Questions"), count: 4, marks: 1 },
    ]);
  };

  const totalQuestions = questionRows.reduce((s, r) => s + r.count, 0);
  const totalMarks = questionRows.reduce((s, r) => s + r.count * r.marks, 0);

  // ── Voice input ──────────────────────────────────────────────
  const toggleVoice = () => {
    const SpeechRecognition =
      (window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }).SpeechRecognition ||
      (window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setAdditionalInfo((prev) => (prev ? prev + " " + transcript : transcript));
    };
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleNext = () => {
    if (questionRows.length === 0) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !topic.trim() || !dueDate) {
      setSubmitError("Subject, Topic, and Due Date are required.");
      return;
    }
    setSubmitError("");
    setIsSubmitting(true);
    setStatus("submitting");

    const questionTypes = [
      ...new Set(questionRows.map((r) => QUESTION_TYPE_TO_API[r.type] || "short_answer")),
    ];

    // Read uploaded file text if any
    let uploadedFileText = "";
    for (const file of uploadedFiles) {
      if (file.type === "text/plain") {
        uploadedFileText += await file.text();
      }
    }

    try {
      const assignment = await createAssignment({
        subject,
        topic,
        dueDate,
        questionTypes,
        numberOfQuestions: totalQuestions,
        totalMarks,
        difficulty,
        additionalInstructions: additionalInfo || undefined,
        uploadedFileText: uploadedFileText || undefined,
      });
      setCurrentAssignment(assignment);
      setStatus("processing");
      router.push(`/assignment/${assignment._id}/processing`);
    } catch (err: unknown) {
      console.error("Submission error:", err);
      setStatus("failed");
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <AppShell title="Create Assignment">
      <div className="ca-page">
        {/* Header */}
        <div className="ca-header">
          <div className="ca-header-dot" />
          <div>
            <h1 className="ca-title">Create Assignment</h1>
            <p className="ca-subtitle">Set up a new assignment for your students</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="ca-stepper">
          <div className={`ca-step-bar ${step >= 1 ? "active" : ""}`} />
          <div className={`ca-step-bar ${step >= 2 ? "active" : ""}`} />
        </div>

        {/* ── STEP 1 ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="ca-card">
            <div className="ca-section-label">Assignment Details</div>
            <p className="ca-section-sub">Basic information about your assignment</p>

            {/* File Upload */}
            <div
              className={`ca-upload-zone ${dragOver ? "ca-upload-zone--drag" : ""} ${uploadedFiles.length > 0 ? "ca-upload-zone--has-files" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt"
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
              />
              {uploadedFiles.length === 0 ? (
                <>
                  <div className="ca-upload-icon">
                    <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="ca-upload-text">Choose a file or drag & drop it here</p>
                  <p className="ca-upload-sub">JPEG, PNG, upto 10MB</p>
                  <button type="button" className="ca-browse-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    Browse Files
                  </button>
                </>
              ) : (
                <div className="ca-file-chips" onClick={(e) => e.stopPropagation()}>
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="ca-file-chip">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{f.name}</span>
                      <button type="button" className="ca-file-chip-remove" onClick={() => removeFile(i)}>×</button>
                    </div>
                  ))}
                  <button type="button" className="ca-browse-btn" onClick={() => fileInputRef.current?.click()}>
                    Add More
                  </button>
                </div>
              )}
            </div>
            <p className="ca-upload-caption">Upload images of your preferred document/image</p>

            {/* Due Date */}
            <div className="ca-field-group">
              <label className="ca-label">Due Date</label>
              <div className="ca-date-wrapper">
                <input
                  type="date"
                  className="ca-date-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="DD-MM-YYYY"
                />
                <div className="ca-date-icon">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeWidth={1.5} d="M16 2v4M8 2v4M3 10h18" />
                    <path strokeLinecap="round" strokeWidth={2} d="M12 14h.01M8 14h.01M16 14h.01M12 18h.01M8 18h.01M16 18h.01" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Question Types Table */}
            <div className="ca-qt-section">
              <div className="ca-qt-header">
                <span className="ca-qt-col-type">Question Type</span>
                <span className="ca-qt-col-num">No. of Questions</span>
                <span className="ca-qt-col-marks">Marks</span>
              </div>

              {questionRows.map((row) => (
                <div key={row.id} className="ca-qt-row">
                  {/* Type dropdown */}
                  <div className="ca-qt-type-wrapper">
                    <div className="ca-qt-type-select" onClick={() => updateRow(row.id, { showDropdown: !row.showDropdown })}>
                      <span>{row.type}</span>
                      <div className="ca-qt-type-actions">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <button
                          type="button"
                          className="ca-qt-remove"
                          onClick={(e) => { e.stopPropagation(); removeRow(row.id); }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {row.showDropdown && (
                      <div className="ca-qt-dropdown">
                        {QUESTION_TYPE_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`ca-qt-dropdown-item ${row.type === opt ? "active" : ""}`}
                            onClick={() => updateRow(row.id, { type: opt, showDropdown: false })}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Count stepper */}
                  <div className="ca-stepper-ctrl">
                    <button type="button" className="ca-stepper-btn" onClick={() => updateRow(row.id, { count: Math.max(1, row.count - 1) })}>−</button>
                    <span className="ca-stepper-val">{row.count}</span>
                    <button type="button" className="ca-stepper-btn" onClick={() => updateRow(row.id, { count: row.count + 1 })}>+</button>
                  </div>

                  {/* Marks stepper */}
                  <div className="ca-stepper-ctrl">
                    <button type="button" className="ca-stepper-btn" onClick={() => updateRow(row.id, { marks: Math.max(1, row.marks - 1) })}>−</button>
                    <span className="ca-stepper-val">{row.marks}</span>
                    <button type="button" className="ca-stepper-btn" onClick={() => updateRow(row.id, { marks: row.marks + 1 })}>+</button>
                  </div>
                </div>
              ))}

              {/* Add Question Type */}
              <button type="button" className="ca-add-qt-btn" onClick={addRow}>
                <span className="ca-add-qt-icon">+</span>
                Add Question Type
              </button>

              {/* Totals */}
              <div className="ca-totals">
                <span>Total Questions : <strong>{totalQuestions}</strong></span>
                <span>Total Marks : <strong>{totalMarks}</strong></span>
              </div>
            </div>

            {/* Additional Information */}
            <div className="ca-field-group">
              <label className="ca-label">Additional Information <span className="ca-label-hint">(For better output)</span></label>
              <div className="ca-textarea-wrapper">
                <textarea
                  className="ca-textarea"
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                />
                <button
                  type="button"
                  className={`ca-mic-btn ${isListening ? "ca-mic-btn--active" : ""}`}
                  onClick={toggleVoice}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1a4 4 0 014 4v7a4 4 0 01-8 0V5a4 4 0 014-4zm0 2a2 2 0 00-2 2v7a2 2 0 004 0V5a2 2 0 00-2-2z"/>
                    <path d="M19 12a7 7 0 01-14 0H3a9 9 0 008 8.94V23h2v-2.06A9 9 0 0021 12h-2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="ca-card">
            <div className="ca-section-label">Assignment Information</div>
            <p className="ca-section-sub">Subject and topic details for your assignment</p>

            <div className="ca-form-grid">
              <div className="ca-field-group">
                <label className="ca-label">Subject</label>
                <input
                  type="text"
                  className="ca-input"
                  placeholder="e.g., Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="ca-field-group">
                <label className="ca-label">Topic</label>
                <input
                  type="text"
                  className="ca-input"
                  placeholder="e.g., Calculus — Integration"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>

            <div className="ca-field-group" style={{ marginTop: 16 }}>
              <label className="ca-label">Difficulty Level</label>
              <div className="ca-difficulty-grid">
                {(["easy", "medium", "hard", "mixed"] as AssignmentDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`ca-difficulty-btn ${difficulty === d ? "active" : ""}`}
                    onClick={() => setDifficulty(d)}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="ca-summary">
              <div className="ca-summary-row">
                <span>Total Questions</span>
                <strong>{totalQuestions}</strong>
              </div>
              <div className="ca-summary-row">
                <span>Total Marks</span>
                <strong>{totalMarks}</strong>
              </div>
              <div className="ca-summary-row">
                <span>Question Types</span>
                <strong>{questionRows.length}</strong>
              </div>
              {dueDate && (
                <div className="ca-summary-row">
                  <span>Due Date</span>
                  <strong>{dueDate}</strong>
                </div>
              )}
            </div>

            {submitError && <p className="ca-error">{submitError}</p>}
          </div>
        )}

        {/* Footer nav */}
        <div className="ca-footer">
          <button
            type="button"
            className="ca-prev-btn"
            onClick={() => { if (step === 1) router.push("/"); else setStep(1); }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Previous
          </button>

          {step === 1 ? (
            <button
              type="button"
              className="ca-next-btn"
              onClick={handleNext}
              disabled={questionRows.length === 0}
            >
              Next
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="ca-next-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                  Generating...
                </>
              ) : (
                <>
                  ✨ Generate
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

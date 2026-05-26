"use client";

import React from "react";
import { PaperData } from "../services/api";

interface Props {
  paper: PaperData;
}

const DIFF_LABEL: Record<string, string> = { easy: "Easy", medium: "Moderate", hard: "Challenging" };
const DIFF_CLASS: Record<string, string> = { easy: "badge-easy", medium: "badge-medium", hard: "badge-hard" };

export default function QuestionPaperView({ paper }: Props) {
  return (
    <div id="question-paper" className="qpv-root">

      {/* ══ Page 1: Header block ══════════════════════════════════ */}
      <div className="qpv-header-block">
        {/* School / title */}
        <div className="qpv-school-name">{paper.title}</div>
        <div className="qpv-subject-row">Subject: {paper.subject}</div>
        {paper.topic && <div className="qpv-class-row">{paper.topic}</div>}

        {/* Time / Marks row */}
        <div className="qpv-timemark-row">
          <span>Time Allowed: <strong>{paper.duration}</strong></span>
          <span>Maximum Marks: <strong>{paper.totalMarks}</strong></span>
        </div>

        {/* Divider */}
        <div className="qpv-rule" />

        {/* General instructions */}
        <p className="qpv-instruction">All questions are compulsory unless stated otherwise.</p>

        {/* Student fields */}
        <div className="qpv-student-fields">
          <div className="qpv-student-field">
            <span>Name:</span>
            <span className="qpv-field-line" />
          </div>
          <div className="qpv-student-field">
            <span>Roll Number:</span>
            <span className="qpv-field-line" />
          </div>
          <div className="qpv-student-field">
            <span>Class &amp; Section:</span>
            <span className="qpv-field-line" />
          </div>
        </div>
      </div>

      {/* ══ Sections ══════════════════════════════════════════════ */}
      {paper.sections.map((section, sIdx) => (
        <div key={sIdx} className="qpv-section">
          {/* Section heading */}
          <div className="qpv-section-heading">{section.title}</div>
          <div className="qpv-section-instruction">{section.instruction}</div>

          {/* Questions */}
          <ol className="qpv-question-list">
            {section.questions.map((q, qIdx) => (
              <li key={qIdx} className="qpv-question">
                <div className="qpv-question-row">
                  {/* Difficulty inline badge */}
                  <span className={`qpv-diff-tag qpv-diff-${q.difficulty}`}>
                    {DIFF_LABEL[q.difficulty] ?? q.difficulty}
                  </span>
                  {/* Question text */}
                  <span className="qpv-question-text">{q.text}</span>
                  {/* Marks */}
                  <span className="qpv-marks-tag">[{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]</span>
                </div>

                {/* MCQ options */}
                {q.options && q.options.length > 0 && (
                  <div className="qpv-options">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="qpv-option">
                        <span className="qpv-option-letter">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}

      {/* ══ End of paper ══════════════════════════════════════════ */}
      <div className="qpv-end">— End of Question Paper —</div>

    </div>
  );
}

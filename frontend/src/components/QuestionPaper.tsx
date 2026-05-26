"use client";

import React from "react";
import Badge from "./ui/Badge";
import { PaperData } from "@/types/assignment";

interface QuestionPaperProps {
  paper: PaperData;
}

export default function QuestionPaper({ paper }: QuestionPaperProps) {
  return (
    <div id="question-paper" className="max-w-4xl mx-auto">
      {/* Paper Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {paper.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {paper.subject}
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Duration: {paper.duration}
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Total Marks: {paper.totalMarks}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-white/10" />

        {/* Student Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 uppercase tracking-wider">
              Student Name
            </label>
            <div className="border-b border-white/20 pb-1 text-white text-sm min-h-[24px]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 uppercase tracking-wider">
              Roll Number
            </label>
            <div className="border-b border-white/20 pb-1 text-white text-sm min-h-[24px]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 uppercase tracking-wider">
              Section
            </label>
            <div className="border-b border-white/20 pb-1 text-white text-sm min-h-[24px]" />
          </div>
        </div>
      </div>

      {/* Question Sections */}
      {paper.sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 mb-6 transition-all duration-300 hover:border-white/15"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h2 className="text-lg font-bold text-white">{section.title}</h2>
            <p className="text-sm text-slate-400 italic">
              {section.instruction}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {section.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="group relative pl-4 border-l-2 border-white/10 hover:border-violet-500/50 transition-colors duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <span className="text-violet-400 font-bold text-sm mt-0.5 shrink-0">
                        Q{question.questionNumber}.
                      </span>
                      <p className="text-white text-sm sm:text-base leading-relaxed">
                        {question.text}
                      </p>
                    </div>

                    {/* MCQ Options */}
                    {question.options && question.options.length > 0 && (
                      <div className="mt-3 ml-8 space-y-2">
                        {question.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="flex items-center gap-2 text-sm text-slate-300"
                          >
                            <div className="w-5 h-5 rounded-full border border-white/20 shrink-0" />
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Marks & Difficulty */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-8 sm:ml-0">
                    <Badge difficulty={question.difficulty} />
                    <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      {question.marks} {question.marks === 1 ? "mark" : "marks"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

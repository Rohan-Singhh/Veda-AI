"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { QUESTION_TYPE_LABEL } from "@/constants/assignment";
import { getAssignments } from "@/services/api";
import { AssignmentListItem } from "@/types/assignment";

interface RubricItem {
  criteria: string;
  descriptions: string[];
}

interface LessonTimelineItem {
  time: string;
  activity: string;
  desc: string;
}

interface LessonPlan {
  title: string;
  grade: string;
  duration: string;
  objectives: string[];
  materials: string[];
  timeline: LessonTimelineItem[];
}

export default function ToolkitPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "rubric" | "lesson" | "analytics">("directory");
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Rubric Builder Form State
  const [rubricTask, setRubricTask] = useState("");
  const [rubricScale, setRubricScale] = useState("4");
  const [rubricCriteria, setRubricCriteria] = useState("Content Accuracy, Organization, Mechanics");
  const [generatedRubric, setGeneratedRubric] = useState<RubricItem[] | null>(null);
  const [generatingRubric, setGeneratingRubric] = useState(false);

  // Lesson Plan Form State
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonGrade, setLessonGrade] = useState("Grade 9");
  const [lessonDuration, setLessonDuration] = useState("45 Minutes");
  const [generatedLesson, setGeneratedLesson] = useState<LessonPlan | null>(null);
  const [generatingLesson, setGeneratingLesson] = useState(false);

  useEffect(() => {
    if (activeTab === "analytics" && assignments.length === 0) {
      const fetch_ = async () => {
        try {
          setAssignments(await getAssignments());
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingAnalytics(false);
        }
      };
      fetch_();
    }
  }, [activeTab, assignments.length]);

  const handleGenerateRubric = () => {
    if (!rubricTask.trim()) return alert("Please specify the assignment task!");
    setGeneratingRubric(true);
    setGeneratedRubric(null);

    // Simulate AI Generation with top-tier output
    setTimeout(() => {
      const criteriaList = rubricCriteria.split(",").map(c => c.trim()).filter(Boolean);
      const scaleNum = parseInt(rubricScale) || 4;

      const levels: Record<number, string[]> = {
        3: ["Excellent (3 pts)", "Satisfactory (2 pts)", "Needs Improvement (1 pt)"],
        4: ["Exemplary (4 pts)", "Proficient (3 pts)", "Developing (2 pts)", "Beginning (1 pt)"],
        5: ["Outstanding (5 pts)", "High Quality (4 pts)", "Satisfactory (3 pts)", "Emerging (2 pts)", "Unsatisfactory (1 pt)"]
      };

      const levelNames = levels[scaleNum] || levels[4];

      const rubrics = criteriaList.map(criteria => {
        return {
          criteria,
          descriptions: levelNames.map((level, idx) => {
            if (idx === 0) return `Demonstrates master-level knowledge, error-free execution, and sophisticated application of ${criteria.toLowerCase()}.`;
            if (idx === 1) return `Shows clear competency and solid understanding with minor errors in ${criteria.toLowerCase()}.`;
            if (idx === 2 && scaleNum > 3) return `Shows partial capability; structural components of ${criteria.toLowerCase()} are present but incomplete.`;
            return `Demonstrates minimal effort, severe errors, or complete lack of comprehension regarding ${criteria.toLowerCase()}.`;
          })
        };
      });

      setGeneratedRubric(rubrics);
      setGeneratingRubric(false);
    }, 1500);
  };

  const handleGenerateLesson = () => {
    if (!lessonTopic.trim()) return alert("Please enter a lesson topic!");
    setGeneratingLesson(true);
    setGeneratedLesson(null);

    // Simulate AI Generation with structured response
    setTimeout(() => {
      setGeneratedLesson({
        title: lessonTopic,
        grade: lessonGrade,
        duration: lessonDuration,
        objectives: [
          `Students will understand the core concepts of ${lessonTopic}.`,
          `Students will be able to explain the real-world application of ${lessonTopic}.`,
          `Students will collaborate to solve problems relating to ${lessonTopic}.`
        ],
        materials: ["Projector/Smart Board", "Interactive Student worksheets", "Topic Handout"],
        timeline: [
          { time: "0-10 min", activity: "Starter / Hook", desc: `Introduce ${lessonTopic} with an engaging open-ended question. Survey students' prior knowledge.` },
          { time: "10-25 min", activity: "Direct Instruction", desc: `Explain the fundamental rules and mechanisms of ${lessonTopic}. Use visual aids.` },
          { time: "25-40 min", activity: "Guided Activity", desc: "Break students into pairs to complete active-learning scenarios and problems." },
          { time: "40-45 min", activity: "Exit Ticket & Wrap", desc: "Have students write down one key takeaway on a post-it note as they leave." }
        ]
      });
      setGeneratingLesson(false);
    }, 1500);
  };

  // Compute analytics
  const totalAssignments = assignments.length;
  const totalQuestions = assignments.reduce((acc, a) => acc + (a.numberOfQuestions || 0), 0);
  const avgQuestions = totalAssignments > 0 ? (totalQuestions / totalAssignments).toFixed(1) : 0;
  
  // Count difficulty distribution
  const difficultyCounts = assignments.reduce((acc, a) => {
    const d = a.difficulty || "mixed";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppShell title="AI Teacher's Toolkit">
      <div className="toolkit-page" style={{ padding: "30px 40px" }}>
        
        {/* Header */}
        <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 20, marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 6 }}>AI Teacher&apos;s Toolkit</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Access intelligent widgets to automate curriculum mapping, rubric construction, and lesson planning.</p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
          <button
            onClick={() => setActiveTab("directory")}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              border: activeTab === "directory" ? "1px solid #e8612d" : "1px solid #e5e7eb",
              background: activeTab === "directory" ? "#fff3ed" : "white",
              color: activeTab === "directory" ? "#e8612d" : "#4b5563",
              transition: "all 0.2s"
            }}
          >
            🗂️ Tool Directory
          </button>
          <button
            onClick={() => setActiveTab("rubric")}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              border: activeTab === "rubric" ? "1px solid #e8612d" : "1px solid #e5e7eb",
              background: activeTab === "rubric" ? "#fff3ed" : "white",
              color: activeTab === "rubric" ? "#e8612d" : "#4b5563",
              transition: "all 0.2s"
            }}
          >
            📐 Interactive Rubric Builder
          </button>
          <button
            onClick={() => setActiveTab("lesson")}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              border: activeTab === "lesson" ? "1px solid #e8612d" : "1px solid #e5e7eb",
              background: activeTab === "lesson" ? "#fff3ed" : "white",
              color: activeTab === "lesson" ? "#e8612d" : "#4b5563",
              transition: "all 0.2s"
            }}
          >
            📋 Lesson Plan Creator
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              border: activeTab === "analytics" ? "1px solid #e8612d" : "1px solid #e5e7eb",
              background: activeTab === "analytics" ? "#fff3ed" : "white",
              color: activeTab === "analytics" ? "#e8612d" : "#4b5563",
              transition: "all 0.2s"
            }}
          >
            📊 Assessment Analytics
          </button>
        </div>

        {/* Tab 1: Tool Directory */}
        {activeTab === "directory" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            
            {/* Tool 1 */}
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 12 }}>📝</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>AI Assessment Creator</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginBottom: 16 }}>
                  Generate complete structured exams, midterms, or practice quizzes from simple inputs or file uploads (PDF/Images).
                </p>
              </div>
              <Link href="/create" style={{ display: "block", textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 600, background: "#1a1a1a", color: "white", padding: "10px", borderRadius: 8 }}>
                Launch Tool
              </Link>
            </div>

            {/* Tool 2 */}
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 12 }}>📐</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Interactive Rubric Builder</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginBottom: 16 }}>
                  Build custom grading criteria tables aligned with your target task parameters. Fully editable cell values.
                </p>
              </div>
              <button onClick={() => setActiveTab("rubric")} style={{ border: "none", display: "block", textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 600, background: "#f3f4f6", color: "#1a1a1a", padding: "10px", borderRadius: 8, cursor: "pointer" }}>
                Open Tool
              </button>
            </div>

            {/* Tool 3 */}
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 12 }}>📋</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Lesson Plan Creator</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginBottom: 16 }}>
                  Construct complete lecture flowcharts, objectives, timeline breakdowns, and exit tickets in seconds.
                </p>
              </div>
              <button onClick={() => setActiveTab("lesson")} style={{ border: "none", display: "block", textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 600, background: "#f3f4f6", color: "#1a1a1a", padding: "10px", borderRadius: 8, cursor: "pointer" }}>
                Open Tool
              </button>
            </div>

            {/* Tool 4 */}
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 12 }}>📊</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Assessment Analytics</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginBottom: 16 }}>
                  Review metrics gathered from generated tests, analyzing difficulty counts, average scores, and marks distribution.
                </p>
              </div>
              <button onClick={() => setActiveTab("analytics")} style={{ border: "none", display: "block", textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 600, background: "#f3f4f6", color: "#1a1a1a", padding: "10px", borderRadius: 8, cursor: "pointer" }}>
                Launch Dashboard
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Interactive Rubric Builder */}
        {activeTab === "rubric" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30, alignItems: "flex-start" }}>
            
            {/* Form controls */}
            <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Build Rubric</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 6 }}>Assignment / Task Name</label>
                  <input
                    type="text"
                    value={rubricTask}
                    onChange={(e) => setRubricTask(e.target.value)}
                    placeholder="e.g. Photosynthesis lab report"
                    style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 6 }}>Grading Scale (Points)</label>
                  <select
                    value={rubricScale}
                    onChange={(e) => setRubricScale(e.target.value)}
                    style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                  >
                    <option value="3">3-point scale</option>
                    <option value="4">4-point scale</option>
                    <option value="5">5-point scale</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 6 }}>Assessment Criteria (Comma separated)</label>
                  <textarea
                    rows={3}
                    value={rubricCriteria}
                    onChange={(e) => setRubricCriteria(e.target.value)}
                    placeholder="e.g. Accuracy, Spelling, Data Presentation"
                    style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, fontFamily: "inherit" }}
                  />
                </div>
                <button
                  onClick={handleGenerateRubric}
                  disabled={generatingRubric}
                  style={{
                    background: "linear-gradient(135deg, #e8612d, #d4540f)",
                    color: "white",
                    border: "none",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(232, 97, 45, 0.15)"
                  }}
                >
                  {generatingRubric ? "Constructing Rubric..." : "Generate Rubric Grid"}
                </button>
              </div>
            </div>

            {/* Display container */}
            <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", minHeight: 380, display: "flex", flexDirection: "column", justifyContent: generatedRubric ? "flex-start" : "center", alignItems: generatedRubric ? "stretch" : "center" }}>
              {generatingRubric ? (
                <div style={{ textAlign: "center" }}>
                  <span className="spinner" style={{ width: 32, height: 32, borderColor: "#e5e7eb", borderTopColor: "#e8612d", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 13, color: "#6b7280" }}>AI laying out grading grid cell values...</p>
                </div>
              ) : generatedRubric ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{rubricTask} Rubric</h3>
                      <p style={{ fontSize: 12, color: "#6b7280" }}>Interactive grading metrics scale. Double click cells to customize descriptions.</p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      style={{ background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      🖨️ Print Rubric
                    </button>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, border: "1px solid #e5e7eb" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          <th style={{ padding: 12, border: "1px solid #e5e7eb", textAlign: "left", width: 140 }}>Criteria</th>
                          {Array.from({ length: parseInt(rubricScale) || 4 }).map((_, idx) => (
                            <th key={idx} style={{ padding: 12, border: "1px solid #e5e7eb", textAlign: "left" }}>
                              Level {parseInt(rubricScale) - idx}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {generatedRubric.map((item, criteriaIdx) => (
                          <tr key={criteriaIdx}>
                            <td style={{ padding: 12, border: "1px solid #e5e7eb", fontWeight: 700, background: "#f9fafb" }}>
                              {item.criteria}
                            </td>
                            {item.descriptions.map((desc: string, descIdx: number) => (
                              <td
                                key={descIdx}
                                contentEditable
                                suppressContentEditableWarning
                                style={{ padding: 12, border: "1px solid #e5e7eb", color: "#4b5563", lineHeight: 1.4, outlineColor: "#e8612d" }}
                              >
                                {desc}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#9ca3af" }}>
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: "0 auto 12px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <p style={{ fontSize: 13 }}>Fill details on the left and click &quot;Generate Rubric Grid&quot;.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 3: Lesson Plan Creator */}
        {activeTab === "lesson" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30, alignItems: "flex-start" }}>
            
            {/* Form controls */}
            <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Construct Lesson Plan</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 6 }}>Topic or Concept</label>
                  <input
                    type="text"
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                    placeholder="e.g. Mitosis Cell Division"
                    style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 6 }}>Target Grade</label>
                    <select
                      value={lessonGrade}
                      onChange={(e) => setLessonGrade(e.target.value)}
                      style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                    >
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 6 }}>Duration</label>
                    <select
                      value={lessonDuration}
                      onChange={(e) => setLessonDuration(e.target.value)}
                      style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                    >
                      <option value="30 Minutes">30 mins</option>
                      <option value="45 Minutes">45 mins</option>
                      <option value="60 Minutes">60 mins</option>
                      <option value="90 Minutes">90 mins</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleGenerateLesson}
                  disabled={generatingLesson}
                  style={{
                    background: "linear-gradient(135deg, #e8612d, #d4540f)",
                    color: "white",
                    border: "none",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(232, 97, 45, 0.15)"
                  }}
                >
                  {generatingLesson ? "Laying out plan..." : "Generate Lesson Plan"}
                </button>
              </div>
            </div>

            {/* Display container */}
            <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", minHeight: 380, display: "flex", flexDirection: "column", justifyContent: generatedLesson ? "flex-start" : "center", alignItems: generatedLesson ? "stretch" : "center" }}>
              {generatingLesson ? (
                <div style={{ textAlign: "center" }}>
                  <span className="spinner" style={{ width: 32, height: 32, borderColor: "#e5e7eb", borderTopColor: "#e8612d", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 13, color: "#6b7280" }}>Mapping learning timelines and resources...</p>
                </div>
              ) : generatedLesson ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: 16, marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Lesson Plan: {generatedLesson.title}</h3>
                      <p style={{ fontSize: 12, color: "#6b7280" }}>Aligned for {generatedLesson.grade} • {generatedLesson.duration}</p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      style={{ background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      🖨️ Print Plan
                    </button>
                  </div>

                  {/* Objectives */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Learning Objectives</h4>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>
                      {generatedLesson.objectives.map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Materials */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Required Materials</h4>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {generatedLesson.materials.map((mat: string, i: number) => (
                        <span key={i} style={{ fontSize: 12, background: "#f3f4f6", color: "#4b5563", padding: "4px 10px", borderRadius: 20 }}>
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Suggested Timeline</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {generatedLesson.timeline.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, background: "#f9fafb", padding: 12, borderRadius: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#e8612d", width: 70, flexShrink: 0 }}>
                            {item.time}
                          </span>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", display: "block" }}>
                              {item.activity}
                            </span>
                            <span style={{ fontSize: 12, color: "#4b5563", marginTop: 2, display: "block", lineHeight: 1.4 }}>
                              {item.desc}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#9ca3af" }}>
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: "0 auto 12px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p style={{ fontSize: 13 }}>Fill details on the left and click &quot;Generate Lesson Plan&quot;.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 4: Assessment Analytics */}
        {activeTab === "analytics" && (
          <div>
            {loadingAnalytics ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <span className="spinner" style={{ width: 32, height: 32, borderColor: "#e5e7eb", borderTopColor: "#e8612d" }} />
              </div>
            ) : totalAssignments === 0 ? (
              <div style={{ background: "white", padding: 60, borderRadius: 16, border: "1px solid #e5e7eb", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Generate some assessments first to see analytics data.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                
                {/* Stats Summary */}
                <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Database Overview</h3>
                  <div>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Total Created Exams</span>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>{totalAssignments}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Cumulative Question Count</span>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>{totalQuestions}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Avg Questions per Paper</span>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>{avgQuestions}</div>
                  </div>
                </div>

                {/* Difficulty Chart */}
                <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Difficulty Level Distribution</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {["easy", "medium", "hard", "mixed"].map((diff) => {
                      const count = difficultyCounts[diff] || 0;
                      const percentage = totalAssignments > 0 ? Math.round((count / totalAssignments) * 100) : 0;
                      
                      const colors: Record<string, string> = {
                        easy: "#10b981",
                        medium: "#3b82f6",
                        hard: "#ef4444",
                        mixed: "#8b5cf6"
                      };

                      return (
                        <div key={diff}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, textTransform: "capitalize", marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, color: "#374151" }}>{diff}</span>
                            <span style={{ color: "#6b7280" }}>{count} ({percentage}%)</span>
                          </div>
                          <div style={{ width: "100%", height: 10, background: "#f3f4f6", borderRadius: 99 }}>
                            <div style={{ width: `${percentage}%`, height: "100%", background: colors[diff], borderRadius: 99 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Question Type Breakdown */}
                <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Common Question Formats</h3>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Array.from(new Set(assignments.flatMap(a => a.questionTypes || []))).map((type, idx) => {
                      const count = assignments.filter(a => a.questionTypes?.includes(type)).length;
                      
                      return (
                        <div key={idx} style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb", flex: "1 1 120px", display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af" }}>
                            {QUESTION_TYPE_LABEL[type] || type}
                          </span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                            {count} papers
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </AppShell>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getBackendFileUrl } from "@/config/api";
import { STATUS_META } from "@/constants/assignment";
import {
  deleteAssignment,
  generatePdfToBackend,
  getAssignments,
} from "@/services/api";
import { AssignmentListItem } from "@/types/assignment";
import { formatDate } from "@/utils/date";

export default function LibraryPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setAssignments(await getAssignments());
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(null);
    if (!confirm("Are you sure you want to delete this assessment?")) return;
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch {
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    }
  };

  const handleDownloadPDF = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(id);

    try {
      const result = await generatePdfToBackend(id);
      
      if (!result.url) {
        // Poll for PDF completion
        const poll = setInterval(async () => {
          try {
            const checkResult = await generatePdfToBackend(id);
            if (checkResult.url) {
              clearInterval(poll);
              setDownloadingId(null);
              window.open(getBackendFileUrl(checkResult.url), "_blank");
            }
          } catch {
            clearInterval(poll);
            setDownloadingId(null);
          }
        }, 2000);
      } else {
        setDownloadingId(null);
        window.open(getBackendFileUrl(result.url), "_blank");
      }
    } catch {
      setDownloadingId(null);
      alert("Could not generate PDF right now. Try opening the paper first.");
    }
  };

  // Get unique subjects dynamically
  const subjects = ["All", ...Array.from(new Set(assignments.map((a) => a.subject || "Unknown")))];

  // Filter logic
  const filtered = assignments.filter((a) => {
    const matchesSearch =
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.topic.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = activeSubject === "All" || a.subject === activeSubject;
    const matchesStatus =
      activeStatus === "All" ||
      (activeStatus === "Ready" && a.status === "completed") ||
      (activeStatus === "Processing" && (a.status === "processing" || a.status === "pending")) ||
      (activeStatus === "Failed" && a.status === "failed");

    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <AppShell title="My Library">
      <div className="library-page" style={{ padding: "30px 40px" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "#111827", marginBottom: 6 }}>My Library</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>Manage your generated question papers, templates, and syllabus resources.</p>
          </div>
          <Link href="/create" className="btn-solid" style={{ background: "linear-gradient(135deg, #e8612d, #d4540f)", color: "white", padding: "10px 20px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, textDecoration: "none", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 12px rgba(232, 97, 45, 0.2)" }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate New Paper
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 30 }}>
          <div style={{ background: "white", padding: "20px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>TOTAL ASSESSMENTS</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginTop: 4 }}>{assignments.length}</div>
          </div>
          <div style={{ background: "white", padding: "20px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>READY PAPERS</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981", marginTop: 4 }}>{assignments.filter(a => a.status === "completed").length}</div>
          </div>
          <div style={{ background: "white", padding: "20px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>IN QUEUE / RUNNING</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#3b82f6", marginTop: 4 }}>{assignments.filter(a => a.status === "processing" || a.status === "pending").length}</div>
          </div>
          <div style={{ background: "white", padding: "20px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>SUBJECTS COVERED</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#8b5cf6", marginTop: 4 }}>{subjects.length - 1}</div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div style={{ background: "white", padding: 16, borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 24 }}>
          {/* Top row: search + status */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18, color: "#9ca3af" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by topic or class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", paddingLeft: 36, border: "none", outline: "none", fontSize: 14 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["All", "Ready", "Processing", "Failed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: activeStatus === status ? "1px solid #e8612d" : "1px solid #e5e7eb",
                    background: activeStatus === status ? "#fff3ed" : "transparent",
                    color: activeStatus === status ? "#e8612d" : "#4b5563",
                    transition: "all 0.2s"
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: Subjects scrolling tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  border: "none",
                  background: activeSubject === sub ? "#1a1a1a" : "#f3f4f6",
                  color: activeSubject === sub ? "white" : "#4b5563",
                  transition: "all 0.2s"
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <span className="spinner" style={{ width: 32, height: 32, borderColor: "#e5e7eb", borderTopColor: "#e8612d" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "white", padding: 60, borderRadius: 16, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, background: "#f9fafb", borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 }}>No resources found</h3>
            <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 360, margin: "0 auto" }}>
              Try adjusting your search criteria, selecting another subject tab, or create a brand new assessment.
            </p>
          </div>
        ) : (
          <div ref={menuRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filtered.map((item) => {
              const statusMeta = STATUS_META[item.status] ?? STATUS_META.pending;
              const status = { ...statusMeta, label: statusMeta.libraryLabel };
              const isCompleted = item.status === "completed";
              const isDownloader = downloadingId === item._id;

              return (
                <div
                  key={item._id}
                  onClick={() => {
                    if (isCompleted) {
                      router.push(`/assignment/${item._id}`);
                    } else if (item.status === "failed") {
                      router.push(`/assignment/${item._id}`);
                    } else {
                      router.push(`/assignment/${item._id}/processing`);
                    }
                  }}
                  style={{
                    background: "white",
                    borderRadius: 14,
                    border: "1px solid #e5e7eb",
                    padding: 20,
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 200,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.01)";
                  }}
                >
                  {/* Top row: Subject & 3-dot dropdown */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#e8612d",
                      background: "#fff3ed",
                      padding: "4px 8px",
                      borderRadius: 6
                    }}>
                      {item.subject}
                    </span>
                    
                    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === item._id ? null : item._id);
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9ca3af", padding: "0 4px" }}
                      >
                        ⋮
                      </button>
                      {menuOpen === item._id && (
                        <div style={{
                          position: "absolute",
                          right: 0,
                          top: 24,
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          zIndex: 100,
                          minWidth: 120,
                          overflow: "hidden"
                        }}>
                          <button
                            onClick={(e) => handleDelete(item._id, e)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              background: "none",
                              border: "none",
                              textAlign: "left",
                              fontSize: 13,
                              color: "#ef4444",
                              fontWeight: 500,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6
                            }}
                          >
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body: Topic details */}
                  <div style={{ flex: 1, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.3, marginBottom: 6 }}>
                      {item.topic || `${item.subject} Test`}
                    </h3>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "#6b7280" }}>
                      <span>{item.numberOfQuestions} questions</span>
                      <span>•</span>
                      <span>{item.totalMarks} marks</span>
                      <span>•</span>
                      <span style={{ textTransform: "capitalize" }}>{item.difficulty}</span>
                    </div>
                  </div>

                  {/* Bottom: status, dates + download action */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      Created {formatDate(item.createdAt)}
                    </span>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: status.bg,
                        color: status.text,
                        padding: "3px 8px",
                        borderRadius: 20
                      }}>
                        {status.label}
                      </span>
                      
                      {isCompleted && (
                        <button
                          onClick={(e) => handleDownloadPDF(item._id, e)}
                          disabled={isDownloader}
                          style={{
                            background: "#f3f4f6",
                            border: "none",
                            borderRadius: 8,
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#4b5563"
                          }}
                          title="Download PDF"
                        >
                          {isDownloader ? (
                            <span className="spinner" style={{ width: 12, height: 12 }} />
                          ) : (
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

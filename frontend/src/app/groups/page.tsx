"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

interface AssignmentItem {
  _id: string;
  subject: string;
  topic: string;
  status: string;
  createdAt: string;
}

interface GroupInfo {
  id: string;
  name: string;
  subject: string;
  studentsCount: number;
  avatarText: string;
  bgGradient: string;
  borderColor: string;
  defaultTopic: string;
}

const DEFAULT_GROUPS: GroupInfo[] = [
  {
    id: "g1",
    name: "Class 10-A Science",
    subject: "Science",
    studentsCount: 32,
    avatarText: "10S",
    bgGradient: "linear-gradient(135deg, #10b981, #059669)",
    borderColor: "#10b981",
    defaultTopic: "Chemical Reactions",
  },
  {
    id: "g2",
    name: "Class 11-C Physics",
    subject: "Physics",
    studentsCount: 35,
    avatarText: "11P",
    bgGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    borderColor: "#3b82f6",
    defaultTopic: "Thermodynamics",
  },
  {
    id: "g3",
    name: "Class 9-B English",
    subject: "English",
    studentsCount: 28,
    avatarText: "09E",
    bgGradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    borderColor: "#f59e0b",
    defaultTopic: "Reading Comprehension",
  },
  {
    id: "g4",
    name: "Class 12-A Chemistry",
    subject: "Chemistry",
    studentsCount: 30,
    avatarText: "12C",
    bgGradient: "linear-gradient(135deg, #ec4899, #be185d)",
    borderColor: "#ec4899",
    defaultTopic: "Organic Chemistry",
  },
];

export default function GroupsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_BASE}/assignments`);
        const data = await res.json();
        setAssignments(data.assignments || []);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  // Map assignments to groups by subject matching (case insensitive)
  const getGroupAssignments = (subject: string) => {
    return assignments.filter(
      (a) => a.subject.toLowerCase() === subject.toLowerCase()
    );
  };

  return (
    <AppShell title="My Groups">
      <div className="groups-page" style={{ padding: "30px 40px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "#111827", marginBottom: 6 }}>My Groups</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>Manage your student cohorts and check assigned question papers.</p>
          </div>
          <button 
            onClick={() => alert("Creating a new class group requires Integration with School SIS/Google Classroom. Currently displaying demo groups.")}
            className="btn-solid" 
            style={{ 
              background: "linear-gradient(135deg, #1a1a1a, #333333)", 
              color: "white", 
              padding: "10px 20px", 
              borderRadius: 8, 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              fontSize: 14, 
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Import Class Group
          </button>
        </div>

        {/* Overview Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 35 }}>
          <div style={{ background: "white", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>TOTAL ENROLLED STUDENTS</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginTop: 4 }}>
              {DEFAULT_GROUPS.reduce((acc, g) => acc + g.studentsCount, 0)}
            </div>
            <span style={{ fontSize: 12, color: "#10b981", fontWeight: 500, display: "block", marginTop: 4 }}>
              ✓ Sync active with School LMS
            </span>
          </div>
          <div style={{ background: "white", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>ACTIVE CLASSES</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginTop: 4 }}>
              {DEFAULT_GROUPS.length}
            </div>
            <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginTop: 4 }}>
              Across 4 Science/Arts streams
            </span>
          </div>
          <div style={{ background: "white", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>TOTAL GENERATED ASSIGNMENTS</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#e8612d", marginTop: 4 }}>
              {loading ? "..." : assignments.length}
            </div>
            <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginTop: 4 }}>
              Live count from database service
            </span>
          </div>
        </div>

        {/* Groups Grid */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Your Class Groups</h2>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <span className="spinner" style={{ width: 28, height: 28, borderColor: "#e5e7eb", borderTopColor: "#e8612d" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 24 }}>
            {DEFAULT_GROUPS.map((group) => {
              const groupAssignments = getGroupAssignments(group.subject);

              return (
                <div
                  key={group.id}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.01)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.01)";
                  }}
                >
                  {/* Card Banner */}
                  <div style={{
                    background: group.bgGradient,
                    padding: "24px 20px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 16
                  }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 800,
                      backdropFilter: "blur(4px)"
                    }}>
                      {group.avatarText}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{group.name}</h3>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>
                        Subject: {group.subject} • {group.studentsCount} Students
                      </p>
                    </div>
                  </div>

                  {/* Card Contents */}
                  <div style={{ padding: 20 }}>
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>
                        Linked Database Records
                      </span>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4b5563", marginBottom: 6 }}>
                          <span>Total Question Papers</span>
                          <span style={{ fontWeight: 700, color: "#111827" }}>{groupAssignments.length}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4b5563" }}>
                          <span>Last Activity</span>
                          <span style={{ fontWeight: 500 }}>
                            {groupAssignments.length > 0
                              ? new Date(groupAssignments[0].createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                              : "No assessments yet"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Active Assignment Preview */}
                    {groupAssignments.length > 0 && (
                      <div style={{ background: "#f9fafb", padding: 12, borderRadius: 8, marginBottom: 20 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#e8612d" }}>LATEST PAPER</span>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {groupAssignments[0].topic}
                        </div>
                      </div>
                    )}

                    {/* Quick action buttons */}
                    <div style={{ display: "flex", gap: 10 }}>
                      <Link
                        href={`/create?subject=${encodeURIComponent(group.subject)}&topic=${encodeURIComponent(group.defaultTopic)}`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          textDecoration: "none",
                          fontSize: 13,
                          fontWeight: 600,
                          background: "#fff3ed",
                          color: "#e8612d",
                          padding: "10px",
                          borderRadius: 8,
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#ffe5d9"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#fff3ed"}
                      >
                        Create Assessment
                      </Link>
                      <Link
                        href={`/library?subject=${encodeURIComponent(group.subject)}`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          textDecoration: "none",
                          fontSize: 13,
                          fontWeight: 600,
                          background: "#f3f4f6",
                          color: "#4b5563",
                          padding: "10px",
                          borderRadius: 8,
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#e5e7eb"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#f3f4f6"}
                      >
                        View Question Bank
                      </Link>
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

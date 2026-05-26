"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { deleteAssignment, getAssignments } from "@/services/api";
import { AssignmentListItem } from "@/types/assignment";
import { formatDate } from "@/utils/date";

export default function HomePage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setAssignments(await getAssignments());
      } catch { /* silently fail */ }
      finally { setLoading(false); }
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

  const handleDelete = async (id: string) => {
    setMenuOpen(null);
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch {
      // fallback to state removal if api fails
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    }
  };

  const filtered = assignments.filter(
    (a) =>
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Assignments">
      <div className="assignments-page">

        {/* ── Header ── */}
        <div className="assignments-header">
          <div className="assignments-header-left">
            <span className="assignments-status-dot" />
            <div>
              <h1 className="assignments-title">Assignments</h1>
              <p className="assignments-subtitle">Manage and create assignments for your classes.</p>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="assignments-toolbar">
          <button className="filter-btn">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter By
          </button>
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search Assignment"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="assignments-loading">
            <span className="spinner" style={{ width: 32, height: 32, borderColor: "#e5e7eb", borderTopColor: "#e8612d" }} />
          </div>

        ) : filtered.length === 0 ? (
          /* ── Empty state ── */
          <div className="empty-state">
            <div className="empty-state-illustration">
              <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="60" y="30" width="100" height="130" rx="8" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />
                <rect x="80" y="55" width="60" height="6" rx="3" fill="#374151" />
                <rect x="80" y="70" width="40" height="4" rx="2" fill="#d1d5db" />
                <rect x="80" y="82" width="50" height="4" rx="2" fill="#d1d5db" />
                <rect x="80" y="94" width="35" height="4" rx="2" fill="#d1d5db" />
                <rect x="80" y="106" width="55" height="4" rx="2" fill="#d1d5db" />
                <rect x="80" y="118" width="30" height="4" rx="2" fill="#d1d5db" />
                <circle cx="150" cy="100" r="40" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2" />
                <circle cx="150" cy="100" r="30" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
                <path d="M140 90 L160 110" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                <path d="M160 90 L140 110" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                <line x1="172" y1="122" x2="185" y2="138" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <h2>No assignments yet</h2>
            <p>Create your first AI-generated question paper. Set question types, marks, and let the AI do the rest.</p>
            <Link href="/create" className="empty-state-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Assignment
            </Link>
          </div>

        ) : (
          /* ── Assignment list ── */
          <div className="assignments-grid" ref={menuRef}>
            {filtered.map((assignment) => {
              return (
                <div
                  key={assignment._id}
                  className="assignment-card"
                  onClick={() => router.push(`/assignment/${assignment._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/assignment/${assignment._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Card Top: Title & Menu */}
                  <div className="assignment-card-top">
                    <h3 className="assignment-card-title">
                      {assignment.topic || `${assignment.subject} Assignment`}
                    </h3>

                    <div className="assignment-card-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="assignment-card-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === assignment._id ? null : assignment._id);
                        }}
                        aria-label="Options"
                      >
                        ⋮
                      </button>
                      {menuOpen === assignment._id && (
                        <div className="assignment-card-dropdown">
                          <Link
                            href={`/assignment/${assignment._id}`}
                            className="dropdown-item"
                            onClick={() => setMenuOpen(null)}
                          >
                            View Assignment
                          </Link>
                          <button
                            className="dropdown-item dropdown-delete"
                            onClick={() => handleDelete(assignment._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Assigned Date & Due Date */}
                  <div className="assignment-card-bottom">
                    <span className="assignment-card-date">
                      <strong>Assigned on</strong> : {formatDate(assignment.createdAt)}
                    </span>
                    <span className="assignment-card-date">
                      <strong>Due</strong> : {formatDate(assignment.dueDate)}
                    </span>
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

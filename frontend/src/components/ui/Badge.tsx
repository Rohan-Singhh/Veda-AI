"use client";

import React from "react";

interface BadgeProps {
  difficulty: "easy" | "medium" | "hard";
  className?: string;
}

export default function Badge({ difficulty, className = "" }: BadgeProps) {
  const styles = {
    easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    hard: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };

  const labels = {
    easy: "Easy",
    medium: "Moderate",
    hard: "Hard",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[difficulty]} ${className}`}
    >
      {labels[difficulty]}
    </span>
  );
}

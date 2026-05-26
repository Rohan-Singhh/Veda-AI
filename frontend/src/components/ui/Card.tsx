"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  className = "",
  glow = false,
  style,
}: CardProps) {
  return (
    <div
      className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${
        glow
          ? "shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-shadow duration-500"
          : ""
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

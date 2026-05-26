"use client";

import React from "react";

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  id: string;
}

export default function FormTextarea({
  label,
  error,
  id,
  className = "",
  ...props
}: FormTextareaProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
      </label>
      <textarea
        id={id}
        className={`w-full bg-white/5 border ${
          error ? "border-rose-500/50" : "border-white/10"
        } rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 resize-none ${className}`}
        rows={4}
        {...props}
      />
      {error && (
        <p className="text-rose-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

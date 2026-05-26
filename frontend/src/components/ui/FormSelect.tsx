"use client";

import React from "react";

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  id: string;
  options: { value: string; label: string }[];
}

export default function FormSelect({
  label,
  error,
  id,
  options,
  className = "",
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
      </label>
      <select
        id={id}
        className={`w-full bg-white/5 border ${
          error ? "border-rose-500/50" : "border-white/10"
        } rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-slate-800 text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-rose-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

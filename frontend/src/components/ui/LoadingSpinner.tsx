"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  steps?: { label: string; active: boolean; done: boolean }[];
}

export default function LoadingSpinner({
  message = "Generating...",
  steps,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Animated brain/AI icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 animate-pulse-glow flex items-center justify-center">
          <svg
            className="w-12 h-12 text-white animate-spin-slow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-3 rounded-full bg-violet-400" />
        </div>
        <div className="absolute inset-0 animate-spin-reverse">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-2 h-2 rounded-full bg-indigo-400" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">{message}</h3>
        <p className="text-sm text-slate-400">
          This usually takes 10-20 seconds
        </p>
      </div>

      {/* Step indicators */}
      {steps && (
        <div className="space-y-3 w-full max-w-xs">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  step.done
                    ? "bg-emerald-500 text-white"
                    : step.active
                    ? "bg-violet-500 text-white animate-pulse"
                    : "bg-white/10 text-slate-500"
                }`}
              >
                {step.done ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm transition-colors duration-300 ${
                  step.done
                    ? "text-emerald-400"
                    : step.active
                    ? "text-white"
                    : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

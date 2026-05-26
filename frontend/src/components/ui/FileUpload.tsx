"use client";

import React, { useCallback, useState } from "react";

interface FileUploadProps {
  onFileContent: (content: string) => void;
  error?: string;
}

export default function FileUpload({ onFileContent, error }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (
        file.type !== "text/plain" &&
        file.type !== "application/pdf" &&
        !file.name.endsWith(".txt")
      ) {
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileContent(text);
      };
      reader.readAsText(file);
    },
    [onFileContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">
        Upload Reference Material{" "}
        <span className="text-slate-500">(optional)</span>
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragOver
            ? "border-violet-500 bg-violet-500/10"
            : fileName
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-white/10 hover:border-white/20 bg-white/5"
        }`}
      >
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />
        {fileName ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{fileName}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="w-8 h-8 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-slate-400">
              Drag & drop a file here, or{" "}
              <span className="text-violet-400 font-medium">browse</span>
            </p>
            <p className="text-xs text-slate-500">Supports .txt and .pdf</p>
          </div>
        )}
      </div>
      {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

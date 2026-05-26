"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopBar title={title} />
        <div className="main-content">{children}</div>
      </div>
    </div>
  );
}

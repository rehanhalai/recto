"use client";

import React from "react";

type FeedLayoutProps = {
  leftSidebar: React.ReactNode;
  rightPanel: React.ReactNode;
  children: React.ReactNode;
};

export function FeedLayout({
  leftSidebar,
  rightPanel,
  children,
}: FeedLayoutProps) {
  return (
    <div className="max-w-275 mx-auto w-full px-4 lg:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[60px_1fr] lg:grid-cols-[200px_1fr_260px] gap-6">
        {/* Left Sidebar — hidden on mobile, icon-only on tablet, full on desktop */}
        <aside className="hidden md:block">{leftSidebar}</aside>

        {/* Main Feed — always visible */}
        <section className="min-w-0">{children}</section>

        {/* Right Panel — desktop only */}
        <aside className="hidden lg:block">{rightPanel}</aside>
      </div>
    </div>
  );
}

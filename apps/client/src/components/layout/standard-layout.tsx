"use client";

import React from "react";
// Left sidebar is now handled globally via AppSidebar in layout
// import { SidebarLeft } from "@/features/sidebar";

type StandardLayoutProps = {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode; // @deprecated
  rightSidebar?: React.ReactNode;
  variant?: "two-column" | "three-column"; // @deprecated
};

/**
 * StandardLayout
 * 
 * Provides a standardized responsive layout for the application.
 * - mobile: main content 
 * - desktop:
 *   - one-column: content
 *   - two-column: content + right panel (260px)
 */
export function StandardLayout({
  children,
  leftSidebar, // ignored
  rightSidebar,
  variant, // ignored
}: StandardLayoutProps) {
  const hasRightSidebar = Boolean(rightSidebar);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 lg:px-6 py-6">
      <div 
        className={`grid grid-cols-1 transition-all duration-300 gap-6 ${
          hasRightSidebar 
            ? "lg:grid-cols-[1fr_280px]" 
            : "lg:grid-cols-1"
        }`}
      >
        {/* Main Content */}
        <section className="min-w-0 w-full overflow-x-clip">
          {children}
        </section>

        {/* Right Sidebar */}
        {hasRightSidebar && (
          <aside className="hidden lg:block sticky top-6 h-[calc(100vh-3rem)] self-start overflow-y-auto invisible-scrollbar">
            {rightSidebar}
          </aside>
        )}
      </div>
    </div>
  );
}

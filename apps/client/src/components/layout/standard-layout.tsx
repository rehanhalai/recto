"use client";

import React from "react";
import { SidebarLeft } from "@/features/sidebar";

type StandardLayoutProps = {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  variant?: "two-column" | "three-column";
};

/**
 * StandardLayout
 * 
 * Provides a standardized responsive layout for the application.
 * - mobile: main content (sidebar via navigation/drawer)
 * - tablet: icons-only left sidebar
 * - desktop:
 *   - two-column: sidebar (260px) + content
 *   - three-column: sidebar (260px) + content + right panel (260px)
 */
export function StandardLayout({
  children,
  leftSidebar = <SidebarLeft />,
  rightSidebar,
  variant = rightSidebar ? "three-column" : "two-column",
}: StandardLayoutProps) {
  return (
    <div className="max-w-300 mx-auto w-full px-4 lg:px-6 py-6">
      <div 
        className={`grid grid-cols-1 md:grid-cols-[60px_1fr] transition-all duration-300 gap-6 ${
          variant === "three-column" 
            ? "lg:grid-cols-[260px_1fr_260px]" 
            : "lg:grid-cols-[260px_1fr]"
        }`}
      >
        {/* Left Sidebar */}
        <aside className="hidden md:block sticky top-6 h-[calc(100vh-3rem)] self-start overflow-y-auto invisible-scrollbar">
          {leftSidebar}
        </aside>

        {/* Main Content */}
        <section className="min-w-0 w-full overflow-x-clip">
          {children}
        </section>

        {/* Right Sidebar (variant dependent) */}
        {variant === "three-column" && (
          <aside className="hidden lg:block sticky top-6 h-[calc(100vh-3rem)] self-start overflow-y-auto invisible-scrollbar">
            {rightSidebar}
          </aside>
        )}
      </div>
    </div>
  );
}

/**
 * Toaster Provider
 * Renders the toast container - must be added to root layout
 */

"use client";

import { Toaster } from "sonner";

export const ToasterProvider = () => {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      theme="light"
    />
  );
};

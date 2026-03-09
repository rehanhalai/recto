import { WarningCircleIcon } from "@phosphor-icons/react";

interface ErrorAlertProps {
  error: string;
}

export const ErrorAlert = ({ error }: ErrorAlertProps) => (
  <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl flex items-center gap-3">
    <WarningCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
  </div>
);

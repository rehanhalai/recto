type ToastLevel = "success" | "error" | "info";

const logToast = (level: ToastLevel, message: string) => {
  if (typeof window === "undefined") {
    return;
  }

  if (level === "error") {
    console.error(`[toast:${level}] ${message}`);
    return;
  }

  console.info(`[toast:${level}] ${message}`);
};

export const toast = {
  success: (message: string) => logToast("success", message),
  error: (message: string) => logToast("error", message),
  info: (message: string) => logToast("info", message),
};

"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="rounded-full hover:bg-border-subtle dark:hover:bg-border-white transition-colors"
      >
        <SunIcon className="h-[1.4rem] w-[1.4rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative rounded-full hover:bg-border-subtle dark:hover:bg-border-white transition-colors overflow-hidden"
    >
      <div
        className={`transition-all duration-300 ${theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
      >
        <SunIcon className="h-[1.4rem] w-[1.4rem]" />
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
      >
        <MoonIcon className="h-[1.4rem] w-[1.4rem]" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-background to-slate-100 dark:from-slate-900 dark:via-background dark:to-slate-950">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

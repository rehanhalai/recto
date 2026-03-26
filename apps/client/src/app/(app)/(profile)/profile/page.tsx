"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { StandardLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";

export default function ProfileGatePage() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const { isCheckingAuth } = useCurrentUser();

  useEffect(() => {
    if (!authUser?.userName) {
      return;
    }

    router.replace(`/${authUser.userName}`);
  }, [authUser?.userName, router]);

  if (isCheckingAuth) {
    return (
      <StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
        <div className="rounded-xl border border-border-subtle bg-card-surface p-6 text-sm text-ink-muted">
          Checking your account...
        </div>
      </StandardLayout>
    );
  }

  if (authUser?.userName) {
    return (
      <StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
        <div className="rounded-xl border border-border-subtle bg-card-surface p-6 text-sm text-ink-muted">
          Opening your profile...
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
      <div className="rounded-xl border border-border-subtle bg-card-surface p-6 text-center">
        <h1 className="text-xl font-semibold text-ink">You are not signed in</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sign in to access your profile and continue browsing personalized features.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button type="button" onClick={() => router.push("/login")}>Login</Button>
        </div>
      </div>
    </StandardLayout>
  );
}

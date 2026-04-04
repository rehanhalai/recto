"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { useProfileRelations } from "../hooks/use-profile-relations";

type RelationshipOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  mode: "followers" | "following";
};

export function RelationshipOverlay({
  open,
  onOpenChange,
  username,
  mode,
}: RelationshipOverlayProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "900px",
  });

  const relationsQuery = useProfileRelations(username, mode, open);

  useEffect(() => {
    if (
      inView &&
      relationsQuery.hasNextPage &&
      !relationsQuery.isFetchingNextPage
    ) {
      relationsQuery.fetchNextPage();
    }
  }, [inView, relationsQuery]);

  const users = relationsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const title = mode === "followers" ? "Followers" : "Following";

  const listBody = (
    <div className="space-y-3">
      {relationsQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-ink-muted">No users found.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((person) => (
            <li key={`${mode}-${person.id}`}>
              <Link
                href={`/${person.userName}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-paper/60"
                onClick={() => onOpenChange(false)}
              >
                <UserAvatar
                  src={person.avatarImage}
                  fallbackName={person.fullName ?? person.userName}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {person.fullName ?? person.userName}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    @{person.userName}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {relationsQuery.hasNextPage && (
        <div ref={ref} className="pt-2">
          <Skeleton className="h-10 w-full" />
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto rounded-t-2xl border-border-subtle bg-card-surface text-ink"
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="pt-3">{listBody}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[72vh] max-w-2xl overflow-y-auto border-border-subtle bg-card-surface">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {listBody}
      </DialogContent>
    </Dialog>
  );
}

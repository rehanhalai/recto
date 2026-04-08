import Link from "next/link";
import { useUserLists } from "../hooks/use-user-lists";
import { ListCoverGrid } from "./list-cover-grid";
import { ProfileListsSkeleton } from "./profile-skeletons";

type ProfileListsTabProps = {
  userId: string | undefined;
  username: string;
};

export function ProfileListsTab({ userId, username }: ProfileListsTabProps) {
  const listsQuery = useUserLists(userId, true);

  if (listsQuery.isLoading) {
    return <ProfileListsSkeleton />;
  }

  if (listsQuery.data && listsQuery.data.length > 0) {
    return (
      <>
        {listsQuery.data.map((list) => (
          <Link
            key={list.id}
            href={`/list/${list.id}`}
            className="flex gap-4 items-start rounded-lg border border-border-subtle p-4 transition-all hover:bg-paper/60 hover:border-gold/30"
          >
            <ListCoverGrid covers={list.covers ?? []} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-ink">{list.name}</h3>
              {list.description && (
                <p className="text-sm text-ink-muted line-clamp-2">
                  {list.description}
                </p>
              )}
              <p className="text-xs text-ink-muted/60 mt-2">
                {list.book_count} book
                {list.book_count !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
      </>
    );
  }

  return <p className="text-center text-ink-muted py-8">No lists yet</p>;
}

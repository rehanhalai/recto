import { useReadingStatus } from "../hooks/use-reading-status";
import { ReadingStrip } from "./reading-strip";

type ProfileReadingTabProps = {
  userId: string | undefined;
};

export function ProfileReadingTab({ userId }: ProfileReadingTabProps) {
  const currentReadingQuery = useReadingStatus(userId, "reading", true);
  const completedReadingQuery = useReadingStatus(userId, "finished", true);

  return (
    <div className="space-y-6">
      <ReadingStrip
        title="Currently Reading"
        books={currentReadingQuery.data ?? []}
        emptyMessage="No books currently being read"
        isLoading={currentReadingQuery.isLoading}
      />
      <ReadingStrip
        title="Completed"
        books={completedReadingQuery.data ?? []}
        emptyMessage="No completed books"
        isLoading={completedReadingQuery.isLoading}
      />
    </div>
  );
}

import { StandardLayout } from "@/components/layout";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";

export default function NotificationsPage() {
  return (
    <StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
      <div className="rounded-2xl border border-border-subtle bg-card-surface px-6 py-10 text-center">
        <h1 className="text-3xl font-serif italic font-bold tracking-tight text-ink">
          Incoming soon
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Notifications are on the way.
        </p>
      </div>
    </StandardLayout>
  );
}

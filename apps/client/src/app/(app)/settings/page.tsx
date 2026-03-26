import { StandardLayout } from "@/components/layout";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";

export default function SettingsPage() {
  return (
    <StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
      <section className="rounded-xl border border-border-subtle bg-card-surface p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Profile and account settings will live here.
        </p>
      </section>
    </StandardLayout>
  );
}

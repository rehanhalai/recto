import { redirect } from "next/navigation";
import { BottomNav } from "@/features/navigation";
import { Footer } from "@/components/layout/footer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check session server-side for MVP (stubbed as true for now or a generic cookie check)
  // In a real implementation you would check a cookie or headers
  const isAuthenticated = true;

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <BottomNav />
      <Footer />
    </div>
  );
}

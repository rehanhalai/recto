import { BottomNav } from "@/features/navigation";
import { Footer } from "@/components/layout/footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <BottomNav />
      <Footer />
    </div>
  );
}

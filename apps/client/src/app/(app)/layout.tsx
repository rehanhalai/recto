import { BottomNav } from "@/features/navigation";
import { Footer } from "@/components/layout/footer";

type AppRootLayoutProps = {
  children: React.ReactNode;
};

export default function AppRootLayout({ children }: AppRootLayoutProps) {
  return (
    <div className="min-h-screen bg-paper flex flex-col overflow-x-hidden">
      <main className="flex-1 pb-20 lg:pb-0 overflow-x-hidden">{children}</main>
      <BottomNav />
      <Footer />
    </div>
  );
}

import { BottomNav, AppSidebar } from "@/features/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@recto/ui/components/sidebar";
import { Separator } from "@recto/ui/components/separator";
import { ThemeToggle } from "@/components/theme-toggle";

type AppRootLayoutProps = {
  children: React.ReactNode;
};

export default function AppRootLayout({ children }: AppRootLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 sticky top-0 bg-background z-10 border-b rounded-t-lg px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col overflow-x-clip bg-paper">
          <main className="flex-1 pb-20 lg:pb-0 overflow-x-clip">
            {children}
          </main>
        </div>
      </SidebarInset>
      <BottomNav className="md:hidden" />
    </SidebarProvider>
  );
}

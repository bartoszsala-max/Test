import { Sidebar, MobileNav } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory dark:bg-charcoal">
      <Sidebar />
      <main className="md:pl-56 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

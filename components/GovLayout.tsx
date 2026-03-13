// Shared layout wrapper for authenticated pages
import GovHeader from "@/components/GovHeader";
import NewsTicker from "@/components/NewsTicker";
import GovNavbar from "@/components/GovNavbar";
import GovFooter from "@/components/GovFooter";

export default function GovLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f7fa" }}>
      <GovHeader />
      <NewsTicker />
      <GovNavbar />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-5">
        {children}
      </main>
      <GovFooter />
    </div>
  );
}

import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="app-shell">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="px-4 sm:px-8 py-8 max-w-[1500px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

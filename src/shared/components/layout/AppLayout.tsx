import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar open={sidebarOpen} collapsed={sidebarCollapsed} onClose={() => setSidebarOpen(false)} />
      <div className={sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}>
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
        />
        <main className="atm-surface-grid mx-auto min-h-[calc(100vh-4rem)] max-w-[1600px] overflow-x-hidden px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

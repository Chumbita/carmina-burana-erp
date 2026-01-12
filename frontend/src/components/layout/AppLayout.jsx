import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex bg-red-500 h-screen">
      <Sidebar collapsed={collapsed} />

      <div className="flex flex-col flex-1">
        <Header onToggleSidebar={() => setCollapsed(!collapsed)} />

        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Outlet } from "react-router-dom"; 
import Header from "./Header";
import { AppSidebar } from "./app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"


export default function AppLayout() {

  return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
            <Header/>
                <main className="flex-1 p-4 overflow-auto">
                  <Outlet />
                </main>          
            </SidebarInset>
        </SidebarProvider>
  );
}

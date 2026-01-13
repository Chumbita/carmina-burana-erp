"use client"
import * as React from "react"
import {
  BarChart3,
  Beer,
  Boxes,
  ClipboardList,
  Home,
  Package,
  Settings,
  TrendingUp,
  Users,
  Warehouse,
  AlertCircle,
  FileText,
  Barrel,
  Box,
  LayoutDashboard
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

// Datos de navegación
const data = {
  user: {
    name: "Aldo Olivera", // Esto viene del contexto de autenticación
    email: "admin@carminaburana.com",
    avatar: "/avatars/user.jpg",
  },
  
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Producción",
      url: "#",
      icon: Beer,
      items: [
        {
          title: "Registro de Cocciones",
          url: "/produccion/cocciones/nuevo",
        },
        {
          title: "Historial de Cocciones",
          url: "/produccion/cocciones",
        },
        {
          title: "Recetas",
          url: "/produccion/recetas",
        },
      ],
    },
    {
      title: "Inventario",
      url: "#",
      icon: Box,
      items: [
        {
          title: "Insumos",
          url: "/inventario/insumos",
        },
        {
          title: "Productos",
          url: "/inventario/productos",
        },
        {
          title: "Alertas de Stock",
          url: "/inventario/alertas",
        },
      ],
    },
    {
      title: "Barriles",
      url: "#",
      icon: Barrel,
      items: [
        {
          title: "Estado de Barriles",
          url: "/barriles/estado",
        },
        {
          title: "Movimientos",
          url: "/barriles/movimientos",
        },
      ],
    },
    {
      title: "Reportes",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Rendimiento de Recetas",
          url: "/reportes/rendimiento",
        },
        {
          title: "Costos de Producción",
          url: "/reportes/costos",
        },
      ],
    },
    {
      title: "Administración",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Usuarios",
          url: "/admin/usuarios",
        },
        {
          title: "Configuración",
          url: "/admin/configuracion",
        },
        {
          title: "Mi Perfil",
          url: "/admin/perfil",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Logo de Carmina */}
        <div className="flex items-center justify-center py-2">
          
          {/* Cuando está expandido muestra logo */}
          <div className="flex flex-col items-center gap-2 group-data-[collapsible=icon]:hidden transition-all">
                      
            { <img 
              src="../public/images/logo_carmina.png" 
              alt="Carmina Burana" 
              className="h-12 w-auto -mt-1.5"
            /> }          
          </div>
          
          {/* Cuando está contraído solo muestra el isologo */}
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center transition-all">
            
              { <img 
                src="../public/images/isologo_carmina.png" 
                alt="CB" 
                className="w-8 -mt-1"
              /> }
            </div>
        </div>
      </SidebarHeader>
    
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
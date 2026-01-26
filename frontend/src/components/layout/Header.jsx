import { useLocation, Link } from "react-router-dom";
import { Home } from "lucide-react";

// Componentes shadcn
import { SidebarTrigger } from "@/components/ui/Sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import NotificationsDropdown from "@/components/layout/NotificationsDropdown";

// Configuración de nombres legibles para las rutas
const routeNames = {
  dashboard: "Dashboard",
  produccion: "Producción",
  cocciones: "Cocciones",
  nuevo: "Nueva Cocción",
  recetas: "Recetas",
  planificacion: "Planificación",
  inventario: "Inventario",
  insumos: "Insumos",
  productos: "Productos Terminados",
  alertas: "Alertas de Stock",
  barriles: "Barriles",
  estado: "Estado de Barriles",
  movimientos: "Movimientos",
  distribucion: "Distribución",
  reportes: "Reportes",
  "stock-formato": "Stock por Formato",
  rendimiento: "Rendimiento de Recetas",
  costos: "Costos de Producción",
  admin: "Administración",
  usuarios: "Usuarios",
  configuracion: "Configuración",
  perfil: "Mi Perfil",
};

export function Header() {
  //obtener la ruta actual para el breadcrumb
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white">
      <div className="flex items-center justify-between w-full px-4">
        {/* Trigger + Breadcrumb */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />

          <span className="w-0.5 h-4.5 bg-gray-300 rounded-sm"></span>
          {/* Breadcrumb dinámico */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard" className="flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Inicio</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {/* Generar breadcrumbs dinámicamente */}
              {pathnames.map((segment, index) => {
                const isLast = index === pathnames.length - 1;
                const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                const displayName = routeNames[segment] || segment;

                if (!isNaN(segment)) {
                  return null;
                }

                return (
                  <div key={routeTo} className="flex items-center gap-2">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{displayName}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={routeTo}>{displayName}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Notificaciones */}
        <div className="flex items-center gap-2 mr-2 mt-2">
          <NotificationsDropdown />
        </div>
      </div>
    </header>
  );
}

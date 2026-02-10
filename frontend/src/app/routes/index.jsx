import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";

// Layouts
import AppLayout from "@/components/layout/AppLayout";

// Guards
import AuthGuard from "./guards/AuthGuard";
import PublicGuard from "./guards/PublicGuard";

// Paǵinas con lazy loading
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);





//insumos pages
const InsumosPage = lazy (()=>
  import("@/features/gestion_insumos/pages/InsumosPage")
);

const InsumoDetailPage = lazy(()=>
  import ('@/features/gestion_insumos/pages/InsumoDetailPage')
);

const NuevoLote = lazy(()=>
  import ('@/features/gestion_insumos/pages/NuevoLotePage')
);

// Auth pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));

// Error pages
const NotFoundPage = lazy(() => import("@/features/errors/pages/NotFoundPage"));

export const router = createBrowserRouter([
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/inventario/insumos",
        element: <InsumosPage />, 
      },
      {
        path: "/inventario/insumos/:insumoId",
        element: <InsumoDetailPage />,
      },
    ],
  },
  {
    path: "/auth/login",
    element: (
      <PublicGuard>
        <LoginPage />,
      </PublicGuard>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" />,
  },
]);

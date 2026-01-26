import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { lazy } from "react";

const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage")
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
    element: <AppLayout />,
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
            {
        path: "/inventario/insumos/:insumoId/lote/nuevo",
        element: <NuevoLote />,
      },
    ],
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" />,
  },
]);
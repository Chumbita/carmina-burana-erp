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
const SuppliesPage = lazy(() =>
  import("@/features/Inventario/gestion_insumos/pages/SuppliesPage")
);

const SupplyDetailPage = lazy(() =>
  import('@/features/Inventario/gestion_insumos/pages/SupplyDetailPage')
);

const SupplyEntryPage = lazy(() =>
  import('@/features/Inventario/supply-entry/pages/SupplyEntryPage')
);

const SupplyEntryDetailPage = lazy(() =>
  import('@/features/Inventario/supply-entry/pages/SupplyEntryDetailPage')
);


// BOM pages
const BomsPage = lazy(() =>
  import('@/features/produccion/bom/pages/BomsPage')
)

const BomDetailPage = lazy(() =>
  import('@/features/produccion/bom/pages/BomDetailPage')
)

// Auth pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));

// User pages
const UserSettingsPage = lazy(() => import("@/features/user/pages/UserSettingsPage"));

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
        path: "/admin",
        children: [
          {
            path: "user/settings",
            element: <UserSettingsPage />
          }
        ]
      },
      {
        path: "/produccion/bom",
        element: <BomsPage />,
      },
      {
        path: "/produccion/bom/:bomId",
        element: <BomDetailPage />,
      },
      {
        path: "/inventario/insumos",
        element: <SuppliesPage />,
      },
      {
        path: "/inventario/insumos/:supplyId",
        element: <SupplyDetailPage />,
      },
      {
        path: "/inventario/ingreso-insumos",
        element: <SupplyEntryPage />,
      },
      {
        path: "/inventario/ingreso-insumos/:entryId",
        element: <SupplyEntryDetailPage />,
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

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
const InputsPage = lazy(() =>
  import("@/features/Inventario/gestion_insumos/pages/InputsPage")
);

const InputDetailPage = lazy(() =>
  import('@/features/Inventario/gestion_insumos/pages/InputDetailPage')
);

const InputEntryPage = lazy(() =>
  import('@/features/Inventario/supply-entry/pages/InputEntryPage')
);

const SupplyEntryDetailPage = lazy(() =>
  import('@/features/Inventario/supply-entry/pages/SupplyEntryDetailPage')
);


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
        path: "/inventario/insumos",
        element: <InputsPage />,
      },
      {
        path: "/inventario/insumos/:inputId",
        element: <InputDetailPage />,
      },
      {
        path: "/inventario/ingreso-insumos",
        element: <InputEntryPage />,
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

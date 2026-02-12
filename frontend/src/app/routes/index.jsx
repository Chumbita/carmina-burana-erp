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
  import("@/features/gestion_insumos/pages/InputsPage")
);

const InputDetailPage = lazy(() =>
  import('@/features/gestion_insumos/pages/InputDetailPage')
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
        path: "/inventario/insumos/:insumoId",
        element: <InputDetailPage />,
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

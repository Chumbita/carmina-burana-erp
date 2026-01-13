import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { lazy } from "react";

const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage")
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
    ],
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" />,
  },
]);
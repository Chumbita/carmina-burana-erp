import { createBrowserRouter, Navigate } from "react-router-dom";

// Lazy loading de páginas
import { lazy } from "react";

// Auth pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));

// Error pages
const NotFoundPage = lazy(() => import("@/features/errors/pages/NotFoundPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={"/dashboard"} />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

import { createBrowserRouter, Navigate } from "react-router-dom";

// Lazy loading de páginas
import { lazy } from "react";

// Error pages
const NotFoundPage = lazy(() =>
  import("@/features/errors/pages/NotFoundPage")
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={"/dashboard"} />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

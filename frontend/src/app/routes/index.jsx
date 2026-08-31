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
const SuppliesPage = lazy(
  () => import("@/features/Inventario/gestion_insumos/pages/SuppliesPage"),
);

const InventoryDashboardPage = lazy(
  () => import("@/features/Inventario/dashboard/pages/InventoryDashboardPage"),
);

const SupplyDetailPage = lazy(
  () => import("@/features/Inventario/gestion_insumos/pages/SupplyDetailPage"),
);

const PackagingSupplyDetailPage = lazy(() =>
  import('@/features/Inventario/gestion_insumos/pages/PackagingSupplyDetailPage')
);

const SupplyEntryPage = lazy(() =>
  import('@/features/Inventario/supply-entry/pages/SupplyEntryPage')
);

const SuppliersPage = lazy(() =>
  import('@/features/Inventario/suppliers/pages/SuppliersPage')
);

const SupplierDetailPage = lazy(() =>
  import('@/features/Inventario/suppliers/pages/SupplierDetailPage')
);

const BrandsPage = lazy(() =>
  import('@/features/Inventario/brands/pages/BrandsPage')
);

const BrandDetailPage = lazy(() =>
  import('@/features/Inventario/brands/pages/BrandDetailPage')
);

// beer pages
const BeerPage = lazy(
  () => import("@/features/Inventario/beer/pages/BeerPage"),
);

const ProductionPage = lazy(
  () => import("@/features/production/cookings/pages/ProductionPage"),
);

const ProductionOrderDetailPage = lazy(
  () => import("@/features/production/cookings/pages/ProductionOrderDetailPage"),
);

const SupplyEntryDetailPage = lazy(
  () =>
    import("@/features/Inventario/supply-entry/pages/SupplyEntryDetailPage"),
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
const UserSettingsPage = lazy(
  () => import("@/features/user/pages/UserSettingsPage"),
);

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
            element: <UserSettingsPage />,
          },
        ],
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
        path: "/inventario/dashboard",
        element: <InventoryDashboardPage />,
      },
      {
        path: "/inventario/insumos/:supplyId",
        element: <SupplyDetailPage />,
      },
      {
        path: "/inventario/insumos/envases/:supplyId",
        element: <PackagingSupplyDetailPage />,
      },
      {
        path: "/inventario/ingreso-insumos",
        element: <SupplyEntryPage />,
      },
      {
        path: "/inventario/proveedores",
        element: <SuppliersPage />,
      },
      {
        path: "/inventario/proveedores/:supplierId",
        element: <SupplierDetailPage />,
      },
      {
        path: "/inventario/marcas",
        element: <BrandsPage />,
      },
      {
        path: "/inventario/marcas/:brandId",
        element: <BrandDetailPage />,
      },
      {
        path: "/inventario/ingreso-insumos/:entryId",
        element: <SupplyEntryDetailPage />,
      },
      {
        path: "/inventario/cervezas",
        element: <BeerPage />,
      },
      {
        path: "/produccion/cocciones",
        element: <ProductionPage />,
      },
      {
        path: "/produccion/cocciones/nuevo",
        element: <ProductionPage />,
      },
      {
        path: "/produccion/cocciones/:orderId",
        element: <ProductionOrderDetailPage />,
      },
      {
        path: "/production/cookings",
        element: <ProductionPage />,
      },
      {
        path: "/production/cookings",
        element: <ProductionPage />,
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

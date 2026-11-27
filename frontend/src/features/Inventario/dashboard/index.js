// API pública del feature Inventario/dashboard.
// El resto de la app debe consumir este barrel en lugar de rutas profundas.
// Las páginas se siguen importando de forma granular desde el router
// (`./pages/<Page>`) para preservar el code-splitting por página.

export { default as InventoryDashboardPage } from './pages/InventoryDashboardPage'
export { inventoryDashboardService } from './services/inventoryDashboardService'
export { useInventoryDashboard } from './hooks/useInventoryDashboard'
export {
  EMPTY_INVENTORY_DASHBOARD,
  STATUS_COLORS,
  STATUS_ORDER,
} from './constants/inventoryDashboard.constants'

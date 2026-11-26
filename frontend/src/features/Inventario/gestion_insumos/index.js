// API pública del feature gestion_insumos.
// El resto de la app debe consumir este barrel en lugar de rutas profundas.
// Las páginas se siguen importando de forma granular desde el router
// (`./pages/<Page>`) para preservar el code-splitting por página.

// Páginas
export { default as SuppliesPage } from './pages/SuppliesPage'
export { default as SupplyDetailPage } from './pages/SupplyDetailPage'
export { default as PackagingSupplyDetailPage } from './pages/PackagingSupplyDetailPage'

// Componentes reutilizables por otros features
export { Pagination } from './components/Pagination'

// Hooks de dominio consumidos fuera del feature
export { useSupplies } from './hooks/useSupplies'
export { useBrands } from './hooks/useBrands'
export { useUoms } from './hooks/useUoms'
export { useSupplyValidation } from './hooks/useSupplyValidation'
export { useLocationNotification } from './hooks/useLocationNotification'

// Servicios
export { supplyService } from './services/supplyService'
export { packagingSupplyService } from './services/packagingSupplyService'

// Utilidades de presentación compartidas
export { estadoStyles } from './utils/stockStyles'

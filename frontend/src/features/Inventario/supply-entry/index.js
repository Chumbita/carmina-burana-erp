// API pública del feature supply-entry.
// El resto de la app debe consumir este barrel en lugar de rutas profundas.
// Las páginas se siguen importando de forma granular desde el router
// (`./pages/<Page>`) para preservar el code-splitting por página.

// Páginas
export { default as SupplyEntryPage } from './pages/SupplyEntryPage'
export { default as SupplyEntryDetailPage } from './pages/SupplyEntryDetailPage'

// Componentes reutilizables
export { SupplyEntryForm } from './components/SupplyEntryForm'
export { SupplyEntryFilters } from './components/SupplyEntryFilters'
export { SupplyEntryTable } from './components/SupplyEntryTable'
export { SupplyEntryDetail } from './components/SupplyEntryDetail'

// Hooks de dominio
export { useSupplyEntryPage } from './hooks/useSupplyEntryPage'
export { useSupplyEntryDetail } from './hooks/useSupplyEntryDetail'
export { useSupplyEntryForm } from './hooks/useSupplyEntryForm'
export { useSuppliers } from './hooks/useSuppliers'

// Servicios
export { supplyEntryService } from './services/supplyEntryService'

// DTOs y utilidades de presentación
export {
  buildSupplyEntryPayload,
  normalizeEntry,
  mapSupplyEntryRows,
} from './dto/supplyEntry.dto'
export {
  formatEntryDate,
  formatEntryDateTime,
  formatEntryMoney,
  getStatusLabel,
} from './utils/supplyEntryFormatters'

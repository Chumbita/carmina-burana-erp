// API pública del feature brands.
// Expone solo lo que el resto de la app necesita para evitar imports profundos.
export { default as BrandsPage } from './pages/BrandsPage'
export { default as BrandDetailPage } from './pages/BrandDetailPage'
export { BrandForm } from './components/BrandForm'
export { brandService } from './services/brandService'

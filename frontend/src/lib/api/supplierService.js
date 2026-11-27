import { ENDPOINTS } from '@/lib/api/endpoints'
import privateClient from '@/lib/api/privateClient'

/**
 * Servicio transversal de proveedores.
 * Consumido por el feature `suppliers` (CRUD) y por `supply-entry`
 * (options / alta rápida), para evitar dos implementaciones del mismo contrato.
 */
export const supplierService = {
  getAll: async ({ page = 1, pageSize = 20, q, status } = {}) => {
    const params = { page, page_size: pageSize }
    if (q) params.q = q
    if (status && status !== 'all') params.status = status
    const response = await privateClient.get(ENDPOINTS.SUPPLIERS.GET_ALL, { params })
    return response.data
  },

  getOptions: async () => {
    const response = await privateClient.get(ENDPOINTS.SUPPLIERS.OPTIONS)
    return response.data
  },

  getByName: async (name) => {
    const response = await privateClient.get(ENDPOINTS.SUPPLIERS.GET_BY_NAME(name))
    return response.data
  },

  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.SUPPLIERS.GET_BY_ID(id))
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.SUPPLIERS.CREATE, data)
    return response.data
  },

  update: async (id, data) => {
    const response = await privateClient.put(ENDPOINTS.SUPPLIERS.UPDATE(id), data)
    return response.data
  },

  delete: async (id) => {
    await privateClient.delete(ENDPOINTS.SUPPLIERS.DELETE(id))
  },
}

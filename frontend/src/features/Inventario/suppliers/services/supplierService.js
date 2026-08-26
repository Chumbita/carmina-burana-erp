import { ENDPOINTS } from '@/lib/api/endpoints'
import privateClient from '@/lib/api/privateClient'

export const supplierService = {
  getAll: async ({ page = 1, pageSize = 15, q, status } = {}) => {
    const params = { page, page_size: pageSize }
    if (q) params.q = q
    if (status && status !== 'all') params.status = status
    const response = await privateClient.get(ENDPOINTS.SUPPLIERS.GET_ALL, { params })
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

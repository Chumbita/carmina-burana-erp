import { ENDPOINTS } from '@/lib/api/endpoints'
import privateClient from '@/lib/api/privateClient'

export const brandService = {
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.BRANDS.GET_ALL)
    return response.data
  },

  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.BRANDS.GET_BY_ID(id))
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.BRANDS.CREATE, data)
    return response.data
  },

  update: async (id, data) => {
    const response = await privateClient.put(ENDPOINTS.BRANDS.UPDATE(id), data)
    return response.data
  },

  delete: async (id) => {
    await privateClient.delete(ENDPOINTS.BRANDS.DELETE(id))
  },
}

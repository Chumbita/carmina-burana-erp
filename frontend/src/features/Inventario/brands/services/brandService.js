import { ENDPOINTS } from '@/lib/api/endpoints'
import privateClient from '@/lib/api/privateClient'
import { cachedRequest, invalidateCache } from '@/lib/api/cachedRequest'

const BRANDS_KEY = 'brands'

export const brandService = {
  getAll: async () => {
    return cachedRequest(BRANDS_KEY, () =>
      privateClient.get(ENDPOINTS.BRANDS.GET_ALL).then((res) => res.data)
    )
  },

  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.BRANDS.GET_BY_ID(id))
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.BRANDS.CREATE, data)
    invalidateCache(BRANDS_KEY)
    return response.data
  },

  update: async (id, data) => {
    const response = await privateClient.put(ENDPOINTS.BRANDS.UPDATE(id), data)
    invalidateCache(BRANDS_KEY)
    return response.data
  },

  delete: async (id) => {
    await privateClient.delete(ENDPOINTS.BRANDS.DELETE(id))
    invalidateCache(BRANDS_KEY)
  },
}

import { ENDPOINTS } from '@/lib/api/endpoints'
import privateClient from '@/lib/api/privateClient'

const TTL_MS = 5 * 60 * 1000
let cachedBrands = null
let cachedAt = 0
let inflightPromise = null

function isCacheValid() {
  return cachedBrands && Date.now() - cachedAt < TTL_MS
}

export const brandService = {
  getAll: async () => {
    if (isCacheValid()) return cachedBrands
    if (inflightPromise) return inflightPromise
    inflightPromise = privateClient
      .get(ENDPOINTS.BRANDS.GET_ALL)
      .then((response) => {
        cachedBrands = response.data
        cachedAt = Date.now()
        return cachedBrands
      })
      .finally(() => {
        inflightPromise = null
      })
    return inflightPromise
  },

  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.BRANDS.GET_BY_ID(id))
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.BRANDS.CREATE, data)
    cachedBrands = null
    cachedAt = 0
    return response.data
  },

  update: async (id, data) => {
    const response = await privateClient.put(ENDPOINTS.BRANDS.UPDATE(id), data)
    cachedBrands = null
    cachedAt = 0
    return response.data
  },

  delete: async (id) => {
    await privateClient.delete(ENDPOINTS.BRANDS.DELETE(id))
    cachedBrands = null
    cachedAt = 0
  },
}

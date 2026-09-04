import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"
import { invalidateCache } from "@/lib/api/cachedRequest"

const ITEM_OPTIONS_KEY = "item-options"

export const packagingSupplyService = {
  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.PACKAGING_SUPPLIES.GET_BY_ID(id))
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.PACKAGING_SUPPLIES.CREATE, data)
    invalidateCache(ITEM_OPTIONS_KEY)
    return response.data
  },

  patch: async (id, data) => {
    const response = await privateClient.patch(ENDPOINTS.PACKAGING_SUPPLIES.PATCH(id), data)
    invalidateCache(ITEM_OPTIONS_KEY)
    return response.data
  },

  delete: async (id) => {
    const response = await privateClient.delete(ENDPOINTS.PACKAGING_SUPPLIES.DELETE(id))
    invalidateCache(ITEM_OPTIONS_KEY)
    return response.data
  },
}

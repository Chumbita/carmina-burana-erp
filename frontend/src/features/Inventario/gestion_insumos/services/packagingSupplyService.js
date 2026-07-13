import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const packagingSupplyService = {
  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.PACKAGING_SUPPLIES.GET_BY_ID(id))
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.PACKAGING_SUPPLIES.CREATE, data)
    return response.data
  },

  patch: async (id, data) => {
    const response = await privateClient.patch(ENDPOINTS.PACKAGING_SUPPLIES.PATCH(id), data)
    return response.data
  },
}

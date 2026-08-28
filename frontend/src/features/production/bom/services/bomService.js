import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const bomService = {
  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.BOM.CREATE, data)
    return response.data
  },

  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.BOM.GET_ALL)
    return response.data
  },

  getById: async(id) => {
    const response = await privateClient.get(ENDPOINTS.BOM.GET_BY_ID(id))
    return response.data
  }
}

import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const productionService = {
  getOptions: async () => {
    const response = await privateClient.get(ENDPOINTS.PRODUCTION_ORDERS.OPTIONS)
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.CREATE, data)
    return response.data
  },
}

export default productionService

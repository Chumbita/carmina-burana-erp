import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const productionService = {
  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.CREATE, data)
    return response.data
  },
}

export default productionService

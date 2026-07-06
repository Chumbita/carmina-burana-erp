import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const itemService = {
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.PRODUCTS.GET_ALL)
    return response.data
  },
}

export default itemService

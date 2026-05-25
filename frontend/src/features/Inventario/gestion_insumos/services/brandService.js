import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const brandService = {
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.BRANDS.GET_ALL)
    return response.data
  },
}

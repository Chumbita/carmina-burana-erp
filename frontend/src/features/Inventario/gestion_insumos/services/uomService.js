import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const uomService = {
  getOptions: async () => {
    const response = await privateClient.get(ENDPOINTS.UOMS.GET_OPTIONS)
    return response.data
  },
}

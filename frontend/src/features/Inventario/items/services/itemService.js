import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const itemService = {
  getOptions: async () => {
    const response = await privateClient.get(ENDPOINTS.ITEMS.GET_OPTIONS)
    return response.data
  }
}

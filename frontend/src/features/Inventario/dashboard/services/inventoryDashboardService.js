import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const inventoryDashboardService = {
  get: async () => {
    const response = await privateClient.get(ENDPOINTS.INVENTORY.DASHBOARD)
    return response.data
  },
}

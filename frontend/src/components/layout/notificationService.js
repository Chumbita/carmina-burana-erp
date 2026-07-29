import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const notificationService = {
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.NOTIFICATIONS.GET_ALL)
    return response.data
  },
}

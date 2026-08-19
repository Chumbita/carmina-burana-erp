import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const notificationService = {
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.NOTIFICATIONS.GET_ALL)
    return response.data
  },

  markRead: async (key) => {
    await privateClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(key))
  },

  markAllRead: async () => {
    await privateClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },

  dismiss: async (key) => {
    await privateClient.patch(ENDPOINTS.NOTIFICATIONS.DISMISS(key))
  },
}

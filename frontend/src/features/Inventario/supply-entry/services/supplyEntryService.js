import { ENDPOINTS } from '@/lib/api/endpoints'
import privateClient from '@/lib/api/privateClient'

export const supplyEntryService = {
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.SUPPLY_ENTRIES.GET_ALL)
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.SUPPLY_ENTRIES.CREATE, data)
    return response.data
  },
}

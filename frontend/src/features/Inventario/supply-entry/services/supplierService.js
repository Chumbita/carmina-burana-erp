import { ENDPOINTS } from '@/lib/api/endpoints'
import privateClient from '@/lib/api/privateClient'

export const supplierService = {
  getOptions: async () => {
    const response = await privateClient.get(ENDPOINTS.SUPPLIERS.OPTIONS)
    return response.data
  },

  getByName: async (name) => {
    const response = await privateClient.get(ENDPOINTS.SUPPLIERS.GET_BY_NAME(name))
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.SUPPLIERS.CREATE, data)
    return response.data
  },
}

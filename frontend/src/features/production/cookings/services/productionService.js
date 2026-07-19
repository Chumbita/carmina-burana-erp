import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const productionService = {
  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.CREATE, data)
    return response.data
  },

  getIncomplete: async () => {
    const response = await privateClient.get(ENDPOINTS.PRODUCTION_ORDERS.GET_INCOMPLETE)
    return response.data 
  },

  release: async (orderId) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.RELEASE(orderId))
    return response.data
  },

  start: async (orderId) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.START(orderId))
    return response.data
  },

  complete: async (orderId, data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.COMPLETE(orderId), data)
    return response.data
  }
}

export default productionService
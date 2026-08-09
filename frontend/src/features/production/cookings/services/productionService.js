import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const productionService = {
  plan: async (data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.PLAN, data)
    return response.data
  },

  getIncomplete: async () => {
    const response = await privateClient.get(ENDPOINTS.PRODUCTION_ORDERS.GET_INCOMPLETE)
    return response.data 
  },

  execute: async (orderId, data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.EXECUTE(orderId), data)
    return response.data
  },

  start: async (orderId) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.START(orderId))
    return response.data
  },

  complete: async (orderId, data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.COMPLETE(orderId), data)
    return response.data
  },

  cancel: async (orderId) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.CANCEL(orderId))
    return response.data
  }
}

export default productionService

import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const supplyService = {
  // READ
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.SUPPLIES.GET_ALL)
    return response.data
  },

  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.SUPPLIES.GET_BY_ID(id))
    return response.data
  },

  // CREATE
  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.SUPPLIES.CREATE, data)
    return response.data
  },

  // UPDATE
  patch: async (id, data) => {
    const response = await privateClient.patch(ENDPOINTS.SUPPLIES.PATCH(id), data)
    return response.data
  },

  // DELETE
  delete: async (id) => {
    const response = await privateClient.delete(ENDPOINTS.SUPPLIES.DELETE(id))
    return response.data
  },

  // TRANSACTIONS
  getTransactions: async (id) => {
    const response = await privateClient.get(ENDPOINTS.SUPPLIES.GET_TRANSACTIONS(id))
    return response.data
  },
}

import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const bomService = {
  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.BOM.CREATE, data)
    return response.data
  },

  getAll: async ({ page = 1, pageSize = 20, q, sortBy, sortOrder } = {}) => {
    const params = { page, page_size: pageSize }
    if (q) params.q = q
    if (sortBy) params.sort_by = sortBy
    if (sortOrder) params.sort_order = sortOrder
    const response = await privateClient.get(ENDPOINTS.BOM.GET_ALL, { params })
    return response.data
  },

  getById: async(id) => {
    const response = await privateClient.get(ENDPOINTS.BOM.GET_BY_ID(id))
    return response.data
  }
}

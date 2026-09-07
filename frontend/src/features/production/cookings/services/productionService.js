import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

export const productionService = {
  plan: async (data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.PLAN, data)
    return response.data
  },

  getIncomplete: async ({ page = 1, pageSize = 20, q, sortBy, sortOrder } = {}) => {
    const params = { page, page_size: pageSize }
    if (q) params.q = q
    if (sortBy) params.sort_by = sortBy
    if (sortOrder) params.sort_order = sortOrder
    const response = await privateClient.get(ENDPOINTS.PRODUCTION_ORDERS.GET_INCOMPLETE, { params })
    return response.data
  },

  getHistory: async ({ page = 1, pageSize = 20, q, status, dateField, dateFrom, dateTo, sortBy, sortOrder } = {}) => {
    const params = { page, page_size: pageSize }
    if (q) params.q = q
    if (status) params.status = status
    if (dateField) params.date_field = dateField
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (sortBy) params.sort_by = sortBy
    if (sortOrder) params.sort_order = sortOrder
    const response = await privateClient.get(ENDPOINTS.PRODUCTION_ORDERS.GET_HISTORY, { params })
    return response.data
  },

  getById: async (orderId) => {
    const response = await privateClient.get(ENDPOINTS.PRODUCTION_ORDERS.GET_BY_ID(orderId))
    return response.data
  },

  update: async (orderId, data) => {
    const response = await privateClient.patch(ENDPOINTS.PRODUCTION_ORDERS.UPDATE(orderId), data)
    return response.data
  },

  execute: async (orderId, data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.EXECUTE(orderId), data)
    return response.data
  },

  cancel: async (orderId) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.CANCEL(orderId))
    return response.data
  },

  discard: async (orderId, data) => {
    const response = await privateClient.post(ENDPOINTS.PRODUCTION_ORDERS.DISCARD(orderId), data)
    return response.data
  }
}

export default productionService

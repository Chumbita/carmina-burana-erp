import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"
import { cachedRequest, invalidateCache } from "@/lib/api/cachedRequest"

const ITEM_OPTIONS_KEY = "item-options"

export const supplyService = {
  // READ
  getAll: async ({ page = 1, pageSize = 25, q, category, itemType, stockStatus, sortBy, sortOrder } = {}) => {
    const params = { page, page_size: pageSize }
    if (q) params.q = q
    if (category) params.category = category
    if (itemType) params.item_type = itemType
    if (stockStatus) params.stock_status = stockStatus
    if (sortBy) params.sort_by = sortBy
    if (sortOrder) params.sort_order = sortOrder
    const response = await privateClient.get(ENDPOINTS.SUPPLIES.GET_ALL, { params })
    return response.data
  },

  getOptions: async () => {
    return cachedRequest(
      ITEM_OPTIONS_KEY,
      () => privateClient.get(ENDPOINTS.ITEMS.GET_OPTIONS).then((res) => res.data)
    )
  },

  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.SUPPLIES.GET_BY_ID(id))
    return response.data
  },

  // CREATE
  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.SUPPLIES.CREATE, data)
    invalidateCache(ITEM_OPTIONS_KEY)
    return response.data
  },

  // UPDATE
  patch: async (id, data) => {
    const response = await privateClient.patch(ENDPOINTS.SUPPLIES.PATCH(id), data)
    invalidateCache(ITEM_OPTIONS_KEY)
    return response.data
  },

  // DELETE
  delete: async (id) => {
    const response = await privateClient.delete(ENDPOINTS.SUPPLIES.DELETE(id))
    invalidateCache(ITEM_OPTIONS_KEY)
    return response.data
  },

  // LOTS
  getLots: async (itemId, status, page) => {
    const params = { page }
    if (status) params.status = status
    const response = await privateClient.get(ENDPOINTS.SUPPLIES.GET_LOTS(itemId), { params })
    return response.data
  },

  adjustLot: async (itemId, lotId, { new_quantity, reason }) => {
    const response = await privateClient.post(ENDPOINTS.SUPPLIES.ADJUST_LOT(itemId, lotId), {
      new_quantity,
      reason,
    })
    return response.data
  },
}

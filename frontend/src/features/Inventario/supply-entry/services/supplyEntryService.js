import { ENDPOINTS } from '@/lib/api/endpoints'
import privateClient from '@/lib/api/privateClient'

export const supplyEntryService = {
  getAll: async ({ page = 1, pageSize = 15, supplierId, dateFrom, dateTo, q } = {}) => {
    const params = { page, page_size: pageSize }
    if (supplierId) params.supplier_id = supplierId
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (q) params.q = q

    const response = await privateClient.get(ENDPOINTS.SUPPLY_ENTRIES.GET_ALL, { params })
    return response.data
  },

  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.SUPPLY_ENTRIES.GET_BY_ID(id))
    return response.data
  },

  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.SUPPLY_ENTRIES.CREATE, data)
    return response.data
  },

  cancel: async (id, reason) => {
    if (!reason?.trim()) {
      throw new Error('Cancellation reason is required')
    }

    const response = await privateClient.post(ENDPOINTS.SUPPLY_ENTRIES.CANCEL(id), { reason })
    return response.data
  },
}

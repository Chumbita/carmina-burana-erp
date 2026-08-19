import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const transactionService = {
  async getByItemId(itemId, page, pageSize) {
    const response = await privateClient.get(ENDPOINTS.ITEMS.GET_TRANSACTIONS(itemId), {
      params: { page, page_size: pageSize },
    })
    return response.data
  },
}
import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const transactionService = {
  async getByItemId(itemId) {
    const response = await privateClient.get(ENDPOINTS.ITEMS.GET_TRANSACTIONS(itemId))
    return response.data
  },
}
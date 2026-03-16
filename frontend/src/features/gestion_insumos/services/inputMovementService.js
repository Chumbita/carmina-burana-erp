import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const inputMovementService = {
  async getByInputId(inputId) {
    const response = await privateClient.get(ENDPOINTS.INPUT_MOVEMENTS.GET_BY_INPUT_ID(inputId))
    return response.data
  },
}

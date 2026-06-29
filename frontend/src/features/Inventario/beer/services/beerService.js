import privateClient from "@/lib/api/privateClient";
import { ENDPOINTS } from "@/lib/api/endpoints";

export const beerService = {
  create: async (data) => {
    const response = await privateClient.post(ENDPOINTS.BEERS.CREATE, data);
    return response.data;
  },
};

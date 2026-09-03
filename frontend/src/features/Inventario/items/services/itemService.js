import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const itemService = {
  getOptions: async () => {
    const response = await privateClient.get(ENDPOINTS.ITEMS.GET_OPTIONS)
    return response.data
  },

  getManufacturableItems: async () => {
    const response = await privateClient.get(ENDPOINTS.ITEMS.GET_MANUFACTURABLE);
    const items = response.data;

    return {
      manufacturableItems: items.map((item) => ({ ...item, boms: item.boms || [] })),
    };
  },
}

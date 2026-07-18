import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const bomService = {
  /*
   Obtiene la receta (BOM) activa asociada a un ítem específico.
   */
  getItemBom: async (itemId) => {
    const response = await privateClient.get(
      ENDPOINTS.ITEMS.GET_ITEM_BOM(itemId),
    );
    return response.data;
  },
};

export default bomService;

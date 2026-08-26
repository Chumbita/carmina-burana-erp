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

    const beerOptions = items
      .filter(
        (item) =>
          item.item_type.toLowerCase() === "beer" ||
          item.item_type.toLowerCase() === "cerveza"
      )
      .map((item) => ({
        ...item,
        type: "beer",
        boms: item.boms || [],
      }));

    const productOptions = items
      .filter(
        (item) =>
          item.item_type.toLowerCase() === "product" ||
          item.item_type.toLowerCase() === "producto"
      )
      .map((item) => ({
        ...item,
        type: "product",
        boms: item.boms || [],
      }));

    return { beerOptions, productOptions };
  },
}

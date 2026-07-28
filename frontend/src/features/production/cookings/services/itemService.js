import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const itemService = {
  /**
   * Obtiene los ítems manufacturables desde FastAPI y los clasifica
   * para cumplir con las propiedades requeridas por el ProductionForm.
   */
  getManufacturableItems: async () => {
    const response = await privateClient.get(ENDPOINTS.ITEMS.GET_MANUFACTURABLE);
    const items = response.data;

    // Filtramos y preparamos las cervezas
    const beerOptions = items
      .filter(
        (item) =>
          item.item_type_name.toLowerCase() === "beer" ||
          item.item_type_name.toLowerCase() === "cerveza"
      )
      .map((item) => ({
        ...item,
        type: "beer",
        boms: item.boms || [], // Fallback seguro por si el backend no trae recetas todavía
      }));

    // Filtramos y preparamos los productos generales
    const productOptions = items
      .filter(
        (item) =>
          item.item_type_name.toLowerCase() === "product" ||
          item.item_type_name.toLowerCase() === "producto"
      )
      .map((item) => ({
        ...item,
        type: "product",
        boms: item.boms || [], // Fallback seguro
      }));

    return { beerOptions, productOptions };
  },
};
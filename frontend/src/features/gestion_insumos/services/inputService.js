import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

// inputService.js

export const inputService = {
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.INPUTS.GET_ALL)

    // Normalizar la respuesta para campos que aún no llegan del backend
    return response.data.map((insumo) => ({
      ...insumo,
      stockTotal: insumo.stockTotal ?? 0, 
      estadoStock: insumo.estadoStock ?? "optimo",  
    }))
  },

    //temporal mockeado hasta conectar con el back
  getById: async (id) => {

    const response = await privateClient.get(ENDPOINTS.INPUTS.GET_BY_ID(id))
    return response.data


  return new Promise((resolve) => {
    
      const insumo = INSUMOS_DETALLE.find((i) => i.id === id);
      resolve(insumo || null);
   
  });
}
,
  create: async (data) => {
    const response = await privateClient.post(
      ENDPOINTS.INPUTS.CREATE,
      {
        ...data,
        image: data.image || null
      }
    )
  return response.data
  },

  delete: async (id) => {
    const response = await privateClient.delete(ENDPOINTS.INPUTS.DELETE(id))
    return response.data
  }
}


//mocks
//insumosDetail
const INSUMOS_DETALLE = [
  {
    "id": "20",
    "name": "Malta",
    "category": "No Perecedero",
    "unit": "kg",
    "stock_total": 1850,
     "brand": "Cargill",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmtXD6-JwrzeJVK69V4XPYeiycJX6DgvBkOw&s",
    "estadoStock": "optimo",    
    "minimum_stock": 200,
  },
  {
    "id": "34",
    "name": "Malta Caramelo",
    "brand": "Weyermann",
     "unit": "kg",
    "stock_total": 450,
    "estadoStock": "bajo",   
    "minimum_stock": 50,
  },
    {
    "id": "8",
    "name": "Malta Caramelo",
    "brand": "Weyermann",
     "unit": "kg",
    "stock_total": 450,
    "estadoStock": "bajo",   
    "minimum_stock": 50,
  },
    {
    "id": "18",
    "name": "Malta Caramelo",
    "brand": "Weyermann",
     "unit": "kg",
    "stock_total": 450,
    "estadoStock": "bajo",   
    "minimum_stock": 50,
  },
    {
    "id": "19",
    "name": "Malta Caramelo",
    "brand": "Weyermann",
     "unit": "kg",
    "stock_total": 450,
    "estadoStock": "bajo",   
    "minimum_stock": 50,
  },
] 


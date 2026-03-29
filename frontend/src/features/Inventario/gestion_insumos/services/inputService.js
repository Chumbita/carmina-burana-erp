import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const inputService = {
  //READ
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.INPUTS.GET_ALL)

    return response.data
  },
  getById: async (id) => {

    const response = await privateClient.get(ENDPOINTS.INPUTS.GET_BY_ID(id))
    return response.data
  },

  //CREATE
  create: async (data) => {
    // Obtener usuario actual
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    
    const response = await privateClient.post(
      ENDPOINTS.INPUTS.CREATE,
      {
        ...data,
        image: data.image || null,
        performed_by: user?.id || null
      }
    )
  return response.data
  },

  //DELETE
  delete: async (id) => {
    const response = await privateClient.delete(ENDPOINTS.INPUTS.DELETE(id))
    return response.data
  },

  //PATCH 
  patch: async (id, data) => {
    // Obtener usuario actual
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    
    const response = await privateClient.patch(
      ENDPOINTS.INPUTS.PATCH(id), 
      {
        ...data,
        performed_by: user?.id || null
      }
    )
    return response.data
  },
}




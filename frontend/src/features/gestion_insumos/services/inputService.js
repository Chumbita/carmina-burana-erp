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
    const response = await privateClient.post(
      ENDPOINTS.INPUTS.CREATE,
      {
        ...data,
        image: data.image || null
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
    const response = await privateClient.patch(ENDPOINTS.INPUTS.PATCH(id), data)
    return response.data
  },
}




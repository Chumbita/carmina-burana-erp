import privateClient from "@/lib/api/privateClient";
import { ENDPOINTS } from "@/lib/api/endpoints";

export const userService = {
  changePassword: async (payload) => {
    try {
      const response = await privateClient.patch(
        ENDPOINTS.USER.CHANGE_PASSWORD,
        payload,
      );

      return response.data;
    } catch (error) {
      console.log(
        `[ERROR ${error.response?.status}] ${error.response?.data?.detail}`,
      );
      throw new Error(error.response?.data?.detail);
    }
  },
};

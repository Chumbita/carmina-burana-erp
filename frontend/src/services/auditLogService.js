import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const auditLogService = {
  async getByEntity(entityType, entityId) {
    const response = await privateClient.get(ENDPOINTS.AUDIT_LOGS.GET_BY_ENTITY(entityType, entityId))
    return response.data
  },

  async getByUser(userId) {
    const response = await privateClient.get(ENDPOINTS.AUDIT_LOGS.GET_BY_USER(userId))
    return response.data
  },
}

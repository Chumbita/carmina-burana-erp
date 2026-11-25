import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const auditLogService = {
  async getByEntity(entityType, entityId, page, pageSize) {
    const response = await privateClient.get(ENDPOINTS.AUDIT_LOGS.GET_BY_ENTITY(entityType, entityId), {
      params: { page, page_size: pageSize },
    })
    return response.data
  },

  async getByUser(userId, page, pageSize) {
    const response = await privateClient.get(ENDPOINTS.AUDIT_LOGS.GET_BY_USER(userId), {
      params: { page, page_size: pageSize },
    })
    return response.data
  },
}

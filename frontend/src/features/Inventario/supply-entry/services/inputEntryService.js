import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

export const inputEntryService = {
  // READ
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.entry_date_from) params.append('entry_date_from', filters.entry_date_from);
    if (filters.entry_date_to) params.append('entry_date_to', filters.entry_date_to);
    if (filters.supplier) params.append('supplier', filters.supplier);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await privateClient.get(`${ENDPOINTS.INPUT_ENTRIES.GET_ALL}?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await privateClient.get(ENDPOINTS.INPUT_ENTRIES.GET_BY_ID(id));
    return response.data;
  },

  // CANCEL
  cancel: async (id, reason) => {
    if (!reason?.trim()) {
      throw new Error('Cancellation reason is required');
    }
    
    const url = `${ENDPOINTS.INPUT_ENTRIES.GET_BY_ID(id)}/cancel?reason=${encodeURIComponent(reason)}`;
    const response = await privateClient.patch(url);
    return response.data;
  },

  // CREATE
  create: async (data) => {
    // Obtener usuario actual
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    const response = await privateClient.post(
      ENDPOINTS.INPUT_ENTRIES.CREATE,
      {
        ...data,
        performed_by: user?.id || null
      }
    );
    return response.data;
  },
};

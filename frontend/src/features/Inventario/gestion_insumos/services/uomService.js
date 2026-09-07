import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"
import { cachedRequest } from "@/lib/api/cachedRequest"

const UOMS_KEY = "uoms"

export const uomService = {
  getOptions: async () => {
    return cachedRequest(UOMS_KEY, () =>
      privateClient.get(ENDPOINTS.UOMS.GET_OPTIONS).then((res) => res.data)
    )
  },
}

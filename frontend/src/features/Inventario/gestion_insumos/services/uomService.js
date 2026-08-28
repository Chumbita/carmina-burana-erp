import { ENDPOINTS } from "@/lib/api/endpoints"
import privateClient from "@/lib/api/privateClient"

const TTL_MS = 5 * 60 * 1000
let cachedUoms = null
let cachedAt = 0
let inflightPromise = null

function isCacheValid() {
  return cachedUoms && Date.now() - cachedAt < TTL_MS
}

export const uomService = {
  getOptions: async () => {
    if (isCacheValid()) return cachedUoms
    if (inflightPromise) return inflightPromise
    inflightPromise = privateClient
      .get(ENDPOINTS.UOMS.GET_OPTIONS)
      .then((response) => {
        cachedUoms = response.data
        cachedAt = Date.now()
        return cachedUoms
      })
      .finally(() => {
        inflightPromise = null
      })
    return inflightPromise
  },
}

import { useState, useEffect, useCallback } from "react"
import { brandService } from "../services/brandService"

export function useBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await brandService.getAll()
      setBrands(data.filter((brand) => brand.is_active))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { brands, loading, error, refresh: load }
}

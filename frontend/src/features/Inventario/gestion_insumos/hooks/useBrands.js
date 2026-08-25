import { useState, useEffect, useCallback } from "react"
import { brandService } from "@/features/Inventario/brands/services/brandService"

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

  const addBrand = useCallback((newBrand) => {
    if (!newBrand?.is_active && newBrand?.is_active !== undefined) return
    setBrands((prev) => {
      if (prev.some((b) => b.id === newBrand.id)) return prev
      return [...prev, newBrand]
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { brands, loading, error, refresh: load, addBrand, setBrands }
}

import { useState, useEffect } from "react"
import { brandService } from "../services/brandService"

export function useBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await brandService.getAll()
        setBrands(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { brands, loading, error }
}

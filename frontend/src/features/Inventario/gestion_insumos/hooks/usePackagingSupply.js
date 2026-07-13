import { useEffect, useState } from "react"
import { packagingSupplyService } from "../services/packagingSupplyService"

export function usePackagingSupply(id) {
  const [packagingSupply, setPackagingSupply] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await packagingSupplyService.getById(id)
        setPackagingSupply(data)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  return { packagingSupply, loading, error }
}

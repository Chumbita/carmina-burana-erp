import { useEffect, useState } from "react"
import { packagingSupplyService } from "../services/packagingSupplyService"
import { supplyService } from "../services/supplyService"

export function usePackagingSupply(id) {
  const [packagingSupply, setPackagingSupply] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      const data = await packagingSupplyService.getById(id)
      setPackagingSupply(data)
      setError(null)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function updatePackagingSupply(data) {
    const updated = await packagingSupplyService.patch(id, data)
    setPackagingSupply(updated)
    return updated
  }

  async function deleteSupply() {
    const result = await supplyService.remove(id)
    return result
  }

  return { packagingSupply, loading, error, updatePackagingSupply, deleteSupply, refetch: load }
}

import { useState, useEffect } from "react"
import { supplyService } from "../services/supplyService"

export function useSupply(id) {
  const [supply, setSupply] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    if (!id) return
    try {
      const data = await supplyService.getById(id)
      setSupply(data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function updateSupply(data) {
    const updated = await supplyService.update(id, data)
    setSupply(updated)
    return updated
  }

  return { supply, loading, error, updateSupply, refetch: load }
}

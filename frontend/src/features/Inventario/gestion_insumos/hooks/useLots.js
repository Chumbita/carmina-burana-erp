import { useState, useEffect } from "react"
import { supplyService } from "../services/supplyService"

export function useLots(itemId, statusFilter) {
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!itemId) return

    async function load() {
      try {
        const data = await supplyService.getLots(itemId, statusFilter)
        setLots(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [itemId, statusFilter])

  return { lots, loading, error }
}

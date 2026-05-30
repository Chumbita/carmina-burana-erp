import { useState, useEffect } from "react"
import { supplyService } from "../services/supplyService"

export function useSupply(id) {
  const [supply, setSupply] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    async function load() {
      try {
        const data = await supplyService.getById(id)
        setSupply(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  return { supply, loading, error }
}

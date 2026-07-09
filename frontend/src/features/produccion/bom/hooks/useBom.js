import { useState, useEffect } from "react"
import { bomService } from "../services/bomService"

export function useBom(id) {
  const [bom, setBom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await bomService.getById(id)
        setBom(data)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return { bom, loading, error }
}

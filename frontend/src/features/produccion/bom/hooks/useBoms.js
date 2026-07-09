import { useState, useEffect } from "react"
import { bomService } from "../services/bomService"

export function useBoms() {
  const [boms, setBoms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function getBoms() {
    try {
      const data = await bomService.getAll()
      setBoms(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getBoms()
  }, [])

  return {
    boms,
    loading,
    error,
    getBoms,
  }
}

import { useState, useEffect, useCallback } from "react"
import { supplyService } from "../services/supplyService"

export function useTransactions(itemId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!itemId) return

    setLoading(true)
    setError(null)

    try {
      const data = await supplyService.getTransactions(itemId)
      setTransactions(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [itemId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { transactions, loading, error, refetch: fetch }
}
import { useState, useEffect, useCallback } from "react"
import { transactionService } from "@/services/transactionService"

export function useTransactions(itemId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!itemId) return

    setLoading(true)
    setError(null)

    try {
      const data = await transactionService.getByItemId(itemId)
      setTransactions(data)
    } catch (err) {
      console.error("Error al cargar transacciones:", err.response?.data || err.message)
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
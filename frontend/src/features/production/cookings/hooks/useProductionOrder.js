import { useState, useEffect, useCallback } from "react"
import { productionService } from "../services/productionService"

export function useProductionOrder(orderId) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrder = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const data = await productionService.getById(orderId)
      setOrder(data)
    } catch (error) {
      setError(error)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const updateOrder = useCallback((patch) => {
    setOrder((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  return { order, loading, error, refetch: fetchOrder, updateOrder }
}

export default useProductionOrder

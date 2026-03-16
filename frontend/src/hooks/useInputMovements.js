import { useState, useEffect, useCallback } from "react"
import { inputMovementService } from "../features/gestion_insumos/services/inputMovementService"

export function useInputMovements(inputId) {
  const [movements, setMovements] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMovements = useCallback(async () => {
    if (!inputId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await inputMovementService.getByInputId(inputId)
      setMovements(data)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [inputId])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  return { movements, isLoading, error, refetch: fetchMovements }
}

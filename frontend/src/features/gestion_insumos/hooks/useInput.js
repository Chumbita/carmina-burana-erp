import { useState, useEffect } from "react"
import { inputService } from "../services/inputService"

export function useInput(id) {
  const [input, setInput] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await inputService.getById(id)
        setInput(data)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id]) 

  return { input, loading, error }
}
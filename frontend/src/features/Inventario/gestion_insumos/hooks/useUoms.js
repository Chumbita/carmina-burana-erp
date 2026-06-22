import { useState, useEffect } from "react"
import { uomService } from "../services/uomService"

export function useUoms() {
  const [uoms, setUoms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await uomService.getOptions()
        setUoms(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { uoms, loading, error }
}

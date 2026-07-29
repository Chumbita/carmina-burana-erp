import { useEffect, useState } from "react"

import { notificationService } from "./notificationService"

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await notificationService.getAll()
        if (!ignore) {
          setNotifications(data)
          setError(null)
        }
      } catch (err) {
        if (!ignore) setError(err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [])

  return { notifications, loading, error }
}

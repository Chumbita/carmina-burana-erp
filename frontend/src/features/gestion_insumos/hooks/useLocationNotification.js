// /hooks/useLocationNotification.js
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export function useLocationNotification(notify) {
  const location = useLocation()
  useEffect(() => {
    if (location.state?.notification) {
      const { type, message } = location.state.notification
      notify[type](message)
      window.history.replaceState({}, '')
    }
  }, [location])
}
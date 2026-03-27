// /hooks/useNotification.js
import { useState } from "react"

export function useNotification() {
  const [notification, setNotification] = useState(null)

  const notify = {
    // TAREA 1: success recibe (message, options = {})
    // y llama a setNotification con type:'success', message y el onClick si viene en options
    success: (message, options = {}) => {
    setNotification({
        type: 'success',
        message: message,
        onClick: options.onClick ?? null
      })
    },

    // TAREA 2: error recibe solo (message)
    error: (message) => {
    setNotification({
        type: 'error',
        message: message
      })
    }
  }

  // TAREA 3: clearNotification limpia el estado
  function clearNotification() {
    setNotification(null)
  }

  return {
    notification,
    notify,
    clearNotification
  }
}
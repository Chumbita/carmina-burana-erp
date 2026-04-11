import { createContext, useContext, useCallback, useMemo, useState } from 'react'

const NotificationContext = createContext(null)

/**
 * NotificationProvider - Proveedor de contexto para notificaciones temporales globales
 */
export function NotificationProvider({ children }) {
  const [activeNotifications, setActiveNotifications] = useState([])

  const addNotification = useCallback((notificationData) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notificationData
    }
    setActiveNotifications(prev => [...prev, newNotification])
  }, [])

  const removeNotification = useCallback((notificationId) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  const contextValue = useMemo(() => ({
    activeNotifications,
    addNotification,
    removeNotification
  }), [activeNotifications, addNotification, removeNotification])

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * useNotificationContext - Accede al contexto de notificaciones
 * @throws {Error} Si se usa fuera de un NotificationProvider
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotificationContext debe ser usado dentro de un NotificationProvider')
  }

  return context
}

import { useNotificationContext } from './NotificationContext'
import { AlertIndicator } from './NotificationComponents'

/**
 * NotificationContainer - Renderiza todas las notificaciones activas
 */
export function NotificationContainer() {
  const { activeNotifications, removeNotification } = useNotificationContext()

  if (activeNotifications.length === 0) return null

  return (
    <>
      {activeNotifications.map((notification) => (
        <AlertIndicator
          key={notification.id}
          variant={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClick={notification.onClick}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  )
}

import { useNotificationContext } from './NotificationContext'

const DEFAULT_DURATION_MS = 6000

/**
 * useNotification - Hook para mostrar notificaciones temporales
 * @returns {{ success: Function, error: Function }}
 *
 * @example
 * const notify = useNotification()
 * notify.success('Insumo creado correctamente')
 * notify.error('Error al crear el insumo')
 * notify.success('Creado', { onClick: () => navigate('/detalle') })
 */
export function useNotification() {
  const { addNotification } = useNotificationContext()

  const show = (type, message, options = {}) => {
    addNotification({
      type,
      message,
      duration: options.duration || DEFAULT_DURATION_MS,
      onClick: options.onClick || null
    })
  }

  return {
    success: (message, options) => show('success', message, options),
    error: (message, options) => show('error', message, options)
  }
}

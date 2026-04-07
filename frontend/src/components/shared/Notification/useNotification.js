import { useState, useCallback, useMemo } from "react"

/**
 * Hook para disparar y manejar notificaciones en la aplicación.
 *
 * @returns {{
 *   notify: {
 *     success: (message: string, options?: { onClick?: () => void }) => void,
 *     error:   (message: string) => void
 *   },
 *   notification: { type: string, message: string, onClick?: () => void } | null,
 *   clearNotification: () => void
 * }}
 *
 * @example
  * const { notify, notification, clearNotification } = useNotification()
  *
  * // Notificación simple
  * notify.error('No se pudo guardar')
  *
  * // Notificación con acción al hacer clic
  * notify.success('Insumo creado', { onClick: () => navigate(`/insumos/${id}`) })
  *
  * // En el JSX
  * <Notification notification={notification} onClose={clearNotification} />
 */

export function useNotification() {
  const [notification, setNotification] = useState(null)

  const notify = useMemo(() => ({
    success: (message, options = {}) =>
      setNotification({ type: 'success', message, onClick: options.onClick ?? null }),

    error: (message) =>
      setNotification({ type: 'error', message }),
  }), [])

  const clearNotification = useCallback(() => setNotification(null), [])

  return { notify, notification, clearNotification }
}
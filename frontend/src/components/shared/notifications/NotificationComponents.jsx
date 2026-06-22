import { useEffect, useState } from 'react'
import { UserCheckIcon, UserRoundXIcon, X } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/Alert'

const ANIMATION_DELAY_MS = 100
const EXIT_ANIMATION_MS = 300

const NOTIFICATION_STYLES = {
  success: {
    alert: 'bg-green-100/90 text-green-600 dark:bg-green-400/10 dark:text-green-400 border-green-600/20',
    closeButton: 'hover:bg-green-600/20',
    icon: UserCheckIcon,
  },
  error: {
    alert: 'bg-red-100/90 text-red-600 dark:bg-red-400/10 dark:text-red-400 border-red-600/20',
    closeButton: 'hover:bg-red-600/20',
    icon: UserRoundXIcon,
  },
}

/**
 * AlertIndicator - Componente base para notificaciones temporales
 * Muestra una alerta con animación de entrada/salida y cierre automático
 *
 * @param {'success'|'error'} variant - Tipo visual de la notificación
 * @param {string} message - Mensaje a mostrar
 * @param {Function} onClose - Callback al cerrarse
 * @param {number} duration - Duración en ms (default: 6000)
 * @param {Function} onClick - Callback al hacer clic (opcional)
 */
export function AlertIndicator({ variant, message, onClose, duration = 6000, onClick }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const styles = NOTIFICATION_STYLES[variant]
  const Icon = styles.icon

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), ANIMATION_DELAY_MS)
    const exitTimer = setTimeout(() => setIsExiting(true), duration - EXIT_ANIMATION_MS)
    const closeTimer = setTimeout(() => onClose?.(), duration)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(closeTimer)
    }
  }, [duration, onClose])

  const handleClose = (event) => {
    event.stopPropagation()
    setIsExiting(true)
    setTimeout(() => onClose?.(), EXIT_ANIMATION_MS)
  }

  return (
    <div
      onClick={onClick}
      className={`
        fixed top-4 right-4 z-50 transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
      `}
    >
      <Alert className={`relative rounded-lg shadow-lg min-w-75 ${styles.alert}`}>
        <Icon className="h-5 w-5 shrink-0" />
        <div className="flex-1 mr-6">
          <AlertTitle className="font-semibold">{message}</AlertTitle>
        </div>
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${styles.closeButton}`}
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  )
}

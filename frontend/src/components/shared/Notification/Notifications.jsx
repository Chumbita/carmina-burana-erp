import { useEffect, useState } from 'react'
import { UserCheckIcon, UserRoundXIcon, X } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/Alert'


// Variantes por tipo de notificacion (success/error). 
const VARIANTS = {
  success: {
    Icon: UserCheckIcon,
    bg:     'bg-green-100/90 dark:bg-green-400/10',
    text:   'text-green-600 dark:text-green-400',
    border: 'border-green-600/20',
    closeBtnHover: 'hover:bg-green-600/20',
  },
  error: {
    Icon: UserRoundXIcon,
    bg:     'bg-red-100/80 dark:bg-red-400/10',
    text:   'text-red-600 dark:text-red-400',
    border: 'border-red-600/20',
    closeBtnHover: 'hover:bg-red-600/20',
  },
}

// Componente de notificación.
export function Notification({ notification, onClose }) {
  if (!notification) return null

  return (
    <NotificationAlert
      type={notification.type}
      message={notification.message}
      onClose={onClose}
      onClick={notification.onClick}
    />
  )
}

// Componente base interno , renderiza según el tipo (success/error) y maneja la animación de entrada/salida.
function NotificationAlert({ type, message, onClose, duration = 6000, onClick }) {
  const [isVisible, setIsVisible]   = useState(false)
  const [isExiting, setIsExiting]   = useState(false)

  const variant = VARIANTS[type]
  const { Icon } = variant

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 100)
    const exitTimer  = setTimeout(() => setIsExiting(true), duration - 300)
    const closeTimer = setTimeout(() => onClose?.(), duration)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(closeTimer)
    }
  }, [duration, onClose])

  const handleClose = (e) => {
    e.stopPropagation()
    setIsExiting(true)
    setTimeout(() => onClose?.(), 300)
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
      <Alert className={`
        relative rounded-lg shadow-lg min-w-75
        ${variant.bg} ${variant.text} ${variant.border}
      `}>
        <Icon className="h-5 w-5 shrink-0" />
        <div className="flex-1 mr-6">
          <AlertTitle className="font-semibold">{message}</AlertTitle>
          {onClick && (
            <p className="text-sm opacity-70 mt-1">Haz clic para ver el insumo</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${variant.closeBtnHover}`}
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  )
}


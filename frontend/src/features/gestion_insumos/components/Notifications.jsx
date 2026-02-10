import { useEffect, useState } from 'react'
import { UserCheckIcon, UserRoundXIcon, X } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'

export const AlertIndicatorSuccess = ({ message, onClose, duration = 5000, onClick }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animación de entrada
    const enterTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Timer para iniciar la salida
    const exitTimer = setTimeout(() => {
      setIsExiting(true)
    }, duration - 300)

    // Timer para cerrar completamente
    const closeTimer = setTimeout(() => {
      onClose?.()
    }, duration)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(closeTimer)
    }
  }, [duration, onClose])

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleClose = (e) => {
    e.stopPropagation()
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  return (
    <div
      onClick={handleClick}
      className={`
        fixed top-4 right-4 z-50 cursor-pointer transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${onClick ? 'hover:scale-105 hover:shadow-lg' : ''}
      `}
    >
      <Alert className="relative rounded-lg bg-green-100/90 text-green-600 dark:bg-green-400/10 dark:text-green-400 border-green-600/20 shadow-lg min-w-75">
        <UserCheckIcon className="h-5 w-5 shrink-0" />
        <div className="flex-1 mr-6">
          <AlertTitle className="font-semibold">{message}</AlertTitle>
          {onClick && (
            <p className="text-sm text-green-600/70 mt-1">
              Haz clic para ver el insumo
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-green-600/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  )
}

export const AlertIndicatorDestructive = ({ message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animación de entrada
    const enterTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Timer para iniciar la salida
    const exitTimer = setTimeout(() => {
      setIsExiting(true)
    }, duration - 300)

    // Timer para cerrar completamente
    const closeTimer = setTimeout(() => {
      onClose?.()
    }, duration)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(closeTimer)
    }
  }, [duration, onClose])

  const handleClose = (e) => {
    e.stopPropagation()
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <Alert className="relative rounded-lg bg-red-100/90 text-red-600 dark:bg-red-400/10 dark:text-red-400 border-red-600/20 shadow-lg min-w-75">
        <UserRoundXIcon className="h-5 w-5 shrink-0" />
        <div className="flex-1 mr-6">
          <AlertTitle className="font-semibold">{message}</AlertTitle>
        </div>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-600/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  )
}

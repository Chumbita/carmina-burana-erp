import { useEffect } from "react"
import { useBlocker } from "react-router-dom"

export function useFormBlocker(formRef) {
  // bloquear recarga navegador
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!formRef.current?.isDirty) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])


  // TAREA 2: bloquear navegación del router
  // Pista: useBlocker con la condición de formRef.current?.isDirty

    // bloquear navegación router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      formRef.current?.isDirty &&
      currentLocation.pathname !== nextLocation.pathname
  )


  // TAREA 3: retornar el blocker para que el componente pueda
  // mostrar el ConfirmModal cuando blocker.state === "blocked"
  return{
    blocker
  }

}
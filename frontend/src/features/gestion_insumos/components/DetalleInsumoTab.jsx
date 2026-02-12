import { useRef, useEffect } from "react"
import { useBlocker } from "react-router-dom"
import { InsumoForm } from "./InsumoForm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/Button"

export function InsumoDetailTable({ insumo }) {
  const formRef = useRef(null)

  function onSubmit(data) {
    alert("Guardar cambios:", JSON.stringify(data))
  }

  function onDelete() {
    alert("Eliminar insumo")
  }

  // No recargar el navegador si hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!formRef.current?.isDirty) return
      e.preventDefault()
      e.returnValue = "" 
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  // NO navegar si hay cambios sin guardar
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      formRef.current?.isDirty && currentLocation.pathname !== nextLocation.pathname
  )

  return (
    <>
      <InsumoForm
        formRef={formRef}
        defaultValues={{
          name: insumo.name,
          brand: insumo.brand,
          category: insumo.category,
          unit: insumo.unit,
          minimum_stock: insumo.minimum_stock,
          image: insumo.image,
        }}
        onSubmit={onSubmit}
        submitLabel="Guardar cambios"
        showDeleteButton={true}
        onDelete={onDelete}
        layout="page"
      />

      {/* Bloqueador de navegación */}
      {blocker.state === "blocked" && (
        <ConfirmModal
          onSave={() => {
            formRef.current?.handleSubmit(onSubmit)()
            blocker.proceed()
          }}
          onDiscard={() => {
            formRef.current?.reset()
            blocker.proceed()
          }}
          onCancel={() => blocker.reset()}
        />
      )}
    </>
  )
}

function ConfirmModal({ onSave, onDiscard, onCancel }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-md">Cambios sin guardar</DialogTitle>
        </DialogHeader>

        <p className="text-sm">Tienes cambios sin guardar. ¿Qué deseas hacer?</p>

        <div className="flex justify-end gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={onCancel} className="mr-auto cursor-pointer">
            Cancelar
          </Button>
          <Button size="sm" variant="secondary" onClick={onDiscard} className="cursor-pointer">
            Descartar
          </Button>
          <Button size="sm" onClick={onSave} className="cursor-pointer">
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
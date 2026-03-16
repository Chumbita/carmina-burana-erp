// /components/ConfirmNavigationModal.jsx
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"

export function ConfirmNavigationModal({ onSave, onDiscard, onCancel }) {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave()
    setIsSaving(false)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-md">Cambios sin guardar</DialogTitle>
        </DialogHeader>
        <p className="text-sm">Tienes cambios sin guardar. ¿Qué deseas hacer?</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={onCancel} className="mr-auto cursor-pointer" disabled={isSaving}>
            Cancelar
          </Button>
          <Button size="sm" variant="secondary" onClick={onDiscard} className="cursor-pointer" disabled={isSaving}>
            Descartar
          </Button>
          <Button size="sm" onClick={handleSave} className="cursor-pointer" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
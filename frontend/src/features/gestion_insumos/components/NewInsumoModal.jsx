import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InsumoForm } from "./InsumoForm"

export function NewInsumoModal({ open, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleClose() {
    onClose()
  }

  async function handleSubmit(data) {
    setIsSubmitting(true)
    
    try {
      await onSubmit(data)
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo insumo</DialogTitle>
        </DialogHeader>

        <InsumoForm
          defaultValues={{
            name: "",
            brand: "",
            category: "",
            unit: "",
            minimum_stock: 0,
            image: ""
          }}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitLabel="Guardar"
          cancelLabel="Cancelar"
          isSubmitting={isSubmitting}
          layout="modal"
        />
      </DialogContent>
    </Dialog>
  )
}
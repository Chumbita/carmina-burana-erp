import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { SupplyForm } from "./SupplyForm"
import { useSupplies } from "../hooks/useSupplies"

export function NewSupplyModal({ open, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { supplies } = useSupplies()

  function handleClose() {
    onClose()
  }

  async function handleSubmit(data) {
    setIsSubmitting(true)

    try {
      await onSubmit(data)
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

        <SupplyForm
          defaultValues={{
            name: "",
            brand: "",
            category: "",
            unit: "",
            minimum_stock: 0,
            image: "",
          }}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitLabel="Guardar"
          cancelLabel="Cancelar"
          isSubmitting={isSubmitting}
          layout="modal"
          existingSupplies={supplies}
        />
      </DialogContent>
    </Dialog>
  )
}

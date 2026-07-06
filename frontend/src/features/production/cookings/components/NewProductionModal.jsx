import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { ProductionForm } from "./ProductionForm";

export function NewProductionModal({ open, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose() {
    onClose();
  }

  async function handleSubmit(data) {
    setIsSubmitting(true);
    try {
      // Delegar la creación al handler padre para que cierre el modal,
      // actualice la tabla y muestre notificaciones.
      if (onSubmit) await onSubmit(data);
    } catch (error) {
      // El padre se encarga de notificar errores
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[60vw] !max-w-[700px] sm:!max-w-[95vw] max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Registrar producción</DialogTitle>
        </DialogHeader>

        <ProductionForm
          defaultValues={{
            item_id: undefined,
            bom_id: "",
            planned_quantity: 0,
            schedule_date: "",
            description: "",
          }}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitLabel="Crear"
          cancelLabel="Cancelar"
          isSubmitting={isSubmitting}
          layout="modal"
        />
      </DialogContent>
    </Dialog>
  );
}

export default NewProductionModal;

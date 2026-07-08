import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { ProductionForm } from "./ProductionForm";
import { itemService } from "../services/itemService";

export function NewProductionModal({ open, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NUEVOS ESTADOS PARA CONTROLAR LAS OPCIONES DEL BACKEND ---
  const [options, setOptions] = useState({
    beerOptions: [],
    productOptions: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(false);

  // Cargamos los datos únicamente cuando el modal se abre
  useEffect(() => {
    if (!open) return;

    async function fetchOptions() {
      try {
        setOptionsLoading(true);
        setOptionsError(false);
        const data = await itemService.getManufacturableItems();
        setOptions(data);
      } catch (error) {
        console.error("Error al cargar ítems en el modal:", error);
        setOptionsError(true);
      } finally {
        setOptionsLoading(false);
      }
    }

    fetchOptions();
  }, [open]);

  function handleClose() {
    onClose();
  }

  async function handleSubmit(data) {
    setIsSubmitting(true);
    try {
      if (onSubmit) await onSubmit(data);
    } catch (error) {
      // El padre se encarga de notificar errores
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[60vw] !max-w-[700px] sm:!max-w-[95vw] max-h-[80vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Registrar producción</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <ProductionForm
            defaultValues={{
              item_id: undefined,
              bom_id: undefined,
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
            // --- PASAMOS LAS NUEVAS PROPS DE DATOS Y ESTADOS ---
            beerOptions={options.beerOptions}
            productOptions={options.productOptions}
            optionsLoading={optionsLoading}
            optionsError={optionsError}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewProductionModal;

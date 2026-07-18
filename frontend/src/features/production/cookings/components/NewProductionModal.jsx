import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { ProductionForm } from "./ProductionForm";
import { itemService } from "../services/itemService";
import { bomService } from "../services/bomService";

export function NewProductionModal({ open, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opciones de manufactura cargadas del backend
  const [options, setOptions] = useState({
    beerOptions: [],
    productOptions: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(false);

  // --- NUEVOS ESTADOS PARA GESTIONAR LA BOM SELECCIONADA ---
  const [selectedItemId, setSelectedItemId] = useState(undefined);
  const [selectedBom, setSelectedBom] = useState(null);
  const [bomLoading, setBomLoading] = useState(false);

  // Cargamos los ítems manufacturables cuando el modal se abre
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

  // --- EFECTO PARA BUSCAR LA BOM CUANDO SE SELECCIONA UN ÍTEM ---
  useEffect(() => {
    // Si no hay item_id seleccionado, limpiamos la receta
    if (!selectedItemId) {
      setSelectedBom(null);
      return;
    }

    async function fetchBom() {
      try {
        setBomLoading(true);
        const bomData = await bomService.getItemBom(selectedItemId);
        setSelectedBom(bomData);
      } catch (error) {
        console.error(`Error al traer la BOM para el item ${selectedItemId}:`, error);
        setSelectedBom(null); // Al fallar o dar 404, ProductionForm mostrará la alerta correspondiente
      } finally {
        setBomLoading(false);
      }
    }

    fetchBom();
  }, [selectedItemId]);

  function handleClose() {
    // Limpiamos los estados de selección al cerrar el modal
    setSelectedItemId(undefined);
    setSelectedBom(null);
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
            beerOptions={options.beerOptions}
            productOptions={options.productOptions}
            optionsLoading={optionsLoading}
            optionsError={optionsError}
            onItemChange={(id) => setSelectedItemId(id)}
            
            // --- PASAMOS LOS ESTADOS Y EL INTERCEPTOR AL FORMULARIO ---
            selectedBom={selectedBom}
            bomLoading={bomLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewProductionModal;
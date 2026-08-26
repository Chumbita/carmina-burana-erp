import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { ProductionForm } from "./ProductionForm";
import { useManufacturableItems } from "@/hooks/useItems";
import { bomService } from "../services/bomService";
import { StockInsufficientBanner } from "./StockInsufficientBanner";

export function NewProductionModal({ open, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { beerOptions, productOptions, loading: optionsLoading, error: optionsError } = useManufacturableItems();

  // --- NUEVOS ESTADOS PARA GESTIONAR LA BOM SELECCIONADA ---
  const [selectedItemId, setSelectedItemId] = useState(undefined);
  const [selectedBom, setSelectedBom] = useState(null);
  const [bomLoading, setBomLoading] = useState(false);

  // Estado para insumos faltantes
  const [missingIngredients, setMissingIngredients] = useState(null);

  // Bloquea el botón Planificar tras un error de stock insuficiente
  const [submitBlocked, setSubmitBlocked] = useState(false);

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
        setSelectedBom(null);
      } finally {
        setBomLoading(false);
      }
    }

    fetchBom();
  }, [selectedItemId]);

  function handleClose() {
    setSelectedItemId(undefined);
    setSelectedBom(null);
    setMissingIngredients(null);
    setSubmitBlocked(false);
    onClose();
  }

  async function handleSubmit(data) {
    setIsSubmitting(true);
    setMissingIngredients(null);
    try {
      if (onSubmit) await onSubmit(data);
    } catch (error) {
      const errorDetail = error.response?.data?.detail;
      if (errorDetail?.missing && Array.isArray(errorDetail.missing)) {
        setMissingIngredients({
          message: errorDetail.message || "Stock insuficiente para planificar la orden",
          missing: errorDetail.missing,
        });
        setSubmitBlocked(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[60vw] !max-w-[700px] sm:!max-w-[95vw] max-h-[80vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">Registrar producción</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <ProductionForm
            defaultValues={{
              item_id: undefined,
              bom_id: undefined,
              planned_quantity: 1,
              schedule_date: "",
              description: "",
            }}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            submitLabel="Planificar"
            cancelLabel="Cancelar"
            isSubmitting={isSubmitting}
            layout="modal"
            beerOptions={beerOptions}
            productOptions={productOptions}
            optionsLoading={optionsLoading}
            optionsError={optionsError}
            onItemChange={(id) => {
              setSelectedItemId(id);
              setMissingIngredients(null);
              setSubmitBlocked(false);
            }}
            selectedBom={selectedBom}
            bomLoading={bomLoading}
            submitBlocked={submitBlocked}
            beforeFooter={
              missingIngredients && (
                <StockInsufficientBanner
                  message={missingIngredients.message}
                  missing={missingIngredients.missing}
                  onDismiss={() => {
                    setMissingIngredients(null);
                    setSubmitBlocked(false);
                  }}
                />
              )
            }
            onQuantityChange={() => {
              setMissingIngredients(null);
              setSubmitBlocked(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewProductionModal;

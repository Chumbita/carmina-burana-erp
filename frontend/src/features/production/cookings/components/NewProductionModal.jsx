import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ProductionForm } from "./ProductionForm";
import { itemService } from "../services/itemService";
import { bomService } from "../services/bomService";
import { AlertTriangle, Package } from "lucide-react";

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

  // Estado para insumos faltantes
  const [missingIngredients, setMissingIngredients] = useState(null);

  // Cargamos los ítems manufacturables cuando el modal se abre
  useEffect(() => {
    if (!open) return;

    setMissingIngredients(null);

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
      }
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
            onItemChange={(id) => {
              setSelectedItemId(id);
              setMissingIngredients(null);
            }}
            selectedBom={selectedBom}
            bomLoading={bomLoading}
          />

          {/* MODAL DE INSUMOS FALTANTES DENTRO DEL FORMULARIO */}
          {missingIngredients && (
            <div className="mt-4 border border-red-200 rounded-lg bg-red-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-red-700 flex items-center gap-2">
                  <AlertTriangle size={16} /> Stock Insuficiente
                </h4>
                <button
                  onClick={() => setMissingIngredients(null)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-xs text-red-600">
                {missingIngredients.message}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-red-200">
                      <th className="text-left p-1.5 font-medium text-red-600">Insumo</th>
                      <th className="text-right p-1.5 font-medium text-red-600">Requerido</th>
                      <th className="text-right p-1.5 font-medium text-red-600">Disponible</th>
                      <th className="text-right p-1.5 font-medium text-red-600">Faltante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missingIngredients.missing.map((insumo, index) => (
                      <tr key={index} className="border-b border-red-100 last:border-0">
                        <td className="p-1.5 flex items-center gap-1.5">
                          <Package size={12} className="text-red-400" />
                          <span className="font-medium text-red-800">{insumo.name}</span>
                        </td>
                        <td className="p-1.5 text-right text-red-700">
                          {insumo.required} {insumo.uom_symbol}
                        </td>
                        <td className="p-1.5 text-right text-red-700">
                          {insumo.available} {insumo.uom_symbol}
                        </td>
                        <td className="p-1.5 text-right font-semibold text-red-800">
                          {insumo.required - insumo.available} {insumo.uom_symbol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewProductionModal;

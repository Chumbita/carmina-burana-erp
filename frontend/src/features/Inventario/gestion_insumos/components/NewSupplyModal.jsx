import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"

import { SupplyForm } from "./SupplyForm"
import { PackagingSupplyForm } from "./PackagingSupplyForm"
import { NewSupplyTypeSelector } from "./NewSupplyTypeSelector"
import { useSupplies } from "../hooks/useSupplies"

const EMPTY_SUPPLY = {
  name: "",
  brand_id: undefined,
  supply_category: "",
  base_uom_id: undefined,
  min_stock_level: 1,
}

const EMPTY_PACKAGING_SUPPLY = {
  name: "",
  brand_id: undefined,
  base_uom_id: undefined,
  min_stock_level: 1,
  packaging_type: "",
  material: "",
  capacity_ml: undefined,
}

/**
 * Modal de alta de insumos. Primero elige el tipo, luego delega en el
 * formulario correspondiente.
 */
export function NewSupplyModal({ open, onClose, onSubmit, existingSupplies }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const { supplies } = useSupplies()
  const validationSupplies = existingSupplies ?? supplies

  function handleClose() {
    setSelectedType(null)
    onClose()
  }

  async function handleSubmit(data) {
    setIsSubmitting(true)

    try {
      await onSubmit({ ...data, item_type: selectedType })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nuevo insumo</DialogTitle>
          {!selectedType && (
            <DialogDescription>Seleccioná el tipo de insumo a crear.</DialogDescription>
          )}
        </DialogHeader>

        {!selectedType && <NewSupplyTypeSelector onSelect={setSelectedType} />}

        {selectedType === "SUPPLY" && (
          <SupplyForm
            defaultValues={EMPTY_SUPPLY}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            submitLabel="Guardar"
            cancelLabel="Cancelar"
            isSubmitting={isSubmitting}
            layout="modal"
            existingSupplies={validationSupplies}
          />
        )}

        {selectedType === "PACKAGING_SUPPLY" && (
          <PackagingSupplyForm
            defaultValues={EMPTY_PACKAGING_SUPPLY}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            submitLabel="Guardar"
            cancelLabel="Cancelar"
            isSubmitting={isSubmitting}
            existingSupplies={validationSupplies}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

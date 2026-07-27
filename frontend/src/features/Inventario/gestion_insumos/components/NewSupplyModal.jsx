import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { SupplyForm } from "./SupplyForm"
import { PackagingSupplyForm } from "./PackagingSupplyForm"
import { useSupplies } from "../hooks/useSupplies"
import { Boxes, Package } from "lucide-react"

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
          <DialogTitle>Nuevo insumo</DialogTitle>
          {!selectedType && (
            <DialogDescription>
              Seleccioná el tipo de insumo a crear.
            </DialogDescription>
          )}
        </DialogHeader>

        {!selectedType && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 p-4"
              onClick={() => setSelectedType("SUPPLY")}
            >
              <Boxes className="h-5 w-5" />
              <span className="text-left">
                <span className="block font-medium">Producción</span>
                <span className="block text-xs text-muted-foreground">Malta, lúpulo, levadura</span>
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 p-4"
              onClick={() => setSelectedType("PACKAGING_SUPPLY")}
            >
              <Package className="h-5 w-5" />
              <span className="text-left">
                <span className="block font-medium">Envase</span>
                <span className="block text-xs text-muted-foreground">Botellas, latas, tapas</span>
              </span>
            </Button>
          </div>
        )}

        {selectedType === "SUPPLY" && (
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
            existingSupplies={validationSupplies}
          />
        )}

        {selectedType === "PACKAGING_SUPPLY" && (
          <PackagingSupplyForm
            defaultValues={{
              name: "",
              brand_id: undefined,
              base_uom_id: undefined,
              min_stock_level: 1,
              packaging_type: "",
              material: "",
              capacity_ml: undefined,
            }}
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

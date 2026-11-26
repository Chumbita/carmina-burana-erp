import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"

import { AdjustLotFormFields } from "./AdjustLotFormFields"
import { useAdjustLotForm } from "../hooks/useAdjustLotForm"

/**
 * Modal de ajuste manual de stock de un lote.
 */
export function AdjustLotModal({ open, onOpenChange, itemId, lot, baseUomSymbol, onSuccess }) {
  const {
    control,
    isDirty,
    isValid,
    saving,
    delta,
    isEditable,
    currentQuantity,
    reservedQuantity,
    onSubmit,
  } = useAdjustLotForm({ open, onOpenChange, itemId, lot, onSuccess })

  if (!lot) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar stock de lote</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <AdjustLotFormFields
            control={control}
            lot={lot}
            baseUomSymbol={baseUomSymbol}
            currentQuantity={currentQuantity}
            reservedQuantity={reservedQuantity}
            delta={delta}
            isEditable={isEditable}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="cursor-pointer"
              disabled={!isEditable || !isDirty || !isValid || saving}
            >
              {saving ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Guardando…
                </>
              ) : (
                "Ajustar stock"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

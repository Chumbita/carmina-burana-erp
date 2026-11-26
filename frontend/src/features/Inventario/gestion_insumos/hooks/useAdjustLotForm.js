import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createAdjustLotSchema } from "../schemas/adjustLot.schema"
import { useAdjustLot } from "./useAdjustLot"

/**
 * Formulario de ajuste manual de stock de un lote.
 */
export function useAdjustLotForm({ open, onOpenChange, itemId, lot, onSuccess }) {
  const currentQuantity = lot ? Number(lot.quantity) : 0
  const reservedQuantity = lot ? Number(lot.reserved_quantity ?? 0) : 0

  const schema = useMemo(
    () => createAdjustLotSchema(currentQuantity, reservedQuantity),
    [currentQuantity, reservedQuantity]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      new_quantity: currentQuantity,
      reason: "",
    },
    mode: "onChange",
  })

  const { adjustLot, saving } = useAdjustLot({
    onSuccess: () => {
      if (onSuccess) onSuccess()
    },
  })

  const newQuantityWatch = useWatch({ control, name: "new_quantity" })
  const delta = lot ? Number(newQuantityWatch ?? 0) - currentQuantity : 0
  const isEditable = lot ? lot.status !== "depleted" && lot.status !== "expired" : true

  useEffect(() => {
    if (open && lot) {
      reset({
        new_quantity: currentQuantity,
        reason: "",
      })
    }
  }, [open, lot, currentQuantity, reset])

  async function submit(data) {
    if (!lot) return

    try {
      await adjustLot(itemId, lot.id, {
        new_quantity: data.new_quantity,
        reason: data.reason.trim(),
      })
      onOpenChange(false)
    } catch {
      // error ya notificado por useAdjustLot
    }
  }

  return {
    control,
    isDirty,
    isValid,
    saving,
    delta,
    isEditable,
    currentQuantity,
    reservedQuantity,
    onSubmit: handleSubmit(submit),
  }
}
